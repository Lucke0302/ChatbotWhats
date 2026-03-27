const MINERAL_CATALOG = [
    // Lixo
    { id: 'pedregulho', name: 'Pedregulho Inútil', emoji: '🪨', rarity: 'lixo', value: 2 },
    { id: 'terra', name: 'Punhado de Terra', emoji: '🤎', rarity: 'lixo', value: 1 },
    { id: 'cascalho', name: 'Cascalho', emoji: '🪨', rarity: 'lixo', value: 3 },
    { id: 'areia', name: 'Areia de Gato', emoji: '⏳', rarity: 'lixo', value: 2 },

    // Comum 
    { id: 'carvao', name: 'Pedaço de Carvão', emoji: '⬛', rarity: 'comum', value: 15 },
    { id: 'calcario', name: 'Calcário', emoji: '🪨', rarity: 'comum', value: 12 },
    { id: 'argila', name: 'Argila Molhada', emoji: '🏺', rarity: 'comum', value: 18 },
    { id: 'granito', name: 'Bloco de Granito', emoji: '🧱', rarity: 'comum', value: 20 },

    // Incomum 
    { id: 'cobre', name: 'Minério de Cobre', emoji: '🟠', rarity: 'incomum', value: 45 },
    { id: 'quartzo', name: 'Cristal de Quartzo', emoji: '🤍', rarity: 'incomum', value: 50 },
    { id: 'prata', name: 'Minério de Prata', emoji: '🥈', rarity: 'incomum', value: 65 },
    { id: 'estanho', name: 'Estanho', emoji: '🪙', rarity: 'incomum', value: 40 },

    // Raro
    { id: 'ferro', name: 'Minério de Ferro', emoji: '🩶', rarity: 'raro', value: 120 },
    { id: 'titanio', name: 'Titânio Bruto', emoji: '🛡️', rarity: 'raro', value: 150 },
    { id: 'platina', name: 'Platina', emoji: '💿', rarity: 'raro', value: 180 },
    { id: 'opala', name: 'Pedra de Opala', emoji: '🪩', rarity: 'raro', value: 140 },

    // Muito Raro
    { id: 'ouro', name: 'Pepita de Ouro', emoji: '🟡', rarity: 'muito_raro', value: 400 },
    { id: 'esmeralda', name: 'Esmeralda', emoji: '🟩', rarity: 'muito_raro', value: 500 },
    { id: 'rubi', name: 'Rubi', emoji: '🟥', rarity: 'muito_raro', value: 550 },
    { id: 'safira', name: 'Safira', emoji: '🟦', rarity: 'muito_raro', value: 450 },

    // Lendário
    { id: 'diamante', name: 'Diamante Bruto', emoji: '💎', rarity: 'lendario', value: 1500 },
    { id: 'meteorito', name: 'Fragmento de Meteorito', emoji: '☄️', rarity: 'lendario', value: 1800 },
    { id: 'obsidiana', name: 'Obsidiana Chorona', emoji: '🖤', rarity: 'lendario', value: 1200 },
    { id: 'vibranium', name: 'Vibranium Falsificado', emoji: '🛡️', rarity: 'lendario', value: 2000 },

    // Mítico 
    { id: 'uranio', name: 'Urânio Enriquecido', emoji: '☢️', rarity: 'mitico', value: 5000 },
    { id: 'kryptonita', name: 'Kryptonita Baiana', emoji: '🟩', rarity: 'mitico', value: 6000 },
    { id: 'adamantium', name: 'Adamantium Bruto', emoji: '🔪', rarity: 'mitico', value: 7500 },
    { id: 'materia_escura', name: 'Matéria Escura', emoji: '🌌', rarity: 'mitico', value: 8000 }
];

const DINO_COLORS = [
    { name: "Verde Musgo", tier: 1, mult: 1.0, emoji: '🟢' },
    { name: "Marrom Terra", tier: 1, mult: 1.0, emoji: '🟤' },
    { name: "Cinza Chumbo", tier: 1, mult: 1.0, emoji: '⚫' },
    { name: "Verde Folha", tier: 1, mult: 1.0, emoji: '🟢' },
    { name: "Azul Cobalto", tier: 2, mult: 1.25, emoji: '🔵' },
    { name: "Vermelho Sangue", tier: 2, mult: 1.25, emoji: '🔴' },
    { name: "Amarelo Mostarda", tier: 2, mult: 1.25, emoji: '🟡' },
    { name: "Branco Albino", tier: 2, mult: 1.25, emoji: '⚪' },
    { name: "Preto Ônix", tier: 3, mult: 1.5, emoji: '🖤' },
    { name: "Dourado Real", tier: 3, mult: 1.5, emoji: '✨' },
    { name: "Azul Neon", tier: 3, mult: 1.5, emoji: '💠' },
    { name: "Roxo Tóxico", tier: 3, mult: 1.5, emoji: '🟣' }
];

const DINO_CATALOG = {
    // COMUM
    'compsognathus': { name: 'Compsognathus', emoji: '🦎', rarity: 'comum', base_xp_req: 100, ticket_value: 50 },
    'dodo': { name: 'Dodô Confuso', emoji: '🦤', rarity: 'comum', base_xp_req: 100, ticket_value: 50 },
    'gallimimus': { name: 'Gallimimus', emoji: '🦖', rarity: 'comum', base_xp_req: 110, ticket_value: 60 },
    'oviraptor': { name: 'Oviraptor Ladrão', emoji: '🥚', rarity: 'comum', base_xp_req: 120, ticket_value: 70 },
    'microceratus': { name: 'Microceratus', emoji: '🦎', rarity: 'comum', base_xp_req: 90, ticket_value: 40 },
    'dryosaurus': { name: 'Dryosaurus', emoji: '🦖', rarity: 'comum', base_xp_req: 105, ticket_value: 55 },
    'hypsilophodon': { name: 'Hypsilophodon', emoji: '🦎', rarity: 'comum', base_xp_req: 115, ticket_value: 65 },
    'psittacosaurus': { name: 'Psittacosaurus', emoji: '🦖', rarity: 'comum', base_xp_req: 125, ticket_value: 70 },
    'troodon': { name: 'Troodon Zoiudo', emoji: '👀', rarity: 'comum', base_xp_req: 130, ticket_value: 80 },
    'herrerasaurus': { name: 'Herrerasaurus', emoji: '🦖', rarity: 'comum', base_xp_req: 140, ticket_value: 90 },

    // INCOMU
    'velociraptor': { name: 'Velociraptor', emoji: '🦖', rarity: 'incomum', base_xp_req: 250, ticket_value: 150 },
    'pachycephalosaurus': { name: 'Pachycephalosaurus', emoji: '🦕', rarity: 'incomum', base_xp_req: 260, ticket_value: 160 },
    'dilophosaurus': { name: 'Dilophosaurus', emoji: '🦎', rarity: 'incomum', base_xp_req: 270, ticket_value: 175 },
    'protoceratops': { name: 'Protoceratops', emoji: '🦏', rarity: 'incomum', base_xp_req: 240, ticket_value: 140 },
    'stygimoloch': { name: 'Stygimoloch', emoji: '🦕', rarity: 'incomum', base_xp_req: 280, ticket_value: 185 },
    'corythosaurus': { name: 'Corythosaurus', emoji: '🦕', rarity: 'incomum', base_xp_req: 290, ticket_value: 200 },
    'parasaurolophus': { name: 'Parasaurolophus', emoji: '🦕', rarity: 'incomum', base_xp_req: 300, ticket_value: 220 },
    'iguanodon': { name: 'Iguanodon', emoji: '🦖', rarity: 'incomum', base_xp_req: 310, ticket_value: 250 },
    'muttaburrasaurus': { name: 'Muttaburrasaurus', emoji: '🦕', rarity: 'incomum', base_xp_req: 320, ticket_value: 290 },
    'kentrosaurus': { name: 'Kentrosaurus', emoji: '🦔', rarity: 'incomum', base_xp_req: 330, ticket_value: 300 },

    // RARO (10)
    'triceratops': { name: 'Triceratops', emoji: '🦏', rarity: 'raro', base_xp_req: 600, ticket_value: 400 },
    'stegosaurus': { name: 'Stegosaurus', emoji: '🦕', rarity: 'raro', base_xp_req: 620, ticket_value: 450 },
    'ankylosaurus': { name: 'Ankylosaurus (Tanque)', emoji: '🐢', rarity: 'raro', base_xp_req: 650, ticket_value: 500 },
    'carnotaurus': { name: 'Carnotaurus', emoji: '🦖', rarity: 'raro', base_xp_req: 680, ticket_value: 500 },
    'allosaurus': { name: 'Allosaurus', emoji: '🦖', rarity: 'raro', base_xp_req: 700, ticket_value: 600 },
    'ceratosaurus': { name: 'Ceratosaurus', emoji: '🦖', rarity: 'raro', base_xp_req: 720, ticket_value: 610 },
    'baryonyx': { name: 'Baryonyx', emoji: '🐊', rarity: 'raro', base_xp_req: 750, ticket_value: 620 },
    'pteranodon': { name: 'Pteranodon', emoji: '🦅', rarity: 'raro', base_xp_req: 580, ticket_value: 420 },
    'dimorphodon': { name: 'Dimorphodon', emoji: '🦇', rarity: 'raro', base_xp_req: 550, ticket_value: 400 },
    'plesiosaurus': { name: 'Plesiosaurus', emoji: '🦕', rarity: 'raro', base_xp_req: 780, ticket_value: 560 },

    // LENDÁRIO
    't_rex': { name: 'Tiranossauro Rex', emoji: '🦖', rarity: 'lendario', base_xp_req: 2000, ticket_value: 1000 },
    'spinosaurus': { name: 'Spinosaurus', emoji: '🐊', rarity: 'lendario', base_xp_req: 2200, ticket_value: 900 },
    'brachiosaurus': { name: 'Brachiosaurus', emoji: '🦕', rarity: 'lendario', base_xp_req: 2500, ticket_value: 800 },
    'diplodocus': { name: 'Diplodocus', emoji: '🦕', rarity: 'lendario', base_xp_req: 2400, ticket_value: 700 },
    'apatosaurus': { name: 'Apatosaurus', emoji: '🦕', rarity: 'lendario', base_xp_req: 2600, ticket_value: 720 },
    'giganotosaurus': { name: 'Giganotosaurus', emoji: '🦖', rarity: 'lendario', base_xp_req: 2300, ticket_value: 900 },
    'therizinosaurus': { name: 'Therizinosaurus', emoji: '🦤', rarity: 'lendario', base_xp_req: 2100, ticket_value: 750 },
    'mosasaurus': { name: 'Mosasaurus', emoji: '🐳', rarity: 'lendario', base_xp_req: 2800, ticket_value: 1000 },
    'quetzalcoatlus': { name: 'Quetzalcoatlus', emoji: '🦅', rarity: 'lendario', base_xp_req: 1900, ticket_value: 700 },
    'argentinosaurus': { name: 'Argentinosaurus', emoji: '🦕', rarity: 'lendario', base_xp_req: 3000, ticket_value: 950 },

    // SECRETOS
    'indominus': { name: 'Indominus Rex', emoji: '🧬', rarity: 'mitico', base_xp_req: 5000, ticket_value: 1500 },
    'indoraptor': { name: 'Indoraptor', emoji: '🖤', rarity: 'mitico', base_xp_req: 5500, ticket_value: 1100 },
    'scorpios': { name: 'Scorpios Rex', emoji: '🦂', rarity: 'mitico', base_xp_req: 5200, ticket_value: 1050 },
};

class ParqueHandler {
    constructor(db, casinoHandler, pescariaHandler) {
        this.db = db;
        this.casinoHandler = casinoHandler;

        this.pescariaHandler = pescariaHandler;
        
        this.INEDIBLE_ITEMS = [
            'placa_mae_queimada', 'teclado_multilaser', 'cabo_vga', 'memoria_ddr1', 
            'cd_aol', 'mouse_bolinha', 'tcc_reprovado', 'fio_cobre', 'codigo_tcc', 
            'rtx_5090', 'calota', 'pneu', 'bota', 'pote_sorvete', 'baiacu_mc',
            'ram_2_gb_ddr2', 'ram_2_gb_ddr3', 'ram_8_gb_ddr3', 'ram_8_gb_ddr4', 
            'ram_16_gb_ddr4', 'ram_16_gb_ddr5', 'ram_64_gb_ddr5'
        ];
    }
    
    async getPlayerData(userId) {
        const user = await this.db.get("SELECT parque_data FROM usuarios WHERE id_usuario = ?", [userId]);
        let data = {};
        
        if (user && user.parque_data) {
            try { data = JSON.parse(user.parque_data); } catch (e) { data = {}; }
        }

        // Agora o player salva apenas a mochila de minérios, a estamina fica lá em financas.last_bico
        let player = {
            inventory: data.inventory || {}
        };

        return player;
    }

    // MOCHILA DE ESCAVAÇÃO
    async verMochila(userId, userTag) {
        const player = await this.getPlayerData(userId);
        const inv = player.inventory || {};
        const items = Object.entries(inv).filter(([id, qtd]) => qtd > 0);

        if (items.length === 0) {
            return `${userTag} 🎒 Sua mochila está vazia! Pegue a picareta e vá !escavar!`;
        }

        let msg = `${userTag}🎒 **MOCHILA DE ESCAVAÇÃO** 🎒\n\n`;
        let totalEstimado = 0;

        items.forEach(([id, qtd], index) => {
            const minInfo = MINERAL_CATALOG.find(m => m.id === id);
            if (minInfo) {
                const valorTotalItem = minInfo.value * qtd;
                totalEstimado += valorTotalItem;
                msg += `*[ ${index + 1} ]* ${minInfo.emoji} **${minInfo.name}** x${qtd} ➝ 🪙 ${valorTotalItem}\n`;
            }
        });

        msg += `\n💰 **Valor Estimado Total:** 🪙 ${totalEstimado}\n`;
        msg += `🛒 Para vender, use: *!parque vender [numero]* ou *!parque vender tudo*`;
        return msg;
    }

    // VENDER MINERAIS
    async venderMinerais(userId, userTag, itemIndexStr) {
        const player = await this.getPlayerData(userId);
        const inv = player.inventory || {};
        const items = Object.entries(inv).filter(([id, qtd]) => qtd > 0);

        if (items.length === 0) {
            return `${userTag} 🎒 Sua mochila está vazia! Não há o que vender.`;
        }

        let totalVendido = 0;
        let msg = `${userTag}🤝 **MERCADO NEGRO DE MINÉRIOS!**\n\n`;

        if (itemIndexStr === 'tudo' || itemIndexStr === 'all') {
            items.forEach(([id, qtd]) => {
                const minInfo = MINERAL_CATALOG.find(m => m.id === id);
                if (minInfo) {
                    totalVendido += minInfo.value * qtd;
                    msg += `- Vendido ${qtd}x ${minInfo.emoji} ${minInfo.name}\n`;
                }
            });
            player.inventory = {};
        } 
        else {
            const index = parseInt(itemIndexStr) - 1;
            if (isNaN(index) || index < 0 || index >= items.length) {
                return `${userTag} ⚠️ Número inválido! Verifique o número na sua *!parque mochila*.`;
            }

            const [id, qtd] = items[index];
            const minInfo = MINERAL_CATALOG.find(m => m.id === id);
            
            if (minInfo) {
                totalVendido = minInfo.value * qtd;
                msg += `- Vendido ${qtd}x ${minInfo.emoji} ${minInfo.name}\n`;
                delete player.inventory[id];
            }
        }

        await this.savePlayerData(userId, player);
        
        const profitResult = await this.casinoHandler.verifyProfit(userId, totalVendido);
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);

        msg += `\n💰 **Lucro Bruto:** 🪙 **${totalVendido} Bostocoins**${profitResult.msg}`;
        return msg;
    }

    async processarBilheteria(groupId) {
        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE group_id = ?", [groupId]);
        if (!dinos || dinos.length === 0) return "";

        let bilheteriaTotal = 0;
        let digestaoMsg = "";

        for (const d of dinos) {
            const dinoInfo = DINO_CATALOG[d.especie_id];
            if (!dinoInfo) continue;

            if (d.reserva_comida > 0) {
                const xpNecessarioProLevel = 2 * d.nivel * dinoInfo.base_xp_req;
                const faltaProLevel = xpNecessarioProLevel - d.xp_atual;
                
                if (d.reserva_comida >= faltaProLevel) {
                    d.nivel += 1;
                    d.xp_atual = 0;
                    d.reserva_comida -= faltaProLevel;
                    d.ultimo_level_up = Math.floor(Date.now() / 1000);
                    
                    await this.db.run(`UPDATE parque_dinossauros SET nivel = ?, xp_atual = ?, reserva_comida = ?, ultimo_level_up = ? WHERE id = ?`, 
                        [d.nivel, d.xp_atual, d.reserva_comida, d.ultimo_level_up, d.id]);
                    
                    const novaClasse = this.getClasseDino(d.nivel);
                    digestaoMsg += `🍖 O **${dinoInfo.name}** de ${d.descobridor_nome} devorou as sobras na madrugada e acordou no **Nível ${d.nivel} (${novaClasse})**!\n`;
                } else {
                    d.xp_atual += d.reserva_comida;
                    d.reserva_comida = 0;
                    
                    await this.db.run(`UPDATE parque_dinossauros SET xp_atual = ?, reserva_comida = ? WHERE id = ?`, 
                        [d.xp_atual, d.reserva_comida, d.id]);
                }
            }

            const valorDino = Math.floor(dinoInfo.ticket_value * d.nivel * (d.multiplicador_bilheteria || 1.0));
            bilheteriaTotal += valorDino;
        }

        if (bilheteriaTotal <= 0 && digestaoMsg === "") return "";

        const ativos = await this.db.all("SELECT DISTINCT id_usuario FROM ranking_ofensas WHERE id_conversa = ?", [groupId]);
        
        let pagamentoMsg = "";
        if (ativos.length > 0 && bilheteriaTotal > 0) {
            const cota = Math.floor(bilheteriaTotal / ativos.length);
            for (const ativo of ativos) {
                await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [cota, ativo.id_usuario]);
            }
            pagamentoMsg = `💰 A bilheteria arrecadou 🪙 **${bilheteriaTotal} Bostocoins**!\nOs lucros foram divididos: 🪙 **${cota}** para cada um dos ${ativos.length} membros ativos.\n`;
        }

        let finalMsg = `\n🎟️ **RELATÓRIO MATINAL DO BOSTOPARK** 🎟️\n`;
        if (digestaoMsg) finalMsg += digestaoMsg + "\n";
        if (pagamentoMsg) finalMsg += pagamentoMsg;

        return finalMsg;
    }

    async savePlayerData(userId, data) {
        const jsonString = JSON.stringify(data);
        await this.db.run("UPDATE usuarios SET parque_data = ? WHERE id_usuario = ?", [jsonString, userId]);
    }

    // DEFINE A FASE DE CRESCIMENTO DO DINO
    getClasseDino(nivel) {
        if (nivel <= 3) return 'Filhote 🍼';
        if (nivel <= 6) return 'Adolescente 🛹';
        if (nivel <= 9) return 'Adulto 🦖';
        if (nivel <= 12) return 'Titã 🌋';
        return 'Ancião 🌌';
    }

    // Menu de Comida
    async listarComida(userId, userTag) {
        const { sellableArray } = await this.pescariaHandler.getSellableList(userId);
        
        const edibleFishes = sellableArray.filter(f => !this.INEDIBLE_ITEMS.includes(f.id));

        if (edibleFishes.length === 0) {
            return `${userTag} 🪹 Seu isopor está vazio ou só tem sucata! Dinossauros não comem placas-mãe. Vá pescar!`;
        }

        let msg = `${userTag}🥩 **DISPENSA DO PARQUE (Seu Isopor)** 🥩\n_Escolha um lanchinho para os dinossauros:_\n\n`;
        
        edibleFishes.forEach((f, i) => {
            msg += `*[ ${i + 1} ]* ${f.emoji} ${f.name} (**${f.weight.toFixed(2)}kg**)\n`;
        });

        msg += `\n🦖 Para alimentar um dino, use: *!parque alimentar [id_do_dino] [numero_da_comida]*\n`;
        msg += `_Dica: O ID do dino você vê em !parque mural_`;
        return msg;
    }

    async handleEscavar(userId, userTag, userName, groupId) {
        let financas = await this.casinoHandler.processFinancas(userId);
        const now = Math.floor(Date.now() / 1000);
        const cooldown = this.casinoHandler.HOURS_TO_BICO * 3600;

        if (financas.last_bico > 0) {
            const timePassed = now - financas.last_bico;
            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const hoursLeft = Math.floor(timeLeft / 3600);
                const minutesLeft = Math.floor((timeLeft % 3600) / 60);
                return `${userTag}🛑 Suas costas estão doendo muito! Você tá sem energia para escavar ou fazer bico.\nDescanse por mais **${hoursLeft}h e ${minutesLeft}m**.`;
            }
        }

        financas.last_bico = now;
        await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

        let player = await this.getPlayerData(userId);

        let msgHeader = `${userTag}⛏️ **ESCAVAÇÃO JURÁSSICA** ⛏️\n_Você pegou a picareta e foi bater pedra..._\n\n`;
        
        const isAmbar = Math.random() < 0.10;

        if (isAmbar) {
            return msgHeader + await this.acharAmbar(userId, userName, groupId);
        } else {
            return msgHeader + await this.acharMineral(userId, player);
        }
    }

    async acharMineral(userId, player) {
        let roll = Math.random() * 100;
        let rarity = 'comum';
        
        if (roll < 1) rarity = 'mitico';
        else if (roll < 3) rarity = 'lendario';
        else if (roll < 10) rarity = 'muito_raro';
        else if (roll < 30) rarity = 'raro';
        else if (roll < 60) rarity = 'incomum';
        else if (roll < 90) rarity = 'comum';
        else rarity = 'lixo';

        const possibleMinerals = MINERAL_CATALOG.filter(m => m.rarity === rarity);
        const minerio = possibleMinerals[Math.floor(Math.random() * possibleMinerals.length)];

        if (!player.inventory[minerio.id]) {
            player.inventory[minerio.id] = 0;
        }
        player.inventory[minerio.id] += 1;

        await this.savePlayerData(userId, player);

        let msg = `Você suou a camisa e encontrou: ${minerio.emoji} **${minerio.name}**!\n`;
        msg += `_O item foi guardado na sua mochila do parque. Valor estimado: 🪙 ${minerio.value}_`;
        
        return msg;
    }

    async acharAmbar(userId, userName, groupId) {
        const dinosDescobertos = await this.db.all("SELECT especie_id FROM parque_dinossauros WHERE descobridor_id = ?", [userId]);
        const idsDescobertos = dinosDescobertos.map(d => d.especie_id);

        let roll = Math.random() * 100;
        let rarity = 'comum';
        if (roll < 0.1) rarity = 'mitico';
        else if (roll < 5) rarity = 'lendario';
        else if (roll < 20) rarity = 'raro';
        else if (roll < 50) rarity = 'incomum';

        let especiesDisponiveis = Object.entries(DINO_CATALOG)
            .filter(([id, info]) => info.rarity === rarity && !idsDescobertos.includes(id));

        if (especiesDisponiveis.length === 0) {
            especiesDisponiveis = Object.entries(DINO_CATALOG)
                .filter(([id, info]) => !idsDescobertos.includes(id));
        }

        if (especiesDisponiveis.length === 0) {
            const recompensa = 1000;
            const profitResult = await this.casinoHandler.verifyProfit(userId, recompensa);
            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);
            return `🦟 Você achou um Âmbar! Porém, a InGen informou que o DNA dentro dele já estava 100% mapeado por você.\nEles confiscaram a pedra e te pagaram 🪙 **${recompensa} Bostocoins** pela exclusividade!${profitResult.msg}`;
        }

        const [dinoId, dinoInfo] = especiesDisponiveis[Math.floor(Math.random() * especiesDisponiveis.length)];

        let colorRoll = Math.random() * 100;
        let qtdCores = 1;
        if (colorRoll > 80) qtdCores = 3; 
        else if (colorRoll > 50) qtdCores = 2;

        let coresEscolhidas = [];
        let coresNomes = [];
        let multiplicadorTotal = 1.0;

        let coresTemp = [...DINO_COLORS];
        for (let i = 0; i < qtdCores; i++) {
            const index = Math.floor(Math.random() * coresTemp.length);
            const cor = coresTemp.splice(index, 1)[0];
            coresEscolhidas.push(cor);
            coresNomes.push(`${cor.emoji} ${cor.name}`);
            multiplicadorTotal *= cor.mult;
        }

        const corString = coresNomes.join(" e ");

        const now = Math.floor(Date.now() / 1000);
        await this.db.run(`
            INSERT INTO parque_dinossauros (group_id, especie_id, descobridor_nome, descobridor_id, nivel, xp_atual, data_descoberta, reserva_comida, ultimo_level_up, cor, multiplicador_bilheteria)
            VALUES (?, ?, ?, ?, 1, 0, ?, 0, 0, ?, ?)`,
            [groupId, dinoId, userName, userId, now, corString, multiplicadorTotal]
        );

        const profitResult = await this.casinoHandler.verifyProfit(userId, dinoInfo.ticket_value);
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);

        let msg = `🦟 **UM MOSQUITO NO ÂMBAR!** 🦟\n_A sirene da InGen tocou e os helicópteros chegaram!_\n\n`;
        msg += `Eles extraíram o DNA e clonaram um ${dinoInfo.emoji} **${dinoInfo.name}** exclusivo para o parque!\n\n`;
        msg += `🧬 **MUTAÇÃO GENÉTICA (${qtdCores} Cores):**\n`;
        msg += `🎨 Padrão: ${corString}\n`;
        msg += `🎟️ Bônus de Bilheteria: **${multiplicadorTotal.toFixed(2)}x**\n\n`;
        msg += `💰 A InGen te pagou uma recompensa de 🪙 **${dinoInfo.ticket_value} Bostocoins** pelo DNA raro!${profitResult.msg}\n\n`;
        msg += `💡 _Use *!parque mural* para ver o bicho na jaula e *!pescar* para arrumar comida pra ele!_`;
        
        return msg;
    }

    // MURAL GLOBAL
    async verParqueGlobal(groupId, userTag) {
        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE group_id = ? ORDER BY nivel DESC, id ASC", [groupId]);
        
        if (!dinos || dinos.length === 0) {
            return `${userTag} 🚧 O **Jurassic BostoPark** deste grupo ainda é só um terreno baldio com mato alto. Escave e ache um âmbar para começar!`;
        }

        let msg = `🦖 **JURASSIC BOSTOPARK DO GRUPO** 🦕\n_A bilheteria agradece o turismo! Use o ID para alimentar._\n\n`;

        dinos.forEach(d => {
            const dinoInfo = DINO_CATALOG[d.especie_id];
            if (dinoInfo) {
                const xpNecessario = 2 * d.nivel * dinoInfo.base_xp_req;
                const porcentagem = ((d.xp_atual / xpNecessario) * 100).toFixed(1);
                const classe = this.getClasseDino(d.nivel); // <--- Puxa a classe
                
                msg += `🆔 *[ ID: ${d.id} ]* ${dinoInfo.emoji} **${dinoInfo.name}**\n`;
                msg += `   🎨 Cor: ${d.cor} | 🧬 Lvl: ${d.nivel} [${classe}] (${porcentagem}% pro Nvl ${d.nivel + 1})\n`;
                msg += `   🥩 Reserva: ${d.reserva_comida.toFixed(1)}kg | 👤 Por: ${d.descobridor_nome}\n\n`;
            }
        });

        msg += `🍗 Para alimentar um dino: *!parque alimentar [ID] [Nº Comida]*`;
        return msg;
    }

    // PERFIL DO JOGADOR
    async verPerfilParque(userId, userTag) {
        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE descobridor_id = ? ORDER BY nivel DESC", [userId]);
        
        let msg = `${userTag}🎒 **PERFIL DE PALEONTÓLOGO** 🎒\n\n`;

        if (!dinos || dinos.length === 0) {
            msg += `🦴 _Você ainda não clonou nenhum dinossauro para o parque. Continue escavando!_`;
            return msg;
        }

        msg += `🧬 **SEUS DINOSSAUROS CLONADOS:**\n_Lembre-se: Você não pode achar a mesma espécie duas vezes!_\n\n`;
        
        dinos.forEach(d => {
            const dinoInfo = DINO_CATALOG[d.especie_id];
            if (dinoInfo) {
                const classe = this.getClasseDino(d.nivel);
                msg += `${dinoInfo.emoji} **${dinoInfo.name}** (Nvl ${d.nivel} - ${classe}) - Cor: _${d.cor}_\n`;
            }
        });

        return msg;
    }

    async alimentarDino(userId, userTag, groupId, dinoIdStr, foodIndexStr) {
        const dinoId = parseInt(dinoIdStr);
        const foodIndex = parseInt(foodIndexStr) - 1;

        if (isNaN(dinoId) || isNaN(foodIndex)) {
            return `${userTag} ⚠️ Formato incorreto! Use: *!parque alimentar [id_do_dino] [numero_da_comida]*\nPara ver sua comida digite *!parque despensa*.`;
        }

        const dino = await this.db.get("SELECT * FROM parque_dinossauros WHERE id = ? AND group_id = ?", [dinoId, groupId]);
        if (!dino) return `${userTag} ❌ Dinossauro não encontrado neste parque. Tem certeza que anotou o ID certo?`;

        const { sellableArray, player } = await this.pescariaHandler.getSellableList(userId);
        const edibleFishes = sellableArray.filter(f => !this.INEDIBLE_ITEMS.includes(f.id));

        if (foodIndex < 0 || foodIndex >= edibleFishes.length) {
            return `${userTag} ❌ Comida não encontrada na dispensa.`;
        }

        const food = edibleFishes[foodIndex];
        const dinoInfo = DINO_CATALOG[dino.especie_id];
        
        const xpNecessarioProLevel = 2 * dino.nivel * dinoInfo.base_xp_req;
        const now = Math.floor(Date.now() / 1000);
        
        const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const lastLevelUpDate = new Date(dino.ultimo_level_up * 1000).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const hasLeveledUpToday = dino.ultimo_level_up > 0 && today === lastLevelUpDate;

        let pesoOfertado = food.weight;
        let xpGanha = 0;
        let reservaGanha = 0;
        let upouDeNivel = false;

        if (hasLeveledUpToday) {
            reservaGanha = pesoOfertado;
        } else {
            const faltaProLevel = xpNecessarioProLevel - dino.xp_atual;
            
            if (pesoOfertado >= faltaProLevel) {
                xpGanha = faltaProLevel;
                reservaGanha = pesoOfertado - faltaProLevel;
                dino.nivel += 1;
                dino.xp_atual = 0;
                dino.ultimo_level_up = now;
                upouDeNivel = true;
            } else {
                xpGanha = pesoOfertado;
                dino.xp_atual += pesoOfertado;
            }
        }

        dino.reserva_comida += reservaGanha;

        await this.db.run(`
            UPDATE parque_dinossauros 
            SET nivel = ?, xp_atual = ?, reserva_comida = ?, ultimo_level_up = ? 
            WHERE id = ?`, 
            [dino.nivel, dino.xp_atual, dino.reserva_comida, dino.ultimo_level_up, dinoId]
        );

        const originalIndex = player.records.findIndex(r => r.instanceId === food.instanceId || (r.id === food.id && r.weight === food.weight && r.date === food.date));
        if (originalIndex > -1) {
            player.records.splice(originalIndex, 1);
            await this.pescariaHandler.savePlayerData(userId, player);
        }

        let msg = `${userTag}🥩 **HORA DO RANGO JURÁSSICO!**\n\n`;
        msg += `Você jogou um(a) ${food.emoji} **${food.name}** (${food.weight.toFixed(2)}kg) na jaula do **${dinoInfo.name}** (Descoberto por: ${dino.descobridor_nome}).\n\n`;

        if (upouDeNivel) {
            const novaClasse = this.getClasseDino(dino.nivel);
            msg += `🌟 **LEVEL UP!!!**\nO ${dinoInfo.name} comeu **${xpGanha.toFixed(2)}kg**, ficou com sono e subiu para o **Nível ${dino.nivel} (${novaClasse})**!\n`;
            msg += `💤 _Ele não pode mais subir de nível hoje._\n`;
        } else if (hasLeveledUpToday) {
            msg += `💤 O dinossauro já está fazendo a digestão pesada do Level Up de hoje.\n`;
        } else {
            const porcentagem = ((dino.xp_atual / xpNecessarioProLevel) * 100).toFixed(1);
            msg += `😋 Ele devorou tudo! (Crescimento: **${porcentagem}%** para o Nível ${dino.nivel + 1})\n`;
        }

        if (reservaGanha > 0) {
            msg += `🧊 Sobraram **${reservaGanha.toFixed(2)}kg** de carne que foram guardados na reserva térmica do parque para amanhã!\n`;
        }

        return msg;
    }
}

module.exports = ParqueHandler;
