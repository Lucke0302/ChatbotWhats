require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const qrcode = require('qrcode-terminal');
const sqlite = require('sqlite'); 
const sqlite3 = require('sqlite3'); 
const pino = require('pino'); 
const ChatModel = require('./chatModel');
const { handleBotError } = require('./errorHandler');
const fs = require('fs');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const sharp = require('sharp');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
            [from, timestamp, myFullJid, 'Bot-Zap', text, externalId]            
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
    console.log('✅ Banco de dados SQLite inicializado e tabela `mensagens` verificada.');
}

//Recupera mensagens no banco de dados dado um limite
const getMessagesByLimit = async (db, from, limit) => {
    const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE id_conversa = '${from}' 
        AND conteudo NOT LIKE '*Resumo da conversa*%'
        ORDER BY timestamp DESC 
        LIMIT ${limit}`;
    
    const messagesDb = await db.all(sqlQuery);
    return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
};

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
        }
    });

    sock.ev.on('creds.update', saveCreds);

    //Pega as informações do bot
    const me = state.creds.me;
    myFullJid = me?.id || me?.lid || '5513991526878@s.whatsapp.net'; 
    
    //Acorda quando chega uma mensagem
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        //Pega de quem é a mensagem e verifica se é de um grupo
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        //Pega o texto da mensagem
        const texto = msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || '';

        //Joga o comando todo para letras minúsculas para evitar problemas com case-sensitive
        const command = texto.trim().toLowerCase();

        //Verifica se por algum motivo a mensagem não chegou vazia
        if (texto) {
            const id_conversa = from; 
            const id_remetente = msg.key.participant || from; 
            const nome_remetente = msg.pushName || '';
            const id_mensagem_externo = msg.key.id;
            const timestamp = msg.messageTimestamp; 


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

                if (param === 'baixa'  || param === 'podi') {
                    stickerQuality = 1;
                    try {
                        finalBuffer = await sharp(buffer)
                        .resize(16, null)
                        .toFormat('jpeg', { quality: 1 })
                        .resize(512, null, { 
                            kernel: sharp.kernel.nearest
                        })
                        .toBuffer();               
                        console.log("✅ Imagem pixelada com sucesso!");

                        if(param === 'podi'){
                            finalBuffer = await sharp(finalBuffer)
                            .resize(96, null) 
                            .toFormat('jpeg', { 
                                quality: 1, 
                                chromaSubsampling: '4:2:0',
                                mozjpeg: false
                            })
                            .blur(0.5) 
                            .resize(512, null, { 
                                kernel: sharp.kernel.nearest
                            })
                            .toBuffer();
                            console.log("✅ Imagem destruída com sucesso");
                        }
                    } catch (err) {
                        console.error("Erro ao pixelar imagem:", err);
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
            
            const sender = msg.key.participant || msg.key.remoteJid;

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
                'undefined': ''
            };

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
                const response = await chatbot.handleCommand(msg, sender, from, isGroup, command, quotedMessage);

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
            const sender = msg.key.participant || msg.key.remoteJid;            
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }

        else{
            const sender = msg.key.participant || msg.key.remoteJid;
            const replyToUser = async (text) => {
                await sendAndSave(sock, db, from, text, msg, [sender]);
            };
            const contextObj = {
                from: from,
                sender: sender,
                command: command
            };
            try{
                //Se não for grupo e o chatbot estiver online, responde a qualquer mensagem,
                //sem precisar de quote ou comando
                if(!isGroup && chatbot.isOnline){
                    const mensagem = texto.trim(); 
                    const sender = msg.key.participant || msg.key.remoteJid;
                    const senderJid = sender.split('@')[0];

                    //Verifica se deve mandar um sticker
                    await sendSticker(sock, db, from, msg, [sender], texto)
                
                    //Pega a resposta do handleCommand do chatModel.js
                    const response = await chatbot.handleMessageWithoutCommand(msg, sender, from, isGroup, command);

                    await sendAndSave(sock, db, from, response, null, [sender]);
                }
                
                //Se não estiver online, manda o sticker "desonline"
                if(!isGroup && !chatbot.isOnline){    
                    const sender = msg.key.participant || msg.key.remoteJid;   
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
            const sender = msg.key.participant || msg.key.remoteJid;

            console.log("✅ REPLY DETECTADO! Respondendo...");

            await sendSticker(sock, db, from, msg, [sender], texto)
            
            if (texto.startsWith('!')) return;

            await sock.sendMessage(from, { react: { text: "👀", key: msg.key } }); 

            const quotedMessageText = quotedMessage.conversation || 
                                quotedMessage.extendedTextMessage?.text || 
                                quotedMessage.imageMessage?.caption || 
                                "[Midia/Sticker sem texto]";

            let response
            
            try {
                const sender = msg.key.participant || msg.key.remoteJid;
                
                response = await chatbot.handleMessageWithoutCommand(msg, sender, from, isGroup, command, quotedMessageText)
                if (response && typeof response === 'string') {
                    await sendAndSave(sock, db, from, response, msg, [sender]); 
                }
            } catch (error) {
                console.error("Erro no Reply:", error);
            }
        }

        //Se for um quote para o bot e ele não estiver online, manda o desonline
        if (quotedMessage && isReplyToBot && !chatbot.isOnline){
            const sender = msg.key.participant || msg.key.remoteJid;
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }

        //Se receber um comando e não estiver online, manda o desonline
        if(command.startsWith("!") && !chatbot.isOnline){
            const sender = msg.key.participant || msg.key.remoteJid;
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }
    });
}

connectToWhatsApp();