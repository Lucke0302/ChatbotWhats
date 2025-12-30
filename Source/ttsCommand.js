const googleTTS = require('google-tts-api');

/**
 * Transforma texto em áudio usando Google TTS (Free)
 */
async function handleAudioCommand(sock, from, command, msg) {
    let text = command.replace(/^!audio\s*/i, '').trim();

    const isQuoted = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!text && isQuoted) {
        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "";
    }

    if (!text) {
        await sock.sendMessage(from, { text: '❌ Digita o texto ou responde uma mensagem: *!audio {linguagem} {O que você quer que eu fale}*' }, { quoted: msg });
        return;
    }

    let lang = 'pt';
    const firstWord = text.split(' ')[0];
    
    const commonLangs = ['pt', 'en', 'es', 'ja', 'fr', 'de', 'it', 'ru', 'ko', 'zh'];

    if (firstWord.length === 2 && commonLangs.includes(firstWord.toLowerCase())) {
        lang = firstWord.toLowerCase();
        text = text.substring(3).trim();
    }

    if (text.length > 200) {
        await sock.sendMessage(from, { text: '❌ Texto muito longo! O limite do Google Free é 200 caracteres (se quiser mais, patrocina o dev).' }, { quoted: msg });
        return;
    }

    try {
        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        await sock.sendMessage(from, { 
            audio: { url: url }, 
            mimetype: 'audio/mp4',
            ptt: true 
        }, { quoted: msg });

    } catch (error) {
        console.error("Erro no TTS:", error);
        await sock.sendMessage(from, { text: '❌ Erro ao gerar áudio.' }, { quoted: msg });
    }
}

module.exports = { handleAudioCommand };