class CasinoHandler {
    constructor(db) {
        this.db = db;
    }

    async getBalance(userId) {
        const user = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        return user ? user.bostocoins : 0;
    }

    async updateBalance(userId, amount) {
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [amount, userId]);
    }

    // CAÇA-NÍQUEIS
    async playSlots(userId, userTag, bet) {
        const balance = await this.getBalance(userId);
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Digite um valor para apostar. Ex: *!cassino 50*\nVocê tem ${balance} Bostocoins!`;
        
        if (balance < bet) return `${userTag}❌ Você tá liso! Seu saldo é de apenas 🪙 ${balance} Bostocoins.`;

        const emojis = ["🍒", "🍋", "🔔", "⭐", "💎", "🦖"];
        const r1 = emojis[Math.floor(Math.random() * emojis.length)];
        const r2 = emojis[Math.floor(Math.random() * emojis.length)];
        const r3 = emojis[Math.floor(Math.random() * emojis.length)];

        let msg = `${userTag}🎰 **CAÇA-NÍQUEIS** 🎰\n\n[ ${r1} | ${r2} | ${r3} ]\n\n`;

        if (r1 === r2 && r2 === r3) {
            let multiplier = r1 === "💎" || r1 === "🦖" ? 20 : 10;
            const win = bet * multiplier;
            await this.updateBalance(userId, win - bet);
            return msg + `🏆 **JACKPOT!** Você tirou 3 iguais e ganhou 🪙 ${win} Bostocoins!`;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            const win = Math.floor(bet * 1.5);
            await this.updateBalance(userId, win - bet);
            return msg + `✨ **QUASE!** Deu parzinho. Você ganhou 🪙 ${win} Bostocoins.`;
        } else {
            await this.updateBalance(userId, -bet);
            return msg + `💸 **PERDEU!** O cassino agradece sua doação de 🪙 ${bet} Bostocoins.`;
        }
    }

    // CARA OU COROA
    async playCoinflip(userId, userTag, choice, bet) {
        const balance = await this.getBalance(userId);
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Digite um valor válido. Ex: *!cassino cara 50*\nVocê tem 🪙 ${balance} Bostocoins!`;
        if (choice !== 'cara' && choice !== 'coroa') return `${userTag}⚠️ Escolha 'cara' ou 'coroa'.`;

        if (balance < bet) return `${userTag}❌ Sem saldo! Você tem 🪙 ${balance} Bostocoins.`;

        const result = Math.random() < 0.5 ? 'cara' : 'coroa';
        const won = choice === result;

        let msg = `${userTag}🪙 A moeda girou e caiu... **${result.toUpperCase()}**!\n\n`;

        if (won) {
            await this.updateBalance(userId, bet);
            return msg + `🎉 Você acertou e ganhou 🪙 ${bet * 2} Bostocoins!`;
        } else {
            await this.updateBalance(userId, -bet);
            return msg + `💸 Você errou e perdeu 🪙 ${bet} Bostocoins.`;
        }
    }

    // ROLETA SIMPLES
    async playRoulette(userId, userTag, colorChoice, bet) {
        const balance = await this.getBalance(userId);
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Valor inválido. Ex: *!cassino roleta vermelho 100* \nVocê tem ${balance} Bostocoins!`;
        const choices = ['vermelho', 'preto', 'verde'];
        if (!choices.includes(colorChoice)) return `${userTag}⚠️ Escolha uma cor: vermelho (2x), preto (2x) ou verde (14x).`;

        if (balance < bet) return `${userTag}❌ Sem saldo! Você tem 🪙 ${balance} Bostocoins.`;

        const roll = Math.floor(Math.random() * 15);
        let resultColor = '';
        let emoji = '';

        if (roll === 0) { resultColor = 'verde'; emoji = '🟢'; }
        else if (roll >= 1 && roll <= 7) { resultColor = 'vermelho'; emoji = '🔴'; }
        else { resultColor = 'preto'; emoji = '⚫'; }

        let msg = `${userTag}🎡 A roleta girou e parou no ${emoji} **${resultColor.toUpperCase()}**!\n\n`;

        if (colorChoice === resultColor) {
            const multiplier = resultColor === 'verde' ? 14 : 2;
            const win = bet * multiplier;
            await this.updateBalance(userId, win - bet);
            return msg + `💰 **VITÓRIA!** Você multiplicou sua aposta por ${multiplier}x e ganhou 🪙 ${win} Bostocoins!`;
        } else {
            await this.updateBalance(userId, -bet);
            return msg + `💸 **DERROTA!** Você apostou no ${colorChoice} e perdeu 🪙 ${bet}.`;
        }
    }

    // BOSTOSENA
    async playMega(userId, userTag, number, bet) {
        const balance = await this.getBalance(userId);
        if (isNaN(number) || number < 1 || number > 100) return `${userTag}⚠️ Escolha um número de 1 a 100. Ex: *!cassino mega 42 100*`;
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Valor inválido. Ex: *!cassino mega 42 100*`;
        if (balance < bet) return `${userTag}❌ Saldo insuficiente! Você tem 🪙 ${balance} Bostocoins.`;

        const estado = await this.db.get("SELECT mega_multiplicador FROM cassino_estado WHERE id = 1");
        const multiplicador_atual = estado.mega_multiplicador * 100;

        await this.updateBalance(userId, -bet);
        await this.db.run("INSERT INTO loteria (id_usuario, numero, valor) VALUES (?, ?, ?)", [userId, number, bet]);

        return `${userTag}🎟️ **BILHETE DA BostoSena COMPRADO!**\nApostou 🪙 ${bet} no número **${number}**.\nSe ganhar, leva 🪙 **${bet * multiplicador_atual}** na segunda-feira!`;
    }

    // BOLAO
    async playBolao(userId, userTag, number, bet) {
        const balance = await this.getBalance(userId);
        if (isNaN(number) || number < 1 || number > 20) return `${userTag}⚠️ Escolha um número de 1 a 20. Ex: *!cassino bolao 15 500*`;
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Valor inválido.`;
        if (balance < bet) return `${userTag}❌ Saldo insuficiente! Você tem 🪙 ${balance} Bostocoins.`;

        const ticket = await this.db.get("SELECT * FROM bolao WHERE id_usuario = ?", [userId]);
        if (ticket) return `${userTag}🎟️ Você já tá no bolão dessa semana com o número **${ticket.numero}**! Só pode um por pessoa.`;

        await this.updateBalance(userId, -bet);
        await this.db.run("INSERT INTO bolao (id_usuario, numero, valor) VALUES (?, ?, ?)", [userId, number, bet]);

        return `${userTag}🤝 **NO BOLÃO!**\nVocê jogou 🪙 ${bet} no número **${number}**. O pote do grupo só cresce! Resultado na segunda-feira.`;
    }

    // Atualiza o Show Balance para mostrar os acumulados
    async showBalance(userId, userTag) {
        const balance = await this.getBalance(userId);
        const estado = await this.db.get("SELECT * FROM cassino_estado WHERE id = 1");
        const pote_bolao = await this.db.get("SELECT SUM(valor) as total FROM bolao");
        const total_bolao = (pote_bolao.total || 0) + estado.bolao_acumulado;
        
        return `${userTag}🏦 **BANCO DO BOSTOSSAURO**\n\nSeu saldo: 🪙 **${balance} Bostocoins**\n\n🤑 **ACUMULADOS DA SEMANA:**\n🎟️ *Mega:* Pagando **${estado.mega_multiplicador * 100}x** a aposta! (!cassino mega [1-100] [valor])\n🤝 *Bolão:* Pote atual de 🪙 **${total_bolao}**! (!cassino bolao [1-20] [valor])\n\n_Outros jogos: !cassino [aposta], cara/coroa, roleta_`;
    }

    async showBalance(userId, userTag) {
        const balance = await this.getBalance(userId);
        return `${userTag}🏦 **BANCO DO BOSTOSSAURO**
        \n\nSeu saldo atual é de 🪙 **${balance} Bostocoins**.
        \n\n🎰 *Jogos Rápidos:*\n• *Slots:* !cassino [valor]
        \n• *Moeda:* !cassino [cara/coroa] [valor]
        \n• *Roleta:* !cassino roleta [cor] [valor]
        \n\n_Para ver as regras detalhadas e prêmios, digite: *!ajuda cassino*_`;
    }
}

module.exports = CasinoHandler;