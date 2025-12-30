const googleTTS = require('google-tts-api');

/**
 * Transforma texto em áudio usando Google TTS (Baixando o buffer)
 */
async function handleAudioCommand(sock, from, command, msg) {

    let text = command.replace(/^!audio\s*/i, '').trim();

    const isQuoted = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!text && isQuoted) {
        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "";
    }

    if (!text) {
        await sock.sendMessage(from, { text: '❌ Digita o texto ou responde uma mensagem: *!audio O que você quer que eu fale*' }, { quoted: msg });
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
        text = text.substring(0, 200);
        await sock.sendMessage(from, { text: '❌ Mensagem cortada no caracter 200 (se quiser mais, patrocina o dev).' }, { quoted: msg });
    }

    try {
        const base64Audio = await googleTTS.getAudioBase64(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        const audioBuffer = Buffer.from(base64Audio, 'base64');

        await sock.sendMessage(from, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg',
            ptt: true 
        }, { quoted: msg });

    } catch (error) {
        console.error("Erro no TTS:", error);
        if(error.message.includes("text should be less than")) {
             await sock.sendMessage(from, { text: '❌ Texto muito grande pro Google, ele cansou (se quiser mais cota, patrocina o dev).' }, { quoted: msg });
        } else {
             await sock.sendMessage(from, { text: '❌ Não consegui gerar o áudio. O Google tá de mal.' }, { quoted: msg });
        }
    }
}

module.exports = { handleAudioCommand };