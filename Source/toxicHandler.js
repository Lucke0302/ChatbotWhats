
const OFFENSE_DICTIONARY = [
/\b(puta|puto|corno|corna|trouxa|trouxão|trouxona|inutil|inútil|idiota|imbecil|burro|burra|burrão|burrona|jumento|jumenta|anta|asno|analfabeto|analfabeta|arrombado|arrombada|otario|otário|otaria|otária|babaca|escroto|escrota|pilantra|vagabundo|vagabunda|cadela|piranha|vadia|vacilão|vacilona|boçal|estupido|estúpido|estupida|estúpida|retardado|retardada|mongol|mongoloide)\b/gi,
/\b(merda|merdinha|bosta|bostinha|caralho|caralha|carai|krai|krl|krlh|crl|crlh|porra|poha|porrra|cacete|kct|buceta|bct|xota|xana|cu|cus|cuzinho|cuzão|pica|piroca|rola|grelo|sifude|sifuder|fuder|fude|foder|fode|fodida|fodido|fudida|fudido|boquete|siririca|punheta|gozar|gozo)\b/gi,
/\b(vsf|tnc|vtnc|vtc|fdp|pqp|pnc|vtmnc|tmnc|se foda|fodase|foda se|se fude|se fuder|foda-se|resto de aborto|imundo|imunda)\b/gi];

class ToxicHandler {
    constructor(db) {
        this.db = db;
    }

    async trackOffenses(name, sender, from, text) {
        let offenseCount = 0;
        
        OFFENSE_DICTIONARY.forEach(regex => {
            const matches = text.match(regex);
            if (matches) offenseCount += matches.length;
        });

        if (offenseCount > 0) {
            try {
                await this.db.run(
                    `INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) 
                     VALUES (?, ?, 0, 0, '', '')`, 
                    [sender, name]
                );

                await this.db.run(
                    `INSERT INTO ranking_ofensas (id_conversa, id_usuario, quantidade) 
                     VALUES (?, ?, ?)
                     ON CONFLICT(id_conversa, id_usuario) 
                     DO UPDATE SET quantidade = quantidade + ?`,
                    [from, sender, offenseCount, offenseCount]
                );

                console.log(`🤬 +${offenseCount} ofensas para ${sender} no grupo ${from}`);
            } catch (error) {
                console.error("Erro ao computar ofensas:", error);
            }
        }
    }

    async getAndResetToxicPodium(groupId) {
        try {
            const leaders = await this.db.all(
                `SELECT u.nome, r.quantidade 
                 FROM ranking_ofensas r
                 JOIN usuarios u ON r.id_usuario = u.id_usuario
                 WHERE r.id_conversa = ? AND r.quantidade > 0
                 ORDER BY r.quantidade DESC 
                 LIMIT 3`,
                [groupId]
            );

            await this.db.run(`DELETE FROM ranking_ofensas WHERE id_conversa = ?`, [groupId]);

            if (!leaders || leaders.length === 0) {
                return "🕊️ *Relatório de Toxicidade:* Ontem a paz reinou neste grupo.";
            }

            let message = `☢️ *TROFÉU BOCA SUJA (Ontem)* ☢️\n\n`;
            const medals = ["🥇", "🥈", "🥉"];

            leaders.forEach((user, index) => {
                let name = user.nome || "Anônimo";
                if(name === 'Desconhecido') name = "Sem Nome";
                const medal = medals[index] || "🏅";
                message += `${medal} *${name}*: ${user.quantidade} ofensas\n`;
            });

            return message;

        } catch (error) {
            console.error("Erro no ranking:", error);
            return "❌ Erro ao calcular toxicidade.";
        }
    }

    async getToxicPodium(groupId) {
        try {
            const leaders = await this.db.all(
                `SELECT u.nome, r.quantidade 
                 FROM ranking_ofensas r
                 JOIN usuarios u ON r.id_usuario = u.id_usuario
                 WHERE r.id_conversa = ? AND r.quantidade > 0
                 ORDER BY r.quantidade DESC 
                 LIMIT 3`,
                [groupId]
            );

            if (!leaders || leaders.length === 0) {
                return "🕊️ *Relatório de Toxicidade:* Até agora a paz reina neste grupo.";
            }

            let message = `☢️ *TROFÉU BOCA SUJA (Parcial)* ☢️\n\n`;
            const medals = ["🥇", "🥈", "🥉"];

            leaders.forEach((user, index) => {
                let name = user.nome || "Anônimo";
                if(name === 'Desconhecido') name = "Sem Nome";
                const medal = medals[index] || "🏅";
                message += `${medal} *${name}*: ${user.quantidade} ofensas\n`;
            });

            return message;

        } catch (error) {
            console.error("Erro no ranking:", error);
            return "❌ Erro ao calcular toxicidade.";
        }
    }
}

module.exports = ToxicHandler;