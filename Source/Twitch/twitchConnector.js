const tmi = require('tmi.js');

let isTwitchConnected = false;

function startTwitch(chatbot, sock) {
    if (isTwitchConnected) return; 
    
    const canaisTwitch = ['lucke0302', 'nithrar'];

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
        channels: canaisTwitch
    });

    client.connect().then(() => {
        isTwitchConnected = true;
        console.log(`🟪 [TWITCH] Conectado e vigiando os chats: ${canaisTwitch.join(', ')}`);
    }).catch(console.error);

    client.on('message', async (channel, tags, message, self) => {
        if (self) return;

        if (!message.startsWith('!')) return;

        const command = message.trim();
        const sender = `${tags.username}@twitch.net`;
        const name = tags['display-name'];
        
        const from = channel; 

        let quotedMsg = "";
        if (tags['reply-parent-msg-body']) {
            quotedMsg = tags['reply-parent-msg-body'].replace(/\\s/g, ' ');
        }

        const fakeMsg = {
            pushName: name,
            platform: 'twitch',
            reply: async (texto) => {
                const textoLimpo = texto.replace(/\n/g, ' | '); 
                client.say(channel, `@${tags.username} ${textoLimpo}`).catch(console.error);
            },
            replyImage: async (url, caption = "") => {
                const capLimpa = caption.replace(/\n/g, ' | ');
                client.say(channel, `@${tags.username} 🖼️ [Imagem] ${capLimpa} - Link: ${url}`).catch(console.error);
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
            const response = await chatbot.handleCommand(
                fakeMsg, sender, from, true, command, quotedMsg, sock, []
            );

            if (response && typeof response === 'string') {
                const responseLimpo = response.replace(/\n/g, ' | ');
                client.say(channel, `@${tags.username} ${responseLimpo}`).catch(console.error);
            }
        } catch (error) {
            console.error("❌ Erro ao processar comando da Twitch:", error);
        }
    });
}

module.exports = { startTwitch };