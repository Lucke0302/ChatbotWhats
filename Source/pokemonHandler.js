const axios = require('axios');
const { gracefulShutdown } = require('node-schedule');
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

const TYPE_EMOJIS = {
    normal: '⚪', fire: '🔥', water: '💧', grass: '🍃', electric: '⚡',
    ice: '❄️', fighting: '👊', poison: '☠️', ground: '🏜️', flying: '🦅',
    psychic: '🔮', bug: '🪲', rock: '🪨', ghost: '👻', dragon: '🐉',
    steel: '🔩', dark: '🌑', fairy: '✨'
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
const NATURE_KEYS = Object.keys(NATURES);

const STATUS_EFFECTS = {
    par: { name: "Paralisado", msg: "está paralisado e não consegue se mover!" },
    psn: { name: "Envenenado", dmg: 1/8, msg: "sofreu dano do veneno!" },
    tox: { name: "Gravemente Envenenado", msg: "sofreu dano do veneno!" },
    brn: { name: "Queimado", dmg: 1/16, msg: "sofreu dano da queimadura!" }, 
    slp: { name: "Dormindo", msg: "está dormindo profundamente..." },
    frz: { name: "Congelado", msg: "está congelado e não pode atacar!" },
    con: { name: "Confuso", msg: "está confuso..."}
};

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
• *mostrar* (ou info) ➝ Ver ficha técnica (IVs, Status, Golpes).
• *curar* (ou heal) ➝ Restaurar HP e PP (Grátis).
• *pc* ➝ Guardar/Pegar Pokémon da caixa.
• *trocar* (ou switch) ➝ Mudar ordem do time ou Pokémon ativo.

💪 *EVOLUÇÃO E TREINO*
• *evoluir* (ou evolve) ➝ Transformar seu Pokémon.
• *esquecer* ➝ Trocar golpes aprendidos.

🏛️ *PROGRESSO*
• *ginasio* (ou gym) ➝ Desafiar líderes e ganhar insígnias.
• *loja* (ou shop) ➝ Comprar itens.`,

    'comecar': `🌱 *COMANDO: comecar*
Inicia sua jornada no mundo Pokémon.
Você poderá escolher entre os iniciais de Kanto (Gen 1), Johto (Gen 2) e Hoenn (Gen 3).

*Uso:* !poke comecar
🔹 *Aliases:* start, escolher, choose`,

    'explorar': `🌿 *COMANDO: explorar*
Procura um Pokémon selvagem ou um treinador para batalhar.
A raridade e o nível dos inimigos aumentam conforme suas insígnias.

*Uso:* !poke explorar
🔹 *Aliases:* hunt`,

    'atacar': `⚔️ *COMANDO: atacar*
Usa um dos seus golpes durante a batalha.

*Uso:*
• *!poke atacar* (Mostra a lista de golpes)
• *!poke atacar 1* (Usa o primeiro golpe)
• *!poke atacar 2* (Usa o segundo golpe)
🔹 *Aliases:* attacks, moves, golpes`,

    'capturar': `🔴 *COMANDO: capturar*
Joga uma Pokébola no Pokémon selvagem atual.
A chance aumenta se o HP dele estiver baixo.
*Custo:* 1 Pokébola (Compre na loja).

*Uso:* !poke capturar
🔹 *Aliases:* catch, ball`,

    'curar': `🏥 *COMANDO: curar*
Leva seus Pokémon para a Enfermeira Joy.
Recupera 100% do HP e restaura todos os PPs. É de graça!

*Uso:* !poke curar
🔹 *Aliases:* heal, nurse`,

    'perfil': `👤 *COMANDO: perfil*
Mostra seu cartão de treinador com:
• Dinheiro (Pokécoins)
• Itens (Bolas, Poções)
• Insígnias conquistadas
• Resumo rápido do time

*Uso:* !poke perfil
🔹 *Aliases:* profile, box`,

    'time': `🧢 *COMANDO: time*
Mostra a lista detalhada dos seus 6 Pokémon atuais.
Mostra HP atual, Nível e Tipos.

*Uso:*
• *!poke time* (Lista simples)
• *!poke time detalhes* (Mostra Naturezas)
🔹 *Aliases:* team`,

    'mostrar': `📊 *COMANDO: mostrar*
Exibe a ficha completa de um Pokémon específico.
Inclui: Foto, Status (Atk, Def, etc), IVs, Golpes e XP.

*Uso:* !poke mostrar [número_do_slot]
*Exemplo:* _!poke mostrar 1_
🔹 *Aliases:* show, info, stats, analisar`,

    'pc': `💻 *COMANDO: pc*
Gerencia seus Pokémon guardados (Box).
Você só pode carregar 6 no time. Os capturados extras vão pro PC.

*Uso:*
• *!poke pc lista* (Vê quem está guardado)
• *!poke pc [slot_time] [box_pc]* (Troca um do time por um do PC)
*Exemplo:* _!poke pc 2 1_ (Manda o slot 2 pro PC e pega o 1 do PC)
🔹 *Aliases:* storage`,

    'trocar': `🔄 *COMANDO: trocar*
*Em Batalha:* Troca o Pokémon que está lutando.
*Fora de Batalha:* Muda a ordem do time.

*Uso:*
• *!poke trocar 2* (Em batalha: Envia o Pokémon 2)
• *!poke trocar 1 3* (No menu: O 1º vira o 3º e vice-versa)
🔹 *Aliases:* switch`,

    'evoluir': `✨ *COMANDO: evoluir*
Evolui um Pokémon que já atingiu o nível necessário.
O bot avisa quando ele pode evoluir.

*Uso:* !poke evoluir [slot]
*Exemplo:* _!poke evoluir 1_ (Evolui o líder do time)
🔹 *Aliases:* evolve`,

    'esquecer': `💡 *COMANDO: esquecer*
Quando seu Pokémon aprende um golpe novo e já tem 4, você precisa escolher qual esquecer.

*Uso:*
• *!poke esquecer 1* (Substitui o golpe 1 pelo novo)
• *!poke ignorar* (Desiste de aprender o novo golpe)
🔹 *Aliases:* swap`,

    'ginasio': `🏛️ *COMANDO: ginasio*
Avança na história enfrentando treinadores e Líderes de Ginásio.
Vencer líderes dá Insígnias (que liberam novos Pokémon selvagens) e muito dinheiro.

*Uso:* !poke ginasio
🔹 *Aliases:* gym, historia`,

    'loja': `🏪 *COMANDO: loja*
Compra itens essenciais.

*Uso:*
• *!poke loja* (Vê os itens)
• *!poke comprar [id_item] [quantidade]*
*Exemplo:* _!poke comprar 1 10_ (Compra 10 Pokébolas)
🔹 *Aliases:* shop, mart, buy, comprar`
};

class PokemonHandler {
    constructor(db) {
        this.db = db;
        this.dailyShopCache = {
            date: '',
            items: []
        };
    }

    async init() {
        const defaultItems = [
            ['pokeball', 'Pokébola', 'ball', 200, 'Uma ferramenta básica para capturar Pokémon selvagens.'],
            ['greatball', 'Great Ball', 'ball', 600, 'Uma boa ferramenta para capturar Pokémon selvagens.'],
            ['ultraball', 'Ultra Ball', 'ball', 2000, 'Uma ferramenta muito boa para capturar Pokémon selvagens.'],
            ['potion', 'Poção', 'medicine', 300, 'Recupera 20 HP de um Pokémon.'],
            ['superpotion', 'Super Poção', 'medicine', 700, 'Recupera 50 HP de um Pokémon.'],
            ['hyperpotion', 'Híper Poção', 'medicine', 1500, 'Recupera 200 HP de um Pokémon.'],
            ['exp-share', 'Exp. Share', 'held', 5000, 'Distribui XP para o portador mesmo sem batalhar.'],
            ['rare-candy', 'Rare Candy', 'medicine', 30000, 'Sobe 1 nível do Pokémon instantaneamente.'],
            
            // --- TMs ---
            // --- LÍDERES - PREÇO 0 (Não vendem) ---
            ['tm39', 'TM39 (Rock Tomb)', 'tm', 0, 'Lança pedras no inimigo e reduz a velocidade. (Brock)'],
            ['tm03', 'TM03 (Water Pulse)', 'tm', 0, 'Ataque de água que pode confundir. (Misty)'],
            ['tm34', 'TM34 (Shock Wave)', 'tm', 0, 'Choque elétrico rápido que nunca erra. (Lt. Surge)'],
            ['tm19', 'TM19 (Giga Drain)', 'tm', 0, 'Drena a vida do oponente. (Erika)'],
            ['tm06', 'TM06 (Toxic)', 'tm', 0, 'Envenena gravemente o oponente. (Koga)'],
            ['tm04', 'TM04 (Calm Mind)', 'tm', 0, 'Aumenta Atq. Esp. e Def. Esp. (Sabrina)'],
            ['tm38', 'TM38 (Fire Blast)', 'tm', 0, 'Uma explosão de fogo poderosa. (Blaine)'],
            ['tm26', 'TM26 (Earthquake)', 'tm', 0, 'Um terremoto devastador. (Giovanni)'],
            
            // --- TMs PREMIUM (Loja Rotativa) ---
            ['tm01', 'TM01 (Focus Punch)', 'tm', 10000, 'Soco devastador, mas precisa carregar.'],
            ['tm02', 'TM02 (Dragon Claw)', 'tm', 15000, 'Garra de dragão que retalha o inimigo.'],
            ['tm13', 'TM13 (Ice Beam)', 'tm', 20000, 'Raio de gelo com chance de congelar.'],
            ['tm14', 'TM14 (Blizzard)', 'tm', 20000, 'Nevasca poderosa, mas com baixa precisão.'],
            ['tm15', 'TM15 (Hyper Beam)', 'tm', 15000, 'Disparo poderoso, mas precisa descansar.'],
            ['tm22', 'TM22 (Solar Beam)', 'tm', 10000, 'Absorve luz no 1º turno e ataca no 2º.'],
            ['tm24', 'TM24 (Thunderbolt)', 'tm', 20000, 'Raio elétrico forte e preciso.'],
            ['tm25', 'TM25 (Thunder)', 'tm', 15000, 'Trovão devastador, mas com baixa precisão.'],
            ['tm29', 'TM29 (Psychic)', 'tm', 20000, 'Poder telecinético intenso.'],
            ['tm30', 'TM30 (Shadow Ball)', 'tm', 20000, 'Esfera de sombras que pode baixar a Def. Esp.'],
            ['tm31', 'TM31 (Brick Break)', 'tm', 7500, 'Quebra barreiras como Reflect e Light Screen.'],
            ['tm35', 'TM35 (Flamethrower)', 'tm', 20000, 'Lança-chamas forte e preciso.'],
            ['tm36', 'TM36 (Sludge Bomb)', 'tm', 17500, 'Bomba de lodo que pode envenenar.'],
            ['tm40', 'TM40 (Aerial Ace)', 'tm', 10000, 'Ataque aéreo super rápido que nunca erra.'],
            ['tm42', 'TM42 (Facade)', 'tm', 10000, 'Dobra o dano se estiver queimado/paralisado.'],
            ['tm44', 'TM44 (Rest)', 'tm', 10000, 'Dorme para recuperar toda a vida.'],
            ['tm47', 'TM47 (Steel Wing)', 'tm', 15000, 'Asas de aço que podem aumentar a Defesa.']
            
            // --- HMs ---
            ['hm01', 'HM01 (Cut)', 'hm', 0, 'Corta árvores pequenas.'],
            ['hm02', 'HM02 (Fly)', 'hm', 0, 'Voa para cidades visitadas.']
        ];
        
        for (const item of defaultItems) {
            await this.db.run(`INSERT OR IGNORE INTO items (id, name, type, price, description) VALUES (?, ?, ?, ?, ?)`, item);
        }

        const evCols = ['ev_hp', 'ev_atk', 'ev_def', 'ev_spa', 'ev_spd', 'ev_spe'];
        for (const col of evCols) {
            try {
                await this.db.exec(`ALTER TABLE user_pokemons ADD COLUMN ${col} INTEGER DEFAULT 0;`);
                console.log(`✅ Coluna '${col}' adicionada com sucesso!`);
            } catch (e) {
            }
        }

        const leaderTMs = ['tm39', 'tm03', 'tm34', 'tm19', 'tm06', 'tm04', 'tm38', 'tm26'];
        const placeholders = leaderTMs.map(() => '?').join(',');
        await this.db.run(`UPDATE items SET price = 0 WHERE id IN (${placeholders})`, leaderTMs);

        try {
            const users = await this.db.all("SELECT id_usuario, pokeballs, potions FROM usuarios WHERE pokeballs > 0 OR potions > 0");
            
            if (users.length > 0) {
                console.log(`📦 ENCONTRADOS ${users.length} USUÁRIOS PARA MIGRAR.`);
                for (const u of users) {
                    if (u.pokeballs > 0) await this.addItem(u.id_usuario, 'pokeball', u.pokeballs);
                    if (u.potions > 0) await this.addItem(u.id_usuario, 'potion', u.potions);

                    await this.db.run("UPDATE usuarios SET pokeballs = 0, potions = 0 WHERE id_usuario = ?", [u.id_usuario]);
                }
                console.log("✅ Migração de itens concluída com sucesso!");
            }
        } catch (e) {
            console.error("❌ ERRO CRÍTICO NA MIGRAÇÃO:", e);
        }

        try {
            await this.db.exec(`ALTER TABLE user_pokemons ADD COLUMN status TEXT DEFAULT NULL;`);
            console.log(`✅ Coluna 'status' adicionada com sucesso!`);
        } catch (e) { }

        // 3. VERIFICAÇÕES DE BANCO DE DADOS (Pokedéx, Moves, etc)
        const pokeCount = await this.db.get('SELECT COUNT(*) as total FROM pokedex');
        const moveCount = await this.db.get('SELECT COUNT(*) as total FROM moves');
        const pokeMoves = await this.db.get('SELECT COUNT(*) as total FROM pokemon_moves');

        if (pokeCount.total < 152 || moveCount.total < 50 || pokeMoves.total < 50) {
            console.log(`⚠️ Banco de dados incompleto. Moves: ${moveCount.total}, Pokemon Moves: ${pokeMoves.total}.`);
            console.log("⬇️ Iniciando download da PokéAPI (Versão Emerald)...");
            await this.seedDatabase();
        } else {
            console.log(`✅ Pokédex carregada: ${pokeCount.total} Pokémon e ${moveCount.total} Golpes.`);
        }
        await this.fixNullPP();
    }

    async getDailyShopItems() {
        const today = new Date().toLocaleDateString('pt-BR');

        if (this.dailyShopCache.date === today && this.dailyShopCache.items.length > 0) {
            return this.dailyShopCache.items;
        }

        const allTMs = await this.db.all("SELECT * FROM items WHERE type = 'tm' AND price > 0");
        
        for (let i = allTMs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTMs[i], allTMs[j]] = [allTMs[j], allTMs[i]];
        }

        const selectedTMs = allTMs.slice(0, 10);

        this.dailyShopCache = {
            date: today,
            items: selectedTMs
        };

        return selectedTMs;
    }

    async cleanDatabaseDuplicates() {
        console.log("🧹 Iniciando limpeza de dados duplicados...");
        
        await this.db.run(`
            DELETE FROM pokemon_moves 
            WHERE rowid NOT IN (
                SELECT MIN(rowid) 
                FROM pokemon_moves 
                GROUP BY pokemon_id, move_id, level_learned
            )
        `);
        
        console.log("✅ Tabela pokemon_moves limpa!");

        const allPokes = await this.db.all("SELECT id, pokedex_id, level, nickname FROM user_pokemons");
        let count = 0;

        for (const poke of allPokes) {
            const validMoves = await this.getMovesForLevel(poke.pokedex_id, poke.level);
            
            const uniqueIds = [...new Set(validMoves.map(m => m.id))];
            
            const m1 = uniqueIds[0] || null;
            const m2 = uniqueIds[1] || null;
            const m3 = uniqueIds[2] || null;
            const m4 = uniqueIds[3] || null;

            await this.db.run(
                `UPDATE user_pokemons SET move1=?, move2=?, move3=?, move4=? WHERE id=?`,
                [m1, m2, m3, m4, poke.id]
            );
            count++;
        }

        return `✅ Limpeza completa!\n- Duplicatas do sistema removidas.\n- ${count} Pokémon atualizados com os golpes certos.`;
    }

    // Calcula o XP necessário para um determinado nível (Curva Medium Fast - Gen 3)
    computeXp(level) {
        return Math.pow(level, 3);
    }

    //Retorna o multiplicador da Natureza (1.1, 0.9 ou 1.0)
    getNatureModifier(natureKey, statName) {
        if (statName === 'hp') return 1.0;
        
        const nature = NATURES[natureKey?.toLowerCase()] || NATURES['hardy'];
        
        if (nature.up === statName) return 1.1;
        if (nature.down === statName) return 0.9;
        return 1.0;
    }

    async gainEVs(userPoke, enemyDex) {
        const stats = {
            'ev_hp': enemyDex.base_hp,
            'ev_atk': enemyDex.base_atk,
            'ev_def': enemyDex.base_def,
            'ev_spa': enemyDex.base_spa,
            'ev_spd': enemyDex.base_spd,
            'ev_spe': enemyDex.base_spe
        };
        
        const bestStat = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);
        
        const currentTotal = (userPoke.ev_hp||0) + (userPoke.ev_atk||0) + (userPoke.ev_def||0) + 
                            (userPoke.ev_spa||0) + (userPoke.ev_spd||0) + (userPoke.ev_spe||0);
        
        const statNameMap = {
            'ev_hp': 'HP', 'ev_atk': 'Ataque', 'ev_def': 'Defesa',
            'ev_spa': 'Atq. Esp.', 'ev_spd': 'Def. Esp.', 'ev_spe': 'Velocidade'
        };

        const MAX_TOTAL = 512;
        const MAX_STAT = 256;
        const GAIN_AMOUNT = 2;

        // Validações
        if (currentTotal >= MAX_TOTAL) return "";
        
        let currentStatVal = userPoke[bestStat] || 0;
        if (currentStatVal >= MAX_STAT) return "";

        // Calcula quanto pode ganhar sem estourar os limites
        let amountToAdd = GAIN_AMOUNT;
        
        if (currentStatVal + amountToAdd > MAX_STAT) {
            amountToAdd = MAX_STAT - currentStatVal;
        }
        if (currentTotal + amountToAdd > MAX_TOTAL) {
            amountToAdd = MAX_TOTAL - currentTotal;
        }

        if (amountToAdd <= 0) return "";

        // Atualiza no Banco
        await this.db.run(`UPDATE user_pokemons SET ${bestStat} = ${bestStat} + ? WHERE id = ?`, [amountToAdd, userPoke.id]);

        // Atualiza o objeto local para cálculos futuros imediatos
        userPoke[bestStat] += amountToAdd;
    }

    // Calcula o valor final de um status
    computeStat(base, iv, ev, level, nature, statName) {
        const ivVal = iv || 0;
        const evVal = ev || 0;
        
        const evBonus = Math.floor(evVal / 4);

        if (statName === 'hp') {
            if (base === 1) return 1; // Caso especial para Shedinja
            return Math.floor(((2 * base + ivVal + evBonus + 100) * level) / 100 + 10);
        } else {
            const rawStat = Math.floor(((2 * base + ivVal + evBonus) * level) / 100 + 5);
            const multiplier = this.getNatureModifier(nature, statName);
            return Math.floor(rawStat * multiplier);
        }
    }

    // Gera um objeto completo com todos os stats calculados
    generateStats(pkBase, ivs, level, nature) {
        return {
            hp: this.computeStat(pkBase.base_hp, ivs.hp, 0, level, nature, 'hp'),
            atk: this.computeStat(pkBase.base_atk, ivs.atk, 0, level, nature, 'atk'),
            def: this.computeStat(pkBase.base_def, ivs.def, 0, level, nature, 'def'),
            spa: this.computeStat(pkBase.base_spa, ivs.spa, 0, level, nature, 'spa'),
            spd: this.computeStat(pkBase.base_spd, ivs.spd, 0, level, nature, 'spd'),
            spe: this.computeStat(pkBase.base_spe, ivs.spe, 0, level, nature, 'spe'),
        };
    }

    // Gera IVs aleatórios (0-31)
    generateRandomIVs() {
        const rand = () => Math.floor(Math.random() * 32);
        return { hp: rand(), atk: rand(), def: rand(), spa: rand(), spd: rand(), spe: rand() };
    }

    // Verifica se o usuário já resgatou um código específico
    async hasClaimed(userId, eventCode) {
        const user = await this.db.get("SELECT claimed_events FROM usuarios WHERE id_usuario = ?", [userId]);
        if (!user || !user.claimed_events) return false;
        try {
            const list = JSON.parse(user.claimed_events);
            return Array.isArray(list) && list.includes(eventCode);
        } catch (e) { return false; }
    }

    // Marca um código como resgatado
    async markAsClaimed(userId, eventCode) {
        const user = await this.db.get("SELECT claimed_events FROM usuarios WHERE id_usuario = ?", [userId]);
        let list = [];
        if (user && user.claimed_events) {
            try { list = JSON.parse(user.claimed_events); } catch (e) {}
        }
        if (!Array.isArray(list)) list = [];
        
        if (!list.includes(eventCode)) {
            list.push(eventCode);
            await this.db.run("UPDATE usuarios SET claimed_events = ? WHERE id_usuario = ?", [JSON.stringify(list), userId]);
        }
    }

    /**
     * @param {string} userId - Quem recebe
     * @param {string} type - 'pokemon', 'coin', 'item', 'xp'
     * @param {string|number} value - ID do pokemon, nome do item ou quantidade de coins
     * @param {number} amount - Quantidade (ou nível do pokemon)
     */
    async giveReward(userId, type, value, amount = 1) {
        const tag = await this.getUserTag(userId);
        type = type.toLowerCase();

        // --- TIPO: POKÉMON ---
        if (type === 'pokemon' || type === 'poke') {
            let pokeId = parseInt(value);
            
            if (isNaN(pokeId)) {
                const pkSearch = await this.db.get("SELECT id FROM pokedex WHERE name LIKE ?", [`%${value}%`]);
                if (!pkSearch) return `${tag}❌ Pokémon *${value}* não encontrado no banco.`;
                pokeId = pkSearch.id;
            }

            const pk = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [pokeId]);
            if (!pk) return `${tag}❌ ID ${pokeId} inválido.`;

            // Configuração do Pokémon novo
            let level = 5;
            if (amount > 1) {
                level = amount;
            } 
            else {
                const stats = await this.db.get("SELECT AVG(level) as media FROM user_pokemons WHERE user_id = ?", [userId]);
                const avg = stats?.media || 5;
                level = Math.max(5, Math.floor(avg));
            }
            const moves = await this.getMovesForLevel(pk.id, level);
            const randIv = () => Math.floor(Math.random() * 32);
            const hpIv = randIv();
            const hp = Math.floor(((2 * pk.base_hp + hpIv + 100) * level) / 100 + 10);
            const initialXp = this.computeXp(level);
            const nature = this.getRandomNature();

            const m1 = moves[0]?.id || null;
            const m2 = moves[1]?.id || null;
            const m3 = moves[2]?.id || null;
            const m4 = moves[3]?.id || null;

            const pp1 = moves[0]?.pp || null;
            const pp2 = moves[1]?.pp || null;
            const pp3 = moves[2]?.pp || null;
            const pp4 = moves[3]?.pp || null;

            const slots = await this.db.all("SELECT team_slot FROM user_pokemons WHERE user_id = ? ORDER BY team_slot ASC", [userId]);
            const occupied = slots.map(s => s.team_slot);
            let targetSlot = 1;
            while (occupied.includes(targetSlot)) targetSlot++;

            await this.db.run(`INSERT INTO user_pokemons 
                (user_id, pokedex_id, nickname, level, exp, current_hp, max_hp, move1, move2, move3, move4, move1_pp, move2_pp, move3_pp, move4_pp, obtained_at, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, team_slot, nature) 
                VALUES (?,?,?,?, ?,?,?, ?,?,?,?, ?,?,?,?, ?, ?,?,?,?,?,?, ?, ?)`, // <--- Agora tem 24 '?'
                [
                    userId, pk.id, pk.name, level, initialXp, hp, hp, 
                    m1, m2, m3, m4, 
                    pp1, pp2, pp3, pp4,
                    Date.now(), hpIv, randIv(), randIv(), randIv(), randIv(), randIv(), targetSlot, nature
                ]
            );

            let dest = targetSlot > 6 ? `Box ${targetSlot - 6} do PC` : "Time Principal";
            return `${tag}🎁 **RECOMPENSA RECEBIDA!**\nVocê ganhou um *${pk.name}* (Lvl ${level})!\n📦 Destino: ${dest}`;
        }

        // --- TIPO: DINHEIRO ---
        if (type === 'coin' || type === 'coins' || type === 'dinheiro') {
            const qtd = parseInt(value) || 1000;
            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [qtd, userId]);
            return `${tag}💰 **DINHEIRO NA CONTA!**\nRecebeu ${qtd} Pokécoins.`;
        }

        // --- TIPO: ITEM ---
        if (type === 'item') {
            const itemType = value.toLowerCase();
            const qtd = amount || 1;
            
            if (itemType.includes('ball') || itemType === 'bola') {                
                await this.addItem(userId, 'potion', qtd);
                return `${tag}🔴 **REFORÇO!**\nRecebeu ${qtd} Pokébolas.`;
            }
            if (itemType.includes('potion') || itemType === 'pocao') {
                await this.addItem(userId, 'potion', qtd);
                return `${tag}🧪 **REFORÇO!**\nRecebeu ${qtd} Poções.`;
            }
            return `${tag}❌ Item desconhecido. Use 'bola' ou 'pocao'.`;
        }

        // --- TIPO: XP  ---
        if (type === 'xp') {
            const qtd = parseInt(value);
            const lead = await this.db.get("SELECT * FROM user_pokemons WHERE user_id = ? AND team_slot = 1", [userId]);
            if (!lead) return `${tag}❌ Você precisa de um Pokémon no slot 1.`;
            
            let currentExp = lead.exp + qtd;
            await this.db.run("UPDATE user_pokemons SET exp = exp + ? WHERE id = ?", [currentExp, lead.id]);
            return `${tag}🆙 *${lead.nickname}* ganhou ${qtd} XP mágico do Admin! (O nível atualizará na próxima batalha).`;
        }

        return `${tag}❌ Tipo de recompensa inválido. Use: pokemon, coin, item`;
    }

    async claimSpecialGift(userId, codeParam, extraArg = '') {
        const tag = await this.getUserTag(userId);
        
        const eventCode = codeParam ? codeParam.toLowerCase().trim() : 'grc01';
        const event = EVENTS_DB[eventCode];

        // Validações do Código
        if (!event) {
            return `${tag}❌ Código de evento *"${eventCode}"* inválido ou inexistente.`;
        }
        if (!event.active) {
            return `${tag}🚫 O evento *${event.name}* expirou ou está inativo.`;
        }

        // Verifica se já pegou (usando a coluna JSON claimed_events)
        if (await this.hasClaimed(userId, eventCode)) {
            return `${tag}🎁 Você já resgatou: *${event.name}*!\nDeixe um pouco para os outros.`;
        }

        // Verifica pré-requisitos (Tem que ter pokémon pra ganhar item/coin)
        const hasPoke = await this.checkIfUserHasPokemon(userId);
        if (!hasPoke) return `${tag}🚫 Você precisa começar sua jornada primeiro (*!poke comecar*) para resgatar códigos!`;

        // Entrega a Recompensa
        let log = "";
        
        if (event.type === 'item') {
            await this.addItem(userId, event.reward_id, event.amount);
            log = `Você recebeu **${event.amount}x ${(await this.getItemName(event.reward_id))}**!`;
        } 
        else if (event.type === 'coin') {
            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [event.amount, userId]);
            log = `Você recebeu **${event.amount} Pokécoins**!`;
        }
        else if (event.type === 'pokemon') {
            await this.giveReward(userId, 'pokemon', event.reward_id, event.amount); 
            log = `Você recebeu um novo Pokémon!`;
        }
        else if (event.type === 'custom') {
            if (eventCode === 'vet01') {
                return await this.claimVeteranReward(userId, extraArg);
            }
            return `${tag}⚠️ Código customizado sem função vinculada.`;
        }

        // Marca como resgatado no JSON
        await this.markAsClaimed(userId, eventCode);

        return `${tag}🎁 **CÓDIGO RESGATADO: ${eventCode.toUpperCase()}**\n` +
               `🎉 *${event.name}*\n\n` +
               `${log}\n` +
               `_${event.msg}_`;
    }

    async getItemName(itemId) {
        const item = await this.db.get("SELECT name FROM items WHERE id = ?", [itemId]);
        return item ? item.name : itemId;
    }

    async claimVeteranReward(userId, choice) {
        const tag = await this.getUserTag(userId);
        const eventCode = 'vet01';

        // Verifica Elegibilidade (Lógica exclusiva deste evento)
        const veteranPoke = await this.db.get(
            "SELECT id FROM user_pokemons WHERE user_id = ? AND obtained_at < ? LIMIT 1", 
            [userId, REWARD_CUTOFF]
        );

        if (!veteranPoke) {
            return `${tag}🚫 *Evento Exclusivo*\nO código *VET01* é reservado para treinadores veteranos (antigos).`;
        }

        // Mapa de Escolhas
        const starterMap = {
            1: { id: 1,   name: "Bulbasaur (Grama)" },
            2: { id: 4,   name: "Charmander (Fogo)" },
            3: { id: 7,   name: "Squirtle (Água)" },
            4: { id: 152, name: "Chikorita (Grama)" },
            5: { id: 155, name: "Cyndaquil (Fogo)" },
            6: { id: 158, name: "Totodile (Água)" },
            7: { id: 252, name: "Treecko (Grama)" },
            8: { id: 255, name: "Torchic (Fogo)" },
            9: { id: 258, name: "Mudkip (Água)" }
        };

        const selection = parseInt(choice);

        // Se não escolheu ou escolheu errado -> Retorna o Menu
        if (!choice || isNaN(selection) || !starterMap[selection]) {
            return `${tag}🎁 *RECOMPENSA DE VETERANO* 🎁\n\n` +
                   `Obrigado por jogar! Escolha um segundo inicial:\n\n` +
                   `*Kanto:* 1.Bulbasaur 🍃 | 2.Charmander 🔥 | 3.Squirtle 💧\n` +
                   `*Johto:* 4.Chikorita 🍃 | 5.Cyndaquil 🔥 | 6.Totodile 💧\n` +
                   `*Hoenn:* 7.Treecko 🍃 | 8.Torchic 🔥 | 9.Mudkip 💧\n\n` +
                   `Para escolher, digite:\n` +
                   `👉 *!poke presente vet01 [numero]*\n` +
                   `_Exemplo: !poke presente vet01 2_`;
        }

        const selectedStarter = starterMap[selection];
        const rewardMsg = await this.giveReward(userId, 'pokemon', selectedStarter.id);
        
        // IMPORTANTE: Marca como resgatado aqui, pois só agora o processo terminou com sucesso
        await this.markAsClaimed(userId, eventCode);
        
        return `${tag}🎉 *PARABÉNS VETERANO!* 🎉\nVocê escolheu: **${selectedStarter.name}**\n\n${rewardMsg}`;
    }

    getGymRewardTM(badgeIndex) {
        const rewards = [
            'tm39', // 0: Brock (Rock Tomb)
            'tm03', // 1: Misty (Water Pulse)
            'tm34', // 2: Surge (Shock Wave)
            'tm19', // 3: Erika (Giga Drain)
            'tm06', // 4: Koga (Toxic)
            'tm04', // 5: Sabrina (Calm Mind)
            'tm38', // 6: Blaine (Fire Blast)
            'tm26'  // 7: Giovanni (Earthquake)
        ];
        return rewards[badgeIndex] || null;
    }

    async giveRetroactiveGymTMs() {
        console.log("🔄 Iniciando distribuição retroativa de TMs...");
        const users = await this.db.all("SELECT id_usuario, badges FROM usuarios WHERE badges > 0");
        let count = 0;

        for (const user of users) {
            let given = 0;
            for (let i = 0; i < user.badges; i++) {
                const tmId = this.getGymRewardTM(i);
                if (tmId) {
                    const hasItem = await this.getItemCount(user.id_usuario, tmId);
                    if (hasItem === 0) {
                        await this.addItem(user.id_usuario, tmId, 1);
                        given++;
                    }
                }
            }
            if (given > 0) {
                console.log(`🎁 ${user.id_usuario} recebeu ${given} TMs retroativos.`);
                count++;
            }
        }
        return `✅ Distribuição completa! ${count} usuários receberam seus TMs esquecidos.`;
    }

    async fixNullPP() {
        const pokes = await this.db.all("SELECT id, move1, move2, move3, move4 FROM user_pokemons WHERE move1_pp IS NULL AND move1 IS NOT NULL");
        if (pokes.length === 0) return;

        console.log(`🔧 Ajustando PP de ${pokes.length} Pokémon antigos...`);
        
        for (const p of pokes) {
            const moves = [p.move1, p.move2, p.move3, p.move4];
            const pps = [];
            
            for (const mid of moves) {
                if (!mid) {
                    pps.push(null);
                    continue;
                }
                const mData = await this.db.get("SELECT pp FROM moves WHERE id = ?", [mid]);
                pps.push(mData ? mData.pp : 0);
            }

            await this.db.run(
                `UPDATE user_pokemons SET move1_pp=?, move2_pp=?, move3_pp=?, move4_pp=? WHERE id=?`, 
                [pps[0], pps[1], pps[2], pps[3], p.id]
            );
        }
        console.log("✅ PPs corrigidos!");
    }

    async fixNullMoves() {
        console.log("🔧 Iniciando reparo de moveset dos Pokémon...");
        
        const buggedPokemons = await this.db.all("SELECT id, pokedex_id, level, nickname FROM user_pokemons WHERE move1 IS NULL OR move1 = ''");

        if (buggedPokemons.length === 0) {
            return "✅ Todos os Pokémon já estão com golpes!";
        }

        console.log(`🔧 Encontrados ${buggedPokemons.length} Pokémon sem golpes. Corrigindo...`);
        let count = 0;

        const tackle = await this.db.get("SELECT id FROM moves WHERE name = 'tackle' OR name = 'investida' LIMIT 1");
        const tackleId = tackle ? tackle.id : null;

        for (const poke of buggedPokemons) {
            let moves = await this.getMovesForLevel(poke.pokedex_id, poke.level);

            let m1 = moves[0]?.id || tackleId;
            let m2 = moves[1]?.id || null;
            let m3 = moves[2]?.id || null;
            let m4 = moves[3]?.id || null;

            if (!m1) {
                console.log(`⚠️ Não foi possível achar golpe para ${poke.nickname} (ID: ${poke.id})`);
                continue;
            }

            await this.db.run(
                `UPDATE user_pokemons SET move1 = ?, move2 = ?, move3 = ?, move4 = ? WHERE id = ?`,
                [m1, m2, m3, m4, poke.id]
            );
            count++;
        }

        console.log(`✅ Reparo concluído! ${count} Pokémon atualizados.`);
        return `✅ Correção finalizada! ${count} Pokémon receberam golpes novos.`;
    }

    async fixZeroXp() {
        console.log("🔧 Corrigindo XP inicial dos Pokémon...");
        
        const pokemons = await this.db.all("SELECT id, level, exp, nickname FROM user_pokemons");
        let count = 0;

        for (const p of pokemons) {
            const minXp = this.computeXp(p.level);
            
            if (p.exp < minXp) {
                await this.db.run("UPDATE user_pokemons SET exp = ? WHERE id = ?", [minXp, p.id]);
                count++;
            }
        }
        console.log(`✅ XP Corrigido! ${count} Pokémon atualizados.`);
        return `✅ Ajuste de XP concluído! ${count} Pokémon deixaram de ser "café com leite".`;
    }

    async fixNullIvs() {
        const brokenPokes = await this.db.all("SELECT id FROM user_pokemons WHERE iv_hp IS NULL");
        
        for (const poke of brokenPokes) {
            
            const randIv = () => Math.floor(Math.random() * 32);

            await this.db.run(`UPDATE user_pokemons SET iv_hp=?, iv_atk=?, iv_def=?, iv_spa=?, iv_spd=?, iv_spe=? WHERE id = ?`, [randIv(), randIv(), randIv(), randIv(), randIv(), randIv(), poke.id]);
        }
        return `✅ IVs corrigidos para ${brokenPokes.length} Pokémon.`;
    }

    async fixNullHp() {
        const bugados = await this.db.all("SELECT up.id, up.level, up.iv_hp, dex.base_hp FROM user_pokemons up JOIN pokedex dex ON up.pokedex_id = dex.id WHERE up.max_hp IS NULL");
        for(const b of bugados){
            const newHp = this.computeStat(userPoke.base_hp, userPoke.iv_hp, userPoke.ev_hp || 0, lvl, userPoke.nature, 'hp');
            await this.db.run("UPDATE user_pokemons SET max_hp = ?, current_hp = ? WHERE id = ?", [newHp, newHp, b.id]);
        }
        return `🔧 ${bugados.length} Pokémon consertados.`;
    }

    async seedDatabase() {
        const downloadedMoves = new Set();
        console.log(`⬇️ Iniciando Seed Gen 1-3 (Até ${POKEMON_COUNT})...`);
        
        for (let i = 1; i <= POKEMON_COUNT; i++) {
            try {
                const pk = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)).data;
                const sp = (await axios.get(pk.species.url)).data;

                let evolveTo = null;
                let evolveLevel = null;

                try {
                    const evoChain = (await axios.get(sp.evolution_chain.url)).data.chain;
                    const findNode = (node, name) => {
                        if (node.species.name === name) return node;
                        for (const child of node.evolves_to) {
                            const found = findNode(child, name);
                            if (found) return found;
                        }
                        return null;
                    };
                    const currentNode = findNode(evoChain, pk.name);
                    if (currentNode && currentNode.evolves_to.length > 0) {
                        for (const nextEvo of currentNode.evolves_to) {
                            const details = nextEvo.evolution_details.find(d => d.trigger.name === 'level-up');
                            if (details) {
                                const urlParts = nextEvo.species.url.split('/');
                                evolveTo = parseInt(urlParts[urlParts.length - 2]);
                                evolveLevel = details.min_level;
                                break; 
                            }
                        }
                    }
                } catch (err) {}

                let rarity = (sp.is_legendary || sp.is_mythical) ? 'rare' : 'common';
                let tier = (sp.evolves_from_species === null) ? 1 : 2; 
                if (sp.evolves_from_species && (await axios.get(sp.evolves_from_species.url)).data.evolves_from_species) tier = 3;

                const stats = {};
                pk.stats.forEach(s => stats[s.stat.name] = s.base_stat);

                await this.db.run(
                    `INSERT OR IGNORE INTO pokedex 
                    (id, name, type1, type2, base_hp, base_atk, base_def, base_spa, base_spd, base_spe, rarity, tier, is_starter, sprite_url, base_xp, evolve_to, evolve_level)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        pk.id, pk.name, pk.types[0]?.type.name, pk.types[1]?.type.name || null,
                        stats['hp'], stats['attack'], stats['defense'], stats['special-attack'], stats['special-defense'], stats['speed'],
                        rarity, tier, STARTER_IDS.includes(pk.id), pk.sprites.front_default, pk.base_experience,
                        evolveTo, evolveLevel
                    ]
                );
                
                await this.db.run(`UPDATE pokedex SET evolve_to = ?, evolve_level = ? WHERE id = ?`, [evolveTo, evolveLevel, pk.id]);

                const validMoves = pk.moves.filter(m => 
                    m.version_group_details.some(v => (v.version_group.name === GAME_VERSION || v.version_group.name === 'firered-leafgreen') && v.move_learn_method.name === 'level-up')
                );

                for (const m of validMoves) {
                    const moveName = m.move.name;
                    let versionDetail = m.version_group_details.find(v => v.version_group.name === GAME_VERSION);
                    if (!versionDetail) versionDetail = m.version_group_details.find(v => v.version_group.name === 'firered-leafgreen');
                    
                    const level = versionDetail ? versionDetail.level_learned_at : 1;
                    
                    let moveId;
                    const existingMove = await this.db.get("SELECT id FROM moves WHERE name = ?", [moveName]);

                    if (existingMove) {
                        moveId = existingMove.id;
                    } else if (!downloadedMoves.has(moveName)) {
                        const moveData = (await axios.get(m.move.url)).data;
                        if (moveData.power || moveData.meta?.category?.name) {
                            await this.db.run(`INSERT OR IGNORE INTO moves (id, name, type, power, accuracy, pp, damage_class) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [moveData.id, moveData.name, moveData.type.name, moveData.power || 0, moveData.accuracy || 100, moveData.pp, moveData.damage_class.name]);
                            moveId = moveData.id;
                            downloadedMoves.add(moveName);
                        }
                    }

                    if (moveId) {
                        await this.db.run(`INSERT OR IGNORE INTO pokemon_moves (pokemon_id, move_id, level_learned) VALUES (?, ?, ?)`, [pk.id, moveId, level]);
                    }
                }
                
                if (i % 10 === 0) console.log(`[SEED] Progresso: ${i}/${POKEMON_COUNT}...`);
            } catch (e) {
                console.error(`Erro ID ${i}:`, e.message);
            }
        }
        console.log("✅ Seed Completo (Gen 1, 2 e 3)!");
    }

    async checkStatusBeforeMove(battleState, isPlayer, pokeObj, sock, groupId) {
        const targetKey = isPlayer ? 'user' : 'enemy';
        const status = battleState[targetKey + 'Status']; 
        const counters = battleState.counters[targetKey];
        let canMove = true;
        let selfDamage = false;
        let log = "";

        // --- EFEITO DO UPROAR ---
        if (battleState.field.uproar > 0) {
            if (status === 'slp') {
                status = null;
                battleState[targetKey + 'Status'] = null;
                log += `📢 *${pokeName}* acordou por causa do barulho (Uproar)!\n`;
            }
        }

        // --- SONO (SLEEP) ---
        if (status === 'slp') {
            if (counters.sleep > 0) {
                counters.sleep--;
                return { canMove: false, log: `😴 *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* está dormindo!` };
            } else {
                battleState[targetKey + 'Status'] = null;
                
                if (isPlayer) {
                     await this.db.run("UPDATE user_pokemons SET status = NULL WHERE id = ?", [pokeObj.id]);
                }
                
                log += `⏰ *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* acordou!\n`;
            }
        }

        // --- CONGELAMENTO (FREEZE) ---
        if (status === 'frz') {
            if (Math.random() < 0.3) {
                battleState[targetKey + 'Status'] = null;

                if (isPlayer) {
                     await this.db.run("UPDATE user_pokemons SET status = NULL WHERE id = ?", [pokeObj.id]);
                }

                log += `🔥 *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* descongelou!\n`;
            } else {
                return { canMove: false, log: `🧊 *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* está congelado!` };
            }
        }

        // --- CONFUSÃO (CONFUSION) - Status Volátil ---
        if (counters.confusion > 0) {
            counters.confusion--;
            log += `🌀 *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* está confuso...\n`;
            if (Math.random() < 0.33) {
                return { canMove: false, log: log + `😵 E machucou a si mesmo na confusão!`, selfDamage: true };
            }
            if (counters.confusion === 0) log += `✨ *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* saiu da confusão!\n`;
        }

        // --- PARALISIA (PARALYSIS) ---
        if (status === 'par') {
            if (Math.random() < 0.25) {
                return { canMove: false, log: `⚡ *${isPlayer ? pokeObj.nickname : pokeObj.pokemon.name}* está paralisado e não consegue se mover!` };
            }
        }

        return { canMove: true, log: log , selfDamage};
    }

    // Verifica se o usuário tem pelo menos 1 Pokémon
    async checkIfUserHasPokemon(userId) {
        const result = await this.db.get("SELECT count(*) as total FROM user_pokemons WHERE user_id = ?", [userId]);
        return result && result.total > 0;
    }

    async helpPoke(userId, param) {
        const tag = await this.getUserTag(userId);
        const topic = param ? param.trim().toLowerCase() : 'default';

        // Aliases para facilitar
        const aliases = {
            'catch': 'capturar',
            'buy': 'loja',
            'shop': 'loja',
            'comprar': 'loja',
            'heal': 'curar',
            'team': 'time',
            'profile': 'perfil',
            'hunt': 'explorar',
            'attack': 'atacar',
            'moves': 'atacar',
            'box': 'pc',
            'storage': 'pc',
            'switch': 'trocar',
            'evolve': 'evoluir',
            'gym': 'ginasio',
            'info': 'mostrar',
            'stats': 'mostrar'
        };

        const key = aliases[topic] || topic;

        if (POKE_HELP[key]) {
            return `${tag}${POKE_HELP[key]}`;
        } else {
            return `${tag}❌ Tópico de ajuda não encontrado.\nDigite *!poke ajuda* para ver a lista.`;
        }
    }

    // Calcula velocidade considerando Estágios e Paralisia
    getBattleSpeed(pokeObj, battleState, isPlayer, level) {
        const key = isPlayer ? 'user' : 'enemy';
        const stage = battleState.stages[key].spe || 0;
        
        let rawSpeed;

        if (isPlayer) {
            rawSpeed = this.computeStat(
                pokeObj.base_spe, 
                pokeObj.iv_spe, 
                pokeObj.ev_spe || 0,
                level, 
                pokeObj.nature, 
                'spe'
            );
        } else {
            const baseSpe = pokeObj.base_spe;
            rawSpeed = Math.floor(((2 * baseSpe + 15) * level) / 100 + 5);
        }

        const multiplier = stage >= 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
        let finalSpeed = Math.floor(rawSpeed * multiplier);

        const status = battleState[key + 'Status'];
        if (status === 'par') {
            finalSpeed = Math.floor(finalSpeed * 0.50);
        }

        return finalSpeed;
    }

    async executeMove(attacker, defender, move, battleState, isPlayer, userId, encounter) {
        let log = "";

        const userPoke = await this.db.get(`SELECT up.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe FROM user_pokemons up JOIN pokedex p ON up.pokedex_id = p.id WHERE up.id = ? AND up.user_id = ?`, [encounter.activePokemonId, userId]);
        
        // CHECAGEM DE STATUS (Paralisia, Sono, etc)
        const statusCheck = await this.checkStatusBeforeMove(battleState, isPlayer, isPlayer ? userPoke : encounter, null, null);
        if (statusCheck.log) log += `\n${statusCheck.log}`;
        
        if (statusCheck.selfDamage) {
            const selfDmg = Math.floor(attacker.max_hp * 0.15);
            attacker.current_hp -= selfDmg;
            
            if (isPlayer) await this.db.run("UPDATE user_pokemons SET current_hp = ? WHERE id = ?", [attacker.current_hp, attacker.id]);
            else await this.db.run("UPDATE active_encounters SET current_hp = ? WHERE user_id = ?", [attacker.current_hp, userId]);

            log += ` (Sofreu ${selfDmg} de dano)`;
        }

        if (!statusCheck.canMove) return { log, damageDealt: 0 };

        // CHECAGEM DE PRECISÃO
        let moveAcc = move.accuracy === null ? 100 : move.accuracy;
        const alwaysHitMoves = ['swift', 'aerial-ace', 'faint-attack', 'magical-leaf', 'shock-wave', 'shadow-punch'];
        
        if (!alwaysHitMoves.includes(move.name) && moveAcc < 999) {
            const userKey = isPlayer ? 'user' : 'enemy';
            const enemyKey = isPlayer ? 'enemy' : 'user';
            
            const accStage = battleState.stages[userKey].acc || 0;
            const evaStage = battleState.stages[enemyKey].eva || 0;
            const combinedStage = Math.max(-6, Math.min(6, accStage - evaStage));
            
            const stageMultipliers = {
                '-6': 0.33, '-5': 0.38, '-4': 0.43, '-3': 0.50, '-2': 0.60, '-1': 0.75,
                '0': 1.0, '1': 1.33, '2': 1.67, '3': 2.0, '4': 2.33, '5': 2.67, '6': 3.0
            };
            
            const hitChance = moveAcc * (stageMultipliers[String(combinedStage)] || 1.0);
            
            if (Math.random() * 100 > hitChance) {
                return { log: log + `\n💨 *${attacker.nickname || attacker.name}* usou ${move.name}, mas errou!`, damageDealt: 0 };
            }
        }

        // GOLPES DE STATUS
        if (move.damage_class === 'status') {
            const playerPoke = isPlayer ? attacker : defender;
            const res = await this.processStatusMove(move.name, battleState, isPlayer, attacker.max_hp, playerPoke);
            log += `\n✨ ${attacker.nickname || attacker.name} ${res.msg}`;

            // CORREÇÃO: Aplicar Auto-Dano (Para o Curse)
            if (res.selfDamage && res.selfDamage > 0) {
                attacker.current_hp -= res.selfDamage;
                if (isPlayer) await this.db.run("UPDATE user_pokemons SET current_hp = ? WHERE id = ?", [attacker.current_hp, attacker.id]);
                else await this.db.run("UPDATE active_encounters SET current_hp = ? WHERE user_id = ?", [attacker.current_hp, userId]);
                
                log += ` (Perdeu ${res.selfDamage} HP)`;
            }
            
            if (res.healAmount > 0) {
                attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + res.healAmount);
                if (isPlayer) await this.db.run("UPDATE user_pokemons SET current_hp = ? WHERE id = ?", [attacker.current_hp, attacker.id]);
                else await this.db.run("UPDATE active_encounters SET current_hp = ? WHERE user_id = ?", [attacker.current_hp, userId]);
            }

            return { log, damageDealt: 0 };
        }

        // PREPARAÇÃO DO PODER (Moves Variáveis)
        let power = move.power;

        if (['flail', 'reversal'].includes(move.name)) {
            const P = Math.floor((48 * attacker.current_hp) / attacker.max_hp);
            if (P <= 1) power = 200;
            else if (P <= 4) power = 150;
            else if (P <= 9) power = 100;
            else if (P <= 16) power = 80;
            else if (P <= 32) power = 40;
            else power = 20;
        }

        if (['eruption', 'water-spout'].includes(move.name)) {
            power = Math.floor((150 * attacker.current_hp) / attacker.max_hp);
            if (power < 1) power = 1;
        }
        
        if (['low-kick', 'grass-knot'].includes(move.name)) {
             power = 60; 
        }

        let mag = 0;
        if (move.name === 'magnitude') {
            const r = Math.random();
            if (r < 0.05)      { mag = 4; power = 10; }
            else if (r < 0.15) { mag = 5; power = 30; }
            else if (r < 0.35) { mag = 6; power = 50; }
            else if (r < 0.65) { mag = 7; power = 70; }
            else if (r < 0.85) { mag = 8; power = 90; }
            else if (r < 0.95) { mag = 9; power = 110; }
            else               { mag = 10; power = 150; }
        }

        // PREPARAÇÃO DE MULTI-HITS
        let hits = 1;
        const multiHit2to5 = ['fury-swipes', 'bullet-seed', 'pin-missile', 'spike-cannon', 'icicle-spear', 'rock-blast', 'arm-thrust', 'bone-rush', 'comet-punch', 'double-slap', 'tail-slap', 'barrage'];
        const multiHitDouble = ['double-kick', 'bonemerang', 'twineedle', 'dual-chop'];

        if (multiHit2to5.includes(move.name)) {
            const r = Math.random();
            if (r < 0.375) hits = 2;
            else if (r < 0.75) hits = 3;
            else if (r < 0.875) hits = 4;
            else hits = 5;
        } 
        else if (multiHitDouble.includes(move.name)) {
            hits = 2;
        }

        // CÁLCULO DE STATS
        const getStat = (poke, statName, isP, lvl) => {
            if (isP) {
                return this.computeStat(
                    poke[`base_${statName}`], 
                    poke[`iv_${statName}`], 
                    poke[`ev_${statName}`] || 0,
                    lvl, 
                    poke.nature, 
                    statName
                );
            }
            // Fórmula padrão para inimigos (NPCs/Selvagens)
            return Math.floor(((2 * poke[`base_${statName}`] + 15) * lvl) / 100 + 5);
        };

        const atkStat = move.damage_class === 'special' ? 'spa' : 'atk';
        const defStat = move.damage_class === 'special' ? 'spd' : 'def';

        const rawAtk = getStat(attacker, atkStat, isPlayer, attacker.level || encounter.level);
        const rawDef = getStat(defender, defStat, !isPlayer, defender.level || encounter.level);

        const userKey = isPlayer ? 'user' : 'enemy';
        const enemyKey = isPlayer ? 'enemy' : 'user';

        const stageAtk = battleState.stages[userKey][atkStat];
        const stageDef = battleState.stages[enemyKey][defStat];

        const finalAtk = this.applyStages(rawAtk, stageAtk);
        const finalDef = this.applyStages(rawDef, stageDef);

        // Helper de Tipo
        const getTypeMultiplier = (moveType, t1, t2) => {
            if (!moveType || !TYPE_CHART[moveType.toLowerCase()]) return 1;
            let m = 1;
            const typeData = TYPE_CHART[moveType.toLowerCase()];
            if (t1) { const val = typeData[t1.toLowerCase()]; m *= (val !== undefined ? val : 1); }
            if (t2) { const val = typeData[t2.toLowerCase()]; m *= (val !== undefined ? val : 1); }
            return m;
        };
        
        // Calculamos o multiplicador aqui fora para usar no loop E no log
        const typeMult = getTypeMultiplier(move.type, defender.type1, defender.type2);

        // LOOP DE DANO (Multi-Hit)
        let totalDamage = 0;
        let critCount = 0;
        const level = attacker.level || encounter.level;
        
        for (let i = 0; i < hits; i++) {
            let baseDmg = Math.floor(((2 * level / 5 + 2) * power * (finalAtk / finalDef)) / 50 + 2); 
    
            // Aplica Tipo
            baseDmg = Math.floor(baseDmg * typeMult);
            if (baseDmg < 1 && typeMult > 0) baseDmg = 1;
    
            // Crítico
            let critRate = 0.0625; // 6.25% padrão (1/16)
            if (HIGH_CRIT_MOVES.includes(move.name)) critRate = 0.125; // 12.5% (1/8)

            if (Math.random() < critRate) {
                baseDmg *= 2;
                critCount++;
            }
            
            // Random e STAB
            baseDmg = Math.floor(baseDmg * ((Math.random() * 0.15) + 0.85));
    
            if (move.type === attacker.type1 || move.type === attacker.type2) {
                baseDmg = Math.floor(baseDmg * 1.5);
            }
            
            totalDamage += baseDmg;
        }
        
        let damage = totalDamage;

        // ATUALIZAÇÃO NO BANCO DE DADOS
        defender.current_hp -= damage;
        if (defender.current_hp < 0) defender.current_hp = 0;

        if (!isPlayer) {
             await this.db.run("UPDATE user_pokemons SET current_hp = MAX(0, current_hp - ?) WHERE id = ?", [damage, defender.id]);
        } else {
             await this.db.run("UPDATE active_encounters SET current_hp = MAX(0, current_hp - ?) WHERE user_id = ?", [damage, userId]);
        }

        // GERAÇÃO DE LOGS
        const typeEmoji = TYPE_EMOJIS[move.type] || '';
        const classIcon = move.damage_class === 'physical' ? "💥" : "🔮";
        
        log += `\n${isPlayer ? '🗡️' : '💢'} ${attacker.nickname || attacker.name} usou *${move.name}* ${typeEmoji} ${classIcon}!`;
        
        if (move.name === "magnitude") log += `\n🌋 Magnitude **${mag}**!`;
        if (hits > 1) log += `\n🔄 Atingiu **${hits}** vezes!`;
        if (critCount > 0) log += `\n⚠️ GOLPE CRÍTICO${critCount > 1 ? ' (x'+critCount+')' : ''}!`;
        
        log += `\nCausou **${damage}** de dano.`;

        if (typeMult > 1) log += ` (Super Efetivo!)`;
        if (typeMult < 1 && typeMult > 0) log += ` (Não muito efetivo...)`;
        if (typeMult === 0) log += ` (Não afetou...)`;

        // EFEITOS ESPECIAIS
        const specialEffects = this.processSpecialMoveEffects(move, attacker, defender, damage, battleState, isPlayer);
        log += specialEffects.log;

        if (specialEffects.selfDamage > 0) {
            attacker.current_hp -= specialEffects.selfDamage;
            if (isPlayer) await this.db.run("UPDATE user_pokemons SET current_hp = MAX(0, current_hp - ?) WHERE id = ?", [specialEffects.selfDamage, attacker.id]);
            else await this.db.run("UPDATE active_encounters SET current_hp = MAX(0, current_hp - ?) WHERE user_id = ?", [specialEffects.selfDamage, userId]);
        }
        
        if (specialEffects.healAmount > 0) {
             attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + specialEffects.healAmount);
             if (isPlayer) await this.db.run("UPDATE user_pokemons SET current_hp = ? WHERE id = ?", [attacker.current_hp, attacker.id]);
             else await this.db.run("UPDATE active_encounters SET current_hp = ? WHERE user_id = ?", [attacker.current_hp, userId]);
        }

        return { log, damageDealt: damage, forceSwitch: specialEffects.forceSwitch, flee: specialEffects.flee };
    }

    processSpecialMoveEffects(move, userPoke, targetPoke, damageDealt, battleState, isPlayer) {
        let log = "";
        let selfDamage = 0;
        let healAmount = 0;
        let forceSwitch = false;
        let flee = false;

        const targetKey = isPlayer ? 'enemy' : 'user';
        const userKey = isPlayer ? 'user' : 'enemy';
        const moveName = move.name.toLowerCase();

        // EFEITOS SECUNDÁRIOS
        const secondary = SECONDARY_EFFECTS[moveName];
        if (secondary) {
            const roll = Math.random() * 100;
            if (roll < secondary.chance) {
                
                // APLICAR STATUS (Burn, Paralyze, etc)
                if (secondary.status) {
                    const currentStatus = battleState[targetKey + 'Status'];
                    let immune = false;
                    if (secondary.status === 'brn' && (targetPoke.type1 === 'fire' || targetPoke.type2 === 'fire')) immune = true;
                    if (secondary.status === 'psn' && (targetPoke.type1 === 'poison' || targetPoke.type2 === 'poison' || targetPoke.type1 === 'steel' || targetPoke.type2 === 'steel')) immune = true;
                    if (secondary.status === 'par' && (targetPoke.type1 === 'electric' || targetPoke.type2 === 'electric')) immune = true; // (Regra Gen 6+, mas boa prática)
                    if (secondary.status === 'frz' && (targetPoke.type1 === 'ice' || targetPoke.type2 === 'ice')) immune = true;

                    if (!currentStatus && !immune) {
                        battleState[targetKey + 'Status'] = secondary.status;
                        log += `\n✨ ${secondary.msg}`;
                    }
                }

                // ALTERAR STATS (Debuff Enemy ou Buff Self)
                if (secondary.stat || secondary.allStats) {
                    const affectKey = secondary.target === 'self' ? userKey : targetKey;
                    const statsToMod = secondary.allStats ? ['atk', 'def', 'spa', 'spd', 'spe'] : [secondary.stat];
                    
                    let changed = false;
                    statsToMod.forEach(s => {
                        const currentStage = battleState.stages[affectKey][s] || 0;
                        const newStage = Math.max(-6, Math.min(6, currentStage + secondary.stage));
                        if (newStage !== currentStage) {
                            battleState.stages[affectKey][s] = newStage;
                            changed = true;
                        }
                    });
                    if (changed) log += `\n📉 ${secondary.msg}`;
                }

                // FLINCH
                if (secondary.effect === 'flinch') {
                    if (!battleState.counters[targetKey]) battleState.counters[targetKey] = {};
                    battleState.counters[targetKey].flinched = true;
                }
            }
        }

        // === TELEPORT ===
        if (moveName === 'teleport') {
            flee = true;
            log += `\n✨ *${userPoke.nickname || userPoke.name}* se teleportou!`;
        }

        // === 🦁 ROAR / WHIRLWIND ===
        if (moveName === 'roar' || moveName === 'whirlwind') {
            forceSwitch = true;
            log += `\n📢 *${userPoke.nickname || userPoke.name}* ${moveName === 'roar' ? 'bateu as asas muito forte' : 'rugiu assustadoramente'}!`;
        }

        // === GRUPO 1: THRASH, UPROAR, OUTRAGE ===
        const thrashMoves = ['uproar', 'thrash', 'outrage', 'petal-dance']; 
        
        if (thrashMoves.includes(moveName)) {
            if (!battleState.lockedMove[userKey]) {
                const turns = (moveName === 'uproar') ? 3 : (Math.floor(Math.random() * 2) + 2);
                
                battleState.lockedMove[userKey] = { name: moveName, turns: turns };
                
                if (moveName === 'uproar') {
                    battleState.field.uproar = turns;
                    log += `\n📢 *${userPoke.nickname || userPoke.name}* começou uma algazarra!`;
                } else {
                    log += `\n😡 *${userPoke.nickname || userPoke.name}* entrou em fúria!`;
                }
            } 
            else {
                battleState.lockedMove[userKey].turns--;
                if (moveName === 'uproar') battleState.field.uproar = battleState.lockedMove[userKey].turns;

                if (battleState.lockedMove[userKey].turns <= 0) {
                    battleState.lockedMove[userKey] = null;
                    if (moveName === 'uproar') {
                        log += `\n📢 A algazarra acabou.`;
                    } else {
                        battleState.counters[userKey].confusion = Math.floor(Math.random() * 4) + 1;
                        log += `\n😵 *${userPoke.nickname || userPoke.name}* ficou confuso devido à fadiga!`;
                    }
                }
            }
        }

        // === GRUPO 2: ROLLOUT, ICE BALL ===
        if (['rollout', 'ice-ball'].includes(moveName)) {
            if (!battleState.lockedMove[userKey]) {
                battleState.lockedMove[userKey] = { name: moveName, stacks: 1 }; 
                log += `\n🔄 *${userPoke.nickname || userPoke.name}* começou a rolar!`;
            } 
            else {
                battleState.lockedMove[userKey].stacks++;
                
                if (battleState.lockedMove[userKey].stacks >= 5) {
                    battleState.lockedMove[userKey] = null;
                    log += `\n🔄 O *${userPoke.nickname || userPoke.name}* completou a sequência de giros!`;
                }
            }
        }

        // --- GOLPES DE DRENAGEM ---
        if (['absorb', 'mega-drain', 'giga-drain', 'leech-life', 'drain-punch'].includes(moveName)) {
            healAmount = Math.floor(damageDealt / 2);
            log += `\n✨ Drenou vida do oponente!`;
        }
        if (moveName === 'dream-eater' && damageDealt > 0) {
            healAmount = Math.floor(damageDealt / 2);
            log += `\n✨ O sonho estava delicioso!`;
        }

        // --- GOLPES DE RECUO ---
        if (['take-down', 'double-edge', 'submission', 'brave-bird', 'flare-blitz', 'wood-hammer', 'volt-tackle'].includes(moveName)) {
            selfDamage = Math.floor(damageDealt / 4);
            if (selfDamage < 1) selfDamage = 1;
            log += `\n💥 Sofreu **${selfDamage}** de dano de recuo!`;
        }

        if (moveName === 'struggle') {
            selfDamage = Math.floor(userPoke.max_hp / 4);
            log += `\n💥 *${userPoke.nickname || userPoke.name}* sofreu dano pelo recuo!`;
        }

        // === SELF-DESTRUCT / EXPLOSION ===
        if (['self-destruct', 'explosion'].includes(moveName)) {
            selfDamage = userPoke.current_hp; 
            log += `\n💥 *${userPoke.nickname || userPoke.name}* explodiu e desmaiou!`;
        }

        return { log, selfDamage, healAmount, flee, forceSwitch };
    }

    applyStatusDamage(battleState, isPlayer, pokeObj, maxHp) {
        const targetKey = isPlayer ? 'user' : 'enemy';
        const status = battleState[targetKey + 'Status'];
        const counters = battleState.counters[targetKey];
        let dmg = 0;
        let msg = "";

        if (status === 'psn') {
            dmg = Math.floor(maxHp / 8);
            msg = `☠️ *${pokeObj.nickname || pokeObj.name}* sofreu com o veneno!`;
        } 
        else if (status === 'brn') {
            dmg = Math.floor(maxHp / 16);
            msg = `🔥 *${pokeObj.nickname || pokeObj.name}* se queimou!`;
        }
        else if (status === 'tox') {
            battleState.counters[targetKey].toxic++;
            const stacks = battleState.counters[targetKey].toxic;
            dmg = Math.floor(maxHp * (stacks / 16));
            msg = `🟣 *${pokeObj.nickname || pokeObj.name}* sofreu com o veneno grave! (x${stacks})`;
        }

        // --- DANO DE CURSE ---
        if (counters && counters.cursed) {
            const curseDmg = Math.floor(maxHp / 4);
            dmg += curseDmg;
            msg += `\n👻 *${pokeObj.nickname || pokeObj.name}* está sofrendo pela Maldição! (-${curseDmg})`;
        }

        if (dmg > 0) {
            pokeObj.current_hp -= dmg;
            return { dmg, msg, currentHp: pokeObj.current_hp };
        }
        return null;
    }

    getRandomNature() {
        return NATURE_KEYS[Math.floor(Math.random() * NATURE_KEYS.length)];
    }

    calculateStat(base, iv, level, natureKey, statName) {
        if (statName === 'hp') {
            return Math.floor(((2 * base + (iv || 0) + 100) * level) / 100 + 10);
        }

        let stat = Math.floor(((2 * base + (iv || 0)) * level) / 100 + 5);

        const nature = NATURES[natureKey] || NATURES['hardy'];
        
        if (nature.up === statName) {
            stat = Math.floor(stat * 1.1);
        } else if (nature.down === statName) {
            stat = Math.floor(stat * 0.9);
        }

        return stat;
    }

    async fixNullNatures() {
        const poke = await this.db.all("SELECT id FROM user_pokemons WHERE nature IS NULL");
        let count = 0;
        for (const p of poke) {
            const rnd = this.getRandomNature();
            await this.db.run("UPDATE user_pokemons SET nature = ? WHERE id = ?", [rnd, p.id]);
            count++;
        }
        return `✅ ${count} Pokémon antigos receberam uma natureza aleatória.`;
    }

    getBattleState(encounter, userPoke) {
        let data = encounter.extra_data ? JSON.parse(encounter.extra_data) : {};
        
        if (!data.stages) {
            data.stages = {
                user: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
                enemy: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }
            };
        }
        
        if (!data.counters) {
            data.counters = {
                user: { sleep: 0, confusion: 0, toxic: 0, cursed: false },
                enemy: { sleep: 0, confusion: 0, toxic: 0, cursed: false }
            };
        }

        if (data.counters.user.cursed === undefined) data.counters.user.cursed = false;
        if (data.counters.enemy.cursed === undefined) data.counters.enemy.cursed = false;

        if (!data.lockedMove) {
            data.lockedMove = {
                user: null,
                enemy: null
            };
        }

        if (!data.counters) {
            data.counters = {
                user: { sleep: 0, confusion: 0, toxic: 0, cursed: false, flinched: false },
                enemy: { sleep: 0, confusion: 0, toxic: 0, cursed: false, flinched: false }
            };
        }
        
        if (!data.field) {
            data.field = {
                uproar: 0 
            };
        }

        if (userPoke) {
            data.userStatus = userPoke.status || null;
        } else if (!data.userStatus) {
            data.userStatus = null;
        }

        if (!data.enemyStatus) data.enemyStatus = null;
        
        return data;
    }

    getTypeEmojis(type1, type2) {
        let emojis = TYPE_EMOJIS[type1] || '';
        if (type2) emojis += TYPE_EMOJIS[type2] || '';
        return emojis;
    }

    async getUserTag(userId) {
        const user = await this.db.get("SELECT nome, color FROM usuarios WHERE id_usuario = ?", [userId]);
        const name = user?.nome || "Treinador";
        const color = user?.color || "👤";
        return `${color} *${name}*\n\n`;
    }

    async changeColor(userId, param) {
        const allowedColors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '👤'];
        
        if (!param || !allowedColors.includes(param.trim())) {
            return `🎨 *CORES DISPONÍVEIS*\nUse: *!poke cor [bolinha]*\n\nOpções: ${allowedColors.join(" ")}`;
        }

        const newColor = param.trim();
        await this.db.run("UPDATE usuarios SET color = ? WHERE id_usuario = ?", [newColor, userId]);
        return `🎨 Cor alterada para ${newColor}! Suas mensagens agora começarão assim.`;
    }

    applyStages(statValue, stage) {
        if (!stage || stage === 0) return statValue;
        
        const multiplier = stage > 0 
            ? (2 + stage) / 2 
            : 2 / (2 + Math.abs(stage));
            
        return Math.floor(statValue * multiplier);
    }

    async processStatusMove(moveName, state, isPlayerTurn, maxHp, userPoke) {
        const effect = STATUS_MOVES[moveName.toLowerCase()];

        // === LÓGICA DO CURSE ===
        if (moveName === 'curse') {
            const t1 = userPoke.type1 ? userPoke.type1.toLowerCase() : '';
            const t2 = userPoke.type2 ? userPoke.type2.toLowerCase() : '';
            const isGhost = (t1 === 'ghost' || t2 === 'ghost');

            if (isGhost) {
                result.selfDamage = Math.floor(maxHp / 2);
                
                if (!state.counters[targetKey].cursed) {
                    state.counters[targetKey].cursed = true;
                    result.msg = "cortou o próprio HP para lançar uma Maldição!";
                } else {
                    result.selfDamage = 0
                    result.msg = "mas o alvo já estava amaldiçoado!";
                }
            } else {
                state.stages[userKey].spe = Math.max(-6, (state.stages[userKey].spe || 0) - 1);
                state.stages[userKey].atk = Math.min(6, (state.stages[userKey].atk || 0) + 1);
                state.stages[userKey].def = Math.min(6, (state.stages[userKey].def || 0) + 1);
                result.msg = "diminuiu SPEED, mas aumentou o ATAQUE e a DEFESA!";
            }
            return result;
        }
        
        if (!effect) return { msg: `usou ${moveName}.` };

        let result = { msg: `usou ${moveName}.`, healAmount: 0 };

        let targetKey = '';
        if (effect.target === 'self') {
            targetKey = isPlayerTurn ? 'user' : 'enemy';
        } else {
            targetKey = isPlayerTurn ? 'enemy' : 'user';
        }

        if (effect.stat) {
            const statsToMod = effect.stat.split('&'); 
            let changedAny = false;

            for (const statName of statsToMod) {
                const currentStage = state.stages[targetKey][statName] || 0;
                // Limita entre -6 e +6
                const newStage = Math.max(-6, Math.min(6, currentStage + effect.stage));
                
                if (newStage !== currentStage) {
                    state.stages[targetKey][statName] = newStage;
                    changedAny = true;
                }
            }

            if (!changedAny) {
                const nomesAtributos = statsToMod.map(s => STAT_DICT[s] || s.toUpperCase()).join(' e ');
                
                const acao = effect.stage > 0 ? "aumentar" : "diminuir";

                result.msg = `usou ${moveName}, mas ${nomesAtributos} não pode ${acao} mais!`;
            } else {
                result.msg = `usou ${moveName} e ${effect.msg}`;
            }
        }

        if (effect.status) {
            const currentStatus = state[targetKey + 'Status'];
            
            if (currentStatus) {
                result.msg = `tentou usar ${moveName}, mas falhou!`;
            } else {
                state[targetKey + 'Status'] = effect.status; 
                
                if (targetKey === 'user' && userPoke) {
                    await this.db.run("UPDATE user_pokemons SET status = ? WHERE id = ?", [effect.status, userPoke.id]);
                }

                if (effect.status === 'slp') {
                    state.counters[targetKey].sleep = Math.floor(Math.random() * 3) + 1;
                }
                if (effect.status === 'tox') {
                    state.counters[targetKey].toxic = 0;
                }
                result.msg = `usou ${moveName} e ${effect.msg}`;
            }
        }
        
        if (moveName === 'confuse-ray' || moveName === 'supersonic') {
             if (state.counters[targetKey].confusion > 0) {
                 result.msg = `usou ${moveName}, mas o alvo já está confuso!`;
             } else {
                 state.counters[targetKey].confusion = Math.floor(Math.random() * 4) + 1; // 1 a 4 turnos
                 result.msg = `usou ${moveName} e ${effect.msg}`;
             }
        }

        if (effect.heal && maxHp) {
            result.healAmount = Math.floor(maxHp * effect.heal);
            if (effect.status) state[targetKey + 'Status'] = effect.status;
            result.msg = `usou ${moveName} e ${effect.msg}`;
        }

        if (!effect.stat && !effect.status && !effect.heal && effect.msg) {
             result.msg = `usou ${moveName} e ${effect.msg}`;
        }

        return result;
    }

    async getTeam(userId, param) {
        const isDetailed = param && (param.includes('detalhes') || param.includes('details') || param.includes('info'));
        const team = await this.db.all(`
            SELECT up.*, p.name, p.type1, p.type2 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.user_id = ? AND up.team_slot IS NOT NULL AND up.team_slot < 7 AND up.team_slot > 0
            ORDER BY up.team_slot ASC`, [userId]);
            
        if (!team.length) return "Seu time está vazio!";
        
        let msg = "🧢 *SEU TIME*\n";
        team.forEach(p => {
            const status = p.current_hp <= 0 ? "💀" : "❤️";
            const types = this.getTypeEmojis(p.type1, p.type2);
            
            const natureData = NATURES[p.nature] || NATURES['hardy'];
            let natureInfo = `[${natureData.name}]`;
            if (natureData.up) natureInfo = `[${natureData.name}: +${natureData.up.toUpperCase()}/-${natureData.down.toUpperCase()}]`;

            if (p.current_hp < 0) p.current_hp = 0

            msg += `${p.team_slot}. ${status} ${p.nickname} ${types} (Lvl ${p.level})\nHP: ${p.current_hp}/${p.max_hp} `;
            
            if (isDetailed){
                msg += `\nNature: ${natureInfo}`
            }
            
            msg+=`\n`
        });
        return msg;
    }

    async showPokemon(groupId, userId, param, sock) {
        const tag = await this.getUserTag(userId);
        const slot = parseInt(param);

        if (isNaN(slot) || slot < 1 || slot > 6) {
            return `${tag}❌ Uso correto: *!poke mostrar [slot]*\nEx: _!poke mostrar 1_ (para ver o primeiro do time)`;
        }

        const poke = await this.db.get(`
            SELECT up.*, p.name, p.type1, p.type2, p.sprite_url, 
                   p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? AND up.team_slot = ?`, [userId, slot]);

        if (!poke) return `${tag}🚫 Não há Pokémon no slot ${slot} do seu time.`;

        // --- CÁLCULO DOS STATS FINAIS ---
        const atk = this.computeStat(poke.base_atk, poke.iv_atk, poke.ev_atk || 0, poke.level, poke.nature, 'atk');
        const def = this.computeStat(poke.base_def, poke.iv_def, poke.ev_def || 0, poke.level, poke.nature, 'def');
        const spa = this.computeStat(poke.base_spa, poke.iv_spa, poke.ev_spa || 0, poke.level, poke.nature, 'spa');
        const spd = this.computeStat(poke.base_spd, poke.iv_spd, poke.ev_spd || 0, poke.level, poke.nature, 'spd');
        const spe = this.computeStat(poke.base_spe, poke.iv_spe, poke.ev_spe || 0, poke.level, poke.nature, 'spe');
        const maxHp = this.computeStat(poke.base_hp, poke.iv_hp, poke.ev_hp || 0, poke.level, poke.nature, 'hp');

        const totalEVs = (poke.ev_hp||0) + (poke.ev_atk||0) + (poke.ev_def||0) + 
                 (poke.ev_spa||0) + (poke.ev_spd||0) + (poke.ev_spe||0);

        const natureData = NATURES[poke.nature] || NATURES['hardy'];
        let natureText = `*${natureData.name}*`;
        if (natureData.up) {
            natureText += ` (+${natureData.up.toUpperCase()} / -${natureData.down.toUpperCase()})`;
        } else {
            natureText += ` (Neutra)`;
        }

        const moves = await this.getUserMoves(poke); 
        let moveText = "";
        moves.forEach((m) => {
             const typeEmoji = TYPE_EMOJIS[m.type] || '';
             const catIcon = m.damage_class === 'physical' ? "💥" : (m.damage_class === 'special' ? "🔮" : "✨");
             moveText += `• ${m.name} ${typeEmoji} ${catIcon} (${m.current_pp}/${m.pp})\n`;
        });
        if (moveText === "") moveText = "(Nenhum golpe aprendido)";

        const shinyStar = poke.is_shiny ? "✨" : "";
        const typeEmojis = this.getTypeEmojis(poke.type1, poke.type2);

        const displayHp = Math.max(0, poke.current_hp);

        // ... cálculos de stats ...

        const statusEmojis = {
            'brn': '🔥 (Queimado)',
            'psn': '☠️ (Envenenado)',
            'tox': '🟣 (Gravemente Envenenado)',
            'par': '⚡ (Paralisado)',
            'slp': '💤 (Dormindo)',
            'frz': '🧊 (Congelado)'
        };
        const statusDisplay = poke.status ? `\n🤕 *Status:* ${statusEmojis[poke.status] || poke.status}` : "";

        const caption = `${tag}📊 *FICHA TÉCNICA* 📊\n\n` +
                        `${shinyStar} *${poke.nickname.toUpperCase()}* ${typeEmojis}\n` +
                        `🆙 Nível: ${poke.level} | XP: ${poke.exp}\n` +
                        `🌱 Nature: ${natureText}\n\n` +
                        `❤️ HP: ${displayHp}/${poke.max_hp} (IV: ${poke.iv_hp})${statusDisplay}\n` + 
                        `⚔️ Atk: ${atk} (IV: ${poke.iv_atk})\n` +
                        `🛡️ Def: ${def} (IV: ${poke.iv_def})\n` +
                        `🔮 Sp.A: ${spa} (IV: ${poke.iv_spa})\n` +
                        `🛡️ Sp.D: ${spd} (IV: ${poke.iv_spd})\n` +
                        `💨 Spe: ${spe} (IV: ${poke.iv_spe})\n\n` +
                        `💪 *EVs Totais:* ${totalEVs}/512\n` +
                        `🗡️ *GOLPES:*\n${moveText}`;

        if (sock) {
             const spriteUrl = poke.is_shiny ? poke.sprite_url.replace("front_default", "front_shiny") : poke.sprite_url;
             try {
                 await sock.sendMessage(groupId, { image: { url: spriteUrl }, caption: caption });
                 return null;
             } catch (e) {
                 return caption; 
             }
        }
        return caption;
    }

    async switchPokemon(userId, param) {        
        const tag = await this.getUserTag(userId);
        const encounter = await this.loadEncounter(userId);

        // --- LÓGICA DE TROCA NO PC
        if (!encounter) {
            const args = param.split(' ').map(n => parseInt(n));
            const slotA = args[0];
            const slotB = args[1];

            if (args.some(slot => slot > 6)) {
                return `${tag}🚫 Para mover Pokémon do PC (Slot 7+), use o comando *!poke pc*.`;
            }

            if (!slotA || !slotB || isNaN(slotA) || isNaN(slotB)) {
                return `${tag}🛠️ *Gerenciar Time*\nPara mudar a ordem, use: *!poke trocar [pos1] [pos2]*\nEx: _!poke trocar 1 2_ (O líder vira o segundo)`;
            }

            const pokeA = await this.db.get("SELECT id, nickname FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, slotA]);
            const pokeB = await this.db.get("SELECT id, nickname FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, slotB]);

            if (!pokeA || !pokeB) return `${tag}🚫 Um dos slots informados está vazio ou não existe.`;

            await this.db.run("UPDATE user_pokemons SET team_slot = -1 WHERE id = ?", [pokeA.id]);
            await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [slotA, pokeB.id]);
            await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [slotB, pokeA.id]);

            return `${tag}🔄 Time reordenado! *${pokeA.nickname}* agora é o slot ${slotB} e *${pokeB.nickname}* é o slot ${slotA}.`;
        }

        // --- LÓGICA DE TROCA EM BATALHA ---
        const targetSlot = parseInt(param);
        if (isNaN(targetSlot)) return "Em batalha, use apenas o número do slot. Ex: *!poke trocar 2*";

        const targetPoke = await this.db.get(`
            SELECT up.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? AND up.team_slot = ?`, [userId, targetSlot]);

        if (!targetPoke) return "🚫 Não tem ninguém nesse slot do time.";
        if (targetPoke.current_hp <= 0) return `💀 ${targetPoke.nickname} está desmaiado e não pode entrar!`;
        if (targetPoke.id === encounter.activePokemonId) return "🤦 Esse Pokémon já está em campo!";

        const currentPoke = await this.db.get("SELECT current_hp FROM user_pokemons WHERE id = ?", [encounter.activePokemonId]);
        const isFaintSwitch = currentPoke && currentPoke.current_hp <= 0;
        
        let extraData = encounter.gymData || {}; 
        if (!extraData.participants) extraData.participants = [];
        
        let participantsChanged = false;

        if (!extraData.waitingSwitch) {
            
            if (encounter.activePokemonId && !extraData.participants.includes(encounter.activePokemonId)) {
                extraData.participants.push(encounter.activePokemonId);
                participantsChanged = true;
            }

            if (!extraData.participants.includes(targetPoke.id)) {
                extraData.participants.push(targetPoke.id);
                participantsChanged = true;
            }
        }

        if (participantsChanged) {
             await this.db.run(`UPDATE active_encounters SET extra_data = ? WHERE user_id = ?`, [JSON.stringify(extraData), userId]);
        }

        await this.db.run(`UPDATE active_encounters SET active_pokemon_id = ? WHERE user_id = ?`, [targetPoke.id, userId]);

        if (encounter.gymData && encounter.gymData.waitingSwitch) {
            const newEnemyName = await this.advanceBattle(userId, encounter);
            return `🔄 Você trocou para **${targetPoke.nickname}**!\n🚨 Oponente enviou **${newEnemyName}**!`;
        }

        let log = `🔄 **Você trocou para ${targetPoke.nickname}!**\n`;

        // --- SÓ PROCESSA TURNO INIMIGO SE NÃO FOI TROCA POR MORTE ---
        if (!isFaintSwitch) {
            const encounterRaw = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
            let battleState = this.getBattleState(encounterRaw, targetPoke);

            const enemyTurnLog = await this.processEnemyTurn(encounter, targetPoke, battleState, userId);
            
            log += enemyTurnLog; 

            if (battleState.counters.user) battleState.counters.user.flinched = false;
            if (battleState.counters.enemy) battleState.counters.enemy.flinched = false;

            let finalExtraData = encounterRaw.extra_data ? JSON.parse(encounterRaw.extra_data) : {};
            
            finalExtraData.stages = battleState.stages;
            finalExtraData.counters = battleState.counters;
            finalExtraData.lockedMove = battleState.lockedMove;
            finalExtraData.field = battleState.field;
            finalExtraData.participants = battleState.participants;
            finalExtraData.userStatus = battleState.userStatus;
            finalExtraData.enemyStatus = battleState.enemyStatus;

            await this.db.run("UPDATE active_encounters SET extra_data = ? WHERE user_id = ?", [JSON.stringify(finalExtraData), userId]);

        } else {
            log += `👉 Vai, *${targetPoke.nickname}*!`;
        }        
        return log;
    }

    async addItem(userId, itemId, amount = 1) {
        const current = await this.db.get("SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
        
        if (current) {
            await this.db.run("UPDATE inventory SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?", [amount, userId, itemId]);
        } else {
            await this.db.run("INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)", [userId, itemId, amount]);
        }
    }

    async removeItem(userId, itemId, amount = 1) {
        const current = await this.db.get("SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
        
        if (!current || current.quantity < amount) return false;

        if (current.quantity === amount) {
            await this.db.run("DELETE FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
        } else {
            await this.db.run("UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?", [amount, userId, itemId]);
        }
        return true;
    }

    async getItemCount(userId, itemId) {
        const res = await this.db.get("SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
        return res ? res.quantity : 0;
    }

    async useTM(userId, param) {
        const tag = await this.getUserTag(userId);
        const args = param.split(' ');
        
        const itemCode = args[0]?.toLowerCase();
        const slot = parseInt(args[1]);

        if (!itemCode || isNaN(slot)) {
            return `${tag}💿 *USO DE TMs*\nUse: *!poke tm [item] [slot_poke]*\nEx: _!poke tm tm26 1_ (Ensina Earthquake pro líder)`;
        }
        const item = await this.db.get("SELECT i.*, inv.quantity FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.user_id = ? AND (i.id = ? OR i.name LIKE ?)", [userId, itemCode, `%${itemCode}%`]);
        
        if (!item || item.quantity < 1) return `${tag}🚫 Você não tem esse TM/HM na mochila.`;

        const poke = await this.db.get(`
            SELECT up.*, p.type1, p.type2 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.user_id = ? AND up.team_slot = ?`, 
            [userId, slot]
        );
        
        if (!poke) return `${tag}🚫 Slot ${slot} vazio.`;

        const moveNameRegex = /\((.*?)\)/;
        const match = item.name.match(moveNameRegex);
        const moveName = match ? match[1].toLowerCase().replace(/ /g, '-') : null;

        if (!moveName) return `${tag}❌ Erro: Não consegui identificar o golpe desse TM.`;

        const move = await this.db.get("SELECT id, type FROM moves WHERE name LIKE ?", [moveName]);
        if (!move) return `${tag}❌ Erro: Golpe *${moveName}* não existe no banco.`;

        // Validação de Compatibilidade Simples
        if (move.type !== poke.type1 && move.type !== poke.type2 && move.type !== 'normal') {
             return `${tag}🚫 *${poke.nickname}* não parece compatível com golpes do tipo ${move.type}.`;
        }

        const result = await this.attemptLearnMove(poke, move.id);

        if (!result.success) {
            return `${tag}🚫 ${poke.nickname} ${result.msg}`;
        }

        if (item.type === 'tm') {
            await this.removeItem(userId, item.id, 1);
            return `${tag}💿 Você usou **${item.name}**!\n${poke.nickname} ${result.msg}`;
        } else {
            return `${tag}💿 Você ativou o **${item.name}**!\n${poke.nickname} ${result.msg}`;
        }
    }

    async distributeDayCareXP(userId, totalXpEarned) {
        const poke = await this.db.get("SELECT * FROM user_pokemons WHERE user_id = ? AND team_slot = 0", [userId]);
        
        if (!poke || poke.level >= 100) return ""; 

        const shareXp = Math.max(1, Math.floor(totalXpEarned / 6)); 
        
        const result = await this.applyPassiveXp(poke, shareXp);

        if (result.leveledUp) {
            return `\n🏡 *Ligação do Day Care:* ${result.name} subiu para o Nível ${result.newLevel}!${result.extraMsg}`;
        } else {
            return `\n🏡 *Ligação do Day Care:* ${result.name} ganhou ${shareXp} XP.`;
        }
    }

    async distributeExpShare(userId, totalXpEarned) {
        const holders = await this.db.all(`
            SELECT * FROM user_pokemons 
            WHERE user_id = ? AND team_slot BETWEEN 1 AND 6 AND held_item = 'exp-share'`, 
            [userId]
        );

        if (holders.length === 0) return "";

        let msg = "";
        const bonusXp = Math.floor(totalXpEarned * 0.5);

        for (const poke of holders) {
            const result = await this.applyPassiveXp(poke, bonusXp);
            
            if (result.leveledUp) {
                msg += `\n💡 *Exp. Share:* ${result.name} subiu para o Nível ${result.newLevel}!${result.extraMsg}`;
            } else {
                msg += `\n💡 *Exp. Share:* ${result.name} ganhou ${bonusXp} XP.`;
            }
        }
        return msg;
    }

    async applyPassiveXp(poke, xpAmount) {
        let newExp = poke.exp + xpAmount;
        let currentLvl = poke.level;
        let leveledUp = false;
        let learnMsg = "";

        // Loop de Level Up
        while (newExp >= this.computeXp(currentLvl + 1)) {
            currentLvl++;
            leveledUp = true;

            const learnedMoves = await this.db.all(
                `SELECT m.id, m.name FROM pokemon_moves pm
                 JOIN moves m ON pm.move_id = m.id
                 WHERE pm.pokemon_id = ? AND pm.level_learned = ?`,
                [poke.pokedex_id, currentLvl]
            );

            for (const move of learnedMoves) {
                const res = await this.attemptLearnMove(poke, move.id);
                if (res.success) {
                    learnMsg += `\n💡 ${res.msg}`;
                }
            }
        }

        if (leveledUp) {
            const pkInfo = await this.db.get("SELECT base_hp FROM pokedex WHERE id = ?", [poke.pokedex_id]);
            
            const newMaxHp = Math.floor(((2 * pkInfo.base_hp + (poke.iv_hp || 0) + 100) * currentLvl) / 100 + 10);
            const hpDiff = newMaxHp - poke.max_hp;
            const newCurrentHp = poke.current_hp + hpDiff;

            await this.db.run(`
                UPDATE user_pokemons 
                SET exp = ?, level = ?, max_hp = ?, current_hp = ? 
                WHERE id = ?`, 
                [newExp, currentLvl, newMaxHp, newCurrentHp, poke.id]
            );

            return { success: true, leveledUp: true, newLevel: currentLvl, name: poke.nickname, extraMsg: learnMsg };
        } else {
            await this.db.run("UPDATE user_pokemons SET exp = ? WHERE id = ?", [newExp, poke.id]);
            return { success: true, leveledUp: false, name: poke.nickname, extraMsg: "" };
        }
    }
    
    async handlePCCommand(userId, param) {
        const args = param.trim().split(/\s+/);
        const subCmd = args[0] ? args[0].toLowerCase() : 'lista';

        if (subCmd === 'lista' || subCmd === 'list') {
            const pcMons = await this.db.all(`
                SELECT up.*, p.name 
                FROM user_pokemons up 
                JOIN pokedex p ON up.pokedex_id = p.id 
                WHERE up.user_id = ? AND up.team_slot > 6 
                ORDER BY up.team_slot ASC`, [userId]);

            if (pcMons.length === 0) return "📦 Seu PC está vazio! Capture mais Pokémon (slot 7 em diante).";

            let msg = "💻 *PC POKÉMON* (Armazenamento)\nUse: *!poke pc [quem_sai] [quem_entra]*\nEx: _!poke pc 2 1_ (Troca o slot 2 do time pelo 1 do PC)\n\n";
            
            pcMons.forEach(p => {
                const boxNum = p.team_slot - 6;
                const shiny = p.is_shiny ? "✨ " : "";
                const safeHp = Math.max(0, p.current_hp);
                msg += `📦 *${boxNum}*. ${shiny}${p.nickname} (Lvl ${p.level}) - HP: ${safeHp}/${p.max_hp}\n`;
            });

            return msg;
        }

        const teamSlot = parseInt(args[0]);
        const pcBoxNum = parseInt(args[1]);

        if (isNaN(teamSlot) || isNaN(pcBoxNum)) {
            return "⚠️ Formato inválido.\nUse: *!poke pc lista* ou *!poke pc [slot_time] [numero_pc]*";
        }

        if (teamSlot < 1 || teamSlot > 6) return "🚫 O slot do time deve ser entre 1 e 6.";

        const realPcSlot = pcBoxNum + 6;

        const teamPoke = await this.db.get("SELECT id, nickname, team_slot FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, teamSlot]);
        const pcPoke = await this.db.get("SELECT id, nickname, team_slot FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, realPcSlot]);

        if (!teamPoke) {
            await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [teamSlot, pcPoke.id]);
            return `${pcPoke.nickname} foi enviado para o slot vazio no time principal!`
        }
        if (!pcPoke) return `🚫 Não tem ninguém na Box ${pcBoxNum} do PC (Slot real ${realPcSlot}).`;

        await this.db.run("UPDATE user_pokemons SET team_slot = -1 WHERE id = ?", [teamPoke.id]);
        await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [teamSlot, pcPoke.id]);
        await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [realPcSlot, teamPoke.id]);

        return `🔄 **Troca no PC realizada!**\n\n📤 Saiu: *${teamPoke.nickname}* (Foi pro PC ${pcBoxNum})\n📥 Entrou: *${pcPoke.nickname}* (No slot ${teamSlot})`;
    }

    async handleItem(userId, param) {
        const tag = await this.getUserTag(userId);
        
        const args = param.trim().split(/\s+/);
        const action = args[0]?.toLowerCase();
        const pokeSlot = parseInt(args[1]);
        const bagIndex = parseInt(args[2]); // Agora esperamos o número do item na mochila

        // Validação básica
        if (!['dar', 'give', 'pegar', 'take'].includes(action) || isNaN(pokeSlot)) {
            return `${tag}🎒 *GERENCIAR ITENS*\n\n` +
                   `• *!poke item dar [slot_poke] [numero_da_bag]*\n` +
                   `Ex: _!poke item dar 1 3_ (Dá o item nº 3 da mochila para o Pokémon 1)\n\n` +
                   `• *!poke item pegar [slot_poke]*\n` +
                   `Ex: _!poke item pegar 1_ (Pega o item de volta para a mochila)`;
        }

        const poke = await this.db.get("SELECT * FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, pokeSlot]);
        if (!poke) return `${tag}🚫 Não existe Pokémon no slot ${pokeSlot}.`;

        // --- AÇÃO: DAR ITEM ---
        if (action === 'dar' || action === 'give') {
            if (isNaN(bagIndex) || bagIndex < 1) return `${tag}🚫 Digite o número do item na mochila. (Olhe em *!poke mochila*)`;

            const inventory = await this.db.all(`
                SELECT i.id, i.name, i.type, inv.quantity 
                FROM inventory inv 
                JOIN items i ON inv.item_id = i.id 
                WHERE inv.user_id = ? AND inv.quantity > 0
                ORDER BY i.type ASC, i.name ASC`, [userId]);

            const selectedItem = inventory[bagIndex - 1];

            if (!selectedItem) return `${tag}🚫 Item número ${bagIndex} não encontrado na sua mochila.`;

            if (selectedItem.type !== 'held') {
                return `${tag}🚫 Você não pode dar **${selectedItem.name}** para o Pokémon segurar. (Tipo: ${selectedItem.type})`;
            }

            await this.removeItem(userId, selectedItem.id, 1);

            let msg = "";

            if (poke.held_item) {
                await this.addItem(userId, poke.held_item, 1);
                
                const oldItemName = (await this.db.get("SELECT name FROM items WHERE id = ?", [poke.held_item]))?.name || "Item Antigo";
                
                msg += `♻️ Trocou **${oldItemName}** por **${selectedItem.name}**.\n`;
            } else {
                msg += `💡 Você deu **${selectedItem.name}** para *${poke.nickname}*!\n`;
            }

            await this.db.run("UPDATE user_pokemons SET held_item = ? WHERE id = ?", [selectedItem.id, poke.id]);

            return `${tag}${msg}`;
        }

        // --- AÇÃO: PEGAR ITEM ---
        if (action === 'pegar' || action === 'take') {
            if (!poke.held_item) return `${tag}🚫 *${poke.nickname}* não está segurando nada.`;

            const itemId = poke.held_item;
            
            await this.addItem(userId, itemId, 1);
            
            const itemData = await this.db.get("SELECT name FROM items WHERE id = ?", [itemId]);
            const nomeItem = itemData ? itemData.name : "Item";

            await this.db.run("UPDATE user_pokemons SET held_item = NULL WHERE id = ?", [poke.id]);

            return `${tag}🎒 Você pegou **${nomeItem}** de volta.`;
        }
    }

    async showBag(userId) {        
        const tag = await this.getUserTag(userId);

        const items = await this.db.all(`
            SELECT i.id, i.name, i.type, inv.quantity, i.description 
            FROM inventory inv 
            JOIN items i ON inv.item_id = i.id 
            WHERE inv.user_id = ? AND inv.quantity > 0
            ORDER BY i.type ASC, i.name ASC`, [userId]);

        if (items.length === 0) return "🎒 Sua mochila está vazia.";

        let msg = `${tag}🎒 **SUA MOCHILA**\nUse: *!poke item dar [slot_poke] [numero_item]*\nOu *!poke usar [numero_item] [slot_poke]*\n`;
        
        const categories = {
            'ball': '🔴 Pokébolas',
            'medicine': '🧪 Medicamentos',
            'held': '💡 Itens de Equipar',
            'key': '🔑 Itens Chave',
            'stone': '💎 Pedras Evolutivas'
        };

        let currentType = '';
        
        items.forEach((item, index) => {
            if (item.type !== currentType) {
                currentType = item.type;
                msg += `\n*${categories[currentType] || '📦 Outros'}*\n`;
            }

            msg += `${index + 1}. **${item.name}**: x${item.quantity}\n   _${item.description}_\n`;
        });
        
        return msg;
    }

    async handleDayCare(userId, param) {
        const tag = await this.getUserTag(userId);
        
        const dayCarePoke = await this.db.get(`
            SELECT * FROM user_pokemons WHERE user_id = ? AND team_slot = 0`, [userId]);

        if (!param) {
            if (!dayCarePoke) {
                return `${tag}🏡 **DAY CARE POKÉMON** 🏡\nO Day Care está vazio.\nUse: *!poke daycare [slot]* para deixar alguém treinando.\n\n💰 *Custo:* 200 coins por nível subido.`;
            }
            
            const startLevel = dayCarePoke.deposit_level || dayCarePoke.level;
            const levelsGained = dayCarePoke.level - startLevel;
            const cost = levelsGained * 200;

            return `${tag}🏡 **DAY CARE POKÉMON** 🏡\n` +
                   `Cuidando de: **${dayCarePoke.nickname}**\n` +
                   `🆙 Nível: ${startLevel} ➝ ${dayCarePoke.level} (+${levelsGained})\n` +
                   `💰 Custo atual: ${cost} coins\n\n` +
                   `Para pagar e retirar, use: *!poke daycare sacar*`;
        }

        const action = param.toLowerCase().trim();

        if (action === 'tirar' || action === 'retirar') {
            if (!dayCarePoke) return `${tag}🚫 O Day Care está vazio.`;

            const startLevel = dayCarePoke.deposit_level || dayCarePoke.level;
            const levelsGained = dayCarePoke.level - startLevel;
            const cost = Math.max(0, levelsGained * 200);

            const user = await this.db.get("SELECT pokecoins FROM usuarios WHERE id_usuario = ?", [userId]);
            if (user.pokecoins < cost) {
                return `${tag}🚫 **SALDO INSUFICIENTE**\n` +
                       `O Sr. Pokémon exige 💰 ${cost} coins pelos serviços.\n` +
                       `Você só tem 💰 ${user.pokecoins}.\n` +
                       `Vá batalhar para ganhar dinheiro!`;
            }

            const slots = await this.db.all("SELECT team_slot FROM user_pokemons WHERE user_id = ? ORDER BY team_slot ASC", [userId]);
            const occupied = slots.map(s => s.team_slot);
            let targetSlot = 1;
            while (occupied.includes(targetSlot)) targetSlot++;

            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins - ? WHERE id_usuario = ?", [cost, userId]);
            
            await this.db.run("UPDATE user_pokemons SET team_slot = ?, deposit_level = NULL WHERE id = ?", [targetSlot, dayCarePoke.id]);
            
            let dest = targetSlot > 6 ? `Box ${targetSlot - 6}` : `Time Principal`;
            
            const payTitle = cost > 0 ? "✅ **Pagamento Aceito!**" : "✅ **Devolução Concluída!**";
            const payDesc = cost > 0 ? `Você pagou 💰 ${cost} coins.\n` : "";

            const levelDesc = levelsGained === 0 
                ? "Ele ficou preguiçoso e não subiu nenhum nível (Nada foi cobrado)."
                : `Ele cresceu ${levelsGained} ${levelsGained === 1 ? 'nível' : 'níveis'} sob nossos cuidados.`;

            return `${tag}${payTitle}\n` +
                   `${payDesc}` +
                   `**${dayCarePoke.nickname}** voltou para o seu time! (${dest})\n` +
                   `${levelDesc}`;
        }

        if (dayCarePoke) {
            return `${tag}🚫 Já tem um Pokémon lá! Retire-o antes de colocar outro.`;
        }

        const slotToDeposit = parseInt(param);
        if (isNaN(slotToDeposit)) return `${tag}⚠️ Use o número do slot. Ex: *!poke daycare 2*`;

        const pokeToDeposit = await this.db.get("SELECT id, nickname, level, team_slot FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, slotToDeposit]);

        if (!pokeToDeposit) return `${tag}🚫 Slot vazio.`;
        if (pokeToDeposit.team_slot === 0) return `${tag}🤦 Ele já está no Day Care!`;

        await this.db.run("UPDATE user_pokemons SET team_slot = 0, deposit_level = ? WHERE id = ?", [pokeToDeposit.level, pokeToDeposit.id]);

        return `${tag}🏡 **${pokeToDeposit.nickname}** foi deixado no Day Care!\n` +
               `Ele ganhará XP passivo a cada vitória sua.\n` +
               `⚠️ Taxa de retirada: 200 coins por nível subido.`;
    }

    async handleCommand(from, sender, command, sock) {
        const args = command.trim().split(' ');
        const action = args[1] ? args[1].toLowerCase() : 'ajuda';
        const param = args.slice(2).join(' ');

        const allowedWithoutPoke = ['comecar', 'start', 'escolher', 'choose', 'ajuda', 'help'];
        const hasPokemon = await this.checkIfUserHasPokemon(sender);

        if (!hasPokemon && !allowedWithoutPoke.includes(action)) {
            return "🚫 Você ainda não é um treinador! Digite *!poke comecar* para pegar seu primeiro Pokémon.";
        }

        switch (action) {
            case 'tm':
                return await this.useTM(sender, param);

            case 'fixrewards':
                if (sender !== ADMIN_ID) return "🔒 Sem permissão.";
                return await this.giveRetroactiveGymTMs();

            case 'presente':
            case 'gift':
            case 'resgatar':
            case 'claim':
                return await this.claimSpecialGift(sender, args[2], args[3]);

            case 'daycare':
                return await this.handleDayCare(sender, param)

            case 'item':
                return await this.handleItem(sender, param)

            case 'mochila':
            case 'bag':
                return await this.showBag(sender);

            case 'give':
            case 'novarecompensa':
                if (sender !== ADMIN_ID) return "🔒 Sai daqui, hacker. Só o Admin manda aqui.";
                
                let targetInput = args[2];
                let targetUser = sender;

                if (targetInput && targetInput.includes('@')) {
                    const cleanNum = targetInput.replace('@', '').replace(/[^0-9]/g, '');
                    targetUser = cleanNum + "@s.whatsapp.net";
                }

                const rType = args[3]; 
                const rValue = args[4];
                const rAmount = parseInt(args[5]) || 1;

                if (!rType || !rValue) {
                    return "🛠️ *FERRAMENTA DE ADMIN*\nUse: *!poke dar @user [tipo] [valor] [qtd]*\n\n" +
                           "Exemplos:\n" +
                           "• !poke dar @55139... pokemon mewtwo 100\n" +
                           "• !poke dar @55139... coin 5000\n" +
                           "• !poke dar @55139... item bola 50";
                }

                return await this.giveReward(targetUser, rType, rValue, rAmount);

            case 'ajuda': 
            case 'help':
                return await this.helpPoke(sender, param);

            case 'mostrar':
            case 'show':
            case 'stats':
                return await this.showPokemon(from, sender, param, sock);

            case 'ataques':
            case 'attacks':
            case 'moves':
            case 'golpes':
                return await this.getTeamMoves(sender);

            case 'fixnature': 
                if (sender !== "5513991008854@s.whatsapp.net") return "Sem permissão.";
                return await this.fixNullNatures();

            case 'evoluir': 
            case 'evolve': 
                return await this.evolvePokemon(from, sender, param, sock);

            case 'cor':
            case 'color':
                return await this.changeColor(sender, args[2]);
            
            case 'resetar': 
                await this.db.run("DELETE FROM active_encounters WHERE user_id = ?", [sender]);
                return "✅ Batalha bugada removida à força.";

            case 'swap':
            case 'esquecer':
                return await this.learnPendingMove(sender, param);

            case 'time':
            case 'team':
                return await this.getTeam(sender, param);

            case 'trocar':
            case 'switch':
                return await this.switchPokemon(sender, param);

            case 'ignorar':
            case 'manter':
                return await this.learnPendingMove(sender, 'ignorar');

            case 'cleanmoves':
                if (sender !== "5513991008854@s.whatsapp.net") return "Sem permissão.";
                return await this.cleanDatabaseDuplicates();
            
            case 'fixhp':
                if (sender !== "5513991008854@s.whatsapp.net") return "Sem permissão.";
                return await this.fixNullHp();

            case 'fixivs':
                if (sender !== "5513991008854@s.whatsapp.net") return "Sem permissão.";
                return await this.fixNullIvs();

            case 'fixxp': 
                if (sender !== "5513991008854@s.whatsapp.net") return "Sem permissão.";
                return await this.fixZeroXp();
            
            case 'fixmoves': 
                if (sender !== "5513991008854@s.whatsapp.net") return "Sem permissão.";
                return await this.fixNullMoves();

            case 'curar': 
            case 'heal': 
            case 'nurse': 
                return await this.healTeam(sender);

            case 'ginasio': 
            case 'gym': 
            case 'historia': 
                return await this.challengeGym(from, sender, sock);

            case 'usar': 
            case 'use': 
                return await this.useItem(from, sender, param);

            case 'loja': 
            case 'shop': 
            case 'mart': 
                return await this.showShop(sender);

            case 'comprar': 
            case 'buy': 
                return await this.buyItem(sender, args[2], args[3]);

            case 'comecar': 
            case 'start': 
                return await this.showStarters(sender);

            case 'escolher': 
            case 'choose': 
                return await this.chooseStarter(sender, param);

            case 'fugir': 
                return await this.fleeBattle(from, sender);

            case 'atacar': 
                return await this.battleTurn(from, sender, param, sock);

            case 'explorar': 
            case 'hunt': 
                return await this.spawnWildPokemon(from, sender, sock, param);
            
            case 'capturar': 
            case 'catch': 
                return await this.catchPokemon(from, sender, param);

            case 'perfil': 
            case 'box': 
            case 'team': 
                return await this.getUserProfile(sender);

            case 'pc':
            case 'storage':
            case 'box':
                return await this.handlePCCommand(sender, param);
            
            default:
                return `🦕 *POKÉMON - GUIA RÁPIDO*\n\n` +
                       `🌿 *!poke explorar* ⚔️ *!poke atacar*\n` +
                       `🔴 *!poke capturar* 🏃 *!poke fugir*\n` +
                       `🏥 *!poke curar* 🔄 *!poke trocar*\n` +
                       `🎒 *!poke time* 💻 *!poke pc*\n` +
                       `📊 *!poke mostrar* 👤 *!poke perfil*\n` +
                       `🏛️ *!poke ginasio* 🏪 *!poke loja*\n\n` +
                       `💡 Digite *!poke ajuda [comando]* para detalhes.`;
        }
    }

    async loadEncounter(userId) {
        const encounter = await this.db.get(`
            SELECT ae.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe, p.sprite_url, p.base_xp, p.rarity
            FROM active_encounters ae
            JOIN pokedex p ON ae.pokedex_id = p.id
            WHERE ae.user_id = ?`, [userId]);

        if (!encounter) return null;

        return {
            pokemon: {
                id: encounter.pokedex_id,
                name: encounter.name,
                type1: encounter.type1,
                type2: encounter.type2,
                base_hp: encounter.base_hp,
                base_atk: encounter.base_atk,
                base_def: encounter.base_def,
                base_spa: encounter.base_spa,
                base_spd: encounter.base_spd,
                base_spe: encounter.base_spe,
                base_xp: encounter.base_xp,
                sprite_url: encounter.sprite_url,
                rarity: encounter.rarity,
            },
            
            activePokemonId: encounter.active_pokemon_id,
            currentHp: encounter.current_hp,
            maxHp: encounter.max_hp,
            level: encounter.level,
            isShiny: !!encounter.is_shiny,
            moves: JSON.parse(encounter.moves || '[]'),
            battle_type: encounter.battle_type,
            isGym: encounter.battle_type.includes('GYM'),
            gymData: encounter.extra_data ? JSON.parse(encounter.extra_data) : null,
            timestamp: encounter.started_at,
            groupId: encounter.group_id
        };
    }

    async clearEncounter(userId) {
        await this.db.run("DELETE FROM active_encounters WHERE user_id = ?", [userId]);
    }

    async spawnTrainer(groupId, userId, sock) {
        const user = await this.db.get("SELECT badges FROM usuarios WHERE id_usuario = ?", [userId]);
        const badges = user.badges || 0;

        const leadPoke = await this.db.get(`
            SELECT up.id, p.type1, p.type2 
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? AND up.team_slot > 0 AND up.current_hp > 0 
            ORDER BY up.team_slot ASC LIMIT 1`, [userId]);

        if (!leadPoke) return "🚑 Seus Pokémon estão desmaiados! Cure-os antes de aceitar desafios.";

        const lvlResult = await this.db.get(`
            SELECT AVG(level) as media 
            FROM user_pokemons 
            WHERE user_id = ? AND team_slot >= 1 AND team_slot <= 6`, 
            [userId]
        );
        const userAvgLvl = lvlResult && lvlResult.media ? Math.floor(lvlResult.media) : 5;

        let possibleTrainers = TRAINER_DATA;

        if (badges === 0) {
            const weakTrainers = TRAINER_DATA.filter(t => {
                if (!t.type) return false;
                const eff1 = (TYPE_CHART[leadPoke.type1] && TYPE_CHART[leadPoke.type1][t.type]) || 1;
                const eff2 = (leadPoke.type2 && TYPE_CHART[leadPoke.type2] && TYPE_CHART[leadPoke.type2][t.type]) || 1;
                return eff1 >= 2 || eff2 >= 2;
            });
            if (weakTrainers.length > 0) possibleTrainers = weakTrainers;
        }

        const trainerTemplate = possibleTrainers[Math.floor(Math.random() * possibleTrainers.length)];
        const trainerName = trainerTemplate.names[Math.floor(Math.random() * trainerTemplate.names.length)];
        const trainerClass = trainerTemplate.class;

        let teamSize = (Math.floor(Math.random() * 3) + 1) + Math.floor(badges / 2);
        if (teamSize > 6) teamSize = 6;

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

        const classMultiplier = PAYOUT_RATES[trainerClass] || 15;

        const totalLevel = trainerTeam.reduce((sum, poke) => sum + poke.level, 0);
        const avgLevel = Math.floor(totalLevel / trainerTeam.length);

        let calculatedReward = Math.floor(avgLevel * trainerTeam.length * classMultiplier);
        
        calculatedReward += (badges * 200);

        let trainerTeam = [];

        for (let i = 0; i < teamSize; i++) {
            let multiplier = 1.0;
            if (i === 0) multiplier = 1.2;
            else if (i === 1) multiplier = 1.1;

            const pokeLevel = Math.max(3, Math.floor(userAvgLvl * multiplier));
            
            let maxTier = 1;
            if (pokeLevel >= 14) maxTier = 2;
            if (pokeLevel >= 30) maxTier = 3;

            let query = "SELECT * FROM pokedex WHERE rarity = 'common' AND is_starter = 0 AND tier <= ?";
            let params = [maxTier];

            if (trainerTemplate.type) {
                query += " AND (type1 = ? OR type2 = ?)";
                params.push(trainerTemplate.type, trainerTemplate.type);
            }

            query += " ORDER BY RANDOM() LIMIT 1";
            let pokemon = await this.db.get(query, params);

            if (!pokemon) {
                pokemon = await this.db.get(`SELECT * FROM pokedex WHERE rarity = 'common' AND tier <= ? ORDER BY RANDOM() LIMIT 1`, [maxTier]);
            }

            let moves = await this.getMovesForLevel(pokemon.id, pokeLevel);
            let moveObjects = moves.map(m => ({ ...m, current_pp: m.pp }));
            
            if (moves.length === 0) {
                moveObjects = [{name: "tackle", power: 40, damage_class: 'physical', type: 'normal', pp: 35, current_pp: 35}];
            }

            trainerTeam.push({
                pokedex_id: pokemon.id,
                level: pokeLevel,
                moves: moveObjects,
                name: pokemon.name,
                base_hp: pokemon.base_hp, 
                sprite: pokemon.sprite_url
            });
        }

        const firstPokeData = trainerTeam[0];
        const remainingTeam = trainerTeam.slice(1);
        
        const hpMultiplier = 1.2;
        const bossHp = Math.floor(Math.floor(((2 * firstPokeData.base_hp + 15 + 100) * firstPokeData.level) / 100 + 10) * hpMultiplier);

        const extraData = { 
            leaderName: `${trainerClass} ${trainerName}`, 
            badgeName: null, 
            reward: calculatedReward,
            participants: [leadPoke.id],
            remainingTeam: remainingTeam 
        };

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, extra_data, started_at, active_pokemon_id
            ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`, 
            [
                userId, 
                groupId, 
                firstPokeData.pokedex_id, 
                bossHp, 
                bossHp, 
                firstPokeData.level, 
                JSON.stringify(firstPokeData.moves), 
                'TRAINER',
                JSON.stringify(extraData), 
                Date.now(), 
                leadPoke.id
            ]
        );

        const balls = "🔴".repeat(trainerTeam.length);

        const caption = `⚠️ *DESAFIO DE TREINADOR!*\n` +
                        `**${trainerClass} ${trainerName}** quer batalhar!\n` +
                        `Ele enviou *${firstPokeData.name}* (Lvl ${firstPokeData.level})!\n` +
                        `🧢 *Time Inimigo:* ${balls} (${trainerTeam.length})\n\n` +
                        `⚔️ *!poke atacar*\n` +
                        `🔄 *!poke trocar [slot]*\n` +
                        `🏃 *!poke fugir*`;

        if (sock) {
            try { await sock.sendMessage(groupId, { image: { url: trainerTemplate.sprite }, caption: caption }); } 
            catch (e) { await sock.sendMessage(groupId, { text: caption }); }
            return null;
        }
        return caption;
    }

    async spawnWildPokemon(groupId, userId, sock, param) {
        const tag = await this.getUserTag(userId);
        const existing = await this.loadEncounter(userId);
        if (existing) {
            return `${tag}🚫 Você já está em batalha contra *${existing.pokemon.name}*! Termine ela primeiro.`;
        }

        let forcedPokemon = null;
        if (userId === ADMIN_ID && param && param.startsWith('force ') && !param.includes('trainer')) {
            const target = param.replace('force ', '').trim();
            forcedPokemon = await this.db.get("SELECT * FROM pokedex WHERE name LIKE ? OR id = ?", [target, target]);
            
            if (!forcedPokemon) return `${tag}⚠️ Admin, não achei o Pokémon *${target}*.`;
        }

        if (!forcedPokemon) {
            let trainerPercent = 0.2;
 
            if (userId == ADMIN_ID && param == "force trainer"){
                trainerPercent = 1
            }

            // Encontro com treinador!
            if (Math.random() < trainerPercent) {
            const hasMinLvl = await this.db.get("SELECT level FROM user_pokemons WHERE user_id = ? ORDER BY level DESC LIMIT 1", [userId]);
                if (hasMinLvl && hasMinLvl.level >= 5) {
                    return await this.spawnTrainer(groupId, userId, sock);
                }
            }
        }

        const user = await this.db.get("SELECT badges FROM usuarios WHERE id_usuario = ?", [userId]);
        const badges = user.badges || 0;

        const leadPoke = await this.db.get(`
            SELECT up.id, p.type1, p.type2 
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? AND up.team_slot > 0 AND up.current_hp > 0 
            ORDER BY up.team_slot ASC LIMIT 1`, [userId]);

        if (!leadPoke) return `${tag}🚑 Todos os seus Pokémon estão desmaiados! Cure-os antes de batalhar.`;
        
        const lvlResult = await this.db.get(`
            SELECT AVG(level) as media 
            FROM user_pokemons 
            WHERE user_id = ? AND team_slot >= 1 AND team_slot <= 6`, 
            [userId]
        );
        const userAvgLvl = lvlResult && lvlResult.media ? Math.floor(lvlResult.media) : 5;
        
        let minWild = Math.max(2, userAvgLvl - 4);
        let maxWild = Math.max(3, userAvgLvl - 2);

        if (userAvgLvl <= 5) {
            minWild = 2;
            maxWild = userAvgLvl;
        }

        const wildLevel = Math.floor(Math.random() * (maxWild - minWild + 1)) + minWild;

        let maxTier = 1;
        if (wildLevel >= 14) maxTier = 2;
        if (wildLevel >= 30) maxTier = 3;
        
        const rareChance = 0.01 + (badges * 0.005);
        const shinyChance = 0.00024 + (badges * 0.0002); 

        let weights;

        if (badges === 0)     weights = { t1: 100, t2: 0, t3: 0 };
        else if (badges <= 2) weights = { t1: 60, t2: 35, t3: 5 };
        else if (badges <= 4) weights = { t1: 40, t2: 50, t3: 10 };
        else if (badges <= 6) weights = { t1: 30, t2: 40, t3: 30 };
        else                  weights = { t1: 20, t2: 30, t3: 50 }; 

        const roll = Math.random() * 100;
        const isRareEncounter = Math.random() < rareChance;
        
        let query = "";
        let params = [];

        if (isRareEncounter) {
            const rareList = RARE_POKE.join(',');
            query = `SELECT * FROM pokedex WHERE id IN (${rareList}) AND tier <= ? ORDER BY RANDOM() LIMIT 1`;
            params = [maxTier];
        } else {
            let minXp = 0, maxXp = 0;

            if (roll <= weights.t1) {
                minXp = 0; maxXp = 60;
            } else if (roll <= weights.t1 + weights.t2) {
                minXp = 60; maxXp = 140;
            } else {
                minXp = 140; maxXp = 300;
            }

            query = `SELECT * FROM pokedex WHERE base_xp >= ? AND base_xp < ? AND rarity = 'common' AND is_starter = 0 AND tier <= ? ORDER BY RANDOM() LIMIT 1`;
            params = [minXp, maxXp, maxTier];
        }

        let pokemon = await this.db.get(query, params);

        if (forcedPokemon) {
            pokemon = forcedPokemon;
        }

        if (!pokemon) {
            pokemon = await this.db.get(`SELECT * FROM pokedex WHERE rarity = 'common' AND tier <= ? ORDER BY RANDOM() LIMIT 1`, [maxTier]);
        }

        if (!pokemon) {
            pokemon = await this.db.get(`SELECT * FROM pokedex WHERE id = 19`); 
        }

        const wildNature = this.getRandomNature();
        const wildIvs = this.generateRandomIVs();
        
        const wildStats = this.generateStats(pokemon, wildIvs, wildLevel, wildNature);

        const wildMovesRaw = await this.getMovesForLevel(pokemon.id, wildLevel);
        const wildMoves = wildMovesRaw.map(m => ({
            ...m,
            current_pp: m.pp
        }));
        const isShiny = Math.random() < shinyChance;

        const extraData = { participants: [leadPoke.id], nature: wildNature };

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, started_at, active_pokemon_id, extra_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'WILD', ?, ?, ?)`,
            [userId, groupId, pokemon.id, wildStats.hp, wildStats.hp, wildLevel, isShiny ? 1 : 0, JSON.stringify(wildMoves), Date.now(), leadPoke.id, JSON.stringify(extraData)]
        );

        let emoji = ""
        if (isShiny) {
            emoji += "✨ SHINY ✨\n";
        }  if (pokemon.rarity === 'rare' || RARE_POKE.includes(pokemon.id)) {
            emoji += "🌟 POKÉMON RARO 🌟\n";
        }

        const typeEmojis = this.getTypeEmojis(pokemon.type1, pokemon.type2);

        const caption = `${tag}${emoji} Um *${pokemon.name.toUpperCase()}* ${typeEmojis} (Lvl ${wildLevel}) selvagem apareceu!\n` +
                        `❤️ HP: ${wildStats.hp}/${wildStats.hp}\n\n` +
                        `⚔️ *!poke atacar*\n` +
                        `🔴 *!poke capturar*\n` +
                        `🔄 *!poke trocar [slot]*\n` +
                        `🏃 *!poke fugir*`;

        if (sock) {
            const sprite = isShiny ? pokemon.sprite_url.replace("front_default", "front_shiny") : pokemon.sprite_url;
            try { await sock.sendMessage(groupId, { image: { url: sprite }, caption: caption }); } 
            catch (e) { await sock.sendMessage(groupId, { text: caption }); }
            return null; 
        }
        return caption;
    }

    async challengeGym(groupId, userId, sock) {
        const tag = await this.getUserTag(userId);
        const existing = await this.loadEncounter(userId);
        if (existing) return `${tag}🚫 Termine sua batalha atual primeiro!`;

        const leadPoke = await this.db.get(`
            SELECT up.id, p.type1, p.type2 
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? AND up.team_slot > 0 AND up.current_hp > 0 
            ORDER BY up.team_slot ASC LIMIT 1`, [userId]);

        if (!leadPoke) return `${tag}🚑 Todos os seus Pokémon estão desmaiados! Cure-os antes de entrar no ginásio.`;

        const user = await this.db.get("SELECT badges, gym_progress FROM usuarios WHERE id_usuario = ?", [userId]);
        const currentBadge = user.badges || 0;

        if (currentBadge >= 8) return `${tag}🏆 Você já é o Campeão da Liga Pokémon!`;

        // --- LÓGICA DE PROGRESSO DO GINÁSIO ---
        
        if (user.gym_progress === null) {
            const trainersCount = 2 + currentBadge;
            await this.db.run("UPDATE usuarios SET gym_progress = ? WHERE id_usuario = ?", [trainersCount, userId]);
            user.gym_progress = trainersCount;
            
            return `${tag}🏛️ *GINÁSIO DE ${(await this.getGymCityName(currentBadge))}*\n\n` +
                   `Você entrou no ginásio! Antes de desafiar o Líder, você deve derrotar os treinadores.\n` +
                   `👮 Treinadores restantes: *${trainersCount}*\n\n` +
                   `Digite *!poke ginasio* novamente para lutar contra o primeiro!`;
        }

        if (user.gym_progress > 0) {
            return await this.spawnGymTrainer(groupId, userId, sock, currentBadge, user.gym_progress, leadPoke.id);
        }

        // --- LUTA CONTRA O LÍDER 
        
        const gymLeader = await this.db.get("SELECT * FROM gym_leaders WHERE id = ?", [currentBadge]);
        if (!gymLeader) return `${tag}🏆 Você já venceu todos os líderes disponíveis!`;

        const team = JSON.parse(gymLeader.team_json);
        if (!team || team.length === 0) return "❌ Erro: Líder sem pokémon.";

        const firstPokeData = team[0];
        const bossPokemon = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [firstPokeData.pokedex_id]);
        
        const moveNames = firstPokeData.moves;
        const placeholders = moveNames.map(() => '?').join(',');
        const dbMoves = await this.db.all(`SELECT * FROM moves WHERE name IN (${placeholders})`, moveNames);
        
        const bossMoves = moveNames.map(mName => {
            const found = dbMoves.find(dbm => dbm.name === mName);
            return found ? { 
                name: found.name, 
                power: found.power, 
                type: found.type, 
                damage_class: found.damage_class,
                pp: found.pp,
                current_pp: found.pp
            } : { 
                name: mName, power: 40, type: 'normal', damage_class: 'physical', current_pp: 35 
            };
        });

        const bossHp = Math.floor(Math.floor(((2 * bossPokemon.base_hp + 31 + 100) * firstPokeData.level) / 100 + 10) * 1.5);

        const remainingTeam = team.slice(1);

        const extraData = { 
            leaderName: gymLeader.name,
            badgeName: gymLeader.badge_name,
            reward: gymLeader.reward_coins,
            participants: [leadPoke.id],
            remainingTeam: remainingTeam 
        };

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, extra_data, started_at, active_pokemon_id
            ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'GYM_LEADER', ?, ?, ?)`,
            [
                userId, 
                groupId, 
                bossPokemon.id, 
                bossHp, 
                bossHp, 
                firstPokeData.level, 
                JSON.stringify(bossMoves), 
                JSON.stringify(extraData), 
                Date.now(), 
                leadPoke.id
            ]
        );

        const balls = "🔴".repeat(team.length);

        const caption = `${tag}🏛️ *GINÁSIO DE ${gymLeader.city.toUpperCase()}*\n` + 
                        `🚨 *LÍDER ${gymLeader.name}* aceitou seu desafio!\n` + 
                        `Ele enviou *${bossPokemon.name}* (Lvl ${firstPokeData.level})!\n` + 
                        `🧢 *Time Inimigo:* ${balls} (${team.length})\n` +
                        `⚠️ *Boss HP:* ${bossHp}/${bossHp}\n\n` + 
                        `Prepare-se! Digite *!poke atacar*`;

        if (sock) {
            await sock.sendMessage(groupId, { image: { url: bossPokemon.sprite_url }, caption: caption });
        }
        return null;
    }

    async getGymCityName(badgeIndex) {
        const gym = await this.db.get("SELECT city FROM gym_leaders WHERE id = ?", [badgeIndex]);
        return gym ? gym.city : "Desconhecida";
    }

    async spawnGymTrainer(groupId, userId, sock, badgeIndex, remaining, leadPokeId) {
        const tag = await this.getUserTag(userId);
        const gymType = GYM_TYPES[badgeIndex] || 'normal';
        
        // Nível base aumenta com as insígnias
        const baseLevel = 10 + (badgeIndex * 4); 
        
        // Tamanho do time: Aleatório entre 1 e (Insígnias + 2)
        // Ex: 0 Insígnias = 1 a 2 Pokémon
        let teamSize = Math.floor(Math.random() * (badgeIndex + 2)) + 1;
        if (teamSize > 6) teamSize = 6;

        let trainerTeam = [];

        for (let i = 0; i < teamSize; i++) {
            const level = Math.floor(baseLevel + (Math.random() * 3));

            let pokemon = await this.db.get(`
                SELECT * FROM pokedex 
                WHERE (type1 = ? OR type2 = ?) 
                AND rarity = 'common' 
                AND tier <= 2 
                ORDER BY RANDOM() LIMIT 1`, 
                [gymType, gymType]
            );

            if (!pokemon) {
                pokemon = await this.db.get("SELECT * FROM pokedex WHERE rarity = 'common' ORDER BY RANDOM() LIMIT 1");
            }

            const movesRaw = await this.getMovesForLevel(pokemon.id, level);
            let moves = movesRaw.map(m => ({ ...m, current_pp: m.pp }));
            
            if (moves.length === 0) {
                moves = [{name: "tackle", power: 40, damage_class: 'physical', type: 'normal', pp: 35, current_pp: 35}];
            }

            trainerTeam.push({
                pokedex_id: pokemon.id,
                level: level,
                moves: moves,
                name: pokemon.name,
                base_hp: pokemon.base_hp,
                sprite: pokemon.sprite_url
            });
        }

        const firstPokeData = trainerTeam[0];
        const remainingTeam = trainerTeam.slice(1);

        const hp = Math.floor(((2 * firstPokeData.base_hp + 15 + 100) * firstPokeData.level) / 100 + 10);

        const trainerNames = ["Jovem", "Escoteiro", "Montanhista", "Nadador", "Mecânico", "Ciclista", "Faixa Preta", "Médium"];
        const randomClass = trainerNames[Math.floor(Math.random() * trainerNames.length)];

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

        const classMultiplier = GYM_PAYOUT_RATES[randomClass] || 18;
        const totalLevel = trainerTeam.reduce((sum, poke) => sum + poke.level, 0);
        const avgLevel = Math.floor(totalLevel / trainerTeam.length);

        let calculatedReward = Math.floor(avgLevel * trainerTeam.length * classMultiplier);
        
        calculatedReward += (badgeIndex * 300); 

        const extraData = { 
            participants: [leadPokeId],
            leaderName: `${randomClass} do Ginásio`, 
            remainingTeam: remainingTeam,
            reward: calculatedReward
        };

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, started_at, active_pokemon_id, extra_data
            ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'GYM_TRAINER', ?, ?, ?)`,
            [
                userId, 
                groupId, 
                firstPokeData.pokedex_id, 
                hp, 
                hp, 
                firstPokeData.level, 
                JSON.stringify(firstPokeData.moves), 
                Date.now(), 
                leadPokeId, 
                JSON.stringify(extraData)
            ]
        );

        // --- INFORMAÇÕES VISUAIS ---
        const totalTrainers = 2 + badgeIndex;
        const currentBattleNum = (totalTrainers - remaining) + 1;
        
        const balls = "🔴".repeat(teamSize);

        const caption = `${tag}🏛️ *GINÁSIO - BATALHA ${currentBattleNum} de ${totalTrainers}*\n` +
                        `O *${randomClass}*, bloqueou seu caminho!\n` +
                        `Ele enviou um *${firstPokeData.name}* (Lvl ${firstPokeData.level}).\n` +
                        `🧢 *Time Inimigo:* ${balls} (${teamSize})\n\n` +
                        `⚔️ Digite *!poke atacar* para lutar!`;

        if (sock) {
            try { await sock.sendMessage(groupId, { image: { url: firstPokeData.sprite }, caption: caption }); } 
            catch (e) { await sock.sendMessage(groupId, { text: caption }); }
            return null;
        }
        return caption;
    }

    async advanceBattle(userId, encounter) {
        const nextPokeData = encounter.gymData.nextEnemy;
        
        delete encounter.gymData.nextEnemy;
        delete encounter.gymData.waitingSwitch;
        encounter.gymData.participants = []; 

        const nextPokeDex = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [nextPokeData.pokedex_id]);
        
        if (encounter.gymData.stages) {
            encounter.gymData.stages.enemy = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
        }
        if (encounter.gymData.counters) {
            encounter.gymData.counters.enemy = { sleep: 0, confusion: 0, toxic: 0, cursed: false };
        }
        encounter.gymData.enemyStatus = null;
        if (encounter.gymData.lockedMove) encounter.gymData.lockedMove.enemy = null;

        let nextMoves = [];
        const rawMoves = nextPokeData.moves;

        if (rawMoves.length > 0 && typeof rawMoves[0] === 'object') {
            nextMoves = rawMoves;
        } else {
            const placeholders = rawMoves.map(() => '?').join(',');
            const dbMoves = await this.db.all(`SELECT * FROM moves WHERE name IN (${placeholders})`, rawMoves);
            
            nextMoves = rawMoves.map(mName => {
                const found = dbMoves.find(dbm => dbm.name === mName);
                return found ? {
                    name: found.name,
                    power: found.power,
                    type: found.type,
                    damage_class: found.damage_class,
                    pp: found.pp,
                    current_pp: found.pp
                } : { 
                    name: mName, power: 40, type: 'normal', damage_class: 'physical', 
                    current_pp: 35
                };
            });
        }

        const hpMult = encounter.isGym ? 1.5 : 1.2;
        const nextHp = Math.floor(Math.floor(((2 * nextPokeDex.base_hp + 31 + 100) * nextPokeData.level) / 100 + 10) * hpMult);

        await this.db.run(`
            UPDATE active_encounters 
            SET pokedex_id = ?, current_hp = ?, max_hp = ?, level = ?, moves = ?, extra_data = ?
            WHERE user_id = ?`,
            [nextPokeDex.id, nextHp, nextHp, nextPokeData.level, JSON.stringify(nextMoves), JSON.stringify(encounter.gymData), userId]
        );
        
        return nextPokeDex.name;
    }

    async battleTurn(groupId, userId, moveSlot, sock) {
        const tag = await this.getUserTag(userId);
        let encounter = await this.loadEncounter(userId);
        if (!encounter) return `${tag}Não tem batalha rolando.`;

        if (encounter.gymData && encounter.gymData.waitingSwitch) {
            const newEnemyName = await this.advanceBattle(userId, encounter);
            
            encounter = await this.loadEncounter(userId); 
            
            if (sock) {
                await sock.sendMessage(groupId, { text: `${tag}🚨 **${newEnemyName}** entrou em campo!` });
            }
        }

        // Carrega Jogador
        const userPoke = await this.db.get(`SELECT up.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe FROM user_pokemons up JOIN pokedex p ON up.pokedex_id = p.id WHERE up.id = ? AND up.user_id = ?`, [encounter.activePokemonId, userId]);
        if (!userPoke) return "Erro: Pokémon não encontrado.";

        // Carrega Estado
        const encounterRaw = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
        let battleState = this.getBattleState(encounterRaw, userPoke);
        
        // Garante participantes
        if (!battleState.participants) battleState.participants = [];
        if (!battleState.participants.includes(userPoke.id)) battleState.participants.push(userPoke.id);

        let log = "";

        // ==========================================================
        // SELEÇÃO DE GOLPES
        // ==========================================================
        
        // Golpe do Jogador
        let playerMove = null;
        let forcedMove = null;

        // Verifica Locked Move (Outrage, Rollout)
        if (battleState.lockedMove.user) {
            forcedMove = await this.db.get("SELECT * FROM moves WHERE name = ?", [battleState.lockedMove.user.name]);
            if (forcedMove) {
                log += `⚠️ *${userPoke.nickname}* está incontrolável e usou *${forcedMove.name}*!\n`;
                playerMove = forcedMove;
            }
        }

        if (!playerMove) {
            if (!moveSlot) {                     
                const moves = await this.getUserMoves(userPoke);
                const typeEmojis = this.getTypeEmojis(userPoke.type1, userPoke.type2);
                let msg = `${tag}👊 *${userPoke.nickname}* ${typeEmojis} (HP: ${userPoke.current_hp}/${userPoke.max_hp})\n*Ataques:*\n`;
                moves.forEach((m, i) => {
                    let classIcon = m.damage_class === 'physical' ? "💥" : (m.damage_class === 'special' ? "🔮" : "✨");
                    msg += `${i+1}. ${m.name} (${m.type}) ${classIcon} [${m.current_pp}/${m.pp} PP]\n`
                });
                msg += `\nUse: *!poke atacar 1*`;
                return msg;
            }
            
            const movesList = await this.getUserMoves(userPoke);
            playerMove = movesList[parseInt(moveSlot) - 1];
            if (!playerMove) return `${tag}Golpe inválido!`;
            if (playerMove.current_pp <= 0) return `${tag}🚫 Sem PP!`;
            
            // Consome PP
            const slotNumber = parseInt(moveSlot); 
            const colName = `move${slotNumber}_pp`; 
            await this.db.run(`UPDATE user_pokemons SET ${colName} = ${colName} - 1 WHERE id = ?`, [userPoke.id]);
        }
        
        // Nature Power (Player)
        if (playerMove.name === 'nature-power') {
            const natureOptions = [
                { name: 'swift', power: 60, type: 'normal', damage_class: 'special' },
                { name: 'razor-leaf', power: 55, type: 'grass', damage_class: 'special' },
                { name: 'rock-slide', power: 75, type: 'rock', damage_class: 'physical' },
                { name: 'bubble-beam', power: 65, type: 'water', damage_class: 'special' },
                { name: 'earthquake', power: 100, type: 'ground', damage_class: 'physical' }
            ];
            const transformed = natureOptions[Math.floor(Math.random() * natureOptions.length)];
            playerMove = { ...playerMove, ...transformed };
            log += `\n🌿 *Nature Power* se transformou em *${transformed.name}*!`;
        }


        // Golpe do Inimigo (IA Simples)
        const validEnemyMoves = encounter.moves.filter(m => m.current_pp > 0);
        let enemyMove = encounter.moves[Math.floor(Math.random() * encounter.moves.length)];
        
        if (validEnemyMoves.length > 0) {
            enemyMove = validEnemyMoves[Math.floor(Math.random() * validEnemyMoves.length)];
            const originalMove = encounter.moves.find(m => m.name === enemyMove.name);
            if(originalMove) originalMove.current_pp--;
            await this.db.run("UPDATE active_encounters SET moves = ? WHERE user_id = ?", [JSON.stringify(encounter.moves), userId]);
        } else {
            enemyMove = { name: "Struggle", power: 50, damage_class: 'physical', type: 'normal', accuracy: 100 };
            log += `\n⚠️ Inimigo sem PP! Usará Struggle.`;
        }

        // Nature Power (Enemy)
        if (enemyMove.name === 'nature-power') {
            const natureOptions = [
                { name: 'swift', power: 60, type: 'normal', damage_class: 'special' },
                { name: 'razor-leaf', power: 55, type: 'grass', damage_class: 'special' },
                { name: 'rock-slide', power: 75, type: 'rock', damage_class: 'physical' },
                { name: 'bubble-beam', power: 65, type: 'water', damage_class: 'special' },
                { name: 'earthquake', power: 100, type: 'ground', damage_class: 'physical' }
            ];
            const transformed = natureOptions[Math.floor(Math.random() * natureOptions.length)];
            enemyMove = { ...enemyMove, ...transformed };
            log += `\n🌿 *Nature Power* se transformou em *${transformed.name}*!`;
        }


        // ==========================================================
        // QUEM ATACA PRIMEIRO?
        // ==========================================================
        const userSpeed = this.getBattleSpeed(userPoke, battleState, true, userPoke.level);
        const enemySpeed = this.getBattleSpeed(encounter.pokemon, battleState, false, encounter.level);

        let first = 'user';
        if (userSpeed < enemySpeed) first = 'enemy';
        else if (userSpeed === enemySpeed) first = Math.random() < 0.5 ? 'user' : 'enemy';
        
        const turnOrder = [];
        if (first === 'user') {
            turnOrder.push({ actor: 'user', move: playerMove, attacker: userPoke, defender: encounter });
            turnOrder.push({ actor: 'enemy', move: enemyMove, attacker: encounter, defender: userPoke });
        } else {
            turnOrder.push({ actor: 'enemy', move: enemyMove, attacker: encounter, defender: userPoke });
            turnOrder.push({ actor: 'user', move: playerMove, attacker: userPoke, defender: encounter });
        }

        // ==========================================================
        // EXECUÇÃO DOS TURNOS
        // ==========================================================
        
        let battleEnded = false;

        for (const turn of turnOrder) {
            if (turn.attacker.current_hp <= 0 || turn.defender.current_hp <= 0 && !turn.defender.pokemon /*gambiarra pro encounter*/) continue;
            
            const actorKey = turn.actor === 'user' ? 'user' : 'enemy';
            if (battleState.counters[actorKey] && battleState.counters[actorKey].flinched) {
                let attackerName = turn.attacker.nickname || turn.attacker.name;
                if (!attackerName && turn.attacker.pokemon) attackerName = turn.attacker.pokemon.name;
                if (!attackerName) attackerName = "Inimigo";

                log += `\n🚫 *${attackerName}* recuou (flinched) e não atacou!`;
                battleState.counters[actorKey].flinched = false; 
                continue; 
            }

            const currentHpAttacker = turn.actor === 'user' ? userPoke.current_hp : encounter.currentHp;
            if (currentHpAttacker <= 0) continue;

            let attackerObj = turn.actor === 'user' ? userPoke : { ...encounter.pokemon, current_hp: encounter.currentHp, max_hp: encounter.maxHp, level: encounter.level };
            let defenderObj = turn.actor === 'user' ? { ...encounter.pokemon, current_hp: encounter.currentHp, max_hp: encounter.maxHp, level: encounter.level } : userPoke;
            
            // EXECUTA O ATAQUE
            const result = await this.executeMove(attackerObj, defenderObj, turn.move, battleState, turn.actor === 'user', userId, encounter);
            log += result.log;

            if (turn.actor === 'user') {
                encounter.currentHp = defenderObj.current_hp;
                userPoke.current_hp = attackerObj.current_hp;
            } else {
                userPoke.current_hp = defenderObj.current_hp;
                encounter.currentHp = attackerObj.current_hp;
            }

            // Verifica Vitória/Derrota Imediata
            if (encounter.currentHp <= 0) {
                 return this.handleVictory(userId, encounter, battleState, log);
            }
            if (userPoke.current_hp <= 0) {
                 return this.handlePlayerFaint(userId, userPoke, tag, log);
            }
            
            // Verifica Fuga/Roar
            if (result.flee || result.forceSwitch) {
                await this.clearEncounter(userId);
                return `${log}\n💨 A batalha acabou devido a ${turn.move.name}!`;
            }
        }

        // ==========================================================
        // DANO RESIDUAL (FINAL DO TURNO)
        // ==========================================================

        const userRes = this.applyStatusDamage(battleState, true, userPoke, userPoke.max_hp);
        if (userRes) {
            log += `\n${userRes.msg} (-${userRes.dmg})`;
            await this.db.run("UPDATE user_pokemons SET current_hp = MAX(0, current_hp - ?) WHERE id = ?", [userRes.dmg, userPoke.id]);
            userPoke.current_hp -= userRes.dmg;
        }

        const enemyRes = this.applyStatusDamage(battleState, false, { ...encounter.pokemon, current_hp: encounter.currentHp }, encounter.maxHp);
        if (enemyRes) {
            log += `\n${enemyRes.msg} (-${enemyRes.dmg})`;
            encounter.currentHp -= enemyRes.dmg;
            await this.db.run("UPDATE active_encounters SET current_hp = MAX(0, current_hp - ?) WHERE user_id = ?", [enemyRes.dmg, userId]);
        }

        // Verifica Mortes por Status
        if (encounter.currentHp <= 0) return this.handleVictory(userId, encounter, battleState, log);
        if (userPoke.current_hp <= 0) return this.handlePlayerFaint(userId, userPoke, tag, log);

        // Limpa o flinch de todos para não persistir no próximo turno
        if (battleState.counters.user) battleState.counters.user.flinched = false;
        if (battleState.counters.enemy) battleState.counters.enemy.flinched = false;

        // Salva Battle State Final
        let finalExtraData = encounterRaw.extra_data ? JSON.parse(encounterRaw.extra_data) : {};
        finalExtraData.stages = battleState.stages;
        finalExtraData.counters = battleState.counters;
        finalExtraData.lockedMove = battleState.lockedMove;
        finalExtraData.field = battleState.field;
        finalExtraData.participants = battleState.participants;
        finalExtraData.userStatus = battleState.userStatus;
        finalExtraData.enemyStatus = battleState.enemyStatus;

        await this.db.run("UPDATE active_encounters SET extra_data = ? WHERE user_id = ?", [JSON.stringify(finalExtraData), userId]);

        const currentLvlXp = userPoke.exp - this.computeXp(userPoke.level);
        const nextLvlXp = this.computeXp(userPoke.level+1) - this.computeXp(userPoke.level);
        const xpBar = this.getProgressBar(currentLvlXp, nextLvlXp);

        // Retorno Visual
        return `${log}\n\n` +
               `❤️ Inimigo: ${Math.max(0, encounter.currentHp)}/${encounter.maxHp}\n` +
               `💚 Seu: ${Math.max(0, userPoke.current_hp)}/${userPoke.max_hp}\n` +
               `🆙 XP: ${xpBar} (${currentLvlXp}/${nextLvlXp})\n\n` + 
               `⚔️ *!poke atacar [n]*\n` +
               `🔴 *!poke capturar*\n` +
               `🔄 *!poke trocar [n]*\n` +
               `🏃 *!poke fugir*`;
    }

    getProgressBar(current, max) {
        const totalBars = 10;
        const progress = Math.min(1, Math.max(0, current / max));
        const filledBars = Math.floor(progress * totalBars);
        const emptyBars = totalBars - filledBars;
        return "🟦".repeat(filledBars) + "⬜".repeat(emptyBars);
    }

    async handleVictory(userId, encounter, battleState, log) {
        let participants = battleState.participants || [];
        const uniqueParticipants = [...new Set(participants)];
        const splitFactor = uniqueParticipants.length;

        let logMsg = `💀 O inimigo desmaiou!\n`;
        let xpMultiplier = 1.0;

        if (encounter.battle_type === 'GYM_LEADER') xpMultiplier = 2.5; 
        else if (encounter.battle_type === 'GYM_TRAINER') xpMultiplier = 2; 
        else if (encounter.battle_type === 'TRAINER') xpMultiplier = 1.5;

        for (const pId of uniqueParticipants) {
            const p = await this.db.get(`
                SELECT up.*, dex.base_hp 
                FROM user_pokemons up 
                JOIN pokedex dex ON up.pokedex_id = dex.id 
                WHERE up.id = ?`, [pId]);
            
            if (p) {
                const xpMsg = await this.gainExperience(p, encounter.pokemon, encounter.level, splitFactor, xpMultiplier, userId);
                await this.gainEVs(p, encounter.pokemon);
                logMsg += `\n🔹 *${p.nickname}*: ${xpMsg.replace('✨ Ganhou', 'Ganhou')}`; 
            }
        }

        const baseEnemyXp = Math.floor((encounter.pokemon.base_xp * encounter.level * xpMultiplier) / 7);

        const dayCareMsg = await this.distributeDayCareXP(userId, baseEnemyXp);
        logMsg += dayCareMsg;

        const expShareMsg = await this.distributeExpShare(userId, baseEnemyXp);
        logMsg += expShareMsg;

        if ((encounter.battle_type === 'GYM_LEADER' || encounter.battle_type === 'GYM_TRAINER' || encounter.battle_type === 'TRAINER') && encounter.gymData.remainingTeam && encounter.gymData.remainingTeam.length > 0) {
            const nextPokeData = encounter.gymData.remainingTeam.shift(); 
            const nextPokeDex = await this.db.get("SELECT name FROM pokedex WHERE id = ?", [nextPokeData.pokedex_id]);
            
            encounter.gymData.waitingSwitch = true;
            encounter.gymData.nextEnemy = nextPokeData; 
            encounter.gymData.participants = [];

            await this.db.run(`UPDATE active_encounters SET extra_data = ? WHERE user_id = ?`, 
                [JSON.stringify(encounter.gymData), userId]
            );

            const title = encounter.isGym ? 'Líder' : 'Treinador';
            return `${log}\n${logMsg}\n\n🛑 *${title} ${encounter.gymData.leaderName}* vai enviar *${nextPokeDex.name}*.\n\nDeseja trocar de Pokémon?\n🔄 *!poke trocar [slot]*\n⚔️ *!poke atacar* (para manter)`;
        }

        // VITÓRIA FINAL
        await this.clearEncounter(userId);

        if (encounter.battle_type === 'GYM_TRAINER') {
            await this.db.run("UPDATE usuarios SET gym_progress = gym_progress - 1 WHERE id_usuario = ?", [userId]);
            const remaining = (await this.db.get("SELECT gym_progress FROM usuarios WHERE id_usuario = ?", [userId])).gym_progress;
            
            const rawReward = encounter.gymData.reward || 750;
            const variation = (Math.random() * 0.2) + 0.9;
            const reward = Math.floor(rawReward * variation);
            
            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [reward, userId]);

            let nextMsg = "";
            if (remaining > 0) {
                nextMsg = `😰 Faltam *${remaining}* treinadores.\nCure seus Pokémon e digite *!poke ginasio* novamente.`;
            } else {
                nextMsg = `🚨 *O CAMINHO ESTÁ LIVRE!* 🚨\nVocê derrotou todos os capangas.\nCure seu time e digite *!poke ginasio* para desafiar o LÍDER!`;
            }
            return `${log}\n🎉 *Você venceu o treinador do ginásio!*\nRecebeu 💰 ${reward}!\n${logMsg}\n\n${nextMsg}`;
        }

        if (encounter.battle_type === 'GYM_LEADER') { 
            const badgeInfo = encounter.gymData;
            
            const currentBadgeCount = (await this.db.get("SELECT badges FROM usuarios WHERE id_usuario = ?", [userId])).badges || 0;
            const tmId = this.getGymRewardTM(currentBadgeCount);
            let tmMsg = "";
            
            if (tmId) {
                await this.addItem(userId, tmId, 1);
                const tmName = (await this.db.get("SELECT name FROM items WHERE id = ?", [tmId]))?.name;
                tmMsg = `\n💿 Recebeu: **${tmName}**!`;
            }

            await this.db.run("UPDATE usuarios SET badges = badges + 1, pokecoins = pokecoins + ?, gym_progress = NULL WHERE id_usuario = ?", [badgeInfo.reward, userId]);
            
            return `${log}\n🏆 *VITÓRIA NO GINÁSIO!*\nVocê derrotou o Líder ${badgeInfo.leaderName}!\n\n🏅 Recebeu: *Insígnia ${badgeInfo.badgeName}*\n💰 Recebeu: *${badgeInfo.reward} coins*${tmMsg}\n${logMsg}`;
        }

        if (encounter.battle_type === 'TRAINER') {
            const rawReward = encounter.gymData.reward || 500;
            
            const variation = (Math.random() * 0.2) + 0.9; 
            const reward = Math.floor(rawReward * variation);

            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [reward, userId]);
            return `${log}\n🏆 *VOCÊ VENCEU O TREINADOR!*\nRecebeu 💰 ${reward}!\n${logMsg}`;
        }

        const baseGain = 15;
        const luckGain = Math.random() * 25;
        const coins = Math.floor(encounter.level * (baseGain + luckGain));
        await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [coins, userId]);
        return `${log}\n${logMsg}\n💰 +${coins} coins.`;
    }

    async handlePlayerFaint(userId, userPoke, tag, log) {
        const teamAlive = await this.db.get("SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ? AND team_slot > 0 AND current_hp > 0", [userId]);
        
        if (teamAlive.total > 0) {
            return `${log}\n\n💀 *${userPoke.nickname}* está fora de combate!\nUse *!poke trocar [slot]* para escolher outro Pokémon.`;
        } else {
            await this.clearEncounter(userId);
            return `${log}\n\n💀 Toda sua equipe foi derrotada! Você correu para o Centro Pokémon (e perdeu algumas moedas na fuga...).`;
        }
    }

    async processEnemyTurn(encounter, userPoke, battleState, userId) {
        let log = "";
        const enemyName = encounter.pokemon.name;

        // --- LÓGICA DE FUGA ---
        if (encounter.battle_type === 'WILD' && !encounter.isShiny) {
            const encounterData = encounter.extra_data ? JSON.parse(encounter.extra_data) : {};
            const wildNature = encounter.gymData?.nature || encounterData.nature || 'hardy';
            const runMultipliers = {
                'timid': 2.5, 'hasty': 2.5, 'jolly': 2.5, 'naive': 2.5, 'careful': 2.0,
                'brave': 0.2, 'bold': 0.2, 'relaxed': 0.2, 'sassy': 0.2, 'serious': 0.2,
                'default': 1.0
            };
            const hpPercent = Math.max(0, encounter.currentHp / encounter.maxHp);
            const hpLost = 1.0 - hpPercent;
            const baseFleeChance = 0.04 * (1 + hpLost);
            const natureMult = runMultipliers[wildNature] || runMultipliers['default'];
            let rarityMult = 1.0;
            if (encounter.pokemon.rarity === 'rare') rarityMult = 0.0; 
            else if (RARE_POKE.includes(encounter.pokemon.id)) rarityMult = 0.5;

            const finalFleeChance = baseFleeChance * natureMult * rarityMult;

            if (finalFleeChance > 0 && Math.random() < finalFleeChance) {
                await this.clearEncounter(userId);
                return `🏃💨 O **${encounter.pokemon.name}** selvagem fugiu!`;
            }
        }        

        // --- CHECAGEM DE STATUS ---
        const enemyCheck = await this.checkStatusBeforeMove(battleState, false, encounter, null, null);
        
        if (enemyCheck.log) log += `\n${enemyCheck.log}`;
        
        if (enemyCheck.selfDamage) {
            const selfDmg = Math.floor(encounter.maxHp * 0.15);
            encounter.currentHp -= selfDmg;
            log += ` (HP: ${encounter.currentHp}/${encounter.maxHp})`;
        }

        if (!enemyCheck.canMove) {
            return log; 
        }

        // --- ESCOLHA DO GOLPE ---
        const validMoves = encounter.moves.filter(m => m.current_pp > 0);
        let wildMove = encounter.moves[Math.floor(Math.random() * encounter.moves.length)] || {name: "Investida", power: 40, damage_class: 'physical', type: 'normal'};
        
        if (validMoves.length === 0) {
            wildMove = { name: "Struggle", power: 50, damage_class: 'physical', type: 'normal' };
            log += `\n⚠️ ${encounter.pokemon.name} não tem mais PP! Usou *Struggle*!`;
        } else {
            const moveIndex = Math.floor(Math.random() * validMoves.length);
            wildMove = validMoves[moveIndex];
            const originalMove = encounter.moves.find(m => m.name === wildMove.name);
            if (originalMove) originalMove.current_pp--;
            await this.db.run("UPDATE active_encounters SET moves = ? WHERE user_id = ?", [JSON.stringify(encounter.moves), userId]);
        }

        // Nature Power Transform
        if (wildMove.name === 'nature-power') {
            const natureOptions = [
                { name: 'swift', power: 60, type: 'normal', damage_class: 'special' },
                { name: 'razor-leaf', power: 55, type: 'grass', damage_class: 'special' },
                { name: 'rock-slide', power: 75, type: 'rock', damage_class: 'physical' },
                { name: 'bubble-beam', power: 65, type: 'water', damage_class: 'special' }, 
                { name: 'earthquake', power: 100, type: 'ground', damage_class: 'physical' },
                { name: 'shadow-ball', power: 80, type: 'ghost', damage_class: 'special' }
            ];
            const transformed = natureOptions[Math.floor(Math.random() * natureOptions.length)];
            wildMove = { ...wildMove, ...transformed };
            log += `\n🌿 *Nature Power* se transformou em *${transformed.name}*!`;
        }

        // --- PRECISÃO (Hit Check) ---
        let moveAcc = wildMove.accuracy === null ? 100 : wildMove.accuracy;
        const alwaysHitMoves = ['swift', 'aerial-ace', 'faint-attack', 'magical-leaf', 'shock-wave', 'shadow-punch'];
        let enemyMissed = false;

        if (!alwaysHitMoves.includes(wildMove.name) && moveAcc < 999) {
            const accStage = battleState.stages.enemy.acc || 0;
            const evaStage = battleState.stages.user.eva || 0; 
            let combinedStage = Math.max(-6, Math.min(6, accStage - evaStage));
            const stageMultipliers = {
                '-6': 0.33, '-5': 0.38, '-4': 0.43, '-3': 0.50, '-2': 0.60, '-1': 0.75,
                '0': 1.0, '1': 1.33, '2': 1.67, '3': 2.0, '4': 2.33, '5': 2.67, '6': 3.0
            };
            const hitChance = moveAcc * (stageMultipliers[String(combinedStage)] || 1.0);

            if (Math.random() * 100 > hitChance) {
                enemyMissed = true;
                log += `\n💨 *${encounter.pokemon.name}* tentou usar ${wildMove.name}, mas errou!`;
            }
        }
        
        if (enemyMissed) return log;

        let damageToUser = 0;
        const enemyEmojis = this.getTypeEmojis(encounter.pokemon.type1, encounter.pokemon.type2);
        const enemyDisplayName = `${encounter.pokemon.name} ${enemyEmojis}`;

        // --- EXECUÇÃO DO GOLPE (CÁLCULO DE DANO) ---
        if (wildMove.damage_class === 'status') {
            const res = await this.processStatusMove(wildMove.name, battleState, false, encounter.maxHp, encounter.pokemon);
            log += `\n✨ ${enemyDisplayName} ${res.msg}`;

            if (res.selfDamage && res.selfDamage > 0) {
                encounter.currentHp -= res.selfDamage;
                // Atualiza o HP do inimigo no banco
                await this.db.run(`UPDATE active_encounters SET current_hp = MAX(0, ?) WHERE user_id = ?`, [encounter.currentHp, userId]);
                
                log += ` (Inimigo perdeu ${res.selfDamage} HP)`;
            }
            
            if (res.healAmount > 0) {
                encounter.currentHp = Math.min(encounter.maxHp, encounter.currentHp + res.healAmount);
                await this.db.run(`UPDATE active_encounters SET current_hp = MAX(0, ?) WHERE user_id = ?`, [encounter.currentHp, userId]);
            }
        } else {
            // Cálculo de Atributos
            const enemyAtkReal = Math.floor(((2 * encounter.pokemon.base_atk + 15) * encounter.level) / 100 + 5);
            const enemySpaReal = Math.floor(((2 * encounter.pokemon.base_spa + 15) * encounter.level) / 100 + 5);
            let calcEnemyAtk = (wildMove.damage_class === 'special') ? enemySpaReal : enemyAtkReal;

            const userDefReal = this.computeStat(
                userPoke.base_def, 
                userPoke.iv_def, 
                userPoke.ev_def || 0,
                userPoke.level, 
                userPoke.nature, 
                'def'
            );
            
            const userSpdReal = this.computeStat(
                userPoke.base_spd, 
                userPoke.iv_spd, 
                userPoke.ev_spd || 0,
                userPoke.level, 
                userPoke.nature, 
                'spd'
            );

            let calcUserDef = (wildMove.damage_class === 'special') ? userSpdReal : userDefReal;     

            // Buffs/Debuffs
            let stageEnemyAtk = (wildMove.damage_class === 'physical') ? battleState.stages.enemy.atk : battleState.stages.enemy.spa;
            let stageUserDef = (wildMove.damage_class === 'physical') ? battleState.stages.user.def : battleState.stages.user.spd;
            let finalWildAtk = this.applyStages(calcEnemyAtk, stageEnemyAtk);
            let finalUserDef = this.applyStages(calcUserDef, stageUserDef);

            // Fórmula de Dano
            const calcDmg = (lvl, pwr, atk, def) => Math.floor(((2 * lvl / 5 + 2) * pwr * (atk / def)) / 50 + 2);
            damageToUser = calcDmg(encounter.level, wildMove.power, finalWildAtk, finalUserDef) + 1;

            // Multiplicador de Tipo
            const getTypeMultiplier = (moveType, t1, t2) => {
               if (!moveType || !TYPE_CHART[moveType.toLowerCase()]) return 1;
               let m = 1;
               const typeData = TYPE_CHART[moveType.toLowerCase()];
               if (t1) { const val = typeData[t1.toLowerCase()]; m *= (val !== undefined ? val : 1); }
               if (t2) { const val = typeData[t2.toLowerCase()]; m *= (val !== undefined ? val : 1); }
               return m;
            }

            const typeMultEnemy = getTypeMultiplier(wildMove.type, userPoke.type1, userPoke.type2);
            damageToUser = Math.floor(damageToUser * typeMultEnemy);
            if (damageToUser < 1 && typeMultEnemy > 0) damageToUser = 1;

            // Crítico e Variação
            if (Math.random() < 0.0625) { damageToUser *= 2; log += `\n⚠️ *CRÍTICO DO INIMIGO!*`; }
            damageToUser = Math.floor(damageToUser * ((Math.random() * 0.15) + 0.85));

            // STAB
            if (wildMove.type === encounter.pokemon.type1 || wildMove.type === encounter.pokemon.type2) {
                damageToUser = Math.floor(damageToUser * 1.5);
            }

            // Aplica Dano no Usuário
            await this.db.run(`UPDATE user_pokemons SET current_hp = current_hp - ? WHERE id = ?`, [damageToUser, userPoke.id]);
            
            if(wildMove.name.toLowerCase() === 'struggle') log +=`\n`;
            else log +=`\n💢 ${enemyDisplayName} usou *${wildMove.name}*!\n`;

            log += `Te causou **${damageToUser}** de dano.`;
            if (typeMultEnemy > 1) log += ` (Super Efetivo!)`;
            if (typeMultEnemy < 1 && typeMultEnemy > 0) log += ` (Não muito efetivo...)`;
        }

        const enemyPokeObj = {
            ...encounter.pokemon,
            current_hp: encounter.currentHp,
            max_hp: encounter.maxHp,
            nickname: encounter.pokemon.name
        };

        const specialEffects = this.processSpecialMoveEffects(wildMove, enemyPokeObj, userPoke, damageToUser, battleState, false);
        log += specialEffects.log;

        if (specialEffects.selfDamage > 0) {
            encounter.currentHp -= specialEffects.selfDamage;
            log += ` (Inimigo sofreu ${specialEffects.selfDamage} de dano)`;
        }

        if (specialEffects.flee || specialEffects.forceSwitch) {
            if (encounter.battle_type === 'WILD') {
                await this.clearEncounter(userId);
                return `${log}\n🏃💨 A batalha acabou!`;
            } else log += ` (Mas falhou!)`;
        }
        
        // Roar/Whirlwind Inimigo
        if (specialEffects.forceSwitch) {
            if (encounter.battle_type === 'WILD') {
                await this.clearEncounter(userId);
                return `${log}\n🏃💨 Você foi espantado da batalha!`;
            } 
            else {
                const team = await this.db.all("SELECT id, nickname FROM user_pokemons WHERE user_id = ? AND team_slot > 0 AND current_hp > 0 AND id != ?", [userId, userPoke.id]);
                if (team.length === 0) log += ` (Mas falhou! Você não tem outros Pokémon!)`;
                else {
                    const randomPoke = team[Math.floor(Math.random() * team.length)];
                    await this.db.run(`UPDATE active_encounters SET active_pokemon_id = ? WHERE user_id = ?`, [randomPoke.id, userId]);
                    log += `\n🔄 **${userPoke.nickname}** foi forçado a sair!\n👉 **${randomPoke.nickname}** foi arrastado para o campo!`;
                }
            }
        }

        if (wildMove.name === 'Struggle') {
                const recoil = Math.floor(encounter.maxHp / 4);
                encounter.currentHp -= recoil;
                log += `\n💥 *${encounter.pokemon.name}* sofreu **${recoil}** de dano pelo recuo!`;
        }
        
        return log;
    }

    async catchPokemon(groupId, userId, param) {
        const tag = await this.getUserTag(userId);
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return `${tag}🤷 Nenhuma batalha ativa.`;
        if (encounter.isGym) return `${tag}🚫 Você não pode roubar o Pokémon do Líder!`;
        if (encounter.battle_type === 'TRAINER' || encounter.battle_type === 'GYM_TRAINER') return `${tag}🚫 Você não pode roubar o Pokémon de outro treinador! Isso é crime!`;

        const ballType = param ? param.toLowerCase().trim() : 'pokeball';
        let selectedBall = 'pokeball';
        let multiplier = 1.0;

        if (ballType.includes('ultra')) { selectedBall = 'ultraball'; multiplier = 2.0; }
        else if (ballType.includes('great')) { selectedBall = 'greatball'; multiplier = 1.5; }
        else if (ballType.includes('poke') || ballType === 'bola') { selectedBall = 'pokeball'; multiplier = 1.0; }
        else {
            selectedBall = 'pokeball'; 
        }

        const hasBall = await this.removeItem(userId, selectedBall, 1);
        if (!hasBall) {
            if (selectedBall !== 'pokeball') return `${tag}🚫 Você não tem **${selectedBall}**! Compre na loja.`;
            return `${tag}🚫 Sem Pokébolas! Compre na loja.`;
        }

        const userPoke = await this.db.get(`
            SELECT up.*, p.base_def, p.base_spd, p.type1, p.type2, p.base_atk, p.base_spa 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.id = ?`, 
            [encounter.activePokemonId]
        );

        const isFainted = userPoke && userPoke.current_hp <= 0;

        const xp = encounter.pokemon.base_xp || 60;
        let estimatedCatchRate = Math.floor(5000 / xp); 
        
        estimatedCatchRate = Math.max(15, Math.min(200, estimatedCatchRate));

        let hpFactor = ((3 * encounter.maxHp) - (2 * encounter.currentHp)) / (3 * encounter.maxHp);
        
        let statusFactor = isFainted ? 0.75 : 1.0; 

        let finalChance = (estimatedCatchRate / 255) * hpFactor * multiplier * statusFactor;

        finalChance += 0.05; 

        console.log(`[CATCH] ${encounter.pokemon.name} | Rate: ${estimatedCatchRate} | HP Fac: ${hpFactor.toFixed(2)} | Ball: ${multiplier} | Final: ${(finalChance*100).toFixed(1)}%`);

        if (Math.random() < finalChance) {
            const pk = encounter.pokemon;
            const randIv = () => Math.floor(Math.random() * 32);
            const ivHp = randIv();
            const realMaxHp = Math.floor(((2 * pk.base_hp + ivHp + 100) * encounter.level) / 100 + 10);
            const initialXp = this.computeXp(encounter.level);

            let m1 = encounter.moves[0]?.id;
            let m2 = encounter.moves[1]?.id;
            let m3 = encounter.moves[2]?.id;
            let m4 = encounter.moves[3]?.id;
            
            if(!m1) {
                const t = await this.db.get("SELECT id FROM moves WHERE name='tackle'");
                m1 = t ? t.id : null;
            }

            const pp1 = encounter.moves[0]?.pp || (m1 ? 35 : null);
            const pp2 = encounter.moves[1]?.pp || null;
            const pp3 = encounter.moves[2]?.pp || null;
            const pp4 = encounter.moves[3]?.pp || null;

            const nature = this.getRandomNature(); 

            const slots = await this.db.all("SELECT team_slot FROM user_pokemons WHERE user_id = ? AND team_slot IS NOT NULL ORDER BY team_slot ASC", [userId]);
            const occupiedSlots = slots.map(s => s.team_slot);
            const totalPokes = await this.db.get("SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ?", [userId]);
            
            let targetSlot = 1;
            if (totalPokes.total > 0 && occupiedSlots.length === 0) {
                targetSlot = totalPokes.total + 1;
            } else {
                while (occupiedSlots.includes(targetSlot)) { targetSlot++; }
            }

            await this.db.run(`
                INSERT INTO user_pokemons (user_id, pokedex_id, nickname, level, exp, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, move1, move2, move3, move4, move1_pp, move2_pp, move3_pp, move4_pp, obtained_at, is_shiny, current_hp, max_hp, team_slot, nature)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, pk.id, pk.name, encounter.level, initialXp, ivHp, randIv(), randIv(), randIv(), randIv(), randIv(), 
                 m1, m2, m3, m4, 
                 pp1, pp2, pp3, pp4,
                 Date.now(), encounter.isShiny?1:0, realMaxHp, realMaxHp, targetSlot, nature]
            );

            const wildDex = await this.db.get("SELECT base_xp FROM pokedex WHERE id = ?", [encounter.pokedex_id]);
            
            let xpMsg

            if (userPoke && wildDex) {
                xpMsg = await this.gainExperience(userPoke, wildDex, encounter.level, 1, 0.5, userId);
            }

            await this.clearEncounter(userId);
            
            let msg = `${tag}🎉 Capturou *${encounter.pokemon.name}* usando uma **${selectedBall}**!`;
            
            if(isFainted) msg += `\n😅 Foi por pouco! Você capturou sem Pokémon em campo!`;
            
            if (targetSlot > 6) msg += `\n📦 Time cheio! Enviado para o PC (Box ${targetSlot - 6}).`;
            else msg += `\n✅ Adicionado ao time principal.`;
            if(userPoke && wildDex) msg += `\n${xpMsg?.replace('✨ Ganhou', '🔹 Ganhou')}`;
            return msg;
        }

        let msg = `${tag}💢 A **${selectedBall}** quebrou! O *${encounter.pokemon.name}* escapou!`;

        if (isFainted) {
            return msg + `\n😓 Como você está sem Pokémon, o *${encounter.pokemon.name}* te ignorou.\n🍀 Chance de captura reduzida nessa situação!`;
        }

        if (userPoke) {
            const encounterRaw = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
            let battleState = this.getBattleState(encounterRaw, userPoke);

            const enemyLog = await this.processEnemyTurn(encounter, userPoke, battleState, userId);
            msg += enemyLog;

            const updatedUserPoke = await this.db.get("SELECT current_hp, nickname FROM user_pokemons WHERE id = ?", [userPoke.id]);
            
            if (updatedUserPoke.current_hp <= 0) {
            const hasBackup = await this.db.get("SELECT id FROM user_pokemons WHERE user_id = ? AND team_slot > 0 AND current_hp > 0 AND id != ?", [userId, userPoke.id]);
            
                if (hasBackup) {
                    msg += `\n\n💀 *${updatedUserPoke.nickname}* desmaiou!\nA batalha continua! Use *!poke trocar [slot]* para enviar o próximo!`;
                } else {
                    await this.clearEncounter(userId);
                    msg += `\n\n🏴 Você não tem mais Pokémon capazes de lutar!\nVocê correu para o CP (use *!poke curar*).`;
                }
            }
        }

        return msg;
    }

    async fleeBattle(groupId, userId) {        
        const tag = await this.getUserTag(userId);
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return `${tag}Não tem de quem fugir.`;
        await this.clearEncounter(userId);
        return `${tag}🏃‍♂️ Você fugiu com sucesso (e deixou a sua dignidade pra trás).`;
    }

    async useItem(groupId, userId, param) {
        const tag = await this.getUserTag(userId);
        const args = param.split(' ');
        const itemName = args[0]?.toLowerCase();
        
        // Permite passar o slot: !poke usar potion 2
        const targetSlot = parseInt(args[1]) || 1; 
        
        let itemId = '';
        if (['potion', 'pocao'].includes(itemName)) itemId = 'potion';
        else if (['superpotion', 'super'].includes(itemName)) itemId = 'superpotion';
        else if (['hyperpotion', 'hyper'].includes(itemName)) itemId = 'hyperpotion';
        else if (['rarecandy', 'candy', 'doce'].includes(itemName)) itemId = 'rare-candy';
        else {
            return `${tag}💊 *USAR ITEM*\nUse: *!poke usar [item] [slot]*\nEx: _!poke usar potion 1_\n\nItens suportados:\n• poção, super, hyper\n• candy (Rare Candy)`;
        }

        const hasItem = await this.removeItem(userId, itemId, 1);
        if (!hasItem) return `${tag}🚫 Você não tem **${itemId}** na mochila!`;

        const encounter = await this.loadEncounter(userId);
        let targetPoke = null;

        // --- SELECIONA O ALVO ---
        if (encounter) {
            targetPoke = await this.db.get("SELECT * FROM user_pokemons WHERE id = ?", [encounter.activePokemonId]);
        } else {
            targetPoke = await this.db.get("SELECT * FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, targetSlot]);
        }

        if (!targetPoke) {
            await this.addItem(userId, itemId, 1); // Devolve o item
            return `${tag}🚫 Nenhum Pokémon encontrado no slot ${targetSlot}.`;
        }

        // --- LÓGICA: RARE CANDY ---
        if (itemId === 'rare-candy') {
            if (encounter) {
                await this.addItem(userId, itemId, 1);
                return `${tag}🚫 O Professor Oak diz: "Não é hora de usar isso!" (Saia da batalha para evoluir).`;
            }

            if (targetPoke.level >= 100) {
                await this.addItem(userId, itemId, 1);
                return `${tag}🚫 ${targetPoke.nickname} já está no nível máximo!`;
            }

            const nextLvlXp = this.computeXp(targetPoke.level + 1);
            const xpNeeded = nextLvlXp - targetPoke.exp;
            
            const res = await this.applyPassiveXp(targetPoke, xpNeeded);
            
            let msg = `${tag}🍬 **Rare Candy!**\n${targetPoke.nickname} subiu para o Nível ${res.newLevel}!`;
            if (res.extraMsg) msg += `\n${res.extraMsg}`;
            
            return msg;
        }

        // --- LÓGICA: POÇÕES ---
        let healAmount = 0;
        if (itemId === 'potion') healAmount = 20;
        if (itemId === 'superpotion') healAmount = 50;
        if (itemId === 'hyperpotion') healAmount = 200;

        if (targetPoke.current_hp >= targetPoke.max_hp) {
             await this.addItem(userId, itemId, 1);
             return `${tag}O HP de ${targetPoke.nickname} já está cheio!`;
        }

        const oldHp = targetPoke.current_hp;
        const newHp = Math.min(targetPoke.max_hp, targetPoke.current_hp + healAmount);
        const healed = newHp - oldHp;

        // Se estiver em batalha, atualiza active_encounters também se for o pokemon ativo
        if (encounter && targetPoke.id === encounter.activePokemonId) {
        }

        await this.db.run("UPDATE user_pokemons SET current_hp = ? WHERE id = ?", [newHp, targetPoke.id]);

        let msg = `${tag}🧪 Usou **${itemId}** em ${targetPoke.nickname}!\nRecuperou +${healed} HP (${newHp}/${targetPoke.max_hp}).`;

        // SE ESTIVER EM BATALHA: O INIMIGO ATACA
        if (encounter) {
            const encounterRaw = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
            let battleState = this.getBattleState(encounterRaw);
            
            const enemyLog = await this.processEnemyTurn(encounter, targetPoke, battleState, userId);
            msg += `\n${enemyLog}`;

            if (battleState.counters.user) battleState.counters.user.flinched = false;
            if (battleState.counters.enemy) battleState.counters.enemy.flinched = false;
            
            let finalExtraData = encounterRaw.extra_data ? JSON.parse(encounterRaw.extra_data) : {};
            finalExtraData.stages = battleState.stages;
            finalExtraData.counters = battleState.counters;
            await this.db.run("UPDATE active_encounters SET extra_data = ? WHERE user_id = ?", [JSON.stringify(finalExtraData), userId]);
        }

        return msg;
    }
    
    async healTeam(userId) {        
        const tag = await this.getUserTag(userId);
        const encounter = await this.loadEncounter(userId);
        if(encounter) return `${tag}🚫 Termine a batalha antes de curar!`;
        await this.db.run("UPDATE user_pokemons SET current_hp = max_hp, status = NULL WHERE user_id = ?", [userId]);
        await this.db.run(`
            UPDATE user_pokemons 
            SET move1_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move1),
                move2_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move2),
                move3_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move3),
                move4_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move4)
            WHERE user_id = ?
        `, [userId]);
        return `${tag}🏥 Pokémon curados e PP restaurados!`;
    }

    async showShop(userId) {
        const user = await this.db.get("SELECT pokecoins FROM usuarios WHERE id_usuario = ?", [userId]);
        
        const standardItems = await this.db.all("SELECT * FROM items WHERE type != 'tm' AND price > 0 ORDER BY type ASC, price ASC");
        
        const dailyTMs = await this.getDailyShopItems();

        const allShopItems = [...standardItems, ...dailyTMs];
        
        let msg = `🏪 *POKÉ MART & TMs* (💰 ${user.pokecoins})\n` +
                  `_Os TMs mudam todo dia!_\n\n`;
        
        let currentType = '';
        const typeNames = {
            'ball': '🔴 Pokébolas',
            'medicine': '🧪 Medicamentos',
            'held': '💡 Equipamentos',
            'stone': '💎 Pedras',
            'tm': '💿 TMs (Estoque Diário)'
        };

        allShopItems.forEach((item, index) => {
            if (item.type !== currentType) {
                currentType = item.type;
                msg += `\n*${typeNames[currentType] || '📦 Outros'}*\n`;
            }
            msg += `${index + 1}. **${item.name}** - 💰 ${item.price}\n   _${item.description}_\n`;
        });

        msg += `\n🛒 Use: *!poke comprar [numero] [qtd]*\nEx: _!poke comprar 1 10_`;
        return msg;
    }

    async buyItem(userId, itemIndex, amount) {
        const tag = await this.getUserTag(userId);
        const qtd = parseInt(amount) || 1;
        const user = await this.db.get("SELECT pokecoins FROM usuarios WHERE id_usuario = ?", [userId]);
        
        const standardItems = await this.db.all("SELECT * FROM items WHERE type != 'tm' AND price > 0 ORDER BY type ASC, price ASC");
        const dailyTMs = await this.getDailyShopItems();
        const allShopItems = [...standardItems, ...dailyTMs];

        const selectedItem = allShopItems[parseInt(itemIndex) - 1];

        if (!selectedItem) return `${tag}🚫 Item número ${itemIndex} não existe na loja de hoje.`;

        // Regra do Exp. Share
        if (selectedItem.id === 'exp-share') {
            if (qtd > 1) return `${tag}🚫 Você só precisa de um Exp. Share.`;
            const hasItem = await this.getItemCount(userId, 'exp-share');
            const equipped = await this.db.get("SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ? AND held_item = 'exp-share'", [userId]);
            if (hasItem > 0 || equipped.total > 0) return `${tag}🚫 Você já possui este item!`;
        }

        const cost = selectedItem.price * qtd;
        if (user.pokecoins < cost) return `${tag}🚫 Dinheiro insuficiente (Custa 💰${cost}).`;

        // Transação
        await this.db.run("UPDATE usuarios SET pokecoins = pokecoins - ? WHERE id_usuario = ?", [cost, userId]);
        await this.addItem(userId, selectedItem.id, qtd);
        
        return `${tag}✅ Comprou ${qtd}x **${selectedItem.name}**!\n💰 Saldo restante: ${user.pokecoins - cost}`;
    }

    async showStarters(sender) {
        const tag = await this.getUserTag(sender);
        if (await this.checkIfUserHasPokemon(sender)) return `${tag}🚫 Você já tem um Pokémon!`;
        
        return `${tag}🌟 *ESCOLHA SEU INICIAL* 🌟\n\n` +
               `🍃 *TIPO GRAMA:*\n` +
               `• *Bulbasaur*\n` +
               `• *Chikorita*\n` +
               `• *Treecko*\n\n` +
               
               `🔥 *TIPO FOGO:*\n` +
               `• *Charmander*\n` +
               `• *Cyndaquil*\n` +
               `• *Torchic*\n\n` +
               
               `💧 *TIPO ÁGUA:*\n` +
               `• *Squirtle*\n` +
               `• *Totodile*\n` +
               `• *Mudkip*\n\n` +
               
               `Digite: *!poke escolher [nome]*\n` +
               `Ex: _!poke escolher mudkip_`;
    }

    async chooseStarter(userId, choice) {        
        const tag = await this.getUserTag(userId);
        if (await this.checkIfUserHasPokemon(userId)) return `${tag}🚫 Você já iniciou sua jornada!`;
        
        const c = choice.toLowerCase().trim();
        let id = 0;

        if (c.includes('bulb')) id = 1;
        else if (c.includes('charm')) id = 4;
        else if (c.includes('squirt')) id = 7;
        else if (c.includes('chiko')) id = 152;
        else if (c.includes('cynda')) id = 155;
        else if (c.includes('toto')) id = 158;
        else if (c.includes('tree')) id = 252;
        else if (c.includes('torch')) id = 255;
        else if (c.includes('mud')) id = 258;
        else return `${tag}❌ Inicial inválido! Escolha um da lista. Ex: !poke escolher squirtle (o GOAT).`;

        const pk = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [id]);
        if (!pk) return `${tag}⚠️ Os dados da Gen 3 ainda estão baixando... Tente novamente em alguns minutos!`;

        const moves = await this.getMovesForLevel(pk.id, 5);
        
        const level = 5;
        const nature = this.getRandomNature();
        const ivs = this.generateRandomIVs();
        const stats = this.generateStats(pk, ivs, level, nature);
        const initialXp = this.computeXp(level);

        const m1 = moves[0]?.id || null;
        const m2 = moves[1]?.id || null;
        const m3 = moves[2]?.id || null;
        const m4 = moves[3]?.id || null;        

        const pp1 = moves[0]?.pp || (m1 ? 35 : null);
        const pp2 = moves[1]?.pp || null;
        const pp3 = moves[2]?.pp || null;
        const pp4 = moves[3]?.pp || null;

        await this.db.run(`INSERT INTO user_pokemons 
            (user_id, pokedex_id, nickname, level, exp, current_hp, max_hp, 
             move1, move1_pp, move2, move2_pp, move3, move3_pp, move4, move4_pp, 
             obtained_at, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, team_slot, nature) 
            VALUES (?,?,?,?, ?,?,?, ?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?, ?)`,
            [
                userId, pk.id, pk.name, level, initialXp, stats.hp, stats.hp,
                m1, pp1, m2, pp2, m3, pp3, m4, pp4,
                Date.now(), ivs.hp, ivs.atk, ivs.def, ivs.spa, ivs.spd, ivs.spe, 1, nature 
            ]
        );

        await this.addItem(userId, 'pokeball', 20);
        await this.addItem(userId, 'potion', 5);

        return `${tag}🎉 Parabéns! Você escolheu *${pk.name}* como parceiro!\n🎒 Você recebeu 20 Pokébolas e 5 Poções de presente!`;
    }

    async getTeamMoves(userId) {
        const tag = await this.getUserTag(userId);
        
        const team = await this.db.all(`
            SELECT up.*, p.name, p.type1, p.type2 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.user_id = ? AND up.team_slot IS NOT NULL AND up.team_slot < 7
            ORDER BY up.team_slot ASC`, [userId]);
            
        if (!team.length) return `${tag}Seu time está vazio!`;
        
        let msg = `${tag}⚔️ *GOLPES DO TIME*\n\n`;
        
        for (const p of team) {
            const types = this.getTypeEmojis(p.type1, p.type2);
            msg += `*${p.team_slot}. ${p.nickname}* ${types} (Lvl ${p.level})\n`;
            
            const moves = await this.getUserMoves(p);
            
            if (moves.length === 0) {
                msg += `   (Sem golpes)\n`;
            } else {
                moves.forEach((m, i) => {
                    const current = m.current_pp !== undefined ? m.current_pp : m.pp;
                    const max = m.pp;
                    
                    let classIcon = "✨";
                    if (m.damage_class === 'physical') classIcon = "💥";
                    else if (m.damage_class === 'special') classIcon = "🔮";

                    const powerText = m.power > 0 ? `PWR: ${m.power}` : "PWR: -";

                    msg += `   ${i+1}. ${m.name} (${m.type}) ${classIcon} | ${powerText} | [${current}/${max} PP]\n`;
                });
            }
            msg += `\n`;
        }
        
        return msg;
    }

    async getUserMoves(userPoke) {
        const ids = [userPoke.move1, userPoke.move2, userPoke.move3, userPoke.move4];
        const pps = [userPoke.move1_pp, userPoke.move2_pp, userPoke.move3_pp, userPoke.move4_pp];
        
        const moves = [];
        for (let i = 0; i < 4; i++) {
            if (ids[i]) {
                const m = await this.db.get("SELECT * FROM moves WHERE id = ?", [ids[i]]);
                if (m) {
                    m.current_pp = pps[i]; 
                    moves.push(m);
                }
            }
        }
        if(!moves.length) return [{name:"tackle", power:40, damage_class:'physical', type:'normal', current_pp: 35}];
        return moves;
    }

    async getMovesForLevel(pid, lvl) {
        return await this.db.all(`SELECT m.* FROM pokemon_moves pm JOIN moves m ON pm.move_id = m.id WHERE pm.pokemon_id = ? AND pm.level_learned <= ? ORDER BY pm.level_learned DESC LIMIT 4`, [pid, lvl]);
    }

    // Tenta ensinar um golpe
    async attemptLearnMove(userPoke, moveId) {
        const currentMoves = [userPoke.move1, userPoke.move2, userPoke.move3, userPoke.move4];
        if (currentMoves.includes(moveId)) {
            return { success: false, reason: 'already_known', msg: "já conhece esse movimento." };
        }

        const move = await this.db.get("SELECT name FROM moves WHERE id = ?", [moveId]);
        if (!move) return { success: false, reason: 'invalid_move', msg: "movimento inválido." };

        const emptyIndex = currentMoves.indexOf(null);

        if (emptyIndex !== -1) {
            await this.db.run(`UPDATE user_pokemons SET move${emptyIndex + 1} = ? WHERE id = ?`, [moveId, userPoke.id]);
            
            userPoke[`move${emptyIndex + 1}`] = moveId; 
            
            return { success: true, learned: true, moveName: move.name, msg: `aprendeu *${move.name}*!` };
        } else {
            // Vai para pending_move
            await this.db.run(`UPDATE user_pokemons SET pending_move = ? WHERE id = ?`, [moveId, userPoke.id]);
            
            userPoke.pending_move = moveId;

            return { 
                success: true, 
                learned: false, 
                pending: true, 
                moveName: move.name, 
                msg: `quer aprender *${move.name}*, mas já tem 4 golpes. Use *!poke esquecer [1-4]*!` 
            };
        }
    }

    async gainExperience(userPoke, enemy, enemyLevel, splitFactor = 1, multiplier, userId) {
        if (userPoke.pending_move) {
            const moveName = (await this.db.get("SELECT name FROM moves WHERE id = ?", [userPoke.pending_move]))?.name;
            return `⚠️ ${userPoke.nickname} ainda está tentando aprender *${moveName}*!\nUse *!poke esquecer [1-4]* ou *!poke ignorar*.`;
        }

        let lvl = userPoke.level;
        let msg = "";
        let stopLvlUp = false;

        let totalXp = Math.floor((enemy.base_xp * enemyLevel * multiplier) / 7);
        let xp = Math.floor(totalXp / splitFactor);
        
        if (xp < 1) xp = 1;

        let newXp = userPoke.exp + xp;

        while(newXp >= this.computeXp(lvl+1) && !stopLvlUp) {
            lvl++;
            msg += `\n🆙 Subiu para Nvl ${lvl}!`;

            const learnedMoves = await this.db.all(
                `SELECT m.id, m.name FROM pokemon_moves pm
                 JOIN moves m ON pm.move_id = m.id
                 WHERE pm.pokemon_id = ? AND pm.level_learned = ?`,
                [userPoke.pokedex_id, lvl]
            );
            
            for (const move of learnedMoves) {
                const res = await this.attemptLearnMove(userPoke, move.id);
                if (res.success) {
                    msg += `\n💡 ${res.msg}`;
                }
            }
        }
        
        if (!stopLvlUp) {
            if(lvl > userPoke.level) {
                const newHp = this.computeStat(userPoke.base_hp, userPoke.iv_hp, userPoke.ev_hp || 0, lvl, userPoke.nature, 'hp');
                await this.db.run("UPDATE user_pokemons SET exp=?, level=?, max_hp=?, current_hp=? WHERE id=?", [newXp, lvl, newHp, newHp, userPoke.id]);
            } else {
                await this.db.run("UPDATE user_pokemons SET exp=? WHERE id=?", [newXp, userPoke.id]);
            }
        }

        const evoCheck = await this.db.get("SELECT evolve_to, evolve_level FROM pokedex WHERE id = ?", [userPoke.pokedex_id]);
        
        if (evoCheck && evoCheck.evolve_to && lvl >= evoCheck.evolve_level) {
            const nextEvo = await this.db.get("SELECT name FROM pokedex WHERE id = ?", [evoCheck.evolve_to]);
            if (nextEvo) {
                const slotMsg = userPoke.team_slot ? `Use *!poke evoluir ${userPoke.team_slot}*` : "Coloque-o no time e use *!poke evoluir [slot]*";
                msg += `\n✨ *${userPoke.nickname} pode evoluir para ${nextEvo.name}!*\n${slotMsg}`;
            }
        }

        return `✨ Ganhou ${xp} XP.${msg}`;
    }

    async evolvePokemon(groupId, userId, param, sock) {
        const tag = await this.getUserTag(userId);
        const slot = parseInt(param);
        
        if (isNaN(slot)) return `${tag}⚠️ Uso correto: *!poke evoluir [slot]*\nEx: _!poke evoluir 1_`;

        const pokemon = await this.db.get(`
            SELECT up.*, p.name as species_name, p.evolve_to, p.evolve_level, p.base_hp
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? AND up.team_slot = ?`, [userId, slot]);

        if (!pokemon) return `${tag}🚫 Não há Pokémon no slot ${slot}.`;

        if (!pokemon.evolve_to) return `${tag}🤷 *${pokemon.nickname}* já está na forma final (ou não evolui por nível).`;
        
        if (pokemon.level < pokemon.evolve_level) {
            return `${tag}⏳ *${pokemon.nickname}* ainda não está pronto para evoluir.\nNível atual: ${pokemon.level} | Necessário: ${pokemon.evolve_level}`;
        }

        const nextForm = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [pokemon.evolve_to]);
        if (!nextForm) return `${tag}❌ Erro: Evolução desconhecida na Pokédex.`;

        const newMaxHp = this.computeStat(nextForm.base_hp, pokemon.iv_hp, pokemon.ev_hp || 0, pokemon.level, pokemon.nature, 'hp');
        const hpDiff = newMaxHp - pokemon.max_hp;
        const newCurrentHp = pokemon.current_hp + hpDiff;

        let newNickname = pokemon.nickname;
        if (pokemon.nickname === pokemon.species_name) {
            newNickname = nextForm.name;
        }

        await this.db.run(`
            UPDATE user_pokemons 
            SET pokedex_id = ?, nickname = ?, max_hp = ?, current_hp = ?
            WHERE id = ?`, 
            [nextForm.id, newNickname, newMaxHp, newCurrentHp, pokemon.id]
        );

        const typeEmojis = this.getTypeEmojis(nextForm.type1, nextForm.type2);
        
        const caption = `${tag}🎆 *O QUE? ${pokemon.nickname} ESTÁ EVOLUINDO!* 🎆\n\n` +
                        `✨ Parabéns! Seu *${pokemon.species_name}* evoluiu para *${nextForm.name}* ${typeEmojis}!\n` +
                        `❤️ HP Máximo subiu de ${pokemon.max_hp} para ${newMaxHp}!`;

        if (sock) {
            const sprite = pokemon.is_shiny ? nextForm.sprite_url.replace("front_default", "front_shiny") : nextForm.sprite_url;
            try { 
                await sock.sendMessage(groupId, { image: { url: sprite }, caption: caption }); 
                return null;
            } 
            catch (e) { 
                return caption;
            }
        }
        
        return caption;
    }

    async learnPendingMove(userId, choice) {
        const userPoke = await this.db.get("SELECT * FROM user_pokemons WHERE user_id = ? AND pending_move IS NOT NULL", [userId]);
        
        if (!userPoke) return "🤷 Não tem nenhum Pokémon querendo aprender golpe agora.";

        const newMove = await this.db.get("SELECT name FROM moves WHERE id = ?", [userPoke.pending_move]);

        if (choice === 'ignorar' || choice === 'cancelar') {
            await this.db.run("UPDATE user_pokemons SET pending_move = NULL WHERE id = ?", [userPoke.id]);
            return `💨 ${userPoke.nickname} desistiu de aprender *${newMove.name}*.`;
        }

        const slot = parseInt(choice);
        if (isNaN(slot) || slot < 1 || slot > 4) {
            return "🚫 Escolha um slot de 1 a 4. Ex: *!poke trocar 1*";
        }

        const oldMoveId = userPoke[`move${slot}`];
        const oldMoveName = await this.getMoveName(oldMoveId);

        await this.db.run(
            `UPDATE user_pokemons SET move${slot} = ?, pending_move = NULL WHERE id = ?`, 
            [userPoke.pending_move, userPoke.id]
        );

        return `✅ ${userPoke.nickname} esqueceu *${oldMoveName}* e aprendeu *${newMove.name}*!`;
    }

    async getMoveName(moveId) {
        if (!moveId) return "---";
        const m = await this.db.get("SELECT name FROM moves WHERE id = ?", [moveId]);
        return m ? m.name : "---";
    }

    async getUserProfile(userId) {
        const pokes = await this.db.all(`SELECT p.name, p.type1, p.type2, up.level, up.is_shiny FROM user_pokemons up JOIN pokedex p ON up.pokedex_id = p.id WHERE up.user_id = ?`, [userId]);
        
        const u = await this.db.get("SELECT pokeballs, pokecoins, potions, badges FROM usuarios WHERE id_usuario = ?", [userId]);
        if(!pokes.length) return "Sem pokémon.";

        return `👤 *PERFIL*\n💰 ${u.pokecoins} | 🔴 ${u.pokeballs} | 🧪 ${u.potions} | 🏅 ${u.badges}\n\n` + 
               pokes.map(p => `${p.is_shiny?'✨':''} ${p.name} ${this.getTypeEmojis(p.type1, p.type2)} (Lvl ${p.level})`).join('\n');
    }
}

module.exports = PokemonHandler;