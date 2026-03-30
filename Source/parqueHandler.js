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

    // ------------- HÍBRIDOS ------------------- //

    // HÍBRIDOS COMUNS
    'compsograptor': { 
        name: 'Compsograptor', emoji: '🦎', rarity: 'comum', 
        base_xp_req: 440, ticket_value: 240, 
        receita: ['compsognathus', 'oviraptor'] 
    },
    'herrerapsitacus': { 
        name: 'Herrerapsitacus', emoji: '🦖', rarity: 'comum', 
        base_xp_req: 530, ticket_value: 320, 
        receita: ['psittacosaurus', 'herrerasaurus'] 
    },
    'dodognathus': { 
        name: 'Dodognathus', emoji: '🦎', rarity: 'comum', 
        base_xp_req: 400, ticket_value: 200, 
        receita: ['compsognathus', 'dodo'] 
    },
    'galliraptor': { 
        name: 'Galliraptor', emoji: '🦖', rarity: 'comum', 
        base_xp_req: 460, ticket_value: 260, 
        receita: ['gallimimus', 'oviraptor'] 
    },
    'micropsittaco': { 
        name: 'Micropsittaco', emoji: '🦎', rarity: 'comum', 
        base_xp_req: 430, ticket_value: 220, 
        receita: ['microceratus', 'psittacosaurus'] 
    },
    'trooherrera': { 
        name: 'Trooherrera Zoiudo', emoji: '👀', rarity: 'comum', 
        base_xp_req: 540, ticket_value: 340, 
        receita: ['troodon', 'herrerasaurus'] 
    },

    // HÍBRIDOS INCOMUNS
    'pachydilo': { 
        name: 'Pachydilophosaurus', emoji: '🦕', rarity: 'incomum', 
        base_xp_req: 1060, ticket_value: 670, 
        receita: ['pachycephalosaurus', 'dilophosaurus'] 
    },
    'protostygi': { 
        name: 'Protostygimoloch', emoji: '🦏', rarity: 'incomum', 
        base_xp_req: 1040, ticket_value: 650, 
        receita: ['protoceratops', 'stygimoloch'] 
    },
    'iguano-coritho': { 
        name: 'Iguanocorythosaurus', emoji: '🦖', rarity: 'incomum', 
        base_xp_req: 1200, ticket_value: 900, 
        receita: ['iguanodon', 'corythosaurus'] 
    },
    'para-kentro': { 
        name: 'Parakentrosaurus', emoji: '🦔', rarity: 'incomum', 
        base_xp_req: 1260, ticket_value: 1040, 
        receita: ['parasaurolophus', 'kentrosaurus'] 
    },

    // HÍBRIDOS SECRETOS
    'stegoceratops': { 
        name: 'Stegoceratops', emoji: '🦏', rarity: 'secreto', 
        base_xp_req: 2440, ticket_value: 1700, 
        receita: ['stegosaurus', 'triceratops'] 
    },
    'ankylodocus': { 
        name: 'Ankylodocus', emoji: '🦕', rarity: 'secreto', 
        base_xp_req: 6100, ticket_value: 2400, 
        receita: ['ankylosaurus', 'diplodocus'] 
    },
    'carnoraptor': { 
        name: 'Carnoraptor', emoji: '🐊', rarity: 'secreto', 
        base_xp_req: 1860, ticket_value: 1300, 
        receita: ['carnotaurus', 'velociraptor'] 
    },
    'spinoraptor': { 
        name: 'Spinoraptor', emoji: '🦈', rarity: 'secreto', 
        base_xp_req: 4900, ticket_value: 2100, 
        receita: ['spinosaurus', 'velociraptor'] 
    },
    'pachygalosaurus': { 
        name: 'Pachygalosaurus', emoji: '🏃‍♂️', rarity: 'secreto', 
        base_xp_req: 740, ticket_value: 440, 
        receita: ['pachycephalosaurus', 'gallimimus'] 
    },
    'allonodon': { 
        name: 'Allonodon', emoji: '🦅', rarity: 'secreto', 
        base_xp_req: 2560, ticket_value: 2040, 
        receita: ['allosaurus', 'pteranodon'] 
    },
    'giganotoceratops': { 
        name: 'Giganotoceratops', emoji: '🌋', rarity: 'secreto', 
        base_xp_req: 5800, ticket_value: 2600, 
        receita: ['giganotosaurus', 'triceratops'] 
    },
    'therizinoraptor': { 
        name: 'Therizinoraptor', emoji: '🔪', rarity: 'secreto', 
        base_xp_req: 4700, ticket_value: 1800, 
        receita: ['therizinosaurus', 'velociraptor'] 
    },
    'scorpios': { 
        name: 'Scorpios Rex', emoji: '🦂', rarity: 'secreto', 
        base_xp_req: 5360, ticket_value: 2100, 
        receita: ['t_rex', 'carnotaurus'] 
    },
    'indominus': { 
        name: 'Indominus Rex', emoji: '🧬', rarity: 'secreto', 
        base_xp_req: 4500, ticket_value: 2300, 
        receita: ['t_rex', 'velociraptor'] 
    },
    'indoraptor': { 
        name: 'Indoraptor', emoji: '🖤', rarity: 'secreto', 
        base_xp_req: 21000, ticket_value: 2500, 
        receita: ['indominus', 'velociraptor'] 
    },
    'bostossauro': { 
        name: 'Bostossauro', emoji: '👑', rarity: 'secreto', 
        base_xp_req: 100000, ticket_value: 5000, 
        receita: ['indominus', 'indoraptor', 'scorpios', 'stegoceratops', 'ankylodocus', 'carnoraptor', 'spinoraptor', 'pachygalosaurus', 'allonodon', 'giganotoceratops', 'therizinoraptor'] 
    }
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

        this.HERBIVOROS = ['triceratops', 'stegosaurus', 'ankylosaurus', 'diplodocus', 
            'brachiosaurus', 'apatosaurus', 'argentinosaurus', 'parasaurolophus', 
            'iguanodon', 'corythosaurus', 'stygimoloch', 'pachycephalosaurus', 
            'protoceratops', 'gallimimus', 'microceratus', 'dryosaurus', 'hypsilophodon', 
            'psittacosaurus', 'stegoceratops', 'ankylodocus', 'iguano-coritho', 'para-kentro'];
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

    // PERFIL DO JOGADOR
    async verPerfilParque(userId, userTag) {
        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE descobridor_id LIKE ? ORDER BY nivel DESC, multiplicador_bilheteria DESC", ['%' + userId + '%']);
        
        const player = await this.getPlayerData(userId);
        const inv = player.inventory || {};
        let totalMinerais = 0;
        let valorEstimadoMochila = 0;
        
        Object.entries(inv).forEach(([id, qtd]) => {
            if (qtd > 0) {
                totalMinerais += qtd;
                const minInfo = MINERAL_CATALOG.find(m => m.id === id);
                if (minInfo) valorEstimadoMochila += (minInfo.value * qtd);
            }
        });

        let financas = await this.casinoHandler.processFinancas(userId);
        const titulo = financas.titulo ? `\n🏷️ *Título:* ${financas.titulo}` : "";

        let msg = `${userTag}🦕 **CREDENCIAL DA INGEN** 🦕${titulo}\n\n`;

        msg += `🎒 **Resumo da Mochila:**\n`;
        if (totalMinerais > 0) {
            msg += `⛏️ Pedras escavadas: **${totalMinerais}**\n`;
            msg += `💰 Valor estimado: 🪙 **${valorEstimadoMochila}**\n`;
            msg += `_(Use !parque mochila para ver o inventário completo)_\n\n`;
        } else {
            msg += `_Sua mochila está vazia. Pegue a picareta e vá trabalhar!_\n\n`;
        }

        if (!dinos || dinos.length === 0) {
            msg += `🦴 **Expedições:**\n_Você ainda não clonou nenhum dinossauro para o parque. O John Hammond está decepcionado com você!_`;
            return msg;
        }

        const totalEspecies = Object.keys(DINO_CATALOG).length;
        let multiplicadorTotal = 0;
        dinos.forEach(d => multiplicadorTotal += (d.multiplicador_bilheteria || 1));

        msg += `🧬 **DNA & CLONAGEM:**\n`;
        msg += `🦕 Espécies Descobertas: **${dinos.length}/${totalEspecies}**\n`;
        msg += `🎟️ Bônus de Bilheteria Injetado no Grupo: **+${multiplicadorTotal.toFixed(2)}x**\n\n`;

        msg += `🌟 **SEUS MELHORES DINOSSAUROS:**\n`;
        
        const topDinos = dinos.slice(0, 5);
        topDinos.forEach(d => {
            const dinoInfo = DINO_CATALOG[d.especie_id];
            if (dinoInfo) {
                const classe = this.getClasseDino(d.nivel);
                msg += `${dinoInfo.emoji} **${dinoInfo.name}** (Nvl ${d.nivel} - ${classe})\n`;
                msg += `   🎨 Cor: _${d.cor}_ (Ticket: ${d.multiplicador_bilheteria.toFixed(2)}x)\n`;
            }
        });

        if (dinos.length > 5) {
            msg += `\n_...e mais ${dinos.length - 5} dinossauros que estão pastando pelo parque._`;
        }

        return msg;
    }

    // REGISTRO PARENTAL
    async handleTitulosParque(userId, userTag, paramStr) {
        const dinos = await this.db.all("SELECT DISTINCT especie_id FROM parque_dinossauros WHERE descobridor_id LIKE ?", ['%' + userId + '%']);
        
        if (!dinos || dinos.length === 0) {
            return `${userTag} 🚫 Você ainda não descobriu nenhum dinossauro! Ache um Âmbar na escavação ou pescaria antes de ir ao conselho tutelar.`;
        }

        if (!paramStr || paramStr.trim() === '') {
            let msg = `${userTag}👑 **CARTÓRIO PARENTAL JURÁSSICO** 👑\n_Reivindique a guarda das feras que você trouxe à vida!_\n\n`;
            msg += `**Seus filhos legítimos disponíveis:**\n`;
            dinos.forEach(d => {
                const info = DINO_CATALOG[d.especie_id];
                if (info) msg += `- ${info.emoji} ${info.name} (ID: *${d.especie_id}*)\n`;
            });
            msg += `\n📌 **Como registrar a criança:**\n*!parque titulo [pai/mae/nazare] [id_do_dino]*\n`;
            msg += `_Ex: !parque titulo pai t_rex_\n\n`;
            msg += `🧹 Para remover a guarda: *!parque titulo remover*`;
            return msg;
        }

        const args = paramStr.trim().split(/\s+/);
        const prefixoRaw = args[0].toLowerCase();

        if (prefixoRaw === 'remover') {
            let financas = await this.casinoHandler.processFinancas(userId);
            financas.titulo = null;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
            return `${userTag}🧹 Título removido. Você foi comprar cigarro e abandonou a família jurássica.`;
        }

        if (args.length < 2) return `${userTag} ⚠️ Faltou o ID do dinossauro. Ex: *!parque titulo mae iguanodon*`;

        const dinoId = args[1].toLowerCase();
        const discoveredIds = dinos.map(d => d.especie_id);
        
        if (!discoveredIds.includes(dinoId)) {
            return `${userTag} ❌ Você não tem os direitos de descoberta sobre a espécie *${dinoId}*! Tentando roubar o filho dos outros, é?`;
        }

        let prefixoOficial = "";
        if (prefixoRaw === 'pai') prefixoOficial = "Pai";
        else if (prefixoRaw === 'mae' || prefixoRaw === 'mãe') prefixoOficial = "Mãe";
        else if (prefixoRaw === 'nazare' || prefixoRaw === 'nazaré') prefixoOficial = "Nazaré Tedesco";
        else return `${userTag} ⚠️ Parentesco inválido! Escolha entre: *pai, mae* ou *nazare*.`;

        const dinoInfo = DINO_CATALOG[dinoId];
        const novoTitulo = `${prefixoOficial} de ${dinoInfo.name} ${dinoInfo.emoji}`;

        let financas = await this.casinoHandler.processFinancas(userId);
        financas.titulo = novoTitulo;
        await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

        return `${userTag}👩‍👦 **CERTIDÃO DE NASCIMENTO EMITIDA!**\nVocê assumiu a guarda do dinossauro! Seu novo título global agora é: **${novoTitulo}**`;
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
    async venderMinerais(userId, userTag, itemIndexStr, qtdStr) {
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
                return `${userTag} ⚠️ Número inválido! Verifique o número na sua *!parque mochila*.\nEx: _!parque vender 1 5_`;
            }

            const [id, qtdTotal] = items[index];
            const minInfo = MINERAL_CATALOG.find(m => m.id === id);
            
            let qtdParaVender = qtdTotal;
            if (qtdStr) {
                const parsedQtd = parseInt(qtdStr);
                if (!isNaN(parsedQtd) && parsedQtd > 0) {
                    qtdParaVender = Math.min(parsedQtd, qtdTotal);
                }
            }
            
            if (minInfo) {
                totalVendido = minInfo.value * qtdParaVender;
                msg += `- Vendido ${qtdParaVender}x ${minInfo.emoji} ${minInfo.name}\n`;
                
                player.inventory[id] -= qtdParaVender;
                if (player.inventory[id] <= 0) {
                    delete player.inventory[id];
                }
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
                    digestaoMsg += `🍖 Um **${dinoInfo.name}** devorou as sobras na madrugada e acordou no **Nível ${d.nivel} (${novaClasse})**!\n`;
                } else {
                    d.xp_atual += d.reserva_comida;
                    d.reserva_comida = 0;
                    
                    await this.db.run(`UPDATE parque_dinossauros SET xp_atual = ?, reserva_comida = ? WHERE id = ?`, 
                        [d.xp_atual, d.reserva_comida, d.id]);
                }
            }

            const valorDino = Math.floor(dinoInfo.ticket_value * d.nivel * (d.multiplicador_bilheteria || 1.0));
            bilheteriaTotal += valorDino / 2;
        }

        if (bilheteriaTotal <= 0 && digestaoMsg === "") return "";

        const ativos = await this.db.all("SELECT DISTINCT id_usuario FROM ranking_ofensas WHERE id_conversa = ?", [groupId]);
        
        let pagamentoMsg = "";
        if (ativos.length > 0 && bilheteriaTotal > 0) {
            const cota = Math.floor(bilheteriaTotal / ativos.length);
            for (const ativo of ativos) {
                await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [cota, ativo.id_usuario]);
            }
            pagamentoMsg = `💰 A bilheteria arrecadou 🪙 **${bilheteriaTotal*2} Bostocoins**,  mas a InGen comeu metade, restaram **${bilheteriaTotal*2}**!\nOs lucros foram divididos: 🪙 **${cota}** para cada um dos ${ativos.length} membros ativos.\n`;
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
        const { grouped } = await this.getGroupedDispensa(userId);

        if (grouped.length === 0) {
            return `${userTag} 🪹 Seu isopor está vazio ou só tem sucata! Dinossauros não comem placas-mãe. Vá pescar!`;
        }

        let msg = `${userTag}🥩 **DISPENSA DO PARQUE (Seu Isopor)** 🥩\n_Escolha um lanchinho para os dinossauros:_\n\n`;
        
        grouped.forEach((g, i) => {
            const prefixo = g.count > 1 ? `**${g.count}x** ` : '';
            msg += `*[ ${i + 1} ]* ${prefixo}${g.emoji} ${g.name} (**${g.weightStr}kg**)\n`;
        });

        msg += `\n🦖 Para alimentar um dino: *!parque alimentar [id_do_dino] [numero_da_comida]*\n`;
        msg += `🔪 Para fatiar um peixe: *!parque porcionar [numero_da_comida] [peso_da_porcao]*\n`;
        msg += `_Dica: O ID do dino você vê em !parque mural_`;
        return msg;
    }

    async getGroupedDispensa(userId) {
        const { sellableArray, player } = await this.pescariaHandler.getSellableList(userId);
        const edibleFishes = sellableArray.filter(f => !this.INEDIBLE_ITEMS.includes(f.id));

        const grouped = [];
        for (const fish of edibleFishes) {
            const weightStr = fish.weight.toFixed(2);
            
            const existing = grouped.find(g => g.id === fish.id && g.weightStr === weightStr);
            
            if (existing) {
                existing.count++;
                existing.instances.push(fish);
            } else {
                grouped.push({
                    id: fish.id,
                    name: fish.name,
                    emoji: fish.emoji,
                    weight: fish.weight,
                    weightStr: weightStr,
                    count: 1,
                    instances: [fish],
                    originalFish: fish
                });
            }
        }
        return { grouped, player };
    }

    async verReservaGlobal(groupId, userTag) {
        let estoque = await this.db.get("SELECT carne, vegetal FROM parque_estoque WHERE group_id = ?", [groupId]);
        if (!estoque) {
            estoque = { carne: 0, vegetal: 0 };
        }

        let msg = `${userTag}🏢 **CÂMARA FRIGORÍFICA DA INGEN (Reserva do Grupo)** 🏢\n_O suprimento coletivo para alimentar os dinossauros._\n\n`;
        msg += `🥩 **Carnes (Pesca):** ${estoque.carne.toFixed(2)} kg\n`;
        msg += `🥬 **Vegetais (Fazenda):** ${estoque.vegetal.toFixed(2)} kg\n\n`;
        msg += `_Para doar: *!parque depositar [id_despensa] [tudo]*_\n`;
        msg += `_Para alimentar usando a reserva: *!parque alimentar [id_dino] reserva*_`;
        
        return msg;
    }

    async depositarComida(userId, userTag, groupId, foodIndexStr, qtdStr) {
        const foodIndex = parseInt(foodIndexStr) - 1;

        if (isNaN(foodIndex)) {
            return `${userTag} ⚠️ Formato incorreto! Use: *!parque depositar [numero_da_comida] [qtd/tudo]*\nEx: _!parque depositar 1 tudo_`;
        }

        const { grouped, player } = await this.getGroupedDispensa(userId);

        if (foodIndex < 0 || foodIndex >= grouped.length) {
            return `${userTag} ❌ Comida não encontrada na despensa.`;
        }

        const group = grouped[foodIndex];
        
        let qtd = 1;
        if (qtdStr && (qtdStr.toLowerCase() === 'tudo' || qtdStr.toLowerCase() === 'all')) {
            qtd = group.instances.length;
        } else if (!isNaN(parseInt(qtdStr))) {
            qtd = Math.min(parseInt(qtdStr), group.instances.length);
        }

        let pesoTotalDepositado = 0;

        for (let i = 0; i < qtd; i++) {
            const food = group.instances[i];
            pesoTotalDepositado += food.weight;
            
            const originalIndex = player.records.findIndex(r => r.instanceId === food.instanceId || (r.id === food.id && r.weight === food.weight && r.date === food.date));
            if (originalIndex > -1) {
                player.records.splice(originalIndex, 1);
            }
        }

        await this.pescariaHandler.savePlayerData(userId, player);

        await this.db.run(`
            INSERT INTO parque_estoque (group_id, carne, vegetal) 
            VALUES (?, ?, 0) 
            ON CONFLICT(group_id) 
            DO UPDATE SET carne = carne + ?`, 
            [groupId, pesoTotalDepositado, pesoTotalDepositado]
        );

        return `${userTag} 🚚 **DOAÇÃO RECEBIDA!**\n\nVocê transferiu **${qtd}x** ${group.emoji} ${group.name} para a câmara frigorífica do grupo.\nTotal doado: 🥩 **${pesoTotalDepositado.toFixed(2)} kg de Carne**!\nO John Hammond saúda o seu comunismo jurássico.`;
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
            .filter(([id, info]) => info.rarity === rarity && !idsDescobertos.includes(id) && !info.receita);

        if (especiesDisponiveis.length === 0) {
            especiesDisponiveis = Object.entries(DINO_CATALOG)
                .filter(([id, info]) => !idsDescobertos.includes(id) && !info.receita);
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
        let multiplicadorTotal = 0;
        let coresTemp = [...DINO_COLORS];
        for (let i = 0; i < qtdCores; i++) {
            const index = Math.floor(Math.random() * coresTemp.length);
            const cor = coresTemp.splice(index, 1)[0];
            coresEscolhidas.push(cor);
            coresNomes.push(`${cor.emoji} ${cor.name}`);
            multiplicadorTotal += cor.mult;
        }

        const corString = coresNomes.join(" e ");

        const now = Math.floor(Date.now() / 1000);
        await this.db.run(`
            INSERT INTO parque_dinossauros (group_id, especie_id, descobridor_nome, descobridor_id, nivel, xp_atual, data_descoberta, reserva_comida, ultimo_level_up, cor, multiplicador_bilheteria)
            VALUES (?, ?, '', ?, 1, 0, ?, 0, 0, ?, ?)`,
            [groupId, dinoId, userId, now, corString, multiplicadorTotal]
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

        const hibridoExtra = await this.verificarHibridos(groupId);
        if (hibridoExtra) msg += hibridoExtra;
        
        return msg;
    }

    // LABORATÓRIO GENÉTICO
    async verificarHibridos(groupId) {
        let msgHibrido = "";
        const dinosNoParque = await this.db.all("SELECT * FROM parque_dinossauros WHERE group_id = ?", [groupId]);
        const especiesNoParque = dinosNoParque.map(d => d.especie_id);

        for (const [hibridoId, hibridoInfo] of Object.entries(DINO_CATALOG)) {
            if (!hibridoInfo.receita) continue; 
            if (especiesNoParque.includes(hibridoId)) continue;

            const temTodos = hibridoInfo.receita.every(paiId => especiesNoParque.includes(paiId));
            
            if (temTodos) {
                const pais = dinosNoParque.filter(d => hibridoInfo.receita.includes(d.especie_id));
                
                let descobridoresIds = new Set();
                pais.forEach(p => {
                    if (p.descobridor_id) {
                        p.descobridor_id.split(',').forEach(id => descobridoresIds.add(id.trim()));
                    }
                });

                let idsFormatados = Array.from(descobridoresIds).filter(id => id !== '');
                const idSalvamento = idsFormatados.join(',');

                let nomesAutoresArray = [];
                for (const uid of idsFormatados) {
                    const userDb = await this.db.get("SELECT nome FROM usuarios WHERE id_usuario = ?", [uid]);
                    nomesAutoresArray.push(userDb ? userDb.nome : 'Alguém');
                }
                const nomeAutoresMsg = nomesAutoresArray.join(" & ");

                const nivelHibrido = 1;
                
                let coresHibrido = [];
                let coresMultiplicador = 0;
                let coresTemp = [...DINO_COLORS];
                for (let i = 0; i < 3; i++) {
                    const index = Math.floor(Math.random() * coresTemp.length);
                    const cor = coresTemp.splice(index, 1)[0];
                    coresHibrido.push(`${cor.emoji} ${cor.name}`);
                    coresMultiplicador += cor.mult;
                }
                const corString = coresHibrido.join(" e ");

                const now = Math.floor(Date.now() / 1000);
                await this.db.run(`
                    INSERT INTO parque_dinossauros (group_id, especie_id, descobridor_nome, descobridor_id, nivel, xp_atual, data_descoberta, reserva_comida, ultimo_level_up, cor, multiplicador_bilheteria)
                    VALUES (?, ?, '', ?, ?, 0, ?, 0, 0, ?, ?)`,
                    [groupId, hibridoId, idSalvamento, nivelHibrido, now, corString, coresMultiplicador]
                );

                const recompensaIndividual = Math.floor(hibridoInfo.ticket_value / idsFormatados.length);
                for (const uid of idsFormatados) {
                    await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [recompensaIndividual, uid]);
                }

                msgHibrido += `\n\n🚨 **ALERTA DE SEGURANÇA MÁXIMA DA INGEN!** 🚨\n`;
                msgHibrido += `O cruzamento de DNA no parque de vocês gerou uma mutação agressiva no laboratório!\n\n`;
                msgHibrido += `🧬 **NOVO HÍBRIDO SINTETIZADO:** ${hibridoInfo.emoji} **${hibridoInfo.name}**\n`;
                msgHibrido += `📈 **Poder Inicial:** Nível 1 _(Recém-saído da incubadora 🍼)_\n`;
                msgHibrido += `👥 **Criadores:** ${nomeAutoresMsg}\n`;
                msgHibrido += `💰 **Royalties InGen:** 🪙 ${recompensaIndividual} Bostocoins para cada criador!\n`;
                
                if (hibridoId === 'bostossauro') {
                    msgHibrido += `\n👑 **O REI DESPERTOU!** O Bostossauro supremo nasceu... Rezemos por misericórdia.\n`;
                }

                especiesNoParque.push(hibridoId);
                dinosNoParque.push({ especie_id: hibridoId, nivel: nivelHibrido, descobridor_nome: '', descobridor_id: idSalvamento });
            }
        }
        return msgHibrido;
    }

    // BATIZAR DINOSSAURO
    async handleApelidoDino(userId, userTag, groupId, dinoIdStr, novoNomeArray) {
        const dinoId = parseInt(dinoIdStr);
        if (isNaN(dinoId) || !novoNomeArray || novoNomeArray.length === 0) {
            return `${userTag} ⚠️ Formato incorreto! Use: *!parque apelido [id_do_dino] [Novo Nome]*\nEx: _!parque apelido 5 Jubileu_`;
        }

        const novoNome = novoNomeArray.join(' ').trim();
        if (novoNome.length > 30) return `${userTag} ⚠️ O apelido é muito grande! O limite do cartório é de 30 caracteres.`;

        const dino = await this.db.get("SELECT * FROM parque_dinossauros WHERE id = ? AND group_id = ?", [dinoId, groupId]);
        if (!dino) return `${userTag} ❌ Dinossauro não encontrado neste parque. Tem certeza que olhou o ID certo no mural?`;

        const donos = dino.descobridor_id ? dino.descobridor_id.split(',') : [];
        if (!donos.includes(userId)) {
            return `${userTag} ❌ Só os descobridores/pais biológicos do dinossauro podem escolher o nome da criança!`;
        }

        const dinoInfo = DINO_CATALOG[dino.especie_id];
        const currentName = dino.nickname || dinoInfo.name;

        if (currentName !== dinoInfo.name) {
            return `${userTag} 🛑 O dinossauro já foi batizado como **"${dino.nickname}"**! A InGen não permite trocar de nome duas vezes para não confundir os cientistas.`;
        }

        await this.db.run("UPDATE parque_dinossauros SET nickname = ? WHERE id = ?", [novoNome, dinoId]);

        return `${userTag} 🏷️ **NOVO NOME DE BATISMO!**\nO ${dinoInfo.name} do parque agora atende orgulhosamente pelo nome de **"${novoNome}"**!`;
    }

    // FIX ADMIN PARA OS NICKNAMES
    async fixNicknamesGlobais(userTag) {
        const dinos = await this.db.all("SELECT id, especie_id, nickname FROM parque_dinossauros");
        let count = 0;

        for (const dino of dinos) {
            if (!dino.nickname) {
                const dinoInfo = DINO_CATALOG[dino.especie_id];
                if (dinoInfo) {
                    await this.db.run("UPDATE parque_dinossauros SET nickname = ? WHERE id = ?", [dinoInfo.name, dino.id]);
                    count++;
                }
            }
        }

        return `${userTag} 🛠️ **MIGRAÇÃO DE CARTÓRIO CONCLUÍDA!**\n**${count} dinossauros** receberam seus nomes de espécie originais na coluna 'nickname'. Agora os donos podem renomeá-los!`;
    }

    // MURAL GLOBAL
    async verParqueGlobal(groupId, userTag, paramStr, pokemonHandler) {
        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE group_id = ? ORDER BY id ASC", [groupId]);
        
        if (!dinos || dinos.length === 0) {
            return `${userTag} 🚧 O **Jurassic BostoPark** deste grupo ainda é só um terreno baldio com mato alto. Escave e ache um âmbar para começar!`;
        }

        const playerCercados = {}; 
        const uniqueUsers = new Set();

        dinos.forEach(d => {
            if (!d.descobridor_id) return;
            const ids = d.descobridor_id.split(',').map(id => id.trim()).filter(id => id !== '');
            
            ids.forEach(id => {
                if (!playerCercados[id]) playerCercados[id] = [];
                playerCercados[id].push(d);
                uniqueUsers.add(id);
            });
        });

        const playerNames = {};
        for (const id of uniqueUsers) {
            let currentTag = id; 
            if (pokemonHandler) {
                currentTag = await pokemonHandler.getUserTag(id);
                currentTag = currentTag.replace(/\n/g, '').trim(); 
            }
            playerNames[id] = currentTag;
        }

        const listaEquipes = Object.keys(playerCercados).map(id => {
            return {
                id: id,
                nome: playerNames[id] || 'Desconhecido',
                dinos: playerCercados[id]
            };
        }).sort((a, b) => b.dinos.length - a.dinos.length);

        if (!paramStr || isNaN(parseInt(paramStr))) {
            let msg = `${userTag}🦖 **JURASSIC BOSTOPARK DO GRUPO** 🦕\n_A bilheteria agradece o turismo!_\n\n`;
            msg += `📋 **Cercados Individuais:**\n`;
            
            listaEquipes.forEach((eq, index) => {
                msg += `*[ ${index + 1} ]* ${eq.nome} ➝ **${eq.dinos.length} dino(s)**\n`;
            });
            
            msg += `\n🔍 Para visitar o cercado de alguém, use: *!parque mural [número]*\n`;
            msg += `🍗 Para alimentar, use: *!parque alimentar [ID] [Nº_Comida]*`;
            return msg;
        }

        const index = parseInt(paramStr) - 1;
        if (index < 0 || index >= listaEquipes.length) {
            return `${userTag} ⚠️ Cercado não encontrado! Digite apenas *!parque mural* para ver a lista válida.`;
        }

        const equipeSelecionada = listaEquipes[index];
        let msg = `${userTag}🦖 **CERCADO:** ${equipeSelecionada.nome.toUpperCase()} 🦕\n_Dinossauros sob os cuidados deste tratador:_\n\n`;

        const getShortName = (tag) => tag.replace(/^[^\w\s]+/, '').split('(')[0].trim();

        equipeSelecionada.dinos.forEach(d => {
            const dinoInfo = DINO_CATALOG[d.especie_id];
            if (dinoInfo) {
                const xpNecessario = 2 * d.nivel * dinoInfo.base_xp_req;
                const porcentagem = ((d.xp_atual / xpNecessario) * 100).toFixed(1);
                const classe = this.getClasseDino(d.nivel); 
                
                const nomeExibicao = (d.nickname && d.nickname !== dinoInfo.name) 
                                     ? `${d.nickname} _(${dinoInfo.name})_` 
                                     : dinoInfo.name;
                
                msg += `🆔 *[ ID: ${d.id} ]* ${dinoInfo.emoji} **${nomeExibicao}**\n`;
                msg += `   🎨 Cor: ${d.cor} | 🧬 Lvl: ${d.nivel} [${classe}] (${porcentagem}% pro Nvl ${d.nivel + 1})\n`;
                
                const idsCriadores = d.descobridor_id.split(',').map(i => i.trim()).filter(i => i !== '');
                
                const reservaEmoji = this.HERBIVOROS.includes(d.especie_id) ? '🍃' : '🥩';

                if (idsCriadores.length > 1) {
                    const parceiros = idsCriadores
                        .filter(i => i !== equipeSelecionada.id)
                        .map(i => playerNames[i] ? getShortName(playerNames[i]) : 'Alguém')
                        .join(', ');
                    msg += `   ${reservaEmoji} Reserva: ${d.reserva_comida.toFixed(1)}kg | 🤝 _Co-criado com: ${parceiros}_\n\n`;
                } else {
                    msg += `   ${reservaEmoji} Reserva: ${d.reserva_comida.toFixed(1)}kg\n\n`;
                }
            }
        });

        msg += `🍗 Para alimentar: *!parque alimentar [ID_do_Dino] [Nº_Comida]*`;
        return msg;
    }

    async alimentarDino(userId, userTag, groupId, dinoIdStr, foodIndexStr) {
        const dinoId = parseInt(dinoIdStr);

        if (isNaN(dinoId) || !foodIndexStr) {
            return `${userTag} ⚠️ Formato incorreto! Use: *!parque alimentar [id_do_dino] [numero_da_comida]* OU *!parque alimentar [id_do_dino] reserva*`;
        }

        const dino = await this.db.get("SELECT * FROM parque_dinossauros WHERE id = ? AND group_id = ?", [dinoId, groupId]);
        if (!dino) return `${userTag} ❌ Dinossauro não encontrado neste parque. Tem certeza que anotou o ID certo?`;

        const dinoInfo = DINO_CATALOG[dino.especie_id];
        const xpNecessarioProLevel = 2 * dino.nivel * dinoInfo.base_xp_req;
        const now = Math.floor(Date.now() / 1000);
        const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const lastLevelUpDate = new Date(dino.ultimo_level_up * 1000).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const hasLeveledUpToday = dino.ultimo_level_up > 0 && today === lastLevelUpDate;

        let pesoOfertado = 0;
        let foodName = "";
        let foodEmoji = "";
        let usandoReserva = false;

        if (foodIndexStr.toLowerCase() === 'reserva') {
            if (hasLeveledUpToday) {
                return `${userTag} 🛑 O dinossauro já subiu de nível hoje! A InGen proíbe pegar comida da Reserva Global apenas para guardar na barriga dele. Volte amanhã.`;
            }

            const estoque = await this.db.get("SELECT carne, vegetal FROM parque_estoque WHERE group_id = ?",[groupId]) || { carne: 0, vegetal: 0 };
            
            const dieta = this.HERBIVOROS.includes(dino.especie_id) ? 'vegetal' : 'carne';
            
            let disponivel = estoque[dieta];
            if (disponivel <= 0) return `${userTag} 🪹 A câmara frigorífica de **${dieta === 'carne' ? 'Carne 🥩' : 'Vegetais 🥬'}** está vazia! O grupo precisa depositar comida.`;

            const faltaProLevel = xpNecessarioProLevel - dino.xp_atual;
            pesoOfertado = Math.min(disponivel, faltaProLevel);
            
            if (dieta === 'carne') {
                await this.db.run("UPDATE parque_estoque SET carne = carne - ? WHERE group_id = ?", [pesoOfertado, groupId]);
            } else {
                await this.db.run("UPDATE parque_estoque SET vegetal = vegetal - ? WHERE group_id = ?", [pesoOfertado, groupId]);
            }

            foodName = `Rações da Reserva Coletiva`;
            foodEmoji = dieta === 'carne' ? '🥩' : '🥬';
            usandoReserva = true;

        } 
        else {
            const foodIndex = parseInt(foodIndexStr) - 1;
            const { grouped, player } = await this.getGroupedDispensa(userId);
            
            if (foodIndex < 0 || foodIndex >= grouped.length) return `${userTag} ❌ Comida não encontrada na sua despensa.`;
            
            const group = grouped[foodIndex];
            const food = group.instances[0];

            pesoOfertado = food.weight;
            foodName = food.name;
            foodEmoji = food.emoji;

            const originalIndex = player.records.findIndex(r => r.instanceId === food.instanceId || (r.id === food.id && r.weight === food.weight && r.date === food.date));
            if (originalIndex > -1) {
                player.records.splice(originalIndex, 1);
                await this.pescariaHandler.savePlayerData(userId, player);
            }
        }

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

        let msg = `${userTag}🍽️ **HORA DO RANGO JURÁSSICO!**\n\n`;
        msg += `Você jogou **${pesoOfertado.toFixed(2)}kg** de ${foodEmoji} *${foodName}* na jaula do **${dinoInfo.name}**!\n\n`;

        if (upouDeNivel) {
            const novaClasse = this.getClasseDino(dino.nivel);
            msg += `🌟 **LEVEL UP!!!**\nFicou com sono e subiu para o **Nível ${dino.nivel} (${novaClasse})**!\n`;
            msg += `💤 _Ele não pode mais subir de nível hoje._\n`;
        } else if (hasLeveledUpToday) {
            msg += `💤 O dinossauro guardou a comida, pois já está fazendo a digestão do Level Up de hoje.\n`;
        } else {
            const porcentagem = ((dino.xp_atual / xpNecessarioProLevel) * 100).toFixed(1);
            msg += `😋 Ele devorou tudo! (Crescimento: **${porcentagem}%** para o Nível ${dino.nivel + 1})\n`;
        }

        if (reservaGanha > 0 && !usandoReserva) {
            msg += `🧊 Sobraram **${reservaGanha.toFixed(2)}kg** que foram guardados na reserva térmica individual do dino para amanhã!\n`;
        }

        return msg;
    }

    async porcionarComida(userId, userTag, foodIndexStr, pesoPorcaoStr) {
        const foodIndex = parseInt(foodIndexStr) - 1;
        const pesoPorcao = parseFloat(pesoPorcaoStr);

        if (isNaN(foodIndex) || isNaN(pesoPorcao) || pesoPorcao <= 0) {
            return `${userTag} ⚠️ Formato incorreto! Use: *!parque porcionar [numero_da_comida] [peso_em_kg]*\nEx: _!parque porcionar 1 50.5_`;
        }

        const { grouped, player } = await this.getGroupedDispensa(userId);

        if (foodIndex < 0 || foodIndex >= grouped.length) {
            return `${userTag} ❌ Peixe não encontrado na dispensa. Tem certeza que anotou o número certo?`;
        }

        const group = grouped[foodIndex];
        const food = group.instances[0];

        if (pesoPorcao >= food.weight) {
            return `${userTag} 🛑 A porção ( ${pesoPorcao}kg ) tem que ser menor que o peso total do peixe ( ${food.weight.toFixed(2)}kg )! Você não sabe usar uma faca?`;
        }

        const qtdPorcoes = Math.floor(food.weight / pesoPorcao);
        const resto = food.weight % pesoPorcao;

        const originalIndex = player.records.findIndex(r => r.instanceId === food.instanceId || (r.id === food.id && r.weight === food.weight && r.date === food.date));
        if (originalIndex > -1) {
            player.records.splice(originalIndex, 1);
        } else {
            return `${userTag} ❌ Erro ao localizar o peixe no isopor para fatiar.`;
        }

        const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

        for(let i = 0; i < qtdPorcoes; i++) {
            player.records.push({
                id: food.id,
                weight: pesoPorcao,
                group_id: food.group_id,
                date: Math.floor(Date.now() / 1000),
                instanceId: generateId()
            });
        }

        if (resto > 0.01) {
            player.records.push({
                id: food.id,
                weight: resto,
                group_id: food.group_id,
                date: Math.floor(Date.now() / 1000),
                instanceId: generateId()
            });
        }

        await this.pescariaHandler.savePlayerData(userId, player);

        return `${userTag} 🔪 **AÇOUGUEIRO PROFISSIONAL!**\n\nVocê fatiou o(a) ${food.emoji} **${food.name}** de ${food.weight.toFixed(2)}kg em:\n🥩 **${qtdPorcoes}x** porções de **${pesoPorcao.toFixed(2)}kg**.\n🍖 Sobrou um retalho de **${resto.toFixed(2)}kg**.\n\nUse *!parque despensa* para ver as novas peças de carne!`;
    }

    // FIX DE MULTIPLICADORES DE CORES
    async fixColorMultipliers(userTag) {
        const dinos = await this.db.all("SELECT id, cor FROM parque_dinossauros");
        let count = 0;

        for (const dino of dinos) {
            let novoMultiplicador = 0;
            
            for (const corBase of DINO_COLORS) {
                if (dino.cor && dino.cor.includes(corBase.name)) {
                    novoMultiplicador += corBase.mult;
                }
            }
            
            if (novoMultiplicador === 0) novoMultiplicador = 1.0;

            await this.db.run("UPDATE parque_dinossauros SET multiplicador_bilheteria = ? WHERE id = ?", [novoMultiplicador, dino.id]);
            count++;
        }

        return `${userTag} 🛠️ **MIGRAÇÃO GENÉTICA CONCLUÍDA!**\nO DNA de **${count} dinossauros** foi reescrito com sucesso.\nA bilheteria do parque acaba de sofrer uma inflação justíssima!`;
    }

    // FIX GLOBAL DE HÍBRIDOS RETROATIVOS 
    async fixHibridosGlobais(userTag, sock) {
        const grupos = await this.db.all("SELECT DISTINCT group_id FROM parque_dinossauros");
        let gruposAfetados = 0;

        for (const grupo of grupos) {
            const hibridosNovos = await this.verificarHibridos(grupo.group_id);

            if (hibridosNovos && hibridosNovos.trim() !== "") {
                gruposAfetados++;
                
                if (sock) {
                    try {
                        await sock.sendMessage(grupo.group_id, { text: hibridosNovos });
                        await new Promise(resolve => setTimeout(resolve, 1500)); 
                    } catch(e) {
                        console.error("Erro ao avisar grupo sobre o fix de híbrido:", e);
                    }
                }
            }
        }

        return `${userTag} 🛠️ **VARREDURA GENÉTICA CONCLUÍDA!**\nA InGen revirou os parques e ativou mutações adormecidas em **${gruposAfetados} grupos**.\nOs alarmes tocaram e os dinossauros já estão nas jaulas!`;
    }
}

module.exports = ParqueHandler;
