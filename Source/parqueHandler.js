const MINERAL_CATALOG = [
    // Lixo
    { id: 'pedregulho', name: 'Pedregulho Inútil', emoji: '🪨', rarity: 'lixo', value: 2 },
    { id: 'terra', name: 'Punhado de Terra', emoji: '🤎', rarity: 'lixo', value: 1 },
    { id: 'cascalho', name: 'Cascalho', emoji: '🪨', rarity: 'lixo', value: 3 },
    { id: 'areia', name: 'Areia de Gato', emoji: '⏳', rarity: 'lixo', value: 2 },
    { id: 'pasta_termica', name: 'Pasta Térmica Ressecada', emoji: '⚪', rarity: 'lixo', value: 4 },
    { id: 'pino_torto', name: 'Pino Torto de Processador', emoji: '📌', rarity: 'lixo', value: 5 },

    // Comum 
    { id: 'carvao', name: 'Pedaço de Carvão', emoji: '⬛', rarity: 'comum', value: 15 },
    { id: 'calcario', name: 'Calcário', emoji: '🪨', rarity: 'comum', value: 12 },
    { id: 'argila', name: 'Argila Molhada', emoji: '🏺', rarity: 'comum', value: 18 },
    { id: 'granito', name: 'Bloco de Granito', emoji: '🧱', rarity: 'comum', value: 20 },
    { id: 'sal_gema', name: 'Sal Gema', emoji: '🧂', rarity: 'comum', value: 25 },
    { id: 'cobre', name: 'Minério de Cobre', emoji: '🟠', rarity: 'comum', value: 30 },

    // Incomum 
    { id: 'quartzo', name: 'Cristal de Quartzo', emoji: '🤍', rarity: 'incomum', value: 50 },
    { id: 'prata', name: 'Minério de Prata', emoji: '🥈', rarity: 'incomum', value: 65 },
    { id: 'estanho', name: 'Estanho', emoji: '🪙', rarity: 'incomum', value: 45 },
    { id: 'chumbo', name: 'Minério de Chumbo', emoji: '🪨', rarity: 'incomum', value: 70 },
    { id: 'silicio', name: 'Silício Bruto', emoji: '🪞', rarity: 'incomum', value: 85 },
    { id: 'ametista', name: 'Fragmento de Ametista', emoji: '🪻', rarity: 'incomum', value: 100 },

    // Raro
    { id: 'ferro', name: 'Minério de Ferro', emoji: '🩶', rarity: 'raro', value: 250 },
    { id: 'titanio', name: 'Titânio Bruto', emoji: '🛡️', rarity: 'raro', value: 350 },
    { id: 'platina', name: 'Platina', emoji: '💿', rarity: 'raro', value: 450 },
    { id: 'opala', name: 'Pedra de Opala', emoji: '🪩', rarity: 'raro', value: 300 },
    { id: 'topazio', name: 'Topázio Imperial', emoji: '🔶', rarity: 'raro', value: 400 },
    { id: 'grafeno', name: 'Floco de Grafeno', emoji: '🕸️', rarity: 'raro', value: 600 },

    // Muito Raro
    { id: 'ouro', name: 'Pepita de Ouro', emoji: '🟡', rarity: 'muito_raro', value: 1200 },
    { id: 'esmeralda', name: 'Esmeralda', emoji: '🟩', rarity: 'muito_raro', value: 1500 },
    { id: 'rubi', name: 'Rubi', emoji: '🟥', rarity: 'muito_raro', value: 1800 },
    { id: 'safira', name: 'Safira', emoji: '🟦', rarity: 'muito_raro', value: 1600 },
    { id: 'bismuto', name: 'Cristal de Bismuto', emoji: '🌈', rarity: 'muito_raro', value: 2000 },
    { id: 'litio', name: 'Bateria de Lítio Fóssil', emoji: '🔋', rarity: 'muito_raro', value: 2500 },

    // Lendário
    { id: 'diamante', name: 'Diamante Bruto', emoji: '💎', rarity: 'lendario', value: 5000 },
    { id: 'meteorito', name: 'Fragmento de Meteorito', emoji: '☄️', rarity: 'lendario', value: 7000 },
    { id: 'obsidiana', name: 'Obsidiana Chorona', emoji: '🖤', rarity: 'lendario', value: 4500 },
    { id: 'vibranium', name: 'Vibranium Falsificado', emoji: '🛡️', rarity: 'lendario', value: 8500 },
    { id: 'pedra_filosofal', name: 'Pedra Filosofal Falsa', emoji: '🩸', rarity: 'lendario', value: 10000 },

    // Mítico
    { id: 'uranio', name: 'Urânio Enriquecido', emoji: '☢️', rarity: 'mitico', value: 15000 },
    { id: 'kryptonita', name: 'Kryptonita Baiana', emoji: '🟩', rarity: 'mitico', value: 18000 },
    { id: 'adamantium', name: 'Adamantium Bruto', emoji: '🔪', rarity: 'mitico', value: 20000 },
    { id: 'materia_escura', name: 'Matéria Escura', emoji: '🌌', rarity: 'mitico', value: 22000 },
    { id: 'criptomoeda_fisica', name: 'Bitcoin Impresso em 3D', emoji: '₿', rarity: 'mitico', value: 25000 }
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
    'lesothosaurus': { name: 'Lesothosaurus', emoji: '🦎', rarity: 'comum', base_xp_req: 85, ticket_value: 35 },
    'minmi': { name: 'Minmi (Ankylossauro Anão)', emoji: '🐢', rarity: 'comum', base_xp_req: 135, ticket_value: 85 },
    'scutellosaurus': { name: 'Scutellosaurus', emoji: '🦎', rarity: 'comum', base_xp_req: 95, ticket_value: 45 },
    'saltasaurus': { name: 'Saltasaurus', emoji: '🦕', rarity: 'comum', base_xp_req: 145, ticket_value: 95 },
    'maiasaura': { name: 'Maiasaura', emoji: '🦕', rarity: 'comum', base_xp_req: 150, ticket_value: 100 },

    // INCOMUM
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
    'guanlong': { name: 'Guanlong', emoji: '🦖', rarity: 'incomum', base_xp_req: 245, ticket_value: 145 },
    'monolophosaurus': { name: 'Monolophosaurus', emoji: '🦖', rarity: 'incomum', base_xp_req: 265, ticket_value: 165 },
    'tsintaosaurus': { name: 'Tsintaosaurus', emoji: '🦄', rarity: 'incomum', base_xp_req: 285, ticket_value: 190 },
    'gargoyleosaurus': { name: 'Gargoyleosaurus', emoji: '🗿', rarity: 'incomum', base_xp_req: 325, ticket_value: 295 },
    'ouranosaurus': { name: 'Ouranosaurus', emoji: '🐪', rarity: 'incomum', base_xp_req: 340, ticket_value: 310 },

    // RARO 
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
    'utahraptor': { name: 'Utahraptor (Velociraptor Bombado)', emoji: '🦖', rarity: 'raro', base_xp_req: 760, ticket_value: 650 },
    'majungasaurus': { name: 'Majungasaurus', emoji: '🦖', rarity: 'raro', base_xp_req: 690, ticket_value: 520 },
    'concavenator': { name: 'Concavenator (Corcunda)', emoji: '🐪', rarity: 'raro', base_xp_req: 710, ticket_value: 580 },
    'pachyrhinosaurus': { name: 'Pachyrhinosaurus', emoji: '🦏', rarity: 'raro', base_xp_req: 640, ticket_value: 480 },
    'amargasaurus': { name: 'Amargasaurus (Espinhudo)', emoji: '🦕', rarity: 'raro', base_xp_req: 790, ticket_value: 640 },

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
    'dreadnoughtus': { name: 'Dreadnoughtus', emoji: '🦕', rarity: 'lendario', base_xp_req: 3200, ticket_value: 1200 },
    'tarbosaurus': { name: 'Tarbosaurus', emoji: '🦖', rarity: 'lendario', base_xp_req: 2150, ticket_value: 950 },
    'deinosuchus': { name: 'Deinosuchus (Jacaré Colossal)', emoji: '🐊', rarity: 'lendario', base_xp_req: 2700, ticket_value: 1100 },
    'acrocanthosaurus': { name: 'Acrocanthosaurus', emoji: '🦖', rarity: 'lendario', base_xp_req: 2450, ticket_value: 980 },
    'yutyrannus': { name: 'Yutyrannus (T-Rex de Casaco)', emoji: '🧥', rarity: 'lendario', base_xp_req: 2250, ticket_value: 920 },

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

// --- CONFIGURAÇÕES DO ABISMO (Escavação v2) ---
const ESC_CHANCE_AMBAR_BASE = 0.01;
const ESC_CHANCE_DESMORONAR_BASE = 0.04; 
const ESC_DESMORONAR_INCREMENTO = 0.06; 
const ESC_CHANCE_PERDER_PICARETA = 0.35; 
const ESC_COOLDOWN_DANO = 3600; 

const PICKAXE_CATALOG = {
    'madeira': { id: 'madeira', name: 'Picareta de Madeira', emoji: '🪵', durabilidade: 6, sorte: 0, drops: 1, max_camada: 2, req_coins: 0, req_item: null, req_qtd: 0, next: 'pedra', prev: null },
    'pedra': { id: 'pedra', name: 'Picareta de Pedra', emoji: '🪨', durabilidade: 24, sorte: 5, drops: 1, max_camada: 2, req_coins: 500, req_item: 'pedregulho', req_qtd: 10, next: 'cobre', prev: 'madeira' },
    'cobre': { id: 'cobre', name: 'Picareta de Cobre', emoji: '🟠', durabilidade: 36, sorte: 10, drops: 1, max_camada: 3, req_coins: 1200, req_item: 'cobre', req_qtd: 8, next: 'ferro', prev: 'pedra' },
    'ferro': { id: 'ferro', name: 'Picareta de Ferro', emoji: '🩶', durabilidade: 48, sorte: 20, drops: 2, max_camada: 4, req_coins: 5000, req_item: 'ferro', req_qtd: 6, next: 'titanio', prev: 'cobre' },
    'titanio': { id: 'titanio', name: 'Picareta de Titânio', emoji: '🛡️', durabilidade: 96, sorte: 35, drops: 2, max_camada: 5, req_coins: 15000, req_item: 'titanio', req_qtd: 4, next: 'diamante', prev: 'ferro' },
    'diamante': { id: 'diamante', name: 'Picareta de Diamante', emoji: '💎', durabilidade: 192, sorte: 50, drops: 3, max_camada: 5, req_coins: 50000, req_item: 'diamante', req_qtd: 3, next: 'adamantium', prev: 'titanio' },
    'adamantium': { id: 'adamantium', name: 'Picareta de Adamantium', emoji: '🌌', durabilidade: 384, sorte: 75, drops: 3, max_camada: 5, req_coins: 150000, req_item: 'adamantium', req_qtd: 2, next: null, prev: 'diamante' }
};

const ARMOR_CATALOG = {
    'nenhuma': { id: 'nenhuma', name: 'Camisa do Corinthians', emoji: '👕', prot_loot: 0, prot_dano: 0, price: 0, next: 'couro' },
    'couro': { id: 'couro', name: 'Armadura de Couro', emoji: '🧥', prot_loot: 15, prot_dano: 15, price: 5000, next: 'malha' },
    'malha': { id: 'malha', name: 'Cota de Malha', emoji: '⛓️', prot_loot: 30, prot_dano: 30, price: 15000, next: 'bronze' },
    'bronze': { id: 'bronze', name: 'Armadura de Bronze', emoji: '🥉', prot_loot: 45, prot_dano: 45, price: 35000, next: 'ferro' },
    'ferro': { id: 'ferro', name: 'Armadura de Ferro', emoji: '🩶', prot_loot: 60, prot_dano: 60, price: 75000, next: 'titanio' },
    'titanio': { id: 'titanio', name: 'Traje de Titânio', emoji: '🛡️', prot_loot: 75, prot_dano: 75, price: 150000, next: 'diamante' },
    'diamante': { id: 'diamante', name: 'Armadura de Diamante', emoji: '💎', prot_loot: 90, prot_dano: 90, price: 350000, next: 'grafeno' },
    'grafeno': { id: 'grafeno', name: 'Traje de Grafeno', emoji: '🌌', prot_loot: 100, prot_dano: 95, price: 800000, next: null }
};

const ACCESSORY_CATALOG = {
    'nenhum': { id: 'nenhum', name: 'Nenhum', emoji: '🤷', price: 0 },
    'localizador': { id: 'localizador', name: 'Localizador GPS', emoji: '📡', price: 50000, desc: 'Se soterrado, reduz tempo de UTI e custo de cura em 50%.' },
    'sensor': { id: 'sensor', name: 'Sensor Sísmico', emoji: '📟', price: 80000, desc: 'Prevê os minérios do próximo turno (Lado e Fundo).' },
    'mochila': { id: 'mochila', name: 'Mochila de Carga', emoji: '🎒', price: 65000, desc: 'Protege 50% do seu loot se ocorrer um desmoronamento.' } 
};

const CONSUMABLE_CATALOG = {
    'biotonico': { id: 'biotonico', name: 'Biotônico Fontoura', emoji: '🍷', price: 5000, desc: 'Aumenta a coleta em 1.5x (arredondado p/ cima) na próxima batida.' },
    'feitico': { id: 'feitico', name: 'Feitiço de Durabilidade', emoji: '✨', price: 8000, desc: 'Restaura a vida da picareta e a sobrecarrega.' },
    'suporte': { id: 'suporte', name: 'Suporte de Teto', emoji: '🏗️', price: 12000, desc: 'Reduz risco pela metade no turno e salva loot se desabar.' },
    'dinamite': { id: 'dinamite', name: 'Banana de Dinamite', emoji: '🧨', price: 10000, desc: 'Pula até 2 camadas para baixo sem gastar turno ou risco. Destrói o loot natural do caminho.' } 
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

        this.MARCOS_SEASON = {
            pesca_kg: { nome: "🎣 Pesca Oceânica", metas: [500, 2500, 10000, 50000], unidade: "kg" },
            fazenda_kg: { nome: "🚜 Colheita Global", metas: [200, 1000, 5000, 20000], unidade: "kg" },
            dino_lvl: { nome: "🦖 Nível dos Dinos", metas: [50, 150, 300, 600], unidade: " Lvl" },
            upgrades: { nome: "🛠️ Tecnologia Ativa", metas: [10, 30, 60, 100], unidade: " un" },
            vendas: { nome: "💰 Economia (Vendas)", metas: [10000, 50000, 250000, 1000000], unidade: " 🪙" },
            cassino: { nome: "🎰 Vício em Apostas", metas: [10000, 50000, 250000, 1000000], unidade: " 🪙" }
        };

        this.escavacoesAtivas = new Map();
    }
    
    async getPlayerData(userId) {
        const user = await this.db.get("SELECT parque_data FROM usuarios WHERE id_usuario = ?", [userId]);
        let data = {};
        
        if (user && user.parque_data) {
            try { data = JSON.parse(user.parque_data); } catch (e) { data = {}; }
        }

        let player = {
            inventory: data.inventory || {},
            inventario_consumiveis: data.inventario_consumiveis || {},
            ferramentas: data.ferramentas || { 
                picareta: 'madeira', 
                picareta_hp: 6, 
                debito_automatico: 1,
                armadura: 'nenhuma',
                acessorio: 'nenhum'
            }
        };

        if (player.ferramentas.debito_automatico === undefined) player.ferramentas.debito_automatico = 1;
        if (!player.ferramentas.armadura) player.ferramentas.armadura = 'nenhuma';
        if (!player.ferramentas.acessorio) player.ferramentas.acessorio = 'nenhum';
        if (!player.inventario_consumiveis) player.inventario_consumiveis = {};

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

    async listarMateriaisPorCamada(userTag) {
        let msg = `${userTag} 📜 **GUIA GEOLÓGICO DO ABISMO** 📜\n\n`;

        const camadas = [
            { n: 0, nome: "Superfície", risco: "4%", ambar: "1%", raridades: ['lixo', 'comum'] },
            { n: 1, nome: "Crosta", risco: "10%", ambar: "2%", raridades: ['incomum', 'raro'] },
            { n: 2, nome: "Profundezas", risco: "16%", ambar: "4%", raridades: ['muito_raro'] },
            { n: 3, nome: "Manto", risco: "22%", ambar: "8%", raridades: ['lendario'] },
            { n: 4, nome: "Núcleo Externo", risco: "28%", ambar: "16%", raridades: ['mitico'] },
            { n: 5, nome: "Abismo Final", risco: "34%", ambar: "32%", raridades: [] }
        ];

        camadas.forEach(c => {
            msg += `⛏️ **Camada ${c.n}: ${c.nome}**\n`;
            msg += `⚠️ Risco: ${c.risco} | 🦟 Âmbar: ${c.ambar}\n`;
            
            const itens = MINERAL_CATALOG.filter(m => c.raridades.includes(m.rarity));
            if (itens.length > 0) {
                msg += `💎 Itens: ${itens.map(i => i.emoji).join(' ')}\n`;
            } else if (c.n === 5) {
                msg += `💎 Itens: Todos os anteriores + Multiplicador de Sorte!\n`;
            }
            msg += `\n`;
        });

        msg += `💡 _Dica: Itens de camadas superficiais continuam aparecendo nas profundezas._`;
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
        // Auditoria fiscal antes de fechar o caixa!
        await this.sincronizarMissoesLazy(groupId);

        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE group_id = ? AND is_morto = 0", [groupId]);
        if (!dinos || dinos.length === 0) return "";

        let multReceita = 1 / 24; 
        try {
            const legado = await this.db.get("SELECT nivel_receita FROM legado_grupos WHERE group_id = ?", [groupId]);
            if (legado && legado.nivel_receita) {
                multReceita = legado.nivel_receita / 24;
            }
        } catch(e) {}

        let valorBrutoTotal = 0;
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
            valorBrutoTotal += valorDino; 
        }

        if (valorBrutoTotal <= 0 && digestaoMsg === "") return "";

        const metadeInGen = Math.floor(valorBrutoTotal / 4);
        const baseDoGrupo = valorBrutoTotal - metadeInGen;
        
        const lucroFinalGrupo = Math.floor(baseDoGrupo * multReceita);

        const ativos = await this.db.all("SELECT DISTINCT id_usuario FROM ranking_ofensas WHERE id_conversa = ?", [groupId]);
        
        const donosSet = new Set();
        dinos.forEach(d => {
            if (d.descobridor_id) {
                d.descobridor_id.split(',').forEach(id => donosSet.add(id.trim()));
            }
        });

        const acionistasIds = Array.from(donosSet); 
        
        let pagamentoMsg = "";
        if (acionistasIds.length > 0 && lucroFinalGrupo > 0) {
            const cota = Math.floor(lucroFinalGrupo / acionistasIds.length);
            for (const acionistaId of acionistasIds) {
                await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [cota, acionistaId]);
            }
            
            pagamentoMsg = `💰 A bilheteria arrecadou 🪙 **${valorBrutoTotal} Bostocoins** brutos!\n`;
            pagamentoMsg += `🏢 A InGen confiscou 50% (🪙 **${metadeInGen}**).\n`;
            pagamentoMsg += `📉 Dos 50% restantes (🪙 **${baseDoGrupo}**), vocês recuperaram apenas **${Math.round(multReceita * 100)}%** devido à punição da Temporada.\n`;
            pagamentoMsg += `💸 **Lucro Líquido:** 🪙 **${lucroFinalGrupo}** (Cota de 🪙 **${cota}** para os ${acionistasIds.length} investidores).\n`;

        } else if (lucroFinalGrupo <= 0 && valorBrutoTotal > 0) {
            pagamentoMsg = `💰 A bilheteria arrecadou 🪙 **${valorBrutoTotal}**, mas a InGen levou 50% e limitou o resto. Vocês não lucraram NADA!\n`;
        }

        let finalMsg = `\n🎟️ **RELATÓRIO MATINAL DO BOSTOPARK** 🎟️\n`;
        if (digestaoMsg) finalMsg += digestaoMsg + "\n";
        if (pagamentoMsg) finalMsg += pagamentoMsg;

        return finalMsg;
    }

    async verMissoesGlobais(groupId, userTag, paramStr) {
        await this.sincronizarMissoesLazy(groupId);
        let legado = null;
        try {
            legado = await this.db.get("SELECT * FROM legado_grupos WHERE group_id = ?", [groupId]);
        } catch (e) {
            return `${userTag} ❌ O banco ainda não foi atualizado.`;
        }

        if (!legado) return `${userTag} 🚧 As missões só estarão ativas após o primeiro Wipe Oficial.`;

        const conquistas = JSON.parse(legado.conquistas_json || '{}');
        const nivel = legado.nivel_receita || 1;
        const mult = (nivel / 24).toFixed(2);
        
        const dinoData = await this.db.get("SELECT SUM(nivel) as total_lvl FROM parque_dinossauros WHERE group_id = ?", [groupId]);
        conquistas['dino_lvl'] = dinoData ? (dinoData.total_lvl || 0) : 0;        

        const drawBar = (current, max) => {
            if (current >= max) return '🟩'.repeat(10);
            const filled = Math.floor((current / max) * 10);
            return '🟩'.repeat(filled) + '⬜'.repeat(10 - filled);
        };

        const descricoes = {
            pesca_kg: "Pesque os troféus no lago com !pescar para acumular peso global e provar que esse grupo não vive só de Ifood.",
            fazenda_kg: "Colha as safras com !fazenda colher para abastecer o mercado e não deixar os herbívoros morrerem de inanição.",
            dino_lvl: "Alimente os dinossauros com !parque alimentar e suba o nível deles. Afinal, dinossauro anão não atrai turista.",
            upgrades: "Compre equipamentos na loja (!pescaria comprar ou !fazenda comprar) e movimente a indústria de base do Bostoverso.",
            vendas: "Venda peixes e vegetais no mercadão. A InGen adora capitalismo e exige que o dinheiro gire.",
            cassino: "Torre (ou ganhe) Bostocoins nas máquinas caça-níqueis e roletas do Cassino. A casa sempre vence, mas o grupo lucra a longo prazo."
        };

        const chavesMissao = Object.keys(this.MARCOS_SEASON);

        if (paramStr && !isNaN(parseInt(paramStr))) {
            const indexMissao = parseInt(paramStr) - 1;
            
            if (indexMissao < 0 || indexMissao >= chavesMissao.length) {
                return `${userTag} ⚠️ Missão não encontrada. Digite *!parque missoes* para ver o catálogo de 1 a ${chavesMissao.length}.`;
            }

            const key = chavesMissao[indexMissao];
            const data = this.MARCOS_SEASON[key];
            const atual = conquistas[key] || 0;
            
            let metaAtualIdx = data.metas.findIndex(m => atual < m);
            if (metaAtualIdx === -1) metaAtualIdx = 3; 
            
            const metaObj = data.metas[metaAtualIdx];
            const isMax = atual >= data.metas[3];
            const explicacao = descricoes[key];

            let msgDetalhe = `${userTag}🎯 **DETALHES DA MISSÃO [ ${indexMissao + 1} ]** 🎯\n\n`;
            msgDetalhe += `**${data.nome}** (Nvl ${isMax ? 4 : metaAtualIdx})\n`;
            msgDetalhe += `_💡 ${explicacao}_\n\n`;
            
            msgDetalhe += `[${drawBar(atual, metaObj)}] ${isMax ? 'MAX' : `${Math.floor((atual/metaObj)*100)}%`}\n`;
            msgDetalhe += `Progresso: ${atual.toLocaleString('pt-BR')}${data.unidade} / ${metaObj.toLocaleString('pt-BR')}${data.unidade}\n\n`;
            
            if (!isMax) {
                msgDetalhe += `📈 **Próximas Metas a Desbloquear:**\n`;
                for (let i = metaAtualIdx; i < data.metas.length; i++) {
                    msgDetalhe += `- Nível ${i + 1}: ${data.metas[i].toLocaleString('pt-BR')}${data.unidade}\n`;
                }
            } else {
                msgDetalhe += `🏆 **CATEGORIA ZERADA!** Vocês atingiram o ápice nessa área. A InGen está orgulhosa.`;
            }

            return msgDetalhe;
        }

        let msg = `${userTag}🎯 **MARCOS DA COMUNIDADE (Season ${legado.temporada_atual || 1})** 🎯\n\n`;
        msg += `📈 **Receita do Parque:** ${nivel}/24\n`;
        msg += `🎟️ **Lucro da InGen:** ${mult}x (Recebendo ${Math.round(mult * 100)}%)\n\n`;

        let index = 1;
        for (const key of chavesMissao) {
            const data = this.MARCOS_SEASON[key];
            const atual = conquistas[key] || 0;
            let metaAtualIdx = data.metas.findIndex(m => atual < m);
            if (metaAtualIdx === -1) metaAtualIdx = 3;
            
            const metaObj = data.metas[metaAtualIdx];
            const isMax = atual >= data.metas[3];
            
            msg += `*[ ${index} ]* **${data.nome}** (Nvl ${isMax ? 4 : metaAtualIdx})\n`;
            msg += `[${drawBar(atual, metaObj)}] ${isMax ? 'MAX' : `${Math.floor((atual/metaObj)*100)}%`}\n`;
            msg += `Progresso: ${atual.toLocaleString('pt-BR')}${data.unidade} / ${metaObj.toLocaleString('pt-BR')}${data.unidade}\n\n`;
            
            index++;
        }

        msg += `🔍 _Use *!parque missoes [numero]* para ver detalhes e dicas de como subir uma missão específica._`;
        return msg;
    }

    async sincronizarMissoesLazy(groupId) {
        try {
            const legado = await this.db.get("SELECT * FROM legado_grupos WHERE group_id = ?", [groupId]);
            if (!legado) return;

            let conquistas = JSON.parse(legado.conquistas_json || '{}');
            let totalUpgrades = 0;

            const activeUsers = await this.db.all("SELECT DISTINCT id_usuario FROM ranking_ofensas WHERE id_conversa = ?", [groupId]);

            if (activeUsers && activeUsers.length > 0) {
                const userIds = activeUsers.map(u => u.id_usuario);
                const placeholders = userIds.map(() => '?').join(',');

                const pescariaUsers = await this.db.all(`SELECT pescaria_data FROM usuarios WHERE id_usuario IN (${placeholders}) AND pescaria_data IS NOT NULL AND pescaria_data != '{}'`, userIds);
                const rodOrder = ['bambu', 'fibra', 'grafite', 'carbono', 'aco', 'grafeno', 'adamantium'];
                const boatOrder = ['pequeno', 'medio', 'grande', 'industrial'];

                for (const u of pescariaUsers) {
                    try {
                        const pData = JSON.parse(u.pescaria_data);
                        if (pData.inventory) {
                            const rodIndex = rodOrder.indexOf(pData.inventory.vara || 'bambu');
                            if (rodIndex > 0) totalUpgrades += rodIndex;
                            if (pData.inventory.barco) {
                                const boatIndex = boatOrder.indexOf(pData.inventory.barco);
                                if (boatIndex >= 0) totalUpgrades += (boatIndex + 1);
                            }
                        }
                    } catch(e) {}
                }

                const fazendaUsers = await this.db.all(`SELECT upgrades, canteiros FROM fazenda_inventario WHERE id_usuario IN (${placeholders})`, userIds);
                for (const f of fazendaUsers) {
                    try {
                        const fUpgrades = JSON.parse(f.upgrades || '{}');
                        const fCanteiros = JSON.parse(f.canteiros || '[]');
                        if (fUpgrades.enxada && fUpgrades.enxada > 1) totalUpgrades += (fUpgrades.enxada - 1);
                        if (fUpgrades.trator && fUpgrades.trator > 1) totalUpgrades += (fUpgrades.trator - 1);
                        if (fCanteiros.length > 1) totalUpgrades += (fCanteiros.length - 1);
                    } catch(e) {}
                }
            }

            const dinoData = await this.db.get("SELECT SUM(nivel) as total_lvl FROM parque_dinossauros WHERE group_id = ?", [groupId]);
            const totalDinoLvl = dinoData ? (dinoData.total_lvl || 0) : 0;

            let houveMudanca = false;
            let diferencaDeNivelTotal = 0;

            const checarLevelUp = (categoria, valorAntigo, valorNovo) => {
                if (valorNovo <= valorAntigo) return 0;
                conquistas[categoria] = valorNovo;
                houveMudanca = true;

                const metas = this.MARCOS_SEASON[categoria].metas;
                let niveisAntigos = metas.filter(m => valorAntigo >= m).length;
                let niveisNovos = metas.filter(m => valorNovo >= m).length;
                
                return niveisNovos - niveisAntigos;
            };

            diferencaDeNivelTotal += checarLevelUp('upgrades', conquistas['upgrades'] || 0, totalUpgrades);
            diferencaDeNivelTotal += checarLevelUp('dino_lvl', conquistas['dino_lvl'] || 0, totalDinoLvl);

            if (houveMudanca) {
                const novoNivelReceita = Math.min(24, (legado.nivel_receita || 1) + diferencaDeNivelTotal);
                await this.db.run(
                    "UPDATE legado_grupos SET conquistas_json = ?, nivel_receita = ? WHERE group_id = ?", 
                    [JSON.stringify(conquistas), novoNivelReceita, groupId]
                );
                console.log(`[MISSÕES] Sincronização Concluída! Nível da Receita do grupo ${groupId} subiu para ${novoNivelReceita}`);
            }

        } catch (e) {
            console.error("Erro na sincronização lazy das missões:", e);
        }
    }

    async registrarProgressoComunitario(groupId, categoria, valorAdicional, ctx) {
        if (!groupId || !categoria || !valorAdicional) return;

        if (categoria === 'dino_lvl') return; 

        try {
            let targetGroup = groupId;
            try {
                const link = await this.db.get("SELECT id_pai FROM grupos_linkados WHERE id_filho = ?", [groupId]);
                if (link) targetGroup = link.id_pai;
            } catch (e) {
            }

            const legado = await this.db.get("SELECT * FROM legado_grupos WHERE group_id = ?", [targetGroup]);
            if (!legado) return;

            let conquistas = JSON.parse(legado.conquistas_json || '{}');
            const valorAntigo = conquistas[categoria] || 0;
            const valorNovo = valorAntigo + valorAdicional;
            conquistas[categoria] = valorNovo;

            const metasDaCategoria = this.MARCOS_SEASON[categoria].metas;
            let niveisAntigosAtingidos = metasDaCategoria.filter(m => valorAntigo >= m).length;
            let niveisNovosAtingidos = metasDaCategoria.filter(m => valorNovo >= m).length;

            const diferencaDeNivel = niveisNovosAtingidos - niveisAntigosAtingidos;

            if (diferencaDeNivel > 0) {
                const novoNivelReceita = Math.min(24, (legado.nivel_receita || 1) + diferencaDeNivel);
                
                await this.db.run(
                    "UPDATE legado_grupos SET conquistas_json = ?, nivel_receita = ? WHERE group_id = ?", 
                    [JSON.stringify(conquistas), novoNivelReceita, targetGroup]
                );

                if (ctx && ctx.sendTo) {
                    const nomeCat = this.MARCOS_SEASON[categoria].nome;
                    const msgUP = `🎉 **MARCO COMUNITÁRIO ATINGIDO!** 🎉\n\nO esforço do grupo deu resultado! Vocês acabaram de subir de nível na categoria:\n🌟 **${nomeCat}** (Nível ${niveisNovosAtingidos}/4)\n\n📈 A receita global do parque subiu para **${novoNivelReceita}/24**!\nA InGen liberou mais verba para a próxima bilheteria. Usem \`!parque missoes\` para ver o painel atualizado.`;
                    
                    await ctx.sendTo(targetGroup, msgUP);
                }
            } else {
                await this.db.run("UPDATE legado_grupos SET conquistas_json = ? WHERE group_id = ?", [JSON.stringify(conquistas), targetGroup]);
            }

        } catch (e) {
            console.error("Erro ao registrar progresso comunitário:", e);
        }
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
    
    async eventoMeteoroLocal(groupId, userTag) {
        await this.db.run("UPDATE parque_dinossauros SET is_morto = 1 WHERE group_id = ?", [groupId]);
        
        await this.db.run("UPDATE parque_estoque SET carne = 0, vegetal = 0 WHERE group_id = ?", [groupId]);

        return `${userTag} ☄️ **EXTINÇÃO EM MASSA!** ☄️\n\nUm meteoro flamejante rasgou o céu e atingiu em cheio o Jurassic BostoPark!\n\n🦴 Todos os dinossauros viraram fósseis (Eles foram para o Céu dos Dinos).\n🔥 A câmara frigorífica virou cinzas.\n\n_"A vida... não encontrou um meio."_`;
    }


    async handleEscavar(userId, userTag, userName, groupId, action = '') {
        action = action.toLowerCase().trim();
        let financas = await this.casinoHandler.processFinancas(userId);
        const now = Math.floor(Date.now() / 1000);
        let player = await this.getPlayerData(userId);
        const picaretaAtual = PICKAXE_CATALOG[player.ferramentas.picareta] || PICKAXE_CATALOG['madeira'];

        const dbUser = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const saldo = dbUser ? dbUser.bostocoins : 0;

        const montanteInvestido = financas.investimento?.montante || 0;
        const netWorth = saldo + montanteInvestido;
        const custoCura = Math.floor(500 + (netWorth * 0.0075));

        if (action === 'curar' || action === 'medico' || action === 'hospital') {
            if (!financas.last_dano_escavacao || now - financas.last_dano_escavacao >= ESC_COOLDOWN_DANO) {
                return `${userTag} 🩺 Você não está machucado! Quer gastar dinheiro com plano de saúde à toa?`;
            }

            const dbUser = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
            const saldo = dbUser ? dbUser.bostocoins : 0;

            if (saldo < custoCura) {
                return `${userTag} 💸 O hospital da InGen não atende indigentes! A cirurgia particular para te tirar da maca custa 🪙 **${custoCura}**, você só tem 🪙 ${saldo}.`;
            }

            
            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [custoCura, userId]);
            financas.last_dano_escavacao = 0;
            await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);

            return `${userTag} 💉 **SISTEMA DE SAÚDE PRIVADO INGEN!**\nVocê pagou 🪙 **${custoCura} Bostocoins**, tomou uma dose experimental de adrenalina e está 100% regenerado! Pode voltar a escavar imediatamente. ⛏️`;
        }

        if (action === 'auto' || action === 'debito') {
            player.ferramentas.debito_automatico = player.ferramentas.debito_automatico === 0 ? 1 : 0;
            await this.savePlayerData(userId, player);
            const status = player.ferramentas.debito_automatico ? "🟢 ATIVADO" : "🔴 DESATIVADO";
            return `${userTag} 🛠️ **DÉBITO AUTOMÁTICO:** ${status}\n${player.ferramentas.debito_automatico ? 'Sua picareta será afiada automaticamente se você tiver saldo ao quebrar.' : 'Você precisará afiar manualmente usando *!escavar consertar* quando ela cegar.'}`;
        }

        if (action.startsWith('comprar ')) {
            const itemCode = action.replace('comprar ', '').trim();
            let alvo = null; let tipo = '';
            
            if (CONSUMABLE_CATALOG[itemCode]) { alvo = CONSUMABLE_CATALOG[itemCode]; tipo = 'consumivel'; }
            else if (ACCESSORY_CATALOG[itemCode]) { alvo = ACCESSORY_CATALOG[itemCode]; tipo = 'acessorio'; }
            else if (itemCode === 'armadura') { 
                const atual = ARMOR_CATALOG[player.ferramentas.armadura];
                if (!atual.next) return `${userTag} ✨ Você já usa Grafeno. Não tem armadura melhor!`;
                alvo = ARMOR_CATALOG[atual.next]; tipo = 'armadura';
            }
            
            if (!alvo) return `${userTag} ❌ Item inválido. Veja a *!escavar loja*.`;
            if (saldo < alvo.price) return `${userTag} 💸 Faltam moedas! Custa 🪙 ${alvo.price}.`;

            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [alvo.price, userId]);

            if (tipo === 'consumivel') {
                player.inventario_consumiveis[alvo.id] = (player.inventario_consumiveis[alvo.id] || 0) + 1;
                await this.savePlayerData(userId, player);
                return `${userTag} 🛍️ Você comprou 1x ${alvo.emoji} **${alvo.name}**! Use com *!escavar usar ${alvo.id}* dentro da caverna.`;
            } else if (tipo === 'acessorio') {
                player.ferramentas.acessorio = alvo.id;
                await this.savePlayerData(userId, player);
                return `${userTag} 🦺 Você equipou o ${alvo.emoji} **${alvo.name}**! O efeito é passivo.`;
            } else if (tipo === 'armadura') {
                player.ferramentas.armadura = alvo.id;
                await this.savePlayerData(userId, player);
                return `${userTag} 🛡️ Upgrade Feito! Você vestiu a ${alvo.emoji} **${alvo.name}**! (Proteção Dano: ${alvo.prot_dano}% | Loot: ${alvo.prot_loot}%)`;
            }
        }

        let sessao = this.escavacoesAtivas.get(userId);
        
        if (action.startsWith('usar ')) {
            if (!sessao) return `${userTag} ❓ Você só pode usar esses itens dentro da caverna durante uma exploração!`;
            const itemCode = action.replace('usar ', '').trim();
            const alvo = CONSUMABLE_CATALOG[itemCode];
            
            if (!alvo || !player.inventario_consumiveis[itemCode] || player.inventario_consumiveis[itemCode] <= 0) {
                return `${userTag} ❌ Você não tem esse item. Compre na *!escavar loja*.`;
            }

            player.inventario_consumiveis[itemCode] -= 1;
            sessao.buffs = sessao.buffs || {};

            if (itemCode === 'suporte') {
                sessao.buffs.suporte = true;
                await this.savePlayerData(userId, player);
                return `${userTag} 🏗️ **SUPORTE MONTADO!** O risco de desabamento caiu pela metade para o seu próximo passo, e se cair, o loot está protegido!`;
            }
            if (itemCode === 'biotonico') {
                sessao.buffs.biotonico = true;
                await this.savePlayerData(userId, player);
                return `${userTag} 🍷 **GOLE DE BIOTÔNICO!** Seus braços estão fortes igual os de um T-Rex bombado. **TODAS** as suas batidas até o fim desta descida virão com **1.5x mais drops**! 💪⛏️`;
            }
            if (itemCode === 'feitico') {
                player.ferramentas.picareta_hp += picaretaAtual.durabilidade;
                await this.savePlayerData(userId, player);
                return `${userTag} ✨ **MAGIA ATIVADA!** Sua picareta foi imbuída com durabilidade extra (HP: ${player.ferramentas.picareta_hp})!`;
            }
            if (itemCode === 'dinamite') {
                if (sessao.camada >= picaretaAtual.max_camada) {
                    player.inventario_consumiveis[itemCode] += 1; 
                    return `${userTag} 🛑 Você já está no limite da sua picareta! Jogar dinamite aqui só vai te soterrar à toa.`;
                }

                let target = sessao.camada + 2;
                let avisoExtra = "";

                if (target > picaretaAtual.max_camada) {
                    target = picaretaAtual.max_camada;
                    avisoExtra = `\n⚠️ **Aviso:** A explosão foi forte, mas sua ${picaretaAtual.name} não aguenta descer mais que a Camada ${target}, então você parou por aqui!`;
                }

                sessao.camada = target;
                
                sessao.peek_fundo = null;
                sessao.peek_lado = null;

                await this.savePlayerData(userId, player);
                return `${userTag} 🧨💥 **KABOOM!**\nVocê jogou a dinamite no buraco e pulou no túnel recém-aberto! Você desceu em segurança (0 de durabilidade gasta e 0% risco) e agora está na **Camada ${sessao.camada}**!${avisoExtra}\n👉 Use *!escavar fundo* ou *!escavar lado* para continuar.`;
            }
        }

        if (financas.last_dano_escavacao && now - financas.last_dano_escavacao < ESC_COOLDOWN_DANO) {
            const left = ESC_COOLDOWN_DANO - (now - financas.last_dano_escavacao);
            return `${userTag} 🚑 Você ainda está no hospital se recuperando do soterramento! O médico te dá alta em: ${Math.floor(left/60)} minutos.\n\n_💡 Dica: Por ser um cidadão de posses, você pode pagar o leito particular por 🪙 **${custoCura.toLocaleString('pt-BR')}** usando *!escavar curar* para sair da UTI agora!_`;
        }

        if (action === 'materiais' || action === 'camadas' || action === 'guia' || action === 'help' || action === 'ajuda') {
            return await this.listarMateriaisPorCamada(userTag);
        }

        if (action === 'consertar' || action === 'sucatear' || action === 'upar' || action === 'loja') {
            return await this.gerenciarPicareta(userId, userTag, player, action, picaretaAtual);
        }

        if (player.ferramentas.picareta_hp <= 0) {
            return `${userTag} 🛠️ Sua ${picaretaAtual.emoji} ${picaretaAtual.name} está cega/quebrada! (0 HP).\nVocê precisa *!escavar consertar* (pagar 25% do valor) ou *!escavar sucatear* (reverter pra picareta anterior de graça).`;
        }

        const finalizarSessao = async (motivo) => {
            let msgLoot = "";
            let temAmbar = false;
            
            for (const [id, qtd] of Object.entries(sessao.loot)) {
                 if (id === 'ambar') {
                     temAmbar = true;
                     for(let i = 0; i < qtd; i++) {
                         msgLoot += await this.acharAmbar(userId, userName, groupId) + "\n\n";
                     }
                 } else {
                     player.inventory[id] = (player.inventory[id] || 0) + qtd;
                     const min = MINERAL_CATALOG.find(m => m.id === id);
                     msgLoot += `- ${qtd}x ${min.emoji} ${min.name}\n`;
                 }
            }
            
            const custoDurabilidade = sessao.turnos; 
            player.ferramentas.picareta_hp -= custoDurabilidade;
            if (player.ferramentas.picareta_hp < 0) player.ferramentas.picareta_hp = 0;
            
            await this.savePlayerData(userId, player);
            this.escavacoesAtivas.delete(userId);
            
            let titulo = motivo === 'quebra' 
                ? `🎒 **FIM DA LINHA! A PICARETA CEGOU!**\nVocê foi forçado a voltar para a superfície.\n` 
                : `🎒 **VOCÊ VOLTOU PARA A SUPERFÍCIE!**\n`;

            let header = `${userTag} ${titulo}Durabilidade restante: (${player.ferramentas.picareta_hp}/${picaretaAtual.durabilidade}).\n\n**Loot que você trouxe:**\n`;
            if (temAmbar) header = `${userTag} 🚨 **ALERTA DA INGEN!** VOCÊ TROUXE ÂMBAR DA CAVERNA! 🚨\n${titulo}Durabilidade restante: (${player.ferramentas.picareta_hp}/${picaretaAtual.durabilidade})\n\n`;
            
            return header + msgLoot;
        };

        if (action === 'guardar') {
            if (!sessao) return `${userTag} ❓ Você não está em nenhuma caverna. Use apenas *!escavar* para começar.`;
            return await finalizarSessao('fuga');
        }

        if (action === 'fundo' || action === 'lado' || action === '') {
            // [Código anterior de iniciar a sessão continua igual até a verificação do desmoronar]
            if (action === '') {
                if (sessao) return `${userTag} 🔦 Você já está no abismo (Camada ${sessao.camada})! O que você faz?\n👉 *!escavar fundo*, *!escavar lado* ou *!escavar guardar*.`;
                sessao = { camada: 0, turnos: 1, loot: {}, buffs: {} };
                this.escavacoesAtivas.set(userId, sessao);
            } else {
                if (!sessao) return `${userTag} ❓ Você não está escavando! Comece com *!escavar*.`;
                sessao.turnos += 1;
                if (action === 'fundo' && sessao.camada < picaretaAtual.max_camada) sessao.camada += 1;
            }

            let chanceDesmoronar = ESC_CHANCE_DESMORONAR_BASE + (ESC_DESMORONAR_INCREMENTO * sessao.camada);
            if (sessao.buffs?.suporte) chanceDesmoronar /= 2; 

            if (Math.random() < chanceDesmoronar) {
                const armadura = ARMOR_CATALOG[player.ferramentas.armadura];
                const salvouLoot = sessao.buffs?.suporte || (Math.random() * 100 < armadura.prot_loot);
                const salvouVida = Math.random() * 100 < armadura.prot_dano;

                let relatorioDesastre = `${userTag} 🪨💥 **DESMORONAMENTO!!!** 💥🪨\n\nO teto cedeu na Camada ${sessao.camada}!\n`;

                if (Math.random() < ESC_CHANCE_PERDER_PICARETA) {
                     player.ferramentas.picareta_hp = 0;
                     relatorioDesastre += `💥 Sua picareta foi esmagada e perdeu todo o fio (HP 0).\n`;
                } else {
                     player.ferramentas.picareta_hp -= sessao.turnos;
                     if(player.ferramentas.picareta_hp < 0) player.ferramentas.picareta_hp = 0;
                }

                if (salvouLoot) {
                    relatorioDesastre += `🛡️ Graças aos deuses (ou ao seu equipamento), você conseguiu se jogar debaixo de uma fenda e proteger **TODO O LOOT**!\n_Use !parque mochila para ver._\n`;
                    for (const [id, qtd] of Object.entries(sessao.loot)) {
                        player.inventory[id] = (player.inventory[id] || 0) + qtd;
                    }
                } else if (player.ferramentas.acessorio === 'mochila') {
                    let poolItems = [];
                    for (const [id, qtd] of Object.entries(sessao.loot)) {
                        for(let i = 0; i < qtd; i++) poolItems.push(id);
                    }
                    
                    for (let i = poolItems.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [poolItems[i], poolItems[j]] = [poolItems[j], poolItems[i]];
                    }
                    
                    const qtdSalvar = Math.floor(poolItems.length / 2);
                    const savedItems = poolItems.slice(0, qtdSalvar);
                    
                    if (savedItems.length > 0) {
                        let salvouAmbar = false;
                        for (const id of savedItems) {
                            if (id === 'ambar') salvouAmbar = true;
                            player.inventory[id] = (player.inventory[id] || 0) + 1;
                        }
                        relatorioDesastre += `🎒 Sua **Mochila de Carga** amorteceu a queda! Você perdeu parte das coisas, mas salvou **${savedItems.length} itens** de dentro dela (${salvouAmbar ? '🧬 **INCLUINDO UM ÂMBAR!**' : 'minérios diversos'}).\n`;
                    } else {
                        relatorioDesastre += `🎒 Sua **Mochila de Carga** resistiu à queda, mas você tinha tão pouco loot na sacola que não sobrou nada de valor lá dentro.\n`;
                    }
                } else {
                    relatorioDesastre += `☠️ Você deixou **TODO O LOOT** cair enquanto corria e perdeu tudo desta descida.\n`;
                }

                if (!salvouVida) {
                    financas.last_dano_escavacao = now;
                    let penTempo = "1 hora";
                    
                    if (player.ferramentas.acessorio === 'localizador') {
                        financas.last_dano_escavacao -= (ESC_COOLDOWN_DANO / 2);
                        penTempo = "30 minutos";
                        relatorioDesastre += `📡 O seu Localizador GPS chamou o resgate rápido! Você ficará de molho apenas **${penTempo}**.\n`;
                    } else {
                        relatorioDesastre += `🚑 Você foi resgatado de maca pela InGen. Ficará de molho por **1 hora**.\n`;
                    }
                    await this.db.run("UPDATE usuarios SET financas = ? WHERE id_usuario = ?", [JSON.stringify(financas), userId]);
                } else {
                    relatorioDesastre += `🛡️ A sua ${armadura.emoji} ${armadura.name} te protegeu das pedras! Você **saiu ileso** e não precisa ir pro hospital.\n`;
                }

                this.escavacoesAtivas.delete(userId);
                await this.savePlayerData(userId, player);
                return relatorioDesastre;
            }

            let lootTurno = [];
            let multBiotonico = sessao.buffs?.biotonico ? 1.5 : 1;

            if (action === 'fundo' && sessao.peek_fundo) {
                lootTurno = sessao.peek_fundo;
            } else if (action === 'lado' && sessao.peek_lado) {
                lootTurno = sessao.peek_lado;
            } else {
                lootTurno = await this.gerarLootCamada(sessao.camada, picaretaAtual, multBiotonico);
            }

            for (const id of lootTurno) sessao.loot[id] = (sessao.loot[id] || 0) + 1;

            sessao.buffs.suporte = false;

            if (player.ferramentas.acessorio === 'sensor') {
                sessao.peek_lado = await this.gerarLootCamada(sessao.camada, picaretaAtual, multBiotonico);
                if (sessao.camada < picaretaAtual.max_camada) {
                    sessao.peek_fundo = await this.gerarLootCamada(sessao.camada + 1, picaretaAtual, multBiotonico);
                }
            }

            if (sessao.turnos >= player.ferramentas.picareta_hp) {
                return await finalizarSessao('quebra');
            }

            return await this.processarLoot(userTag, sessao, lootTurno, picaretaAtual, player.ferramentas.picareta_hp);
        }

        return `${userTag} ⚠️ Comando de escavação inválido. Tente usar a loja.`;
    }

    async gerarLootCamada(camada, picareta, multiplicadorDrops = 1) {
        let loot = [];
        for (let i = 0; i < Math.ceil(picareta.drops * multiplicadorDrops); i++) {
            const chanceAmbar = ESC_CHANCE_AMBAR_BASE * (2 ** camada);
            if (Math.random() < chanceAmbar) {
                loot.push('ambar');
                continue;
            }
            
            let roll = Math.random() * 100;
            roll = roll * (1 - (picareta.sorte / 100));

            let allowedRarities = ['lixo', 'comum'];
            if (camada >= 1) allowedRarities.push('incomum', 'raro');
            if (camada >= 2) allowedRarities.push('muito_raro');
            if (camada >= 3) allowedRarities.push('lendario');
            if (camada >= 4) allowedRarities.push('mitico');

            let selectedRarity = 'lixo';
            if (roll < 1 && allowedRarities.includes('mitico')) selectedRarity = 'mitico';
            else if (roll < 3 && allowedRarities.includes('lendario')) selectedRarity = 'lendario';
            else if (roll < 10 && allowedRarities.includes('muito_raro')) selectedRarity = 'muito_raro';
            else if (roll < 30 && allowedRarities.includes('raro')) selectedRarity = 'raro';
            else if (roll < 60 && allowedRarities.includes('incomum')) selectedRarity = 'incomum';
            else if (roll < 85 && allowedRarities.includes('comum')) selectedRarity = 'comum';

            const possibleMinerals = MINERAL_CATALOG.filter(m => m.rarity === selectedRarity);
            if (possibleMinerals.length > 0) {
                const minerio = possibleMinerals[Math.floor(Math.random() * possibleMinerals.length)];
                loot.push(minerio.id);
            }
        }
        return loot;
    }

    async processarLoot(userTag, sessao, lootTurno, picareta, hpTotalPicareta) {
        let msgLoot = "";
        for (const id of lootTurno) {
            if (id === 'ambar') msgLoot += `🦟 **Âmbar Ancestral**\n`;
            else {
                const min = MINERAL_CATALOG.find(m => m.id === id);
                msgLoot += `${min.emoji} ${min.name}\n`;
            }
        }
        
        let ambarCount = 0;
        for (const [id, qtd] of Object.entries(sessao.loot)) {
            if (id === 'ambar') ambarCount += qtd;
        }

        const chanceDesmoronarFutura = ESC_CHANCE_DESMORONAR_BASE + (ESC_DESMORONAR_INCREMENTO * (sessao.camada + 1));
        const chanceDesmoronarAtual = ESC_CHANCE_DESMORONAR_BASE + (ESC_DESMORONAR_INCREMENTO * sessao.camada);
        
        const hpRestante = hpTotalPicareta - sessao.turnos;

        let msg = `${userTag} ⛏️ **O ABISMO - Camada ${sessao.camada}**\n`;
        msg += `🔨 _Durabilidade: Faltam ${hpRestante} batidas antes da picareta cegar._\n\n`;
        if (sessao.buffs?.biotonico) msg += `🍷 _Efeito Ativo: Biotônico Fontoura (1.5x Drops nesta descida)_\n`;
        if (sessao.buffs?.suporte) msg += `🏗️ _Efeito Ativo: Suporte de Teto (Risco Reduzido nesta batida)_\n`;
        msg += `Nesta batida você encontrou:\n${msgLoot}\n`;
        msg += `🎒 **Sua Sacola Temporária:** (${Object.keys(sessao.loot).length} tipos de itens | ${ambarCount} Âmbares)\n\n`;
        if (sessao.peek_lado) {
            const achouAmbar = sessao.peek_lado.includes('ambar');
            msg += `📟 Sensor (Lado): Detectou minérios e talvez... ${achouAmbar ? '🧬 SINAIS DE DNA!' : 'pedras normais.'}\n`;
        }
        if (sessao.peek_fundo) {
            const achouAmbar = sessao.peek_fundo.includes('ambar');
            msg += `📟 Sensor (Fundo): Sente uma vibração de... ${achouAmbar ? '🧬 SINAIS DE DNA!' : 'minérios densos.'}\n`;
        }

        if (sessao.camada < picareta.max_camada) {
            msg += `⚠️ Risco (Cavar p/ Lados): **${(chanceDesmoronarAtual * 100).toFixed(1)}%**\n`;
            msg += `⚠️ Risco (Descer Fundo): **${(chanceDesmoronarFutura * 100).toFixed(1)}%**\n\n`;
            msg += `👉 O que você faz?\n`;
            msg += `*!escavar fundo* (Descer p/ próxima camada)\n`;
            msg += `*!escavar lado* (Arriscar manter a camada atual)\n`;
            msg += `*!escavar guardar* (Foge com o loot)`;
        } else {
            msg += `⚠️ Risco (Cavar p/ Lados): **${(chanceDesmoronarAtual * 100).toFixed(1)}%**\n\n`;
            msg += `🛑 O material da sua Picareta não aguenta descer mais!\n👉 O que você faz?\n`;
            msg += `*!escavar lado* (Cava pros lados nesta camada)\n`;
            msg += `*!escavar guardar* (Foge com o loot)`;
        }
        return msg;
    }

    async gerenciarPicareta(userId, userTag, player, action, picaretaAtual) {
        if (action === 'loja') {
            let msg = `${userTag} 🛒 **ARMAZÉM DA INGEN (O Abismo)** 🛒\n\n`;

            msg += `🛠️ **Sua Picareta:** ${picaretaAtual.emoji} ${picaretaAtual.name} (${player.ferramentas.picareta_hp}/${picaretaAtual.durabilidade} HP)\n`;
            const consertoCusto = Math.floor((picaretaAtual.req_coins || 100) * 0.25);
            msg += `🔧 Conserto: 🪙 ${consertoCusto.toLocaleString('pt-BR')} (*!escavar consertar*)\n`;
            if (picaretaAtual.next) {
                const nextPic = PICKAXE_CATALOG[picaretaAtual.next];
                const itemReq = MINERAL_CATALOG.find(m => m.id === nextPic.req_item);
                msg += `🆙 Próx. Upgrade: ${nextPic.emoji} ${nextPic.name} (🪙 ${nextPic.req_coins.toLocaleString('pt-BR')} + ${nextPic.req_qtd}x ${itemReq.emoji}) -> *!escavar upar*\n`;
            }
            if (picaretaAtual.prev) msg += `🗑️ Sucatear: Reverte de graça -> *!escavar sucatear*\n\n`;

            const armaduraAtual = ARMOR_CATALOG[player.ferramentas.armadura];
            msg += `🛡️ **Sua Armadura:** ${armaduraAtual.emoji} ${armaduraAtual.name}\n`;
            msg += `_(Proteção: Dano ${armaduraAtual.prot_dano}% / Loot ${armaduraAtual.prot_loot}%)_\n`;
            if (armaduraAtual.next) {
                const nextArmor = ARMOR_CATALOG[armaduraAtual.next];
                msg += `🆙 Próx. Armadura: ${nextArmor.emoji} ${nextArmor.name} (🪙 ${nextArmor.price.toLocaleString('pt-BR')}) -> *!escavar comprar armadura*\n\n`;
            } else {
                msg += `✨ Você veste a defesa suprema do universo!\n\n`;
            }

            const acessorioAtual = ACCESSORY_CATALOG[player.ferramentas.acessorio] || ACCESSORY_CATALOG['nenhum'];
            msg += `🦺 **Acessório Equipado:** ${acessorioAtual.emoji} ${acessorioAtual.name}\n`;
            msg += `_Catálogo de Acessórios:_\n`;
            Object.values(ACCESSORY_CATALOG).filter(a => a.id !== 'nenhum').forEach(a => {
                msg += `- ${a.emoji} **${a.name}** (🪙 ${a.price.toLocaleString('pt-BR')}) -> *!escavar comprar ${a.id}*\n  _${a.desc}_\n`;
            });
            msg += `\n`;

            msg += `🎒 **Itens Consumíveis:**\n`;
            Object.values(CONSUMABLE_CATALOG).forEach(c => {
                const qtdInv = player.inventario_consumiveis?.[c.id] || 0;
                msg += `- ${c.emoji} **${c.name}** (🪙 ${c.price.toLocaleString('pt-BR')}) [Você tem: ${qtdInv}x]\n  _${c.desc}_ -> *!escavar comprar ${c.id}*\n`;
            });

            return msg;
        }

        const dbUser = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const saldo = dbUser ? dbUser.bostocoins : 0;

        if (action === 'consertar') {
            if (player.ferramentas.picareta_hp === picaretaAtual.durabilidade) return `${userTag} Sua picareta já está novinha em folha!`;
            const consertoCusto = Math.floor((picaretaAtual.req_coins || 100) * 0.25);
            
            if (saldo < consertoCusto) return `${userTag} 💸 Faltam moedas! Consertar custa 🪙 ${consertoCusto}, você só tem ${saldo}.`;
            
            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [consertoCusto, userId]);
            player.ferramentas.picareta_hp = picaretaAtual.durabilidade;
            await this.savePlayerData(userId, player);
            return `${userTag} 🔧 **AFIAÇÃO CONCLUÍDA!**\nSua ${picaretaAtual.name} recuperou a durabilidade máxima por 🪙 ${consertoCusto}.`;
        }

        if (action === 'sucatear') {
            if (!picaretaAtual.prev) return `${userTag} ❌ Você não pode sucatear a picareta de madeira, ela já é o lixo da base da cadeia alimentar!`;
            const prevPic = PICKAXE_CATALOG[picaretaAtual.prev];
            player.ferramentas.picareta = prevPic.id;
            player.ferramentas.picareta_hp = prevPic.durabilidade;
            await this.savePlayerData(userId, player);
            return `${userTag} 🗑️ **SUCATEADA!** Você desmontou sua picareta para não pagar o conserto e voltou para a ${prevPic.emoji} ${prevPic.name} (HP 100%).`;
        }

        if (action === 'upar') {
            if (!picaretaAtual.next) return `${userTag} ✨ Você já possui a ferramenta suprema, o ferreiro chora ao ver seu equipamento!`;
            const nextPic = PICKAXE_CATALOG[picaretaAtual.next];
            
            if (saldo < nextPic.req_coins) return `${userTag} 💸 Faltam Bostocoins! Custa 🪙 ${nextPic.req_coins}, você só tem ${saldo}.`;
            
            const itemReqQtd = player.inventory[nextPic.req_item] || 0;
            if (itemReqQtd < nextPic.req_qtd) {
                const itemDef = MINERAL_CATALOG.find(m => m.id === nextPic.req_item);
                return `${userTag} 🪨 Faltam materiais! Você precisa de ${nextPic.req_qtd}x ${itemDef.emoji} ${itemDef.name}, mas só tem ${itemReqQtd} no parque mochila.`;
            }

            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [nextPic.req_coins, userId]);
            player.inventory[nextPic.req_item] -= nextPic.req_qtd;
            player.ferramentas.picareta = nextPic.id;
            player.ferramentas.picareta_hp = nextPic.durabilidade;
            await this.savePlayerData(userId, player);

            return `${userTag} ⚒️ **UPGRADE FORJADO COM SUCESSO!**\nVocê sacrificou seus minérios e Bostocoins e o ferreiro forjou a ${nextPic.emoji} **${nextPic.name}**!\nEla aguenta descer até a **Camada ${nextPic.max_camada}** e acha mais itens!`;
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
        const dinosDescobertos = await this.db.all(
            "SELECT especie_id FROM parque_dinossauros WHERE descobridor_id = ? AND is_morto = 0", 
            [userId]
        );
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
            const recompensa = 2500;
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
        const dinos = await this.db.all("SELECT * FROM parque_dinossauros WHERE group_id = ? AND is_morto = 0 ORDER BY id ASC", [groupId]);
        
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

        const dino = await this.db.get("SELECT * FROM parque_dinossauros WHERE id = ? AND group_id = ? AND is_morto = 0", [dinoId, groupId]);
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
    async fixHibridosGlobais(ctx, userTag) {
        const grupos = await this.db.all("SELECT DISTINCT group_id FROM parque_dinossauros");
        let gruposAfetados = 0;

        for (const grupo of grupos) {
            
            let targetGroup = grupo.group_id;
            try {
                const link = await this.db.get("SELECT id_pai FROM grupos_linkados WHERE id_filho = ?", [grupo.group_id]);
                if (link) targetGroup = link.id_pai;
            } catch (e) {}

            const hibridosNovos = await this.verificarHibridos(targetGroup);

            if (hibridosNovos && hibridosNovos.trim() !== "") {
                gruposAfetados++;
                
                if (ctx && ctx.sendTo) {
                    try {
                        await ctx.sendTo(targetGroup, hibridosNovos);
                        await new Promise(resolve => setTimeout(resolve, 1500)); 
                    } catch(e) {
                        console.error(`Erro ao avisar grupo ${targetGroup} sobre o fix de híbrido:`, e);
                    }
                }
            }
        }

        return `${userTag} 🛠️ **VARREDURA GENÉTICA CONCLUÍDA!**\nA InGen revirou os parques e ativou mutações adormecidas em **${gruposAfetados} grupos**.\nOs alarmes tocaram e os dinossauros já estão nas jaulas!`;
    }
}

module.exports = ParqueHandler;
