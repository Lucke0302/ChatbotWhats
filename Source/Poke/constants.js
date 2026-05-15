const STARTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 152, 153, 154, 155, 156, 157, 158, 159, 160, 252, 253, 254, 255, 256, 257, 258, 259, 260];
const ADMIN_ID = "5513991008854@s.whatsapp.net";

const REWARD_CUTOFF = 1768233600000;
const RARE_POKE = [
    // --- GEN 1 ---
    25, 26, 172,      //Pichu, Pikachu, Raichu
    133, 134, 135, 136, 196, 197, //Eevee, Vap, Jolt, Flar, Esp, Umb
    147, 148, 149,    // Dratini, Dragonair, Dragonite
    143,              // Snorlax
    131,              // Lapras
    142,              // Aerodactyl
    
    // --- GEN 2 ---
    246, 247, 248,    // Larvitar, Pupitar, Tyranitar
    242,              // Blissey
    
    // --- GEN 3 ---
    280, 281, 282,    // Ralts, Kirlia, Gardevoir
    287, 288, 289,    // Slakoth, Vigoroth, Slaking
    371, 372, 373,    // Bagon, Shelgon, Salamence
    374, 375, 376,    // Beldum, Metang, Metagross
    349, 350,         // Feebas & Milotic
    328, 329, 330     // Trapinch, Vibrava, Flygon
];

const POKEMON_COUNT = 386;
const GAME_VERSION = 'emerald';
const GYM_TYPES = [
    'rock',    // 0 - Brock
    'water',   // 1 - Misty
    'electric',// 2 - Lt. Surge
    'grass',   // 3 - Erika
    'poison',  // 4 - Koga
    'psychic', // 5 - Sabrina
    'fire',    // 6 - Blaine
    'ground'   // 7 - Giovanni
];
const STATUS_MOVES = {
    // BUFFS
    "swords-dance": { target: 'self', stat: 'atk', stage: 2, msg: "aumentou drasticamente o ATAQUE" },
    "meditate":     { target: 'self', stat: 'atk', stage: 1, msg: "aumentou o ATAQUE" },
    "sharpen":      { target: 'self', stat: 'atk', stage: 1, msg: "aumentou o ATAQUE" },
    "growth":       { target: 'self', stat: 'atk&spa', stage: 1, msg: "aumentou o ATAQUE e o ATAQUE ESPECIAL" },
    "harden":       { target: 'self', stat: 'def', stage: 1, msg: "aumentou a DEFESA" },
    "withdraw":     { target: 'self', stat: 'def', stage: 1, msg: "aumentou a DEFESA" },
    "defense-curl": { target: 'self', stat: 'def', stage: 1, msg: "aumentou a DEFESA" },
    "acid-armor":   { target: 'self', stat: 'def', stage: 2, msg: "aumentou drasticamente a DEFESA" },
    "barrier":      { target: 'self', stat: 'def', stage: 2, msg: "aumentou drasticamente a DEFESA" },
    "amnesia":      { target: 'self', stat: 'spd', stage: 2, msg: "aumentou drasticamente a DEF. ESP." },
    "agility":      { target: 'self', stat: 'spe', stage: 2, msg: "aumentou drasticamente a VELOCIDADE" },
    "calm-mind":    { target: 'self', stat: 'spa&spd', stage: 1, msg: "aumentou ATQ. ESP. e DEF. ESP." },
    "dragon-dance": { target: 'self', stat: 'atk&spe', stage: 1, msg: "aumentou ATAQUE e VELOCIDADE" },

    // DEBUFFS
    "growl":        { target: 'enemy', stat: 'atk', stage: -1, msg: "baixou o ATAQUE" },
    "tail-whip":    { target: 'enemy', stat: 'def', stage: -1, msg: "baixou a DEFESA" },
    "leer":         { target: 'enemy', stat: 'def', stage: -1, msg: "baixou a DEFESA" },
    "screech":      { target: 'enemy', stat: 'def', stage: -2, msg: "baixou muito a DEFESA" },
    "sand-attack":  { target: 'enemy', stat: 'acc', stage: -1, msg: "baixou a PRECISÃO" },
    "smokescreen":  { target: 'enemy', stat: 'acc', stage: -1, msg: "baixou a PRECISÃO" },
    "string-shot":  { target: 'enemy', stat: 'spe', stage: -1, msg: "baixou a VELOCIDADE" },
    "scary-face":   { target: 'enemy', stat: 'spe', stage: -2, msg: "baixou muito a VELOCIDADE" },
    "metal-sound":  { target: 'enemy', stat: 'spd', stage: -2, msg: "baixou muito a DEF. ESP." },
    "fake-tears":   { target: 'enemy', stat: 'spd', stage: -2, msg: "baixou muito a DEF. ESP." },

    // STATUS CONDITIONS
    "thunder-wave": { target: 'enemy', status: 'par', msg: "PARALISOU o alvo!" },
    "stun-spore":   { target: 'enemy', status: 'par', msg: "PARALISOU o alvo!" },
    "glare":        { target: 'enemy', status: 'par', msg: "PARALISOU o alvo!" },
    "will-o-wisp":  { target: 'enemy', status: 'brn', msg: "QUEIMOU o alvo!" },
    "poison-powder":{ target: 'enemy', status: 'psn', msg: "ENVENENOU o alvo!" },
    "poison-gas":   { target: 'enemy', status: 'psn', msg: "ENVENENOU o alvo!" },
    "sleep-powder": { target: 'enemy', status: 'slp', msg: "fez o alvo DORMIR!" },
    "hypnosis":     { target: 'enemy', status: 'slp', msg: "fez o alvo DORMIR!" },
    "sing":         { target: 'enemy', status: 'slp', msg: "fez o alvo DORMIR!" },
    "spore":        { target: 'enemy', status: 'slp', msg: "fez o alvo DORMIR!" },
    "confuse-ray":  { target: 'enemy', status: 'confused', msg: "CONFUNDIU o alvo!" },
    "supersonic":   { target: 'enemy', status: 'confused', msg: "CONFUNDIU o alvo!" },

    // CURA
    "recover":      { target: 'self', heal: 0.5, msg: "recuperou 50% de HP!" },
    "soft-boiled":  { target: 'self', heal: 0.5, msg: "recuperou 50% de HP!" },
    "synthesis":    { target: 'self', heal: 0.5, msg: "recuperou 50% de HP!" },
    "moonlight":    { target: 'self', heal: 0.5, msg: "recuperou 50% de HP!" },
    "rest":         { target: 'self', heal: 1.0, status: 'slp', msg: "dormiu e recuperou tudo!" },

    // OUTROS
    "splash":       { target: 'self', msg: "não fez nada... apenas pulou." },
    "teleport":     { target: 'self', msg: "tentou fugir, mas falhou!" }
}

const STAT_DICT = {
    'atk': 'o ATAQUE',
    'def': 'a DEFESA',
    'spa': 'o ATQ. ESP.',
    'spd': 'a DEF. ESP.',
    'spe': 'a VELOCIDADE',
    'acc': 'a PRECISÃO',
    'eva': 'a EVASIVA'
}

const TYPE_CHART = {
    bug: { grass: 2, psychic: 2, dark: 2, fighting: .5, flying: .5, poison: .5, ghost: .5, steel: .5, fire: .5, fairy: .5 },  
    dark: {ghost: 2, psychic: 2, fairy: .5 ,fighting: .5, dark: .5 },
    dragon: { dragon: 2, steel: .5, fairy: 0 },  
    electric: { water: 2, flying: 2, grass: .5, electric: .5, dragon: .5, ground: 0 },
    fairy: { dragon: 2, fighting: 2, dark: 2, poison: .5, steel: .5, fire: .5 },
    fighting: { normal: 2, rock: 2, steel: 2, ice: 2, dark: 2, flying: .5, poison: .5, bug: .5, psychic: .5, fairy: .5, ghost: 0},
    fire: { grass: 2, bug: 2, steel: 2, ice: 2, rock: .5, fire: .5, water: .5, dragon: .5 },
    flying: { grass: 2, bug: 2, fighting: 2, rock: .5, steel: .5, electric: .5 },
    ghost: { ghost: 2, psychic: 2, dark: .5, normal: 0 },  
    grass: { water: 2, ground: 2, rock: 2, flying: .5, poison: .5, bug: .5, steel: .5, fire: .5, grass: .5, dragon: .5 },
    ground: { electric: 2, poison: 2, rock: 2, steel: 2, fire: 2, bug: .5, grass: .5, flying: 0 },
    ice: { flying: 2, dragon: 2, ground: 2, grass: 2, steel: .5, fire: .5, water: .5, ice: .5 },
    normal: { rock: .5, steel: .5, ghost: 0 },
    poison: { grass: 2, fairy: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0 },    
    psychic: { poison: 2, fighting: 2, steel: .5, psychic: .5, dark: 0 },
    rock: { bug: 2, flying: 2, fire: 2, ice: 2, fighting: .5, ground: .5, steel: .5 },
    steel: { rock: 2, ice: 2, fairy: 2, steel: .5, fire: .5, water: .5, electric: .5 },
    water: { fire: 2, ground: 2, rock: 2, water: .5, grass: .5, dragon: .5 }
}

const TRAINER_DATA = [
    { class: "Youngster",   names: ["Joey", "Ben", "Calvin"], type: "normal",   sprite: "https://play.pokemonshowdown.com/sprites/trainers/youngster-gen4.png" },
    { class: "Bug Catcher", names: ["Wade", "Sam", "Doug"],   type: "bug",      sprite: "https://play.pokemonshowdown.com/sprites/trainers/bugcatcher-gen4.png" },
    { class: "Lass",        names: ["Janice", "Sally"],       type: "normal",   sprite: "https://play.pokemonshowdown.com/sprites/trainers/lass-gen4.png" },
    { class: "Hiker",       names: ["Anthony", "Lenny"],      type: "rock",     sprite: "https://play.pokemonshowdown.com/sprites/trainers/hiker-gen4.png" },
    { class: "Fisherman",   names: ["Ralph", "Justin"],       type: "water",    sprite: "https://play.pokemonshowdown.com/sprites/trainers/fisherman-gen4.png" },
    { class: "Psychic",     names: ["Nathan", "Jared"],       type: "psychic",  sprite: "https://play.pokemonshowdown.com/sprites/trainers/psychic-gen4.png" },
    { class: "Black Belt",  names: ["Kiyo", "Mike"],          type: "fighting", sprite: "https://play.pokemonshowdown.com/sprites/trainers/blackbelt-gen4.png" },
    { class: "Scientist",   names: ["Beau", "Ted"],           type: "electric", sprite: "https://play.pokemonshowdown.com/sprites/trainers/scientist-gen4.png" },
    { class: "Team Rocket", names: ["Grunt", "Admin"],        type: "poison",   sprite: "https://play.pokemonshowdown.com/sprites/trainers/rocketgrunt-gen4.png" },
    { class: "Cooltrainer", names: ["Nick", "Becky"],         type: null,       sprite: "https://play.pokemonshowdown.com/sprites/trainers/acetrainer-gen4.png" }
];

const EVENTS_DB = {
    // Código do Evento (ID Abstrato)
    'grc01': { 
        name: "Doce Raro de Boas-vindas",
        type: 'item',      // Tipo da recompensa (item, coin, pokemon)
        reward_id: 'rare-candy', // ID do item/pokemon
        amount: 1,         // Quantidade
        active: true,      // Se o código ainda funciona
        msg: "🍬 Um doce mágico! Use no seu Pokémon (fora de batalha) para subir de nível."
    },
    'vet01': {
        name: "Recompensa de Veterano",
        type: 'custom',    // Tipo 'custom' para lógicas complexas (como escolher o inicial)
        active: true,
        msg: "🏅 Um presente para quem está aqui desde o início."
    },
    'coin5k': {
        name: "Bolsa de Ouro",
        type: 'coin',
        amount: 5000,
        active: true,
        msg: "💰 Dinheiro na mão! Gaste na loja com sabedoria."
    }
};

const SECONDARY_EFFECTS = {
    // --- CHANCE DE STATUS ---
    "flamethrower":   { chance: 10, status: 'brn', target: 'enemy', msg: "queimou o alvo!" },
    "ember":          { chance: 10, status: 'brn', target: 'enemy', msg: "queimou o alvo!" },
    "fire-blast":     { chance: 10, status: 'brn', target: 'enemy', msg: "queimou o alvo!" },
    "thunderbolt":    { chance: 10, status: 'par', target: 'enemy', msg: "paralisou o alvo!" },
    "thunder-shock":  { chance: 10, status: 'par', target: 'enemy', msg: "paralisou o alvo!" },
    "thunder":        { chance: 30, status: 'par', target: 'enemy', msg: "paralisou o alvo!" },
    "ice-beam":       { chance: 10, status: 'frz', target: 'enemy', msg: "congelou o alvo!" },
    "blizzard":       { chance: 10, status: 'frz', target: 'enemy', msg: "congelou o alvo!" },
    "sludge-bomb":    { chance: 30, status: 'psn', target: 'enemy', msg: "envenenou o alvo!" },
    "sludge":         { chance: 30, status: 'psn', target: 'enemy', msg: "envenenou o alvo!" },
    "poison-sting":   { chance: 30, status: 'psn', target: 'enemy', msg: "envenenou o alvo!" },
    "body-slam":      { chance: 30, status: 'par', target: 'enemy', msg: "paralisou o alvo!" },
    "dragon-breath":  { chance: 30, status: 'par', target: 'enemy', msg: "paralisou o alvo!" },

    // --- DEBUFFS NO INIMIGO ---
    "psychic":        { chance: 10, stat: 'spd', stage: -1, target: 'enemy', msg: "reduziu a DEF. ESP. do inimigo." },
    "shadow-ball":    { chance: 20, stat: 'spd', stage: -1, target: 'enemy', msg: "reduziu a DEF. ESP. do inimigo." },
    "crunch":         { chance: 20, stat: 'def', stage: -1, target: 'enemy', msg: "reduziu a DEFESA do inimigo." },
    "iron-tail":      { chance: 30, stat: 'def', stage: -1, target: 'enemy', msg: "reduziu a DEFESA do inimigo." },
    "rock-tomb":      { chance: 100, stat: 'spe', stage: -1, target: 'enemy', msg: "reduziu a VELOCIDADE do inimigo." },
    "icy-wind":       { chance: 100, stat: 'spe', stage: -1, target: 'enemy', msg: "reduziu a VELOCIDADE do inimigo." },
    "mud-shot":       { chance: 100, stat: 'spe', stage: -1, target: 'enemy', msg: "reduziu a VELOCIDADE do inimigo." },
    "bubble-beam":    { chance: 10, stat: 'spe', stage: -1, target: 'enemy', msg: "reduziu a VELOCIDADE do inimigo." },
    "aurora-beam":    { chance: 10, stat: 'atk', stage: -1, target: 'enemy', msg: "reduziu o ATAQUE do inimigo." },
    "moonblast":      { chance: 30, stat: 'spa', stage: -1, target: 'enemy', msg: "reduziu o ATQ. ESP. do inimigo." },

    // --- BUFFS NO USUÁRIO ---
    "ancient-power":  { chance: 10, allStats: true, stage: 1, target: 'self', msg: "aumentou TODOS os status!" },
    "silver-wind":    { chance: 10, allStats: true, stage: 1, target: 'self', msg: "aumentou TODOS os status!" },
    "steel-wing":     { chance: 10, stat: 'def', stage: 1, target: 'self', msg: "aumentou a própria DEFESA." },
    "meteor-mash":    { chance: 20, stat: 'atk', stage: 1, target: 'self', msg: "aumentou o próprio ATAQUE." },

    // --- FLINCH ---
    "bite":           { chance: 30, effect: 'flinch', msg: "fez o alvo recuar!" },
    "rock-slide":     { chance: 30, effect: 'flinch', msg: "fez o alvo recuar!" },
    "headbutt":       { chance: 30, effect: 'flinch', msg: "fez o alvo recuar!" },
    "waterfall":      { chance: 20, effect: 'flinch', msg: "fez o alvo recuar!" },
    "astonish":       { chance: 30, effect: 'flinch', msg: "fez o alvo recuar!" },
    "fake-out":       { chance: 100, effect: 'flinch', msg: "fez o alvo recuar!" }
};

const HIGH_CRIT_MOVES = ['slash', 'razor-leaf', 'crabhammer', 'karate-chop', 'leaf-blade', 'cross-chop', 'aeroblast', 'stone-edge', 'night-slash', 'psycho-cut'];

const STATUS_EFFECTS = {
    par: { name: "Paralisado", msg: "está paralisado e não consegue se mover!" },
    psn: { name: "Envenenado", dmg: 1/8, msg: "sofreu dano do veneno!" },
    tox: { name: "Gravemente Envenenado", msg: "sofreu dano do veneno!" },
    brn: { name: "Queimado", dmg: 1/16, msg: "sofreu dano da queimadura!" }, 
    slp: { name: "Dormindo", msg: "está dormindo profundamente..." },
    frz: { name: "Congelado", msg: "está congelado e não pode atacar!" },
    con: { name: "Confuso", msg: "está confuso..."}
};

const NATURES = {
    hardy:   { name: "Hardy",   up: null, down: null },
    lonely:  { name: "Lonely",  up: "atk", down: "def" },
    brave:   { name: "Brave",   up: "atk", down: "spe" },
    adamant: { name: "Adamant", up: "atk", down: "spa" },
    naughty: { name: "Naughty", up: "atk", down: "spd" },
    bold:    { name: "Bold",    up: "def", down: "atk" },
    docile:  { name: "Docile",  up: null, down: null },
    relaxed: { name: "Relaxed", up: "def", down: "spe" },
    impish:  { name: "Impish",  up: "def", down: "spa" },
    lax:     { name: "Lax",     up: "def", down: "spd" },
    timid:   { name: "Timid",   up: "spe", down: "atk" },
    hasty:   { name: "Hasty",   up: "spe", down: "def" },
    serious: { name: "Serious", up: null, down: null },
    jolly:   { name: "Jolly",   up: "spe", down: "spa" },
    naive:   { name: "Naive",   up: "spe", down: "spd" },
    modest:  { name: "Modest",  up: "spa", down: "atk" },
    mild:    { name: "Mild",    up: "spa", down: "def" },
    quiet:   { name: "Quiet",   up: "spa", down: "spe" },
    bashful: { name: "Bashful", up: null, down: null },
    rash:    { name: "Rash",    up: "spa", down: "spd" },
    calm:    { name: "Calm",    up: "spd", down: "atk" },
    gentle:  { name: "Gentle",  up: "spd", down: "def" },
    sassy:   { name: "Sassy",   up: "spd", down: "spe" },
    careful: { name: "Careful", up: "spd", down: "spa" },
    quirky:  { name: "Quirky",  up: null, down: null }
};

const TYPE_EMOJIS = {
    normal: '⚪', fire: '🔥', water: '💧', grass: '🍃', electric: '⚡',
    ice: '❄️', fighting: '👊', poison: '☠️', ground: '🏜️', flying: '🦅',
    psychic: '🔮', bug: '🪲', rock: '🪨', ghost: '👻', dragon: '🐉',
    steel: '🔩', dark: '🌑', fairy: '✨'
};

const PAYOUT_RATES = {
    "Youngster": 10,
    "Bug Catcher": 8, 
    "Lass": 12,
    "Hiker": 15,
    "Fisherman": 15,
    "Black Belt": 20,
    "Scientist": 25,
    "Team Rocket": 30,
    "Psychic": 25,
    "Cooltrainer": 40
};        

const GYM_PAYOUT_RATES = {
    "Jovem": 12,        
    "Escoteiro": 15,
    "Montanhista": 18,
    "Nadador": 18,
    "Mecânico": 22,
    "Ciclista": 20,
    "Faixa Preta": 25,
    "Médium": 30
};

const POKE_HELP = {
    'default': `🦕 *CENTRO DE AJUDA POKÉMON* 🦕

Use *!poke ajuda [comando]* para saber mais detalhes.

🌱 *INÍCIO*
• *comecar* (ou start) ➝ Escolher seu primeiro Pokémon.

⚔️ *AVENTURA*
• *explorar* (ou hunt) ➝ Procurar Pokémon selvagem.
• *atacar* (ou moves) ➝ Lutar (Turno de batalha).
• *capturar* (ou catch) ➝ Jogar Pokébola.
• *fugir* ➝ Sair da batalha.

🏥 *GERENCIAMENTO*
• *perfil* ➝ Ver dinheiro, insígnias e itens.
• *time* (ou team) ➝ Ver seus 6 Pokémon atuais.
• *mostrar* (ou info) ➝ Ver ficha técnica (IVs, Status, Golpes, Itens).
• *curar* (ou heal) ➝ Restaurar HP e PP (Grátis).
• *pc* ➝ Guardar/Pegar Pokémon da caixa.
• *trocar* (ou switch) ➝ Mudar ordem do time ou Pokémon ativo.

💪 *EVOLUÇÃO E TREINO*
• *evoluir* (ou evolve) ➝ Transformar seu Pokémon.
• *pendentes* ➝ Ver a fila de golpes novos aguardando para serem aprendidos.
• *ensinar* ➝ Substituir um golpe antigo por um novo da fila.
• *daycare* ➝ Deixar um Pokémon na creche ganhando XP passivo.

🎒 *ITENS E MOCHILA*
• *mochila* (ou bag) ➝ Ver seus itens (TMs, Poções, Itens de Segurar).
• *usar* (ou use) ➝ Usar um item em um Pokémon.
• *tm* ➝ Ensinar um TM para o seu Pokémon.

🏛️ *PROGRESSO*
• *ginasio* (ou gym) ➝ Desafiar líderes e ganhar insígnias.
• *loja* (ou shop) ➝ Comprar itens.`,

    'comecar': `🌱 *COMANDO: comecar*\nInicia sua jornada no mundo Pokémon.\nVocê poderá escolher entre os iniciais de Kanto (Gen 1), Johto (Gen 2) e Hoenn (Gen 3).\n\n*Uso:* !poke comecar`,
    'explorar': `🌿 *COMANDO: explorar*\nProcura um Pokémon selvagem ou um treinador para batalhar.\nA raridade e o nível dos inimigos aumentam conforme suas insígnias.\n\n*Uso:* !poke explorar`,
    'atacar': `⚔️ *COMANDO: atacar*\nUsa um dos seus golpes durante a batalha.\n\n*Uso:*\n• *!poke atacar* (Mostra a lista de golpes)\n• *!poke atacar 1* (Usa o primeiro golpe)\n• *!poke atacar 2* (Usa o segundo golpe)`,
    'capturar': `🔴 *COMANDO: capturar*\nJoga uma Pokébola no Pokémon selvagem atual.\nA chance aumenta se o HP dele estiver baixo.\n*Custo:* 1 Pokébola (Compre na loja).\n\n*Uso:* !poke capturar`,
    'curar': `🏥 *COMANDO: curar*\nLeva seus Pokémon para a Enfermeira Joy.\nRecupera 100% do HP e restaura todos os PPs. É de graça!\n\n*Uso:* !poke curar`,
    'perfil': `👤 *COMANDO: perfil*\nMostra seu cartão de treinador com:\n• Dinheiro (Pokécoins)\n• Insígnias conquistadas\n• Resumo rápido do time\n\n*Uso:* !poke perfil`,
    'time': `🧢 *COMANDO: time*\nMostra a lista detalhada dos seus 6 Pokémon atuais.\nMostra HP atual, Nível e Tipos.\n\n*Uso:*\n• *!poke time* (Lista simples)\n• *!poke time detalhes* (Mostra Naturezas)`,
    'mostrar': `📊 *COMANDO: mostrar*\nExibe a ficha completa de um Pokémon específico.\nInclui: Foto, Status (Atk, Def, etc), IVs, Golpes, XP e Item Segurado.\n\n*Uso:* !poke mostrar [número_do_slot]\n*Exemplo:* _!poke mostrar 1_`,
    'pc': `💻 *COMANDO: pc*\nGerencia seus Pokémon guardados (Box).\nVocê só pode carregar 6 no time. Os capturados extras vão pro PC.\n\n*Uso:*\n• *!poke pc lista* (Vê quem está guardado)\n• *!poke pc [slot_time] [box_pc]* (Troca um do time por um do PC)\n*Exemplo:* _!poke pc 2 1_ (Manda o slot 2 pro PC e pega o 1 do PC)`,
    'trocar': `🔄 *COMANDO: trocar*\n*Em Batalha:* Troca o Pokémon que está lutando.\n*Fora de Batalha:* Muda a ordem do time.\n\n*Uso:*\n• *!poke trocar 2* (Em batalha: Envia o Pokémon 2)\n• *!poke trocar 1 3* (No menu: O 1º vira o 3º e vice-versa)`,
    'evoluir': `✨ *COMANDO: evoluir*\nEvolui um Pokémon que já atingiu o nível necessário.\nO bot avisa quando ele pode evoluir.\n\n*Uso:* !poke evoluir [slot]\n*Exemplo:* _!poke evoluir 1_ (Evolui o líder do time)`,
    'pendentes': `🚨 *COMANDO: pendentes*\nMostra a fila de ataques que seus Pokémon aprenderam ao subir de nível, mas que estão aguardando espaço para serem ensinados.\n\n*Uso:* !poke pendentes`,
    'ensinar': `💡 *COMANDO: ensinar*\nSubstitui um golpe antigo por um novo que está na fila de espera (ou descarta o novo).\n\n*Uso:*\n!poke ensinar [slot_do_pokemon] [1 a 4 para substituir, ou 0 para descartar]\n*Exemplo:* _!poke ensinar 1 4_ (O Pokémon do slot 1 vai esquecer o golpe 4 e aprender o da fila).`,
    'daycare': `🏡 *COMANDO: daycare*\nDeixe um Pokémon na creche para ganhar XP passivo enquanto você batalha com outros!\n*Custo:* 200 moedas por nível subido na hora de retirar.\n\n*Uso:*\n• *!poke daycare [slot_do_time]* (Deposita o Pokémon)\n• *!poke daycare ver* (Olha a ficha de quem tá lá)\n• *!poke daycare tirar* (Paga a conta e pega de volta)`,
    'mochila': `🎒 *COMANDO: mochila*\nAbre o seu inventário para ver poções, TMs e itens de segurar.\n\n*Uso:* !poke mochila`,
    'usar': `💊 *COMANDO: usar*\nUsa um item do seu inventário em um Pokémon do time.\n\n*Uso:* !poke usar [id_do_item] [slot_do_pokemon]\n*Exemplo:* _!poke usar potion 1_`,
    'tm': `💿 *COMANDO: tm*\nEnsina um golpe de um TM (Technical Machine) para o seu Pokémon (se ele for compatível, claro).\n\n*Uso:* !poke tm [numero_do_tm] [slot_do_pokemon]\n*Exemplo:* _!poke tm 28 1_ (Ensina o TM28 - Dig para o 1º Pokémon)`,
    'ginasio': `🏛️ *COMANDO: ginasio*\nAvança na história enfrentando treinadores e Líderes de Ginásio.\nVencer líderes dá Insígnias (que liberam novos Pokémon selvagens) e TMs exclusivos.\n\n*Uso:* !poke ginasio`,
    'loja': `🏪 *COMANDO: loja*\nCompra itens essenciais.\n\n*Uso:*\n• *!poke loja* (Vê os itens)\n• *!poke comprar [id_item] [quantidade]*`
};

const NATURE_KEYS = Object.keys(NATURES);

module.exports = {
    STARTER_IDS,
    ADMIN_ID,
    REWARD_CUTOFF,
    RARE_POKE,
    POKEMON_COUNT,
    GAME_VERSION,
    GYM_TYPES,
    STATUS_MOVES,
    STAT_DICT,
    TYPE_CHART,
    TRAINER_DATA,
    EVENTS_DB,
    SECONDARY_EFFECTS,
    HIGH_CRIT_MOVES,
    STATUS_EFFECTS,
    NATURES,
    TYPE_EMOJIS,
    NATURE_KEYS,
    PAYOUT_RATES,
    GYM_PAYOUT_RATES,
    POKE_HELP
};