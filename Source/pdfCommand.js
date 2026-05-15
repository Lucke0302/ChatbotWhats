const PDFDocument = require('pdfkit');
const libre = require('libreoffice-convert');
const fs = require('fs');
const util = require('util');
const pino = require('pino');

const convertAsync = util.promisify(libre.convert);

function createPdfKitDocument(conteudo, tipo, caminhoSaida) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(caminhoSaida);

            doc.pipe(stream);

            if (tipo === 'imagem') {
                try {
                    doc.image(conteudo, {
                        fit: [495, 700],
                        align: 'center',
                        valign: 'center'
                    });
                } catch (err) {
                    doc.fontSize(14).fillColor('red').text('Erro: Imagem inválida ou corrompida.');
                }
            } 
            else if (tipo === 'texto') {
                doc.fontSize(12).fillColor('black').text(conteudo, {
                    align: 'justify',
                    indent: 20,
                    lineGap: 5
                });
            }

            doc.end();

            stream.on('finish', () => resolve(caminhoSaida));
            stream.on('error', (err) => reject(err));

        } catch (error) {
            reject(error);
        }
    });
}

async function convertOfficeToPdf(buffer) {
    return await convertAsync(buffer, '.pdf', undefined);
}

async function handlePdfCommand(ctx) {
    const { platform, reply, msg } = ctx;

    if (platform === 'twitch') {
        await reply("🚫 A Twitch não suporta envio de arquivos.");
        return null;
    }

    const tempFileName = `./temp_pdf_${Date.now()}.pdf`;

    try {
        let buffer = null;
        let isImage = false;
        let fileName = "documento";

        if (platform === 'whatsapp') {
            const { downloadMediaMessage } = require('@whiskeysockets/baileys');
            const isQuoted = !! msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMessage = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;
            
            const imageMessage = targetMessage?.imageMessage || targetMessage?.viewOnceMessage?.message?.imageMessage;
            const documentMessage = targetMessage?.documentMessage || targetMessage?.documentWithCaptionMessage?.message?.documentMessage;

            if (imageMessage) {
                isImage = true;
                fileName = 'Imagem_Convertida';
                const mediaKeys = { message: targetMessage }; 
                if(targetMessage.viewOnceMessage) mediaKeys.message = targetMessage.viewOnceMessage.message;
                buffer = await downloadMediaMessage(mediaKeys, 'buffer', { logger: pino({ level: 'silent' }) });
            } 
            else if (documentMessage) {
                fileName = documentMessage.fileName || "documento";
                const mediaToDownload = documentMessage ? { message: { documentMessage: documentMessage } } : { message: targetMessage };
                buffer = await downloadMediaMessage(mediaToDownload, 'buffer', { logger: pino({ level: 'silent' }) });
            }
        } 
        else if (platform === 'discord') {
            // if (msg.attachments.size > 0) { 
            //    buffer = await fetch(msg.attachments.first().url).then(res => res.buffer());
            // }
            await reply("⏳ A extração de anexos do Discord será ligada em breve!");
            return null;
        }

        if (!buffer) {
            await reply('📄 *Como usar o !pdf:*\n1. Mande imagem/doc com legenda !pdf\n2. Responda imagem/doc com !pdf');
            return null;
        }

        if (isImage) {
            await createPdfKitDocument(buffer, 'imagem', tempFileName);
            await sendPdfAndCleanup(ctx, tempFileName, `${fileName}.pdf`);
            return null;
        } else {
            const ext = fileName.split('.').pop().toLowerCase();
            const supported = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'txt'];

            if (!supported.includes(ext)) {
                await reply(`❌ Extensão .${ext} não suportada. Tente Word, Excel ou Texto.`);
                return null;
            }

            const pdfBuffer = await convertOfficeToPdf(buffer);
            fs.writeFileSync(tempFileName, pdfBuffer);
            
            const cleanFileName = fileName.replace(new RegExp(`\\.${ext}$`, 'i'), '');
            await sendPdfAndCleanup(ctx, tempFileName, `${cleanFileName}.pdf`);
            return null;
        }

    } catch (error) {
        console.error("Erro no Handler PDF:", error);
        await reply('❌ Ocorreu um erro ao gerar o PDF.');
        return null;
    }
}

async function sendPdfAndCleanup(ctx, filePath, fileName) {
    if (fs.existsSync(filePath)) {
        await ctx.replyDocument(filePath, fileName, '🦖 Tá na mão seu PDF.');
        fs.unlinkSync(filePath);
    }
}

module.exports = { handlePdfCommand };