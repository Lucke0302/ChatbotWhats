const axios = require('axios');
const { gracefulShutdown } = require('node-schedule');
const { generate } = require('qrcode-terminal');
const STARTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 152, 153, 154, 155, 156, 157, 158, 159, 160, 252, 253, 254, 255, 256, 257, 258, 259, 260];
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
const GYM_LEADERS = [
    { badge: 0, leader: "Brock", city: "Pewter", pokeId: 95, level: 12, moves: ["Investida", "Lançamento de Rocha"], reward: 1000, badgeName: "Rocha" }, // Onix
    { badge: 1, leader: "Misty", city: "Cerulean", pokeId: 121, level: 18, moves: ["Jato d'Água", "Investida"], reward: 2000, badgeName: "Cascata" } // Starmie
]
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

class PokemonHandler {
    constructor(db) {
        this.db = db;
    }

    async init() {
        const pokeCount = await this.db.get('SELECT COUNT(*) as total FROM pokedex');
        const moveCount = await this.db.get('SELECT COUNT(*) as total FROM moves');

        if (pokeCount.total === 0 || moveCount.total < 50) {
            console.log(`⚠️ Banco de dados incompleto ou com poucos golpes (Moves: ${moveCount.total}).`);
            console.log("⬇️ Iniciando download da PokéAPI (Versão FireRed/LeafGreen)...");
            await this.seedDatabase();
        } else {
            console.log(`✅ Pokédex carregada: ${pokeCount.total} Pokémons e ${moveCount.total} Golpes.`);
        }
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

        return `✅ Limpeza completa!\n- Duplicatas do sistema removidas.\n- ${count} Pokémons atualizados com os golpes certos.`;
    }

    async fixNullMoves() {
        console.log("🔧 Iniciando reparo de moveset dos Pokémons...");
        
        const buggedPokemons = await this.db.all("SELECT id, pokedex_id, level, nickname FROM user_pokemons WHERE move1 IS NULL OR move1 = ''");

        if (buggedPokemons.length === 0) {
            return "✅ Todos os Pokémons já estão com golpes!";
        }

        console.log(`🔧 Encontrados ${buggedPokemons.length} Pokémons sem golpes. Corrigindo...`);
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

        console.log(`✅ Reparo concluído! ${count} Pokémons atualizados.`);
        return `✅ Correção finalizada! ${count} Pokémons receberam golpes novos.`;
    }

    async fixZeroXp() {
        console.log("🔧 Corrigindo XP inicial dos Pokémons...");
        
        const pokemons = await this.db.all("SELECT id, level, exp, nickname FROM user_pokemons");
        let count = 0;

        for (const p of pokemons) {
            const minXp = Math.pow(p.level, 3);
            
            if (p.exp < minXp) {
                await this.db.run("UPDATE user_pokemons SET exp = ? WHERE id = ?", [minXp, p.id]);
                count++;
            }
        }
        console.log(`✅ XP Corrigido! ${count} Pokémons atualizados.`);
        return `✅ Ajuste de XP concluído! ${count} Pokémons deixaram de ser "café com leite".`;
    }

    async fixNullIvs() {
        const brokenPokes = await this.db.all("SELECT id FROM user_pokemons WHERE iv_hp IS NULL");
        
        for (const poke of brokenPokes) {
            
            const randIv = () => Math.floor(Math.random() * 32);

            await this.db.run(`UPDATE user_pokemons SET iv_hp=?, iv_atk=?, iv_def=?, iv_spa=?, iv_spd=?, iv_spe=? WHERE id = ?`, [randIv(), randIv(), randIv(), randIv(), randIv(), randIv(), poke.id]);
        }
        return `✅ IVs corrigidos para ${brokenPokes.length} Pokémons.`;
    }

    async fixNullHp() {
        const bugados = await this.db.all("SELECT up.id, up.level, up.iv_hp, dex.base_hp FROM user_pokemons up JOIN pokedex dex ON up.pokedex_id = dex.id WHERE up.max_hp IS NULL");
        for(const b of bugados){
            const newHp = Math.floor(((2 * b.base_hp + (b.iv_hp || 15) + 100) * b.level) / 100 + 10);
            await this.db.run("UPDATE user_pokemons SET max_hp = ?, current_hp = ? WHERE id = ?", [newHp, newHp, b.id]);
        }
        return `🔧 ${bugados.length} Pokémon consertados.`;
    }

    async seedDatabase() {
        const downloadedMoves = new Set();
        console.log(`⬇️ Iniciando Seed Gen 1-3 (Até ${POKEMON_COUNT})...`);
        
        for (let i = 1; i <= POKEMON_COUNT; i++) {
            const existing = await this.db.get("SELECT id FROM pokedex WHERE id = ? AND evolve_to IS NOT NULL", [i]);
            if (existing) continue;

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
                    m.version_group_details.some(v => (v.version_group.name === 'emerald' || v.version_group.name === 'firered-leafgreen') && v.move_learn_method.name === 'level-up')
                );

                for (const m of validMoves) {
                    const moveName = m.move.name;
                    let versionDetail = m.version_group_details.find(v => v.version_group.name === 'emerald');
                    if (!versionDetail) versionDetail = m.version_group_details.find(v => v.version_group.name === 'firered-leafgreen');
                    
                    const level = versionDetail ? versionDetail.level_learned_at : 1;
                    
                    let moveId;
                    const existingMove = await this.db.get("SELECT id FROM moves WHERE name = ?", [moveName]);

                    if (existingMove) {
                        moveId = existingMove.id;
                    } else if (!downloadedMoves.has(moveName)) {
                        const moveData = (await axios.get(m.move.url)).data;
                        if (moveData.power || moveData.meta?.category?.name) {
                            await this.db.run(`INSERT INTO moves (id, name, type, power, accuracy, pp, damage_class) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [moveData.id, moveData.name, moveData.type.name, moveData.power || 0, moveData.accuracy || 100, moveData.pp, moveData.damage_class.name]);
                            moveId = moveData.id;
                            downloadedMoves.add(moveName);
                        }
                    }

                    if (moveId) {
                        await this.db.run(`INSERT OR IGNORE INTO pokemon_moves (pokemon_id, move_id, level_learned) VALUES (?, ?, ?)`, [pk.id, moveId, level]);
                    }
                }
                
                if (i % 10 === 0) console.log(`[SEED] Progresso Gen 3: ${i}/${POKEMON_COUNT}...`);
            } catch (e) {
                console.error(`Erro ID ${i}:`, e.message);
            }
        }
        console.log("✅ Seed Gen 3 Completo!");
    }

    getBattleState(encounter) {
        let data = encounter.extra_data ? JSON.parse(encounter.extra_data) : {};
        
        if (!data.stages) {
            data.stages = {
                user: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0 },
                enemy: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0 }
            };
        }
        return data;
    }

    applyStages(statValue, stage) {
        if (!stage || stage === 0) return statValue;
        
        const multiplier = stage > 0 
            ? (2 + stage) / 2 
            : 2 / (2 + Math.abs(stage));
            
        return Math.floor(statValue * multiplier);
    }

    async processStatusMove(moveName, state, isPlayerTurn, maxHp) {
        const effect = STATUS_MOVES[moveName.toLowerCase()];
        
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

        // Falta programar a lógica dos efeitos
        if (effect.status) {
            if (state[targetKey + 'Status']) {
                result.msg = `usou ${moveName}, mas falhou!`;
            } else {
                state[targetKey + 'Status'] = effect.status; 
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

    async getTeam(userId) {
        const team = await this.db.all(`
            SELECT up.*, p.name 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.user_id = ? AND up.team_slot IS NOT NULL AND up.team_slot < 7
            ORDER BY up.team_slot ASC`, [userId]);
            
        if (!team.length) return "Seu time está vazio!";
        
        let msg = "🧢 *SEU TIME*\n";
        team.forEach(p => {
            const status = p.current_hp <= 0 ? "💀" : "❤️";
            msg += `${p.team_slot}. ${status} ${p.nickname} (Lvl ${p.level}) - HP: ${p.current_hp}/${p.max_hp}\n`;
        });
        return msg;
    }

    async switchPokemon(userId, param) {
        const encounter = await this.loadEncounter(userId);

        if (!encounter) {
            const args = param.split(' ').map(n => parseInt(n));
            const slotA = args[0];
            const slotB = args[1];

            if (args.some(slot => slot > 6)) {
                return "🚫 Para mover Pokémons do PC (Slot 7+), use o comando *!poke pc*.";
            }

            if (!slotA || !slotB || isNaN(slotA) || isNaN(slotB)) {
                return "🛠️ *Gerenciar Time*\nPara mudar a ordem, use: *!poke trocar [pos1] [pos2]*\nEx: _!poke trocar 1 2_ (O líder vira o segundo)";
            }

            const pokeA = await this.db.get("SELECT id, nickname FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, slotA]);
            const pokeB = await this.db.get("SELECT id, nickname FROM user_pokemons WHERE user_id = ? AND team_slot = ?", [userId, slotB]);

            if (!pokeA || !pokeB) return "🚫 Um dos slots informados está vazio ou não existe.";

            await this.db.run("UPDATE user_pokemons SET team_slot = -1 WHERE id = ?", [pokeA.id]);
            await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [slotA, pokeB.id]);
            await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [slotB, pokeA.id]);

            return `🔄 Time reordenado! *${pokeA.nickname}* agora é o slot ${slotB} e *${pokeB.nickname}* é o slot ${slotA}.`;
        }

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

        await this.db.run(`UPDATE active_encounters SET active_pokemon_id = ? WHERE user_id = ?`, [targetPoke.id, userId]);

        const encounterData = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
        let extraData = encounterData.extra_data ? JSON.parse(encounterData.extra_data) : { participants: [] };

        if (!extraData.participants) extraData.participants = [];

        if (!extraData.participants.includes(targetPoke.id)) {
            extraData.participants.push(targetPoke.id);

            await this.db.run("UPDATE active_encounters SET extra_data = ? WHERE user_id = ?", [JSON.stringify(extraData), userId]);
        }

        let log = `🔄 **Você trocou para ${targetPoke.nickname}!**\n`;

        const encounterRaw = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
        let battleState = this.getBattleState(encounterRaw);

        const enemyTurnLog = await this.processEnemyTurn(encounter, targetPoke, battleState, userId);
        
        return log + enemyTurnLog;
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
                msg += `📦 *${boxNum}*. ${shiny}${p.nickname} (Lvl ${p.level}) - HP: ${p.current_hp}/${p.max_hp}\n`;
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

        if (!teamPoke) return `🚫 Não tem ninguém no slot ${teamSlot} do seu time.`;
        if (!pcPoke) return `🚫 Não tem ninguém na Box ${pcBoxNum} do PC (Slot real ${realPcSlot}).`;

        await this.db.run("UPDATE user_pokemons SET team_slot = -1 WHERE id = ?", [teamPoke.id]);
        await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [teamSlot, pcPoke.id]);
        await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [realPcSlot, teamPoke.id]);

        return `🔄 **Troca no PC realizada!**\n\n📤 Saiu: *${teamPoke.nickname}* (Foi pro PC ${pcBoxNum})\n📥 Entrou: *${pcPoke.nickname}* (No slot ${teamSlot})`;
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
            case 'swap':
            case 'esquecer':
                return await this.learnPendingMove(sender, param);

            case 'time':
            case 'team':
                return await this.getTeam(sender);

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
                if (param === 'potion' || param === 'pocao') return await this.usePotion(from, sender);
                return "Usar o quê? Tente: *!poke usar poção*";

            case 'loja': 
            case 'shop': 
            case 'mart': 
                return await this.showShop(sender);

            case 'comprar': 
            case 'buy': 
                return await this.buyItem(sender, param, args[3]);

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
                return await this.spawnWildPokemon(from, sender, sock);
            
            case 'capturar': 
            case 'catch': 
            case 'ball': 
                return await this.catchPokemon(from, sender);

            case 'perfil': 
            case 'box': 
            case 'team': 
                return await this.getUserProfile(sender);

            case 'pc':
            case 'storage':
            case 'box':
                return await this.handlePCCommand(sender, param);
            
            case 'ajuda': 
            default:
                return `🦕 *POKÉMON - GUIA*\n\n🌿 *!poke explorar*\n⚔️ *!poke atacar*\n🔴 *!poke capturar*\n🏥 *!poke curar*\n🏪 *!poke loja*\n🧪 *!poke usar poção*\n🏛️ *!poke ginasio*\n👤 *!poke perfil*`;
        }
    }

    async loadEncounter(userId) {
        const encounter = await this.db.get(`
            SELECT ae.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe, p.sprite_url, p.base_xp
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
            },
            
            activePokemonId: encounter.active_pokemon_id,
            currentHp: encounter.current_hp,
            maxHp: encounter.max_hp,
            level: encounter.level,
            isShiny: !!encounter.is_shiny,
            moves: JSON.parse(encounter.moves || '[]'),
            battle_type: encounter.battle_type,
            isGym: encounter.battle_type === 'GYM',
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
            WHERE up.user_id = ? AND up.team_slot IS NOT NULL AND up.current_hp > 0 
            ORDER BY up.team_slot ASC LIMIT 1`, [userId]);

        if (!leadPoke) return "🚑 Seus Pokémon estão desmaiados! Cure-os antes de aceitar desafios.";

        const lvlResult = await this.db.get(`SELECT AVG(level) as media FROM user_pokemons WHERE user_id = ?`, [userId]);
        const userAvgLvl = lvlResult && lvlResult.media ? Math.floor(lvlResult.media) : 5;

        let possibleTrainers = TRAINER_DATA;

        if (badges === 0) {
            const weakTrainers = TRAINER_DATA.filter(t => {
                if (!t.type) return false;
                
                const eff1 = (TYPE_CHART[leadPoke.type1] && TYPE_CHART[leadPoke.type1][t.type]) || 1;
                
                const eff2 = (leadPoke.type2 && TYPE_CHART[leadPoke.type2] && TYPE_CHART[leadPoke.type2][t.type]) || 1;

                return eff1 >= 2 || eff2 >= 2;
            });

            if (weakTrainers.length > 0) {
                possibleTrainers = weakTrainers;
            }
        }

        const trainerTemplate = possibleTrainers[Math.floor(Math.random() * possibleTrainers.length)];
        const trainerName = trainerTemplate.names[Math.floor(Math.random() * trainerTemplate.names.length)];
        const trainerClass = trainerTemplate.class;

        let teamSize = (Math.floor(Math.random() * 3) + 1) + Math.floor(badges / 2);
        if (teamSize > 6) teamSize = 6;

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
            if (!moves.length) moves = [{name: "tackle", power: 40, damage_class: 'physical', type: 'normal'}];
            
            const moveObjects = moves.map(m => ({
                name: m.name, power: m.power, type: m.type, damage_class: m.damage_class
            }));

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
            reward: 100 + (badges * 50) + (userAvgLvl * 10), 
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
        const caption = `⚠️ *DESAFIO DE TREINADOR!*\n` +
                        `**${trainerClass} ${trainerName}** quer batalhar!\n` +
                        `Ele enviou *${firstPokeData.name}* (Lvl ${firstPokeData.level})!\n` +
                        `Pokémons do Treinador: ${trainerTeam.length}\n` +
                        `Use *!poke atacar* para lutar!`;

        if (sock) {
            try { await sock.sendMessage(groupId, { image: { url: trainerTemplate.sprite }, caption: caption }); } 
            catch (e) { await sock.sendMessage(groupId, { text: caption }); }
            return null;
        }
        return caption;
    }


    async spawnWildPokemon(groupId, userId, sock) {
        const existing = await this.loadEncounter(userId);
        if (existing) {
            return `🚫 Você já está em batalha contra *${existing.pokemon.name}*! Termine ela primeiro.`;
        }

        // Encontro com treinador!
        if (Math.random() < 0.2) {
             const hasMinLvl = await this.db.get("SELECT level FROM user_pokemons WHERE user_id = ? ORDER BY level DESC LIMIT 1", [userId]);
             if (hasMinLvl && hasMinLvl.level >= 5) {
                 return await this.spawnTrainer(groupId, userId, sock);
             }
        }

        const user = await this.db.get("SELECT badges FROM usuarios WHERE id_usuario = ?", [userId]);
        const badges = user.badges || 0;

        const leadPoke = await this.db.get(`
            SELECT id FROM user_pokemons 
            WHERE user_id = ? AND team_slot IS NOT NULL AND current_hp > 0 
            ORDER BY team_slot ASC LIMIT 1`, [userId]);

        if (!leadPoke) return "🚑 Todos os seus Pokémon estão desmaiados! Cure-os antes de batalhar.";
        
        const lvlResult = await this.db.get(`SELECT AVG(level) as media FROM user_pokemons WHERE user_id = ?`, [userId]);
        const userAvgLvl = lvlResult && lvlResult.media ? Math.floor(lvlResult.media) : 5;
        
        const minLvl = Math.max(2, userAvgLvl - 2 + Math.floor(badges / 2));
        const wildLevel = minLvl + Math.floor(Math.random() * 5);

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

        if (!pokemon) {
            pokemon = await this.db.get(`SELECT * FROM pokedex WHERE rarity = 'common' AND tier <= ? ORDER BY RANDOM() LIMIT 1`, [maxTier]);
        }

        if (!pokemon) {
            pokemon = await this.db.get(`SELECT * FROM pokedex WHERE id = 19`); 
        }

        let wildMoves = await this.getMovesForLevel(pokemon.id, wildLevel);
        if (!wildMoves || wildMoves.length === 0) wildMoves = [{name: "tackle", power: 40, damage_class: 'physical', type: 'normal'}];

        const wildHp = Math.floor(((2 * pokemon.base_hp + 15 + 100) * wildLevel) / 100 + 10);
        const isShiny = Math.random() < shinyChance;

        const extraData = { participants: [leadPoke.id] };

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, started_at, active_pokemon_id, extra_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'WILD', ?, ?, ?)`,
            [userId, groupId, pokemon.id, wildHp, wildHp, wildLevel, isShiny ? 1 : 0, JSON.stringify(wildMoves), Date.now(), leadPoke.id, JSON.stringify(extraData)]
        );

        let emoji = isShiny ? "✨" : "⚔️";

        const caption = `${emoji} Um *${pokemon.name.toUpperCase()}* (Lvl ${wildLevel}) selvagem apareceu!\n` +
                        `❤️ HP: ${wildHp}/${wildHp}\n` +
                        `Use *!poke atacar* ou *!poke capturar*`;

        if (sock) {
            const sprite = isShiny ? pokemon.sprite_url.replace("front_default", "front_shiny") : pokemon.sprite_url;
            try { await sock.sendMessage(groupId, { image: { url: sprite }, caption: caption }); } 
            catch (e) { await sock.sendMessage(groupId, { text: caption }); }
            return null; 
        }
        return caption;
    }

    async challengeGym(groupId, userId, sock) {
        const existing = await this.loadEncounter(userId);
        if (existing) return "Termine sua batalha atual primeiro!";

        const leadPoke = await this.db.get(`
            SELECT id FROM user_pokemons 
            WHERE user_id = ? AND team_slot IS NOT NULL AND current_hp > 0 
            ORDER BY team_slot ASC LIMIT 1`, [userId]);

        if (!leadPoke) return "🚑 Todos os seus Pokémon estão desmaiados!";

        const user = await this.db.get("SELECT badges FROM usuarios WHERE id_usuario = ?", [userId]);
        const currentBadge = user.badges || 0;

        const gymLeader = await this.db.get("SELECT * FROM gym_leaders WHERE id = ?", [currentBadge]);
        if (!gymLeader) return "🏆 Você já venceu todos os líderes disponíveis (por enquanto)!";

        const team = JSON.parse(gymLeader.team_json);
        if (!team || team.length === 0) return "❌ Erro: Líder sem pokémons.";

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
                damage_class: found.damage_class
            } : { 
                name: mName, power: 40, type: 'normal', damage_class: 'physical' // Fallback
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
            ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'GYM', ?, ?, ?)`,
            [userId, groupId, bossPokemon.id, bossHp, bossHp, firstPokeData.level, JSON.stringify(bossMoves), JSON.stringify(extraData), Date.now(), leadPoke.id]
        );

        const caption = `🏛️ *GINÁSIO DE ${gymLeader.city.toUpperCase()}*\nLíder **${gymLeader.name}** enviou *${bossPokemon.name}* (Lvl ${firstPokeData.level})!\n⚠️ *Boss HP:* ${bossHp}/${bossHp}\nPokémons restantes do Líder: ${remainingTeam.length + 1}\nDigite *!poke atacar*`;

        if (sock) {
            await sock.sendMessage(groupId, { image: { url: bossPokemon.sprite_url }, caption: caption });
        }
        return null;
    }

    async battleTurn(groupId, userId, moveSlot, sock) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "Não tem batalha rolando. Use *!poke explorar*.";

        const userPoke = await this.db.get(`
            SELECT up.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe 
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.id = ? AND up.user_id = ?`, [encounter.activePokemonId, userId]);

        if (!userPoke) return "Cadê seu Pokémon?";

        if (userPoke.current_hp <= 0) {
            const teamAlive = await this.db.get("SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ? AND team_slot IS NOT NULL AND current_hp > 0", [userId]);
            if (teamAlive.total > 0) {
                return `💀 *${userPoke.nickname}* está fora de combate!\nUse *!poke trocar [slot]* para escolher outro Pokémon.`;
            } else {
                await this.clearEncounter(userId);
                return `💀 Toda sua equipe foi derrotada! Você correu para o Centro Pokémon.`;
            }
        }

        if (!moveSlot) {
            const moves = await this.getUserMoves(userPoke);
            let msg = `👊 *${userPoke.nickname}* (HP: ${userPoke.current_hp}/${userPoke.max_hp})\n*Ataques:*\n`;
            moves.forEach((m, i) => msg += `${i+1}. ${m.name} (${m.type})\n`);
            msg += `\nUse: *!poke atacar 1*`;
            return msg;
        }

        const encounterRaw = await this.db.get("SELECT extra_data FROM active_encounters WHERE user_id = ?", [userId]);
        let battleState = this.getBattleState(encounterRaw);

        if (!battleState.participants) battleState.participants = [];
        
        if (!battleState.participants.includes(userPoke.id)) {
            battleState.participants.push(userPoke.id);
            let currentExtraData = encounterRaw.extra_data ? JSON.parse(encounterRaw.extra_data) : {};
            currentExtraData.participants = battleState.participants;
            await this.db.run("UPDATE active_encounters SET extra_data = ? WHERE user_id = ?", [JSON.stringify(currentExtraData), userId]);
        }

        const getTypeMultiplier = (moveType, targetType1, targetType2) => {
            if (!moveType) return 1;
            const attackerChart = TYPE_CHART[moveType.toLowerCase()];
            if (!attackerChart) return 1;
            let mult = 1;
            if (targetType1 && attackerChart[targetType1.toLowerCase()] !== undefined) mult *= attackerChart[targetType1.toLowerCase()];
            if (targetType2 && attackerChart[targetType2.toLowerCase()] !== undefined) mult *= attackerChart[targetType2.toLowerCase()];
            return mult;
        };

        const selectedMove = (await this.getUserMoves(userPoke))[parseInt(moveSlot) - 1];
        if (!selectedMove) return "Golpe inválido!";

        const calcDmg = (lvl, pwr, atk, def) => Math.floor(((2 * lvl / 5 + 2) * pwr * (atk / def)) / 50 + 2);

        let log = "";
        let damageToWild = 0;

        // TURNO DO JOGADOR
        if (selectedMove.damage_class === 'status') {
            const res = await this.processStatusMove(selectedMove.name, battleState, true, userPoke.max_hp);
            log += `✨ ${userPoke.nickname} ${res.msg}\n`;

            if (res.healAmount > 0) {
                userPoke.current_hp = Math.min(userPoke.max_hp, userPoke.current_hp + res.healAmount);
                await this.db.run("UPDATE user_pokemons SET current_hp = ? WHERE id = ?", [userPoke.current_hp, userPoke.id]);
            }
        } else {
            const userAtkReal = Math.floor(((2 * userPoke.base_atk + (userPoke.iv_atk || 15)) * userPoke.level) / 100 + 5);
            const userSpaReal = Math.floor(((2 * userPoke.base_spa + (userPoke.iv_spa || 15)) * userPoke.level) / 100 + 5);
            let calcAtk = (selectedMove.damage_class === 'special') ? userSpaReal : userAtkReal;

            const enemyDefReal = Math.floor(((2 * encounter.pokemon.base_def + 15) * encounter.level) / 100 + 5);
            const enemySpdReal = Math.floor(((2 * encounter.pokemon.base_spd + 15) * encounter.level) / 100 + 5);
            let calcDef = (selectedMove.damage_class === 'special') ? enemySpdReal : enemyDefReal;

            let stageAtk = (selectedMove.damage_class === 'physical') ? battleState.stages.user.atk : battleState.stages.user.spa;
            let stageDef = (selectedMove.damage_class === 'physical') ? battleState.stages.enemy.def : battleState.stages.enemy.spd;
            let finalAtk = this.applyStages(calcAtk, stageAtk);
            let finalDef = this.applyStages(calcDef, stageDef);

            damageToWild = calcDmg(userPoke.level, selectedMove.power, finalAtk, finalDef);

            if (selectedMove.type === userPoke.type1 || selectedMove.type === userPoke.type2) {
                damageToWild = Math.floor(damageToWild * 1.5);
            }

            const typeMult = getTypeMultiplier(selectedMove.type, encounter.pokemon.type1, encounter.pokemon.type2);
            damageToWild = Math.floor(damageToWild * typeMult);

            if (damageToWild < 1 && typeMult > 0) damageToWild = 1;

            if (Math.random() < 0.05) {
                damageToWild = Math.floor(damageToWild * 2);
                log += `🎯 *GOLPE CRÍTICO!* 🎯\n`;
            }

            damageToWild = Math.floor(damageToWild * ((Math.random() * 0.15) + 0.85));
            encounter.currentHp -= damageToWild;

            log += `🗡️ ${userPoke.nickname} usou *${selectedMove.name}* e causou **${damageToWild}** de dano.\n`;

            if (typeMult > 1) log += `⚔️ *É super efetivo!* (x${typeMult})\n`;
            if (typeMult < 1 && typeMult > 0) log += `🛡️ *Não é muito efetivo...* (x${typeMult})\n`;
            if (typeMult === 0) log += `❌ *Não afetou o inimigo...*\n`;
        }

        // FIM DA BATALHA OU TROCA DE OPONENTE
        if (encounter.currentHp <= 0) {
            let participants = battleState.participants || [userPoke.id];
            const uniqueParticipants = [...new Set(participants)];
            const splitFactor = uniqueParticipants.length;

            let logMsg = `💀 O inimigo desmaiou!\n`;

            let xpMultiplier = 1.0;
            if (encounter.battle_type === 'GYM') xpMultiplier = 2.5; 
            else if (encounter.battle_type === 'TRAINER') xpMultiplier = 1.5;

            for (const pId of uniqueParticipants) {
                const p = await this.db.get(`
                    SELECT up.*, dex.base_hp 
                    FROM user_pokemons up 
                    JOIN pokedex dex ON up.pokedex_id = dex.id 
                    WHERE up.id = ?`, [pId]);
                
                if (p) {
                    const xpMsg = await this.gainExperience(p, encounter.pokemon, encounter.level, splitFactor, xpMultiplier);
                    logMsg += `\n🔹 *${p.nickname}*: ${xpMsg.replace('✨ Ganhou', 'Ganhou')}`; 
                }
            }

            if ((encounter.isGym || encounter.battle_type === 'TRAINER') && encounter.gymData.remainingTeam && encounter.gymData.remainingTeam.length > 0) {
                const nextPokeData = encounter.gymData.remainingTeam.shift(); 
                
                encounter.gymData.participants = []; 
                
                const nextPokeDex = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [nextPokeData.pokedex_id]);
                
                const nextMoveNames = nextPokeData.moves;
                const placeholders = nextMoveNames.map(() => '?').join(',');
                const dbMoves = await this.db.all(`SELECT * FROM moves WHERE name IN (${placeholders})`, nextMoveNames);
                
                const nextMoves = nextMoveNames.map(mName => {
                    const found = dbMoves.find(dbm => dbm.name === mName);
                    return found ? {
                        name: found.name,
                        power: found.power,
                        type: found.type,
                        damage_class: found.damage_class
                    } : { 
                        name: mName, power: 40, type: 'normal', damage_class: 'physical' 
                    };
                });

                const hpMult = encounter.isGym ? 1.5 : 1.2;
                const nextHp = Math.floor(Math.floor(((2 * nextPokeDex.base_hp + 31 + 100) * nextPokeData.level) / 100 + 10) * hpMult);

                await this.db.run(`
                    UPDATE active_encounters 
                    SET pokedex_id = ?, current_hp = ?, max_hp = ?, level = ?, moves = ?, extra_data = ?
                    WHERE user_id = ?`,
                    [nextPokeDex.id, nextHp, nextHp, nextPokeData.level, JSON.stringify(nextMoves), JSON.stringify(encounter.gymData), userId]
                );

                const title = encounter.isGym ? 'Líder' : 'Treinador';
                return `${log}\n${logMsg}\n\n🚨 *${title} ${encounter.gymData.leaderName}* enviou *${nextPokeDex.name}* (Lvl ${nextPokeData.level})!\nA batalha continua!`;
            }

            // VITÓRIA FINAL
            await this.clearEncounter(userId);

            if (encounter.isGym) {
                const badgeInfo = encounter.gymData;
                await this.db.run("UPDATE usuarios SET badges = badges + 1, pokecoins = pokecoins + ? WHERE id_usuario = ?", [badgeInfo.reward, userId]);
                return `${log}\n🏆 *VITÓRIA NO GINÁSIO!*\nRecebeu Insígnia ${badgeInfo.badgeName} e 💰 ${badgeInfo.reward}!\n${logMsg}`;
            }

            if (encounter.battle_type === 'TRAINER') {
                const reward = encounter.gymData.reward || 500;
                await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [reward, userId]);
                return `${log}\n🏆 *VOCÊ VENCEU O TREINADOR!*\nRecebeu 💰 ${reward}!\n${logMsg}`;
            }

            const baseGain = 15;
            const luckGain = Math.random() * 25;
            const coins = Math.floor(encounter.level * (baseGain + luckGain));
            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [coins, userId]);
            
            return `${log}\n${logMsg}\n💰 +${coins} coins.`;
        }

        // TURNO DO INIMIGO
        const enemyLog = await this.processEnemyTurn(encounter, userPoke, battleState, userId);
        log += enemyLog;

        await this.db.run(`UPDATE active_encounters SET current_hp = ? WHERE user_id = ?`, [encounter.currentHp, userId]);

        const updatedUserPoke = await this.db.get("SELECT current_hp, max_hp, nickname FROM user_pokemons WHERE id = ?", [userPoke.id]);
        
        if (updatedUserPoke.current_hp <= 0) {
            const hasBackup = await this.db.get("SELECT id FROM user_pokemons WHERE user_id = ? AND team_slot IS NOT NULL AND current_hp > 0 AND id != ?", [userId, userPoke.id]);
            if (hasBackup) {
                return `${log}\n\n💀 *${updatedUserPoke.nickname}* desmaiou!\nA batalha continua! Use *!poke trocar [slot]* para enviar o próximo!`;
            } else {
                await this.clearEncounter(userId);
                return `${log}\n\n🏴 Você não tem mais Pokémon capazes de lutar!\nVocê perdeu a batalha e correu para o CP (use *!poke curar*).`;
            }
        }

        return `${log}\n\n` +
               `❤️ Inimigo: ${Math.floor(Math.max(0, encounter.currentHp))}/${Math.floor(encounter.maxHp)}\n` +
               `💚 Seu: ${Math.max(0, updatedUserPoke.current_hp)}/${updatedUserPoke.max_hp}\n\n` +
               `⚔️ *!poke atacar [n]*\n` +
               `🔴 *!poke capturar*\n` +
               `🔄 *!poke trocar [n]*\n` +
               `🏃 *!poke fugir*`;
    }

    async processEnemyTurn(encounter, userPoke, battleState, userId) {
        let log = "";

        const wildMove = encounter.moves[Math.floor(Math.random() * encounter.moves.length)] || {name: "Investida", power: 40, damage_class: 'physical', type: 'normal'};
        let damageToUser = 0;

        if (wildMove.damage_class === 'status') {
            const res = await this.processStatusMove(wildMove.name, battleState, false, encounter.maxHp);
            log += `\n✨ Inimigo ${res.msg}`;
            if (res.healAmount > 0) {
                encounter.currentHp = Math.min(encounter.maxHp, encounter.currentHp + res.healAmount);
                await this.db.run(`UPDATE active_encounters SET current_hp = ? WHERE user_id = ?`, [encounter.currentHp, userId]);
            }
        
        } else {
            const enemyAtkReal = Math.floor(((2 * encounter.pokemon.base_atk + 15) * encounter.level) / 100 + 5);
            const enemySpaReal = Math.floor(((2 * encounter.pokemon.base_spa + 15) * encounter.level) / 100 + 5);
            let calcEnemyAtk = (wildMove.damage_class === 'special') ? enemySpaReal : enemyAtkReal;

            const userDefReal = Math.floor(((2 * userPoke.base_def + (userPoke.iv_def || 15)) * userPoke.level) / 100 + 5);
            const userSpdReal = Math.floor(((2 * userPoke.base_spd + (userPoke.iv_spd || 15)) * userPoke.level) / 100 + 5);
            let calcUserDef = (wildMove.damage_class === 'special') ? userSpdReal : userDefReal;

            let stageEnemyAtk = (wildMove.damage_class === 'physical') ? battleState.stages.enemy.atk : battleState.stages.enemy.spa;
            let stageUserDef = (wildMove.damage_class === 'physical') ? battleState.stages.user.def : battleState.stages.user.spd;
            let finalWildAtk = this.applyStages(calcEnemyAtk, stageEnemyAtk);
            let finalUserDef = this.applyStages(calcUserDef, stageUserDef);

            const calcDmg = (lvl, pwr, atk, def) => Math.floor(((2 * lvl / 5 + 2) * pwr * (atk / def)) / 50 + 2);
            damageToUser = calcDmg(encounter.level, wildMove.power, finalWildAtk, finalUserDef);

            const getTypeMultiplier = (moveType, t1, t2) => {
               if (!moveType || !TYPE_CHART[moveType.toLowerCase()]) return 1;
               let m = 1;
               if (t1) m *= (TYPE_CHART[moveType.toLowerCase()][t1.toLowerCase()] || 1);
               if (t2) m *= (TYPE_CHART[moveType.toLowerCase()][t2.toLowerCase()] || 1);
               return m;
            }

            const typeMultEnemy = getTypeMultiplier(wildMove.type, userPoke.type1, userPoke.type2);
            damageToUser = Math.floor(damageToUser * typeMultEnemy);

            if (damageToUser < 1 && typeMultEnemy > 0) {
                damageToUser = 1;
            }

            if (Math.random() < 0.05) { damageToUser *= 2; log += `\n⚠️ *CRÍTICO DO INIMIGO!*`; }
            damageToUser = Math.floor(damageToUser * ((Math.random() * 0.15) + 0.85));

            if (wildMove.type === encounter.pokemon.type1 || wildMove.type === encounter.pokemon.type2) {
                damageToUser = Math.floor(damageToUser * 1.5);
            }

            await this.db.run(`UPDATE user_pokemons SET current_hp = current_hp - ? WHERE id = ?`, [damageToUser, userPoke.id]);
            
            log += `\n💢 ${encounter.pokemon.name} usou *${wildMove.name}*!\nTe causou **${damageToUser}** de dano.`;
            
            if (typeMultEnemy > 1) log += ` (Super Efetivo!)`;
            if (typeMultEnemy < 1 && typeMultEnemy > 0) log += ` (Não muito efetivo...)`;
        }       
        return log;
    }

    async catchPokemon(groupId, userId) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "🤷 Nenhuma batalha ativa.";
        if (encounter.isGym) return "🚫 Você não pode roubar o Pokémon do Líder!";
        if (encounter.battle_type === 'TRAINER') return "🚫 Você não pode roubar o Pokémon de outro treinador! Isso é crime!";

        const user = await this.db.get("SELECT pokeballs FROM usuarios WHERE id_usuario = ?", [userId]);
        if (!user || user.pokeballs <= 0) return "🚫 Sem Pokébolas! Compre na loja.";

        await this.db.run("UPDATE usuarios SET pokeballs = pokeballs - 1 WHERE id_usuario = ?", [userId]);
        
        const catchChance = 0.3 + (0.5 * (1 - (encounter.currentHp / encounter.maxHp)));
        if (Math.random() < catchChance) {
            const pk = encounter.pokemon;
            const randIv = () => Math.floor(Math.random() * 32);
            const ivHp = randIv();
            const realMaxHp = Math.floor(((2 * pk.base_hp + ivHp + 100) * encounter.level) / 100 + 10);
            const initialXp = Math.pow(encounter.level, 3);
            
            let m1 = encounter.moves[0]?.id;
            if(!m1) {
                const t = await this.db.get("SELECT id FROM moves WHERE name='tackle'");
                m1 = t ? t.id : null;
            }

            const slots = await this.db.all("SELECT team_slot FROM user_pokemons WHERE user_id = ? AND team_slot IS NOT NULL ORDER BY team_slot ASC", [userId]);
            const occupiedSlots = slots.map(s => s.team_slot);

            const totalPokes = await this.db.get("SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ?", [userId]);
            
            let targetSlot = 1;

            if (totalPokes.total > 0 && occupiedSlots.length === 0) {
                targetSlot = totalPokes.total + 1;
            } else {
                // Lógica padrão: Procura o primeiro buraco vazio (1, 2, 3...)
                while (occupiedSlots.includes(targetSlot)) {
                    targetSlot++;
                }
            }

            await this.db.run(`
                INSERT INTO user_pokemons (user_id, pokedex_id, nickname, level, exp, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, move1, move2, move3, move4, obtained_at, is_shiny, current_hp, max_hp, team_slot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, pk.id, pk.name, encounter.level, initialXp, ivHp, randIv(), randIv(), randIv(), randIv(), randIv(), m1, encounter.moves[1]?.id, encounter.moves[2]?.id, encounter.moves[3]?.id, Date.now(), encounter.isShiny?1:0, realMaxHp, realMaxHp, targetSlot]
            );
            await this.clearEncounter(userId);
            
            let msg = `🎉 Capturou *${pk.name}*! (Bolas: ${user.pokeballs - 1})`;
            if (targetSlot > 6) {
                msg += `\n📦 Time cheio! Enviado para o PC (Box ${targetSlot - 6}).`;
            } else {
                msg += `\n✅ Adicionado ao time principal.`;
            }
            return msg;
        }
        return `💢 Escapou! (Bolas: ${user.pokeballs - 1})`;
    }

    async fleeBattle(groupId, userId) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "Não tem de quem fugir.";
        await this.clearEncounter(userId);
        return "🏃‍♂️ Você fugiu com sucesso (e deixou a sua dignidade pra trás).";
    }

    async usePotion(groupId, userId) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "Você só pode usar poção em batalha.";
        
        const user = await this.db.get("SELECT potions FROM usuarios WHERE id_usuario = ?", [userId]);
        if (user.potions <= 0) return "Sem poções!";

        const userPoke = await this.db.get("SELECT * FROM user_pokemons WHERE user_id = ? LIMIT 1", [userId]);
        if (userPoke.current_hp >= userPoke.max_hp) return "HP já está cheio.";

        await this.db.run("UPDATE usuarios SET potions = potions - 1 WHERE id_usuario = ?", [userId]);
        await this.db.run("UPDATE user_pokemons SET current_hp = MIN(max_hp, current_hp + 20) WHERE id = ?", [userPoke.id]);

        const wildMove = encounter.moves[0] || {name:"Investida", power:40}; 
        const dmg = 10; 
        await this.db.run("UPDATE user_pokemons SET current_hp = current_hp - ? WHERE id = ?", [dmg, userPoke.id]);

        return `🧪 Usou Poção (+20 HP)!\n💢 Inimigo atacou e tirou ${dmg}.\nSeu HP: ${Math.min(userPoke.max_hp, userPoke.current_hp + 20) - dmg}/${userPoke.max_hp}`;
    }
    
    async healTeam(userId) {
        const encounter = await this.loadEncounter(userId);
        if(encounter) return "🚫 Termine a batalha antes de curar!";
        await this.db.run("UPDATE user_pokemons SET current_hp = max_hp WHERE user_id = ?", [userId]);
        return "🏥 Pokémon curados!";
    }

    async showShop(userId) {
        const user = await this.db.get("SELECT pokecoins, pokeballs, potions FROM usuarios WHERE id_usuario = ?", [userId]);
        return `🏪 *LOJA* (💰 ${user.pokecoins})\n1. 🔴 Bola (200)\n2. 🧪 Poção (300)\nUse: *!poke comprar 1 5*`;
    }

    async buyItem(userId, itemIndex, amount) {
        const qtd = parseInt(amount) || 1;
        const user = await this.db.get("SELECT * FROM usuarios WHERE id_usuario = ?", [userId]);
        let cost = 0, col = "";
        
        if (itemIndex == '1') { cost = 200 * qtd; col = "pokeballs"; }
        else if (itemIndex == '2') { cost = 300 * qtd; col = "potions"; }
        else return "Item inválido.";

        if (user.pokecoins < cost) return "Dinheiro insuficiente.";
        await this.db.run(`UPDATE usuarios SET pokecoins = pokecoins - ?, ${col} = ${col} + ? WHERE id_usuario = ?`, [cost, qtd, userId]);
        return `✅ Compra realizada!`;
    }

    async checkIfUserHasPokemon(userId) {
        return !!(await this.db.get("SELECT id FROM user_pokemons WHERE user_id = ?", [userId]));
    }

    async showStarters(sender) {
        if (await this.checkIfUserHasPokemon(sender)) return "🚫 Você já tem um Pokémon!";
        
        return `🌟 *ESCOLHA SEU INICIAL* 🌟\n\n` +
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
        if (await this.checkIfUserHasPokemon(userId)) return "🚫 Você já iniciou sua jornada!";
        
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
        
        else return "❌ Inicial inválido! Escolha um da lista. Ex: !poke escolher squirtle (o GOAT).";

        const pk = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [id]);
        if (!pk) return "⚠️ Os dados da Gen 3 ainda estão baixando... Tente novamente em alguns minutos!";

        const moves = await this.getMovesForLevel(pk.id, 5);
        
        const randIv = () => Math.floor(Math.random() * 32);
        const hpIv = randIv();
        
        const hp = Math.floor(((2 * pk.base_hp + hpIv + 100) * 5) / 100 + 10);
        const initialXp = Math.pow(5, 3);

        await this.db.run(`INSERT INTO user_pokemons 
            (user_id, pokedex_id, nickname, level, exp, current_hp, max_hp, move1, obtained_at, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, team_slot) 
            VALUES (?,?,?,5, ?,?,?,?,?, ?,?,?,?,?,?, 1)`, 
            [
                userId, pk.id, pk.name, initialXp, hp, hp, moves[0]?.id, Date.now(),
                hpIv, randIv(), randIv(), randIv(), randIv(), randIv(), randIv()
            ]
        );
        
        await this.db.run("UPDATE usuarios SET pokeballs = 20, potions = 5 WHERE id_usuario = ?", [userId]);
        return `🎉 Parabéns! Você escolheu *${pk.name}* como parceiro!`;
    }

    async getUserMoves(userPoke) {
        const ids = [userPoke.move1, userPoke.move2, userPoke.move3, userPoke.move4].filter(i=>i);
        if(!ids.length) return [{name:"Investida", power:40, damage_class:'physical', type:'normal'}];
        const ph = ids.map(()=>'?').join(',');
        return await this.db.all(`SELECT * FROM moves WHERE id IN (${ph})`, ids);
    }

    async getMovesForLevel(pid, lvl) {
        return await this.db.all(`SELECT m.* FROM pokemon_moves pm JOIN moves m ON pm.move_id = m.id WHERE pm.pokemon_id = ? AND pm.level_learned <= ? ORDER BY pm.level_learned DESC LIMIT 4`, [pid, lvl]);
    }

    async gainExperience(userPoke, enemy, enemyLevel, splitFactor = 1, multiplier) {
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

        while(newXp >= Math.pow(lvl+1, 3) && !stopLvlUp) {
            lvl++;
            msg += `\n🆙 Subiu para Nvl ${lvl}!`;

            const learnedMoves = await this.db.all(
                `SELECT m.id, m.name FROM pokemon_moves pm
                 JOIN moves m ON pm.move_id = m.id
                 WHERE pm.pokemon_id = ? AND pm.level_learned = ?`,
                [userPoke.pokedex_id, lvl]
            );

            let currentMoves = [userPoke.move1, userPoke.move2, userPoke.move3, userPoke.move4];
            
            for (const move of learnedMoves) {
                if (currentMoves.includes(move.id)) continue;

                const emptyIndex = currentMoves.indexOf(null);

                if (emptyIndex !== -1) {
                    await this.db.run(`UPDATE user_pokemons SET move${emptyIndex + 1} = ? WHERE id = ?`, [move.id, userPoke.id]);
                    currentMoves[emptyIndex] = move.id;
                    msg += `\n💡 Aprendeu *${move.name}*!`;
                } else {
                    stopLvlUp = true;
                    
                    const newHp = Math.floor(((2*userPoke.base_hp + (userPoke.iv_hp||15) + 100)*lvl)/100+10);
                    
                    await this.db.run(
                        `UPDATE user_pokemons SET exp=?, level=?, max_hp=?, current_hp=?, pending_move=? WHERE id=?`, 
                        [newXp, lvl, newHp, newHp, move.id, userPoke.id]
                    );

                    return `🆙 Subiu para Nvl ${lvl}!\n` +
                           `💡 ${userPoke.nickname} quer aprender *${move.name}*.\n` +
                           `Mas já conhece 4 movimentos:\n` +
                           `1. ${(await this.getMoveName(currentMoves[0]))}\n` +
                           `2. ${(await this.getMoveName(currentMoves[1]))}\n` +
                           `3. ${(await this.getMoveName(currentMoves[2]))}\n` +
                           `4. ${(await this.getMoveName(currentMoves[3]))}\n\n` +
                           `Use: *!poke esquecer 1* (para esquecer o 1º) ou *!poke ignorar*.`;
                }
            }
        }
        
        if (!stopLvlUp) {
            if(lvl > userPoke.level) {
                const newHp = Math.floor(((2*userPoke.base_hp + (userPoke.iv_hp||15) + 100)*lvl)/100+10);
                await this.db.run("UPDATE user_pokemons SET exp=?, level=?, max_hp=?, current_hp=? WHERE id=?", [newXp, lvl, newHp, newHp, userPoke.id]);
            } else {
                await this.db.run("UPDATE user_pokemons SET exp=? WHERE id=?", [newXp, userPoke.id]);
            }
        }

        return `✨ Ganhou ${xp} XP.${msg}`;
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
        const pokes = await this.db.all(`SELECT p.name, up.level, up.is_shiny FROM user_pokemons up JOIN pokedex p ON up.pokedex_id = p.id WHERE up.user_id = ?`, [userId]);
        const u = await this.db.get("SELECT pokeballs, pokecoins, potions, badges FROM usuarios WHERE id_usuario = ?", [userId]);
        if(!pokes.length) return "Sem pokémon.";
        return `👤 *PERFIL*\n💰 ${u.pokecoins} | 🔴 ${u.pokeballs} | 🧪 ${u.potions} | 🏅 ${u.badges}\n\n` + pokes.map(p => `${p.is_shiny?'✨':''} ${p.name} (Lvl ${p.level})`).join('\n');
    }
}

module.exports = PokemonHandler;