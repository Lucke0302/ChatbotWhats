const usage = require('./usageControl');
const weatherCommandHandler = require('./weatherCommand');
const currencyCommandHandler = require('./currencyCommand');
const helpCommandHandler = require('./helpCommand');
const pdfCommandHandler = require('./pdfCommand');
const fs = require('fs');
const ToxicHandler = require('./toxicHandler');
const lolCommandHandler = require('./lolCommand');
const ttsCommandHandler = require('./ttsCommand');
const PokemonHandler = require('./pokemonHandler');
const migrationCommandHandler = require('./migrarCommand');
const resenhaCommand = require('./resenhaCommand');
const CasinoHandler = require('./casinoHandler');
const PescariaHandler = require('./pescariaHandler');
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

class ChatModel {
    constructor(db, genAI) {
        this.db = db;
        this.genAI = genAI;
        this.isOnline = true;
        this.isTesting = true;
        this.modelLimits = {
            "gemini-2.5-flash": 20,
            "gemini-2.5-flash-lite": 20,
            "gemini-3-flash-preview": 20,
            "gemma-3-27b-it": 5000,
            "gemma-3-12b-it": 5000,
            "gemma-3-4b-it": 9999,            
            "gemma-3n-e2b-it": 9999,
            "gemma-3-1b-it": 9999
        };
        this.updateOnlineStatus();
        lolCommandHandler.init();
        this.spamCooldowns = new Map(); 
        this.SPAM_DELAY_SECONDS = 10;
        this.DAILY_AI_LIMIT = 10;
        this.DAILY_LIMIT_GEMMA = 100;
        this.toxicHandler = new ToxicHandler(db);
        this.pokemonHandler = new PokemonHandler(db);
        this.pokemonHandler.init();
        this.initializeCommandHandlers();
        this.resenhaHandler = new resenhaCommand(db, genAI);
        this.casinoHandler = new CasinoHandler(db);
        this.pescariaHandler = new PescariaHandler(db);
    }

    async init() {
        if (this.pokemonHandler) {
            await this.pokemonHandler.init();
        }
    }

    getTodayDateString() {
        return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }

    async getModelUsage() {
        const today = this.getTodayDateString();
        const rows = await this.db.all(`SELECT model_name, quantidade FROM system_usage WHERE data_uso = ?`, [today]);
        const usage = {};
        if (rows) {
            rows.forEach(r => {
                usage[r.model_name] = r.quantidade;
            });
        }
        return usage;
    }

    async incrementModelUsage(modelName) {
        const today = this.getTodayDateString();
        await this.db.run(`
            INSERT INTO system_usage (data_uso, model_name, quantidade)
            VALUES (?, ?, 1)
            ON CONFLICT(data_uso, model_name)
            DO UPDATE SET quantidade = quantidade + 1
        `, [today, modelName]);
    }

    initializeCommandHandlers() {
        this.commandHandlers = {
            '!timeout': async (ctx) => {
                return await this.handleTimeoutCommand(ctx.name, ctx.command, ctx.sender, ctx.isGroup, ctx.mentions);
            },
            '!d': async (ctx) => await this.handleDiceCommand(ctx.command, ctx.sender),
            '!menu': async () => await this.handleMenuCommand(),
            '!tradutor': async (ctx) => {
                await this.checkAndIncrementTranslateQuota(ctx.user, ctx.sender, ctx.command);
                return await this.handleTradutorCommand(ctx.from, ctx.sender, ctx.name, ctx.isGroup, ctx.command);
            },
            '!lol': async (ctx) => await lolCommandHandler.handleLolCommand(ctx.command),
            '!notas': async (ctx) => await this.handleNotasCommand(ctx.sender),
            '!clima': async (ctx) => await this.handleClimaCommand(ctx.command, ctx.sender),
            '!cotacao': async (ctx) => await currencyCommandHandler.convertCurrency(ctx.command),
            '!pdf': async (ctx) => {
                await pdfCommandHandler.handlePdfCommand(ctx.sock, ctx.msg, ctx.from);
            },
            '!toxico': async (ctx) => {
                let groupId;
                if (ctx.isGroup && ctx.from != "120363422821336011@g.us") groupId = ctx.from;
                else groupId = ctx.command.split(" ")[1];
                return await this.getToxicPodium(groupId);
            },
            '!falador': async (ctx) => await this.handleFaladorCommand(ctx.from),
            '!audio': async (ctx) => {
                await ttsCommandHandler.handleAudioCommand(ctx.sock, ctx.from, ctx.command, ctx.msg);
            },
            '!poke': async (ctx) => {
                return await this.pokemonHandler.handleCommand(ctx.from, ctx.sender, ctx.command, ctx.sock, ctx.msg);
            },
            '!id': async (ctx) => `${ctx.from}`,
            '!migrar': async (ctx) => {
                if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                    return "🔒 *Acesso Negado.* Só o chefe pode fazer o êxodo.";
                }
                return await migrationCommandHandler.handleMigrationCommand(ctx.sock, ctx.from, ctx.command, ctx.sender);
            },
            '!help': async (ctx) => this.handleHelp(ctx),
            '!ajuda': async (ctx) => this.handleHelp(ctx),
            '!resenha': async (ctx) => this.resenhaHandler.execute(ctx),
            '!cota': async (ctx) => {
                return await this.handleCotaCommand(ctx);
            },
            '!cassino': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                if (!subCommand || subCommand === 'saldo' || subCommand === 'ajuda') {
                    return await this.casinoHandler.showBalance(ctx.sender, tag);
                }
                if (!isNaN(subCommand)) {
                    const bet = parseInt(subCommand);
                    return await this.casinoHandler.playSlots(ctx.sender, tag, bet);
                }
                if (subCommand === 'cara' || subCommand === 'coroa') {
                    const bet = parseInt(args[2]);
                    return await this.casinoHandler.playCoinflip(ctx.sender, tag, subCommand, bet);
                }
                if (subCommand === 'roleta') {
                    const color = args[2]?.toLowerCase();
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playRoulette(ctx.sender, tag, color, bet);
                }

                if (subCommand === 'mega') {
                    if (args[2]?.toLowerCase() === 'apostadores') {
                        return await this.casinoHandler.getMegaBettors(tag);    
                    }
                    
                    const number = parseInt(args[2]);
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playMega(ctx.sender, tag, number, bet);
                }

                if (subCommand === 'bolao') {
                    if (args[2]?.toLowerCase() === 'apostadores') {
                        return await this.casinoHandler.getBolaoBettors(tag);
                    }

                    const number = parseInt(args[2]);
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playBolao(ctx.sender, tag, number, bet);
                }

                return `${tag}🎰 **CASSINO DO BOSTOSSAURO**\n\nOpções:\n🎰 *!cassino [valor]* (Slots)\n🪙 *!cassino [cara/coroa] [valor]*\n🎡 *!cassino roleta [vermelho/preto/verde] [valor]*\n🏦 *!cassino saldo*`;
            },
            '!pix': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                
                const amountStr = args.find(arg => !arg.includes('@') && !isNaN(arg) && arg !== '!pix');
                const amount = parseInt(amountStr);
                
                const receiver = ctx.mentions[0];
                return await this.casinoHandler.handlePix(ctx.sender, tag, receiver, amount);
            },
            '!minhabosta': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                return await this.casinoHandler.handleMinhaBosta(ctx.sender, tag);
            },
            '!trabalhar': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                return await this.casinoHandler.handleTrabalhar(ctx.sender, tag);
            },
            '!pescar': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                return await this.pescariaHandler.pescar(ctx.sender, tag, ctx.from);
            },
            '!pesca': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                return await this.pescariaHandler.pescar(ctx.sender, tag, ctx.from);
            },'!pescaria': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                if (subCommand === 'loja') {
                    return await this.pescariaHandler.getLoja(ctx.sender, tag);
                }

                if (subCommand === 'comprar') {
                    const itemCode = args[2];
                    return await this.pescariaHandler.comprarItem(ctx.sender, tag, itemCode);
                }

                if (subCommand === 'trofeus') {
                    return await this.pescariaHandler.getTrofeusGrupo(ctx.from, tag);
                }

                if (subCommand === 'ranking') {
                    return await this.pescariaHandler.getRanking(tag);
                }
                
                if (subCommand === 'perfil' || subCommand === 'inventario') {
                    return await this.pescariaHandler.getPerfil(ctx.sender, tag);
                }

                if (subCommand === 'fix') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Tá achando que trabalha no Ibama? Só o chefe pode usar isso.";
                    }
                    return await this.pescariaHandler.fixOldRecords(tag);
                }

                if (subCommand === 'toppessoal') {
                    return await this.pescariaHandler.getTopPessoal(ctx.sender, tag);
                }

                if (subCommand === 'topgrupo') {
                    return await this.pescariaHandler.getTopGrupoPorRaridade(ctx.from, tag);
                }

                return `${tag}🎣 **SISTEMA DE PESCA**\n\nOpções:\n🎣 *!pescar* (Joga a isca na água!)\n🏪 *!pescaria loja* (Compre iscas e buffs)\n🎒 *!pescaria perfil* (Vê iscas e recordes pessoais)\n🏆 *!pescaria ranking* (Top pescadores em peso total)\n🦈 *!pescaria trofeus* (Os 10 maiores monstros deste grupo)\n🏅 *!pescaria toppessoal* (Top 3 seus por raridade)\n🌍 *!pescaria topgrupo* (Top 3 do grupo por raridade)`;
            },
        };

        const aiHandler = async (ctx) => {
            if (!ctx.command.startsWith("!burro")) {
                await this.checkAndIncrementAiQuota(ctx.user, ctx.sender, ctx.command);
            }
            
            if ((ctx.command.startsWith('!resumo') && ctx.isGroup) || 
                (ctx.command.startsWith("!gpt") && ctx.isGroup) || 
                ctx.command.startsWith("!burro")) {
                    
                const prompt = await this.formulatePrompt(ctx.from, ctx.sender, ctx.name, ctx.isGroup, ctx.command, ctx.quotedMessage);
                return await this.getAiResponse(ctx.from, ctx.sender, ctx.name, ctx.isGroup, ctx.command, prompt);
            }

            if (ctx.command.startsWith("!lembrar")) {
                return await this.handleLembrarCommand(ctx.from, ctx.sender, ctx.name, ctx.isGroup, ctx.command);
            }
        };

        this.commandHandlers['!gpt'] = aiHandler;
        this.commandHandlers['!resumo'] = aiHandler;
        this.commandHandlers['!lembrar'] = aiHandler;
        this.commandHandlers['!burro'] = aiHandler;
    }

    handleHelp(ctx) {
        const args = ctx.command.split(/\s+/).slice(1).join(' ');
        return helpCommandHandler.getHelp(args);
    }

    async countMessage(name, sender, from) {
        try {
            await this.db.run(
                `INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) 
                 VALUES (?, ?, 0, 0, '', '')`, 
                [sender, name]
            );

            const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

            await this.db.run(
                `INSERT INTO ranking_ofensas (id_conversa, id_usuario, quantidade, total_mensagens, data_ultima_mensagem) 
                 VALUES (?, ?, 0, 1, ?)
                 ON CONFLICT(id_conversa, id_usuario) 
                 DO UPDATE SET 
                    total_mensagens = CASE 
                        WHEN data_ultima_mensagem != excluded.data_ultima_mensagem THEN 1 
                        ELSE total_mensagens + 1 
                    END,
                    data_ultima_mensagem = excluded.data_ultima_mensagem`,
                [from, sender, today]
            );

        } catch (error) {
            console.error("Erro contando mensagem:", error.message);
        }
    }

    async getUserMemory(name, sender) {
        const user = await this.getUserData(name, sender);
        return user ? (user.anotacoes || "") : "";
    }

    async saveUserMemory(name, sender, newMemory) {
        if (!newMemory) return;
        try {
            if (!await this.getUserData(name, sender)){
                await this.db.run(
                    `INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) 
                    VALUES (?, ?, 0, 0, '', '')`, 
                    [sender, name]
                );
            }
            else{                    
                await this.db.run(
                    `UPDATE usuarios SET anotacoes = ? WHERE id_usuario = ?`,
                    [newMemory, sender]
                );
            }
            console.log(`🧠 Memória atualizada para ${sender}`);
        } catch (error) {
            console.error("❌ Erro ao salvar memória:", error);
        }
    }

    checkSpam(sender, command = "") {
        if (sender === "5513991008854@s.whatsapp.net") {
            return; 
        }
        const now = Date.now();
        const lastTime = this.spamCooldowns.get(sender) || 0;
        const diffSeconds = (now - lastTime) / 1000;

        let limit = this.SPAM_DELAY_SECONDS;
        if (command.toLowerCase().startsWith("!poke") || command.toLowerCase().startsWith("!cassino") || command.toLowerCase().startsWith("!pesca")) {
            limit = 1; 
        }

        if (diffSeconds < limit) {
            const waitTime = Math.ceil(limit - diffSeconds);
            if (waitTime > 0) {
                throw new Error(`SPAM_DETECTED|${waitTime}`);
            }
        }

        this.spamCooldowns.set(sender, now);
    }

    async getUserData(name, sender) {
        await this.db.run(
            `INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) 
             VALUES (?, ?, 0, 0, '', '')`, 
            [sender, name]
        );

        const user = await this.db.get(`SELECT * FROM usuarios WHERE id_usuario = ?`, [sender]);
        return user;
    }

    //Verifica Timeout
    checkTimeout(user) {
        const now = Math.floor(Date.now() / 1000);

        if (user.banido_ate > now) {
            const timeLeft = Math.ceil((user.banido_ate - now) / 60);
            throw new Error(`USER_BANNED|${timeLeft}`);
        }
    }

    // Verifica cota de uso de IA
    async checkAndIncrementAiQuota(user, sender, command) {
        const today = new Date().toLocaleDateString('pt-BR');

        if (user.data_ultimo_uso !== today) {
            await this.db.run(
                `UPDATE usuarios SET uso_ia_diario = 0, uso_gemma_diario = 0, data_ultimo_uso = ? WHERE id_usuario = ?`,
                [today, sender]
            );
            user.uso_ia_diario = 0; 
        }

        if (user.uso_ia_diario >= this.DAILY_AI_LIMIT) {
            throw new Error("USER_QUOTA_EXCEEDED");
        }

        await this.db.run(
            `UPDATE usuarios SET uso_ia_diario = uso_ia_diario + 1 WHERE id_usuario = ?`,
            [sender]
        );
    }

    async checkAndIncrementTranslateQuota(user, sender, command){
        const today = new Date().toLocaleDateString('pt-BR');

        if (user.data_ultimo_uso !== today) {
            await this.db.run(
                `UPDATE usuarios SET uso_ia_diario = 0, uso_gemma_diario = 0, data_ultimo_uso = ? WHERE id_usuario = ?`,
                [today, sender]
            );
            user.uso_gemma_diario = 0; 
        }

        if (user.uso_gemma_diario >= this.DAILY_AI_LIMIT) {
            throw new Error("USER_TRANSLATE_EXCEEDED");
        }

        await this.db.run(
            `UPDATE usuarios SET uso_gemma_diario = uso_gemma_diario + 1 WHERE id_usuario = ?`,
            [sender]
        );
    }

    //Verifica se a mensagem é uma ofensa
    async trackOffenses(name, sender, from, text) {
        return this.toxicHandler.trackOffenses(name, sender, from, text);
    }

    //Retorna o ranking e reseta o histórico (pra tarefa agendada)
    async getAndResetToxicPodium(groupId) {
        return this.toxicHandler.getAndResetToxicPodium(groupId);
    }

    //Retorna o ranking sem limpar o histórico
    async getToxicPodium(groupId) {
        return this.toxicHandler.getToxicPodium(groupId);
    }

    async updateOnlineStatus() {
        const currentUsage = await this.getModelUsage();
        this.isOnline = false;
        for (const [model, limit] of Object.entries(this.modelLimits)) {
            if ((currentUsage[model] || 0) < limit) {
                this.isOnline = true;
                break;
            }
        }
    }

    // Função de monitoramento de recursos (!status)
    async getStatus() {
        const today = this.getTodayDateString();
        const currentUsage = await this.getModelUsage();

        let report = `📊 *STATUS DO BOSTOSSAURO* - ${today}\n\n`;
        report += `🌐 *Status:* ${this.isOnline ? '✅ ONLINE' : '❌ OFFLINE'}\n\n`;
        report += `🛡️ *Uso de Modelos:* (Usado / Limite)\n`;

        for (const [model, limit] of Object.entries(this.modelLimits)) {
            const used = currentUsage[model] || 0;
            const remaining = limit - used;
            const icon = used >= limit ? '🔴' : (used > limit * 0.8 ? '🟡' : '🟢');
            
            report += `${icon} *${model}:* ${used}/${limit}\n`;
        }

        report += `\n⚠️ _Modelos com 🔴 serão ignorados no fallback._`;
        return report;
    }

    //Escolhe qual figurinha deve ser enviada (ou nenhuma)
    async getSticker(command) {
        let stickerPath = "Assets/";
        const cmd = command.split(' ')[0].toLowerCase();
        const textoCompleto = command.toLowerCase();

        const commandActions = {
            '!gpt': async () => {
                if(await this.verifyCapitalLetters(command)){return "naogrita"+await this.rollDice(4)+".webp";}
                else return "eusabo"+await this.rollDice(2)+".webp"
            },
            '!resumo': async () =>{
                return "resumo"+await this.rollDice(2)+".webp"
            },
            '!poke': async () => {
                if (this.pokemonHandler && this.pokemonHandler.lastSticker) {
                    const stickerName = this.pokemonHandler.lastSticker;
                    this.pokemonHandler.lastSticker = null;
                    console.log("[ChatModel] LastSticker: " + stickerName)
                    return stickerName;
                }
                return null;
            }
        };

        if (!this.isOnline) {
            stickerPath += "desonline.webp"
        }
        else if (commandActions[cmd]) {
            const result = await commandActions[cmd]();
            if (result) {
                stickerPath += result;
            } else {
                return null; 
            }
        }
        else if (textoCompleto.includes('aura')) {
            const dado = await this.rollDice(6);
            stickerPath += `aura${dado}.webp`; 
        }
        else return null

        return stickerPath;
    }

    //Essa função verifica a quantidade de letras maiúsculas na mensagem pra responder
    //com a figurinha do "não grita"
    async verifyCapitalLetters(command){
        let sendedText = command;
        if (command.startsWith("!")) {
            const args = command.split(" ");
            if (args.length > 1) {
                args.shift();
                sendedText = args.join(" ");
            } else {
                sendedText = "";
            }
        }
        
        if (!sendedText) return false;
        
        const onlyLetters = sendedText.replace(/[^a-zA-ZÀ-ÿ]/g, '');
        if (onlyLetters.length === 0) return false;
        const capitalTotal = onlyLetters.replace(/[^A-ZÀ-ÖØ-Þ]/g, '').length;
        console.log(`capitalTotal: ${capitalTotal}. onlyLetters: ${onlyLetters}. Texto: ${sendedText}`);

        return capitalTotal > (onlyLetters.length / 4);
    }

    //Verifica qual é a primeira palavra usando regex
    async verifyCommand(command){
        return command.trim().split(/\s+/)[0];
    }

    //Retorna a contagem total de mensagens de uma conversa
    async getMessageCount(from){
        const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE id_conversa = '${from}'`;
        const result = await this.db.get(sqlQuery); 
        return result ? result.total : 0;
    };

    //Retorna mensagens do banco de dados para um certo remetente (pessoa ou grupo) com um limite
    async getMessagesByLimit(from, limit){

        const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE id_conversa = ? 
        AND conteudo NOT LIKE '*Resumo da conversa*%'
        ORDER BY timestamp DESC 
        LIMIT ?`;
        
        const messagesDb = await this.db.all(sqlQuery, [from, limit]);

        if (!messagesDb || messagesDb.length === 0) {
            return "";
        }

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).reverse().join('\n');
    };

    //Comando que retorna as anotações do bot sobre você
    async handleNotasCommand(sender){

        const sqlQuery = `SELECT nome, anotacoes
        FROM usuarios 
        WHERE id_usuario = ?`;
        
        const messagesDb = await this.db.all(sqlQuery, [sender]);

        if (!messagesDb || messagesDb.length === 0) {
            throw new Error("USER_SELECT_ERROR")
        }

        return messagesDb.map(m => `${m.nome || 'Desconhecido'}: ${m.anotacoes}`).reverse().join('\n');
    };


    //Retorna mensagens do banco de dados para um certo remetente (pessoa ou grupo) com um limite
    async getUserMessagesInGroup(from, sender){
        if(from == sender){
            return ""
        }

        const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE id_conversa = ? AND id_remetente = ?
        AND conteudo NOT LIKE '*Resumo da conversa*%'
        ORDER BY timestamp DESC 
        LIMIT 20`;

        const messagesDb = await this.db.all(sqlQuery, [from, sender]);
        
        if (!messagesDb || messagesDb.length === 0) {
            return ""; 
        }

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
    };

    //Função para o comando !resumo, retorna a resposta de um select feito pelo Gemini
    async getMessagesByAiResponse(response){
        const sqlQuery = response
        
        const messagesDb = await this.db.all(sqlQuery);
        if (!messagesDb || messagesDb.length === 0) {
            throw new Error("NO_AI_SQL_RESULT");
        }

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');        
    }

    // Define qual modelo usar baseado no banco de dados
    async selectBestModel(command, forceModel) {
        let candidates = [];

        if (forceModel) {
            candidates.push(forceModel);
            if (forceModel === "gemini-2.5-flash") candidates.push("gemini-3-flash-preview", "gemini-2.5-flash");
        } 
        else if (command.startsWith("!resumo")){            
            candidates = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemma-3-27b-it","gemma-3-12b-it"]; 
        }
        else if (command.startsWith("!gpt")){            
            candidates = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemma-3-27b-it", "gemma-3-12b-it", "gemma-3-4b-it"]; 
        }
        else if (command.startsWith("!lembrar")) {
            candidates = ["gemma-3-27b-it", "gemini-2.5-flash", "gemini-3-flash-preview"]; 
        }
        else if (command.startsWith("!ouvir")){
            candidates = ["gemini-2.5-flash-preview-tts"];
        }
        else if (command.startsWith("!burro")){
            candidates = ["gemma-3-1b-it", "gemma-3n-e2b-it"];
        }
        else {
            candidates = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemma-3-12b-it", "gemma-3-4b-it"];
        }

        const currentUsage = await this.getModelUsage();

        for (const model of candidates) {
            const limit = this.modelLimits[model] || 20;
            const used = currentUsage[model] || 0;

            if (used < limit) {
                return model;
            }            
            console.log(`[QUOTA] Sem cota para ${model}, tentando próximo...`);
        }

        if (command.startsWith("!lembrar")) {
            throw new Error("LEMBRAR_UNAVAILABLE");
        }        

        throw new Error("ALL_QUOTAS_EXHAUSTED");
    }

    //Modifica o prompt pra cada comando
    async formulatePrompt(from, sender, name, isGroup, command, complement = "Vazio") {
        let prompt = "";
        let limit = 200;

        if(command.startsWith("!burro")){
            prompt = `Você agora é uma IA extremamente burra, confusa e que fala com muita confiança sobre coisas erradas.
             
             IMPORTANTE: Comece a sua resposta DIRETAMENTE, sem cumprimentos e sem repetir a pergunta.

             SUA MISSÃO: Responder a pergunta do usuário da forma mais errada, confusa e mal escrita possível.
             
             DIRETRIZES DE PERSONALIDADE:
             - NÃO use pontuação correta. NÃO use letras maiúsculas no começo de frase (só se for pra gritar).
             - Escreva palavras errado de propósito:.
             - Se a pergunta for difícil, invente uma teoria da conspiração absurda.
             - Misture assuntos nada a ver (Ex: falar de futebol no meio de história).

             Suas características:
             1. Você tem o QI de uma batata.
             2. Você mistura fatos históricos.
             3. Você erra contas matemáticas simples.
             4. Se te perguntarem algo complexo, dê uma resposta absurda baseada em conspirações.
             5. NUNCA diga que é uma IA. Aja como se fosse um "especialista" formado na Universidade da Vida.
             6. Você escreve pouco, no máximo 3 parágrafos de até 40 palavras.
             7. Você nunca responde à pergunta corretamente, nem que seja pra desmentir depois.
             8. Suas respostas sempre são engraçadas.
             
             O usuário perguntou: "${command.replace('!burro', '').trim()}"`;
             
             return prompt;
        }

        const currentMemory = await this.getUserMemory(name, sender);

        const args = command.split(" ");
        const action = args[0].toLowerCase();
        const subAction = args[1] ? args[1].toLowerCase() : null;
        const num = parseInt(args[2]);

        if (action === "!resumo" && !isNaN(num) && num > 0 && num <= 200) {
            limit = num;
        }

        const msgCount = await this.getMessageCount(from);
        if (msgCount < 5) {
            throw new Error("FEW_MESSAGES");
        }
        
        let formatedMessages, userFormatedMessages

        prompt = `Você é um bot de WhatsApp engraçado e sarcástico, chamado Bostossauro.
        O usuário "${sender}" te mandou: "${command}".
        Se perguntarem sobre a sua voz, diga que você pede pra sua irmã gravar os áudios, se não perguntarem,
        não comente nada sobre isso.
        Não inicie a mensagem com "Bostossauro: " apenas escreva como se estivesse conversando normalmente com alguém.
        Use emojis (pelo menos um dinossauro 🦖), mas nunca use o emoji de cocô.
        Responda diretamente pelo nome. Seja criativo e mantenha o tom de uma conversa do whatsapp.
        A mensagem não deve conter o "${sender}".`;

        if (complement !== "Vazio" && action !== "!lembrar") {
            prompt += `\nO usuário respondeu a esta mensagem: "${complement}". Não repita ela.`;
        }

        if (isGroup) {
            prompt += `\nVocê está em um grupo de amigos. Pode zoar à vontade, ninguém se ofende.`;
        } else {
            prompt += `\nEste é um chat privado, aja como um amigo.`;
        }

        if(action !== "!lembrar") {
            formatedMessages = await this.getMessagesByLimit(from, limit);
            prompt += `\n\nContexto das últimas mensagens:\n${formatedMessages}`;
        }
        else{
            prompt += `Mensagens que o usuário te pediu para "lembrar":
            ${complement}.
            Resuma o que foi dito nas mensagens recuperadas e responda à mensagem do usuário diretamente.`
        }

        if (action === "!resumo") {
            prompt += `\n\n${sender} pediu um RESUMO da conversa acima.
            Destaque os tópicos principais e quem falou mais besteira.`;

            switch (subAction) {
                case "curto":
                    prompt += "\nDiretriz: Resuma em 2 ou 3 parágrafos curtos (max 30 palavras cada).";
                    break;
                case "médio":
                    prompt += "\nDiretriz: Resuma com moderação (max 60 palavras por parágrafo).";
                    break;
                case "completo":
                    prompt += "\nDiretriz: Se aprofunde nos detalhes (até 60 palavras por assunto).";
                    break;
                default:
                    prompt += "\nDiretriz: Faça um resumo equilibrado.";
            }
        }
        else if(action === "!gpt"){
            prompt += "Seja útil e responda diretamente a mensagem do usuário com dados que julgar importantes."
        }

        if (currentMemory) {
            prompt += `\n\n[O QUE VOCÊ JÁ SABE SOBRE ${sender}]:\n"${currentMemory}"\nUse isso para personalizar a resposta.`;
        }

        const separador = "||MEMORIA||";
        prompt += `\n\n---------------------------------------------------
            [INSTRUÇÃO OCULTA DE MEMÓRIA]
            Além de responder ao usuário, você DEVE atualizar o perfil do que sabe sobre ele.
            No final da sua resposta, adicione estritamente o separador "${separador}" seguido de um resumo atualizado sobre quem é o usuário, gostos, profissão ou detalhes mencionados agora.
            Se nada mudou, repita a memória antiga. Não adicione anotações de informações subjetivas, apenas dados que você
            tem certeza. O usuário não verá a anotação.
            Não anote informações que possam ferir a LGPD.
            Exemplo de saída: "Beleza, te ajudo com isso! ${separador} Usuário é técnico de TI, gosta de LoL e usa gírias."`;

        
        if(from != sender){
            userFormatedMessages = await this.getUserMessagesInGroup(from, sender);
            prompt +=  `As últimas 20 mensagens do usuário no grupo foram (ignore se estiver vazio): \n${userFormatedMessages}`
        }

        return prompt;
    }

    //Recebe a resposta do Gemini utilizando o prompt recebido
    async getAiResponse(from, sender, name, isGroup, command, prompt, forceModel = null) {
        await this.updateOnlineStatus();

        let modelName = await this.selectBestModel(command, forceModel);

        const separator = "||MEMORIA||";

        try {
            const response = await this.genAI.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {}
            });
            
            await this.incrementModelUsage(modelName);

            console.log(`Mensagem gerada usando o ${modelName}`);

            let fullText = response.text || (response.response ? response.response.text() : "");

            // Lógica de corte do separador
            if (fullText.includes(separator)) {
                const parts = fullText.split(separator);
                
                const replyText = parts[0].trim();
                const memoryText = parts[1].trim(); 
                
                if (memoryText.length > 0) {
                    await this.saveUserMemory(name, sender, memoryText);
                }

                return replyText;
            }

            return fullText

        } catch (error) {
            // Se der erro 503 ou 429, o errorHandler pega lá na frente
            console.error("Erro na requisição IA:", error);
            throw error;
        }
    }

    // PAINEL DE DISJUNTORES DE IA
    async handleCotaCommand(ctx) {
        if (ctx.sender !== "5513991008854@s.whatsapp.net") {
            return "🚫 *Acesso Negado.* Só o administrador supremo pode brincar com os disjuntores da IA.";
        }

        const args = ctx.command.trim().split(/\s+/);
        const subCommand = args[1]?.toLowerCase();
        
        const models = Object.keys(this.modelLimits);

        if (subCommand === 'exaurir') {
            const index = parseInt(args[2]) - 1;
            
            if (isNaN(index) || index < 0 || index >= models.length) {
                return `⚠️ Índice inválido! Use um número de 1 a ${models.length}. Digite *!cota listar* para ver os números.`;
            }

            const selectedModel = models[index];
            const limit = this.modelLimits[selectedModel];
            const today = this.getTodayDateString();

            await this.db.run(`
                INSERT INTO system_usage (data_uso, model_name, quantidade)
                VALUES (?, ?, ?)
                ON CONFLICT(data_uso, model_name)
                DO UPDATE SET quantidade = ?
            `, [today, selectedModel, limit, limit]);

            await this.updateOnlineStatus();

            return `🔌 *DISJUNTOR DESLIGADO!*\nO modelo **${selectedModel}** foi exaurido artificialmente (${limit}/${limit}).\nO sistema de fallback pulará ele na próxima requisição.`;
        }

        const currentUsage = await this.getModelUsage();
        let msg = `📊 *PAINEL DE DISJUNTORES (COTAS)* 📊\n_Use !cota exaurir [numero] para matar um modelo_\n\n`;

        models.forEach((model, index) => {
            const used = currentUsage[model] || 0;
            const limit = this.modelLimits[model];
            const icon = used >= limit ? '🔴' : '🟢';
            
            msg += `*[ ${index + 1} ]* ${icon} ${model}: ${used}/${limit}\n`;
        });

        return msg;
    }

    // Comando para aplicar Timeout (!timeout @pessoa tempo)
    // Ex: !timeout @551199999999 10 (bane por 10 minutos)
    async handleTimeoutCommand(name, command, sender, isGroup, mentions) {
        const ADMINS = [
            "5513991008854@s.whatsapp.net"
        ];

        if (!ADMINS.includes(sender)) {
            console.log(`[Timeout] Acesso negado para: ${sender}`);
            return "🔒 Você não tem a insígnia de mestre para isso.";
        }
        
        const args = command.split(' ');
        if (args.length < 3) throw new Error("MISSING_ARGS");

        const targetUser = mentions[0];
        const minutes = parseInt(args[args.length - 1]); 

        if (!targetUser) throw new Error("NO_USER_TO_TIMEOUT");
        if (isNaN(minutes) || minutes <= 0) throw new Error("NOT_A_NUMBER");

        const banUntil = Math.floor(Date.now() / 1000) + (minutes * 60);
        
        await this.getUserData(name, targetUser); 
        
        await this.db.run(`UPDATE usuarios SET banido_ate = ? WHERE id_usuario = ?`, [banUntil, targetUser]);

        return `🚫 Usuário silenciado por ${minutes > 1 ? minutes + " minutos" : minutes + " minuto" }. Fica pianinho aí.`;
    }
    
    async handleFaladorCommand(from){
        try {
            const leaders = await this.db.all(
                `SELECT u.nome, r.total_mensagens 
                 FROM ranking_ofensas r
                 JOIN usuarios u ON r.id_usuario = u.id_usuario
                 WHERE r.id_conversa = ? AND r.total_mensagens > 0
                 ORDER BY r.total_mensagens DESC 
                 LIMIT 3`,
                [from]
            );

            if (!leaders || leaders.length === 0) {
                return "🦗 *Cri... Cri...* Ninguém falou nada hoje ainda, seus cansados.";
            }

            let message = `🗣️ *TOP FALADORES DE HOJE*\n\n`;
            const medals = ["🥇", "🥈", "🥉"];

            leaders.forEach((user, index) => {
                let name = user.nome || "Anônimo";
                if (name === 'Desconhecido') nome = "Sem Nome";
                
                const medal = medals[index] || "🏅";
                message += `${medal} *${name}*: ${user.total_mensagens} mensagens\n`;
            });

            return message;

        } catch (error) {
            console.error("Erro no ranking de faladores:", error);
            return "❌ Ixi, quebrei.";
        }
    }

    //Responde o comando !lembrar
    async handleLembrarCommand(from, sender, name, isGroup, command, complement){
            const pergunta = command.slice(8).trim()
            const selectPrompt = `Você é um gerador de consulta SQL para SQLite. Sua única saída deve ser uma consulta SQL (SELECT), sem NENHUMA explicação ou texto adicional.
            A tabela é 'mensagens' e o campo de tempo é 'timestamp' (UNIX time em segundos).
            O ID da conversa atual é '${from}'.
            O usuário quer recuperar mensagens que se encaixam no período de tempo da pergunta, limitando o resultado a 500 mensagens no máximo.
            Recupere as colunas 'nome_remetente' e 'conteudo'.
            Use a condição WHERE para filtrar pelo id_conversa = '${from}' E pelo intervalo de tempo (timestamp).
            A ordenação deve ser por timestamp DESC, e o limite deve ser de 200. Se a pergunta não especificar um período de tempo, recupere as últimas 200 mensagens da conversa.

            Exemplo de saída para "o que rolou ontem": SELECT nome_remetente, conteudo FROM mensagens WHERE id_conversa = '${from}' AND timestamp BETWEEN 1764355200 AND 1764441600 ORDER BY timestamp DESC LIMIT 200;

            Pergunta do usuário: ${pergunta}`

            let sqlQuery = await this.getAiResponse(from, sender, name, isGroup, command, selectPrompt, "gemini-2.5-flash")

            // Remove blocos de código markdown (```sql e ```) e espaços extras
            sqlQuery = sqlQuery.replace(/```sql/gi, '').replace(/```/g, '').trim(); 
            
            if (!sqlQuery.toLowerCase().startsWith('select')) {
                console.log("IA gerou SQL inválido:", sqlQuery);
                throw new Error("INVALID_SELECT");
            }
            
            if (!sqlQuery.toLowerCase().includes('limit')) {
                sqlQuery = sqlQuery.replace(/;?$/, ` LIMIT 200;`);
            }
            
            let selectedMessages = await this.getMessagesByAiResponse(sqlQuery)

            let finalPrompt = await this.formulatePrompt(from, sender, name, isGroup, command, selectedMessages)
            
            return await this.getAiResponse(from, sender, name, isGroup, "any", finalPrompt)
    }

    async handleMenuCommand(){
        return `📍 *MENU RÁPIDO (v4.0 - Pokémon)* \n\n
        🆘 !ajuda (ou !help)\n
        🗣️ !audio\n
        🌡️ !clima\n
        💵 !cotacao\n
        🎲 !d{número}\n
        🗣️ !falador\n
        🤖 !gpt {texto}\n
        🧠 !lembrar\n
        🎮 !lol\n
        📄 !menu\n
        ✏️ !notas\n
        📙 !pdf\n
        🎮 !poke (JOGO COMPLETO)\n
        🖼️ !s (ou !sticker)\n
        🛎️ !resumo\n        
        ☢️ !toxico\n
        🧐 !tradutor
        \n\nPara detalhes, digite: *!ajuda [comando]*`;
    }

    //Responde o comando !d
    async handleDiceCommand(text, sender){
        var num = text.slice(2).trim(); 
        const max = parseInt(num);

        if(isNaN(num) || num === ""){
            return false
        }
        else{               
            let val = await this.rollDice(num); 
            let mssg = "";
            
            if(val == 1) mssg = "❌ FALHA CRÍTICA! Tomou gap..."
            else if(val < max/2) mssg = "🫠 meh."
            else if(val < max/1.5) mssg = "🫤 até que não foi ruim."
            else if(val < max) mssg = "😎 nice."
            else if(val == max) mssg = "🎰 SORTE GRANDE!"
            
            return `🎲 O dado caiu em: *${val}* \n${mssg}`;
        }
    }

    async handleTradutorCommand(from, sender, name, isGroup, command) {
        const args = command.split(' '); 
        const language = args[0];
        const content = args.slice(1).join(' ');

        console.log("Content: "+content+"\n")
        if (!content) throw new Error("MISSING_ARGS");

        const prompt = `Você é um tradutor profissional. 
        Traduza o seguinte texto para ${language}
        Apenas a tradução, sem explicações extras.
        Texto: "${content}"`;

        return await this.getAiResponse(from, sender, name, isGroup, "!traduzir", prompt, "gemma-3-12b-it");
    }

    async handleClimaCommand(text, sender){       
        let cleanText = text.replace(/^!clima\s*/i, '').trim()
        if (text.toLowerCase().endsWith('amanhã')) {
                const city = cleanText.replace(/amanhã$/i, '').trim()
                return await weatherCommandHandler.getNextDayForecast(city)
        }
        else if (text.toLowerCase().endsWith('hoje')){            
            const city = cleanText.replace(/hoje$/i, '').trim
            return await weatherCommandHandler.getWeather(city)
        }
        else{             
            const city = cleanText
            return await weatherCommandHandler.getWeather(city)
        }
    }
    
    //Gera um número aleatório entre 1 e um número via parâmetro
    async rollDice(num){        
        const max = parseInt(num);
        const val = Math.floor(Math.random() * max) + 1
        return val
    }

    async trabalharCommand(text, sender){

    }

    // Faz o controle de todos os comandos
    async handleCommand(msg, sender, from, isGroup, command, quotedMessage, sock, mentions = []) {
        let name = msg.pushName || ''
        
        const user = await this.getUserData(name, sender)

        this.checkTimeout(user)
        this.checkSpam(sender, command)

        let rootCommand = command.split(' ')[0].toLowerCase();

        if (/^!d\d+$/.test(rootCommand)) {
            rootCommand = '!d';
        }

        const handler = this.commandHandlers[rootCommand];

        if (handler) {
            const ctx = {
                msg, sender, from, isGroup, command, quotedMessage, sock, name, user, mentions
            };

            return await handler(ctx);
        }
    }

    async handleMessageWithoutCommand(msg, sender, from, isGroup, command, quotedMessage){
        let name = msg.pushName || '';
        
        const user = await this.getUserData(name, sender)

        this.checkTimeout(user);
        await this.checkAndIncrementAiQuota(user, sender, command)

        let finalPrompt = await this.formulatePrompt(from, sender, name, isGroup, command, quotedMessage)
        return await this.getAiResponse(from, sender, name, isGroup, command, finalPrompt)
    }
}

module.exports = ChatModel;