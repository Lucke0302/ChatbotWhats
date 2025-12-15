require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const qrcode = require('qrcode-terminal');
const sqlite = require('sqlite'); 
const sqlite3 = require('sqlite3'); 
const pino = require('pino'); 
const ChatModel = require('./chatModel');
const { handleBotError } = require('./errorHandler');
const fs = require('fs');

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

//Inicia a conexão com mo Whatsapp para fazer todas as operações
async function connectToWhatsApp() {
    await initDatabase();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'warn' }), 
    });

    //Instancia o chatbot
    const chatbot = new ChatModel(sock, db, genAI)
    
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

        //Verifica se por algum motivo a mensagem não chegou vazia
        if (texto) {
            const id_conversa = from; 
            const id_remetente = msg.key.participant || from; 
            const nome_remetente = msg.pushName || '';
            const id_mensagem_externo = msg.key.id;
            const timestamp = msg.messageTimestamp; 

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

        //Joga o comando todo para letras minúsculas para evitar problemas com case-sensitive
        const command = texto.trim().toLowerCase();

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

            //Bloco de controle NOVO, trata melhor os problemas e se comunica diretamente
            //com o chatModel.js
            try {
                const command = texto.trim(); 
                const senderJid = sender.split('@')[0];

                let reactEmoji = '';

                //Verifica os comandos e define um emoji para reagir
                if (command.startsWith('!d')) {
                    reactEmoji = '🎲';
                } else if (command.startsWith('!gpt')) {
                    reactEmoji = '🤖';
                } else if (command.startsWith('!lembrar')) {
                    reactEmoji = '🧠';
                } else if (command.startsWith('!menu')) {
                    reactEmoji = '📄';
                } else if (command.startsWith('!resumo')) {
                    reactEmoji = '🛎️';
                }
                else{
                    reactEmoji = '❓'
                }
                
                //Reaje com emoji se ele não for vazio
                if (reactEmoji) {
                    await sock.sendMessage(from, { react: { text: reactEmoji, key: msg.key } });
                }

                //Controla o envio dos stickers
                await sendSticker(sock, db, from, msg, [sender], texto)

                //Pega a resposta do handleCommand do chatModel.js
                const response = await chatbot.handleCommand(msg, sender, from, isGroup, command);
                
                //Verifica se recebeu alguma resposta
                if (response) {
                    await sendAndSave(sock, db, from, response, null, [sender]);
                }
                else{
                    if(!command.startsWith("!gpt" || "!lembrar")) await sendAndSave(sock, db, from, 'Morri kkkkkkkkkk tenta de novo aí otário.'); 
                }

                // 4. Comando !gpt
                if (command.startsWith('!gpt')) {
                    const pergunta = texto.slice(4).trim(); 
                    const nomeUsuario = msg.pushName || 'Desconhecido';
                    const sender = msg.key.participant || msg.key.remoteJid;
                    const senderJid = sender.split('@')[0];

                    if (!pergunta) {
                        throw new Error("MISSING_ARGS");
                    }

                    const mensagensFormatadas = await getMessagesByLimit(db, from, 50);

                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const promptFinal = `O usuário do WhatsApp chamado "${nomeUsuario}" te enviou a seguinte pergunta ou comando: "${pergunta}".
                    Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom de uma conversa de WhatsApp, considerando que 
                    você é um bot de WhatsApp chamado Bostossauro.
                    
                    Contexto da conversa (opcional):
                    ${mensagensFormatadas}`;

                    const result = await model.generateContent(promptFinal);
                    const response = await result.response;
                    const textResponse = response.text();

                    if(!textResponse){
                        throw new Error("AI_ERROR");
                    }
                    
                    const finalResponse = `🤖 *@${senderJid}!*\n\n${textResponse}`;

                    await sendAndSave(sock, db, from, finalResponse, null, [sender]); 
                }

                // 5. Comando !lembrar
                if (command.startsWith('!lembrar')) {
                    const pergunta = texto.slice(8).trim(); 
                    const sender = msg.key.participant || msg.key.remoteJid;
                    const senderJid = sender.split('@')[0];

                    if (!pergunta) {
                        throw new Error("MISSING_ARGS");
                    }
                    
                    await sendAndSave(sock, db, from, `🧠 Deixa eu dar uma lida nas mensagens pra ver o que rolou...`); 
                
                    const modelSql = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
                    
                    const promptSql = `Você é um gerador de consulta SQL para SQLite. Sua única saída deve ser uma consulta SQL (SELECT), sem NENHUMA explicação ou texto adicional.
                    A tabela é 'mensagens' e o campo de tempo é 'timestamp' (UNIX time em segundos).
                    O ID da conversa atual é '${from}'.
                    O usuário quer recuperar mensagens que se encaixam no período de tempo da pergunta, limitando o resultado a 500 mensagens no máximo.
                    Recupere as colunas 'nome_remetente' e 'conteudo'.
                    Use a condição WHERE para filtrar pelo id_conversa = '${from}' E pelo intervalo de tempo (timestamp).
                    A ordenação deve ser por timestamp DESC, e o limite deve ser de 500. Se a pergunta não especificar um período de tempo, recupere as últimas 500 mensagens da conversa.

                    Exemplo de saída para "o que rolou ontem": SELECT nome_remetente, conteudo FROM mensagens WHERE id_conversa = '${from}' AND timestamp BETWEEN 1764355200 AND 1764441600 ORDER BY timestamp DESC LIMIT 500;

                    Pergunta do usuário: ${pergunta}`;

                    const result = await modelSql.generateContent(promptSql);
                    const response = await result.response;
                    const resultSql = response.text();

                    let sqlQuery = resultSql;
                    console.log(sqlQuery)

                    if (!sqlQuery.toLowerCase().startsWith('select')) {
                        throw new Error("INVALID_SELECT");
                    }
                    
                    if (!sqlQuery.toLowerCase().includes('limit')) {
                        sqlQuery = sqlQuery.replace(/;?$/, ` LIMIT 200;`);
                    }
                    
                    const mensagensDb = await db.all(sqlQuery);
                    
                    if (!mensagensDb || mensagensDb.length === 0) {
                        throw new Error("NO_SQL_RESULT");
                    }

                    const mensagensFormatadas = mensagensDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
                    
                    const modelAnalise = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const promptAnalise = `Você é o Bostossauro, um bot de WhatsApp engraçado e sarcástico. 
                    Responda ao usuário (@${senderJid}) usando o contexto das mensagens fornecidas abaixo. 
                    Seja criativo, faça piadas com o conteúdo e resuma o que for relevante.
                    As mensagens estão em ordem cronológica inversa (mais recentes primeiro).

                    Pergunta original do usuário: ${pergunta}
                    Contexto das Mensagens (${mensagensDb.length} mensagens):
                    ${mensagensFormatadas}`;

                    const resultAnalise = await modelAnalise.generateContent(promptAnalise);
                    const textResposta = resultAnalise.response;
                    const responseAnalise = await textResposta.text();

                    if(!responseAnalise){
                        throw new Error("AI_ERROR");
                    }

                    const finalResponse = `🤖 *Contexto Lembrado, @${senderJid}*:\n\n${responseAnalise}`;
                    await sendAndSave(sock, db, from, finalResponse, null, [sender]);

                }  
            } catch (error) {
                await handleBotError(error, replyToUser, contextObj);
            }
        }

        //Se o chatbot estiver online e receber um comando
        else if(command.startsWith("!") &&  !chatbot.isOnline){
            const sender = msg.key.participant || msg.key.remoteJid;            
            await sendSticker(sock, db, from, msg, [sender], texto)
            return
        }

        else{
            //Se não for grupo e o chatbot estiver online, responde a qualquer mensagem,
            //sem precisar de quote ou comando
            if(!isGroup && chatbot.isOnline){
                const mensagem = texto.trim(); 
                const sender = msg.key.participant || msg.key.remoteJid;
                const senderJid = sender.split('@')[0];

                //Verifica se deve mandar um sticker
                await sendSticker(sock, db, from, msg, [sender], texto)
                
                try { 
                    //Pega a resposta do handleCommand do chatModel.js
                    const response = await chatbot.handleMessageWithoutCommand(msg, sender, from, isGroup, command);

                    await sendAndSave(sock, db, from, response, null, [sender]);

                } catch (error) {
                    console.error("❌ Erro no comando: ", error);
                    await sendAndSave(sock, db, from, '❌ Erro aaaaaaaaaaaaaaaaaaaaaaaaa.');
                }
            }
            
            //Se não estiver online, manda o sticker "desonline"
            if(!isGroup && !chatbot.isOnline){    
                const sender = msg.key.participant || msg.key.remoteJid;   
                await sendSticker(sock, db, from, msg, [sender], texto)
                //await sendAndSave(sock, db, from, "Desonline... 😴", null, [sender]);
                return
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