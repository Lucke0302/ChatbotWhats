const tmi = require('tmi.js');

function startTwitch(chatbot, sock) {
    const canalTwitch = 'lucke0302';

    const client = new tmi.Client({
        options: { debug: false },
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: process.env.TWITCH_USERNAME, 
            password: process.env.TWITCH_OAUTH 
        },
        channels: [ canalTwitch ]
    });

    client.connect().then(() => {
        console.log(`🟪 [TWITCH] Conectado e vigiando o chat de: ${canalTwitch}`);
    }).catch(console.error);

    client.on('message', async (channel, tags, message, self) => {
        if (self) return;

        if (!message.startsWith('!')) return;

        console.log(`🚀 [TWITCH COMANDO] ${tags.username} mandou: ${message}`);

        const command = message.trim();
        const sender = `${tags.username}@twitch.net`;
        const name = tags['display-name'];
        const from = '120363422821336011@g.us'; 

        const fakeMsg = {
            pushName: name,
            platform: 'twitch',
            reply: async (texto) => {
                const textoLimpo = texto.replace(/\n/g, ' | '); 
                console.log(`🗣️ [TWITCH RESPONDENDO]: ${textoLimpo.substring(0, 50)}...`);
                
                client.say(channel, `@${tags.username} ${textoLimpo}`).catch(err => {
                    console.error("❌ ERRO AO ENVIAR MENSAGEM NA TWITCH:", err);
                });
            },
            replyImage: async (url, caption = "") => {
                console.log(`🖼️ [TWITCH RESPONDENDO IMAGEM]`);
                client.say(channel, `@${tags.username} 🖼️ [Imagem] ${caption} - Link: ${url}`).catch(console.error);
            },
            replySticker: async (buffer) => { },
            replyDocument: async (path, filename, caption) => {
                client.say(channel, `@${tags.username} 📄 Não consigo enviar PDFs por aqui. Tenta pelo Zap!`).catch(console.error);
            },
            sendTo: async (targetId, texto) => {
                if (sock) await sock.sendMessage(targetId, { text: texto });
            }
        };

        try {
            console.log(`🧠 [TWITCH] Enviando para o ChatModel...`);
            
            const response = await chatbot.handleCommand(
                fakeMsg, sender, from, true, command, "", sock, []
            );

            if (response && typeof response === 'string') {
                const responseLimpo = response.replace(/\n/g, ' | ');
                console.log(`🗣️ [TWITCH RESPONDENDO RETURN]: ${responseLimpo.substring(0, 50)}...`);
                client.say(channel, `@${tags.username} ${responseLimpo}`).catch(console.error);
            }
        } catch (error) {
            console.error("❌ Erro ao processar comando da Twitch:", error);
        }
    });
}

module.exports = { startTwitch };