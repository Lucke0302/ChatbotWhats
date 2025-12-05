require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const qrcode = require('qrcode-terminal');
const sqlite = require('sqlite'); 
const sqlite3 = require('sqlite3'); 
const pino = require('pino'); 
const ChatModel = require('./chatModel');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const groupHistory = {}; 
const DB_PATH = 'chat_history.db'; 
let db; 
let myFullJid;

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

const sendAndSave = async (sock, database, from, text, msgKey = null, mentions = []) => {
    const sentMessage = await sock.sendMessage(from, { 
        text: text, 
        mentions: mentions 
    }, { quoted: msgKey });
    
    await saveBotMessage(database, from, text, sentMessage.key.id);
};

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

const getMessageCount = async (db, from) => {
    const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE id_conversa = '${from}'`;
    const result = await db.get(sqlQuery); 
    return result ? result.total : 0;
};

const getMessagesByLimit = async (db, from, limit) => {
    const sqlQuery = `SELECT nome_remetente, conteudo 
    FROM mensagens 
    WHERE id_conversa = '${from}' 
    ORDER BY timestamp DESC 
    LIMIT ${limit}`;
    
    const messagesDb = await db.all(sqlQuery);
    return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
};

async function connectToWhatsApp() {
    await initDatabase();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'warn' }), 
    });

    const chatbot = new ChatModel(sock, db, genAI)

    
    const getSticker = async(command) =>{
        return await chatbot.getSticker(command)
    }
    
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

    const me = state.creds.me;
    myFullJid = me?.id || me?.lid || '5513991526878@s.whatsapp.net'; 
    
    
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        const texto = msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || '';

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

        if (!texto) return;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;
        const replyParticipant = contextInfo?.participant;

        const myPhone = me?.id ? me.id.split(':')[0].split('@')[0] : ''; 
        const myLid = me?.lid ? me.lid.split(':')[0].split('@')[0] : '';   

        const replyNumber = replyParticipant ? replyParticipant.split(':')[0].split('@')[0] : '';

        const isReplyToBot = replyNumber && (replyNumber === myPhone || replyNumber === myLid);

        if (quotedMessage) {
            console.log(`💬 DETECTEI UMA RESPOSTA!`);
            console.log(`   Quem foi respondido (Clean): ${replyNumber}`);
            console.log(`   Meus IDs: Phone=${myPhone} | LID=${myLid}`);
            console.log(`   É pra mim? ${isReplyToBot ? 'SIM ✅' : 'NÃO ❌'}`);
        }

        if (isGroup) {
            if (!groupHistory[from]) groupHistory[from] = [];
            const pushName = msg.pushName || 'Desconhecido';
            groupHistory[from].push(`${pushName}: ${texto}`);
            if (groupHistory[from].length > 200) groupHistory[from].shift();
        }

        const command = texto.trim().toLowerCase();

        if(command.startsWith("!") &&  chatbot.isOnline && command.length > 1){

            // 1. Comando !resumo
            if (command.startsWith('!resumo') && isGroup) {                
                const sender = msg.key.participant || msg.key.remoteJid;
                tamanho = command.split(' ')
                if (getMessageCount(db, from) < 5) {
                    await sendAndSave(sock, db, from, '❌ Poucas mensagens para resumir. Conversem mais um pouco!'); 
                    return;
                }      
                
                await sendSticker(sock, db, from, msg, [sender], texto)

                const numero = parseInt(tamanho[2]);

                if(!isNaN(numero) && numero > 0 && numero <= 500){
                    console.log("Limite definido dinamicamente")
                    mensagensFormatadas = await getMessagesByLimit(db, from, tamanho[2]);
                }else{mensagensFormatadas = await getMessagesByLimit(db, from, 500);}

                //await sendAndSave(sock, db, from, '🤖 Ces falam demais, preciso ler tudo...'); 

                complemento = " ";

                switch(tamanho[1]){
                    case "curto":
                        complemento = "Responda de maneira concisa, dois ou três parágrafos."
                        break;
                    case "médio":
                        complemento = "Responda com certa concisão (até 2 linhas pra cada assunto), limite em no máximo 5 assuntos."
                    case "completo":
                        complemento = "Se aprofunde (até 5 linhas) em cada assunto"
                }

                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
                    const prompt = `Você é um bot de WhatsApp engraçado e sarcástico num grupo de amigos, chamado Bostossauro. 
                    Resuma a conversa abaixo destacando os tópicos principais e quem falou mais besteira.
                    Use tópicos para resumir a conversa.
                    Nenhum deles vai achar qualquer brincadeira ruim, pode falar o que quiser e fazer piadas.
                    Responda indicando, no primeiro parágrafo, quantas mensagens foram recuperadas.
                    ${complemento}
                    
                    Conversa:
                    ${mensagensFormatadas}`;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    await sendAndSave(sock, db, from, text); 
                } catch (error) {
                    console.error(error);
                    await sendAndSave(sock, db, from, 'Morri kkkkkkkkkk tenta de novo aí otário.'); 
                }
            }
            // 4. Comando !gpt
            if (command.startsWith('!gpt')) {
                const pergunta = texto.slice(4).trim(); 
                const nomeUsuario = msg.pushName || 'Desconhecido';
                const sender = msg.key.participant || msg.key.remoteJid;
                const senderJid = sender.split('@')[0];

                if (!pergunta) {
                    const responseText = `⚠️ *Opa, @${senderJid}!* \ntem que escrever alguma coisa depois do comando, burre`;
                    await sendAndSave(sock, db, from, responseText, null, [sender]); 
                    return;
                }

                await sendSticker(sock, db, from, msg, [sender], texto)

                await sendAndSave(sock, db, from, '🧠 Eu sabo...'); 

                const mensagensFormatadas = await getMessagesByLimit(db, from, 50);

                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const promptFinal = `O usuário do WhatsApp chamado "${nomeUsuario}" te enviou a seguinte pergunta ou comando: "${pergunta}".
                    Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom de uma conversa de WhatsApp, considerando que 
                    você é um bot de WhatsApp chamado Bostossauro.
                    
                    Contexto da conversa (opcional):
                    ${mensagensFormatadas}`;

                    const result = await model.generateContent(promptFinal);
                    const response = await result.response;
                    const textResposta = response.text();
                    
                    const finalResponse = `🤖 *@${senderJid}!*\n\n${textResposta}`;

                    await sendAndSave(sock, db, from, finalResponse, null, [sender]); 

                } catch (error) {
                    console.error("Erro na IA:", error);
                    await sendAndSave(sock, db, from, '❌ A IA pifou ou tá dormindo. Tenta de novo já já.'); 
                }
            }

            // 5. Comando !lembrar
            if (command.startsWith('!lembrar')) {
                const pergunta = texto.slice(8).trim(); 
                const sender = msg.key.participant || msg.key.remoteJid;
                const senderJid = sender.split('@')[0];

                if (!pergunta) {
                    const responseText = `⚠️ *Opa, @${senderJid}!* \nDiga ao bot o que ele precisa lembrar e quando. Ex: !lembrar o que o João disse sobre o jogo hoje?`;
                    await sendAndSave(sock, db, from, responseText, null, [sender]); 
                    return;
                }

                await sendSticker(sock, db, from, msg, [sender], texto)
                
                await sendAndSave(sock, db, from, `🧠 Deixa eu dar uma lida nas mensagens pra ver o que rolou...`); 
                
                try {
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
                        console.error("ERRO: IA não retornou um SELECT válido:", sqlQuery);
                        await sendAndSave(sock, db, from, '❌ A IA pirou e não me deu a query SQL. Tenta ser mais específico na pergunta.');
                        return;
                    }
                    
                    if (!sqlQuery.toLowerCase().includes('limit')) {
                        sqlQuery = sqlQuery.replace(/;?$/, ` LIMIT 500;`);
                    }
                    
                    const mensagensDb = await db.all(sqlQuery);
                    
                    if (!mensagensDb || mensagensDb.length === 0) {
                        await sendAndSave(sock, db, from, `Não encontrei nenhuma mensagem para o período que você pediu, @${senderJid}. Falha crítica.`);
                        return;
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

                    console.log(responseAnalise)

                    const finalResponse = `🤖 *Contexto Lembrado, @${senderJid}*:\n\n${responseAnalise}`;
                    await sendAndSave(sock, db, from, finalResponse, null, [sender]);

                } catch (error) {
                    console.error("❌ Erro no comando !lembrar:", error);
                    await sendAndSave(sock, db, from, '❌ Erro tentando lembrar, to com alzheimer.');
                }
            }  

            //Bloco de controle NOVO
            try {
                const mensagem = texto.trim(); 
                const sender = msg.key.participant || msg.key.remoteJid;
                const senderJid = sender.split('@')[0];

                let reactEmoji = '';

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

                if (reactEmoji) {
                    await sock.sendMessage(from, { react: { text: reactEmoji, key: msg.key } });
                }

                const response = await chatbot.handleCommand(msg, sender, from, isGroup, mensagem);
                
                if (response) {
                    await sendAndSave(sock, db, from, response, null, [sender]);
                }
            } catch (error) {
                if (error.message === "FEW_MESSAGES") {
                    await sendAndSave(sock, db, from, '❌ Poucas mensagens para resumir. Conversem mais um pouco!');
                } else {
                    console.error("❌ Erro ao processar comando:", error);
                    await sendAndSave(sock, db, from, '😵 Ocorreu um erro interno ao processar seu comando.');
                }
            }
        }

        else if(command.startsWith("!") &&  !chatbot.isOnline){
            const sender = msg.key.participant || msg.key.remoteJid;            
            await sendSticker(sock, db, from, msg, [sender], texto)
            //await sendAndSave(sock, db, from, "Desonline... 😴", null, [sender]);
            return
        }

        else{
            //"endpoint" de testes.
            if(!isGroup && msg.key.remoteJid == "5513991008854@s.whatsapp.net" && chatbot.isTesting){
                const mensagem = texto.trim(); 
                const sender = msg.key.participant || msg.key.remoteJid;
                const senderJid = sender.split('@')[0];

                await sendSticker(sock, db, from, msg, [sender], texto)

                response = await chatbot.handleCommand(msg, sender, from, isGroup, mensagem)

                await sendAndSave(sock, db, from, response, null, [sender]);

                return
            }
            //Fim do "endpoint" de testes.

            if(!isGroup && chatbot.isOnline){
                const mensagem = texto.trim(); 
                const sender = msg.key.participant || msg.key.remoteJid;
                const senderJid = sender.split('@')[0];

                await sendSticker(sock, db, from, msg, [sender], texto)
                
                try {                    
                    const modelAnalise = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const mensagensFormatadas = getMessagesByLimit(db, from, 500);

                    const promptAnalise = `Mensagem do usuário: ${mensagem}
                    Contexto das Mensagens (Cada {nome}| simboliza um início de mensagem, o seu é Bot-Zap no banco de dados, não precisa apresentar
                    pro usuário):
                    ${mensagensFormatadas}
                    Você é o Bostossauro, um bot de WhatsApp engraçado e sarcástico. 
                    Responda ao usuário (@${senderJid}) usando o contexto das mensagens fornecidas abaixo. 
                    Converse como fosse uma conversa entre dois amigos, trate o contexto das mensagens como o histórico de conversas com a pessoa.
                    As mensagens estão em ordem cronológica inversa (mais recentes primeiro).`;

                    const resultAnalise = await modelAnalise.generateContent(promptAnalise);
                    const textResposta = resultAnalise.response;
                    const responseAnalise = await textResposta.text();

                    const finalResponse = `🤖 ${responseAnalise}`;
                    await sendAndSave(sock, db, from, finalResponse, null, [sender]);

                } catch (error) {
                    console.error("❌ Erro no comando: ", error);
                    await sendAndSave(sock, db, from, '❌ Erro tentando lembrar, to com alzheimer.');
                }
            }
            
            if(!isGroup && !chatbot.isOnline){    
                const sender = msg.key.participant || msg.key.remoteJid;   
                await sendSticker(sock, db, from, msg, [sender], texto)
                //await sendAndSave(sock, db, from, "Desonline... 😴", null, [sender]);
                return
            }
        }
        if (quotedMessage && isReplyToBot && chatbot.isOnline) {
            const sender = msg.key.participant || msg.key.remoteJid;

            console.log("✅ REPLY DETECTADO! Respondendo...");

            await sendSticker(sock, db, from, msg, [sender], texto)
            
            if (texto.startsWith('!')) return;

            await sock.sendMessage(from, { react: { text: "👀", key: msg.key } }); 

            const textoOriginal = quotedMessage.conversation || 
                                quotedMessage.extendedTextMessage?.text || 
                                quotedMessage.imageMessage?.caption || 
                                "[Midia/Sticker sem texto]";

            try {
                const sender = msg.key.participant || msg.key.remoteJid;
                const nomeUsuario = msg.pushName || 'Amigo';
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const mensagensFormatadas = getMessagesByLimit(db, from, 50);

                const promptReply = `Contexto: Você é um bot de WhatsApp.
                O usuário "${nomeUsuario}" está te respondendo.
                
                O que VOCÊ (Bot) tinha falado antes: "${textoOriginal}"
                O que o USUÁRIO respondeu agora: "${texto}"
                
                Analise a resposta dele com base no que você falou antes. Responda de forma natural e contínua.
                
                Contexto das últimas 50 mensagens (ignore se não fizer sentido utilizar): ${mensagensFormatadas}`;

                const result = await model.generateContent(promptReply);
                const response = await result.response;
                const textReply = response.text();

                await sendAndSave(sock, db, from, textReply, msg, [sender]); 

            } catch (error) {
                console.error("Erro no Reply:", error);
            }
        }
        if (quotedMessage && isReplyToBot && !chatbot.isOnline){
            const sender = msg.key.participant || msg.key.remoteJid;
            await sendSticker(sock, db, from, msg, [sender], texto)
            //await sendAndSave(sock, db, from, "Desonline... 😴", msg, [sender]);
            return
        }
        if(command.startsWith("!") && !chatbot.isOnline){
            const sender = msg.key.participant || msg.key.remoteJid;
            await sendSticker(sock, db, from, msg, [sender], texto)
            //await sendAndSave(sock, db, from, "Desonline... 😴", msg, [sender])
            return
        }
    });
}

connectToWhatsApp();