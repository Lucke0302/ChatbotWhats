const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const PDFDocument = require('pdfkit');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const pino = require('pino');

const convertAsync = util.promisify(libre.convert);

function createPdfKitDocument(conteudo, tipo, caminhoSaida) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(caminhoSaida);

            doc.pipe(stream);
            
            doc.fontSize(8).fillColor('grey').text('Gerado por Bostossauro Bot', { align: 'right' });
            doc.moveDown();

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

async function handlePdfCommand(sock, msg, from) {
    const isQuoted = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    const targetMessage = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;
    
    const conversationText = msg.message?.conversation || 
                             msg.message?.extendedTextMessage?.text || 
                             msg.message?.documentMessage?.caption || 
                             msg.message?.imageMessage?.caption || "";
                             
    const textToConvert = conversationText.replace(/^!pdf\s*/i, '').trim();

    const imageMessage = targetMessage?.imageMessage || targetMessage?.viewOnceMessage?.message?.imageMessage;

    const documentMessage = targetMessage?.documentMessage || 
                            targetMessage?.documentWithCaptionMessage?.message?.documentMessage;

    const tempFileName = `./temp_pdf_${Date.now()}.pdf`;

    try {
        await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

        if (imageMessage) {
            const mediaKeys = { message: targetMessage }; 
            if(targetMessage.viewOnceMessage) mediaKeys.message = targetMessage.viewOnceMessage.message;

            const buffer = await downloadMediaMessage(mediaKeys, 'buffer', { logger: pino({ level: 'silent' }) });
            await createPdfKitDocument(buffer, 'imagem', tempFileName);
            await sendPdfAndCleanup(sock, from, tempFileName, 'Imagem_Convertida.pdf', msg);
            return;
        }

        if (documentMessage) {
            const fileName = documentMessage.fileName || "documento";
            const ext = fileName.split('.').pop().toLowerCase();
            const supported = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'txt'];

            if (!supported.includes(ext)) {
                await sock.sendMessage(from, { text: `❌ Extensão .${ext} não suportada. Tente Word, Excel ou Texto.` }, { quoted: msg });
                return;
            }

            const mediaToDownload = documentMessage ? { message: { documentMessage: documentMessage } } : { message: targetMessage };

            const buffer = await downloadMediaMessage(mediaToDownload, 'buffer', { logger: pino({ level: 'silent' }) });

            const pdfBuffer = await convertOfficeToPdf(buffer);
            
            fs.writeFileSync(tempFileName, pdfBuffer);
            await sendPdfAndCleanup(sock, from, tempFileName, `${fileName}.pdf`, msg);
            return;
        }

        if (textToConvert.length > 0) {
            await createPdfKitDocument(textToConvert, 'texto', tempFileName);
            await sendPdfAndCleanup(sock, from, tempFileName, 'Texto.pdf', msg);
            return;
        }

        await sock.sendMessage(from, { text: '📄 *Como usar o !pdf:*\n1. Mande imagem/doc com legenda !pdf\n2. Responda imagem/doc com !pdf' }, { quoted: msg });

    } catch (error) {
        console.error("Erro no Handler PDF:", error);
        await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao gerar o PDF.' }, { quoted: msg });
    }
}

async function sendPdfAndCleanup(sock, from, filePath, fileName, quotedMsg) {
    if (fs.existsSync(filePath)) {
        await sock.sendMessage(from, { 
            document: fs.readFileSync(filePath), 
            mimetype: 'application/pdf', 
            fileName: fileName,
            caption: '🦖 Tá na mão seu PDF.'
        }, { quoted: quotedMsg });

        await sock.sendMessage(from, { react: { text: '✅', key: quotedMsg.key } });

        fs.unlinkSync(filePath);
    }
}

module.exports = { handlePdfCommand };