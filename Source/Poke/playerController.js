const { NATURES, NATURE_KEYS } = require('./constants');
const PokeMath = require('./pokeMath');

class PlayerController {
    constructor(db) {
        this.db = db; 
    }

    getRandomNature() {
        return NATURE_KEYS[Math.floor(Math.random() * NATURE_KEYS.length)];
    }

    // ==========================================
    //  INÍCIO DA JORNADA
    // ==========================================

    async handleStarter(userId, param, replyFunction) {
        const hasPokemon = await this.db.getCountUserPokemons(userId);
        
        if (hasPokemon > 0) {
            throw new Error("ALREADY_HAVE_MON");
        }

        if (!param) {
            const menu = `🌟 *ESCOLHA SEU INICIAL (V2)* 🌟\n\n` +
                         `🍃 *TIPO GRAMA:*\n• *Bulbasaur*\n• *Chikorita*\n• *Treecko*\n\n` +
                         `🔥 *TIPO FOGO:*\n• *Charmander*\n• *Cyndaquil*\n• *Torchic*\n\n` +
                         `💧 *TIPO ÁGUA:*\n• *Squirtle*\n• *Totodile*\n• *Mudkip*\n\n` +
                         `👉 Digite: *!poke2 escolher [nome]*`;
            return await replyFunction(menu);
        }

        const choice = param.toLowerCase().trim();
        let dexId = 0;

        if (choice.includes('bulb')) dexId = 1;
        else if (choice.includes('charm')) dexId = 4;
        else if (choice.includes('squirt')) dexId = 7;
        else if (choice.includes('chiko')) dexId = 152;
        else if (choice.includes('cynda')) dexId = 155;
        else if (choice.includes('toto')) dexId = 158;
        else if (choice.includes('tree')) dexId = 252;
        else if (choice.includes('torch')) dexId = 255;
        else if (choice.includes('mud')) dexId = 258;
        else throw new Error("INVALID_INITIAL");

        const pk = await this.db.getPokedexById(dexId);
        if (!pk) throw new Error("DEX_ERROR");

        const level = 5;
        const natureKey = this.getRandomNature();
        const ivs = PokeMath.generateRandomIVs();
        const initialXp = PokeMath.computeXp(level);
        const maxHp = PokeMath.computeStat(pk.base_hp, ivs.hp, 0, level, natureKey, 'hp');

        const moves = await this.db.getLearnableMovesByLevel(pk.id, level);
        
        const newPokemon = {
            user_id: userId,
            pokedex_id: pk.id,
            nickname: pk.name,
            level: level,
            exp: initialXp,
            current_hp: maxHp,
            max_hp: maxHp,
            move1: moves[0]?.id || null, move1_pp: moves[0]?.pp || null,
            move2: moves[1]?.id || null, move2_pp: moves[1]?.pp || null,
            move3: moves[2]?.id || null, move3_pp: moves[2]?.pp || null,
            move4: moves[3]?.id || null, move4_pp: moves[3]?.pp || null,
            obtained_at: Date.now(),
            iv_hp: ivs.hp, iv_atk: ivs.atk, iv_def: ivs.def, 
            iv_spa: ivs.spa, iv_spd: ivs.spd, iv_spe: ivs.spe,
            team_slot: 1,
            nature: natureKey,
            is_shiny: (Math.random() < 0.005)
        };

        await this.db.insertUserPokemon(newPokemon);

        await this.db.addItem(userId, 'pokeball', 20);
        await this.db.addItem(userId, 'potion', 5);

        const shinyTag = newPokemon.is_shiny ? "✨ SHINY " : "";
        await replyFunction(`🎉 Parabéns! Você escolheu um ${shinyTag}*${pk.name}* como parceiro!\n🎒 Você recebeu 20 Pokébolas e 5 Poções de presente!`);
    }

    // ==========================================
    //  CENTRO POKÉMON
    // ==========================================

    async healTeam(userId, replyFunction) {
        const encounter = await this.db.getActiveEncounter(userId);
        if (encounter) {
            throw new Error("POKE_HEAL_BATTLE");
        }

        await this.db.healEntireTeam(userId);
        await replyFunction("🏥 *Din din din din din!* Seus Pokémon foram totalmente curados e os PPs restaurados!");
    }

    // ==========================================
    //  GERENCIAMENTO E PERFIL
    // ==========================================

    async getProfileDetails(userId, action, param, sock, groupId, replyFunction) {
        const hasPokemon = await this.db.getCountUserPokemons(userId);
        if (hasPokemon === 0) throw new Error("POKE_NO_MONS");

        if (action === 'perfil') {
            const userInfo = await this.db.getUserInfo(userId);
            const team = await this.db.getTeam(userId);

            let msg = `👤 *PERFIL DO TREINADOR*\n` +
                      `💰 ${userInfo?.pokecoins || 0} | 🔴 Pokébolas na Bag | 🏅 ${userInfo?.badges || 0} Insígnias\n\n` +
                      `🧢 *SEU TIME:*\n`;

            team.forEach(p => {
                const status = p.current_hp <= 0 ? "💀" : (p.is_shiny ? "✨" : "❤️");
                msg += `${p.team_slot}. ${status} ${p.nickname} (Lvl ${p.level})\n`;
            });

            return await replyFunction(msg);
        }

        if (action === 'time') {
            const team = await this.db.getTeam(userId);
            let msg = "🧢 *SEU TIME (V2)*\n\n";
            
            team.forEach(p => {
                const status = p.current_hp <= 0 ? "💀" : "❤️";
                msg += `*${p.team_slot}. ${p.nickname}* (Lvl ${p.level})\nHP: ${p.current_hp}/${p.max_hp}\n\n`;
            });

            return await replyFunction(msg);
        }

        if (action === 'mostrar') {
            const slot = parseInt(param);
            if (isNaN(slot) || slot < 1 || slot > 6) throw new Error("POKE_INVALID_SLOT");

            const poke = await this.db.getPokemonBySlot(userId, slot);
            if (!poke) throw new Error("POKE_SLOT_EMPTY");

            const caption = `📊 *FICHA: ${poke.nickname}* (Lvl ${poke.level})\n❤️ HP: ${poke.current_hp}/${poke.max_hp}\n🌱 Nature: ${poke.nature}`;
            
            if (sock && groupId) {
                try {
                    await sock.sendMessage(groupId, { image: { url: poke.sprite_url }, caption: caption });
                    return;
                } catch (e) {
                }
            }
            return await replyFunction(caption);
        }
    }
}

module.exports = PlayerController;