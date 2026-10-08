const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
// 🛡️ [FASE 2 - SEGURANÇA] Referências VIVAS: o conector nunca captura o `sock`
// ou o `chatbot` da primeira conexão em closure. Após um restart do Baileys
// esses objetos viram zumbis (socket morto) e os envios falham silenciosamente.
const { getGlobalSock, getGlobalChatbot } = require('../globalState');

let isDiscordConnected = false;

const discordCommandEmojis = {
    '!d': '🎲', '!menu': '📄', '!resumo': '🛎️', '!gpt': '🤖', '!lembrar': '🧠',
    '!sticker': '🪄', '!s': '🪄', '!lol': '🎮', '!timeout': '✅', '!notas': '✏️',
    '!clima': '🌡️', '!tradutor': '🧐', '!cotacao': '💵', '!investir': '📈', 
    '!ajuda': '🆘', '!help': '🆘', '!pdf': '⚙️', '!burro': '🤓', '!toxico': '☢️', 
    '!falador': '🗣️', '!audio': '🗣️', '!poke': '🎮', '!resenha': '🧐',
    '!cassino': '🎰', '!pix': '💸', '!minhabosta': '🪙', '!trabalhar': '💼',
    '!pescar': '🎣', '!pescaria': '🎣', '!parque': '🦖', '!escavar': '⛏️', 
    '!fazenda': '🚜', '!cidade': '📍', '!admin': '🔐'
};

function startDiscord() {
    if (isDiscordConnected) return;

    // Consome o getter SEM guardar a referência (nada de instância zumbi retida)
    if (!getGlobalChatbot()) {
        console.warn('⚠️ [DISCORD] ChatModel indisponível. Discord não iniciado.');
        return;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    client.once('clientReady', () => {
        isDiscordConnected = true;
        console.log(`🔵 [DISCORD] Conectado e vigiando como: ${client.user.tag}`);
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        if (!message.content.startsWith('!')) return;

        // 🔄 Consome SEMPRE a conexão WhatsApp ATIVA (nunca a da primeira conexão)
        const sock = getGlobalSock();
        const activeChatbot = getGlobalChatbot();
        if (!activeChatbot) return; // Baileys reiniciando: ignora o comando

        const command = message.content.trim();
        
        const senderDiscord = `${message.author.id}@discord`;
        const name = message.author.globalName || message.author.username;
        const from = message.channel.id; 
        const isGroup = message.guild !== null;

        let sender = senderDiscord; 
        try {
            const link = await activeChatbot.db.get("SELECT id_whatsapp FROM contas_linkadas WHERE id_discord = ?", [senderDiscord]);
            if (link && link.id_whatsapp) {
                sender = link.id_whatsapp; 
                console.log(`🔗 [DISCORD] Usuário reconhecido: ${name} -> ${sender}`);
            }
        } catch (err) {
            console.error("Erro ao checar link de contas no Discord:", err);
        }
        let quotedMsg = "";
        if (message.reference) {
            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                quotedMsg = referencedMessage.content;
            } catch (e) {
                console.error("Erro ao buscar mensagem respondida:", e);
            }
        }

        const fakeMsg = {
            pushName: name,
            platform: 'discord',
            
            reply: async (texto) => {
                if (texto.length > 2000) {
                    const chunks = texto.match(/[\s\S]{1,1999}/g);
                    for (const chunk of chunks) {
                        await message.reply({ content: chunk });
                    }
                } else {
                    await message.reply({ content: texto });
                }
            },
            
            replyImage: async (url, caption = "") => {
                await message.reply({ 
                    content: caption, 
                    files: [url] 
                });
            },
            
            replySticker: async (buffer) => {
                if (!buffer) return;
                const attachment = new AttachmentBuilder(buffer, { name: 'sticker.webp' });
                await message.reply({ files: [attachment] });
            },
            
            replyDocument: async (path, filename, caption = "") => {
                if (!fs.existsSync(path)) {
                    await message.reply({ content: "📄 O arquivo sumiu da minha base!" });
                    return;
                }
                const attachment = new AttachmentBuilder(path, { name: filename });
                await message.reply({ content: caption, files: [attachment] });
            },
            
            sendTo: async (targetId, texto) => {
                try {
                    const channel = await client.channels.fetch(targetId);
                    if (channel) await channel.send(texto);
                } catch (e) {
                    if (sock && targetId.includes('@s.whatsapp.net')) {
                        await sock.sendMessage(targetId, { text: texto });
                    }
                }
            },

            react: async (emoji) => {
                try {
                    await message.react(emoji);
                } catch (e) {
                    console.error("❌ Erro ao reagir no Discord:", e.message);
                }
            },
        };

        const baseCommand = command.split(' ')[0].toLowerCase();
        const emojiToReact = discordCommandEmojis[baseCommand];

        if (emojiToReact) {
            await fakeMsg.react(emojiToReact);
        } else {
            await fakeMsg.react('🤨');
        }

        try {
            const response = await activeChatbot.handleCommand(
                fakeMsg, sender, from, isGroup, command, quotedMsg, sock, []
            );

            if (response && typeof response === 'string') {
                if (response.length > 2000) {
                    const chunks = response.match(/[\s\S]{1,1999}/g);
                    for (const chunk of chunks) {
                        await message.reply({ content: chunk });
                    }
                } else {
                    await message.reply({ content: response });
                }
            }
        } catch (error) {
            console.error("❌ Erro ao processar comando do Discord:", error);
        }
    });

    client.login(process.env.DISCORD_TOKEN).catch(console.error);
}

module.exports = { startDiscord };