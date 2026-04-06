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
const PokeRouter = require('./Poke/index');
const migrationCommandHandler = require('./migrarCommand');
const resenhaCommand = require('./resenhaCommand');
const CasinoHandler = require('./casinoHandler');
const PescariaHandler = require('./pescariaHandler');
const ParqueHandler = require('./parqueHandler');
const { FazendaHandler } = require('./fazendaHandler');
const StreamHandler = require('./streamHandler');
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const { getWeather, getNextDayForecast, getGameWeatherCondition } = require('./weatherCommand');

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
        this.pokeRouter = new PokeRouter(db);
        this.initializeCommandHandlers();
        this.resenhaHandler = new resenhaCommand(db, genAI);
        this.casinoHandler = new CasinoHandler(db);
        this.pescariaHandler = new PescariaHandler(db, this.casinoHandler);
        this.parqueHandler = new ParqueHandler(db, this.casinoHandler, this.pescariaHandler);
        this.pescariaHandler.setParqueHandler(this.parqueHandler);
        this.fazendaHandler = new FazendaHandler(db, this.casinoHandler, this.pescariaHandler);

        this.fazendaHandler.parqueHandler = this.parqueHandler;
        this.casinoHandler.parqueHandler = this.parqueHandler;
        this.streamHandler = new StreamHandler(db);
    }

    async init() {
        if (this.pokemonHandler) {
            await this.pokemonHandler.init();
        }
    }

    async registerMetric(type, commandName = null, extraData = "") {
        const today = new Date().toISOString().split('T')[0];
        
        await this.db.run(`
            INSERT OR IGNORE INTO metricas_diarias (data, comandos_totais, respostas_ia, mensagens_lidas, comando_mais_usado)
            VALUES (?, 0, 0, 0, '{}')
        `, [today]);

        if (type === 'message') {
            await this.db.run(`UPDATE metricas_diarias SET mensagens_lidas = mensagens_lidas + 1 WHERE data = ?`, [today]);
        } else if (type === 'ai_response') {
            await this.db.run(`UPDATE metricas_diarias SET respostas_ia = respostas_ia + 1 WHERE data = ?`, [today]);
        } else if (type === 'command' && commandName) {
            const row = await this.db.get("SELECT comandos_totais, comando_mais_usado FROM metricas_diarias WHERE data = ?", [today]);
            if (row) {
                let cmdStats = JSON.parse(row.comando_mais_usado || '{}');
                cmdStats[commandName] = (cmdStats[commandName] || 0) + 1;
                
                await this.db.run(`
                    UPDATE metricas_diarias 
                    SET comandos_totais = comandos_totais + 1,
                        comando_mais_usado = ?
                    WHERE data = ?
                `, [JSON.stringify(cmdStats), today]);
            }
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
            '!link': async (ctx) => {
                if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas o arquiteto da Matrix pode unir dimensões.";
                const args = ctx.command.trim().split(/\s+/);
                if (args.length < 2) return "⚠️ Uso: *!link [id_do_grupo_pai]*\n_(Use !id no grupo principal para pegar o código)_";
                
                const parentId = args[1];
                if (!ctx.isGroup) return "⚠️ Este comando deve ser usado dentro do grupo que será o *filho*.";
                if (parentId === ctx.from) return "⚠️ Você não pode linkar o grupo nele mesmo, gênio.";

                await this.db.run("INSERT OR REPLACE INTO grupos_linkados (id_filho, id_pai) VALUES (?, ?)", [ctx.from, parentId]);
                return `🔗 **LINK DIMENSIONAL ESTABELECIDO!**\nEste grupo agora é uma filial do grupo oficial (\`${parentId}\`).\nA IA, o Parque e a Pescaria agora compartilham a mesma linha do tempo!`;
            },
            '!unlink': async (ctx) => {
                if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Acesso negado.";
                await this.db.run("DELETE FROM grupos_linkados WHERE id_filho = ?", [ctx.from]);
                return "💔 **LINK QUEBRADO.** Este grupo voltou a ser independente e isolado.";
            },
            '!debug_grupo': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🔒 Privilégio de Admin.";
                return await this.casinoHandler.handleDebugGroup(tag, ctx.from, ctx.sock);
            },
            '!exorcismo': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);                
                if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🔒 Privilégio de Admin.";
                return await this.casinoHandler.handleExorcismo(ctx.sender, tag);
            },
            '!admin': async (ctx) => {
                const args = ctx.command.split(' ');
                const subCommand = args[1] ? args[1].toLowerCase() : '';

                if (!ctx.sender.includes('5513991008854')) {
                    return "⚠️ Você não é o BostOuroboros para apagar universos. Volte para a roça!";
                }

                if (subCommand === 'wipe') {
                    if (ctx.sock) {
                        const grupos = await this.db.all("SELECT DISTINCT group_id FROM parque_dinossauros");
                        
                        for (const grupo of grupos) {
                            try {
                                await ctx.sock.sendMessage(grupo.group_id, { text: "⏳ Iniciando colapso temporal... O BostOuroboros está despertando." });
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            } catch (e) {
                                console.error(`Erro ao enviar aviso prévio de wipe para o grupo ${grupo.group_id}:`, e);
                            }
                        }
                    }
                    
                    return await this.executarWipeGlobal(ctx.sock);
                }

                // CÓDIGO DA CENTRAL DE DADOS
                if (subCommand === 'painel' || subCommand === 'dashboard') {
                    const today = new Date().toISOString().split('T')[0];
                    const metrics = await this.db.get("SELECT * FROM metricas_diarias WHERE data = ?", [today]);
                    
                    if (!metrics) return "📊 A central ainda não captou nenhuma atividade suspeita hoje.";

                    // Achar o comando mais usado
                    const cmdStats = JSON.parse(metrics.comando_mais_usado || '{}');
                    let topCmd = 'Nenhum';
                    let topCount = 0;
                    
                    for (const [cmd, count] of Object.entries(cmdStats)) {
                        if (count > topCount) {
                            topCount = count;
                            topCmd = cmd;
                        }
                    }

                    // Calcular o PIB do servidor (Soma de todos os Bostocoins)
                    const pibInfo = await this.db.get("SELECT SUM(bostocoins) as pib FROM usuarios");
                    const pib = pibInfo && pibInfo.pib ? pibInfo.pib : 0;

                    let msg = `📈 **BOSTODASH - INGEN CORP** 📈\n_Monitoramento do dia: ${today}_\n\n`;
                    msg += `👁️ **Mensagens Lidas:** ${metrics.mensagens_lidas}\n`;
                    msg += `⚡ **Comandos Invocados:** ${metrics.comandos_totais}\n`;
                    msg += `🤖 **Respostas da IA:** ${metrics.respostas_ia}\n`;
                    msg += `🏆 **Comando Favorito:** ${topCmd} (${topCount}x)\n\n`;
                    msg += `💰 **PIB do Bostoverso:** 🪙 ${pib.toLocaleString('pt-BR')} Bostocoins\n`;

                    return msg;
                }

                return "⚙️ **PAINEL DIVINO** ⚙️\n\nDisponível:\n*!admin wipe* - Reseta a temporada do Bostoverso.\n*!admin dashboard* - Mostra o dashboard do dia atual.";
            },
            '!testarbomdia': async (ctx) => {
                if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                    return "🚫 Apenas o Arquiteto pode testar as variações do multiverso.";
                }
                
                if (ctx.sock) {
                    await ctx.sock.sendMessage(ctx.from, { text: "⏳ Rodando 20 simulações de humor do Bostossauro... aguenta aí que o bicho tá pensando." });
                }
                
                let result = "*🔥 TESTE DE HUMOR DO BOSTOSSAURO (20x) 🔥*\n\n";
                
                for (let i = 1; i <= 20; i++) {
                    const seedId = `${i}-${Date.now()}`;
                    const frase = await this.generateBomDia(seedId);
                    
                    result += `*[ ${i} ]* ${frase}\n`;
                    
                    await new Promise(r => setTimeout(r, 1200)); 
                }
                
                return result;
            },
            '!anuncio': async (ctx) => {
                return await this.streamHandler.handleAnuncio(ctx);
            },
            '!liveon': async (ctx) => {
                return await this.streamHandler.handleLiveStatus(ctx, 'on');
            },
            '!liveoff': async (ctx) => {
                return await this.streamHandler.handleLiveStatus(ctx, 'off');
            },
            '!addmod': async (ctx) => {
                return await this.streamHandler.handleAddMod(ctx);
            },
            '!removemod': async (ctx) => {
                return await this.streamHandler.handleRemoveMod(ctx);
            },
            '!mods': async (ctx) => {
                return await this.streamHandler.handleListMods(ctx);
            },
            '!listmods': async (ctx) => {
                return await this.streamHandler.handleListMods(ctx);
            },
            '!cidade': async (ctx) => {
                const args = ctx.command.trim().split(/\s+/);
                
                if (args.length < 2) {
                    const user = await this.db.get("SELECT cidade FROM usuarios WHERE id_usuario = ?", [ctx.sender]);
                    const currentCity = user?.cidade || 'Santos';
                    return `${ctx.name}, sua base de operações atual é: *${currentCity}*.\nPara mudar sua região e o clima, use: *!cidade [nome da cidade]*`;
                }

                const newCity = args.slice(1).join(' ');
                await this.db.run("UPDATE usuarios SET cidade = ? WHERE id_usuario = ?", [newCity, ctx.sender]);
                
                return `🏙️ **BASE ATUALIZADA!**\nSua fazenda, frota de pesca e parque agora respondem ao clima de *${newCity}*.`;
            },
            '!d': async (ctx) => await this.handleDiceCommand(ctx.command, ctx.sender),
            '!menu': async () => await this.handleMenuCommand(),
            '!tradutor': async (ctx) => {
                await this.checkAndIncrementTranslateQuota(ctx.user, ctx.sender, ctx.command);
                return await this.handleTradutorCommand(ctx.from, ctx.sender, ctx.name, ctx.isGroup, ctx.command);
            },
            '!lol': async (ctx) => await lolCommandHandler.handleLolCommand(ctx.command),
            '!notas': async (ctx) => {                
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                return await this.handleNotas(ctx.sender, tag)
            },
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
                return await this.pokemonHandler.handleCommand(ctx.from, ctx.sender, ctx.command, ctx.sock, ctx.mentions);
            },
            '!poke2': async (ctx) => {
                const replyFunction = async (content) => {
                    if (!ctx.sock) return content; 
                    if (typeof content === 'string') {
                        await ctx.sock.sendMessage(ctx.from, { text: content });
                    } 
                    else {
                        await ctx.sock.sendMessage(ctx.from, content);
                    }
                };
                await this.pokeRouter.handleCommand(ctx.from, ctx.sender, ctx.command, ctx.sock, ctx.mentions, replyFunction);
                
                return null;
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
                const netGroupId = await this.getNetGroupId(ctx.from);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();
                const sock = ctx.sock;

                if (!subCommand || subCommand === 'saldo' || subCommand === 'ajuda') {
                    return await this.casinoHandler.showBalance(ctx.sender, tag);
                }
                if (!isNaN(subCommand)) {
                    const bet = parseInt(subCommand);
                    return await this.casinoHandler.playSlots(ctx.sender, tag, bet, netGroupId, sock);
                }
                if (subCommand === 'cara' || subCommand === 'coroa') {
                    const bet = parseInt(args[2]);
                    return await this.casinoHandler.playCoinflip(ctx.sender, tag, subCommand, bet, netGroupId, sock);
                }
                if (subCommand === 'roleta') {
                    const color = args[2]?.toLowerCase();
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playRoulette(ctx.sender, tag, color, bet, netGroupId, sock);
                }

                if (subCommand === 'mega') {
                    if (args[2]?.toLowerCase() === 'apostadores') {
                        return await this.casinoHandler.getMegaBettors(tag);    
                    }
                    
                    const number = parseInt(args[2]);
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playMega(ctx.sender, tag, number, bet, netGroupId, sock);
                }

                if (subCommand === 'bolao') {
                    if (args[2]?.toLowerCase() === 'apostadores') {
                        return await this.casinoHandler.getBolaoBettors(tag);
                    }

                    const number = parseInt(args[2]);
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playBolao(ctx.sender, tag, number, bet, netGroupId, sock);
                }

                return `${tag}🎰 **CASSINO E ECONOMIA DO BOSTOSSAURO** 🎰\n\n` +
                    `*Apostas:* \n🎰 *!cassino [valor]* (Slots)\n🪙 *!cassino [cara/coroa] [valor]*\n🎡 *!cassino roleta [vermelho/preto/verde] [valor]*\n\n` +
                    `*Loterias:*\n🎟️ *!cassino mega [1-100] [valor]*\n🤝 *!cassino bolao [1-20] [valor]*\n\n` +
                    `*Faria Lima:*\n💼 *!trabalhar* (Emprego CLT)\n🛠️ *!bico* (Trampo rápido)\n📈 *!investir* (Bolsa de Valores)\n🏦 *!emprestimo* (Agiota)\n👑 *!titulo* (Cartório de Ostentação)\n\n` +
                    `*Consultas:* \n💰 *!cassino saldo*`;
            },
            '!givecoins': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                
                let targetId = null;
                let amountStr = null;
                let excecoes = [];

                for (let i = 1; i < args.length; i++) {
                    if (args[i].toLowerCase() === 'all' || args[i].toLowerCase() === 'todos') {
                        targetId = 'all';
                    } else if (!isNaN(args[i])) {
                        amountStr = args[i];
                    }
                }

                if (targetId === 'all') {
                    if (ctx.mentions && ctx.mentions.length > 0) {
                        excecoes = ctx.mentions;
                    }
                } else {
                    if (ctx.mentions && ctx.mentions.length > 0) {
                        targetId = ctx.mentions[0];
                    } else {
                        const mentionArg = args.find(a => a.includes('@'));
                        if (mentionArg) {
                            targetId = mentionArg.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                        }
                    }
                }

                if (!targetId || !amountStr) {
                    return `${tag}⚠️ Formato incorreto!\nUse: *!givecoins [all ou @usuario] [valor]*\nEx: _!givecoins all 500 @Excluido_ ou _!givecoins @Fulano 1000_`;
                }

                return await this.casinoHandler.handleGiveCoins(ctx.sender, tag, targetId, amountStr, ctx.from, ctx.sock, excecoes);
            },
            '!titulo': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const param = ctx.command.replace('!titulo', '').trim();
                return await this.casinoHandler.handleTitulos(ctx.sender, tag, param, ctx.from);
            },
            '!investir': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                if (subCommand === 'acelerar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas a CVM (Admin) pode manipular o tempo do mercado.";
                    return await this.casinoHandler.acelerarInvestimentoGlobal(tag);
                }

                return await this.casinoHandler.handleInvestir(ctx.sender, tag, args[1], args[2]);
            },
            '!emprestimo': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                return await this.casinoHandler.handleEmprestimo(ctx.sender, tag, args[1]);
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
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                if (subCommand === 'acelerar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas o Ministro da Economia (Admin) pode usar isso.";
                    return await this.casinoHandler.acelerarTrabalhoGlobal(tag);
                }

                if (subCommand === 'rh' || subCommand === 'embaralhar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas a diretoria de RH pode fazer isso.";
                    return await this.casinoHandler.shuffleJobsGlobal(tag);
                }

                if (subCommand === 'carreira' || subCommand === 'perfil') {
                    return await this.casinoHandler.handleCarreira(ctx.sender, tag);
                }

                return await this.casinoHandler.handleTrabalhar(ctx.sender, tag);
            },
            '!trabalho': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                if (subCommand === 'acelerar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas o Ministro da Economia (Admin) pode usar isso.";
                    return await this.casinoHandler.acelerarTrabalhoGlobal(tag);
                }

                if (subCommand === 'rh' || subCommand === 'embaralhar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas a diretoria de RH pode fazer isso.";
                    return await this.casinoHandler.shuffleJobsGlobal(tag);
                }

                if (subCommand === 'carreira' || subCommand === 'perfil') {
                    return await this.casinoHandler.handleCarreira(ctx.sender, tag);
                }

                return await this.casinoHandler.handleTrabalhar(ctx.sender, tag);
            },
            '!bico': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                // Comando de Admin para acelerar
                if (subCommand === 'acelerar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Apenas o Presidente do Banco Central (Admin) pode usar isso.";
                    return await this.casinoHandler.acelerarBicoGlobal(tag);
                }

                return await this.casinoHandler.handleBico(ctx.sender, tag);
            },
            '!pescar': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const clima = await this.getClimaUsuario(ctx.sender); 
                const netGroupId = await this.getNetGroupId(ctx.from); 
                return await this.pescariaHandler.pescar(ctx.sender, tag, netGroupId, clima, ctx.sock);
            },
            '!pesca': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const clima = await this.getClimaUsuario(ctx.sender); 
                const netGroupId = await this.getNetGroupId(ctx.from); 
                return await this.pescariaHandler.pescar(ctx.sender, tag, netGroupId, clima, ctx.sock);
            },
            '!vip': async (ctx) => {
                return await this.handleVipStore(ctx);
            },
            '!pescaria': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                const netGroupId = await this.getNetGroupId(ctx.from);

                if (subCommand === 'acelerar') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Apenas o Deus do Tempo pode usar isso.";
                    }
                    return await this.pescariaHandler.acelerarIscasGlobais(tag);
                }

                if (subCommand === 'loja') {
                    return await this.pescariaHandler.getLoja(ctx.sender, tag);
                }

                if (subCommand === 'comprar') {
                    const itemCode = args[2];
                    return await this.pescariaHandler.comprarItem(ctx.sender, tag, itemCode);
                }
                
                if (subCommand === 'vender') {
                    if (args[2]?.toLowerCase() === 'lixo') {
                        return await this.pescariaHandler.handleVenderLixo(ctx.sender, tag, netGroupId, ctx.sock);
                    }
                    
                    if (args[2]?.toLowerCase() === 'repetidos' || args[2]?.toLowerCase() === 'repetido') {
                        return await this.pescariaHandler.handleRepetidos(ctx.sender, tag, 'vender', netGroupId, ctx.sock);
                    }
                    
                    const itemCodes = args.slice(2).join(' ');
                    return await this.pescariaHandler.handleVender(ctx.sender, tag, itemCodes, netGroupId, ctx.sock);
                }

                if (subCommand === 'valor' || subCommand === 'avaliar' || subCommand === 'patrimonio') {
                    return await this.pescariaHandler.avaliarEstoque(ctx.sender, tag);
                }

                if (subCommand === 'trofeus') {
                    return await this.pescariaHandler.getTrofeusGrupo(netGroupId, tag);
                }
                if (subCommand === 'ranking') {
                    return await this.pescariaHandler.getRanking(netGroupId, tag);
                }
                if (subCommand === 'topgrupo') {
                    return await this.pescariaHandler.getTopGrupoPorRaridade(netGroupId, tag);
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

                if (subCommand === 'titulo' || subCommand === 'titulos') {
                    const action = args[2]?.toLowerCase();
                    const param = args[3];
                    return await this.pescariaHandler.handleTitulosPesca(ctx.sender, tag, action, param);
                }

                return `${tag}🎣 **SISTEMA DE PESCA**\n\nOpções:\n🎣 *!pescar* (Joga a isca!)\n🏪 *!pescaria loja* (Compre Iscas, Buffs e Varas!)\n🚢 *!pescaria comprar barco* (Aumente sua frota!)\n⚖️ *!pescaria vender* (Mercadão de peixes)\n♻️ *!pescaria vender lixo* (Recicla as sucatas)\n📦 *!pescaria vender repetidos* (Limpa as sobras do isopor)\n🎒 *!pescaria perfil* (Iscas, Frota e Efeitos)\n🏆 *!pescaria ranking* (Top pescadores)\n🦈 *!pescaria trofeus* (10 maiores deste grupo)\n🏅 *!pescaria toppessoal* (Seus troféus absolutos)\n🌍 *!pescaria topgrupo* (A Elite das Águas)\n📊 *!pescaria avaliar* (Calcula a fortuna no isopor)\n👑 *!pescaria titulo* (Ostente seu império)\n`;
            },
            '!parque': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();

                const netGroupId = await this.getNetGroupId(ctx.from);

                if (subCommand === 'fixcolormult') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Apenas o Dr. Henry Wu pode brincar de Deus e reescrever o DNA.";
                    }
                    return await this.parqueHandler.fixColorMultipliers(tag);
                }

                if (subCommand === 'fixhibridos') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Apenas o Dr. Henry Wu pode forçar a evolução da espécie.";
                    }
                    return await this.parqueHandler.fixHibridosGlobais(tag, ctx.sock);
                }

                if (subCommand === 'titulo' || subCommand === 'titulos') {
                    const params = args.slice(2).join(' ');
                    return await this.parqueHandler.handleTitulosParque(ctx.sender, tag, params);
                }
                if (subCommand === 'despensa' || subCommand === 'comida') {
                    return await this.parqueHandler.listarComida(ctx.sender, tag);
                }

                if (subCommand === 'alimentar') {
                    return await this.parqueHandler.alimentarDino(ctx.sender, tag, netGroupId, args[2], args[3]);
                }

                if (subCommand === 'mural' || subCommand === 'lista') {
                    return await this.parqueHandler.verParqueGlobal(netGroupId, tag, args[2], this.pokemonHandler);
                }

                if (subCommand === 'perfil') {
                    return await this.parqueHandler.verPerfilParque(ctx.sender, tag);
                }

                if (subCommand === 'mochila') {
                    return await this.parqueHandler.verMochila(ctx.sender, tag);
                }

                if (subCommand === 'missoes' || subCommand === 'missões' || subCommand === 'conquistas') {
                    return await this.parqueHandler.verMissoesGlobais(netGroupId, tag, args[2]);
                }

                if (subCommand === 'vender') {
                    const param = args[2]?.toLowerCase();
                    const qtd = args[3];
                    return await this.parqueHandler.venderMinerais(ctx.sender, tag, param, qtd);
                }

                if (subCommand === 'fixnicknames') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Apenas o A InGen tem a chave do cartório central.";
                    }
                    return await this.parqueHandler.fixNicknamesGlobais(tag);
                }

                if (subCommand === 'apelido' || subCommand === 'nome') {
                    return await this.parqueHandler.handleApelidoDino(ctx.sender, tag, netGroupId, args[2], args.slice(3));
                }

                if (subCommand === 'porcionar' || subCommand === 'cortar' || subCommand === 'picar') {
                    return await this.parqueHandler.porcionarComida(ctx.sender, tag, args[2], args[3]);
                }

                if (subCommand === 'reserva' || subCommand === 'estoque') {
                    return await this.parqueHandler.verReservaGlobal(netGroupId, tag);
                }

                if (subCommand === 'depositar' || subCommand === 'doar') {
                    if (args[2]?.toLowerCase() === 'repetidos' || args[2]?.toLowerCase() === 'repetido') {
                        return await this.pescariaHandler.handleRepetidos(ctx.sender, tag, 'depositar', netGroupId);
                    }

                    return await this.parqueHandler.depositarComida(ctx.sender, tag, netGroupId, args[2], args[3]);
                }

                return `${tag}🦖 **JURASSIC BOSTOPARK** 🦖\n\n` +
                       `⛏️ *!escavar* (Ache minérios ou Âmbar!)\n` +
                       `🍗 *!parque alimentar [ID] reserva* (Usa a comida coletiva)\n` +
                       `🚚 *!parque depositar [ID_Despensa] [tudo]* (Doe comida!)\n` +
                       `🥩 *!parque despensa* (Veja seus peixes comestíveis)\n` +
                       `🎯 *!parque missoes* (Metas da Temporada!)\n` +
                       `🎒 *!parque mochila* (Veja suas pedras)\n` +
                       `🖼️ *!parque mural* (Veja os dinossauros do grupo)\n` +
                       `🏷️ *!parque nome [ID] [Nome]* (Batize seu dino!)\n`+
                       `🧬 *!parque perfil* (Sua coleção e ticket gerado)\n` +
                       `🔪 *!parque porcionar [ID_Despensa] [Kg]* (Fatie a carne!)\n` +
                       `🏢 *!parque reserva* (Veja o estoque do Grupo)\n` +
                       `👑 *!parque titulo [pai/mae/nazare] [ID]* (Guarda compartilhada!)\n` +
                       `🤝 *!parque vender [numero/tudo]* (Venda os minérios)\n`;

            },
            '!escavar': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const netGroupId = await this.getNetGroupId(ctx.from); 
                return await this.parqueHandler.handleEscavar(ctx.sender, tag, ctx.name, netGroupId);
            },
            '!fazenda': async (ctx) => {
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const args = ctx.command.trim().split(/\s+/);
                const subCommand = args[1]?.toLowerCase();                
                const clima = await this.getClimaUsuario(ctx.sender); 

                const netGroupId = await this.getNetGroupId(ctx.from);

                if (!subCommand || subCommand === 'perfil' || subCommand === 'ver') {
                    return await this.fazendaHandler.verFazenda(ctx.sender, tag, args[2]);
                }

                if (subCommand === 'loja') {
                    return await this.fazendaHandler.getLoja(ctx.sender, tag);
                }
                if (subCommand === 'plantar') {
                    return await this.fazendaHandler.plantar(ctx.sender, tag, args[2], clima);
                }
                if (subCommand === 'regar' || subCommand === 'agua') {
                    return await this.fazendaHandler.regar(ctx.sender, tag, args[2], clima);
                }
                if (subCommand === 'colher') {
                    return await this.fazendaHandler.colher(ctx.sender, tag, args[2], netGroupId, clima, ctx.sock);
                }
                if (subCommand === 'trofeus' || subCommand === 'recordes') {
                    return await this.fazendaHandler.getTrofeusGrupo(netGroupId, tag);
                }
                if (subCommand === 'despensa' || subCommand === 'armazem') {
                    return await this.fazendaHandler.verArmazem(ctx.sender, tag);
                }
                if (subCommand === 'vender') {
                    return await this.fazendaHandler.vender(ctx.sender, tag, args[2]);
                }
                if (subCommand === 'comprar') {
                    return await this.fazendaHandler.comprarUpgrade(ctx.sender, tag, args[2]);
                }
                if (subCommand === 'compostar' || subCommand === 'adubo') {
                    const paramStr = args.slice(2).join(' ');
                    return await this.fazendaHandler.compostar(ctx.sender, tag, paramStr);
                }
                if (subCommand === 'adubar') {
                    return await this.fazendaHandler.adubar(ctx.sender, tag, args[2]);
                }

                return `${tag}🚜 **BOSTOFAZENDA** 🚜\n\n` +
                       `💩 *!fazenda compostar [qtd]* (Moe 10kg de peixe = 1 Adubo)` +
                       `🪴 *!fazenda adubar [canteiro]* (Gasta energia OU 1 adubo = +50% Peso)` +
                       `🌱 *!fazenda plantar [semente]* (Planta no canteiro)\n` +
                       `💧 *!fazenda regar [nº_canteiro]* (Gasta 1 Suprimento, adianta 25%)\n` +
                       `🌾 *!fazenda colher [nº_canteiro]* (Colhe a safra final)\n` +
                       `🛠️ *!fazenda comprar [enxada/trator]* (Melhore sua produção!)\n`+
                       `🏪 *!fazenda loja* (Catálogo de sementes)\n` +
                       `🎒 *!fazenda despensa* (Veja seus vegetais)\n` +
                       `💰 *!fazenda vender [número/tudo]* (Venda e lucre!)\n` +
                       `🚜 *!fazenda perfil* (Veja o status das suas plantas)\n`;
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
        const netId = await this.getNetGroupId(from);
        const condition = netId !== from ? `id_conversa IN ('${from}', '${netId}')` : `id_conversa = '${from}'`;
        const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE ${condition}`;
        const result = await this.db.get(sqlQuery); 
        return result ? result.total : 0;
    }

    //Retorna mensagens do banco de dados para um certo remetente (pessoa ou grupo) com um limite
    async getMessagesByLimit(from, limit){
        const netId = await this.getNetGroupId(from);
        const condition = netId !== from ? `id_conversa IN (?, ?)` : `id_conversa = ?`;
        const params = netId !== from ? [from, netId, limit] : [from, limit];

        const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE ${condition} 
        AND conteudo NOT LIKE '*Resumo da conversa*%'
        ORDER BY timestamp DESC 
        LIMIT ?`;
        
        const messagesDb = await this.db.all(sqlQuery, params);
        if (!messagesDb || messagesDb.length === 0) return "";
        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).reverse().join('\n');
    }

    async executarWipeGlobal(sock) {
        console.log("🚨 [WIPE] INICIANDO PROTOCOLO DE WIPE GLOBAL...");
        
        const usuarios = await this.db.all("SELECT * FROM usuarios");
        let veteranosRecompensados = 0;

        for (const u of usuarios) {
            try {
                console.log(`\n⏳ [WIPE] Processando usuário: ${u.nome || u.id_usuario}`);
                
                const pescaData = u.pescaria_data ? JSON.parse(u.pescaria_data) : {};
                const fazendaData = await this.fazendaHandler.getFazendaData(u.id_usuario);
                const financasData = await this.casinoHandler.processFinancas(u.id_usuario);
                
                let parqueData = await this.getPlayerData(u.id_usuario);
                if (!parqueData) parqueData = { inventory: {} };
                if (!parqueData.inventory) parqueData.inventory = {};
                
                let descontoFazenda = 0;
                let buffPesca = 0;
                let bonusBostocoins = 0;

                if (fazendaData.canteiros && fazendaData.canteiros.length > 1) {
                    descontoFazenda = (fazendaData.canteiros.length - 1) * 0.075;
                }

                if (pescaData.inventory && pescaData.inventory.vara && pescaData.inventory.vara !== 'bambu') {
                    buffPesca = 0.05; 
                }

                const saldoAtual = u.bostocoins || 0;
                bonusBostocoins = Math.floor(saldoAtual * 0.05); 
                console.log(`   - 5% do Saldo de Bolso: 🪙 ${bonusBostocoins}`);
                
                let isoporLiquido = 0;
                try {
                    const { sellableArray } = await this.pescariaHandler.getSellableList(u.id_usuario);
                    if (sellableArray && sellableArray.length > 0) {
                        sellableArray.forEach(fish => isoporLiquido += fish.value);
                    }
                } catch (e) {
                    console.error(`   ❌ Erro ao avaliar isopor:`, e);
                }
                const bIsopor = Math.floor(isoporLiquido * 0.05);
                bonusBostocoins += bIsopor;
                console.log(`   - 5% do Isopor (Valor Total ${isoporLiquido}): 🪙 ${bIsopor}`);

                let valorArmazem = 0;
                if (fazendaData.armazem && fazendaData.armazem.length > 0) {
                    fazendaData.armazem.forEach(item => { 
                        valorArmazem += (item.weight || 0) * 2; 
                    });
                }
                const bArmazem = Math.floor(valorArmazem * 0.05);
                bonusBostocoins += bArmazem;
                console.log(`   - 5% do Armazém (Peso Total ${valorArmazem/2}kg): 🪙 ${bArmazem}`);

                let valorMinerios = 0;
                for (const [minId, qtd] of Object.entries(parqueData.inventory)) {
                    const mineralInfo = MINERAL_CATALOG.find(m => m.id === minId);
                    if (mineralInfo) {
                        valorMinerios += (mineralInfo.value * qtd);
                    }
                }
                const bMinerios = Math.floor(valorMinerios * 0.05);
                bonusBostocoins += bMinerios;
                if (valorMinerios > 0) console.log(`   - 5% das Minas (Valor Total ${valorMinerios}): 🪙 ${bMinerios}`);

                const canteirosOcupados = fazendaData.canteiros.filter(c => c.seedId !== null).length;
                const bPlantas = canteirosOcupados * 50;
                bonusBostocoins += bPlantas;
                if (canteirosOcupados > 0) console.log(`   - Reembolso Plantação (${canteirosOcupados} ocupados): +🪙 ${bPlantas}`);

                console.log(`   💰 TOTAL RESCISÃO: 🪙 ${bonusBostocoins}`);

                const recordeSeason = {
                    bostocoins_finais: saldoAtual,
                    peso_pescado: pescaData.total_weight || 0,
                    canteiros_finais: fazendaData.canteiros.length || 1,
                    data_wipe: new Date().toISOString()
                };

                let legadoUser = await this.db.get("SELECT * FROM legado_usuarios WHERE id_usuario = ?", [u.id_usuario]);
                let historicoCompleto = legadoUser ? JSON.parse(legadoUser.historico_json || '[]') : [];
                historicoCompleto.push(recordeSeason);

                await this.db.run(`
                    INSERT INTO legado_usuarios (id_usuario, desconto_fazenda, buff_sorte_pesca, historico_json) 
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(id_usuario) DO UPDATE SET 
                    desconto_fazenda = excluded.desconto_fazenda,
                    buff_sorte_pesca = excluded.buff_sorte_pesca,
                    historico_json = excluded.historico_json
                `, [u.id_usuario, Math.min(descontoFazenda, 0.5), buffPesca, JSON.stringify(historicoCompleto)]);

                parqueData.inventory = {};
                await this.savePlayerData(u.id_usuario, parqueData);

                const newPescaria = { suprimentos: 10, last_supply_regen: Math.floor(Date.now() / 1000), inventory: { vara: 'bambu', barco: null } };
                const newFinancas = {
                    investimento: { montante: 0, ultimo_rendimento: Math.floor(Date.now() / 1000) },
                    emprestimo: { devedor: 0 },
                    carreira: { nivel: 1, subnivel: 1, id_job: null },
                    last_bico: 0,
                    titulo: financasData.titulo || null 
                };

                await this.db.run(`
                    UPDATE usuarios 
                    SET bostocoins = ?, 
                        pescaria_data = ?, 
                        financas = ?,
                        last_trabalho = 0,
                        last_minhabosta = 0
                    WHERE id_usuario = ?
                `, [bonusBostocoins, JSON.stringify(newPescaria), JSON.stringify(newFinancas), u.id_usuario]);

                const defaultCanteiros = [{ id: 1, seedId: null, plantTime: 0, harvestTime: 0, regas: 0, adubado: false }];
                const defaultUpgrades = { enxada: 1, trator: 1, maxCanteiros: 1, adubos: 0 };
                
                await this.db.run(`
                    UPDATE fazenda_inventario 
                    SET canteiros = ?, upgrades = ?, armazem = '[]', trofeus = '{}'
                    WHERE id_usuario = ?
                `, [JSON.stringify(defaultCanteiros), JSON.stringify(defaultUpgrades), u.id_usuario]);

                if (bonusBostocoins > 0) veteranosRecompensados++;
                console.log(`✅ [WIPE] Usuário resetado com sucesso!`);

            } catch (error) {
                console.error(`❌ [WIPE FATAL] Erro ao limpar o usuario ${u.id_usuario}:`, error);
            }
        }

        console.log("\n🦖 [WIPE] NERFANDO OS DINOSSAUROS...");
        await this.db.run("UPDATE parque_dinossauros SET nivel = 1, xp_atual = 0, reserva_comida = 0");

        console.log("🏛️ [WIPE] ATUALIZANDO AS CONQUISTAS DOS GRUPOS...");
        const grupos = await this.db.all("SELECT DISTINCT group_id FROM parque_dinossauros");
        for (const grupo of grupos) {
            await this.db.run(`
                INSERT INTO legado_grupos (group_id, temporada_atual, nivel_receita, conquistas_json)
                VALUES (?, 2, 1, '{}')
                ON CONFLICT(group_id) DO UPDATE SET temporada_atual = temporada_atual + 1, nivel_receita = 1, conquistas_json = '{}'
            `, [grupo.group_id]);

            const estoque = await this.db.get("SELECT carne, vegetal FROM parque_estoque WHERE group_id = ?", [grupo.group_id]);
            if (estoque) {
                const carneLegado = Math.floor((estoque.carne || 0) * 0.05);
                const vegetalLegado = Math.floor((estoque.vegetal || 0) * 0.05);
                await this.db.run("UPDATE parque_estoque SET carne = ?, vegetal = ? WHERE group_id = ?", [carneLegado, vegetalLegado, grupo.group_id]);
            }
        }

        const msgApocalipse = `
🌌 **O BOSTOUROBOROS DEVOROU O TEMPO!** 🌌
_A Temporada acabou. Uma nova fenda temporal se abriu._

O Bostoverso foi resetado! Suas fazendas viraram pó, seus barcos afundaram e o dinheiro evaporou... Mas a experiência fica!

🏆 **O SEU LEGADO:**
💰 Você manteve **5%** do seu patrimônio final (Bolsa + Armazéns + Minérios) para não começar do zero!
🚜 Se você tinha muitos canteiros, ganhou um **Desconto Permanente** na loja agrícola desta season!
🎣 Suas varas passadas se tornaram instinto, te dando um **Buff Oculto de Sorte**!
🦖 **O Parque Sobreviveu!** Mas a InGen cortou a verba e os dinos resetaram pro nível 1. A bilheteria está pagando o mínimo. 

Usem \`!parque missoes\` para ver os marcos da comunidade. Trabalhem juntos para restaurar o lucro! Boa sorte na nova temporada! ⏳`;

        for (const grupo of grupos) {
            try {
                if (sock) {
                    await sock.sendMessage(grupo.group_id, { text: msgApocalipse });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (e) {
                console.error(`Erro ao avisar o grupo ${grupo.group_id} sobre o Wipe:`, e);
            }
        }

        console.log(`✅ [WIPE] PROCESSO CONCLUÍDO! ${veteranosRecompensados} jogadores reembolsados.`);
        return `✅ Wipe finalizado. ${veteranosRecompensados} jogadores receberam bônus de legado.`;
    }


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

    // TRADUTOR DE REDE PAI-FILHO
    async getNetGroupId(groupId) {
        try {
            const link = await this.db.get("SELECT id_pai FROM grupos_linkados WHERE id_filho = ?", [groupId]);
            return link ? link.id_pai : groupId;
        } catch (e) {
            return groupId;
        }
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
            
            this.registerMetric('ai_response').catch(()=>{});

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

    async generateBomDia(seedAleatoria) {
        const temas = [
            "fome extrema por humanos", "ódio matinal", "arrogância suprema", 
            "preguiça de existir", "vontade de morder o admin", "desprezo total", 
            "filosofia de boteco", "sarcasmo nível máximo", "caos e destruição", 
            "tédio absoluto", "capitalismo selvagem", "crise existencial jurássica"
        ];
        const tema = temas[Math.floor(Math.random() * temas.length)];

        const prompt = `Você é o Bostossauro, um dinossauro híbrido arrogante, sarcástico e rabugento de um bot de WhatsApp.
        [ID de Aleatoriedade para não repetir cache: ${seedAleatoria}]
        
        O seu humor agora é: ${tema}.
        
        Crie UMA frase curta de bom dia para o grupo baseada nesse humor.
        A frase DEVE OBRIGATORIAMENTE começar com "Bom dia, grupo! 🦖 ".
        Depois disso, adicione apenas UMA frase curta (máximo 15 palavras) expressando esse humor.
        NÃO use aspas na resposta. Seja criativo, imprevisível e NUNCA repita a frase anterior.`;
        
        try {
            const response = await this.genAI.models.generateContent({
                model: "gemma-3-27b-it", 
                contents: prompt,
                config: { temperature: 0.95 }
            });
            
            let texto = response.text || (response.response ? response.response.text() : "");
            texto = texto.trim();
            
            if (!texto.startsWith("Bom dia, grupo! 🦖")) {
                 return `Bom dia, grupo! 🦖 ${texto}`;
            }
            
            return texto;
        } catch (e) {
            console.error("Erro ao gerar humor do Bostossauro:", e);
            return "Bom dia, grupo! 🦖 O Bostossauro acordou e escolheu a violência."; 
        }
    }

    // BUSCADOR DE CLIMA COM CACHE DE 1 HORA
    async getClimaUsuario(userId) {
        const user = await this.db.get("SELECT cidade FROM usuarios WHERE id_usuario = ?", [userId]);
        const cidade = user?.cidade || 'Santos';
        const now = Math.floor(Date.now() / 1000);

        const cache = await this.db.get("SELECT * FROM clima_cache WHERE cidade = ?", [cidade]);
        
        if (cache && (now - cache.timestamp < 3600)) {
            return { condicao: cache.condicao, emoji: cache.emoji, cidade: cidade };
        }

        console.log(`[CLIMA] Cache expirado/inexistente. Buscando clima para: ${cidade}`);
        const climaNovo = await getGameWeatherCondition(cidade);
        
        if (climaNovo.failed) {
            console.log(`[CLIMA] ⚠️ Falha na API para ${cidade}. Acionando protocolo de emergência.`);
            
            if (cache) {
                const quinzeMinutosCooldown = now - 2700; 
                await this.db.run("UPDATE clima_cache SET timestamp = ? WHERE cidade = ?", [quinzeMinutosCooldown, cidade]);
                
                return { condicao: cache.condicao, emoji: cache.emoji, cidade: cidade };
            } else {
                const quinzeMinutosCooldown = now - 2700;
                await this.db.run(`
                    INSERT INTO clima_cache (cidade, condicao, emoji, timestamp) 
                    VALUES (?, 'nublado', '☁️', ?)`,
                    [cidade, quinzeMinutosCooldown]
                );
                return { condicao: 'nublado', emoji: '☁️', cidade: cidade };
            }
        }

        await this.db.run(`
            INSERT INTO clima_cache (cidade, condicao, emoji, timestamp) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(cidade) DO UPDATE SET condicao = ?, emoji = ?, timestamp = ?`,
            [cidade, climaNovo.condicao, climaNovo.emoji, now, climaNovo.condicao, climaNovo.emoji, now]
        );

        return { condicao: climaNovo.condicao, emoji: climaNovo.emoji, cidade: cidade };
    }

    // INTERRUPÇÃO ALEATÓRIA DO BOSTOSSAURO
    async handleBostossauroInterrupt(from, sender, name, texto) {
        if (Math.random() > 0.002) return null;

        const netId = await this.getNetGroupId(from);
        
        const temBostossauro = await this.db.get("SELECT id FROM parque_dinossauros WHERE group_id = ? AND especie_id = 'bostossauro'", [netId]);
        if (!temBostossauro) return null;

        const contexto = await this.getMessagesByLimit(from, 5);

        const prompt = `Você é o Bostossauro, o dinossauro híbrido supremo, carnificina pura e rei do Jurassic BostoPark.
        Você foi criado por este grupo e vive no cercado deles. 
        Sua personalidade: Arrogante, comilão, rabugento e acha os humanos criaturas inferiores.
        Você adora se meter nas conversas do WhatsApp para dar pitacos não solicitados, reclamar de fome ou julgar o que estão falando.
        
        Aqui está o contexto da conversa agora:
        ${contexto}
        
        O usuário "${name}" acabou de enviar: "${texto}"
        
        Sua missão: Interrompa a conversa! Dê uma resposta curta (1 a 2 parágrafos).
        Critique o que foi dito, dê um conselho terrível, ou apenas exija que alguém vá pescar carne pra você.
        Aja totalmente no personagem. Use emojis de dinossauro (🦖, 🥩, 👑). Não seja educado. Aja com desdém de predador alfa.`;

        try {
            console.log("🦖 [BOSTOSSAURO] O Rei acordou para dar pitaco na conversa!");
            return await this.getAiResponse(from, sender, name, true, "!bostossauro_interrupt", prompt, "gemma-3-27b-it");
        } catch (e) {
            console.error("❌ Erro no despertar do Bostossauro:", e);
            return null;
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

    // LOJA VIP (MERCADO NEGRO DE IA)
    async handleVipStore(ctx) {
        const tag = await this.pokemonHandler.getUserTag(ctx.sender);
        const args = ctx.command.trim().split(/\s+/);
        const subCommand = args[1]?.toLowerCase();

        const VIP_ITEMS = {
            '1': { name: 'Bypass Jurássico', desc: 'Reduz seu uso diário de IA em -1.', price: 1000, effect: 1 },
            '2': { name: 'Overclock Cerebral', desc: 'Reduz seu uso diário de IA em -5.', price: 4000, effect: 5 }
        };

        const userDb = await this.db.get("SELECT bostocoins, uso_ia_diario FROM usuarios WHERE id_usuario = ?", [ctx.sender]);
        const saldo = userDb ? userDb.bostocoins : 0;
        let usoAtual = userDb ? userDb.uso_ia_diario : 0;

        if (subCommand === 'comprar') {
            const itemId = args[2];
            if (!VIP_ITEMS[itemId]) return `${tag}❌ Código inválido. Use *!vip* para ver a loja.`;
            
            const item = VIP_ITEMS[itemId];
            
            if (saldo < item.price) return `${tag}💸 Vai achando que IA cresce em árvore! Você precisa de 🪙 ${item.price} Bostocoins.`;
            if (usoAtual <= 0) return `${tag}🧠 Seu cérebro já está 100% livre! Você não tem cota de IA para reduzir hoje. Vá gastar com isca!`;

            const reduceAmount = Math.min(usoAtual, item.effect);
            
            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ?, uso_ia_diario = uso_ia_diario - ? WHERE id_usuario = ?", [item.price, reduceAmount, ctx.sender]);
            
            return `${tag}💎 **COMPRA VIP REALIZADA!**\nVocê comprou o *${item.name}*!\nSua cota de IA caiu de ${usoAtual} para **${usoAtual - reduceAmount}**.\nPode voltar a perturbar o GPT!`;
        }

        let msg = `${tag}💎 **LOJA VIP (Mercado Negro de IA)** 💎\n_Seu saldo: 🪙 ${saldo} | Uso de IA hoje: 🧠 ${usoAtual}/${this.DAILY_AI_LIMIT}_\n\n`;
        for (const [id, item] of Object.entries(VIP_ITEMS)) {
            msg += `*[ ${id} ]* **${item.name}** ➝ 🪙 ${item.price}\n_${item.desc}_\n\n`;
        }
        msg += `🛒 Para comprar: *!vip comprar [numero]*`;
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
            const netId = await this.getNetGroupId(from);
            const condition = netId !== from ? `id_conversa IN ('${from}', '${netId}')` : `id_conversa = '${from}'`;

            const pergunta = command.slice(8).trim()
            const selectPrompt = `Você é um gerador de consulta SQL para SQLite. Sua única saída deve ser uma consulta SQL (SELECT), sem NENHUMA explicação ou texto adicional.
            A tabela é 'mensagens' e o campo de tempo é 'timestamp' (UNIX time em segundos).
            Use a condição WHERE para filtrar rigorosamente por ${condition} E pelo intervalo de tempo (timestamp).
            O usuário quer recuperar mensagens que se encaixam no período de tempo da pergunta, limitando o resultado a 500 mensagens no máximo.
            Recupere as colunas 'nome_remetente' e 'conteudo'.
            A ordenação deve ser por timestamp DESC, e o limite deve ser de 200. Se a pergunta não especificar um período de tempo, recupere as últimas 200 mensagens da conversa.

            Exemplo de saída para "o que rolou ontem": SELECT nome_remetente, conteudo FROM mensagens WHERE id_conversa = '${from}' AND timestamp BETWEEN 1764355200 AND 1764441600 ORDER BY timestamp DESC LIMIT 200;

            Pergunta do usuário: ${pergunta}`

            let sqlQuery = await this.getAiResponse(from, sender, name, isGroup, command, selectPrompt, "gemini-2.5-flash")

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
        return `📍 *MENU RÁPIDO (v5.1 - A Ameaça Híbrida)* \n\n
        🆘 !ajuda (ou !help)\n
        🗣️ !audio\n
        🎰 !cassino\n
        📍 !cidade\n
        🌡️ !clima\n
        💵 !cotacao\n
        🎲 !d{número}\n
        🗣️ !falador\n
        🚜 !fazenda (AGRONEGÓCIO BETA)\n
        🤖 !gpt {texto}\n
        🧠 !lembrar\n
        🎮 !lol\n
        📄 !menu\n
        ✏️ !notas\n
        🦖 !parque (JURASSIC BOSTOPARK)\n
        📙 !pdf\n
        🎣 !pescaria (SISTEMA DE PESCA)\n
        💸 !pix\n
        🎮 !poke (JOGO POKÉMON)\n
        🖼️ !s (ou !sticker)\n
        🛎️ !resumo\n
        💼 !trabalhar\n
        ☢️ !toxico\n
        🧐 !tradutor
        \n\nPara detalhes, digite: *!ajuda [comando]*`;
    }

    // O Dossiê Confidencial da InGen
    async handleNotas(userId, userTag) {
        try {
            const user = await this.db.get("SELECT anotacoes FROM usuarios WHERE id_usuario = ?", [userId]);
            
            if (!user || !user.anotacoes || user.anotacoes.trim() === '') {
                return `${userTag} 📝 **FICHA LIMPA (OU IRRELEVANTE)**\n\nEu vasculhei meus arquivos e não encontrei nenhuma anotação sobre você. Pelo visto, você ainda não fez nada digno de entrar no meu radar de fofocas.`;
            }

            return `${userTag} 📝 **DOSSIÊ CONFIDENCIAL DO BOSTOSSAURO:**\n\n${user.anotacoes}\n\n_Isso é o que eu penso de você. Tente não chorar._`;
        } catch (e) {
            console.error("Erro ao buscar notas do usuário:", e);
            return `${userTag} ❌ Erro ao acessar os arquivos do pentágono.`;
        }
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

    async handleClimaCommand(text, sender) {       
        let cleanText = text.replace(/^!clima\s*/i, '').trim();
        let targetCity = cleanText;
        let isTomorrow = false;

        if (cleanText.toLowerCase().endsWith('amanhã')) {
            targetCity = cleanText.replace(/amanhã$/i, '').trim();
            isTomorrow = true;
        } else if (cleanText.toLowerCase().endsWith('hoje')) {
            targetCity = cleanText.replace(/hoje$/i, '').trim();
        }

        if (!targetCity) {
            const user = await this.db.get("SELECT cidade FROM usuarios WHERE id_usuario = ?", [sender]);
            targetCity = user?.cidade || 'Santos';
        }

        if (isTomorrow) {
            return await weatherCommandHandler.getNextDayForecast(targetCity);
        } else {
            return await weatherCommandHandler.getWeather(targetCity);
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
            this.registerMetric('command', rootCommand).catch(()=>{});

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

    // === API DO DASHBOARD ===
    async getDashboardDataAPI() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            let metricasHoje = await this.db.get("SELECT * FROM metricas_diarias WHERE data = ?", [today]);
            if (!metricasHoje) {
                metricasHoje = { comandos_totais: 0, respostas_ia: 0, mensagens_lidas: 0, comando_mais_usado: '{}' };
            }

            const pibInfo = await this.db.get("SELECT SUM(bostocoins) as pib FROM usuarios");
            const pib = pibInfo && pibInfo.pib ? pibInfo.pib : 0;

            const ricos = await this.db.all("SELECT nome, bostocoins FROM usuarios ORDER BY bostocoins DESC LIMIT 5");

            return {
                status: "success",
                date: today,
                metrics: {
                    messages_read: metricasHoje.mensagens_lidas,
                    total_commands: metricasHoje.comandos_totais,
                    ai_responses: metricasHoje.respostas_ia,
                    commands_breakdown: JSON.parse(metricasHoje.comando_mais_usado || '{}')
                },
                economy: {
                    total_pib: pib,
                    top_richest: ricos
                }
            };
        } catch (e) {
            console.error("Erro ao gerar JSON do Dashboard:", e);
            return { status: "error", message: e.message };
        }
    }
}

module.exports = ChatModel;