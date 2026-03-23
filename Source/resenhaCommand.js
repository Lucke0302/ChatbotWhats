const fs = require('fs');

class ResenhaCommand {
    constructor(db, genAI) {
        this.db = db;
        this.genAI = genAI;
        this.model = 'gemma-3-27b-it'; 
    }

    async execute(ctx) {
        const { sock, from, msg } = ctx;

        if (fs.existsSync('./Assets/analise.webp')) {
            const stickerBuffer = fs.readFileSync('./Assets/analise.webp');
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: "🧐 *ANALISANDO POSSÍVEL RESENHA*" }, { quoted: msg });
        }

        const history = await this.db.all(
            `SELECT nome_remetente, conteudo FROM mensagens 
             WHERE id_conversa = ? 
             ORDER BY timestamp DESC LIMIT 40`,
            [from]
        ).catch((err) => {
            console.error("Falha no DB da Resenha:", err);
            throw new Error("SQL_ERROR"); 
        });

        if (history.length < 5) {
            throw new Error("FEW_MESSAGES");
        }

        const chatLog = history.reverse().map(row => `${row.nome_remetente}: ${row.conteudo}`).join('\n');

        console.log("--------------------------------------------------");
        console.log("[CONTEÚDO ENVIADO AO GEMMA]:");
        console.log(chatLog);
        console.log("--------------------------------------------------");

        const prompt = `
Você é o Juiz do "Tribunal da Resenha" em um grupo de WhatsApp.
Sua missão é ler as últimas mensagens do grupo e decidir se houve uma "Resenha Confirmada" ou "Resenha Cancelada".

Regras:
- Resenha Confirmada: Uma situação com potencial cômico, vergonhoso ou de duplo sentido realmente se concretizou. A piada colou, a pessoa passou vergonha, ou o grupo embarcou na zueira.
- Resenha Cancelada: A situação parecia que ia render, mas foi só um mal-entendido. Alguém cortou o clima (fiscal de felicidade), explicaram de forma séria, e a zueira não rolou.

Histórico do Chat:
"""
${chatLog}
"""

Responda ÚNICA E EXCLUSIVAMENTE com a palavra "true" se a resenha for CONFIRMADA, ou "false" se a resenha for CANCELADA. Não escreva justificativas nem nenhuma outra palavra.
        `.trim();

        const result = await this.genAI.models.generateContent({
            model: this.model,
            contents: prompt,
            config: { temperature: 0.1 }
        }).catch((err) => {
            console.error("Erro no Gemma ao julgar resenha:", err);
            throw new Error("AI_ERROR");
        });

        const isResenha = result.text.toLowerCase().includes('true'); 

        console.log(`[RESPOSTA DA IA]: "${rawResponse}"`);
        console.log(`[VEREDITO FINAL]: ${isResenha ? 'CONFIRMADA ✅' : 'CANCELADA ❌'}`);
        console.log("--------------------------------------------------\n");

        if (isResenha) {
            if (fs.existsSync('./Assets/confirmada.webp')) {
                const stickerBuffer = fs.readFileSync('./Assets/confirmada.webp');
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: "✅ *RESENHA CONFIRMADA!* O tribunal validou a resenha." }, { quoted: msg });
            }
        } else {
            if (fs.existsSync('./Assets/cancelada.webp')) {
                const stickerBuffer = fs.readFileSync('./Assets/cancelada.webp');
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: "❌ *RESENHA CANCELADA!* Não rolou nada, circulando..." }, { quoted: msg });
            }
        }

        return null; 
    }
}

module.exports = ResenhaCommand;