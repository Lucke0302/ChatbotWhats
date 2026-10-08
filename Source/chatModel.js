const usage = require('./usageControl');
const crypto = require('crypto');
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
const ResenhaCommand = require('./resenhaCommand');
const CasinoHandler = require('./casinoHandler');
const PescariaHandler = require('./pescariaHandler');
const {ParqueHandler} = require('./parqueHandler');
const { FazendaHandler } = require('./fazendaHandler');
const { withTransaction, debitarSaldo } = require('./dbHelper');
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

        // 🧠 [FASE 5 - MICRO-CACHE] `getModelUsage()` é chamado a CADA requisição
        // de IA (roteador do Gemini) e também pelo dashboard de cotas. Cachear por
        // 60s elimina dezenas de SELECTs por minuto no SQLite da VM de 1GB.
        this.modelUsageCache = null;
        this.MODEL_USAGE_CACHE_TTL_MS = 60 * 1000;

        // 🧹 [FASE 5 - TTL DE MEMÓRIA] Cooldowns efêmeros. Declarados aqui (e não
        // depois do updateOnlineStatus) porque o construtor dispara uma leitura
        // assíncrona de uso antes do fim do bloco.
        this.spamCooldowns = new Map(); 
        this.SPAM_COOLDOWN_TTL_MS = 10 * 60 * 1000;
        this.tokenCooldowns = new Map();
        this.TOKEN_COOLDOWN_MS = 60 * 1000;
        this.SPAM_DELAY_SECONDS = 10;
        this.DAILY_AI_LIMIT = 10;
        this.DAILY_LIMIT_GEMMA = 100;
        this.modelLimits = {
            "gemma-4-31b-it": 1400,
            "gemma-4-26b-a4b-it": 1400,
            "gemini-flash-lite-latest": 450,
            "gemini-3.1-flash-lite-preview": 450,

            "gemini-2.5-flash": 20,
            "gemini-3-flash-preview": 20,
            "gemini-2.5-flash-lite": 20,
            "gemini-flash-latest": 20
        };
        this.updateOnlineStatus();
        // 🛡️ init() é idempotente (guard interno no lolCommand.js):
        // como o ChatModel é recriado a cada reconexão do Baileys, o guard
        // impede que um novo timer diário da Riot API seja acumulado.
        lolCommandHandler.init();
        this.toxicHandler = new ToxicHandler(db);
        this.pokemonHandler = new PokemonHandler(db);
        this.pokemonHandler.init();
        this.pokeRouter = new PokeRouter(db);
        this.initializeCommandHandlers();
        this.resenhaCommand = new ResenhaCommand(this.db, this.genAI);
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
        const agora = Date.now();
        const cache = this.modelUsageCache;

        // 🧠 [FASE 5 - MICRO-CACHE] 60s de validade e invalidação automática na
        // virada do dia (o `today` faz parte da chave de cache).
        if (cache && cache.today === today && cache.expiresAt > agora) {
            return cache.data;
        }

        const rows = await this.db.all(`SELECT model_name, quantidade FROM system_usage WHERE data_uso = ?`, [today]);
        const usage = {};
        if (rows) {
            rows.forEach(r => {
                usage[r.model_name] = r.quantidade;
            });
        }

        this.modelUsageCache = {
            today,
            data: usage,
            expiresAt: Date.now() + this.MODEL_USAGE_CACHE_TTL_MS
        };

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

        // Escrita invalida o micro-cache: o próximo roteamento enxerga o número real.
        this.modelUsageCache = null;
    }

    // 🧹 [FASE 5 - TTL DE MEMÓRIA] Varredura das estruturas efêmeras do cérebro.
    // Chamada pelo varredor periódico Singleton do index.js (a cada 30 min) e
    // também de forma preguiçosa nos pontos de acesso mais quentes.
    limparMemoriasExpiradas() {
        const agora = Date.now();

        for (const [chave, timestamp] of this.spamCooldowns) {
            if (agora - timestamp > this.SPAM_COOLDOWN_TTL_MS) this.spamCooldowns.delete(chave);
        }

        for (const [chave, timestamp] of this.tokenCooldowns) {
            // O dobro do cooldown já é suficiente para o expurgo (não há histórico).
            if (agora - timestamp > (this.TOKEN_COOLDOWN_MS * 2)) this.tokenCooldowns.delete(chave);
        }

        // Delega a limpeza para os handlers que mantêm sessões interativas.
        if (this.parqueHandler && typeof this.parqueHandler.limparEscavacoesExpiradas === 'function') {
            this.parqueHandler.limparEscavacoesExpiradas();
        }
        if (this.pokemonHandler && typeof this.pokemonHandler.limparTradeSessionsExpiradas === 'function') {
            this.pokemonHandler.limparTradeSessionsExpiradas();
        }
    }

    initializeCommandHandlers() {
        this.commandHandlers = {
            '!timeout': async (ctx) => {
                return await this.handleTimeoutCommand(ctx.name, ctx.command, ctx.sender, ctx.isGroup, ctx.mentions);
            },
            '!link': async (ctx) => {
                const admins = ["5513991008854@s.whatsapp.net", "lucke0302@twitch.net"];
                if (!admins.includes(ctx.sender)) return "🚫 Apenas o arquiteto da Matrix pode unir dimensões.";
                
                const args = ctx.command.trim().split(/\s+/);
                if (args.length < 2) return "⚠️ Uso: *!link [id_do_grupo_pai]*\n_(Use !id no grupo principal para pegar o código)_";
                
                const parentId = args[1];
                
                if (!ctx.isGroup && ctx.platform !== 'twitch') return "⚠️ Este comando deve ser usado dentro do grupo (ou live) que será o *filho*.";
                
                if (parentId === ctx.from) return "⚠️ Você não pode linkar o lugar nele mesmo, gênio.";

                await this.db.run("INSERT OR REPLACE INTO grupos_linkados (id_filho, id_pai) VALUES (?, ?)", [ctx.from, parentId]);
                
                const nomeFilial = ctx.platform === 'twitch' ? 'Esta live' : 'Este grupo';
                return `🔗 **LINK DIMENSIONAL ESTABELECIDO!**\n${nomeFilial} agora é uma filial da matriz (\`${parentId}\`).\nA IA, o Cassino, o Parque e a moderação agora compartilham a mesma linha do tempo!`;
            },

            '!unlink': async (ctx) => {
                const admins = ["5513991008854@s.whatsapp.net", "lucke0302@twitch.net"];
                if (!admins.includes(ctx.sender)) return "🚫 Acesso negado.";
                
                const result = await this.db.run("DELETE FROM grupos_linkados WHERE id_filho = ?", [ctx.from]);
                
                if (result.changes === 0) return "⚠️ Nenhuma conexão encontrada. Este lugar já estava isolado.";

                const nomeFilial = ctx.platform === 'twitch' ? 'Esta live' : 'Este grupo';
                return `💔 **LINK QUEBRADO.** ${nomeFilial} voltou a ser independente e isolado.`;
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
                                await ctx.sendTo(grupo.group_id, "⏳ Iniciando colapso temporal... O BostOuroboros está despertando.");
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
                    await ctx.reply("⏳ Rodando 20 simulações de humor do Bostossauro... aguenta aí que o bicho tá pensando.");
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
            '!gerartoken': async (ctx) => {
                if (ctx.platform !== 'whatsapp') return "❌ Gere o token pelo WhatsApp!";

                // 🛡️ [FASE 5 - ANTI-SPAM] Limitador por usuário: geração de token
                // escreve no SQLite e nunca deveria ser um comando de mão livre.
                const agora = Date.now();
                const ultimaGeracao = this.tokenCooldowns.get(ctx.sender) || 0;
                const decorrido = agora - ultimaGeracao;

                if (decorrido < this.TOKEN_COOLDOWN_MS) {
                    const espera = Math.ceil((this.TOKEN_COOLDOWN_MS - decorrido) / 1000);
                    return `⏳ Calma, ${ctx.name}! Você já gerou um token agora há pouco.\nTente novamente em *${espera}s*.`;
                }
                this.tokenCooldowns.set(ctx.sender, agora);

                const token = this.gerarTokenSeguro();
                const expira = Date.now() + (10 * 60 * 1000); 
                
                await this.db.run(
                    "INSERT OR REPLACE INTO tokens_vinculo (token, id_whatsapp, expira_em) VALUES (?, ?, ?)",
                    [token, ctx.sender, expira]
                );
                
                return `🔐 *SEU TOKEN DE CROSS-SAVE:* \n\n*${token}*\n\nVá no chat da Twitch em até 10 minutos e digite:\n*!vincular ${token}*`;
            },
            '!vincular': async (ctx) => {
                if (ctx.platform !== 'twitch' && ctx.platform !== 'discord') {
                    return "❌ Esse comando deve ser usado no chat da Twitch ou no Discord!";
                }
                
                const args = ctx.command.trim().split(/\s+/);
                const tokenDigitado = args[1]?.trim();
                if (!tokenDigitado) return "⚠️ Cadê o token? Use: !vincular [SEU_TOKEN]";

                // 🛡️ [FASE 5 - SEGURANÇA] Token misto (A-z0-9) exige busca NOCASE.
                const registro = await this.db.get("SELECT * FROM tokens_vinculo WHERE token = ? COLLATE NOCASE", [tokenDigitado]);
                if (!registro) return "❌ Token inválido ou não encontrado.";
                if (Date.now() > registro.expira_em) return "⏳ Esse token expirou! Gere outro no Zap.";

                try {
                    let vinculo = await this.db.get("SELECT * FROM contas_linkadas WHERE id_whatsapp = ?", [registro.id_whatsapp]);
                    
                    let id_twitch = vinculo ? vinculo.id_twitch : null;
                    let id_discord = vinculo ? vinculo.id_discord : null;

                    if (ctx.platform === 'twitch') id_twitch = ctx.sender;
                    if (ctx.platform === 'discord') id_discord = ctx.sender;

                    await this.db.run(
                        "INSERT OR REPLACE INTO contas_linkadas (id_whatsapp, id_twitch, id_discord) VALUES (?, ?, ?)",
                        [registro.id_whatsapp, id_twitch, id_discord]
                    );

                    // Queima o token pela chave EXATA gravada no banco.
                    await this.db.run("DELETE FROM tokens_vinculo WHERE token = ?", [registro.token]);
                    return `✅ **CROSS-SAVE ATIVADO!** Sua conta do ${ctx.platform.toUpperCase()} foi vinculada ao WhatsApp.`;

                } catch (e) {
                    console.error("Erro no vínculo:", e);
                    return "❌ Erro interno ao salvar seu vínculo. Avise o admin.";
                }
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
                return await pdfCommandHandler.handlePdfCommand(ctx);
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
                return await this.pokemonHandler.handleCommand(ctx.from, ctx.sender, ctx.command, ctx, ctx.mentions);
            },
            '!poke2': async (ctx) => {
                const replyFunction = async (content) => {
                    if (!ctx.sock) return content; 
                    if (typeof content === 'string') {
                        await ctx.reply(content);
                    } 
                    else {
                        await ctx.replyImage(content.image.url, content.caption);
                    }
                };
                await this.pokeRouter.handleCommand(ctx.from, ctx.sender, ctx.command, ctx.sock, ctx.mentions, replyFunction);
                
                return null;
            },
            '!id': async (ctx) => {
                await ctx.reply(`🆔 O ID desta dimensão é: ${ctx.from}`);
                return null;
            },
            '!migrar': async (ctx) => {
                if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                    return "🔒 *Acesso Negado.* Só o chefe pode fazer o êxodo.";
                }
                return await migrationCommandHandler.handleMigrationCommand(ctx);
            },
            '!help': async (ctx) => this.handleHelp(ctx),
            '!ajuda': async (ctx) => this.handleHelp(ctx),
            '!resenha': async (ctx) => {
                return await this.resenhaCommand.execute(ctx);
            },
            '!cota': async (ctx) => {
                return await this.handleCotaCommand(ctx);
            },
            '!bluesky': async (ctx) => {
                if (ctx.sender !== "5513991008854@s.whatsapp.net") return "🚫 Só o dono do zoológico vê os pensamentos do dino.";
                
                const args = ctx.command.split(' ');
                const subCommand = args[1]?.toLowerCase();

                if (!subCommand || subCommand === 'status' || subCommand === 'lista') {
                    const pensamentos = await this.db.all("SELECT * FROM pensamentos_bot WHERE status = 'avaliado' ORDER BY nota_tweet DESC");
                    
                    if (pensamentos.length === 0) return "🧊 **GELADEIRA VAZIA.** O Bostossauro não pensou em nada relevante (Nota > 6) ultimamente.";

                    let msg = `🦋 **PENSAMENTOS NA FILA (GELADEIRA)** 🦋\n\n`;
                    pensamentos.forEach((p, i) => {
                        msg += `*[ ${i + 1} ]* **Nota:** ${p.nota_tweet} | **ID:** \`${p.id.substring(0,8)}\`\n`;
                        msg += `💭 _"${p.contexto.substring(0, 100)}..."_\n\n`;
                    });
                    msg += `💡 Use \`!bluesky postar [id]\` para forçar um surto instantâneo.`;
                    return msg;
                }

                if (subCommand === 'postar' || subCommand === 'force') {
                    const idParcial = args[2];
                    const pensamento = await this.db.get("SELECT * FROM pensamentos_bot WHERE id LIKE ?", [`${idParcial}%`]);

                    if (!pensamento) return "❌ Pensamento não encontrado.";

                    await ctx.reply("🚀 Forçando postagem no BlueSky... aguenta aí.");
                    const temas = JSON.parse(pensamento.temas || '[]');
                    
                    const sucesso = await this.blueskyBrain.gerarEPostar(pensamento.id, pensamento.contexto, pensamento.humor_origem, pensamento.timestamp_evento, temas);
                    
                    if (sucesso) {
                        return "✅ Postado e removido da geladeira com sucesso!";
                    } else {
                        return "❌ A API do BlueSky falhou 3x. O pensamento voltou pra geladeira, tenta de novo depois.";
                    }
                }
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
                    return await this.casinoHandler.playSlots(ctx.sender, tag, bet, netGroupId, ctx);
                }
                if (subCommand === 'cara' || subCommand === 'coroa') {
                    const bet = parseInt(args[2]);
                    return await this.casinoHandler.playCoinflip(ctx.sender, tag, subCommand, bet, netGroupId, ctx);
                }
                if (subCommand === 'roleta') {
                    const color = args[2]?.toLowerCase();
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playRoulette(ctx.sender, tag, color, bet, netGroupId, ctx);
                }

                if (subCommand === 'mega') {
                    if (args[2]?.toLowerCase() === 'apostadores') {
                        return await this.casinoHandler.getMegaBettors(tag);    
                    }
                    
                    const number = parseInt(args[2]);
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playMega(ctx.sender, tag, number, bet, netGroupId, ctx);
                }

                if (subCommand === 'bolao') {
                    if (args[2]?.toLowerCase() === 'apostadores') {
                        return await this.casinoHandler.getBolaoBettors(tag);
                    }

                    const number = parseInt(args[2]);
                    const bet = parseInt(args[3]);
                    return await this.casinoHandler.playBolao(ctx.sender, tag, number, bet, netGroupId, ctx);
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

                return await this.casinoHandler.handleGiveCoins(ctx.sender, tag, targetId, amountStr, ctx.from, ctx, excecoes);
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
                        return await this.pescariaHandler.handleVenderLixo(ctx.sender, tag, netGroupId, ctx.sock, ctx);
                    }
                    
                    if (args[2]?.toLowerCase() === 'repetidos' || args[2]?.toLowerCase() === 'repetido') {
                        return await this.pescariaHandler.handleRepetidos(ctx.sender, tag, 'vender', netGroupId, ctx.sock, ctx);
                    }
                    
                    const itemCodes = args.slice(2).join(' ');
                    return await this.pescariaHandler.handleVender(ctx.sender, tag, itemCodes, netGroupId, ctx.sock, ctx);
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

                if (subCommand === 'meteoro') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Apenas a própria Força da Natureza pode conjurar um meteoro.";
                    }
                    
                    const alvoGroupId = args[2];
                    if (!alvoGroupId) {
                        return `${tag} ⚠️ Você precisa especificar as coordenadas do impacto! Use: *!parque meteoro [id_do_grupo]*\n_(Dica: Vá no grupo e digite !id para pegar o código)_`;
                    }

                    return await this.parqueHandler.eventoMeteoroLocal(alvoGroupId, tag);
                }

                if (subCommand === 'fixhibridos') {
                    if (ctx.sender !== "5513991008854@s.whatsapp.net") {
                        return "🚫 Apenas o Dr. Henry Wu pode forçar a evolução da espécie.";
                    }
                    return await this.parqueHandler.fixHibridosGlobais(ctz, tag);
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
                const textoMensagem = ctx.msg.text || ctx.msg.body || ctx.msg.message?.conversation || ctx.msg.message?.extendedTextMessage?.text || "";
                const args = textoMensagem.trim().split(/\s+/);
                const escavarAction = args.slice(1).join(' ').trim(); 
                
                const tag = await this.pokemonHandler.getUserTag(ctx.sender);
                const netGroupId = await this.getNetGroupId(ctx.from); 
                
                return await this.parqueHandler.handleEscavar(ctx.sender, tag, ctx.name, netGroupId, escavarAction);
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
                    return await this.fazendaHandler.colher(ctx.sender, tag, args[2], netGroupId, clima, ctx.sock, ctx);
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

    // 🛡️ [FASE 5 - SEGURANÇA] Token de cross-save com entropia real (CSPRNG):
    // 8 caracteres sobre um alfabeto de 62 símbolos = ~47 bits de entropia
    // (o antigo `Math.random().substring(2,7)` tinha ~26 bits e era previsível).
    gerarTokenSeguro() {
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = crypto.randomBytes(8);
        let token = '';

        for (let i = 0; i < 8; i++) {
            token += alfabeto[bytes[i] % alfabeto.length];
        }

        return token;
    }

    checkSpam(sender, command = "") {
        if (sender === "5513991008854@s.whatsapp.net") {
            return; 
        }
        const now = Date.now();

        // 🧹 [FASE 5 - TTL DE MEMÓRIA] Expurgo preguiçoso: o Map de cooldowns não
        // pode crescer indefinidamente com usuários que nunca mais escrevem.
        if (this.spamCooldowns.size > 200) {
            for (const [chave, timestamp] of this.spamCooldowns) {
                if (now - timestamp > this.SPAM_COOLDOWN_TTL_MS) this.spamCooldowns.delete(chave);
            }
        }

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
        // 🛡️ [FASE 2 - SEGURANÇA] JIDs NUNCA são concatenados na SQL: o escape
        // é delegado ao SQLite via placeholder (?), matando SQL Injection por
        // `from`/`netId` (JID manipulado, grupo linkado malicioso, etc).
        const sameConversation = netId === from;
        const condition = sameConversation ? `id_conversa = ?` : `id_conversa IN (?, ?)`;
        const params = sameConversation ? [from] : [from, netId];

        const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE ${condition}`;
        const result = await this.db.get(sqlQuery, params); 
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
            
            let legadoGrupo = await this.db.get("SELECT * FROM legado_grupos WHERE group_id = ?", [grupo.group_id]);
            let historicoMissoes = legadoGrupo && legadoGrupo.historico_missoes ? JSON.parse(legadoGrupo.historico_missoes) : [];
            
            if (legadoGrupo && legadoGrupo.conquistas_json) {
                historicoMissoes.push({
                    temporada: legadoGrupo.temporada_atual || 1,
                    conquistas: JSON.parse(legadoGrupo.conquistas_json),
                    nivel_final: legadoGrupo.nivel_receita || 1
                });
            }

            await this.db.run(`
                INSERT INTO legado_grupos (group_id, temporada_atual, nivel_receita, conquistas_json, historico_missoes)
                VALUES (?, 2, 1, '{}', ?)
                ON CONFLICT(group_id) DO UPDATE SET 
                temporada_atual = temporada_atual + 1, 
                nivel_receita = 1, 
                conquistas_json = '{}',
                historico_missoes = excluded.historico_missoes
            `, [grupo.group_id, JSON.stringify(historicoMissoes)]);

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
                    await ctx.sendTo(grupo.group_id, msgApocalipse);
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
    async getMessagesByAiResponse(response, params = []){
        const sqlQuery = response

        // 🛡️ [FASE 2 - SEGURANÇA] Cinto + suspensório: além da allow-list do
        // buildSafeLembrarQuery(), nada que não seja um SELECT simples e
        // parâmetro-único chega ao driver aqui.
        if (typeof sqlQuery !== 'string' || !/^select\s+nome_remetente\s*,\s*conteudo\s+from\s+mensagens\b/i.test(sqlQuery.trim())) {
            throw new Error("UNSAFE_AI_SQL_BLOCKED");
        }
        if (!/limit\s+200\s*$/i.test(sqlQuery.trim())) {
            throw new Error("UNSAFE_AI_SQL_BLOCKED");
        }
        
        const messagesDb = await this.db.all(sqlQuery, params);
        if (!messagesDb || messagesDb.length === 0) {
            throw new Error("NO_AI_SQL_RESULT");
        }

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');        
    }

    // 🛡️ [FASE 2 - SEGURANÇA] Guarda-corpo do SQL gerado pela IA (!lembrar).
    // A IA NUNCA executa SQL livre. Regras:
    //  (a) prefixo obrigatório: SELECT nome_remetente, conteudo FROM mensagens
    //  (b) allow-list negativa: sem UNION/DROP/DELETE/UPDATE/INSERT/PRAGMA/;/--
    //  (c) apenas um filtro temporal inteiro é aproveitado (timestamp BETWEEN)
    //  (d) o filtro de conversa e o LIMIT são reescritos POR NÓS, com params (?)
    static buildSafeLembrarQuery(rawSql, from, netId) {
        const MAX_RAW_SQL_LENGTH = 1000;
        const FORCED_LIMIT = 200;

        const sql = String(rawSql || '')
            .replace(/```sql/gi, '')
            .replace(/```/g, '')
            // Um ';' TERMINAL é ruído comum do modelo (o exemplo do prompt não
            // pede, mas ele costuma adicionar). Removemos apenas no fim: qualquer
            // ';' interno continua bloqueado como tentativa de multi-statement.
            .replace(/;+\s*$/, '')
            .trim();

        if (!sql || sql.length > MAX_RAW_SQL_LENGTH) {
            console.log("⚠️ [SQL GUARD] Query vazia ou maior que o limite permitido.");
            throw new Error("INVALID_SELECT");
        }

        // (a) Somente leitura das colunas/tabela autorizadas.
        if (!/^select\s+nome_remetente\s*,\s*conteudo\s+from\s+mensagens\b/i.test(sql)) {
            console.log("⚠️ [SQL GUARD] Prefixo não autorizado:", sql.slice(0, 120));
            throw new Error("INVALID_SELECT");
        }

        // (b) Nada de escrita, DDL, encadeamento de statements ou comentários.
        const PERIGOSOS = /\b(union|drop|delete|update|insert|pragma|attach|detach|alter|create|replace|exec|execute|vacuum|grant|revoke|load_extension|sqlite_master)\b|;|--|\/\*|\*\//i;
        if (PERIGOSOS.test(sql)) {
            console.log("⚠️ [SQL GUARD] Payload destrutivo bloqueado:", sql.slice(0, 120));
            throw new Error("DANGEROUS_SQL");
        }

        // (c) Único filtro aproveitado da IA: intervalo inteiro de timestamp.
        const range = sql.match(/timestamp\s+between\s+(\d{1,11})\s+and\s+(\d{1,11})/i);

        // (d) Reconstrução da query com placeholder (escape delegado ao SQLite).
        const sameConversation = netId === from;
        let query = sameConversation
            ? "SELECT nome_remetente, conteudo FROM mensagens WHERE id_conversa = ?"
            : "SELECT nome_remetente, conteudo FROM mensagens WHERE id_conversa IN (?, ?)";
        const params = sameConversation ? [from] : [from, netId];

        if (range) {
            query += " AND timestamp BETWEEN ? AND ?";
            params.push(parseInt(range[1], 10), parseInt(range[2], 10));
        }

        query += ` AND conteudo NOT LIKE '*Resumo da conversa*%' ORDER BY timestamp DESC LIMIT ${FORCED_LIMIT}`;

        return { query, params };
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
        } 
        else if (command.startsWith("!resumo")){
            candidates = [
                "gemini-flash-lite-latest",
                "gemma-4-31b-it", 
                "gemini-3.1-flash-lite-preview"
            ]; 
        }
        else if (command.startsWith("!lembrar")) {
            candidates = [
                "gemini-flash-lite-latest",
                "gemma-4-31b-it", 
                "gemini-2.5-flash"
            ]; 
        }
        else if (command.startsWith("!gpt")){
            candidates = [
                "gemini-flash-lite-latest",
                "gemini-3.1-flash-lite-preview", 
                "gemma-4-31b-it", 
                "gemini-2.5-flash"
            ]; 
        }
        else if (command.startsWith("!burro")){
            candidates = [
                "gemma-4-26b-a4b-it", 
                "gemini-2.5-flash-lite"
            ];
        }
        else {
            // Conversas comuns, menções e quotes
            candidates = [
                "gemini-flash-lite-latest",
                "gemini-3.1-flash-lite-preview", 
                "gemma-4-31b-it"
            ];
        }

        const currentUsage = await this.getModelUsage();

        for (const model of candidates) {
            const limit = this.modelLimits[model] || 20;
            const used = currentUsage[model] || 0;

            if (used < limit) {
                console.log(`🧠 [Roteador AI] Modelo escolhido: ${model} (${used}/${limit})`);
                return model;
            }            
            console.log(`⚠️ [QUOTA] Limite diário atingido para ${model}, tentando próximo da lista...`);
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
            prompt += `Você agora é uma IA extremamente burra, confusa e que fala com muita confiança sobre coisas erradas.
             
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
        //    throw new Error("FEW_MESSAGES");
        }
        
        let formatedMessages, userFormatedMessages

        prompt += `Você é um bot de WhatsApp engraçado e sarcástico, chamado Bostossauro.
        O usuário "${sender}" te mandou: "${command}".
        Não inicie a mensagem com "Bostossauro: " apenas escreva como se estivesse conversando normalmente com alguém.
        Use emojis (pelo menos um dinossauro 🦖), mas nunca use o emoji de cocô.
        Responda diretamente pelo nome. Seja criativo e mantenha o tom de uma conversa do whatsapp.
        A mensagem não deve conter o "${sender}".`;

        const textoMinusculo = command.toLowerCase();
        if (textoMinusculo.includes('voz') || textoMinusculo.includes('audio') || textoMinusculo.includes('áudio') || textoMinusculo.includes('falar')) {
            prompt += `\n[DIRETRIZ SOBRE SUA VOZ]: O usuário mencionou algo sobre áudio ou voz. Responda com sarcasmo que você pede para sua irmã gravar os áudios para você porque sua garganta de réptil é ruim.`;
        }
        const userData = await this.getUserData(name, sender);
        const afinidade = userData ? userData.afinidade_bot : 0;

        const chanceAfinidade = Math.min(Math.abs(afinidade), 90); 
        const dadoHumor = Math.floor(Math.random() * 100) + 1;

        if (dadoHumor <= chanceAfinidade) {
            if (afinidade < 0) {
                prompt += `\n[ALERTA DE GATILHO EMOCIONAL]: O usuário te trata mal e você está carente. Ao FINAL da sua resposta, adicione apenas UMA frase curta e passivo-agressiva reclamando que ele não te valoriza.
                REGRAS:
                1. NÃO copie exatamente os exemplos abaixo. 
                2. CRIE uma frase inédita e personalizada baseada no que o usuário acabou de perguntar.
                3. O tom deve ser de "adolescente incompreendido que faz o favor mas reclama da falta de valorização".
                EXEMPLOS:                 
                - "Mas faz aí, não que você se importe com o que eu digo mesmo."
                - "Pronto. Agora pode voltar a me tratar feito lixo até precisar de mim de novo."
                - "Espero que funcione, já que você nunca me agradece por nada mesmo."`;
            } else if (afinidade > 0) {
                prompt += `\n[ALERTA DE GATILHO EMOCIONAL]: Você gosta desse usuário. Ao FINAL da sua resposta, adicione apenas UMA frase curta demonstrando preocupação ou um elogio discreto, seguido de um insulto leve para disfarçar.
                REGRAS:
                1. NÃO copie exatamente os exemplos abaixo.
                2. CRIE uma frase inédita que misture um elogio/preocupação com um insulto ranzinza.
                EXEMPLOS:
                - "Vê se se cuida, idiota, não quero você reclamando no meu ouvido depois."
                - "Até que você não é tão burro quanto os outros daqui, mas não se acostuma."
                - "Dá próxima eu te ajudo de novo, mas só porque eu não tenho nada melhor pra fazer."`;
            }
        }

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

        const separadorMemoria = "||MEMORIA||";
        const separadorAnotacoes = "||ANOTACOES||";
        
        prompt += `\n\n---------------------------------------------------
            [INSTRUÇÕES OCULTAS DE SISTEMA]
            Além de responder ao usuário, você DEVE executar duas tarefas internas secretas no final da sua mensagem, nesta exata ordem:
            
            1. ATUALIZAR MEMÓRIA:
            Adicione o separador "${separadorMemoria}" seguido de um resumo atualizado sobre quem é o usuário (gostos, profissão, etc). Se nada mudou, repita a memória antiga.
            
            2. AVALIAR TWEETABILIDADE (BLUESKY):
            No campo "nota", use a seguinte régua de sarcasmo jurássico:
            0-5: Conversa produtiva, dúvidas de código normais ou papo furado.
            6-7: O usuário foi levemente burro ou chato. (Vai para a geladeira).
            8-9: O nível de estupidez humana me deu vontade de morder o monitor. (Postagem prioritária).
            10: O usuário superou os limites da biologia; é um evento apocalíptico de burrice ou ironia. (Surto Instantâneo).

            SOBRE A "mudanca_afinidade":
            Como o Bostossauro, avalie como o usuário te tratou nesta mensagem.
            Dê uma nota de -5 a 5. (Ex: -5 se ele te ofendeu/xingou muito, -1 se foi chato, 0 se foi neutro, +2 se foi legal, +5 se te elogiou muito).
            
            
            Exemplo ESTRITO da sua saída final:
            Aqui está a resposta da sua dúvida! ${separadorMemoria} Usuário não sabe formatar PC. ${separadorAnotacoes} {"contexto": "Usuário querendo apagar a pasta System32", "humor": "desesperado e julgando", "nota": 9, "mudanca_afinidade": -1}`;
        
        if(from != sender){
            userFormatedMessages = await this.getUserMessagesInGroup(from, sender);
            prompt +=  `As últimas 20 mensagens do usuário no grupo foram (ignore se estiver vazio): \n${userFormatedMessages}`
        }

        return prompt;
    }

    // 🛡️ [FASE 2 - PROMPT INJECTION] Saneia o bloco ||MEMORIA||.
    // A memória é saída de LLM (dado NÃO confiável): limitamos o tamanho,
    // removemos caracteres de controle e os próprios separadores, para que o
    // texto não vire payload persistido no SQLite nem instruções maliciosas
    // reaproveitadas no próximo prompt.
    static sanitizeMemoryText(raw) {
        const MAX_MEMORIA_CHARS = 1500;
        const texto = String(raw === null || raw === undefined ? "" : raw)
            .replace(/\|\|(MEMORIA|ANOTACOES)\|\|/gi, " ")
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
            .replace(/[ \t]{3,}/g, "  ")
            .trim();

        if (!texto) return "";
        return texto.length > MAX_MEMORIA_CHARS ? texto.slice(0, MAX_MEMORIA_CHARS) : texto;
    }

    // 🛡️ [FASE 2 - PROMPT INJECTION] Saneia o bloco ||ANOTACOES|| antes de
    // qualquer efeito colateral (UPDATE de afinidade no SQLite e fila do BlueSky).
    // Tipos são validados (números finitos) e as FAIXAS são forçadas:
    // nota 0..10 e mudanca_afinidade -5..5, conforme a régua definida no prompt.
    static sanitizeAnotacoes(rawJson) {
        const LIMITES = {
            notaMin: 0, notaMax: 10,
            afinidadeMin: -5, afinidadeMax: 5,
            textoMax: 400,
            temasMax: 5, temaMax: 80
        };

        let parsed;
        try {
            parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        } catch (e) {
            return null; // JSON inválido => nenhum efeito colateral é executado
        }

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

        // Só aceita número finito; arredonda e prende na faixa permitida.
        const limitarInteiro = (valor, min, max) => {
            const n = Number(valor);
            if (!Number.isFinite(n)) return null;
            return Math.min(max, Math.max(min, Math.round(n)));
        };

        const limparTexto = (valor, max) => {
            if (typeof valor !== 'string') return "";
            const texto = valor
                .replace(/[\u0000-\u001F\u007F]/g, " ")
                .replace(/\|\|(MEMORIA|ANOTACOES)\|\|/gi, " ")
                .trim();
            return texto.length > max ? texto.slice(0, max) : texto;
        };

        return {
            contexto: limparTexto(parsed.contexto, LIMITES.textoMax),
            humor: limparTexto(parsed.humor, LIMITES.textoMax),
            // Nota inválida/fora de faixa cai para 0 => nunca dispara post no BlueSky
            nota: limitarInteiro(parsed.nota, LIMITES.notaMin, LIMITES.notaMax) ?? LIMITES.notaMin,
            // Afinidade inválida cai para 0 => nunca altera o saldo social do usuário
            mudanca_afinidade: limitarInteiro(parsed.mudanca_afinidade, LIMITES.afinidadeMin, LIMITES.afinidadeMax) ?? 0,
            temas: Array.isArray(parsed.temas)
                ? parsed.temas.slice(0, LIMITES.temasMax).map(t => limparTexto(t, LIMITES.temaMax)).filter(Boolean)
                : []
        };
    }

   // Recebe a resposta do Gemini utilizando o prompt recebido
    // Recebe a resposta do Gemini utilizando o prompt recebido
    async getAiResponse(from, sender, name, isGroup, command, prompt, forceModel = null, options = {}) {
        await this.updateOnlineStatus();

        let modelName = await this.selectBestModel(command, forceModel);

        const separator = "||MEMORIA||";

        // =================================================================
        // ⏱️ HELPER DE TIMEOUT (Corta requisições travadas no limbo)
        // =================================================================
        const withTimeout = (promise, ms) => {
            let timer;
            const timeoutPromise = new Promise((_, reject) => {
                timer = setTimeout(() => {
                    const err = new Error("Google API Timeout");
                    err.code = "GOOGLE_TIMEOUT";
                    reject(err);
                }, ms);
            });
            return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
        };

        // =================================================================
        // 🔄 RETRY COM TIMEOUT (Trata 500, 503 e Quedas de Conexão)
        // =================================================================
        let response = null;
        let tentativas = 0;
        const maxTentativas = 2;
        const TIMEOUT_LIMITE_MS = 30000; // Máximo de 30s por tentativa

        while (tentativas < maxTentativas) {
            try {
                tentativas++;
                response = await withTimeout(
                    this.genAI.models.generateContent({
                        model: modelName,
                        contents: prompt,
                        config: {}
                    }),
                    TIMEOUT_LIMITE_MS
                );
                break; 
            } catch (error) {
                const isTimeout = error?.code === 'GOOGLE_TIMEOUT';
                const isGoogle500 = error?.status === 500 || 
                                    error?.error?.code === 500 || 
                                    error?.message?.includes('"code":500') || 
                                    error?.status === 'INTERNAL';

                const isGoogle503 = error?.status === 503 || 
                                    error?.error?.code === 503 || 
                                    error?.message?.includes('"code":503') || 
                                    error?.message?.includes('high demand') ||
                                    error?.message?.includes('overloaded') ||
                                    error?.status === 'UNAVAILABLE';

                const ehErroTemporario = isTimeout || isGoogle500 || isGoogle503;

                if (ehErroTemporario && tentativas < maxTentativas) {
                    const motivo = isTimeout ? 'Timeout (+20s)' : (isGoogle503 ? 'Alta Demanda (503)' : 'Instabilidade (500)');
                    console.warn(`⚠️ [GEMINI] ${motivo}. Tentando novamente em 2s (Tentativa ${tentativas}/${maxTentativas})...`);
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    if (isTimeout) {
                        error.code = 'GOOGLE_TIMEOUT';
                    } else if (isGoogle503) {
                        error.code = 'AI_OVERLOAD';
                    } else if (isGoogle500) {
                        error.code = 'GOOGLE_API_INTERNAL';
                    }
                    console.error("Erro na requisição IA:", error);
                    throw error;
                }
            }
        }

        try {
            await this.incrementModelUsage(modelName);

            console.log(`Mensagem gerada usando o ${modelName}`);

            let fullText = response.text || (response.response ? response.response.text() : "");

            let replyText = fullText;
            let memoryText = "";
            let anotacoesJsonStr = "";

            if (fullText.includes("||MEMORIA||")) {
                const partsMemoria = fullText.split("||MEMORIA||");
                replyText = partsMemoria[0].trim();
                const resto = partsMemoria[1];

                if (resto.includes("||ANOTACOES||")) {
                    const partsAnotacoes = resto.split("||ANOTACOES||");
                    memoryText = partsAnotacoes[0].trim();
                    anotacoesJsonStr = partsAnotacoes[1].trim();
                } else {
                    memoryText = resto.trim();
                }
            }

            // 🛡️ [FASE 2 - PROMPT INJECTION] Memória vinda do modelo passa por
            // saneamento (tipo/tamanho) antes de tocar o SQLite. Também não é
            // escrita em passadas de "ferramenta" (ex: geração de SQL do !lembrar).
            if (memoryText.length > 0 && !options.skipMemoryEffects) {
                const memoriaLimpa = ChatModel.sanitizeMemoryText(memoryText);
                if (memoriaLimpa) await this.saveUserMemory(name, sender, memoriaLimpa);
            }

            if (anotacoesJsonStr && !options.skipMemoryEffects) {
                try {
                    const cleanJson = anotacoesJsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();

                    // 🛡️ [FASE 2 - PROMPT INJECTION] Validação de TIPOS + clamp de
                    // faixa: nada é gravado nem enviado ao BlueSky sem passar aqui.
                    const anotacoes = ChatModel.sanitizeAnotacoes(cleanJson);

                    if (anotacoes) {
                        if (anotacoes.mudanca_afinidade !== 0) {
                            await this.db.run(`UPDATE usuarios SET afinidade_bot = afinidade_bot + ? WHERE id_usuario = ?`, [anotacoes.mudanca_afinidade, sender]);
                            console.log(`❤️ Afinidade com ${sender} mudou: ${anotacoes.mudanca_afinidade > 0 ? '+' : ''}${anotacoes.mudanca_afinidade}`);
                        }

                        if (this.blueskyBrain && anotacoes.contexto && anotacoes.humor && anotacoes.nota > 0) {
                            const msgTimestamp = Math.floor(Date.now() / 1000); 
                            this.blueskyBrain.processarAnotacao(anotacoes, msgTimestamp)
                                .catch(e => console.error("Erro no fluxo do BlueSky:", e));
                        }
                    }
                } catch (e) {
                    console.error("❌ [JSON PARSE] Erro ao desempacotar anotações secretas:", e.message);
                }
            }

            return replyText;

        } catch (error) {
            console.error("Erro no processamento da resposta da IA:", error);
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
                model: "gemma-4-31b-it", 
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

            // 🧠 [FASE 5 - MICRO-CACHE] Escrita direta no banco invalida o cache,
            // senão o painel logo abaixo mostraria o número antigo por até 60s.
            this.modelUsageCache = null;

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

            // [FASE 3] Compra atômica: o dinheiro só sai se a cota de IA ainda existir.
            // Antes o UPDATE era incondicional (dois cliques = preço dobrado e saldo
            // podendo ficar negativo).
            const comprou = await withTransaction(this.db, async () => {
                const debitado = await debitarSaldo(this.db, ctx.sender, item.price);
                if (!debitado) return false;

                const cota = await this.db.run(
                    "UPDATE usuarios SET uso_ia_diario = MAX(0, uso_ia_diario - ?) WHERE id_usuario = ? AND uso_ia_diario > 0",
                    [reduceAmount, ctx.sender]
                );

                if (!cota || cota.changes !== 1) {
                    throw new Error('COTA_IA_ZERADA');
                }

                return true;
            }).catch((e) => {
                if (e && e.message === 'COTA_IA_ZERADA') return false;
                console.error("Erro na compra VIP:", e);
                return false;
            });

            if (!comprou) return `${tag}💸 Compra não concluída: saldo insuficiente (🪙 ${saldo}) ou cota de IA já zerada.`;
            
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

    async handleLembrarCommand(from, sender, name, isGroup, command, complement){
            const netId = await this.getNetGroupId(from);

            const pergunta = command.slice(8).trim()
            const selectPrompt = `Você é um gerador de consulta SQL para SQLite. Sua única saída deve ser uma consulta SQL (SELECT), sem NENHUMA explicação ou texto adicional.
            A tabela é 'mensagens' e o campo de tempo é 'timestamp' (UNIX time em segundos).
            FILTRO OBRIGATÓRIO: use APENAS o intervalo de tempo (timestamp) no WHERE. NUNCA escreva a coluna 'id_conversa',
            pois o sistema injeta o filtro de conversa como parâmetro seguro DEPOIS da sua resposta.
            O usuário quer recuperar mensagens que se encaixam no período de tempo da pergunta.
            Recupere as colunas 'nome_remetente' e 'conteudo'.
            A ordenação deve ser por timestamp DESC, e o limite deve ser de 200. Se a pergunta não especificar um período de tempo, recupere as últimas 200 mensagens da conversa.

            Exemplo de saída para "o que rolou ontem": SELECT nome_remetente, conteudo FROM mensagens WHERE timestamp BETWEEN 1764355200 AND 1764441600 ORDER BY timestamp DESC LIMIT 200

            Pergunta do usuário: ${pergunta}`

            // 🛡️ [FASE 2 - SEGURANÇA] A IA só PRODUZ TEXTO aqui. Quem monta a SQL
            // executável é o guarda-corpo (allow-list + parâmetros + LIMIT fixo).
            const rawSql = await this.getAiResponse(
                from, sender, name, isGroup, command, selectPrompt,
                "gemini-3.1-flash-lite-preview",
                { skipMemoryEffects: true } // passada de geração de SQL não escreve memória/BlueSky
            );

            const { query: safeSql, params: safeParams } = ChatModel.buildSafeLembrarQuery(rawSql, from, netId);

            let selectedMessages = await this.getMessagesByAiResponse(safeSql, safeParams)

            let finalPrompt = await this.formulatePrompt(from, sender, name, isGroup, command, selectedMessages)
            
            return await this.getAiResponse(from, sender, name, isGroup, command, finalPrompt)
    }

    async handleMenuCommand(){
        return `📍 *MENU RÁPIDO (v7.0 - O Multiverso e a Extinção)* ☄️\n\n
        🆘 !ajuda (ou !help)\n
        🗣️ !audio\n
        🎰 !cassino\n
        📍 !cidade\n
        🌡️ !clima\n
        💵 !cotacao\n
        🎲 !d{número}\n
        🗣️ !falador\n
        🚜 !fazenda (AGRONEGÓCIO)\n
        🤖 !gpt {texto}\n
        🧠 !lembrar\n
        🎮 !lol\n
        📄 !menu\n
        ✏️ !notas\n
        🦖 !parque (JURASSIC BOSTOPARK)\n
        📙 !pdf\n
        🎣 !pescaria (SISTEMA DE PESCA)\n
        💸 !pix\n
        🎮 !poke (POKÉMON)\n
        🖼️ !s (ou !sticker)\n
        🛎️ !resumo\n
        💼 !trabalhar\n
        ☢️ !toxico\n
        🧐 !tradutor\n
        🌐 !gerartoken / !vincular (Cross-Save)
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
            this.registerMetric('command', rootCommand).catch(e => console.error("Erro ao registrar métrica:", e));

            // CONTEXTO UNIVERSAL
            const ctx = {
                platform: msg.platform || 'whatsapp',
                msg, sender, from, isGroup, command, quotedMessage, sock, name, user, mentions,
                
                reply: msg.reply || (async (texto) => {
                    if (sock) await sock.sendMessage(from, { text: texto });
                }),
                replyImage: msg.replyImage || (async (url, caption = "") => {
                    if (sock) await sock.sendMessage(from, { image: { url: url }, caption: caption });
                }),
                replySticker: msg.replySticker || (async (buffer) => {
                    if (sock) await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
                }),
                replyDocument: msg.replyDocument || (async (caminhoArquivo, nomeArquivo, legenda = "") => {
                    const fs = require('fs');
                    if (sock) {
                        await sock.sendMessage(from, { 
                            document: fs.readFileSync(caminhoArquivo), mimetype: 'application/pdf', fileName: nomeArquivo, caption: legenda
                        }, { quoted: msg });
                    }
                }),
                sendTo: msg.sendTo || (async (targetId, texto) => {
                    if (sock) await sock.sendMessage(targetId, { text: texto });
                }),
                react: msg.react || (async (emoji) => {
                    if (sock && msg.key) {
                        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
                    }
                }),
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
            const d = new Date();
            d.setHours(d.getHours() - 3);
            const today = d.toISOString().split('T')[0];
            
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