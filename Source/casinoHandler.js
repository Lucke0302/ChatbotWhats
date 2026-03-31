class CasinoHandler {

constructor(db) {
        this.db = db;
        
        // Agora os textos antigos são os BICOS (aleatórios e rápidos)
        this.bicos = [
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
            "tentou arrumar a impressora da tia e acabou sendo nomeado o(a) 'menino(a) da TI' do bairro",
            "centralizou uma div no CSS depois de chorar em posição fetal",
            "montou um servidor caseiro num Celeron velho que passa mais tempo desligado que rodando",
            `trabalha com o guê?\n- Eu sou comercial.\n- Comercial di guê?\n- Comercial de vendas.\n- Vendas di guê?\n- Vendas... de qualquer coisa. Vendo água, vendo... produto de limpeza...`
        ];

        this.CARREIRAS_CATALOGO = {
            1: [
                "Vendedor(a) de Chup Chup", "Entregador(a) de Panfleto", "Flanelinha de Shopping",
                "Apanhador(a) de Reciclagem", "Guardador(a) de Lugar na Fila"
            ],
            2: [
                "Atendente de Telemarketing", "Caixa de Lotação", "Mascote de Loja de Celular", 
                "Vendedor(a) de Bolo de Pote", "Fiscal de Catraca"
            ],
            3: [
                "Suporte Nível 1 (Saco de Pancadas)", "Técnico(a) de Informática de Bairro",
                "Coach Quântico", "Corretor(a) de Jogo do Bicho", "Pescador(a) Profissional"
            ],
            4: [
                "Desenvolvedor(a) em Spring Boot", "Trader de Criptomoeda",
                "Dono(a) de Pirâmide Financeira", "Agiota de Bairro", "Sommelier de Água"
            ],
            5: [
                "Herdeiro(a)", "CEO de MEI", "Dono(a) do Cassino",
                "Faria Limer", "Prefeito(a) de Peruíbe"
            ]
        };

        this.SALARIOS_BASE = { 1: 50, 2: 75, 3: 100, 4: 150, 5: 200 };

        this.SUBNIVEIS = {
            1: { nome: "Auxiliar", mult: 1.00 },
            2: { nome: "Júnior", mult: 1.10 },
            3: { nome: "Pleno", mult: 1.20 },
            4: { nome: "Sênior", mult: 1.30 }
        };

        this.HOURS_TO_WORK = 8;
        this.HOURS_TO_BICO = 2;
        this.WORK_MULTIPLIER = 6;
    }

    async getBalance(userId) {
        const user = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        return user ? user.bostocoins : 0;
    }

    async updateBalance(userId, amount, groupId = null, sock = null) {
        if (amount < 0 && this.parqueHandler && groupId && groupId.includes('@g.us')) {
            const gastoReal = Math.abs(amount);
            this.parqueHandler.registrarProgressoComunitario(groupId, 'cassino', gastoReal, sock).catch(()=>{});
        }
        
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [amount, userId]);
    }

    // CAÇA-NÍQUEIS
    async playSlots(userId, userTag, bet, groupId, sock) {
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
            await this.updateBalance(userId, win - bet, groupId, sock);
            return msg + `🏆 **JACKPOT!** Você tirou 3 iguais e ganhou 🪙 ${win} Bostocoins!`;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            const win = Math.floor(bet * 1.4);
            await this.updateBalance(userId, win - bet, groupId, sock);
            return msg + `✨ **QUASE!** Deu parzinho. Você ganhou 🪙 ${win} Bostocoins.`;
        } else {
            await this.updateBalance(userId, -bet, groupId, sock);
            return msg + `💸 **PERDEU!** O cassino agradece sua doação de 🪙 ${bet} Bostocoins.`;
        }
    }

    // CARA OU COROA
    async playCoinflip(userId, userTag, choice, bet, groupId, sock) {
        const balance = await this.getBalance(userId);
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Digite um valor válido. Ex: *!cassino cara 50*\nVocê tem 🪙 ${balance} Bostocoins!`;
        if (choice !== 'cara' && choice !== 'coroa') return `${userTag}⚠️ Escolha 'cara' ou 'coroa'.`;

        if (balance < bet) return `${userTag}❌ Sem saldo! Você tem 🪙 ${balance} Bostocoins.`;

        const result = Math.random() < 0.5 ? 'cara' : 'coroa';
        const won = choice === result;

        let msg = `${userTag}🪙 A moeda girou e caiu... **${result.toUpperCase()}**!\n\n`;

        if (won) {
            await this.updateBalance(userId, bet, groupId, sock);
            return msg + `🎉 Você acertou e ganhou 🪙 ${bet * 1.8} Bostocoins!`;
        } else {
            await this.updateBalance(userId, -bet, groupId, sock);
            return msg + `💸 Você errou e perdeu 🪙 ${bet} Bostocoins.`;
        }
    }

    // ROLETA SIMPLES
    async playRoulette(userId, userTag, colorChoice, bet, groupId, sock) {
        const balance = await this.getBalance(userId);
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Valor inválido. Ex: *!cassino roleta vermelho 100* \nVocê tem ${balance} Bostocoins!`;
        const choices = ['vermelho', 'preto', 'verde'];
        if (!choices.includes(colorChoice)) return `${userTag}⚠️ Escolha uma cor: vermelho (2x), preto (2x) ou verde (12x).`;

        if (balance < bet) return `${userTag}❌ Sem saldo! Você tem 🪙 ${balance} Bostocoins.`;

        const roll = Math.floor(Math.random() * 15);
        let resultColor = '';
        let emoji = '';

        if (roll === 0) { resultColor = 'verde'; emoji = '🟢'; }
        else if (roll >= 1 && roll <= 7) { resultColor = 'vermelho'; emoji = '🔴'; }
        else { resultColor = 'preto'; emoji = '⚫'; }

        let msg = `${userTag}🎡 A roleta girou e parou no ${emoji} **${resultColor.toUpperCase()}**!\n\n`;

        if (colorChoice === resultColor) {
            const multiplier = resultColor === 'verde' ? 12 : 2;
            const win = bet * multiplier;
            await this.updateBalance(userId, win - bet, groupId, sock);
            return msg + `💰 **VITÓRIA!** Você multiplicou sua aposta por ${multiplier}x e ganhou 🪙 ${win} Bostocoins!`;
        } else {
            await this.updateBalance(userId, -bet, groupId, sock);
            return msg + `💸 **DERROTA!** Você apostou no ${colorChoice} e perdeu 🪙 ${bet}.`;
        }
    }

    // MEGABOSTA
    async playMega(userId, userTag, number, bet, groupId, sock) {
        const balance = await this.getBalance(userId);
        if (isNaN(number) || number < 1 || number > 100) return `${userTag}⚠️ Escolha um número de 1 a 100. Ex: *!cassino mega 42 100*`;
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Valor inválido. Ex: *!cassino mega 42 100*`;
        if (balance < bet) return `${userTag}❌ Saldo insuficiente! Você tem 🪙 ${balance} Bostocoins.`;

        const estado = await this.db.get("SELECT mega_multiplicador FROM cassino_estado WHERE id = 1");
        const multiplicador_atual = estado.mega_multiplicador * 100;

        await this.updateBalance(userId, -bet, groupId, sock);
        await this.db.run("INSERT INTO loteria (id_usuario, numero, valor) VALUES (?, ?, ?)", [userId, number, bet]);

        return `${userTag}🎟️ **BILHETE DA MEGABOSTA COMPRADO!**\nApostou 🪙 ${bet} no número **${number}**.\nSe ganhar, leva 🪙 **${bet * multiplicador_atual}** na segunda-feira!`;
    }

    // BOLAO
    async playBolao(userId, userTag, number, bet, groupId, sock) {
        const balance = await this.getBalance(userId);
        if (isNaN(number) || number < 1 || number > 20) return `${userTag}⚠️ Escolha um número de 1 a 20. Ex: *!cassino bolao 15 500*`;
        if (isNaN(bet) || bet <= 0) return `${userTag}⚠️ Valor inválido.`;
        if (balance < bet) return `${userTag}❌ Saldo insuficiente! Você tem 🪙 ${balance} Bostocoins.`;

        const ticket = await this.db.get("SELECT * FROM bolao WHERE id_usuario = ?", [userId]);
        if (ticket) return `${userTag}🎟️ Você já tá no bolão dessa semana com o número **${ticket.numero}**! Só pode um por pessoa.`;

        await this.updateBalance(userId, -bet, groupId, sock);
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

        await this.updateBalance(senderId, -amount, grou);
        await this.updateBalance(receiverId, amount);

        return `💸 **PIX TRANSFERIDO!**\n\n${senderTag} enviou 🪙 **${amount} Bostocoins** com sucesso!\nO Banco Central do Bostossauro já aprovou a transação.`;
    }

    // MINHA BOSTA MINHA VIDA
    async handleMinhaBosta(userId, userTag) {
        const balance = await this.getBalance(userId);
        const financas = await this.processFinancas(userId);
        const investido = financas.investimento.montante || 0;

        if (balance > 500) {
            return `${userTag} 🛑 Você não tá pobre o suficiente! Volta quando tiver menos de 500 Bostocoins na carteira.`;
        }

        if (investido > 500) {
            return `${userTag} 🧐 **MALHA FINA DO GOVERNO!**\n\nTá achando que o Banco Central é palhaço? Você tem 🪙 **${investido} Bostocoins** rendendo na Bolsa de Valores!\nSaca seus investimentos antes de vir mendigar auxílio emergencial, seu Faria Limer de araque!`;
        }

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

    // TRABALHO OFICIAL
    async handleTrabalhar(userId, userTag) {
        const now = Math.floor(Date.now() / 1000);
        const cooldown = this.HOURS_TO_WORK * 60 * 60;

        const user = await this.db.get("SELECT last_trabalho FROM usuarios WHERE id_usuario = ?", [userId]);
        
        if (user && user.last_trabalho) {
            const timePassed = now - user.last_trabalho;
            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const hoursLeft = Math.floor(timeLeft / 3600);
                const minutesLeft = Math.floor((timeLeft % 3600) / 60);
                return `${userTag}🛑 O ponto eletrônico bloqueou! A CLT só permite trabalhar de novo em **${hoursLeft}h e ${minutesLeft}m**.`;
            }
        }
        
        let financas = await this.processFinancas(userId);
        let nivel = financas.carreira.nivel || 1;
        let subnivel = financas.carreira.subnivel || 1;
        
        if (financas.carreira.id_job === undefined || financas.carreira.id_job === null) {
            const maxJobs = this.CARREIRAS_CATALOGO[nivel].length;
            financas.carreira.id_job = Math.floor(Math.random() * maxJobs);
        }

        const cargoBase = this.CARREIRAS_CATALOGO[nivel][financas.carreira.id_job];
        const nomeSubnivel = this.SUBNIVEIS[subnivel].nome;
        const cargoCompleto = `${cargoBase} ${nomeSubnivel}`;
        
        const salarioBase = this.SALARIOS_BASE[nivel];
        const multiplicadorRNG = Math.floor(Math.random() * this.WORK_MULTIPLIER) + 1;
        const bonusCargo = this.SUBNIVEIS[subnivel].mult;
        
        const salarioFinal = Math.floor(salarioBase * multiplicadorRNG * bonusCargo);
        
        const profitResult = await this.verifyProfit(userId, salarioFinal);
        
        await this.updateBalance(userId, profitResult.finalProfit);
        await this.db.run("UPDATE usuarios SET last_trabalho = ? WHERE id_usuario = ?", [now, userId]);
        await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

        let msg = `${userTag}💼 **EXPEDIENTE CONCLUÍDO**\n\nVocê bateu o ponto como **${cargoCompleto}** e recebeu seu salário de 🪙 **${salarioFinal} Bostocoins**!${profitResult.msg}\n\n_Lucro na carteira: 🪙 ${profitResult.finalProfit}_`;

        if (nivel < 5 || subnivel < 4) {
            msg += `\n\n📚 _Dica: Em breve você poderá usar !estudar para subir de cargo e ganhar mais!_`;
        } else {
            msg += `\n\n👑 _Você atingiu o topo da cadeia alimentar corporativa!_`;
        }

        return msg;
    }

    // REESTRUTURAÇÃO DE RH 
    async shuffleJobsGlobal(userTag) {
        const users = await this.db.all("SELECT id_usuario, financas FROM usuarios WHERE financas IS NOT NULL AND financas != '{}'");
        let count = 0;

        for (const u of users) {
            try {
                let financas = JSON.parse(u.financas);
                
                if (financas.carreira && financas.carreira.nivel) {
                    const nivel = financas.carreira.nivel;
                    const maxJobs = this.CARREIRAS_CATALOGO[nivel].length;
                    
                    financas.carreira.id_job = Math.floor(Math.random() * maxJobs);
                    
                    await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), u.id_usuario]);
                    count++;
                }
            } catch (e) {
                console.error("Erro ao embaralhar empregos:", e);
            }
        }
        
        return `🔄 **REESTRUTURAÇÃO CORPORATIVA CONCLUÍDA!**\nO RH do Bostossauro enlouqueceu e transferiu **${count} trabalhadores** para novos departamentos.\nMandem os currículos atualizados!`;
    }

    // PERFIL PROFISSIONAL
    async handleCarreira(userId, userTag) {
        let financas = await this.processFinancas(userId);
        const user = await this.db.get("SELECT last_trabalho FROM usuarios WHERE id_usuario = ?", [userId]);
        
        const nivel = financas.carreira.nivel || 1;
        const subnivel = financas.carreira.subnivel || 1;
        const id_job = financas.carreira.id_job;

        let cargoCompleto = "Aguardando RH (Use !trabalhar para assinar a carteira!)";
        if (id_job !== undefined && id_job !== null) {
            const cargoBase = this.CARREIRAS_CATALOGO[nivel][id_job];
            const nomeSubnivel = this.SUBNIVEIS[subnivel].nome;
            cargoCompleto = `${cargoBase} ${nomeSubnivel}`;
        }

        const salarioBase = this.SALARIOS_BASE[nivel];
        const bonusCargo = this.SUBNIVEIS[subnivel].mult;
        const salarioFixo = Math.floor(salarioBase * bonusCargo);

        const now = Math.floor(Date.now() / 1000);

        let statusTrabalho = "✅ Disponível para bater o ponto!";
        if (user && user.last_trabalho) {
            const timePassed = now - user.last_trabalho;
            const cooldownWork = this.HOURS_TO_WORK * 3600;
            if (timePassed < cooldownWork) {
                const timeLeft = cooldownWork - timePassed;
                const h = Math.floor(timeLeft / 3600);
                const m = Math.floor((timeLeft % 3600) / 60);
                statusTrabalho = `⏳ Descansando (${h}h e ${m}m restantes)`;
            }
        }

        let statusBico = "✅ Pronto pra fazer um bico!";
        if (financas.last_bico > 0) {
            const timePassed = now - financas.last_bico;
            const cooldownBico = this.HOURS_TO_BICO * 3600;
            if (timePassed < cooldownBico) {
                const timeLeft = cooldownBico - timePassed;
                const h = Math.floor(timeLeft / 3600);
                const m = Math.floor((timeLeft % 3600) / 60);
                statusBico = `⏳ Fugindo da receita (${h}h e ${m}m restantes)`;
            }
        }

        let msg = `${userTag}👔 **CARTEIRA DE TRABALHO DIGITAL** 👔\n\n`;
        msg += `🏢 **Cargo Atual:** ${cargoCompleto}\n`;
        msg += `📊 **Nível:** ${nivel} | **Senioridade:** ${this.SUBNIVEIS[subnivel].nome}\n`;
        msg += `💰 **Salário Base Mínimo:** 🪙 ${salarioFixo} _(+ Bônus de Esforço de até 6x)_\n\n`;
        
        msg += `⏱️ **PONTO ELETRÔNICO:**\n`;
        msg += `💼 CLT Oficial: ${statusTrabalho}\n`;
        msg += `🛠️ Bico Informal: ${statusBico}\n`;

        return msg;
    }

    async processFinancas(userId) {
        const user = await this.db.get("SELECT financas FROM usuarios WHERE id_usuario = ?", [userId]);
        
        const now = Math.floor(Date.now() / 1000);
        let financas = { 
            investimento: { montante: 0, ultimo_rendimento: now }, 
            emprestimo: { devedor: 0 },
            carreira: { nivel: 1, subnivel: 1, id_job: null },
            last_bico: 0
        };

        if (user && user.financas && user.financas !== '{}') {
            try { 
                const parsed = JSON.parse(user.financas); 
                
                if (parsed.investimento) {
                    financas.investimento.montante = parsed.investimento.montante || 0;
                    financas.investimento.ultimo_rendimento = parsed.investimento.ultimo_rendimento || now; 
                }

                financas.emprestimo = parsed.emprestimo || financas.emprestimo;
                financas.carreira = parsed.carreira || financas.carreira;
                financas.last_bico = parsed.last_bico || financas.last_bico;
                financas.titulo = parsed.titulo || financas.titulo;
            } catch (e) { console.error("Erro no JSON de finanças", e); }
        }
        const timePassed = now - financas.investimento.ultimo_rendimento;
        const daysPassed = Math.floor(timePassed / 86400);

        if (daysPassed > 0 && financas.investimento.montante > 0) {
            for(let i = 0; i < daysPassed; i++) {
                let m = financas.investimento.montante;
                let yieldAmount = 0;

                if (m > 0) {
                    let baseAmount = Math.min(m, 3000);
                    yieldAmount += baseAmount * 0.10;
                }
                
                if (m > 3000) {
                    let midAmount = Math.min(m - 3000, 2000);
                    yieldAmount += midAmount * 0.05;
                }
                
                if (m > 5000) {
                    let topAmount = m - 5000;
                    yieldAmount += topAmount * 0.02;
                }

                financas.investimento.montante += Math.floor(yieldAmount);
            }
            financas.investimento.ultimo_rendimento += (daysPassed * 86400);
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
        }

        return financas;
    }

    //  O BICO
    async handleBico(userId, userTag) {
        const now = Math.floor(Date.now() / 1000);
        const cooldown = this.HOURS_TO_BICO * 60 * 60;
        
        let financas = await this.processFinancas(userId);

        if (financas.last_bico > 0) {
            const timePassed = now - financas.last_bico;
            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const hoursLeft = Math.floor(timeLeft / 3600);
                const minutesLeft = Math.floor((timeLeft % 3600) / 60);
                return `${userTag}🛑 Calma aí, guerreirinho! Você tá muito cansado pro bico.\nEspera mais **${hoursLeft}h e ${minutesLeft}m**.`;
            }
        }

        const bicoSorteado = this.bicos[Math.floor(Math.random() * this.bicos.length)];
        
        const multiplicador = Math.floor(Math.random() * this.WORK_MULTIPLIER) + 1;
        const pagamento = 15 * multiplicador; 

        const profitResult = await this.verifyProfit(userId, pagamento);
        
        financas.last_bico = now;
        await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
        await this.updateBalance(userId, profitResult.finalProfit);

        return `${userTag}🛠️ **BICO REALIZADO**\n\nVocê ${bicoSorteado} e levantou 🪙 **${pagamento} Bostocoins** pelo serviço!${profitResult.msg}\n\n_Lucro na carteira: 🪙 ${profitResult.finalProfit}_\n\n💡 _Dica: O bico cansa. Você acabou de gastar a energia que poderia ser usada no *!escavar*!_`;
    }

    //  Verifica se o cara tá devendo
    async verifyProfit(userId, rawProfit) {
        if (rawProfit <= 0) return { finalProfit: rawProfit, msg: "" };

        let financas = await this.processFinancas(userId);
        let cut = 0;
        let notificacao = "";

        if (financas.emprestimo.devedor > 0) {
            cut = Math.floor(rawProfit * 0.30);
            
            if (cut > financas.emprestimo.devedor) {
                cut = financas.emprestimo.devedor;
            }

            financas.emprestimo.devedor -= cut;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

            if (financas.emprestimo.devedor <= 0) {
                notificacao = `\n🏦 *O Bostossauro pegou 🪙 ${cut} do seu lucro e QUITOU sua dívida! Você está livre do SPC!*`;
            } else {
                notificacao = `\n🏦 *O Bostossauro confiscou 🪙 ${cut} (30%) para abater sua dívida. Restam: 🪙 ${financas.emprestimo.devedor}*`;
            }
        }

        return { finalProfit: rawProfit - cut, msg: notificacao };
    }

    async handleInvestir(userId, userTag, action, amountStr) {
        let financas = await this.processFinancas(userId);
        const balance = await this.getBalance(userId);

        // Dicionário de Empresas da Bolsa de Valores do Bostossauro 
        const portfolio = [
            "ações da **McBostossauro** 🍔",
            "títulos da **Bostobrás** 🛢️",
            "franquias do **BostoKing** 👑",
            "cotas da **Bostway** (Esquema de Pirâmide) 🔺",
            "criptomoedas da **BostoCrypto** 🪙",
            "ações da **Dinoflix** 🎬",
            "fundos do **JurassiCred** 🏦",
            "assinaturas do **OnlySaurs** 🦖💅",
            "cotas do **Açougue do T-Rex** 🥩",
            "ações da **Viação Pterodáctilo** ✈️"
        ];
        const ativoSorteado = portfolio[Math.floor(Math.random() * portfolio.length)];

        if (!action || action === 'ver') {
            return `${userTag}📈 **BOLSA DE VALORES JURÁSSICA** 📈\n_Rendimento: 10% ao dia (Juros Compostos)_\n\n💰 **Investido:** 🪙 ${financas.investimento.montante}\n📊 **Portfólio atual:** ${ativoSorteado}\n🏦 **Saldo na carteira:** 🪙 ${balance}\n\n_Use !investir depositar [valor] ou !investir sacar [valor]_`;
        }

        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return `${userTag}⚠️ Digite um valor válido. O Lobo de Wall Street chora com você.`;

        if (action === 'depositar') {
            if (balance < amount) return `${userTag}❌ Você não tem tudo isso! Saldo: 🪙 ${balance}`;
            await this.updateBalance(userId, -amount);
            financas.investimento.montante += amount;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
            return `${userTag}📈 **COMPRA EXECUTADA!**\nVocê aplicou 🪙 ${amount} em ${ativoSorteado}.\nSeu montante agora é 🪙 ${financas.investimento.montante} e já está rendendo 10% ao dia!`;
        }

        if (action === 'sacar') {
            if (financas.investimento.montante < amount) return `${userTag}❌ Você só tem 🪙 ${financas.investimento.montante} investidos! O mercado não imprime dinheiro (ainda).`;
            financas.investimento.montante -= amount;
            await this.updateBalance(userId, amount);
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
            return `${userTag}💵 **LUCRO REALIZADO!**\nVocê vendeu ${ativoSorteado} e sacou 🪙 ${amount}. O dinheiro já está na sua carteira.`;
        }

        return `${userTag}⚠️ Ação inválida. Use depositar ou sacar.`;
    }

    // !emprestimo
    async handleEmprestimo(userId, userTag, amountStr) {
        let financas = await this.processFinancas(userId);

        if (!amountStr) {
            return `${userTag}🏦 **AGIOTAGEM DO BOSTOSSAURO** 🏦\n_Pega na hora, paga com a alma._\n\n💸 **Sua dívida atual:** 🪙 ${financas.emprestimo.devedor}\n\n*Regras:*\n- Taxa de 20% aplicada na hora do empréstimo.\n- Cobramos 30% de TUDO que você lucrar automaticamente até quitar.\n\n_Para pedir, use: *!emprestimo [valor]*_`;
        }

        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return `${userTag}⚠️ Digite um valor válido.`;

        if (financas.emprestimo.devedor > 0) {
            return `${userTag}🛑 Calma lá, caloteiro! Você já deve 🪙 ${financas.emprestimo.devedor}. Pague sua dívida antes de pedir mais.`;
        }

        if (amount > 10000) return `${userTag}🛑 O Banco Central barrou. Empréstimo máximo é de 🪙 10000 por vez.`;

        const debt = Math.floor(amount * 1.20);
        financas.emprestimo.devedor = debt;

        await this.updateBalance(userId, amount);
        await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

        return `${userTag}🤝 **PACTO SELADO!**\nO Bostossauro depositou 🪙 ${amount} na sua carteira.\n📝 **Sua dívida agora é de 🪙 ${debt}** (Taxa de 20%).\n_Lembre-se: 30% de todo seu suor agora é meu!_`;
    }

    async handleTitulos(userId, userTag, param, groupId) {
        const TITULOS = {
            '1': { name: 'Dev Pleno(a) 🪙', price: 2000 },
            '2': { name: 'Dev Sênior 💵', price: 5000 },
            '3': { name: 'Faria Limer 🛴', price: 10000 },
            '4': { name: 'Herdeiro(a) 💶', price: 15000 },
            '5': { name: 'Chefe do Camarote 🍾', price: 20000 },
            '6': { name: 'Primo(a) Rico(a) 🍎', price: 25000 },
            '7': { name: 'Agiota Jurássico(a) 🦖', price: 50000 },
            '8': { name: 'Membro do PCC (Primeiro Comando do Cassino) 🎲', price: 75000 }
        };

        if (groupId === '120363422139578370@g.us') { 
            const total = Object.keys(TITULOS).length;
            TITULOS[String(total+1)] = { name: 'Matador de Fabio Brito 🔪', price: 100000 };
            TITULOS[String(total+2)] = { name: 'Monarca da Cúpula 👑', price: 125000 };
        } 
        else if (groupId === '120363106038442674@g.us') {
            const total = Object.keys(TITULOS).length;
            TITULOS[String(total+1)] = { name: 'Discípulo Mestre 🧙‍♂️', price: 100000 };
        }

        const args = param ? param.trim().split(' ') : [];
        const action = args[0] ? args[0].toLowerCase() : 'loja';

        let financas = await this.processFinancas(userId);
        const balance = await this.getBalance(userId);

        if (action === 'loja') {
            let msg = `${userTag}👑 **CARTÓRIO DE TÍTULOS DE NOBREZA** 👑\n_Gaste seu dinheiro com ego! Não dá vantagem nenhuma, mas fica bonito no nome._\n\n`;
            for (const [id, t] of Object.entries(TITULOS)) {
                msg += `*[ ${id} ]* **${t.name}** ➝ 🪙 ${t.price}\n`;
            }
            msg += `\n🛒 Para comprar: *!titulo comprar [numero]*`;
            return msg;
        }

        if (action === 'comprar') {
            const id = args[1];
            if (!TITULOS[id]) return `${userTag}❌ Título não encontrado. Use *!titulo loja*.`;
            
            const tituloObj = TITULOS[id];
            
            if (balance < tituloObj.price) return `${userTag}💸 Vai parcelar o ego no carnê? Você precisa de 🪙 ${tituloObj.price} Bostocoins.`;

            await this.updateBalance(userId, -tituloObj.price);
            
            financas.titulo = tituloObj.name;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

            return `${userTag}🥂 **PARABÉNS, VOCÊ É UM(A) NOBRE AGORA!**\nSua nova alcunha é: **${tituloObj.name}**\nO Bostossauro agradece a sua doação voluntária para a redução da inflação.`;
        }
        
        if (action === 'remover') {
            financas.titulo = null;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
            return `${userTag}🧹 Título removido. Você voltou a ser um camponês comum.`;
        }
    }

// INJEÇÃO NA ECONOMIA
    async handleGiveCoins(senderId, senderTag, targetId, amountStr, groupId, sock, exceptions = []) {
        if (senderId !== "5513991008854@s.whatsapp.net") {
            return `${senderTag}🚫 Negativo! Só o Presidente do Banco Central tem a chave da impressora de dinheiro.`;
        }

        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) {
            return `${senderTag}⚠️ Digite um valor válido para injetar na economia.`;
        }

        if (targetId === 'all') {
            if (!groupId.endsWith('@g.us')) return `${senderTag}⚠️ O alvo 'all' só funciona dentro de grupos.`;
            
            try {
                const groupMetadata = await sock.groupMetadata(groupId);
                const participants = groupMetadata.participants;
                
                let count = 0;
                let ignorados = 0;

                for (const p of participants) {
                    let pPhone = p.phoneNumber ? p.phoneNumber : p.id;
                    
                    if (!pPhone.includes('@')) {
                        pPhone += '@s.whatsapp.net';
                    } else if (pPhone.includes(':')) {
                        pPhone = pPhone.split(':')[0] + '@s.whatsapp.net';
                    }
                    
                    pPhone = pPhone.replace(/(@s\.whatsapp\.net)+/g, '@s.whatsapp.net');

                    const isException = exceptions.includes(pPhone) || exceptions.includes(p.id);

                    if (isException) {
                        ignorados++;
                        continue;
                    }

                    const finalId = pPhone.includes('@s.whatsapp.net') ? pPhone : p.id;

                    if (finalId.includes("5513991526878")) continue;

                    await this.db.run(`INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) VALUES (?, 'Anônimo', 0, 0, '', '')`, [finalId]);
                    await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [amount, finalId]);
                    count++;
                }

                let msg = `${senderTag}🚁 **MAMATA ESTATAL (SILVIO SANTOS JURÁSSICO)** 🚁\nO Banco Central imprimiu e distribuiu 🪙 **${amount} Bostocoins** para ${count} membros do grupo!`;
                if (ignorados > 0) msg += `\n\n🚫 _Atenção: ${ignorados} pessoa(s) sofreram sanções do governo!_`;
                return msg;

            } catch (e) {
                console.error("Erro ao dar moedas para todos:", e);
                return `${senderTag}❌ Erro ao ler participantes.`;
            }
        } 
        else {
            await this.db.run(`INSERT OR IGNORE INTO usuarios (id_usuario, nome, banido_ate, uso_ia_diario, data_ultimo_uso, anotacoes) VALUES (?, 'Anônimo', 0, 0, '', '')`, [targetId]);
            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [amount, targetId]);
            
            const cleanNum = targetId.split('@')[0];
            return `${senderTag}💰 **INJEÇÃO DE CAPITAL** 💰\nO Banco Central transferiu 🪙 **${amount} Bostocoins** para @${cleanNum}.`;
        }
    }

    async handleDebugGroup(userTag, groupId, sock) {
        if (!groupId.endsWith('@g.us')) return "⚠️ Esse comando só funciona em grupos.";

        try {
            const groupMetadata = await sock.groupMetadata(groupId);
            const participants = groupMetadata.participants;
            
            let msg = `🔍 **RAIO-X DE PARTICIPANTES (ANTI-FANTASMA)**\n`;
            msg += `Grupo: ${groupMetadata.subject}\n\n`;

            participants.forEach((p, i) => {
                // Tenta reconstruir o JID de telefone
                let pPhone = p.phoneNumber ? p.phoneNumber + '@s.whatsapp.net' : "N/A";
                let status = p.phoneNumber ? "✅ HUMANO" : "👻 FANTASMA";
                
                msg += `*[${i + 1}]* ${status}\n`;
                msg += `     ID: \`${p.id}\`\n`;
                msg += `     TEL: \`${pPhone}\`\n`;
                if (p.lid) msg += `     LID: \`${p.lid}\`\n`;
                msg += `\n`;
            });

            return msg;
        } catch (e) {
            return "❌ Erro ao ler metadados do grupo.";
        }
    }

    async handleExorcismo(senderId, userTag) {
        if (senderId !== "5513991008854@s.whatsapp.net") return "🚫 Só o admin pode banir fantasmas.";

        const result = await this.db.run(`
            DELETE FROM usuarios 
            WHERE id_usuario LIKE '%@lid' 
        `);

        return `${userTag}🧹 **EXORCISMO CONCLUÍDO!**\nForam eliminados **${result.changes} fantasmas** do banco de dados.\nA economia agora está limpa!`;
    }

    // Atualiza o Show Balance para mostrar os acumulados
    async showBalance(userId, userTag) {
        const balance = await this.getBalance(userId);
        const estado = await this.db.get("SELECT * FROM cassino_estado WHERE id = 1");
        const pote_bolao = await this.db.get("SELECT SUM(valor) as total FROM bolao");
        const total_bolao = (pote_bolao.total || 0) + estado.bolao_acumulado;
        
        return `${userTag}🏦 **BANCO DO BOSTOSSAURO**\n\nSeu saldo: 🪙 **${balance} Bostocoins**\n\n🤑 **ACUMULADOS DA SEMANA:**\n🎟️ *Mega:* Pagando **${estado.mega_multiplicador * 100}x** a aposta! (!cassino mega [1-100] [valor])\n🤝 *Bolão:* Pote atual de 🪙 **${total_bolao}**! (!cassino bolao [1-20] [valor])\n\n_Outros jogos: !cassino [aposta], cara/coroa, roleta_`;
    }

    // ACELERA O TEMPO PRA TRABALHAR EM 8 HORAS
    async acelerarTrabalhoGlobal(userTag) {
        const SECONDS_TO_SUBTRACT = 4 * 3600; 
        
        try {
            const result = await this.db.run(`
                UPDATE usuarios 
                SET last_trabalho = last_trabalho - ? 
                WHERE last_trabalho > 0
            `, [SECONDS_TO_SUBTRACT]);
            
            return `⏳ O Ministro da Economia decretou hora extra e adiantou o relógio em 4 horas para **${result.changes} trabalhadores**!\nA CLT chora, o cooldown diminuiu. Vão bater o ponto!`;

        } catch (e) {
            console.error("Erro ao acelerar o tempo de trabalho:", e);
            return `❌ Deu ruim no Ministério do Trabalho. Erro ao acelerar o tempo.`;
        }
    }

    // ACELERA O COOLDOWN DO BICO/ESCAVAÇÃO EM 2 HORAS
    async acelerarBicoGlobal(userTag) {
        const SECONDS_TO_SUBTRACT = 2 * 3600; 
        const users = await this.db.all("SELECT id_usuario, financas FROM usuarios WHERE financas IS NOT NULL AND financas != '{}'");
        let count = 0;

        for (const u of users) {
            try {
                let financas = JSON.parse(u.financas);
                
                if (financas.last_bico && financas.last_bico > 0) {
                    financas.last_bico -= SECONDS_TO_SUBTRACT;
                    await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), u.id_usuario]);
                    count++;
                }
            } catch (e) {
                console.error("Erro ao acelerar bico para usuário:", u.id_usuario, e);
            }
        }
        
        return `⏳ **DECRETO DE URGÊNCIA!**\nO Banco Central adiantou o relógio em 2 horas para **${count} trabalhadores/mineradores**!\nA energia voltou! Vão fazer um *!bico* ou *!escavar* no parque!`;
    }

    // ACELERA O RENDIMENTO DOS INVESTIMENTOS EM 24 HORAS
    async acelerarInvestimentoGlobal(userTag) {
        const SECONDS_TO_SUBTRACT = 86400;
        const users = await this.db.all("SELECT id_usuario, financas FROM usuarios WHERE financas IS NOT NULL AND financas != '{}'");
        let count = 0;

        for (const u of users) {
            try {
                let financas = JSON.parse(u.financas);
                
                if (financas.investimento && financas.investimento.montante > 0) {
                    if (!financas.investimento.ultimo_rendimento) {
                        financas.investimento.ultimo_rendimento = Math.floor(Date.now() / 1000);
                    }
                    financas.investimento.ultimo_rendimento -= SECONDS_TO_SUBTRACT;
                    await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), u.id_usuario]);
                    count++;
                }
            } catch (e) {
                console.error("Erro ao acelerar investimentos:", u.id_usuario, e);
            }
        }
        
        return `📈 **MÁQUINA DO TEMPO DE WALL STREET!**\nA CVM dormiu e o relógio adiantou em 24 horas.\n**${count} investidores** acabaram de receber seus juros diários! Use *!investir* para conferir a mágica dos juros compostos.`;
    }
}

module.exports = CasinoHandler;