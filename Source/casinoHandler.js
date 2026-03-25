class CasinoHandler {



    constructor(db) {
        this.db = db;
        this.trabalhos = [
        "vendeu bolo de pote no farol debaixo de um sol de rachar",
        "ajudou a consertar um ar-condicionado que tava cuspindo gelo",
        "fez bico de garçom no bar do Sujinho e teve que aturar bêbado chorando",
        "formatou o PC de um cliente, tirou 30 vírus Baidu e instalou o Windows pirata",
        "passou a tarde inteira colhendo abóbora na fazenda do Minecraft",
        "resolveu um bug bizarro num backend em Spring Boot que ia derrubar o TCC",
        "fez elojob carregando uns bronze afundado de Yasuo no LoL",
        "escreveu a redação do vestibular da Univesp pra um amigo folgado",
        "vendeu pack do pé no onlyfans",
        "vendeu água no balde na praia do gonzaga",
        "ajudou uma velhinha a carregar as compras do supermercado",
        "desentortou 15 pinos de um processador AMD usando uma lapiseira e muita fé",
        "passou 5 horas debugando um código só pra descobrir que faltava um ponto e vírgula",
        "revendeu uma RX 580 do Aliexpress jurando que 'foi usada só pra jogar paciência'",
        "cobrou cinquentão pra mestrar uma sessão de RPG onde os jogadores ignoraram a história principal inteira",
        "tentou arrumar a impressora da tia e acabou sendo nomeado o 'menino da TI' do bairro",
        "centralizou uma div no CSS depois de chorar em posição fetal",
        "montou um servidor caseiro num Celeron velho que passa mais tempo desligado que rodando"
    ];
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

    // SISTEMA DE PIX
    async handlePix(senderId, senderTag, receiverId, amount) {
        if (!receiverId) return `${senderTag}⚠️ Marca alguém pra mandar o Pix! Ex: *!pix @amigo 50*`;
        if (isNaN(amount) || amount <= 0) return `${senderTag}⚠️ Valor inválido, seu caloteiro.`;
        if (senderId === receiverId) return `${senderTag}⚠️ Tá tentando lavar dinheiro mandando Pix pra você mesmo?`;

        const senderBalance = await this.getBalance(senderId);
        if (senderBalance < amount) return `${senderTag}❌ Saldo insuficiente! Você só tem 🪙 ${senderBalance} Bostocoins.`;

        await this.db.run(`INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) VALUES (?, 'Anônimo', 0, 0, '', '')`, [receiverId]);

        await this.updateBalance(senderId, -amount);
        await this.updateBalance(receiverId, amount);

        return `💸 **PIX TRANSFERIDO!**\n\n${senderTag} enviou 🪙 **${amount} Bostocoins** com sucesso!\nO Banco Central do Bostossauro já aprovou a transação.`;
    }

    // MINHA BOSTA MINHA VIDA
    async handleMinhaBosta(userId, userTag) {
        const balance = await this.getBalance(userId);
        const now = Math.floor(Date.now() / 1000);
        const cooldown = 48 * 60 * 60;

        const user = await this.db.get("SELECT last_minhabosta FROM usuarios WHERE id_usuario = ?", [userId]);
        
        if (user && user.last_minhabosta) {
            const timePassed = now - user.last_minhabosta;
            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const hoursLeft = Math.floor(timeLeft / 3600);
                const minutesLeft = Math.floor((timeLeft % 3600) / 60);
                return `${userTag}🛑 Calma lá, parasita! O governo só libera o benefício a cada 48 horas.\nVolte em **${hoursLeft}h e ${minutesLeft}m**.`;
            }
            if (balance > 50){
                return `${userTag} Você não tá pobre o suficiente, volta quando tiver menos de 50 BostoCoins!`
            }
        }

        await this.updateBalance(userId, 100);
        await this.db.run("UPDATE usuarios SET last_minhabosta = ? WHERE id_usuario = ?", [now, userId]);

        return `${userTag}📝 **MINHA BOSTA MINHA VIDA APROVADO**\n\nO Bostossauro depositou a esmola de 🪙 **100 Bostocoins** na sua conta.\nTente não perder tudo no caça-níqueis em 5 minutos!`;
    }

    // RELATÓRIO: APOSTADORES DA MEGA
    async getMegaBettors(userTag) {
        const apostas = await this.db.all(`
            SELECT l.numero, l.valor, u.nome
            FROM loteria l
            JOIN usuarios u ON l.id_usuario = u.id_usuario
            ORDER BY l.numero ASC
        `);

        if (!apostas || apostas.length === 0) {
            return `${userTag}🎟️ Ninguém comprou bilhete pra Mega ainda! O prêmio tá lá, moscando.`;
        }

        const estado = await this.db.get("SELECT mega_multiplicador FROM cassino_estado WHERE id = 1");
        const multiplicador_atual = estado.mega_multiplicador * 100;

        let msg = `${userTag}🎟️ **APOSTADORES DA MEGA** 🎟️\n💸 _Pagando ${multiplicador_atual}x a aposta_\n\n`;
        apostas.forEach(a => {
            msg += `👤 *${a.nome || 'Anônimo'}* apostou 🪙 ${a.valor} no nº **${a.numero}**\n`;
        });

        return msg;
    }

    // RELATÓRIO: APOSTADORES DO BOLÃO
    async getBolaoBettors(userTag) {
        const apostas = await this.db.all(`
            SELECT b.numero, b.valor, u.nome
            FROM bolao b
            JOIN usuarios u ON b.id_usuario = u.id_usuario
            ORDER BY b.numero ASC
        `);

        const estado = await this.db.get("SELECT bolao_acumulado FROM cassino_estado WHERE id = 1");
        const somaApostas = apostas.reduce((acc, curr) => acc + curr.valor, 0);
        const poteTotal = somaApostas + (estado ? estado.bolao_acumulado : 0);

        if (!apostas || apostas.length === 0) {
            return `${userTag}🤝 Ninguém entrou no Bolão ainda!\n💰 Pote acumulado: 🪙 **${poteTotal}**`;
        }

        let msg = `${userTag}🤝 **APOSTADORES DO BOLÃO** 🤝\n💰 *Pote atual:* 🪙 **${poteTotal}**\n\n`;
        apostas.forEach(a => {
            msg += `👤 *${a.nome || 'Anônimo'}* jogou no nº **${a.numero}**\n`;
        });

        return msg;
    }

    // TRABALHO HONESTO
    async handleTrabalhar(userId, userTag) {
        const now = Math.floor(Date.now() / 1000);
        const cooldown = 12 * 60 * 60;

        const user = await this.db.get("SELECT last_trabalho FROM usuarios WHERE id_usuario = ?", [userId]);
        
        if (user && user.last_trabalho) {
            const timePassed = now - user.last_trabalho;
            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const hoursLeft = Math.floor(timeLeft / 3600);
                const minutesLeft = Math.floor((timeLeft % 3600) / 60);
                return `${userTag}🛑 O mercado de trabalho tá saturado! A CLT só permite assinar a carteira de novo em **${hoursLeft}h e ${minutesLeft}m**.`;
            }
        }

        const multiplicador = Math.floor(Math.random() * 4) + 1;
        const salario = 50 * multiplicador;
        
        const bicoSorteado = this.trabalhos[Math.floor(Math.random() * this.trabalhos.length)];

        await this.updateBalance(userId, salario);
        await this.db.run("UPDATE usuarios SET last_trabalho = ? WHERE id_usuario = ?", [now, userId]);

        return `${userTag}💼 **TRABALHADOR BRASILEIRO**\n\nVocê ${bicoSorteado} e recebeu 🪙 **${salario} Bostocoins** pelo serviço!\nVai torrar tudo na Roleta ou vai guardar?`;
    }

    // Atualiza o Show Balance para mostrar os acumulados
    async showBalance(userId, userTag) {
        const balance = await this.getBalance(userId);
        const estado = await this.db.get("SELECT * FROM cassino_estado WHERE id = 1");
        const pote_bolao = await this.db.get("SELECT SUM(valor) as total FROM bolao");
        const total_bolao = (pote_bolao.total || 0) + estado.bolao_acumulado;
        
        return `${userTag}🏦 **BANCO DO BOSTOSSAURO**\n\nSeu saldo: 🪙 **${balance} Bostocoins**\n\n🤑 **ACUMULADOS DA SEMANA:**\n🎟️ *Mega:* Pagando **${estado.mega_multiplicador * 100}x** a aposta! (!cassino mega [1-100] [valor])\n🤝 *Bolão:* Pote atual de 🪙 **${total_bolao}**! (!cassino bolao [1-20] [valor])\n\n_Outros jogos: !cassino [aposta], cara/coroa, roleta_`;
    }
}

module.exports = CasinoHandler;