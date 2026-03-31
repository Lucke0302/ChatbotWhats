const FISH_CATALOG = [
    // LIXO 
    { id: 'bota', name: 'Bota Velha', emoji: '👢', avgWeight: 2.0, rarity: 'lixo' },
    { id: 'pneu', name: 'Pneu Furado', emoji: '🛞', avgWeight: 8.0, rarity: 'lixo' },
    { id: 'calota', name: 'Calota de Celta', emoji: '🛸', avgWeight: 1.2, rarity: 'lixo' },
    { id: 'baiacu_mc', name: 'Baiacu do Minecraft', emoji: '🐡', avgWeight: 0.5, rarity: 'lixo' },
    { id: 'placa_mae_queimada', name: 'Placa-Mãe Curto-Circuitada', emoji: '🔥', avgWeight: 1.5, rarity: 'lixo' },
    { id: 'teclado_multilaser', name: 'Teclado Multilaser Faltando W', emoji: '⌨️', avgWeight: 0.8, rarity: 'lixo' },
    { id: 'cabo_vga', name: 'Cabo VGA Dobrado', emoji: '🔌', avgWeight: 0.3, rarity: 'lixo' },
    { id: 'pote_sorvete', name: 'Pote de Sorvete (com feijão)', emoji: '🍲', avgWeight: 1.0, rarity: 'lixo' },
    { id: 'memoria_ddr1', name: 'Pente de Memória DDR1 256MB', emoji: '💾', avgWeight: 0.1, rarity: 'lixo' },
    { id: 'cooler_box', name: 'Cooler Box da Intel Cheio de Alga', emoji: '🌪️', avgWeight: 0.4, rarity: 'lixo' },
    { id: 'mouse_bolinha', name: 'Mouse de Bolinha Amarelado', emoji: '🖱️', avgWeight: 0.2, rarity: 'lixo' },
    { id: 'tcc_reprovado', name: 'Pen Drive com TCC Reprovado', emoji: '🗑️', avgWeight: 0.05, rarity: 'lixo' },
    { id: 'cd_aol', name: 'CD de Instalação da AOL 100 Horas', emoji: '💿', avgWeight: 0.02, rarity: 'lixo' },
    { id: 'fio_cobre', name: 'Emaranhado de Fio de Cobre Oxidado', emoji: '🧵', avgWeight: 5.0, rarity: 'lixo' },

    // COMUM
    { id: 'lambari', name: 'Lambari', emoji: '🐟', avgWeight: 0.1, rarity: 'comum' },
    { id: 'tilapia', name: 'Tilápia', emoji: '🐡', avgWeight: 1.5, rarity: 'comum' },
    { id: 'bagre', name: 'Bagre', emoji: '🐟', avgWeight: 2.5, rarity: 'comum' },
    { id: 'piranha', name: 'Piranha', emoji: '🐟', avgWeight: 0.8, rarity: 'comum' },
    { id: 'traira', name: 'Traíra', emoji: '🐟', avgWeight: 1.2, rarity: 'comum' },
    { id: 'sardinha_lata', name: 'Sardinha em Lata', emoji: '🥫', avgWeight: 0.3, rarity: 'comum' },
    { id: 'carpa', name: 'Carpa de Shopping', emoji: '🎏', avgWeight: 3.5, rarity: 'comum' },
    { id: 'peixe_pedra', name: 'Peixe-Pedra (Literalmente uma pedra)', emoji: '🪨', avgWeight: 4.0, rarity: 'comum' },
    { id: 'peixe_galo', name: 'Peixe-Galo', emoji: '🐓', avgWeight: 1.8, rarity: 'comum' },
    { id: 'porquinho', name: 'Peixe-Porquinho', emoji: '🐷', avgWeight: 0.4, rarity: 'comum' },
    { id: 'tainha', name: 'Tainha', emoji: '🐟', avgWeight: 1.5, rarity: 'comum' },
    { id: 'sardinha', name: 'Sardinha Fresca', emoji: '🐟', avgWeight: 0.2, rarity: 'comum' },    
    { id: 'ram_2_gb_ddr2', name: 'Memória Ram 2 GB DDR2 600MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'comum' },

    // INCOMUM
    { id: 'tambaqui', name: 'Tambaqui', emoji: '🐟', avgWeight: 15.0, rarity: 'incomum' },
    { id: 'tucunare', name: 'Tucunaré', emoji: '🐠', avgWeight: 5.0, rarity: 'incomum' },
    { id: 'feebas', name: 'Feebas', emoji: '🐟', avgWeight: 7.4, rarity: 'incomum' },
    { id: 'peixe_fabric', name: 'Peixe Bugado do Fabric', emoji: '👾', avgWeight: 3.14, rarity: 'incomum' },
    { id: 'pacu', name: 'Pacu', emoji: '🐡', avgWeight: 8.0, rarity: 'incomum' },
    { id: 'peixe_palhaco', name: 'Peixe-Palhaço Procurado', emoji: '🐠', avgWeight: 0.5, rarity: 'incomum' },
    { id: 'sapo_cururu', name: 'Sapo Cururu', emoji: '🐸', avgWeight: 2.5, rarity: 'incomum' },
    { id: 'pintado', name: 'Pintado', emoji: '🐟', avgWeight: 12.0, rarity: 'incomum' },
    { id: 'truta', name: 'Truta', emoji: '🐟', avgWeight: 3.5, rarity: 'incomum' },
    { id: 'peixe_espada', name: 'Peixe-Espada', emoji: '🗡️', avgWeight: 4.2, rarity: 'incomum' },
    { id: 'baiacu', name: 'Baiacu', emoji: '🐡', avgWeight: 1.5, rarity: 'incomum' },
    { id: 'cascudo', name: 'Cascudo Limpa-Vidro', emoji: '🧹', avgWeight: 1.0, rarity: 'incomum' },
    { id: 'piraputanga', name: 'Piraputanga', emoji: '🐟', avgWeight: 2.8, rarity: 'incomum' },    
    { id: 'ram_2_gb_ddr3', name: 'Memória Ram 2 GB DDR3 1300MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'incomum' },

    // RARO
    { id: 'pirarucu', name: 'Pirarucu', emoji: '🐉', avgWeight: 100.0, rarity: 'raro' },
    { id: 'dourado', name: 'Dourado', emoji: '✨', avgWeight: 20.0, rarity: 'raro' },
    { id: 'magikarp', name: 'Magikarp', emoji: '🐠', avgWeight: 5.0, rarity: 'raro' },  
    { id: 'dratini', name: 'Dratini', emoji: '🐉', avgWeight: 3.3, rarity: 'raro' },
    { id: 'enguia_eletrica', name: 'Enguia Elétrica', emoji: '⚡', avgWeight: 15.0, rarity: 'raro' },
    { id: 'arraia', name: 'Arraia', emoji: '🦈', avgWeight: 35.0, rarity: 'raro' },
    { id: 'peixe_leao', name: 'Peixe-Leão', emoji: '🦁', avgWeight: 1.2, rarity: 'raro' },
    { id: 'tubarao_lixa', name: 'Tubarão-Lixa', emoji: '🦈', avgWeight: 80.0, rarity: 'raro' },    
    { id: 'ram_8_gb_ddr3', name: 'Memória Ram 8 GB DDR3 1600MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'raro' },

    // MUITO RARO
    { id: 'gyarados', name: 'Gyarados', emoji: '🐉', avgWeight: 125.0, rarity: 'muito_raro' },
    { id: 'marlin', name: 'Marlin Azul', emoji: '🦈', avgWeight: 300.0, rarity: 'muito_raro' },
    { id: 'tubarao_martelo', name: 'Tubarão Martelo', emoji: '🦈', avgWeight: 250.0, rarity: 'muito_raro' },
    { id: 'capivara', name: 'Capivara do Taquaral', emoji: '🐹', avgWeight: 60.0, rarity: 'muito_raro' },
    { id: 'manta_ray', name: 'Raia Manta', emoji: '🦈', avgWeight: 1000.0, rarity: 'muito_raro' },
    { id: 'peixe_lua', name: 'Peixe-Lua', emoji: '🌕', avgWeight: 1000.0, rarity: 'muito_raro' },
    { id: 'narval', name: 'Narval', emoji: '🦄', avgWeight: 900.0, rarity: 'muito_raro' },
    { id: 'golfinho', name: 'Golfinho Flipper', emoji: '🐬', avgWeight: 150.0, rarity: 'muito_raro' },
    { id: 'ram_8_gb_ddr4', name: 'Memória Ram 8 GB DDR4 3200MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'muito_raro' },

    // LENDÁRIO
    { id: 'magikarp_d', name: 'Magikarp Dourada', emoji: '✨', avgWeight: 10.0, rarity: 'lendario' },
    { id: 'gyarados_v', name: 'Gyarados Vermelho', emoji: '🐉', avgWeight: 250.0, rarity: 'lendario' },
    { id: 'tubarao_branco', name: 'Tubarão Branco', emoji: '🐋', avgWeight: 750.0, rarity: 'lendario' },    
    { id: 'orca', name: 'Orca Assassina', emoji: '🐳', avgWeight: 1000.0, rarity: 'lendario' },
    { id: 'kraken_f', name: 'Kraken Filhote', emoji: '🦑', avgWeight: 500.0, rarity: 'lendario' },
    { id: 'leviathan_f', name: 'Filhote de Leviatã', emoji: '🐉', avgWeight: 1000.0, rarity: 'lendario' },
    { id: 'caranguejo_colossal', name: 'Caranguejo Colossal', emoji: '🦀', avgWeight: 800.0, rarity: 'lendario' },
    { id: 'poseidon_peixe', name: 'O Tridente de Poseidon', emoji: '🔱', avgWeight: 25.0, rarity: 'lendario' },    
    { id: 'ram_16_gb_ddr4', name: 'Memória Ram 16 GB DDR4 3600MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'lendario' },

    // MÍTICO
    { id: 'bostossauro_aq', name: 'Bostossauro Aquático', emoji: '🦖', avgWeight: 999.9, rarity: 'mitico' },
    { id: 'fizz', name: 'Fizz Feedado', emoji: '🔱', avgWeight: 70.0, rarity: 'mitico' },
    { id: 'cthulhu', name: 'Cthulhu Dorminhoco', emoji: '🐙', avgWeight: 5000.0, rarity: 'mitico' },
    { id: 'kraken', name: 'Kraken Adulto', emoji: '🐙', avgWeight: 2500.0, rarity: 'mitico' },    
    { id: 'megalodon', name: 'Megalodon', emoji: '🦈', avgWeight: 40000.0, rarity: 'mitico' },
    { id: 'leviathan', name: 'Leviatã', emoji: '🐉', avgWeight: 50000.0, rarity: 'mitico' },
    { id: 'baleia_azul', name: 'Baleia Azul Gigante', emoji: '🐋', avgWeight: 150000.0, rarity: 'mitico' },
    { id: 'nami_ap', name: 'Nami Full AP', emoji: '🧜‍♀️', avgWeight: 60.0, rarity: 'mitico' },
    { id: 'ryze_rio', name: 'Ryze Ultando no Rio', emoji: '🧙‍♂️', avgWeight: 80.0, rarity: 'mitico' },    
    { id: 'ram_16_gb_ddr5', name: 'Memória Ram 32 GB DDR5 6000MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'mitico' },

    // SECRETOS
    { id: 'peixe_silvio', name: 'Peixe de Ouro do Silvio Santos', emoji: '🏆', avgWeight: 100.0, rarity: 'secreto' },
    { id: 'rtx_5090', name: 'RTX 5090 Ti Submersa e Intacta', emoji: '💻', avgWeight: 3.5, rarity: 'secreto' },
    { id: 'codigo_tcc', name: 'O Código Fonte do TCC que Funciona', emoji: '💾', avgWeight: 0.01, rarity: 'secreto' },
    { id: 'ram_64_gb_ddr5', name: 'Memória Ram 64 GB DDR5 6000MHZ', emoji: '💾', avgWeight: 0.1, rarity: 'secreto' },
];

const ITEM_CATALOG = [
    // INSTANTÂNEOS
    { id: 'balde_iscas', name: 'Balde de Iscas', emoji: '🪣', type: 'instant', effect: 3, desc: 'Dá +3 iscas na hora!' },
    { id: 'gaivota', name: 'Gaivota Ladra', emoji: '🦅', type: 'instant_debuff', effect: -1, desc: 'Uma gaivota te atacou e roubou 1 isca!' },
    
    // BUFFS
    { id: 'anzol_duplo', name: 'Anzol Duplo', emoji: '🪝', type: 'buff', duration: 3, desc: 'Pesca 2 peixes de uma vez.' },
    { id: 'anzol_chumbo', name: 'Anzol de Chumbo', emoji: '⚓', type: 'buff', duration: 5, desc: 'Aumenta o peso dos peixes em 30%.' },
    { id: 'repelente', name: 'Repelente de Bota', emoji: '🧴', type: 'buff', duration: 4, desc: 'Zera a chance de pescar lixo.' },
    { id: 'ima_coins', name: 'Ímã de Bostocoins', emoji: '🧲', type: 'buff', duration: 3, desc: 'Pesca de 10 a 50 Bostocoins junto com o peixe.' },
    { id: 'isca_radioativa', name: 'Isca Radioativa', emoji: '☢️', type: 'buff', duration: 2, desc: 'Peso +50%, mas 20% de chance da linha derreter.' },

    // DEBUFFS
    { id: 'linha_podre', name: 'Linha Podre', emoji: '🧶', type: 'debuff', duration: 3, desc: '25% de chance da linha arrebentar e perder o peixe.' },
    { id: 'maldicao_baiacu', name: 'Maldição do Baiacu', emoji: '🐡', type: 'debuff', duration: 4, desc: 'Aumenta muito a chance de vir Lixo.' }
];

const STORE_CATALOG = {
    '1': { id: 'isca_simples', name: 'Isca de Pão', emoji: '🍞', type: 'instant', effect: 1, price: 100, desc: 'Dá +1 isca na hora. Baratinha pros falidos.' },
    '2': { id: 'balde_iscas', name: 'Balde de Iscas', emoji: '🪣', type: 'instant', effect: 4, price: 300, desc: 'Dá +4 iscas na hora (Pequeno desconto).' },
    '3': { id: 'repelente', name: 'Repelente de Bota', emoji: '🧴', type: 'buff', duration: 4, price: 200, desc: 'Zera a chance de pescar lixo por 4 rodadas.' },
    '4': { id: 'anzol_chumbo', name: 'Anzol de Chumbo', emoji: '⚓', type: 'buff', duration: 5, price: 200, desc: 'Aumenta o peso dos peixes em 30% por 5 rodadas.' },
    '5': { id: 'ima_coins', name: 'Ímã de Bostocoins', emoji: '🧲', type: 'buff', duration: 3, price: 200, desc: 'Garante achar Bostocoins no fundo do lago por 3 rodadas.' }
};

const ROD_CATALOG = {
        'bambu': { id: 'bambu', name: 'Vara de Bambu', mult: 1.0, luck: 0, anti_lixo: 0, ambar_chance: 0, emoji: '🎋', price: 0, next: 'fibra' },
        'fibra': { id: 'fibra', name: 'Vara de Fibra de Vidro', mult: 1.10, luck: 5, anti_lixo: 10, ambar_chance: 1, emoji: '🎣', price: 800, next: 'grafite' },
        'grafite': { id: 'grafite', name: 'Vara de Grafite Pro', mult: 1.20, luck: 10, anti_lixo: 20, ambar_chance: 2, emoji: '✒️', price: 1250, next: 'carbono' },
        'carbono': { id: 'carbono', name: 'Vara de Carbono', mult: 1.30, luck: 15, anti_lixo: 40, ambar_chance: 3, emoji: '💎', price: 2000, next: 'aco' },    
        'aco': { id: 'aco', name: 'Vara de Aço Temperado', mult: 1.40, luck: 20, anti_lixo: 60, ambar_chance: 4, emoji: '🔩', price: 3000, next: 'grafeno' },
        'grafeno': { id: 'grafeno', name: 'Vara de Grafeno', mult: 1.50, luck: 25, anti_lixo: 80, ambar_chance: 5, emoji: '💎', price: 5000, next: 'adamantium' },
        'adamantium': { id: 'adamantium', name: 'Vara de Adamantium', mult: 1.60, luck: 30, anti_lixo: 100, ambar_chance: 6, emoji: '🌌', price: 8000, next: null }
};

const BOAT_CATALOG = {
    'pequeno': { id: 'pequeno', name: 'Barquinho de Madeira', catches: 2, emoji: '🛶', price: 10000, next: 'medio' },
    'medio': { id: 'medio', name: 'Lancha de Pesca', catches: 3, emoji: '🚤', price: 15000, next: 'grande' },
    'grande': { id: 'grande', name: 'Navio Pesqueiro', catches: 4, emoji: '⛴️', price: 20000, next: 'industrial' },
    'industrial': { id: 'industrial', name: 'Traineira Industrial', catches: 5, emoji: '🚢', price: 30000, next: null }
};

const RARITY_MULTIPLIER = {
    'lixo': 1,
    'comum': 5,
    'incomum': 10,
    'raro': 50,
    'muito_raro': 250,
    'lendario': 750,
    'mitico': 2000,
    'secreto': 20000
};

const RARITY_ORDER = ['comum', 'incomum', 'raro', 'muito_raro', 'lendario', 'mitico', 'secreto', 'lixo'];

const RARITY_LABELS = {
    'comum': '⚪ COMUM', 
    'incomum': '🟢 INCOMUM', 
    'raro': '🔵 RARO', 
    'muito_raro': '🟣 MUITO RARO', 
    'lendario': '🟡 LENDÁRIO', 
    'mitico': '🔴 MÍTICO', 
    'secreto': '🌌 ?????', 
    'lixo': '🟤 LIXO'
};

const CLIMA_PESCA = {
    'sol': { 
        ambar_mult: 1.5, peso_mult: 1.0, quebra_chance: 0.0, raridade_mult: 1.0, 
        txt: '☀️ Água cristalina (+Chance de Âmbar/Loot)' 
    },
    'chuva': { 
        ambar_mult: 1.0, peso_mult: 1.15, quebra_chance: 0.0, raridade_mult: 1.0, 
        txt: '🌧️ Peixes na superfície (+Peso)' 
    },
    'trovoada': { 
        ambar_mult: 1.0, peso_mult: 1.0, quebra_chance: 0.3, raridade_mult: 2.0, 
        txt: '⛈️ Maré violenta (30% Risco de Quebra | 2x Míticos/Lendários)' 
    },
    'nublado': { 
        ambar_mult: 1.0, peso_mult: 1.0, quebra_chance: 0.0, raridade_mult: 1.0, 
        txt: '☁️ Clima ameno (Regras padrões)' 
    }
};

const MAX_SUPPLIES = 10;
const SUPPLY_REGEN_HOURS = 2;
const SUPPLY_REGEN_SECONDS = SUPPLY_REGEN_HOURS * 3600;

class PescariaHandler {
    constructor(db, casinoHandler) {
        this.db = db;
        this.casinoHandler = casinoHandler;
    }

    async getPlayerData(userId) {
        const user = await this.db.get("SELECT pescaria_data FROM usuarios WHERE id_usuario = ?", [userId]);
        let data = {};
        
        if (user && user.pescaria_data) {
            try { data = JSON.parse(user.pescaria_data); } catch (e) { data = {}; }
        }

        const now = Math.floor(Date.now() / 1000);

        let player = {
            total_weight: data.total_weight || 0,
            records: data.records || {},
            inventory: data.inventory || { vara: 'bambu' },
            active_items: data.active_items || {},
            
            suprimentos: data.suprimentos !== undefined ? data.suprimentos : (data.fishBaits !== undefined ? data.fishBaits : MAX_SUPPLIES),
            last_supply_regen: data.last_supply_regen || data.last_bait_regen || now
        };

        if (player.suprimentos < MAX_SUPPLIES) {
            const timePassed = now - player.last_supply_regen;
            const generated = Math.floor(timePassed / SUPPLY_REGEN_SECONDS);
            
            if (generated > 0) {
                player.suprimentos = Math.min(MAX_SUPPLIES, player.suprimentos + generated);
                player.last_supply_regen += generated * SUPPLY_REGEN_SECONDS;
            }
        } else {
            player.last_supply_regen = now;
        }

        delete player.fishBaits;
        delete player.last_bait_regen;

        const userRodId = player.inventory.vara || 'bambu';
        const userRod = ROD_CATALOG[userRodId] || ROD_CATALOG['bambu'];
        const userBoatId = player.inventory.barco;
        const userBoat = userBoatId ? BOAT_CATALOG[userBoatId] : { catches: 1 };

        const boatPenalty = userBoat.catches; 

        player.fishing_stats = {
            rod_mult: userRod.mult,
            luck: userRod.luck / boatPenalty,
            anti_lixo: userRod.anti_lixo / boatPenalty,
            ambar_chance: (userRod.ambar_chance || 0) / boatPenalty,
            catches: userBoat.catches
        };

        return player;
    }

    async savePlayerData(userId, data) {
        const jsonString = JSON.stringify(data);
        await this.db.run("UPDATE usuarios SET pescaria_data = ? WHERE id_usuario = ?", [jsonString, userId]);
    }

    async setParqueHandler(parqueHandler) {
        this.parqueHandler = parqueHandler;
    }

    async pescar(userId, userTag, groupId, climaAtual, sock) {
        if (!climaAtual) climaAtual = { condicao: 'nublado', emoji: '☁️', cidade: 'Desconhecida' };
        
        const mods = CLIMA_PESCA[climaAtual.condicao] || CLIMA_PESCA['nublado'];

        let player = await this.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        if (player.suprimentos < 1) {
            const nextIn = SUPPLY_REGEN_SECONDS - (now - player.last_supply_regen);
            const hours = Math.floor(nextIn / 3600);
            const mins = Math.floor((nextIn % 3600) / 60);
            return `${userTag}🪹 Você está sem suprimentos (Iscas/Água)!\nVocê recebe uma nova carga de energia em **${hours}h e ${mins}m**.\n_(Máximo acumulado: ${MAX_SUPPLIES})_`;
        }

        player.suprimentos -= 1;
        
        if (player.suprimentos === (MAX_SUPPLIES - 1) && now - player.last_supply_regen < 10) {
            player.last_supply_regen = now;
        }

        if (mods.quebra_chance > 0 && Math.random() < mods.quebra_chance) {
            await this.savePlayerData(userId, player);
            return `${userTag}🎣 **PESCARIA EM ${climaAtual.cidade.toUpperCase()}**\n_Clima: ${mods.txt}_\n_Suprimentos: ${player.suprimentos}_\n\n⛈️ **TEMPESTADE!** Uma onda gigante bateu, a linha tensionou e... **PAH!** Arrebentou tudo.\nVocê perdeu o suprimento e quase foi pro mar junto.`;
        }

        let msg = `${userTag}🎣 **PESCARIA EM ${climaAtual.cidade.toUpperCase()}**\n_Clima: ${mods.txt}_\n_Suprimentos restantes: ${player.suprimentos}_\n\n`;
        
        let catches = player.fishing_stats.catches;
        let weightMultiplierBuff = 1.0;
        let canCatchTrash = true;

        if (player.active_items['anzol_duplo']) catches *= 2; 
        
        if (player.active_items['anzol_chumbo']) weightMultiplierBuff *= 1.30;
        if (player.active_items['isca_radioativa']) weightMultiplierBuff *= 1.50;
        if (player.active_items['repelente']) canCatchTrash = false;

        weightMultiplierBuff *= player.fishing_stats.rod_mult;

        const activeItemNames = Object.keys(player.active_items).map(id => ITEM_CATALOG.find(i => i.id === id)?.name).filter(Boolean);
        if (activeItemNames.length > 0) {
            msg += `✨ _Efeitos Ativos:_ ${activeItemNames.join(', ')}\n\n`;
        }

        for (let i = 0; i < catches; i++) {

            
            const chanceAmbar = 0.05 * mods.ambar_mult;            
            const ambarTotalChance = chanceAmbar + (player.fishing_stats.ambar_chance / 200);

            if (this.parqueHandler && Math.random() < ambarTotalChance) {
                msg += `\n🎣 **ISSO NÃO É UM PEIXE!**\nVocê puxou um 🦟 **Âmbar Ancestral** do fundo do lago!\n\n`;
                msg += await this.parqueHandler.acharAmbar(userId, userTag, groupId);
                continue; 
            }

            if (player.active_items['isca_radioativa'] && Math.random() < 0.20) {
                msg += `☢️ A isca radioativa derreteu sua linha! O peixe fugiu.\n`;
                continue;
            }

            let roll = Math.random() * 100;
            roll = roll * (1 - (player.fishing_stats.luck / 100));

            const chanceMitico = 1 * mods.raridade_mult;
            const chanceLendario = 5 * mods.raridade_mult; 

            let selectedRarity = 'comum';
            
            if (roll < 0.1) selectedRarity = 'secreto';
            else if (roll < chanceMitico) selectedRarity = 'mitico';
            else if (roll < chanceLendario) selectedRarity = 'lendario';
            else if (roll < 20) selectedRarity = 'muito_raro';
            else if (roll < 40) selectedRarity = 'raro';
            else if (roll < 60) selectedRarity = 'incomum';
            else if (roll < 80) selectedRarity = 'lixo';

            if (player.active_items['maldicao_baiacu'] && Math.random() < 0.35) {
                selectedRarity = 'lixo';
            }

            if (selectedRarity === 'lixo') {
                if (Math.random() * 100 < player.fishing_stats.anti_lixo) {
                    selectedRarity = 'comum'; 
                }
            }

            if (selectedRarity === 'lixo' && !canCatchTrash) {
                selectedRarity = 'comum';
            }

            const possibleFishes = FISH_CATALOG.filter(f => f.rarity === selectedRarity);
            const caughtFish = possibleFishes[Math.floor(Math.random() * possibleFishes.length)];

            const baseMultiplier = 0.5 + Math.random(); 
            const actualWeight = caughtFish.avgWeight * baseMultiplier * weightMultiplierBuff * mods.peso_mult;
            const formattedWeight = actualWeight.toFixed(2);

            if (player.active_items['linha_podre'] && Math.random() < 0.25) {
                msg += `🧶 A linha podre ARREBENTOU ao tentar puxar um(a) **${caughtFish.name}**!\n`;
                continue; 
            }

            if (caughtFish.rarity === 'lixo') {
                msg += `${caughtFish.emoji} Fisgou: **${caughtFish.name}** (${formattedWeight}kg).\n`;
            } else {
                msg += `${caughtFish.emoji} Fisgou: **${caughtFish.name}** de **${formattedWeight}kg**!\n`;
                player.total_weight += actualWeight;
                
                if (!Array.isArray(player.records)) {
                    player.records = []; 
                }

                player.records.push({
                    id: caughtFish.id,
                    weight: actualWeight,
                    group_id: groupId,
                    date: now,
                    instanceId: crypto.randomUUID()
                });

                if (this.parqueHandler && groupId && groupId.includes('@g.us')) {
                    this.parqueHandler.registrarProgressoComunitario(groupId, 'pesca_kg', actualWeight, sock).catch(()=>{});
                }

                if (player.active_items['ima_coins']) {
                    const moedasAchadas = Math.floor(Math.random() * 41) + 10;
                    const profitResult = await this.casinoHandler.verifyProfit(userId, moedasAchadas);
                    
                    await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);
                    msg += `   🧲 Puxou junto 🪙 **${moedasAchadas} Bostocoins**!${profitResult.msg}\n`;
                }
            }
        }

        let itensAchadosAgora = [];

        if (Math.random() < 0.20) {
            const droppedItem = ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];
            msg += `\n🎁 **ACHADO NO LAGO!** Você fisgou: ${droppedItem.emoji} *${droppedItem.name}*\n`;
            
            if (droppedItem.type === 'instant') {
                player.suprimentos += droppedItem.effect;
                msg += `_${droppedItem.desc}_\n`;
            } else if (droppedItem.type === 'instant_debuff') {
                player.suprimentos = Math.max(0, player.suprimentos + droppedItem.effect);
                msg += `_${droppedItem.desc}_\n`;
            } else {
                player.active_items[droppedItem.id] = droppedItem.duration;
                msg += `_Ativo por ${droppedItem.duration} rodadas! (${droppedItem.desc})_\n`;
                itensAchadosAgora.push(droppedItem.id);
            }
        }

        for (const itemId in player.active_items) {
            if (!itensAchadosAgora.includes(itemId)) {
                player.active_items[itemId] -= 1;
                if (player.active_items[itemId] <= 0) {
                    delete player.active_items[itemId]; 
                }
            }
        }

        await this.savePlayerData(userId, player);
        return msg;
    }

    // RANKING DE PESCA
    async getRanking(groupId, userTag) {
        const users = await this.db.all("SELECT nome, pescaria_data FROM usuarios WHERE pescaria_data IS NOT NULL AND pescaria_data != '{}'");

        if (!users || users.length === 0) return `${userTag} Ninguém pescou nada ainda. Bando de preguiçosos!`;

        let ranking = [];
        for (const u of users) {
            try {
                const data = JSON.parse(u.pescaria_data);
                
                let hasFishedInGroup = false;
                if (Array.isArray(data.records)) {
                    for (const record of data.records) {
                        if (record.group_id === groupId) {
                            hasFishedInGroup = true;
                            break;
                        }
                    }
                }

                if (hasFishedInGroup && data.total_weight > 0) {
                    ranking.push({ nome: u.nome || 'Anônimo', peso: data.total_weight });
                }
            } catch (e) {
            }
        }

        ranking.sort((a, b) => b.peso - a.peso);
        const top10 = ranking.slice(0, 10);

        if (top10.length === 0) return `${userTag}🎣 Nenhum pescador local puxou peixe destas águas ainda!`;

        let msg = `🏆 **RANKING DE PESCADORES LOCAIS** 🏆\n_Quem tem a maior... quantidade de quilos fisgados_\n\n`;
        const medalhas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        
        top10.forEach((p, i) => {
            const medalha = medalhas[i] || "🏅";
            msg += `${medalha} *${p.nome}* ➝ **${p.peso.toFixed(2)}kg**\n`;
        });

        return msg;
    }

    // PERFIL E INVENTÁRIO
    async getPerfil(userId, userTag) {
        const player = await this.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        let msg = `${userTag}🎣 **CARTEIRA DE PESCADOR** 🎣\n\n`;
        msg += `⚖️ *Peso Total Pescado:* ${player.total_weight.toFixed(2)}kg\n`;

        // EXIBE A VARA E OS BUFFS
        const userRodId = player.inventory.vara || 'bambu';
        const userRod = ROD_CATALOG[userRodId];
        const currentBonus = Math.round((userRod.mult - 1) * 100);
        msg += `🛠️ *Vara:* ${userRod.emoji} ${userRod.name} (+${currentBonus}% Peso | +${userRod.luck}% Sorte | -${userRod.anti_lixo}% Lixo)\n\n`;

        if (player.inventory.barco) {
            const userBoat = BOAT_CATALOG[player.inventory.barco];
            msg += `⛴️ *Frota:* ${userBoat.emoji} ${userBoat.name} (Puxa ${userBoat.catches} peixes/isca)\n`;
        }
        msg += `\n`;

        // Status dos Suprimentos
        msg += `📦 *Suprimentos (Iscas/Água):* ${player.suprimentos}/${MAX_SUPPLIES}\n`;
        if (player.suprimentos < MAX_SUPPLIES) {
            const nextIn = SUPPLY_REGEN_SECONDS - (now - player.last_supply_regen);
            const hours = Math.floor(nextIn / 3600);
            const mins = Math.floor((nextIn % 3600) / 60);
            msg += `⏳ _Próxima carga em: ${hours}h e ${mins}m_\n`;
        }

        // Efeitos/Itens Ativos
        const activeBuffs = Object.keys(player.active_items);
        if (activeBuffs.length > 0) {
            msg += `\n✨ *Efeitos Ativos:*\n`;
            for (const id of activeBuffs) {
                const item = ITEM_CATALOG.find(i => i.id === id);
                if (item) {
                    msg += ` ${item.emoji} ${item.name} (${player.active_items[id]} rodadas)\n`;
                }
            }
        }

        const records = player.records;
        
        if (Array.isArray(records) && records.length > 0) {
            msg += `\n🌟 *Seus Maiores Troféus:*\n`;
            
            const sortedRecords = [...records]
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 5);

            for (const r of sortedRecords) {
                const fishInfo = FISH_CATALOG.find(f => f.id === r.id);
                if (fishInfo) {
                    msg += ` ${fishInfo.emoji} ${fishInfo.name}: **${r.weight.toFixed(2)}kg**\n`;
                }
            }
        } else {
            msg += `\n🌟 *Troféus:* Nenhum peixe digno ainda.\n`;
        }

        return msg;
    }

    // TOP 3 PESSOAL POR RARIDADE
    async getTopPessoal(userId, userTag) {
        const player = await this.getPlayerData(userId);
        
        if (!player.records || Object.keys(player.records).length === 0) {
            return `${userTag} Você ainda não tem nenhum recorde. Jogue a isca na água primeiro!`;
        }

        const categorized = {};

        for (const [fishId, recordData] of Object.entries(player.records)) {
            const fishInfo = FISH_CATALOG.find(f => f.id === fishId);
            if (!fishInfo) continue;

            const weight = typeof recordData === 'object' ? recordData.weight : recordData;
            const maxWeight = fishInfo.avgWeight * 1.5;
            const score = (weight / maxWeight) * 100;

            if (!categorized[fishInfo.rarity]) categorized[fishInfo.rarity] = [];
            
            categorized[fishInfo.rarity].push({
                name: fishInfo.name,
                emoji: fishInfo.emoji,
                weight: weight,
                score: score
            });
        }

        let msg = `${userTag}🎣 **SEUS MELHORES PEIXES (Por Raridade)** 🎣\n_Nota: Proximidade do peso máximo padrão_\n\n`;
        const medalhas = ["🥇", "🥈", "🥉"];

        for (const rarity of RARITY_ORDER) {
            if (categorized[rarity] && categorized[rarity].length > 0) {
                msg += `*${RARITY_LABELS[rarity]}*\n`;
                
                const top3 = categorized[rarity].sort((a, b) => b.score - a.score).slice(0, 3);
                
                top3.forEach((f, i) => {
                    msg += `${medalhas[i]} ${f.emoji} ${f.name} ➝ **${f.score.toFixed(1)}/100** _(${f.weight.toFixed(2)}kg)_\n`;
                });
                msg += `\n`;
            }
        }

        return msg;
    }

    // TOP 3 PESSOAL POR RARIDADE
    async getTopPessoal(userId, userTag) {
        const player = await this.getPlayerData(userId);
        
        if (!player.records || Object.keys(player.records).length === 0) {
            return `${userTag} Você ainda não tem nenhum recorde. Jogue a isca na água primeiro!`;
        }

        const categorized = {};

        for (const [fishId, recordData] of Object.entries(player.records)) {
            const fishInfo = FISH_CATALOG.find(f => f.id === fishId);
            if (!fishInfo) continue;

            const weight = typeof recordData === 'object' ? recordData.weight : recordData;
            const maxWeight = fishInfo.avgWeight * 1.5;
            const score = (weight / maxWeight) * 100;

            if (!categorized[fishInfo.rarity]) categorized[fishInfo.rarity] = [];
            
            categorized[fishInfo.rarity].push({
                name: fishInfo.name,
                emoji: fishInfo.emoji,
                weight: weight,
                score: score
            });
        }

        let msg = `${userTag}🎣 **SEUS MELHORES PEIXES (Por Raridade)** 🎣\n_Nota: Proximidade do peso máximo padrão_\n\n`;
        
        const rarityOrder = ['comum', 'incomum', 'raro', 'muito_raro', 'lendario', 'mitico', 'lixo'];
        const rarityLabels = {
            'comum': '⚪ COMUM', 'incomum': '🟢 INCOMUM', 'raro': '🔵 RARO', 
            'muito_raro': '🟣 MUITO RARO', 'lendario': '🟡 LENDÁRIO', 'mitico': '🔴 MÍTICO', 'lixo': '🟤 LIXO'
        };
        const medalhas = ["🥇", "🥈", "🥉"];

        for (const rarity of rarityOrder) {
            if (categorized[rarity] && categorized[rarity].length > 0) {
                msg += `*${rarityLabels[rarity]}*\n`;
                
                const top3 = categorized[rarity].sort((a, b) => b.score - a.score).slice(0, 3);
                
                top3.forEach((f, i) => {
                    msg += `${medalhas[i]} ${f.emoji} ${f.name} ➝ **${f.score.toFixed(1)}/100** _(${f.weight.toFixed(2)}kg)_\n`;
                });
                msg += `\n`;
            }
        }

        return msg;
    }

    // TOP 3 DO GRUPO POR RARIDADE
    async getTopGrupoPorRaridade(groupId, userTag) {
        const users = await this.db.all("SELECT nome, pescaria_data FROM usuarios WHERE pescaria_data IS NOT NULL AND pescaria_data != '{}'");
        const categorized = {};

        for (const u of users) {
            try {
                const data = JSON.parse(u.pescaria_data);
                if (!Array.isArray(data.records)) continue;

                for (const record of data.records) {
                    if (record.group_id === groupId) {
                        const fishInfo = FISH_CATALOG.find(f => f.id === record.id);
                        if (!fishInfo) continue;

                        const weight = record.weight;
                        const maxWeight = fishInfo.avgWeight * 1.5;
                        const score = (weight / maxWeight) * 100;

                        if (!categorized[fishInfo.rarity]) categorized[fishInfo.rarity] = [];
                        
                        categorized[fishInfo.rarity].push({
                            userName: u.nome || 'Anônimo',
                            name: fishInfo.name,
                            emoji: fishInfo.emoji,
                            weight: weight,
                            score: score
                        });
                    }
                }
            } catch (e) {}
        }

        let msg = `🏆 **A ELITE DA PESCARIA DO GRUPO** 🏆\n_Os peixes mais perfeitos por categoria:_\n\n`;
        const medalhas = ["🥇", "🥈", "🥉"];
        let encontrouAlgo = false;

        for (const rarity of RARITY_ORDER) {
            if (categorized[rarity] && categorized[rarity].length > 0) {
                encontrouAlgo = true;
                msg += `*${RARITY_LABELS[rarity]}*\n`;
                
                const top3 = categorized[rarity].sort((a, b) => b.score - a.score).slice(0, 3);
                
                top3.forEach((f, i) => {
                    msg += `${medalhas[i]} *${f.userName}* ➝ ${f.emoji} ${f.name} (**${f.score.toFixed(1)}/100**) _-${f.weight.toFixed(2)}kg_\n`;
                });
                msg += `\n`;
            }
        }

        if (!encontrouAlgo) {
            return `${userTag} Nenhuma escama foi vista neste grupo ainda!`;
        }

        return msg;
    }

    // EXIBE A LOJA
    async getLoja(userId, userTag) {
        const userDb = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const balance = userDb ? userDb.bostocoins : 0;
        const player = await this.getPlayerData(userId);

        let msg = `${userTag}🏪 **LOJA DO PESCADOR** 🏪\n_Seu saldo: 🪙 ${balance} Bostocoins_\n\n`;
        
        msg += `🎒 **ITENS CONSUMÍVEIS:**\n`;
        for (const [code, item] of Object.entries(STORE_CATALOG)) {
            msg += `*[ ${code} ]* ${item.emoji} **${item.name}** ➝ 🪙 ${item.price}\n_${item.desc}_\n\n`;
        }
        
        msg += `🎣 **FORJA DE VARAS (_lá ele_):**\n`;
        const currentRodId = player.inventory.vara || 'bambu';
        const currentRod = ROD_CATALOG[currentRodId];
        
        if (currentRod.next) {
            const nextRod = ROD_CATALOG[currentRod.next];
            const currentBonus = Math.round((currentRod.mult - 1) * 100);
            const nextBonus = Math.round((nextRod.mult - 1) * 100);
            
            msg += `_Sua vara: ${currentRod.emoji} ${currentRod.name} (+${currentBonus}% Peso | +${currentRod.luck}% Sorte | -${currentRod.anti_lixo}% Lixo)_\n\n`;
            msg += `*[ vara ]* ${nextRod.emoji} **${nextRod.name}** ➝ 🪙 ${nextRod.price}\n_Melhora para: +${nextBonus}% Peso | +${nextRod.luck}% Sorte | -${nextRod.anti_lixo}% Lixo_\n\n`;
        } else {
            const currentBonus = Math.round((currentRod.mult - 1) * 100);
            msg += `_Sua vara: ${currentRod.emoji} ${currentRod.name} (+${currentBonus}% Peso | +${currentRod.luck}% Sorte | -${currentRod.anti_lixo}% Lixo)_\n`;
            msg += `✨ *Você já possui a melhor vara de pescar do universo!* O ferreiro chora de emoção ao vê-la.\n\n`;
        }

        if (currentRodId === 'adamantium') {
            msg += `\n⚓ **ESTALEIRO NAVAL:**\n`;
            const currentBoatId = player.inventory.barco;
            if (!currentBoatId) {
                const nextBoat = BOAT_CATALOG['pequeno'];
                msg += `_Você atualmente pesca da beira do barranco._\n`;
                msg += `*[ barco ]* ${nextBoat.emoji} **${nextBoat.name}** ➝ 🪙 ${nextBoat.price}\n_Puxa ${nextBoat.catches} peixes por isca!_\n\n`;
            } else {
                const currentBoat = BOAT_CATALOG[currentBoatId];
                if (currentBoat.next) {
                    const nextBoat = BOAT_CATALOG[currentBoat.next];
                    msg += `_Sua frota: ${currentBoat.emoji} ${currentBoat.name} (${currentBoat.catches} peixes/isca)_\n`;
                    msg += `*[ barco ]* ${nextBoat.emoji} **${nextBoat.name}** ➝ 🪙 ${nextBoat.price}\n_Melhora para: ${nextBoat.catches} peixes por isca!_\n\n`;
                } else {
                    msg += `_Sua frota: ${currentBoat.emoji} ${currentBoat.name} (${currentBoat.catches} peixes/isca)_\n`;
                    msg += `🛳️ *Você já domina os sete mares! Não há navio maior.*\n\n`;
                }
            }
            if (!currentBoatId || BOAT_CATALOG[currentBoatId].next) msg += `⛴️ Para comprar frota: *!pescaria comprar barco*\n`;
        }

        msg += `🛒 Para comprar consumíveis: *!pescaria comprar [número]*\n`;
        if (currentRod.next) msg += `🛠️ Para evoluir a vara: *!pescaria comprar vara*`;
        
        return msg;
    }

    // PROCESSA A COMPRA
    async comprarItem(userId, userTag, itemCode) {
        if (!itemCode) return `${userTag}❌ Código inválido! Digite *!pescaria loja* para ver o catálogo.`;
        
        const userDb = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const balance = userDb ? userDb.bostocoins : 0;
        let player = await this.getPlayerData(userId);

        let msg = "";
        if (itemCode.toLowerCase() === 'vara') {
            const currentRodId = player.inventory.vara || 'bambu';
            const currentRod = ROD_CATALOG[currentRodId];
            
            if (!currentRod.next) {
                return `${userTag}🌟 Calma aí, lenda das águas! Você já forjou a *${currentRod.name}*, não existe vara melhor que essa no mercado.`;
            }

            const nextRod = ROD_CATALOG[currentRod.next];

            if (balance < nextRod.price) {
                return `${userTag}💸 Tá achando que ferro e carbono dão em árvore? Você precisa de 🪙 **${nextRod.price} Bostocoins** pra forjar a ${nextRod.emoji} *${nextRod.name}*.\nVocê só tem 🪙 ${balance}. Trabalhe mais!`;
            }

            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [nextRod.price, userId]);
            
            player.inventory.vara = nextRod.id;
            await this.savePlayerData(userId, player);

            const novoBonus = Math.round((nextRod.mult - 1) * 100);
            msg = `${userTag}⚒️ **VARA FORJADA COM SUCESSO!**\nO ferreiro pegou seus 🪙 ${nextRod.price} Bostocoins e montou uma ${nextRod.emoji} **${nextRod.name}** novinha em folha pra você!\n\n🐟 Agora todos os seus peixes serão **+${novoBonus}%** mais pesados (E consequentemente, mais caros)!`;
            if (nextRod.id === 'adamantium') {
                msg += `\n\n🐺 _Você impressionou o ferreiro e desbloqueou o título **Wolverine dos Mares**! Use *!pescaria titulo* para equipar._`;
            }
            return msg;
        }

        if (itemCode.toLowerCase() === 'barco') {
            const currentRodId = player.inventory.vara || 'bambu';
            if (currentRodId !== 'adamantium') {
                return `${userTag}✋ O engenheiro naval riu da sua cara. "Volte aqui quando tiver forjado uma Vara de Adamantium, pescador de lambari!"`;
            }

            const currentBoatId = player.inventory.barco;
            let nextBoatId = 'pequeno';
            if (currentBoatId) {
                const currentBoat = BOAT_CATALOG[currentBoatId];
                if (!currentBoat.next) return `${userTag}🛳️ Você já é dono da maior máquina de pescar do mundo!`;
                nextBoatId = currentBoat.next;
            }

            const nextBoat = BOAT_CATALOG[nextBoatId];

            if (balance < nextBoat.price) {
                return `${userTag}💸 Barco custa caro! Você precisa de 🪙 **${nextBoat.price} Bostocoins** para comprar o ${nextBoat.emoji} *${nextBoat.name}*.\nSeu saldo: 🪙 ${balance}.`;
            }

            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [nextBoat.price, userId]);
            player.inventory.barco = nextBoat.id;
            await this.savePlayerData(userId, player);

            return `${userTag}⛴️ **NOVO BARCO NA FROTA!**\nVocê pagou 🪙 ${nextBoat.price} Bostocoins e agora é o orgulhoso capitão do ${nextBoat.emoji} **${nextBoat.name}**!\n\n🐟 Suas redes agora arrastam **${nextBoat.catches} peixes por isca**! (Multiplica com Anzol Duplo!)`;
        }

        if (!STORE_CATALOG[itemCode]) {
            return `${userTag}❌ Código de item inválido! Digite *!pescaria loja* para ver o catálogo.`;
        }

        const item = STORE_CATALOG[itemCode];

        if (balance < item.price) {
            return `${userTag}💸 Saldo insuficiente, camponês! Você precisa de 🪙 **${item.price} Bostocoins** para comprar ${item.emoji} *${item.name}*, mas só tem 🪙 ${balance}.\nVai capinar um lote (!trabalhar)!`;
        }

        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [item.price, userId]);

        if (item.type === 'instant') {
            player.suprimentos += item.effect;
        } else if (item.type === 'buff') {
            player.active_items[item.id] = item.duration;
        }

        await this.savePlayerData(userId, player);

        msg = `${userTag}🛍️ **COMPRA REALIZADA COM SUCESSO!**\nVocê comprou ${item.emoji} *${item.name}* por 🪙 ${item.price} Bostocoins.\n`;
        
        if (item.type === 'buff') {
            msg += `✨ O efeito já está ativo na sua próxima jogada! Confira em *!pescaria perfil*.`;
        } else {
            msg += `📦 Você agora tem **${player.suprimentos} Suprimentos** (Iscas/Água) no estoque!`;
        }

        return msg;
    }

    // AUXILIAR: GERA A LISTA COMPLETA DE PEIXES PARA O MERCADÃO
    async getSellableList(userId) {
        const player = await this.getPlayerData(userId);
        if (!player.records || !Array.isArray(player.records)) return { sellableArray: [], player };

        const categorized = {};

        player.records.forEach((record) => {
            const fishInfo = FISH_CATALOG.find(f => f.id === record.id);
            if (!fishInfo) return;

            const maxWeight = fishInfo.avgWeight * 1.5;
            const perfeicao = record.weight / maxWeight; 
            const finalValue = Math.ceil((RARITY_MULTIPLIER[fishInfo.rarity] || 10) * perfeicao);

            if (!categorized[fishInfo.rarity]) categorized[fishInfo.rarity] = [];
            
            categorized[fishInfo.rarity].push({
                ...record,
                name: fishInfo.name,
                emoji: fishInfo.emoji,
                value: finalValue,
                score: perfeicao * 100,
                rarity: fishInfo.rarity
            });
        });

        let sellableArray = [];

        RARITY_ORDER.forEach(rarity => {
            if (categorized[rarity]) {
                const sorted = categorized[rarity].sort((a, b) => b.weight - a.weight);
                sellableArray.push(...sorted);
            }
        });

        return { sellableArray, player };
    }

    // MERCADO DE PEIXES
    async handleVender(userId, userTag, itemIndicesStr) {
        const { sellableArray, player } = await this.getSellableList(userId);

        if (sellableArray.length === 0) {
            return `${userTag} Seu mural tá vazio! Você não tem nenhum peixe para vender. Vá pescar primeiro!`;
        }

        if (!itemIndicesStr || itemIndicesStr.trim() === '') {
            let msg = `${userTag}🏪 **MERCADÃO DE PEIXES DE PERUÍBE** 🏪\n_Fórmula: Raridade x Perfeição_\n\n`;
            
            let lastRarity = "";
            sellableArray.forEach((f, i) => {
                if (f.rarity !== lastRarity) {
                    msg += `\n*${RARITY_LABELS[f.rarity]}*\n`;
                    lastRarity = f.rarity;
                }
                msg += `*[ ${i + 1} ]* ${f.emoji} ${f.name} (${f.weight.toFixed(2)}kg) - **${f.score.toFixed(1)}%** ➝ 🪙 **${f.value}**\n`;
            });

            msg += `\n💰 Para vender digite: *!pescaria vender [numero]* ou *!pescaria vender 1 2 3* para vários.`;
            return msg;
        }

        const rawIndices = itemIndicesStr.split(/\s+|,/).filter(s => s.trim() !== '');
        let indices = rawIndices.map(s => parseInt(s) - 1);

        indices = indices.filter(i => !isNaN(i) && i >= 0 && i < sellableArray.length);
        indices = [...new Set(indices)];

        if (indices.length === 0) {
            return `${userTag}⚠️ Nenhum número válido! Digite apenas *!pescaria vender* para ver a lista.`;
        }

        indices.sort((a, b) => b - a);

        let totalValue = 0;
        let soldFishes = [];

        for (const index of indices) {
            const fishToSell = sellableArray[index];
            const originalIndex = player.records.findIndex(r => 
                r.id === fishToSell.id && r.weight === fishToSell.weight && r.date === fishToSell.date
            );

            if (originalIndex > -1) {
                player.records.splice(originalIndex, 1);
                totalValue += fishToSell.value;
                soldFishes.push(fishToSell);
            }
        }

        if (soldFishes.length === 0) {
            return `${userTag}⚠️ Os peixes escaparam da sacola! Nenhum peixe pôde ser vendido.`;
        }

        await this.savePlayerData(userId, player);

        const profitResult = await this.casinoHandler.verifyProfit(userId, totalValue);
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);

        let msg = `${userTag}🤝 **VENDA EM LOTE CONCLUÍDA!**\n\nVocê vendeu:\n`;
        
        soldFishes.reverse().forEach(f => {
            msg += `- ${f.emoji} *${f.name}* (${f.score.toFixed(1)}%) ➝ 🪙 ${f.value}\n`;
        });
        
        msg += `\n💰 **Valor Bruto Total:** 🪙 **${totalValue}**${profitResult.msg}`;

        return msg;
    }

    // ♻️ VENDA AUTOMÁTICA DE LIXO
    async handleVenderLixo(userId, userTag) {
        const player = await this.getPlayerData(userId);
        
        if (!player.records || !Array.isArray(player.records) || player.records.length === 0) {
            return `${userTag} O seu inventário está vazio! Não há lixo para vender.`;
        }

        let totalValue = 0;
        let trashCount = 0;
        const newRecords = [];

        for (const record of player.records) {
            const fishInfo = FISH_CATALOG.find(f => f.id === record.id);
            
            if (fishInfo && fishInfo.rarity === 'lixo') {
                const maxWeight = fishInfo.avgWeight * 1.5;
                const perfeicao = record.weight / maxWeight; 
                const value = Math.ceil((RARITY_MULTIPLIER['lixo'] || 5) * perfeicao); 
                
                totalValue += value;
                trashCount++;
            } else {
                newRecords.push(record);
            }
        }

        if (trashCount === 0) {
            return `${userTag}♻️ Você não tem nenhum lixo no inventário. O oceano agradece!`;
        }

        player.records = newRecords;
        await this.savePlayerData(userId, player);

        const profitResult = await this.casinoHandler.verifyProfit(userId, totalValue);
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);

        return `${userTag}♻️ **COLETA SELETIVA CONCLUÍDA!**\n\nVocê reciclou **${trashCount} itens de lixo** (Botas, pneus, calotas...) e ganhou 🪙 **${totalValue} Bostocoins** pelo serviço ambiental!${profitResult.msg}`;
    }

    // PROCESSA PEIXES REPETIDOS
    async handleRepetidos(userId, userTag, action = 'vender', groupId = null) {
        const player = await this.getPlayerData(userId);
        
        if (!player.records || !Array.isArray(player.records) || player.records.length === 0) {
            return `${userTag} O seu isopor está vazio! Vá pescar antes de tentar ${action === 'vender' ? 'vender vento' : 'doar vento'}.`;
        }

        const recordsToKeep = [];
        const bestFishes = {};
        const duplicatesToProcess = [];

        for (const record of player.records) {
            const isInedible = action === 'depositar' && this.parqueHandler && this.parqueHandler.INEDIBLE_ITEMS.includes(record.id);
            
            if (isInedible) {
                recordsToKeep.push(record);
                continue;
            }

            if (!bestFishes[record.id]) {
                bestFishes[record.id] = record;
            } else {
                if (record.weight > bestFishes[record.id].weight) {
                    duplicatesToProcess.push(bestFishes[record.id]);
                    bestFishes[record.id] = record; 
                } else {
                    duplicatesToProcess.push(record); 
                }
            }
        }

        if (duplicatesToProcess.length === 0) {
            return `${userTag}🐟 Seu isopor está limpo! Você só tem um exemplar (o seu recorde) de cada espécie comestível.`;
        }

        let soldCount = 0;
        let totalValue = 0;
        let totalWeight = 0;

        for (const record of duplicatesToProcess) {
            const fishInfo = FISH_CATALOG.find(f => f.id === record.id);
            if (!fishInfo) continue;

            if (action === 'vender') {
                const maxWeight = fishInfo.avgWeight * 1.5;
                const perfeicao = record.weight / maxWeight;
                const finalValue = Math.ceil((RARITY_MULTIPLIER[fishInfo.rarity] || 10) * perfeicao);
                totalValue += finalValue;
            } else if (action === 'depositar') {
                totalWeight += record.weight;
            }
            soldCount++;
        }

        player.records = [...recordsToKeep, ...Object.values(bestFishes)];
        await this.savePlayerData(userId, player);

        if (action === 'vender') {
            const profitResult = await this.casinoHandler.verifyProfit(userId, totalValue);
            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);

            return `${userTag}📦 **LIMPEZA DE REPETIDOS CONCLUÍDA!**\n\nVocê vendeu **${soldCount} peixes duplicados** (mantendo apenas o seu recorde absoluto de cada espécie) e lucrou 🪙 **${totalValue} Bostocoins** no mercadão!${profitResult.msg}`;
        } 
        else if (action === 'depositar') {
            if (!groupId) return `${userTag} ❌ Erro: ID do grupo não fornecido para o depósito.`;
            
            await this.db.run(`
                INSERT INTO parque_estoque (group_id, carne, vegetal) 
                VALUES (?, ?, 0) 
                ON CONFLICT(group_id) 
                DO UPDATE SET carne = carne + ?`, 
                [groupId, totalWeight, totalWeight]
            );

            return `${userTag} 🚚 **DOAÇÃO EM MASSA CONCLUÍDA!**\n\nVocê transferiu **${soldCount} peixes duplicados** diretamente para a câmara frigorífica do parque.\n\n_(Seus recordes absolutos de tamanho e seus itens de lixo continuam salvos no isopor)_.\n\nTotal doado: 🥩 **${totalWeight.toFixed(2)} kg de Carne**!\nO ecossistema agradece.`;
        }
    }

    // AVALIA O VALOR TOTAL DO INVENTÁRIO
    async avaliarEstoque(userId, userTag) {
        const { sellableArray } = await this.getSellableList(userId);

        if (sellableArray.length === 0) {
            return `${userTag} 🪹 Seu isopor está vazio! Você não tem nenhum peixe para avaliar.`;
        }

        let totalValue = 0;
        
        sellableArray.forEach(fish => {
            totalValue += fish.value;
        });

        let msg = `${userTag}📊 **AVALIAÇÃO DE PATRIMÔNIO (ISOPOR)** 📊\n\n`;
        msg += `🐟 **Total de Peixes (e outras pescas):** ${sellableArray.length}\n`;
        msg += `💰 **Valor Estimado:** 🪙 **${totalValue} Bostocoins**\n\n`;
        if(totalValue < 500) msg += `_Que pobreza! Bora pescar mais ai..._`;
        else if (totalValue < 2000) msg += `_Tá com um dinheirinho, hein? Usa *!pescaria vender* para negociar ou *!pescar* pra aumentar o patrimônio._`;      
        else if (totalValue <5000) msg += `_Tá rico, hein? Use *!pescaria vender* para negociar essas belezinhas ou use *!parque alimentar* para dar pros Dinos!_`;
        else msg += `_É o mestre da pesca! (Absolute cinema). Já pensou em jogar uns peixes na jaula (!parque)?_`;
        
        return msg;
    }

    // TÍTULOS DE PESCA
    async handleTitulosPesca(userId, userTag, action, param) {
        const { sellableArray } = await this.getSellableList(userId);
        const player = await this.getPlayerData(userId);
        
        let totalValue = 0;
        sellableArray.forEach(fish => totalValue += fish.value);

        const TITULOS_PESCA = {
            '1': { name: 'Pescador Novato 🎣', reqType: 'valor', req: 500 },
            '2': { name: 'Pescador Experiente 🚤', reqType: 'valor', req: 2000 },
            '3': { name: 'Guru da Pesca 🧘‍♂️', reqType: 'valor', req: 5000 },
            '4': { name: 'Mestre Pescador 🔱', reqType: 'valor', req: 10000 },
            '5': { name: 'Imperador dos Mares 👑', reqType: 'valor', req: 25000 },
            '6': { name: 'Wolverine dos Mares 🐺', reqType: 'vara', req: 'adamantium' }
        };

        if (!action || action === 'lista' || action === 'loja') {
            let msg = `${userTag}👑 **SINDICATO DOS PESCADORES** 👑\n_Mantenha os requisitos para poder ostentar esses títulos!_\n\n`;
            msg += `💰 **Patrimônio Atual:** 🪙 ${totalValue}\n\n`;

            for (const [id, t] of Object.entries(TITULOS_PESCA)) {
                let unlocked = false;
                let statusText = "";

                if (t.reqType === 'valor') {
                    unlocked = totalValue >= t.req;
                    statusText = unlocked ? "✅ DESBLOQUEADO" : `🔒 Faltam 🪙 ${t.req - totalValue}`;
                } else if (t.reqType === 'vara') {
                    unlocked = player.inventory.vara === t.req;
                    statusText = unlocked ? "✅ DESBLOQUEADO" : `🔒 Requer Vara de Adamantium`;
                }

                msg += `*[ ${id} ]* **${t.name}**\n      ${statusText}\n\n`;
            }

            msg += `📌 Para equipar: *!pescaria titulo equipar [numero]*\n`;
            msg += `🧹 Para remover: *!pescaria titulo remover*`;
            return msg;
        }

        let financas = await this.casinoHandler.processFinancas(userId);

        if (action === 'equipar') {
            const id = param;
            if (!TITULOS_PESCA[id]) return `${userTag}❌ Título não encontrado. Use *!pescaria titulo*.`;
            
            const t = TITULOS_PESCA[id];
            
            let unlocked = false;
            let errorMsg = "";

            if (t.reqType === 'valor') {
                unlocked = totalValue >= t.req;
                errorMsg = `🛑 O Sindicato barrou! Você precisa de 🪙 **${t.req}** no isopor para usar esse título.`;
            } else if (t.reqType === 'vara') {
                unlocked = player.inventory.vara === t.req;
                errorMsg = `🛑 O Sindicato barrou! Você precisa forjar a Vara de Adamantium para usar esse título.`;
            }

            if (!unlocked) {
                return `${userTag}${errorMsg}`;
            }

            financas.titulo = t.name;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

            return `${userTag}🥂 **TÍTULO EQUIPADO COM SUCESSO!**\nAgora o grupo inteiro te reconhecerá como: **${t.name}**\n\n_Aviso: Se você perder os requisitos, o título continua no seu nome, mas se você tirá-lo, não conseguirá equipar de novo!_`;
        }

        if (action === 'remover') {
            financas.titulo = null;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
            return `${userTag}🧹 Título removido. Você escondeu suas credenciais de pescador.`;
        }

        return `${userTag}⚠️ Comando inválido. Use *!pescaria titulo*.`;
    }

    // FUNÇÃO DE MIGRAÇÃO DE DADOS
    async fixOldRecords(userTag) {
        const now = Math.floor(Date.now() / 1000);
        
        const users = await this.db.all("SELECT id_usuario, pescaria_data FROM usuarios WHERE pescaria_data IS NOT NULL AND pescaria_data != '{}'");
        
        let countUsuariosAlterados = 0;

        for (const u of users) {
            try {
                let data = JSON.parse(u.pescaria_data);
                let modified = false;

                if (data.records && !Array.isArray(data.records)) {
                    const newRecords = [];

                    for (const [id, val] of Object.entries(data.records)) {
                        const currentGroupId = (typeof val === 'object' && val.group_id) 
                            ? val.group_id 
                            : "120363422139578370@g.us";

                        newRecords.push({
                            id: id,
                            weight: typeof val === 'object' ? val.weight : val,
                            group_id: currentGroupId,
                            date: (typeof val === 'object' && val.date) ? val.date : now,
                            instanceId: crypto.randomUUID()
                        });
                    }
                    
                    data.records = newRecords;
                    modified = true;
                }

                if (modified) {
                    await this.savePlayerData(u.id_usuario, data);
                    countUsuariosAlterados++;
                }
            } catch (e) {
                console.error(`❌ Erro na migração do usuário ${u.id_usuario}:`, e);
            }
        }

        return `${userTag} 🛠️ **MIGRAÇÃO DE INVENTÁRIO CONCLUÍDA!**\nForam convertidos os registros de **${countUsuariosAlterados} pescadores** para o novo sistema de peixes repetidos.`;
    }

    // ACELERA A GERAÇÃO DE ISCAS EM 2 HORAS
    async acelerarIscasGlobais(userTag) {
        const SECONDS_TO_SUBTRACT = 2 * 3600;
        
        const users = await this.db.all("SELECT id_usuario, pescaria_data FROM usuarios WHERE pescaria_data IS NOT NULL AND pescaria_data != '{}'");
        let count = 0;

        for (const u of users) {
            try {
                let data = JSON.parse(u.pescaria_data);
                
                if (data.suprimentos !== undefined && data.suprimentos < MAX_SUPPLIES) {
                    data.last_supply_regen -= SECONDS_TO_SUBTRACT;
                    await this.savePlayerData(u.id_usuario, data);
                    count++;
                }
            } catch (e) {
                console.error("Erro ao acelerar o tempo:", e);
            }
        }
        
        return `⏳ O Ibama foi bonzinho e adiantou o relógio em 2 horas para **${count} pescadores**!\nSe alguém tava quase ganhando energia, o balde acabou de encher. Vão pescar e regar a roça!`;
    }
}

module.exports = PescariaHandler;