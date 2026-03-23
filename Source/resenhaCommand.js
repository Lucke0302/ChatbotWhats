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
Sua missão é ler as últimas mensagens e classificar o nível da "Resenha" (zueira, humilhação cômica, piadas) em uma das três categorias abaixo.

Regras de Classificação:
1. CONFIRMADA: O ápice do entretenimento. Caos absoluto. Alguém tomou uma invertida gigante, passou muita vergonha, ou a piada foi tão lendária que o grupo explodiu de rir (muitos KKKKK, deboche pesado, todos participando).
2. MODERADA: Teve uma zueirinha. Uma resposta engraçada, uma falha cômica (tipo o bot caindo na hora H), ou um deboche leve. Rendeu umas risadas ("kkk"), mas não foi um evento histórico que parou o grupo.
3. CANCELADA: Falso alarme. Ninguém riu, o papo está sério, foi só um mal-entendido ou é apenas spam de comandos do bot sem interação humana real.

Histórico do Chat:
"""
${chatLog}
"""

Responda EXATAMENTE neste formato de duas linhas:
VEREDITO: [CONFIRMADA, MODERADA ou CANCELADA]
JUSTIFICATIVA: [Sua análise resumida do porquê escolheu esse veredito]
        `.trim();

        const result = await this.genAI.models.generateContent({
            model: this.model,
            contents: prompt,
            config: { temperature: 0.1 }
        }).catch((err) => {
            console.error("❌ [TESTE RESENHA] Erro na API do Google:", err);
            throw new Error("AI_ERROR");
        });

        const rawResponse = result.text.trim();
        const upperResponse = rawResponse.toUpperCase();
        
        let veredito = 'CANCELADA';
        if (upperResponse.includes('VEREDITO: CONFIRMADA')) {
            veredito = 'CONFIRMADA';
        } else if (upperResponse.includes('VEREDITO: MODERADA')) {
            veredito = 'MODERADA';
        }

        console.log(`🤖 [RESPOSTA DA IA]:\n${rawResponse}`);
        console.log(`⚖️ [STATUS COMPUTADO]: ${veredito}`);
        console.log("--------------------------------------------------\n");

        if (veredito === 'CONFIRMADA') {
            if (fs.existsSync('./Assets/confirmada.webp')) {
                const stickerBuffer = fs.readFileSync('./Assets/confirmada.webp');
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: "✅ *RESENHA CONFIRMADA!* Nível máximo de zueira atingido." }, { quoted: msg });
            }
        } else if (veredito === 'MODERADA') {
            if (fs.existsSync('./Assets/moderada.webp')) {
                const stickerBuffer = fs.readFileSync('./Assets/moderada.webp');
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: "⚠️ *RESENHA MODERADA!* Deu pra dar um sorrisinho, mas falta ódio." }, { quoted: msg });
            }
        } else {
            if (fs.existsSync('./Assets/cancelada.webp')) {
                const stickerBuffer = fs.readFileSync('./Assets/cancelada.webp');
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: "❌ *RESENHA CANCELADA!* Circulando, não tem nada pra ver aqui." }, { quoted: msg });
            }
        }

        return null;
    }
}

module.exports = ResenhaCommand;