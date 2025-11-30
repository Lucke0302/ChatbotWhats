require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const qrcode = require('qrcode-terminal');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const groupHistory = {}; 

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
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

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        const texto = msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || '';

        if (!texto) return;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;
        const replyParticipant = contextInfo?.participant;

        const me = state.creds.me;
        
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
                    await sock.sendMessage(from, { text: '❌ Poucas mensagens para resumir. Conversem mais um pouco!' });
                    return;
                }

                await sock.sendMessage(from, { text: '🤖 Ces falam demais, preciso ler tudo...' });

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

                    await sock.sendMessage(from, { text: text });
                } catch (error) {
                    console.error(error);
                    await sock.sendMessage(from, { text: 'Morri kkkkkkkkkk tenta de novo aí.' });
                }
            }

            // 2. Comando !d
            if (command.startsWith('!d')) {            
                var pergunta = texto.slice(2).trim(); 
                if(isNaN(pergunta) || pergunta === ""){
                    await sock.sendMessage(from, { text: `Digita um número válido, imbecil` });
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

                    await sock.sendMessage(from, { text: `🎲 O dado caiu em: *${val}* \n${mssg}` });
                }
            }

            // 3. Comando !menu
            if (command === '!menu') {
                await sock.sendMessage(from, { text: `📍 Os comandos até agora são: \n!d{número}: Número aleatório (ex: !d20)\n!gpt {texto}: Pergunta pra IA\n!resumo: Resume a conversa` });
            }

            // 4. Comando !gpt
            if (command.startsWith('!gpt')) {
                const pergunta = texto.slice(4).trim(); 
                const nomeUsuario = msg.pushName || 'Desconhecido';
                const sender = msg.key.participant || msg.key.remoteJid;

                if (!pergunta) {
                    await sock.sendMessage(from, { 
                        text: `⚠️ *Opa, @${sender.split('@')[0]}!* \ntem que escrever alguma coisa depois do comando, burre`,
                        mentions: [sender]
                    });
                    return;
                }

                await sock.sendMessage(from, { text: '🧠 Eu sabo...' }); 

                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const promptFinal = `O usuário do WhatsApp chamado "${nomeUsuario}" te enviou a seguinte pergunta ou comando: "${pergunta}".
                    Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom de uma conversa de WhatsApp.
                    
                    Contexto da conversa (opcional):
                    ${groupHistory[from] ? groupHistory[from].join('\n') : ''}`;

                    const result = await model.generateContent(promptFinal);
                    const response = await result.response;
                    const textResposta = response.text();

                    await sock.sendMessage(from, { 
                        text: `🤖 *@${sender.split('@')[0]}!*\n\n${textResposta}`,
                        mentions: [sender]
                    });

                } catch (error) {
                    console.error("Erro na IA:", error);
                    await sock.sendMessage(from, { text: '❌ A IA pifou ou tá dormindo. Tenta de novo já já.' });
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

                await sock.sendMessage(from, { 
                    text: textReply,
                    mentions: [sender]
                }, { quoted: msg });

            } catch (error) {
                console.error("Erro no Reply:", error);
            }
        }
    });
}

connectToWhatsApp();