require('dotenv').config();
const schedule = require('node-schedule');
const weatherCommandHandler = require('./weatherCommand');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');
const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const qrcode = require('qrcode-terminal');
const sqlite = require('sqlite'); 
const sqlite3 = require('sqlite3'); 
const pino = require('pino'); 
const ChatModel = require('./chatModel');
const { handleBotError } = require('./errorHandler');
const fs = require('fs');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const sharp = require('sharp');

const groupHistory = {}; 
const DB_PATH = 'chat_history.db'; 
let db; 
let myFullJid;

//Insere as mensagens do bot no banco de dados.
const saveBotMessage = async (database, from, text, externalId = null) => {
    const timestamp = Math.floor(Date.now() / 1000);

    try {
        await database.run(
            `INSERT INTO mensagens 
            (id_conversa, timestamp, id_remetente, nome_remetente, conteudo, id_mensagem_externo)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [from, timestamp, myFullJid, 'Bostossauro', text, externalId]            
        );
        console.log(`✅ OUTGOING: Resposta do Bot salva no BD. (Conversa: ${from})`);
    } catch (error) {
        if (error && !error.message.includes('UNIQUE constraint failed')) {
            console.error("❌ Erro ao salvar mensagem do Bot no BD:", error);
        }
    }
};

//Envia a mensagem e chama saveBotMessage
const sendAndSave = async (sock, database, from, text, msgKey = null, mentions = []) => {
    const sentMessage = await sock.sendMessage(from, { 
        text: text, 
        mentions: mentions 
    }, { quoted: msgKey });
    
    await saveBotMessage(database, from, text, sentMessage.key.id);
};

//Conexão com o banco
async function initDatabase() {
    db = await sqlite.open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS mensagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_conversa TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            id_remetente TEXT NOT NULL,
            nome_remetente TEXT,
            conteudo TEXT NOT NULL,
            id_mensagem_externo TEXT UNIQUE
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario TEXT PRIMARY KEY,
            nome TEXT,
            banido_ate INTEGER DEFAULT 0,
            uso_ia_diario INTEGER DEFAULT 0,
            data_ultimo_uso TEXT DEFAULT ''
        );
    `);

    try {
        await db.exec(`ALTER TABLE usuarios ADD COLUMN anotacoes TEXT DEFAULT '';`);
        console.log("✅ Coluna 'anotacoes' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) {
            console.error("⚠️ Erro na migração:", error.message);
        }
    }

    try {
        await db.exec(`ALTER TABLE usuarios ADD COLUMN uso_gemma_diario INTEGER DEFAULT 0;`);
        console.log("✅ Coluna 'uso_gemma_diario' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) {
            console.error("⚠️ Erro ao criar coluna Gemma:", error.message);
        }
    }

    try {
        await db.exec(`ALTER TABLE ranking_ofensas ADD COLUMN total_mensagens INTEGER DEFAULT 0;`);
        console.log("✅ Coluna 'total_mensagens' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) {
            console.error("⚠️ Erro ao criar coluna Gemma:", error.message);
        }
    }

    try {
        await db.exec(`ALTER TABLE ranking_ofensas ADD COLUMN data_ultima_mensagem TEXT DEFAULT '';`);
        console.log("✅ Coluna 'data_ultima_mensagem' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) {
            console.error("⚠️ Erro ao criar coluna data_ultima_mensagem:", error.message);
        }
    }
    
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ranking_ofensas (
            id_conversa TEXT NOT NULL,
            id_usuario TEXT NOT NULL,
            quantidade INTEGER DEFAULT 0,
            PRIMARY KEY (id_conversa, id_usuario)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS pokedex (
            id INTEGER PRIMARY KEY,
            name TEXT,
            type1 TEXT,
            type2 TEXT,
            base_hp INTEGER,
            base_atk INTEGER,
            base_def INTEGER,
            base_spa INTEGER,
            base_spd INTEGER,
            base_spe INTEGER,
            rarity TEXT,
            tier INTEGER,
            is_starter BOOLEAN,
            sprite_url TEXT,
            base_xp INTEGER
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_pokemons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            pokedex_id INTEGER NOT NULL,
            nickname TEXT,
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            iv_hp INTEGER,
            iv_atk INTEGER,
            iv_def INTEGER,
            iv_spa INTEGER,
            iv_spd INTEGER,
            iv_spe INTEGER,
            obtained_at INTEGER,
            FOREIGN KEY(pokedex_id) REFERENCES pokedex(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS moves (
            id INTEGER PRIMARY KEY,
            name TEXT,
            type TEXT,
            power INTEGER,
            accuracy INTEGER,
            pp INTEGER,
            damage_class TEXT -- 'physical', 'special' ou 'status'
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS pokemon_moves (
            pokemon_id INTEGER,
            move_id INTEGER,
            level_learned INTEGER,
            FOREIGN KEY(pokemon_id) REFERENCES pokedex(id),
            FOREIGN KEY(move_id) REFERENCES moves(id)
        );
    `);

    const columnsToAdd = ['move1', 'move2', 'move3', 'move4'];
    for (const col of columnsToAdd) {
        try {
            await db.exec(`ALTER TABLE user_pokemons ADD COLUMN ${col} INTEGER DEFAULT NULL;`);
        } catch (e) {}
    }

    try {
        await db.exec(`ALTER TABLE user_pokemons ADD COLUMN current_hp INTEGER DEFAULT 20;`);
        console.log("✅ Coluna 'current_hp' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) console.error(error.message);
    }

    try {
        await db.exec(`ALTER TABLE user_pokemons ADD COLUMN max_hp INTEGER DEFAULT 20;`);
        console.log("✅ Coluna 'max_hp' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) console.error(error.message);
    }

    try {
        await db.exec(`ALTER TABLE user_pokemons ADD COLUMN is_shiny BOOLEAN DEFAULT 0;`);
        console.log("✅ Coluna 'is_shiny' adicionada com sucesso!");
    }  catch (error) {
        if (!error.message.includes("duplicate column name")) console.error(error.message);
    }

    try {
        await db.exec(`ALTER TABLE usuarios ADD COLUMN pokeballs INTEGER DEFAULT 20;`);
        console.log("✅ Coluna 'pokeballs' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) console.error(error.message);
    }

        try {
        await db.exec(`ALTER TABLE usuarios ADD COLUMN pokecoins INTEGER DEFAULT 1000;`);
        console.log("✅ Coluna 'pokecoins' adicionada com sucesso!");
    } catch (error) {
        if (!error.message.includes("duplicate column name")) console.error(error.message);
    }

    console.log('✅ Banco de dados SQLite inicializado e tabelas `mensagens` e `usuarios` verificadas.');
}

const botCommands = {
    '!d': {
        emoji: '🎲'
    },
    '!menu': {
        emoji: '📄'
    },
    '!resumo': {
        emoji: '🛎️'
    },
    '!gpt': {
        emoji: '🤖'
    },
    '!lembrar': {
        emoji: '🧠'
    },
    '!sticker': {
        emoji: '🪄'
    },
    '!s': {
        emoji: '🪄'
    },
    '!lol': {
        emoji: '🎮'
    },
    '!timeout': {
        emoji: '✅'
    },
    '!notas': {
        emoji: '✏️'
    },
    '!clima': {
        emoji: '🌡️'
    },
    '!tradutor': {
        emoji: '🧐'
    },
    '!cotacao': {
        emoji: '💵'
    },
    '!ajuda': { 
        emoji: '🆘' 
    },
    '!help': {
        emoji: '🆘' 
    },
    '!pdf': {
        emoji: '⚙️'
    },
    '!burro': {
        emoji: '🤓'
    },
    '!toxico': {
        emoji: '☢️'
    },
    '!falador': {
        emoji: '🗣️'
    },
    '!audio': {
        emoji: '🗣️'
    },
    '!poke': {
        emoji: '🎮'
    }
};

//Inicia a conexão com mo Whatsapp para fazer todas as operações
async function connectToWhatsApp() {
    await initDatabase();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'warn' }), 
    });

    //Instancia o chatbot
    const chatbot = new ChatModel(db, genAI)
    
    //Envia figurinha
    const sendSticker = async (sock, db, from, msg, mentions, command) => {
        const stickerPath = await chatbot.getSticker(command);

        if (!stickerPath || !fs.existsSync(stickerPath)) {
            console.log(`[SendSticker] Sem sticker para o comando: ${command}`);
            return; 
        }

        try {
            const stickerBuffer = fs.readFileSync(stickerPath);

            await sock.sendMessage(from, { 
                sticker: stickerBuffer 
            }, { 
                quoted: msg 
            });
            
        } catch (error) {
            console.error("❌ Erro ao enviar sticker:", error);
        }
    }

    //Funções do baileys
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ Bot conectado e pronto!');
            
            if (dailyJob) {
                dailyJob.cancel();
            }

            dailyJob = schedule.scheduleJob('0 0 10 * * *', async function(){
                const targetCity = "Santos"; 
                
                try {
                    console.log("⏰ Iniciando rotina de Bom Dia...");

                    const weatherComplement = await weatherCommandHandler.getWeather(targetCity);
                    const weatherForecastComplement = await weatherCommandHandler.getNextDayForecast(targetCity);
                    
                    let baseMessage = "Bom dia, grupo! 🦖 O Bostossauro acordou e escolheu a violência.\n" + 
                                      "Se quiser usar alguma das minhas funções, dá um !ajuda (ou !help).\n\n" + 
                                      weatherComplement + "\n\n" + 
                                      weatherForecastComplement;

                    const groups = await sock.groupFetchAllParticipating();
                    const groupIds = Object.keys(groups);

                    console.log(`📊 Enviando bom dia para ${groupIds.length} grupos.`);
                    let toxicReport = ""

                    for (const groupId of groupIds) {
                        if(groupId == "120363422139578370@g.us"){
                            baseMessage += "\n\n------------------------------\n";                            
                            toxicReport = await chatbot.getAndResetToxicPodium(groupId);
                        }
                        
                        const finalMessage = baseMessage + toxicReport;

                        await sock.sendMessage(groupId, { text: finalMessage });
                        
                        await new Promise(resolve => setTimeout(resolve, 2000)); 
                    }

                    console.log("✅ Transmissão de Bom Dia finalizada!");

                } catch (error) {
                    console.error("❌ Erro no envio do clima/toxicidade agendado:", error);
                }
            });
        }
    });

    sock.ev.on('creds.update', saveCreds);

    //Pega as informações do bot
    const me = state.creds.me;
    myFullJid = me?.id ? jidNormalizedUser(me.id) :  '5513991526878@s.whatsapp.net'; 
    let dailyJob;


    //Acorda quando chega uma mensagem
    sock.ev.on('messages.upsert', async m => {
        if (m.type !== 'notify') {
            return;
        }

        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Pega de quem é a mensagem e verifica se é de um grupo
        const from = msg.key.remoteJid;        
        const isGroup = from.endsWith('@g.us');

        const getSenderJid = (msg) => {
            const key = msg.key;
            if (key.participant) {
                if (key.participant.includes('@lid') && key.participantAlt) {
                    return jidNormalizedUser(key.participantAlt);
                }
                return jidNormalizedUser(key.participant);
            } else {
                if (key.remoteJid && key.remoteJid.includes('@lid') && key.remoteJidAlt) {
                    return jidNormalizedUser(key.remoteJidAlt);
                }
                return jidNormalizedUser(key.remoteJid);
            }
        };
        
        //Pega o texto da mensagem
        const texto = msg.message.conversation || 
              msg.message.extendedTextMessage?.text || 
              msg.message.imageMessage?.caption ||
              msg.message.videoMessage?.caption ||
              msg.message.documentMessage?.caption ||
              '';

        //Joga o comando todo para letras minúsculas para evitar problemas com case-sensitive
        const command = texto.trim().toLowerCase();

        
        const name = msg.pushName || '';

        const sender = getSenderJid(msg);

        chatbot.countMessage(name, sender, from)

        //Verifica se por algum motivo a mensagem não chegou vazia
        if (texto) {
            const id_conversa = from; 
            const id_remetente = getSenderJid(msg);
            const nome_remetente = msg.pushName || '';
            const id_mensagem_externo = msg.key.id;
            const timestamp = msg.messageTimestamp; 
            if (!msg.key.fromMe) {
                chatbot.trackOffenses(name, id_remetente, from, texto);
            }


            if(!command.startsWith("!status") && !command.startsWith("!s") && !command.startsWith("sticker")){
                try {
                    await db.run(
                        `INSERT INTO mensagens 
                        (id_conversa, timestamp, id_remetente, nome_remetente, conteudo, id_mensagem_externo)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [id_conversa, timestamp, id_remetente, nome_remetente, texto, id_mensagem_externo]
                    );
                    console.log(`✅ INCOMING: Mensagem de "${nome_remetente}" salva no BD.`);
                } catch (error) {
                    if (!error.message.includes('UNIQUE constraint failed')) {
                        console.error("❌ Erro ao salvar mensagem no BD:", error);
                    }
                }
            }
        }

        //Para por aqui se a mensagem for vazia
        if (!texto) return;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        //Verifica se a mensagem é um quote e quem quotou
        const quotedMessage = contextInfo?.quotedMessage;
        const replyParticipant = contextInfo?.participant;

        //Pega o número do Whatsapp do bot e o Lid
        const myPhone = me?.id ? me.id.split(':')[0].split('@')[0] : ''; 
        const myLid = me?.lid ? me.lid.split(':')[0].split('@')[0] : '';   

        const replyNumber = replyParticipant ? replyParticipant.split(':')[0].split('@')[0] : '';

        //Verifica se o quote é para o bot
        const isReplyToBot = replyNumber && (replyNumber === myPhone || replyNumber === myLid);

        //Logs de quote
        if (quotedMessage) {
            console.log(`💬 DETECTEI UMA RESPOSTA!`);
            console.log(`   Quem foi respondido (Clean): ${replyNumber}`);
            console.log(`   Meus IDs: Phone=${myPhone} | LID=${myLid}`);
            console.log(`   É pra mim? ${isReplyToBot ? 'SIM ✅' : 'NÃO ❌'}`);
        }



        if (command === '!status') {
            const GRUPO_CONTROLE = '120363422821336011@g.us';
            
            if (from === GRUPO_CONTROLE) {
                try {
                    await sock.sendMessage(from, { react: { text: '📊', key: msg.key } });                    
                    const statusReport = await chatbot.getStatus();
                    await sock.sendMessage(from, { text: statusReport }, { quoted: msg });
                    return;
                } catch (error) {
                    console.error("Erro ao gerar status:", error);
                }
            } 
        }

        let commandName = command.split(' ')[0];

        if (/^!d\d+$/.test(commandName)) {
            commandName = '!d';
        }

        const action = botCommands[commandName];

        // Comando para criar figurinha (!s ou !sticker)
        if (commandName === '!s' || commandName === '!sticker') {
            try {
                // Identifica se é uma imagem/video direto ou um quote
                const isQuoted = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const targetMessage = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;
                
                // Verifica se existe mídia na mensagem alvo
                // (imageMessage, videoMessage ou viewOnceMessage)
                const mediaMessage = targetMessage?.imageMessage || 
                                     targetMessage?.videoMessage ||
                                     targetMessage?.viewOnceMessage?.message?.imageMessage ||
                                     targetMessage?.viewOnceMessage?.message?.videoMessage;

                if (!mediaMessage) {
                    await sock.sendMessage(from, { text: '❌ Cadê a imagem? Manda uma foto com a legenda !s ou responde a uma foto com !s' }, { quoted: msg });
                    return;
                }

                if (action) {
                    if (action.emoji) {
                        await sock.sendMessage(from, { react: { text: action.emoji, key: msg.key } });
                    }

                } else {
                    await sock.sendMessage(from, { react: { text: '🤨', key: msg.key } });
                }

                // Baixa a mídia
                // Nota: downloadMediaMessage precisa do objeto de mensagem completo se for quote,
                // mas aqui fazemos um "truque" passando a estrutura correta pro helper do Baileys
                const messageType = Object.keys(targetMessage)[0];
                
                // Se for quoted, precisamos simular a estrutura de uma message key para o download funcionar bem
                const mediaKeys = {
                    message: targetMessage
                };

                const buffer = await downloadMediaMessage(
                    mediaKeys,
                    'buffer',
                    { logger: pino({ level: 'silent' }) } 
                );

                let finalBuffer = buffer;
                let stickerQuality = 50

                const args = command.trim().split(' ');
                const param = args[1] ? args[1].toLowerCase() : null;

                if (param === 'baixa') {
                    stickerQuality = 1;
                    try {
                        finalBuffer = await sharp(buffer)
                            .resize(30, null) 
                            .toFormat('jpeg', { 
                                quality: 10, 
                                //chromaSubsampling: '4:2:0',
                                mozjpeg: false
                            })
                            .modulate({
                                saturation: 1.5,
                                brightness: 1.1
                            })
                            .resize(512, null, { 
                                kernel: sharp.kernel.mitchell 
                            })                            
                            .blur(3) 
                            .toBuffer();                        
                        stickerQuality = 5; 
                        
                        console.log("✅ Imagem destruída (Modo Batata baixo)");
                    } catch (err) {
                        console.error("Erro ao destruir imagem:", err);
                    }
                }

                if(param === 'podi'){                    
                    try {
                        finalBuffer = await sharp(buffer)
                            .resize(16, null) 
                            .toFormat('jpeg', { 
                                quality: 5, 
                                //chromaSubsampling: '4:2:0', 
                                mozjpeg: false
                            })
                            .modulate({
                                saturation: 1.5, 
                                brightness: 1.1
                            })
                            .resize(512, null, { 
                                kernel: sharp.kernel.mitchell 
                            })
                            .blur(8) 
                            .toBuffer();
                        stickerQuality = 5; 
                        
                        console.log("✅ Imagem destruída (Modo Batata podi)");
                    } catch (err) {
                        console.error("Erro ao destruir imagem:", err);
                    }
                }

                // Cria a figurinha
                const sticker = new Sticker(finalBuffer, {
                    pack: 'Bostossauro Pack',
                    author: 'Bostossauro', 
                    type: StickerTypes.FULL, 
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: stickerQuality,
                    background: '#00000000'
                });

                await sock.sendMessage(from, await sticker.toMessage(), { quoted: msg });
                await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
                
                return;

            } catch (error) {
                console.error("Erro ao criar figurinha:", error);
                await sock.sendMessage(from, { text: '❌ Deu ruim na figurinha. Tenta com outra imagem.' }, { quoted: msg });
                return;
            }
        }

        //Início da lógica geral do bot, se o texto começar com !, o chatbot estiver online
        //e o texto tenha mais de 1 caractere
        if(command.startsWith("!") &&  chatbot.isOnline && command.length > 1){
            
            const sender = getSenderJid(msg);

            const contextObj = {
                from: from,
                sender: sender,
                command: command
            };

            const replyToUser = async (text) => {
                await sendAndSave(sock, db, from, text, msg, [sender]);
            };
            
            const senderJid = sender.split('@')[0];

            const commandIntros = {
                '!gpt': `🤖 @${senderJid}\n\n`,
                '!resumo': `🦖 @${senderJid}\n*Resumo da conversa*\n\n`,
                '!lembrar': `🧠\n\n`,
                '!tradutor': `🧐 *Mensagem traduzida*:\n\n`,
                '!converter': `💸 *Conversão Direta*\n`,
                '!burro': `🤓 *Essa eu sei*\n\n`,
                'undefined': ''
            };

            const quotedMessageText = quotedMessage?.conversation || 
                                quotedMessage?.extendedTextMessage?.text || 
                                quotedMessage?.imageMessage?.caption || 
                                "[Midia/Sticker sem texto]";

            //Bloco de controle NOVO, trata melhor os problemas e se comunica diretamente
            //com o chatModel.js
            try {
                const command = texto.trim(); 

                if (action) {
                    if (action.emoji) {
                        await sock.sendMessage(from, { react: { text: action.emoji, key: msg.key } });
                    }

                } else {
                    await sock.sendMessage(from, { react: { text: '🤨', key: msg.key } });
                }

                //Controla o envio dos stickers
                await sendSticker(sock, db, from, msg, [sender], texto)

                //Pega a resposta do handleCommand do chatModel.js
                const response = await chatbot.handleCommand(msg, sender, from, isGroup, command, quotedMessageText, sock);

                const intro = commandIntros[commandName] || commandIntros['undefined'];
                const finalResponse = `${intro}${response}`;
                
                //Verifica se recebeu alguma resposta
                if (response) {
                    await sendAndSave(sock, db, from, finalResponse, null, [sender]);
                }
            } catch (error) {
                await handleBotError(error, replyToUser, contextObj);
            }
        }

        //Se o chatbot não estiver online e receber um comando
        else if(command.startsWith("!") &&  !chatbot.isOnline){
            const sender = getSenderJid(msg);        
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }

        else{
            const sender = getSenderJid(msg);
            const replyToUser = async (text) => {
                await sendAndSave(sock, db, from, text, msg, [sender]);
            };
            const contextObj = {
                from: from,
                sender: sender,
                command: command
            };
            const quotedMessageText = quotedMessage?.conversation || 
                                quotedMessage?.extendedTextMessage?.text || 
                                quotedMessage?.imageMessage?.caption || 
                                "[Midia/Sticker sem texto]";
            try{
                //Se não for grupo e o chatbot estiver online, responde a qualquer mensagem,
                //sem precisar de quote ou comando
                if(!isGroup && chatbot.isOnline){
                    const mensagem = texto.trim(); 
                    const sender = getSenderJid(msg);
                    const senderJid = sender.split('@')[0];

                    //Verifica se deve mandar um sticker
                    await sendSticker(sock, db, from, msg, [sender], texto)
                
                    //Pega a resposta do handleMessageWithoutCommand do chatModel.js
                    const response = await chatbot.handleMessageWithoutCommand(msg, sender, from, isGroup, command, quotedMessageText);

                    await sendAndSave(sock, db, from, response, null, [sender]);
                }
                
                //Se não estiver online, manda o sticker "desonline"
                if(!isGroup && !chatbot.isOnline){    
                    const sender = getSenderJid(msg);
                    await sendSticker(sock, db, from, msg, [sender], texto)
                    return
                }
            }catch (error) {
                await handleBotError(error, replyToUser, contextObj);
            }
        }

        //Se é um quote para o bot e ele está online, responde
        //e reage com emoji de olho
        if (quotedMessage && isReplyToBot && chatbot.isOnline) {
            const sender = getSenderJid(msg);

            console.log("✅ REPLY DETECTADO! Respondendo...");

            await sendSticker(sock, db, from, msg, [sender], texto)
            
            if (texto.startsWith('!')) return;

            await sock.sendMessage(from, { react: { text: "👀", key: msg.key } }); 

            const quotedMessageText = quotedMessage.conversation || 
                                quotedMessage.extendedTextMessage?.text || 
                                quotedMessage.imageMessage?.caption || 
                                "[Midia/Sticker sem texto]";

            let response
            const replyToUser = async (text) => {
                await sendAndSave(sock, db, from, text, msg, [sender]);
            };
            const contextObj = {
                from: from,
                sender: sender,
                command: command
            };
            
            try {                
                response = await chatbot.handleMessageWithoutCommand(msg, sender, from, isGroup, command, quotedMessageText)
                if (response && typeof response === 'string') {
                    await sendAndSave(sock, db, from, response, msg, [sender]); 
                }
            } catch (error) {
                await handleBotError(error, replyToUser, contextObj);
            }
        }

        //Se for um quote para o bot e ele não estiver online, manda o desonline
        if (quotedMessage && isReplyToBot && !chatbot.isOnline){
            const sender = getSenderJid(msg);
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }

        //Se receber um comando e não estiver online, manda o desonline
        if(command.startsWith("!") && !chatbot.isOnline){
            const sender = getSenderJid(msg);
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }
    });
}

connectToWhatsApp();