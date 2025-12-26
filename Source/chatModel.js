const usage = require('./usageControl');
const weatherCommandHandler = require('./weatherCommand');
const currencyCommandHandler = require('./currencyCommand');
const helpCommandHandler = require('./helpCommand');
const pdfCommandHandler = require('./pdfCommand');
const fs = require('fs');
const RIOT_API_KEY = process.env.RIOT_API_KEY;

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
            "gemma-3-4b-it": 9999
        };
        this.updateOnlineStatus();
        this.lolChampionsMap = null;
        this.lolVersion = '14.23.1';        
        this.initLoLData();
        setInterval(() => {
            console.log("⏰ Atualizando versão e campeões do LoL (Rotina Diária)...");
            this.initLoLData();
        }, 1000 * 60 * 60 * 24);
        this.spamCooldowns = new Map(); 
        this.SPAM_DELAY_SECONDS = 10;
        this.DAILY_AI_LIMIT = 10;
        this.DAILY_LIMIT_GEMMA = 100;
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

    checkSpam(sender) {
        const now = Date.now();
        const lastTime = this.spamCooldowns.get(sender) || 0;
        const diffSeconds = (now - lastTime) / 1000;

        if (diffSeconds < this.SPAM_DELAY_SECONDS) {
            const waitTime = Math.ceil(this.SPAM_DELAY_SECONDS - diffSeconds);
            throw new Error(`SPAM_DETECTED|${waitTime}`);
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

    //Atualiza os dados do LOL
    async initLoLData() {
        const versionResp = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        
        if (!versionResp.ok) throw new Error(`LOL_VERSION_ERROR`);
        
        const versions = await versionResp.json();
        this.lolVersion = versions[0];

        // URL dos Campeões
        const champUrl = `https://ddragon.leagueoflegends.com/cdn/${this.lolVersion}/data/pt_BR/champion.json`;

        const champsResp = await fetch(champUrl);
        
        if (!champsResp.ok) {
            throw new Error(`CHAMPIONS_ERROR`);
        }

        const champsJson = await champsResp.json();
        
        if (!champsJson.data) {
            throw new Error(`LOL_JSON_DATA_ERROR`);
        }

        this.lolChampionsMap = {};
        for (const key in champsJson.data) {
            const champ = champsJson.data[key];
            this.lolChampionsMap[champ.key] = champ.name;
        }
    }


    getChampName(id) {
        return this.lolChampionsMap ? (this.lolChampionsMap[id] || `ID: ${id}`) : `ID: ${id}`;
    }

    updateOnlineStatus() {
        this.isOnline = usage.hasAnyQuotaAvailable(this.modelLimits);
    }

    //Função de monitoramento de recursos
    async getStatus() {
        const stats = usage.getData(); // Pega os dados do usageControl.js
        const date = stats.date;
        const counts = stats.counts;

        let report = `📊 *STATUS DO BOSTOSSAURO* - ${date}\n\n`;
        report += `🌐 *Status:* ${this.isOnline ? '✅ ONLINE' : '❌ OFFLINE'}\n\n`;
        
        report += `🛡️ *Uso de Modelos:* (Usado / Limite)\n`;

        for (const [model, limit] of Object.entries(this.modelLimits)) {
            const used = counts[model] || 0;
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
        const cmd = command.split(' ')[0];

        const commandActions = {
            '!gpt': async () => {
                if(await this.verifyCapitalLetters(command)){return "naogrita"+await this.rollDice(4)+".webp";}
                else return "eusabo"+await this.rollDice(2)+".webp"
            },
            '!resumo': async () =>{
                return "resumo"+await this.rollDice(2)+".webp"
            }
        };

        if (!this.isOnline) {
            stickerPath += "desonline.webp"
        }

        else if (commandActions[cmd]) {
            stickerPath += await commandActions[cmd]();
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

    // Define qual modelo usar baseado no comando, força e cota
    selectBestModel(command, forceModel) {
        let candidates = [];

        if (forceModel) {
            candidates.push(forceModel);
            if (forceModel === "gemini-2.5-flash") candidates.push("gemini-3-flash-preview", "gemini-2.5-flash");
        } 
        else if (command.startsWith("!resumo")){            
            candidates = ["gemini-2.5-flash", 
                          "gemini-3-flash-preview", 
                          "gemini-2.5-flash-lite", 
                          "gemma-3-27b-it","gemma-3-12b-it"]; 
        }
        else if (command.startsWith("!gpt")){            
            candidates = ["gemini-2.5-flash", 
                          "gemini-3-flash-preview", 
                          "gemini-2.5-flash-lite",
                          "gemma-3-27b-it",
                          "gemma-3-12b-it", 
                          "gemma-3-4b-it"]; 
        }
        else if (command.startsWith("!lembrar")) {
            candidates = ["gemma-3-27b-it", 
                          "gemini-2.5-flash", 
                          "gemini-3-flash-preview"]; 
        }
        else if (command.startsWith("!ouvir")){
            candidates = ["gemini-2.5-flash-preview-tts"]
        }
        else {
            candidates = [
                "gemini-2.5-flash",
                "gemini-3-flash-preview",
                "gemini-2.5-flash-lite",  
                "gemma-3-12b-it",
                "gemma-3-4b-it"
            ];
        }

        for (const model of candidates) {
            const limit = this.modelLimits[model] || 20;            
            if (usage.hasQuota(model, limit)) {
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
            Exemplo de saída: "Beleza, te ajudo com isso! ${separador} Usuário é técnico de TI, gosta de LoL e usa gírias."`;

        
        if(from != sender){
            userFormatedMessages = await this.getUserMessagesInGroup(from, sender);
            prompt +=  `As últimas 20 mensagens do usuário no grupo foram (ignore se estiver vazio): \n${userFormatedMessages}`
        }

        return prompt;
    }

    //Recebe a resposta do Gemini utilizando o prompt recebido
    async getAiResponse(from, sender, name, isGroup, command, prompt, forceModel = null) {
        this.updateOnlineStatus();

        let modelName = this.selectBestModel(command, forceModel);

        const separator = "||MEMORIA||";

        try {
            const response = await this.genAI.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {}
            });
            
            usage.increment(modelName);

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

    // 5. Comando para aplicar Timeout (!timeout @pessoa tempo)
    // Ex: !timeout @551199999999 10 (bane por 10 minutos)
    async handleTimeoutCommand(name, command, sender, isGroup, mentions) {

        if(sender !== "266180732403881@lid"){
            return
        }
        
        const args = command.split(' ');
        if (args.length < 3) return;

        const targetUser = mentions[0];
        const minutes = parseInt(args[args.length - 1]); 

        if (!targetUser) return;
        if (isNaN(minutes) || minutes <= 0) return;

        const banUntil = Math.floor(Date.now() / 1000) + (minutes * 60);
        
        await this.getUserData(name, targetUser); 
        
        await this.db.run(`UPDATE usuarios SET banido_ate = ? WHERE id_usuario = ?`, [banUntil, targetUser]);

        return `🚫 Usuário silenciado por ${minutes} minutos. Fica pianinho aí.`;
    }

    // Responde o comando !lol
    async handleLolCommand(command) {
        const args = command.trim().split(' ');
        args.shift();
        
        const fullArg = args.join(' ');
        const [gameName, tagLine] = fullArg.split('#');

        if (!gameName || !tagLine) {
            return "❌ Formato inválido. Use: *!lol Nome #Tag* (Ex: !lol Faker #T1)";
        }

        const region = 'americas';
        const platform = 'br1';

        // Busca Conta (PUUID)
        const accountResp = await fetch(`https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName.trim())}/${encodeURIComponent(tagLine.trim())}`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        if (!accountResp.ok) {
            if (accountResp.status === 404) throw new Error(`NICKNAME_OR_TAGLINE_WRONG`);
            if (accountResp.status === 403) throw new Error(`KEY_UNAVAILABLE`)
        }

        const accountData = await accountResp.json();
        const puuid = accountData.puuid;

        const leagueResp = await fetch(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`, {
                headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        const leagueData = await leagueResp.json();

        // Busca elo na solo e flex
        const soloQueue = leagueData.find(q => q.queueType === 'RANKED_SOLO_5x5');
        const flexQueue = leagueData.find(q => q.queueType === 'RANKED_FLEX_SR');
        
        let rankSolo = "Unranked";
        if (soloQueue) {
            rankSolo = `${soloQueue.tier} ${soloQueue.rank} (${soloQueue.leaguePoints} PDL)`;
        }

        let rankFlex = "Unranked";
        if (flexQueue) {
            rankFlex = `${flexQueue.tier} ${flexQueue.rank} (${flexQueue.leaguePoints} PDL)`;
        }

        // Busca Maestrias
        const masteryResp = await fetch(`https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });
        const masteryData = await masteryResp.json();

        let response = `📊 *ESTATÍSTICAS LOLZINHO*\n\n`;
        response += `👤 *Player:* ${accountData.gameName} #${accountData.tagLine}\n`;
        response += `🏆 *Elo Solo:* ${rankSolo}\n`;
        
        if (soloQueue) {
            const winRate = Math.round((soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100);
            response += `📈 *Winrate:* ${winRate}% (${soloQueue.wins}V / ${soloQueue.losses}D)\n`;
        }
        
        response += `👥 *Elo Flex:* ${rankFlex}\n`;

        if(flexQueue){
            const winRate = Math.round((flexQueue.wins / (flexQueue.wins + flexQueue.losses)) * 100);
            response += `📈 *Winrate:* ${winRate}% (${flexQueue.wins}V / ${flexQueue.losses}D)\n`;
        }

        response += `\n⚔️ *Top 3 Maestrias:*\n`;
        masteryData.forEach((m, i) => {
            const nomeChamp = this.getChampName(m.championId);
            const pontos = m.championPoints.toLocaleString('pt-BR');
            response += `${i+1}º ${nomeChamp} - Nvl ${m.championLevel} (${pontos} pts)\n`;
        });

        return response;
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

    //Responde o comando !menu
    async handleMenuCommand(){
        return `📍 Os comandos até agora são: \n🌡️ !clima: Retorna o clima em determinada cidade - Parâmetros:\nCidade: o nome da cidade\nMomento: hoje (ou vazio) ou amanhã. Ex: !clima Santos amanhã\n💵 !cotacao: realiza a conversão de um valor entre duas moedas - Parâmetros:\n1- moeda original. Ex: real ou BRL.\n2 - moeda para conversão. Ex: dolar/dólar ou USD.\n3 - Valor a ser convertido.\n Ex: !cotacao real dolar 10000\n🎲 !d{número}: Número aleatório (ex: !d20)\n🤖 !gpt {texto}: Pergunta pra IA\n🧠 !lembrar: lembra de um certo período de tempo\n🎮 !lol Mostra ranking (Solo/Flex), winrate e suas maestrias - Parâmetros:\nnickname #tagline Ex: Yasuo de Ionia #Yasuo.\n✏️ !notas: mostra as anotações que a IA fez sobre você\n🖼️ !s (ou !sticker): cria um sticker para a imagem/gif quotado ou na própria mensagem - Parâmetros:\npodi: qualidade absurdamente baixa\nbaixa: em baixa qualidade\nnormal(ou sem parâmetro nenhum): qualidade normal\n🛎️ !resumo: Resume a conversa - Parâmetros:\n1 - tamanho do resumo: curto, médio e completo\n2 - quantidade de mensagens a resumir (máximo 200)\n Ex: !resumo curto 100\n🧐 !tradutor: traduz a mensagem para qualquer (ou quase qualquer) língua - Parâmetros:\n1 - língua: ex: inglês.\n2 - mensagem. \nEx: !tradutor inglês bom dia.`;
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

    // Faz o controle de todos os comandos
    async handleCommand(msg, sender, from, isGroup, command, quotedMessage, sock) {
        let name = msg.pushName || ''
        
        const user = await this.getUserData(name, sender)

        this.checkTimeout(user)
        this.checkSpam(sender)

        // ADM COMMAND
        if (command.startsWith('!timeout')) {
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
            return await this.handleTimeoutCommand(name, command, sender, isGroup, mentions)
        }

        if(command.startsWith('!d')) return await this.handleDiceCommand(command, sender)
        
        if(command.startsWith('!menu')) return await this.handleMenuCommand()
        
        if (command.startsWith('!gpt') || command.startsWith('!resumo') || command.startsWith('!lembrar')) {
            await this.checkAndIncrementAiQuota(user, sender, command)
            
            if(command.startsWith('!resumo') && isGroup || command.startsWith("!gpt") && isGroup) return await this.getAiResponse(from, sender, name, isGroup, command, await this.formulatePrompt(from, sender, name, isGroup, command, quotedMessage));

            if(command.startsWith("!lembrar")) return await this.handleLembrarCommand(from, sender, name, isGroup, command)
        }

        if (command.startsWith('!tradutor')) {
            await this.checkAndIncrementTranslateQuota(user, sender, command);
            return await this.handleTradutorCommand(from, sender, name, isGroup, command);
        }

        if(command.startsWith('!lol')) return await this.handleLolCommand(command)

        if(command.startsWith('!notas')) return await this.handleNotasCommand(sender)

        if (command.startsWith('!clima')) return await this.handleClimaCommand(command, sender)

        if (command.startsWith('!cotacao')) return await currencyCommandHandler.convertCurrency(command);
        if (command.startsWith('!help') || command.startsWith('!ajuda')) {
            const args = command.split(/\s+/).slice(1).join(' ');
            return helpCommandHandler.getHlp(args);
        }
        if (command === '!pdf') {
            await pdfCommandHandler.handlePdfCommand(sock, msg, from);
            return;
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