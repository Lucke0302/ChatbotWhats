require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const qrcode = require('qrcode-terminal');
const sqlite = require('sqlite'); 
const sqlite3 = require('sqlite3'); 
const pino = require('pino'); 

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

async function connectToWhatsApp() {
    await initDatabase();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'warn' }), 
    });

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

        if(command.startsWith("!")){
            // 1. Comando !resumo
            if (command === '!resumo' && isGroup) {
                if (!groupHistory[from] || groupHistory[from].length < 5) {
                    await sendAndSave(sock, db, from, '❌ Poucas mensagens para resumir. Conversem mais um pouco!'); 
                    return;
                }

                await sendAndSave(sock, db, from, '🤖 Ces falam demais, preciso ler tudo...'); 

                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
                    const prompt = `Você é um bot de WhatsApp engraçado e sarcástico num grupo de amigos. 
                    Resuma a conversa abaixo destacando os tópicos principais e quem falou mais besteira.
                    Nenhum deles vai achar qualquer brincadeira ruim, pode falar o que quiser e fazer piadas.
                    
                    Conversa:
                    ${groupHistory[from].join('\n')}`;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    await sendAndSave(sock, db, from, text); 
                } catch (error) {
                    console.error(error);
                    await sendAndSave(sock, db, from, 'Morri kkkkkkkkkk tenta de novo aí.'); 
                }
            }

            // 2. Comando !d
            if (command.startsWith('!d')) {            
                var pergunta = texto.slice(2).trim(); 
                if(isNaN(pergunta) || pergunta === ""){
                    await sendAndSave(sock, db, from, `Digita um número válido, imbecil`); 
                }
                else{                
                    const max = parseInt(pergunta);
                    const val = Math.floor(Math.random() * max) + 1;
                    let mssg = "";
                    
                    if(val == 1) mssg = "❌ FALHA CRÍTICA!"
                    else if(val < max/2) mssg = "🫠 meh."
                    else if(val < max/1.5) mssg = "🫤 até que não foi ruim."
                    else if(val < max) mssg = "😎 nice."
                    else if(val == max) mssg = "🎰 SORTE GRANDE!"
                    
                    const responseText = `🎲 O dado caiu em: *${val}* \n${mssg}`;

                    await sendAndSave(sock, db, from, responseText); 
                }
            }

            // 3. Comando !menu
            if (command === '!menu') {
                const responseText = `📍 Os comandos até agora são: \n!d{número}: Número aleatório (ex: !d20)\n!gpt {texto}: Pergunta pra IA\n!resumo: Resume a conversa`;
                await sendAndSave(sock, db, from, responseText); 
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

                await sendAndSave(sock, db, from, '🧠 Eu sabo...'); 

                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const promptFinal = `O usuário do WhatsApp chamado "${nomeUsuario}" te enviou a seguinte pergunta ou comando: "${pergunta}".
                    Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom de uma conversa de WhatsApp.
                    
                    Contexto da conversa (opcional):
                    ${groupHistory[from] ? groupHistory[from].join('\n') : ''}`;

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

            
        }
        if (quotedMessage && isReplyToBot) {

            console.log("✅ REPLY DETECTADO! Respondendo...");
            
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

                const promptReply = `Contexto: Você é um bot de WhatsApp.
                O usuário "${nomeUsuario}" está te respondendo.
                
                O que VOCÊ (Bot) tinha falado antes: "${textoOriginal}"
                O que o USUÁRIO respondeu agora: "${texto}"
                
                Analise a resposta dele com base no que você falou antes. Responda de forma natural e contínua.`;

                const result = await model.generateContent(promptReply);
                const response = await result.response;
                const textReply = response.text();

                await sendAndSave(sock, db, from, textReply, msg, [sender]); 

            } catch (error) {
                console.error("Erro no Reply:", error);
            }
        }
    });
}

connectToWhatsApp();