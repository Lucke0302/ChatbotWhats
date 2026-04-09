const tmi = require('tmi.js');

function startTwitch(chatbot, sock) {
    const canalTwitch = 'Lucke0302';

    const client = new tmi.Client({
        channels: [ canalTwitch ]
    });

    client.connect().then(() => {
        console.log(`🟪 [TWITCH] Conectado e vigiando o chat de: ${canalTwitch}`);
    }).catch(console.error);

    client.on('message', async (channel, tags, message, self) => {
        if (self || !message.startsWith('!')) return;

        const command = message.trim();
        const sender = `${tags.username}@twitch.net`;
        const name = tags['display-name'];
        
        const from = '120363422821336011@g.us'; 

        const fakeMsg = {
            pushName: name,
            platform: 'twitch',
            reply: async (texto) => {
                client.say(channel, `@${tags.username} ${texto}`);
            },
            replyImage: async (url, caption) => {
                client.say(channel, `@${tags.username} 🖼️ [Imagem] ${caption} - Link: ${url}`);
            },
            replySticker: async (buffer) => {
            },
            replyDocument: async (path, filename, caption) => {
                client.say(channel, `@${tags.username} 📄 Não consigo enviar PDFs por aqui. Tenta pelo Zap!`);
            },
            sendTo: async (targetId, texto) => {
                if (sock) await sock.sendMessage(targetId, { text: texto });
            }
        };

        try {
            const response = await chatbot.handleCommand(
                fakeMsg, sender, from, true, command, "", sock, []
            );

            if (response && typeof response === 'string') {
                client.say(channel, `@${tags.username} ${response}`);
            }
        } catch (error) {
            console.error("❌ Erro ao processar comando da Twitch:", error);
        }
    });
}

module.exports = { startTwitch };