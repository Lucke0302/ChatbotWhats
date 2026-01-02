const axios = require('axios');
const STARTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const RARE_POKE = [25]
const POKEMON_COUNT = 151;
const GAME_VERSION = 'sword-shield';

class PokemonHandler {
    constructor(db) {
        this.db = db;
        this.activeEncounters = new Map();
    }

    async init() {
        // Verifica tabela pokedex
        const count = await this.db.get('SELECT COUNT(*) as total FROM pokedex');
        if (count.total === 0) {
            console.log("⚠️ Pokédex vazia! Iniciando download da PokéAPI (isso pode demorar)...");
            await this.seedDatabase();
        } else {
            console.log(`✅ Pokédex carregada com ${count.total} registros.`);
        }
    }

    async seedDatabase() {
        const downloadedMoves = new Set();

        for (let i = 1; i <= POKEMON_COUNT; i++) {
            try {
                const pk = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)).data;
                const sp = (await axios.get(pk.species.url)).data;

                let rarity = (sp.is_legendary || sp.is_mythical) ? 'rare' : 'common';
                let tier = (sp.evolves_from_species === null) ? 1 : 2; 
                
                const stats = {};
                pk.stats.forEach(s => stats[s.stat.name] = s.base_stat);

                await this.db.run(
                    `INSERT INTO pokedex (id, name, type1, type2, base_hp, base_atk, base_def, base_spa, base_spd, base_spe, rarity, tier, is_starter, sprite_url, base_xp)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        pk.id, 
                        pk.name, 
                        pk.types[0]?.type.name, 
                        pk.types[1]?.type.name || null,
                        stats['hp'], stats['attack'], stats['defense'], stats['special-attack'], stats['special-defense'], stats['speed'],
                        rarity,
                        tier,
                        STARTER_IDS.includes(pk.id),
                        pk.sprites.front_default,
                        pk.base_experience
                    ]
                );

                const validMoves = pk.moves.filter(m => 
                    m.version_group_details.some(v => v.version_group.name === GAME_VERSION && v.move_learn_method.name === 'level-up')
                );

                for (const m of validMoves) {
                    const moveName = m.move.name;
                    const level = m.version_group_details.find(v => v.version_group.name === GAME_VERSION).level_learned_at;

                    let moveId;
                    const existingMove = await this.db.get("SELECT id FROM moves WHERE name = ?", [moveName]);

                    if (existingMove) {
                        moveId = existingMove.id;
                    } else if (!downloadedMoves.has(moveName)) {
                        const moveData = (await axios.get(m.move.url)).data;
                        
                        if (moveData.power || moveData.meta?.category?.name) {
                            await this.db.run(
                                `INSERT INTO moves (id, name, type, power, accuracy, pp, damage_class) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [moveData.id, moveData.name, moveData.type.name, moveData.power || 0, moveData.accuracy || 100, moveData.pp, moveData.damage_class.name]
                            );
                            moveId = moveData.id;
                            downloadedMoves.add(moveName);
                            console.log(`   + Golpe salvo: ${moveName}`);
                        }
                    }

                    if (moveId) {
                        await this.db.run(
                            `INSERT OR IGNORE INTO pokemon_moves (pokemon_id, move_id, level_learned) VALUES (?, ?, ?)`,
                            [pk.id, moveId, level]
                        );
                    }
                }
                console.log(`[SEED] ${pk.name} salvo.`);
            } catch (e) {
                console.error(`Erro ao baixar ID ${i}:`, e.message);
            }
        }
        console.log("✅ Seed da Pokédex concluído!");
    }

    async handleCommand(from, sender, command) {
        const args = command.trim().split(' ');
        const action = args[1] ? args[1].toLowerCase() : 'ajuda';
        const param = args[2];

        const allowedWithoutPoke = ['comecar', 'start', 'escolher', 'choose', 'ajuda', 'help'];
        const hasPokemon = await this.checkIfUserHasPokemon(sender);

        if (!hasPokemon && !allowedWithoutPoke.includes(action)) {
            return "🚫 Você ainda não é um treinador! Digite *!poke comecar* para pegar seu primeiro Pokémon.";
        }

        switch (action) {
            case 'comecar':
            case 'start':
                return await this.showStarters(sender);

            case 'escolher':
            case 'choose':
                return await this.chooseStarter(sender, param);

            case 'fugir': return await this.fleeBattle(from);
            case 'atacar': return await this.battleTurn(from, sender, param);

            case 'explorar':
            case 'hunt':
                return await this.spawnWildPokemon(from, sender);
            
            case 'capturar':
            case 'catch':
            case 'ball':
                return await this.catchPokemon(from, sender);

            case 'perfil':
            case 'box':
            case 'team':
                return await this.getUserProfile(sender);

            case 'ajuda':
            default:
                return `🦕 *POKÉMON - GUIA*\n\n` +
                       `🌿 *!poke explorar* - Procura um Pokémon selvagem.\n` +
                       `🔴 *!poke capturar* - Tenta pegar o bicho que apareceu.\n` +
                       `👤 *!poke perfil* - Mostra seus Pokémon.\n` +
                       `⚔️ *!poke atacar [golpe]* - Ataca o Pokémon inimigo.` +
                       `\n_Dica: Pokémon evoluídos só aparecem se você tiver nível alto._`;
        }
    }

    async checkIfUserHasPokemon(userId) {
        const result = await this.db.get("SELECT id FROM user_pokemons WHERE user_id = ? LIMIT 1", [userId]);
        return !!result;
    }

    async showStarters(sender) {
        if (await this.checkIfUserHasPokemon(sender)) {
            return "Tu é ganancioso hein? Você já tem Pokémon!";
        }

        return `👨‍🔬 *PROFESSOR CARVALHO:* \n"Olá! Bem-vindo ao mundo Pokémon! Você precisa de um companheiro."\n\n` +
               `Escolha com sabedoria (digite o comando):\n\n` +
               `🍃 *!poke escolher bulbasaur*\n` +
               `🔥 *!poke escolher charmander*\n` +
               `💧 *!poke escolher squirtle*`;
    }

    async chooseStarter(userId, choice) {
        if (await this.checkIfUserHasPokemon(userId)) {
            return "Você já escolheu seu inicial!";
        }

        if (!choice) return "Mas qual? Digite o nome! (Ex: !poke escolher charmander)";

        const selected = choice.toLowerCase();
        let pokemonId = 0;
        let message = "";

        if (selected === 'bulbasaur' || selected === 'bulbasauro') {
            pokemonId = 1;
            message = "🍃 Ótima escolha! *Bulbasaur* é leal e forte.";
        } 
        else if (selected === 'charmander') {
            pokemonId = 4;
            message = "🔥 Queimando de energia! *Charmander* é o seu parceiro.";
        } 
        else if (selected === 'squirtle') {
            pokemonId = 7;
            message = "💧 SIMPLESMENTE O GOAT! *Squirtle* será um grande amigo.";
        }

        else if (selected === 'pikachu') {
            pokemonId = 25;
            message = "⚡ *ATRASADO!* Todos os iniciais já foram levados...\nMas sobrou este *Pikachu* um pouco rebelde. Cuide bem dele!";
        } 
        else {
            return "❌ Esse Pokémon não está disponível com o Professor. Escolha Bulbasaur, Charmander ou Squirtle (talvez tenha um escondido).";
        }

        const pk = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [pokemonId]);
        
        if (!pk) return "Erro interno: Pokémon não encontrado no banco.";

        const randIv = () => Math.floor(Math.random() * 32);

        const moves = await this.getMovesForLevel(pk.id, 5);

        await this.db.run(`
            INSERT INTO user_pokemons (
                user_id, pokedex_id, nickname, level, 
                iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, 
                move1, move2, move3, move4, 
                obtained_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, pk.id, pk.name, 5,
                randIv(), randIv(), randIv(), randIv(), randIv(), randIv(),
                moves[0]?.id || null, moves[1]?.id || null, moves[2]?.id || null, moves[3]?.id || null,
                Date.now()
            ]
        );

        await this.db.run(`UPDATE usuarios SET pokeballs = 20 WHERE id_usuario = ?`, [userId]);

        return `🎉 *PARABÉNS!* Você recebeu seu primeiro Pokémon!\n\n${message}\n\n(Você também ganhou 20 Pokébolas para começar sua jornada!)`;
    }

async spawnWildPokemon(groupId, userId) {
        const currentEncounter = this.activeEncounters.get(groupId);
        if (currentEncounter && (Date.now() - currentEncounter.timestamp < 120000)) {
            return `🌿 Já tem um *${currentEncounter.pokemon.name.toUpperCase()}* selvagem aqui! Use *!poke capturar* rápido!`;
        }

        const findPokemon = () => Math.random() < 0.5;
        const isRare = () => Math.random() < 0.01;
        const checkShiny = () => Math.random() < 0.00024;

        let isShiny = checkShiny();

        const lvlResult = await this.db.get(`
            SELECT AVG(level) as media FROM user_pokemons
            WHERE user_id = ?
        `, [userId]);

        const baseLevel = lvlResult && lvlResult.media ? Math.floor(lvlResult.media) : 5;
        
        const variation = Math.max(1, Math.floor(baseLevel * 0.20));
        
        const minLevel = Math.max(1, baseLevel - variation);
        const maxLevel = baseLevel + variation;
        
        const wildLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

        let pokemon = null;
        
        if (findPokemon()) {
            if (isRare()) {
                const randomRareId = RARE_POKE[Math.floor(Math.random() * RARE_POKE.length)];
                pokemon = await this.db.get(`SELECT * FROM pokedex WHERE id = ?`, [randomRareId]);
                console.log(`🌟 SORTE GRANDE! Spawnou um Raro (ID: ${randomRareId})`);
            }

            if (!pokemon) {
                pokemon = await this.db.get(`
                    SELECT * FROM pokedex 
                    WHERE is_starter = 0 AND rarity = 'common' AND tier = 1
                    ORDER BY RANDOM() LIMIT 1
                `);
            }

        } else {
            return "🦗 Você andou no matinho mas só achou grilos.";
        }
            
        if (!pokemon) return "Erro ao buscar Pokémon no banco de dados.";

        const wildMoves = await this.getMovesForLevel(pokemon.id, wildLevel);

        const wildHp = Math.floor(((2 * pokemon.base_hp + 15 + 100) * wildLevel) / 100 + 10);

        this.activeEncounters.set(groupId, {
            pokemon: pokemon,
            currentHp: wildHp, 
            maxHp: wildHp,
            level: wildLevel,
            moves: wildMoves,
            isShiny: isShiny,
            timestamp: Date.now()
        });

        let emoji = "⚔️";
        if (RARE_POKE.includes(pokemon.id)) emoji = "🌟";
        if (isShiny) emoji = "✨✨✨";

        const sprite = isShiny ? pokemon.sprite_url.replace("front_default", "front_shiny") : pokemon.sprite_url;
        const shinyText = isShiny ? " (✨ SHINY ✨)" : "";

        return {
            text: `${emoji} Um *${pokemon.name.toUpperCase()}*${shinyText} (Lvl ${wildLevel}) selvagem apareceu!\nHP: ${wildHp}/${wildHp}\n\nO que fará? (!poke atacar / !poke fugir / !poke capturar)`,
            image: sprite
        };
    }

    async catchPokemon(groupId, userId) {
        const encounter = this.activeEncounters.get(groupId);
        
        if (!encounter) return "🤷 Não tem nenhum Pokémon selvagem aqui agora. Use *!poke explorar*.";
        if (Date.now() - encounter.timestamp > 120000) {
            this.activeEncounters.delete(groupId);
            return "💨 O Pokémon fugiu! Você demorou demais.";
        }

        const user = await this.db.get("SELECT pokeballs FROM usuarios WHERE id_usuario = ?", [userId]);
        const balls = user ? user.pokeballs : 0;
        
        if (balls <= 0) return "🚫 Você está sem Pokébolas! Use *!poke loja* para comprar mais.";

        await this.db.run("UPDATE usuarios SET pokeballs = pokeballs - 1 WHERE id_usuario = ?", [userId]);
        
        const currentHp = encounter.currentHp !== undefined ? encounter.currentHp : 100;
        const maxHp = encounter.maxHp !== undefined ? encounter.maxHp : 100;

        const hpPercent = currentHp / maxHp;

        const catchChance = 0.3 + (0.5 * (1 - hpPercent));
        const success = Math.random() < catchChance;

        if (success) {
            const pk = encounter.pokemon;
            
            const randIv = () => Math.floor(Math.random() * 32);

            const isShinyValue = encounter.isShiny ? 1 : 0;
            
            const moves = encounter.moves || [];
            
            await this.db.run(`
                INSERT INTO user_pokemons (
                    user_id, pokedex_id, nickname, level, 
                    iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, 
                    move1, move2, move3, move4, 
                    obtained_at, is_shiny
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, pk.id, pk.name, encounter.level || 5,
                    randIv(), randIv(), randIv(), randIv(), randIv(), randIv(),
                    moves[0]?.id || null, moves[1]?.id || null, moves[2]?.id || null, moves[3]?.id || null,
                    Date.now(), 
                    isShinyValue
                ]
            );
            this.activeEncounters.delete(groupId);
            const shinyMsg = encounter.isShiny ? " ✨ SHINY ✨" : "";
            return `🎉 *PARABÉNS!* Você capturou o *${pk.name.toUpperCase()}* ${shinyMsg}!\nVocê tem agora ${balls - 1} Pokébolas.`;
        } else {
            return `💢 O *${encounter.pokemon.name.toUpperCase()}* escapou da pokebola!\nTente de novo! (Bolas restantes: ${balls - 1})`;
        }
    }

    async fleeBattle(groupId) {
        if (!this.activeEncounters.has(groupId)) return "Não tem de quem fugir.";
        this.activeEncounters.delete(groupId);
        return "🏃‍♂️ Você fugiu com sucesso (e deixou sua dignidade para trás).";
    }

    async battleTurn(groupId, userId, moveSlot) {
        const encounter = this.activeEncounters.get(groupId);
        if (!encounter) return "Não tem batalha rolando. Use *!poke explorar*.";

        const userPoke = await this.db.get(`
            SELECT up.*, p.name, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe 
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? 
            ORDER BY up.id ASC LIMIT 1`, [userId]);

        if (!userPoke) return "Você não tem Pokémon! Capture um primeiro.";
        
        const userMaxHp = Math.floor(((2 * userPoke.base_hp + (userPoke.iv_hp || 15) + 100) * userPoke.level) / 100 + 10);
        let userCurrentHp = userPoke.current_hp !== null ? userPoke.current_hp : userMaxHp;

        if (userCurrentHp <= 0) return "Seu Pokémon está desmaiado!";

        if (!moveSlot) {
            const moves = await this.getUserMoves(userPoke);
            let msg = `👊 *${userPoke.nickname}* (HP: ${userCurrentHp}/${userMaxHp})\n\n*Ataques:*\n`;
            moves.forEach((m, i) => msg += `${i+1}. ${m.name} (Pwr: ${m.power} | ${m.type})\n`);
            msg += `\nUse: *!poke atacar 1*`;
            return msg;
        }

        const slotIndex = parseInt(moveSlot) - 1;
        const moves = await this.getUserMoves(userPoke);
        const selectedMove = moves[slotIndex];

        if (!selectedMove) return "Golpe inválido!";

        let log = "";
        let damageToWild = 0;

        if (selectedMove.damage_class === 'status') {            
             log += `✨ ${userPoke.nickname} usou *${selectedMove.name}* (Status)!\n`;
        } else {
            let atkStat = (selectedMove.damage_class === 'special') ? userPoke.base_spa : userPoke.base_atk;
            let defStat = (selectedMove.damage_class === 'special') ? encounter.pokemon.base_spd : encounter.pokemon.base_def;

            damageToWild = Math.floor((selectedMove.power * (atkStat / defStat) * (Math.random() * 0.4 + 0.8)) / 2) + 2;
            
            encounter.currentHp -= damageToWild;
            log += `🗡️ ${userPoke.nickname} usou *${selectedMove.name}*!\nCausou **${damageToWild}** de dano.\n`;
        }

        if (encounter.currentHp <= 0) {
            this.activeEncounters.delete(groupId);
            const xpMessage = await this.gainExperience(userPoke, encounter.pokemon, encounter.level);
            return `${log}\n💀 O *${encounter.pokemon.name}* selvagem desmaiou!\n\n${xpMessage}`;
        }

        const wildMove = encounter.moves[Math.floor(Math.random() * encounter.moves.length)];
        let damageToUser = 0;

        if (wildMove.damage_class === 'status') {
             log += `\n✨ O ${encounter.pokemon.name} selvagem usou *${wildMove.name}* (Status)!`;
        } else {
            let wildAtkStat = (wildMove.damage_class === 'special') ? encounter.pokemon.base_spa : encounter.pokemon.base_atk;
            let userDefStat = (wildMove.damage_class === 'special') ? userPoke.base_spd : userPoke.base_def; 

            damageToUser = Math.floor((wildMove.power * (wildAtkStat / userDefStat) * (Math.random() * 0.4 + 0.8)) / 2) + 2;
            
            await this.db.run(`UPDATE user_pokemons SET current_hp = current_hp - ? WHERE id = ?`, [damageToUser, userPoke.id]);
            
            log += `\n💢 ${encounter.pokemon.name} usou *${wildMove.name}*!\nTe causou **${damageToUser}** de dano.`;
            userCurrentHp -= damageToUser;
        }
        
        if (userCurrentHp <= 0) {
             this.activeEncounters.delete(groupId);
             log += `\n\n💀 ${userPoke.nickname} desmaiou... Você correu para o Centro Pokémon.`;
        } else {
             log += `\n\nHP Inimigo: ${Math.max(0, encounter.currentHp)}/${encounter.maxHp}`;
             log += `\nSeu HP: ${Math.max(0, userCurrentHp)}/${userMaxHp}`;
        }
        
        return log;
    }

    async gainExperience(userPoke, defeatedEnemy, enemyLevel) {
        const xpGained = Math.floor((defeatedEnemy.base_xp * enemyLevel) / 7);
        
        let newExp = userPoke.exp + xpGained;
        let currentLevel = userPoke.level;
        let levelUpMessage = "";

        while (newExp >= Math.pow(currentLevel + 1, 3)) {
            currentLevel++;
            levelUpMessage += `\n🆙 **LEVEL UP!** ${userPoke.nickname} subiu para o Nvl ${currentLevel}!`;
            
            await this.db.run(`UPDATE user_pokemons SET current_hp = NULL WHERE id = ?`, [userPoke.id]); 
            levelUpMessage += ` (HP Restaurado)`;
        }

        await this.db.run(`
            UPDATE user_pokemons 
            SET exp = ?, level = ? 
            WHERE id = ?`, 
            [newExp, currentLevel, userPoke.id]
        );

        return `✨ Ganhou **${xpGained} XP**!${levelUpMessage}`;
    }

    async getUserMoves(userPoke) {
        const moveIds = [userPoke.move1, userPoke.move2, userPoke.move3, userPoke.move4].filter(id => id);
        if (moveIds.length === 0) return [{name: "Investida (Padrão)", power: 40, damage_class: 'physical', type: 'normal'}];

        const placeholders = moveIds.map(() => '?').join(',');
        return await this.db.all(`SELECT * FROM moves WHERE id IN (${placeholders})`, moveIds);
    }

    async getMovesForLevel(pokemonId, level) {
        return await this.db.all(`
            SELECT m.id, m.name, m.power, m.type, m.damage_class
            FROM pokemon_moves pm
            JOIN moves m ON pm.move_id = m.id
            WHERE pm.pokemon_id = ? AND pm.level_learned <= ?
            ORDER BY pm.level_learned DESC
            LIMIT 4
        `, [pokemonId, level]);
    }

    async getUserProfile(userId) {
        const pokemon = await this.db.all(`
            SELECT p.name, up.level, up.nickname, up.is_shiny
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ?
            LIMIT 6
        `, [userId]);

        const user = await this.db.get("SELECT pokeballs FROM usuarios WHERE id_usuario = ?", [userId]);
        const balls = user ? user.pokeballs : 0;

        if (!pokemon.length) return `🎒 *MOCHILA*\nPokébolas: ${balls}\n\nVocê ainda não tem Pokémon. Use *!poke explorar*!`;

        let msg = `🎒 *MOCHILA DE TREINADOR* (Bolas: ${balls})\n\n`;
        pokemon.forEach(p => {
            const shinyIcon = p.is_shiny ? "✨" : "🔴";
            msg += `${shinyIcon} *${p.name}* (Lvl ${p.level})\n`;
        });
        
        return msg;
    }
}

module.exports = PokemonHandler;