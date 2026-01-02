const axios = require('axios');
const STARTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const RARE_POKE = [25]
const POKEMON_COUNT = 151;
const GAME_VERSION = 'sword-shield';
const GYM_LEADERS = [
    { badge: 0, leader: "Brock", city: "Pewter", pokeId: 95, level: 12, moves: ["Investida", "Lançamento de Rocha"], reward: 1000, badgeName: "Rocha" }, // Onix
    { badge: 1, leader: "Misty", city: "Cerulean", pokeId: 121, level: 18, moves: ["Jato d'Água", "Investida"], reward: 2000, badgeName: "Cascata" } // Starmie
];

class PokemonHandler {
    constructor(db) {
        this.db = db;
    }

    async init() {
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
                    [pk.id, pk.name, pk.types[0]?.type.name, pk.types[1]?.type.name || null, stats['hp'], stats['attack'], stats['defense'], stats['special-attack'], stats['special-defense'], stats['speed'], rarity, tier, STARTER_IDS.includes(pk.id), pk.sprites.front_default, pk.base_experience]
                );

                const validMoves = pk.moves.filter(m => m.version_group_details.some(v => v.version_group.name === GAME_VERSION && v.move_learn_method.name === 'level-up'));
                for (const m of validMoves) {
                    const moveName = m.move.name;
                    const level = m.version_group_details.find(v => v.version_group.name === GAME_VERSION).level_learned_at;
                    let moveId;
                    const existingMove = await this.db.get("SELECT id FROM moves WHERE name = ?", [moveName]);

                    if (existingMove) { moveId = existingMove.id; } 
                    else if (!downloadedMoves.has(moveName)) {
                        const moveData = (await axios.get(m.move.url)).data;
                        if (moveData.power || moveData.meta?.category?.name) {
                            await this.db.run(`INSERT INTO moves (id, name, type, power, accuracy, pp, damage_class) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [moveData.id, moveData.name, moveData.type.name, moveData.power || 0, moveData.accuracy || 100, moveData.pp, moveData.damage_class.name]);
                            moveId = moveData.id;
                            downloadedMoves.add(moveName);
                        }
                    }
                    if (moveId) await this.db.run(`INSERT OR IGNORE INTO pokemon_moves (pokemon_id, move_id, level_learned) VALUES (?, ?, ?)`, [pk.id, moveId, level]);
                }
                console.log(`[SEED] ${pk.name} salvo.`);
            } catch (e) { console.error(`Erro ao baixar ID ${i}:`, e.message); }
        }
        console.log("✅ Seed da Pokédex concluído!");
    }

    async handleCommand(from, sender, command, sock) {
        const args = command.trim().split(' ');
        const action = args[1] ? args[1].toLowerCase() : 'ajuda';
        const param = args[2];

        const allowedWithoutPoke = ['comecar', 'start', 'escolher', 'choose', 'ajuda', 'help'];
        const hasPokemon = await this.checkIfUserHasPokemon(sender);

        if (!hasPokemon && !allowedWithoutPoke.includes(action)) {
            return "🚫 Você ainda não é um treinador! Digite *!poke comecar* para pegar seu primeiro Pokémon.";
        }

        switch (action) {
            case 'curar': case 'heal': case 'nurse': return await this.healTeam(sender);
            case 'ginasio': case 'gym': case 'historia': return await this.challengeGym(from, sender, sock);
            case 'usar': case 'use': 
                if (param === 'potion' || param === 'pocao') return await this.usePotion(from, sender);
                return "Usar o quê? Tente: *!poke usar poção*";
            case 'loja': case 'shop': case 'mart': return await this.showShop(sender);
            case 'comprar': case 'buy': return await this.buyItem(sender, param, args[3]);
            case 'comecar': case 'start': return await this.showStarters(sender);
            case 'escolher': case 'choose': return await this.chooseStarter(sender, param);
            case 'fugir': return await this.fleeBattle(from, sender);
            case 'atacar': return await this.battleTurn(from, sender, param, sock);
            case 'explorar': case 'hunt': return await this.spawnWildPokemon(from, sender, sock);
            case 'capturar': case 'catch': case 'ball': return await this.catchPokemon(from, sender);
            case 'perfil': case 'box': case 'team': return await this.getUserProfile(sender);
            case 'ajuda': default:
                return `🦕 *POKÉMON - GUIA*\n\n🌿 *!poke explorar*\n⚔️ *!poke atacar*\n🔴 *!poke capturar*\n🏥 *!poke curar*\n🏪 *!poke loja*\n🧪 *!poke usar poção*\n🏛️ *!poke ginasio*\n👤 *!poke perfil*`;
        }
    }

    async loadEncounter(userId) {
        const encounter = await this.db.get(`
            SELECT ae.*, p.name, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe, p.sprite_url, p.base_xp
            FROM active_encounters ae
            JOIN pokedex p ON ae.pokedex_id = p.id
            WHERE ae.user_id = ?`, [userId]);

        if (!encounter) return null;

        return {
            pokemon: {
                id: encounter.pokedex_id,
                name: encounter.name,
                base_hp: encounter.base_hp,
                base_atk: encounter.base_atk,
                base_def: encounter.base_def,
                base_spa: encounter.base_spa,
                base_spd: encounter.base_spd,
                base_spe: encounter.base_spe,
                base_xp: encounter.base_xp,
                sprite_url: encounter.sprite_url
            },
            currentHp: encounter.current_hp,
            maxHp: encounter.max_hp,
            level: encounter.level,
            isShiny: !!encounter.is_shiny,
            moves: JSON.parse(encounter.moves || '[]'),
            isGym: encounter.battle_type === 'GYM',
            gymData: encounter.extra_data ? JSON.parse(encounter.extra_data) : null,
            timestamp: encounter.started_at,
            groupId: encounter.group_id
        };
    }

    async clearEncounter(userId) {
        await this.db.run("DELETE FROM active_encounters WHERE user_id = ?", [userId]);
    }


    async spawnWildPokemon(groupId, userId, sock) {
        const existing = await this.loadEncounter(userId);
        if (existing) {
            return `🚫 Você já está em batalha contra *${existing.pokemon.name}*! Termine ela primeiro.`;
        }

        const findPokemon = () => Math.random() < 0.5;
        const isRare = () => Math.random() < 0.01;
        
        let pokemon = null;
        
        if (findPokemon()) {
            if (isRare()) {
                const randomRareId = RARE_POKE[Math.floor(Math.random() * RARE_POKE.length)];
                pokemon = await this.db.get(`SELECT * FROM pokedex WHERE id = ?`, [randomRareId]);
            }
            if (!pokemon) {
                pokemon = await this.db.get(`SELECT * FROM pokedex WHERE is_starter = 0 AND rarity = 'common' AND tier = 1 ORDER BY RANDOM() LIMIT 1`);
            }
        } else {
            return "🦗 Você andou no matinho mas só achou grilos.";
        }
            
        if (!pokemon) return "Erro ao buscar Pokémon.";

        const lvlResult = await this.db.get(`SELECT AVG(level) as media FROM user_pokemons WHERE user_id = ?`, [userId]);
        const baseLevel = lvlResult && lvlResult.media ? Math.floor(lvlResult.media) : 5;
        const wildLevel = Math.max(1, baseLevel + Math.floor(Math.random() * 5) - 2);

        let wildMoves = await this.getMovesForLevel(pokemon.id, wildLevel);
        if (!wildMoves || wildMoves.length === 0) wildMoves = [{name: "Investida", power: 40, damage_class: 'physical', type: 'normal'}];

        const wildHp = Math.floor(((2 * pokemon.base_hp + 15 + 100) * wildLevel) / 100 + 10);
        const isShiny = Math.random() < 0.002;

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, started_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'WILD', ?)`,
            [userId, groupId, pokemon.id, wildHp, wildHp, wildLevel, isShiny ? 1 : 0, JSON.stringify(wildMoves), Date.now()]
        );

        let emoji = isShiny ? "✨" : "⚔️";
        const caption = `${emoji} Um *${pokemon.name.toUpperCase()}* (Lvl ${wildLevel})selvagem apareceu PRA VOCÊ!\n` +
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

        const user = await this.db.get("SELECT badges FROM usuarios WHERE id_usuario = ?", [userId]);
        const currentBadge = user.badges || 0;

        if (currentBadge >= GYM_LEADERS.length) return "🏆 Você já é o Campeão da Liga Pokémon!";

        const gymData = GYM_LEADERS[currentBadge];
        const bossPokemon = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [gymData.pokeId]);
        const bossMoves = [{name: gymData.moves[0], power: 50, type: 'normal', damage_class: 'physical'}]; 
        const bossHp = Math.floor(((2 * bossPokemon.base_hp + 31 + 100) * gymData.level) / 100 + 10) * 1.5;

        await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, extra_data, started_at
            ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'GYM', ?, ?)`,
            [userId, groupId, bossPokemon.id, bossHp, bossHp, gymData.level, JSON.stringify(bossMoves), JSON.stringify(gymData), Date.now()]
        );

        const caption = `🏛️ *GINÁSIO DE ${gymData.city.toUpperCase()}*\nLíder **${gymData.leader}** enviou *${bossPokemon.name}* (Lvl ${gymData.level})!\n⚠️ *Boss HP:* ${bossHp}/${bossHp}\nDigite *!poke atacar*`;

        if (sock) {
            await sock.sendMessage(groupId, { image: { url: bossPokemon.sprite_url }, caption: caption });
        }
        return null;
    }

    async battleTurn(groupId, userId, moveSlot, sock) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "Não tem batalha rolando. Use *!poke explorar*.";

        const userPoke = await this.db.get(`
            SELECT up.*, p.name, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe 
            FROM user_pokemons up JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ? ORDER BY up.id ASC LIMIT 1`, [userId]);

        if (!userPoke) return "Cadê seu Pokémon?";
        if (userPoke.current_hp <= 0) return "Seu Pokémon está desmaiado! Use *!poke curar*.";

        if (!moveSlot) {
            const moves = await this.getUserMoves(userPoke);
            let msg = `👊 *${userPoke.nickname}* (HP: ${userPoke.current_hp}/${userPoke.max_hp})\n*Ataques:*\n`;
            moves.forEach((m, i) => msg += `${i+1}. ${m.name} (${m.type})\n`);
            msg += `\nUse: *!poke atacar 1*`;
            return msg;
        }

        const selectedMove = (await this.getUserMoves(userPoke))[parseInt(moveSlot) - 1];
        if (!selectedMove) return "Golpe inválido!";

        const calcDmg = (lvl, pwr, atk, def) => {
            return Math.floor(((2 * lvl / 5 + 2) * pwr * (atk / def)) / 50 + 2);
        };

        let log = "";
        let damageToWild = 0;

        // ============================================================
        // TURNO DO JOGADOR
        // ============================================================

        if (selectedMove.damage_class === 'status') {
            log += `✨ ${userPoke.nickname} usou *${selectedMove.name}*!\n`;
        } else {
            const userAtkReal = Math.floor(((2 * userPoke.base_atk + (userPoke.iv_atk || 15)) * userPoke.level) / 100 + 5);
            const userSpaReal = Math.floor(((2 * userPoke.base_spa + (userPoke.iv_spa || 15)) * userPoke.level) / 100 + 5);

            let atkFinal = (selectedMove.damage_class === 'special') ? userSpaReal : userAtkReal;

            const enemyDefReal = Math.floor(((2 * encounter.pokemon.base_def + 15) * encounter.level) / 100 + 5);
            const enemySpdReal = Math.floor(((2 * encounter.pokemon.base_spd + 15) * encounter.level) / 100 + 5);
            
            let defFinal = (selectedMove.damage_class === 'special') ? enemySpdReal : enemyDefReal;

            damageToWild = calcDmg(userPoke.level, selectedMove.power, atkFinal, defFinal);

            if (Math.random() < 0.05) {
                damageToWild = Math.floor(damageToWild * 2);
                log += `🎯 *GOLPE CRÍTICO!* 🎯\n`;
            }

            damageToWild = Math.floor(damageToWild * ((Math.random() * 0.15) + 0.85));

            encounter.currentHp -= damageToWild;
            log += `🗡️ ${userPoke.nickname} usou *${selectedMove.name}* e causou **${damageToWild}** de dano.\n`;
        }

        if (encounter.currentHp <= 0) {
            await this.clearEncounter(userId);
            const xpMsg = await this.gainExperience(userPoke, encounter.pokemon, encounter.level);
            
            if (encounter.isGym) {
                const badgeInfo = encounter.gymData;
                await this.db.run("UPDATE usuarios SET badges = badges + 1, pokecoins = pokecoins + ? WHERE id_usuario = ?", [badgeInfo.reward, userId]);
                return `${log}\n🏆 *VITÓRIA NO GINÁSIO!*\nRecebeu Insígnia ${badgeInfo.badgeName} e 💰 ${badgeInfo.reward}!\n${xpMsg}`;
            }

            const baseGain = 15;
            const luckGain = Math.random() * 25;
            const coins = Math.floor(encounter.level * (baseGain + luckGain));
            await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [coins, userId]);
            return `${log}\n💀 O inimigo desmaiou!\n${xpMsg}\n💰 +${coins} coins.`;
        }

        // ============================================================
        // TURNO DO INIMIGO
        // ============================================================
        
        const wildMove = encounter.moves[Math.floor(Math.random() * encounter.moves.length)] || {name: "Investida", power: 40, damage_class: 'physical', type: 'normal'};
        let damageToUser = 0;

        if (wildMove.damage_class === 'status') {
            log += `\n✨ O ${encounter.pokemon.name} selvagem usou *${wildMove.name}*!`;
        } else {
            const wildAtkReal = Math.floor(((2 * encounter.pokemon.base_atk + 15) * encounter.level) / 100 + 5);
            const wildSpaReal = Math.floor(((2 * encounter.pokemon.base_spa + 15) * encounter.level) / 100 + 5);

            let wildAtkFinal = (wildMove.damage_class === 'special') ? wildSpaReal : wildAtkReal;

            const userDefReal = Math.floor(((2 * userPoke.base_def + (userPoke.iv_def || 15)) * userPoke.level) / 100 + 5);
            const userSpdReal = Math.floor(((2 * userPoke.base_spd + (userPoke.iv_spd || 15)) * userPoke.level) / 100 + 5);

            let userDefFinal = (wildMove.damage_class === 'special') ? userSpdReal : userDefReal;

            damageToUser = calcDmg(encounter.level, wildMove.power, wildAtkFinal, userDefFinal);

            if (Math.random() < 0.05) {
                damageToUser = Math.floor(damageToUser * 2);
                log += `\n⚠️ *CRÍTICO DO INIMIGO!* ⚠️`;
            }

            damageToUser = Math.floor(damageToUser * ((Math.random() * 0.15) + 0.85));

            await this.db.run(`UPDATE user_pokemons SET current_hp = current_hp - ? WHERE id = ?`, [damageToUser, userPoke.id]);
            
            log += `\n💢 ${encounter.pokemon.name} usou *${wildMove.name}*!\nTe causou **${damageToUser}** de dano.`;
        }

        const updatedUserPoke = await this.db.get("SELECT current_hp, max_hp FROM user_pokemons WHERE id = ?", [userPoke.id]);
        
        if (updatedUserPoke.current_hp <= 0) {
            await this.clearEncounter(userId);
            return `${log}\n\n💀 ${userPoke.nickname} desmaiou! Corra para o *!poke curar*.`;
        }

        await this.db.run(`UPDATE active_encounters SET current_hp = ? WHERE user_id = ?`, [encounter.currentHp, userId]);

        return `${log}\n\n❤️ Inimigo: ${Math.max(0, encounter.currentHp)}/${encounter.maxHp}\n💚 Seu: ${Math.max(0, updatedUserPoke.current_hp)}/${updatedUserPoke.max_hp}\n\nUse: *!poke atacar [n]*`;
    }

    async catchPokemon(groupId, userId) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "🤷 Nenhuma batalha ativa.";
        if (encounter.isGym) return "🚫 Você não pode roubar o Pokémon do Líder!";

        const user = await this.db.get("SELECT pokeballs FROM usuarios WHERE id_usuario = ?", [userId]);
        if (!user || user.pokeballs <= 0) return "🚫 Sem Pokébolas! Compre na loja.";

        await this.db.run("UPDATE usuarios SET pokeballs = pokeballs - 1 WHERE id_usuario = ?", [userId]);
        
        const catchChance = 0.3 + (0.5 * (1 - (encounter.currentHp / encounter.maxHp)));
        if (Math.random() < catchChance) {
            const pk = encounter.pokemon;
            const randIv = () => Math.floor(Math.random() * 32);
            const ivHp = randIv();
            const realMaxHp = Math.floor(((2 * pk.base_hp + ivHp + 100) * encounter.level) / 100 + 10);
            
            // Pega o primeiro golpe ou investida
            let m1 = encounter.moves[0]?.id;
            if(!m1) {
                const t = await this.db.get("SELECT id FROM moves WHERE name='Investida'");
                m1 = t ? t.id : null;
            }

            await this.db.run(`
                INSERT INTO user_pokemons (user_id, pokedex_id, nickname, level, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, move1, move2, move3, move4, obtained_at, is_shiny, current_hp, max_hp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, pk.id, pk.name, encounter.level, ivHp, randIv(), randIv(), randIv(), randIv(), randIv(), m1, encounter.moves[1]?.id, encounter.moves[2]?.id, encounter.moves[3]?.id, Date.now(), encounter.isShiny?1:0, realMaxHp, realMaxHp]
            );
            await this.clearEncounter(userId);
            return `🎉 Capturou *${pk.name}*! (Bolas: ${user.pokeballs - 1})`;
        }
        return `💢 Escapou! (Bolas: ${user.pokeballs - 1})`;
    }

    async fleeBattle(groupId, userId) {
        const encounter = await this.loadEncounter(userId);
        if (!encounter) return "Não tem de quem fugir.";
        await this.clearEncounter(userId);
        return "🏃‍♂️ Você fugiu com sucesso.";
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
        if (await this.checkIfUserHasPokemon(sender)) return "Você já tem pokémon!";
        return "Escolha: *!poke escolher charmander*, *bulbasaur* ou *squirtle*.";
    }

    async chooseStarter(userId, choice) {
        if (await this.checkIfUserHasPokemon(userId)) return "Já escolheu!";
        let id = 0;
        if(choice.includes('charm')) id = 4;
        else if(choice.includes('bulb')) id = 1;
        else if(choice.includes('squirt')) id = 7;
        else return "Inválido.";

        const pk = await this.db.get("SELECT * FROM pokedex WHERE id = ?", [id]);
        const moves = await this.getMovesForLevel(pk.id, 5);
        const hp = Math.floor(((2*pk.base_hp + 15 + 100)*5)/100 + 10);
        
        await this.db.run(`INSERT INTO user_pokemons (user_id, pokedex_id, nickname, level, current_hp, max_hp, move1, obtained_at) VALUES (?,?,?,5,?,?,?,?)`, 
            [userId, pk.id, pk.name, hp, hp, moves[0]?.id, Date.now()]);
        await this.db.run("UPDATE usuarios SET pokeballs = 20 WHERE id_usuario = ?", [userId]);
        return `🎉 Recebeu ${pk.name}!`;
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

    async gainExperience(userPoke, enemy, enemyLevel) {
        let xp = Math.floor((enemy.base_xp * enemyLevel) / 7);
        let newXp = userPoke.exp + xp;
        let lvl = userPoke.level;
        let msg = "";
        
        while(newXp >= Math.pow(lvl+1, 3)) {
            lvl++;
            msg += `\n🆙 Subiu para Nvl ${lvl}!`;
        }
        
        if(lvl > userPoke.level) {
            const newHp = Math.floor(((2*userPoke.base_hp + (userPoke.iv_hp||15) + 100)*lvl)/100+10);
            await this.db.run("UPDATE user_pokemons SET exp=?, level=?, max_hp=?, current_hp=? WHERE id=?", [newXp, lvl, newHp, newHp, userPoke.id]);
        } else {
            await this.db.run("UPDATE user_pokemons SET exp=? WHERE id=?", [newXp, userPoke.id]);
        }
        return `✨ Ganhou ${xp} XP.${msg}`;
    }

    async getUserProfile(userId) {
        const pokes = await this.db.all(`SELECT p.name, up.level, up.is_shiny FROM user_pokemons up JOIN pokedex p ON up.pokedex_id = p.id WHERE up.user_id = ?`, [userId]);
        const u = await this.db.get("SELECT pokeballs, pokecoins, potions, badges FROM usuarios WHERE id_usuario = ?", [userId]);
        if(!pokes.length) return "Sem pokémon.";
        return `👤 *PERFIL*\n💰 ${u.pokecoins} | 🔴 ${u.pokeballs} | 🧪 ${u.potions} | 🏅 ${u.badges}\n\n` + pokes.map(p => `${p.is_shiny?'✨':''} ${p.name} (Lvl ${p.level})`).join('\n');
    }
}

module.exports = PokemonHandler;