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

    async showBalance(userId, userTag) {
        const balance = await this.getBalance(userId);
        return `${userTag}🏦 **BANCO DO BOSTOSSAURO**\n\nSeu saldo atual é de 🪙 **${balance} Bostocoins**`;
    }
}

module.exports = CasinoHandler;