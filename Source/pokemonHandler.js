const axios = require('axios');
const STARTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const POKEMON_COUNT = 151;

class PokemonHandler {
    constructor(db) {
        this.db = db;
        this.activeEncounters = new Map();
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

        switch (action) {
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
                       `\n_Dica: Pokémon evoluídos só aparecem se você tiver nível alto._`;
        }
    }

    async spawnWildPokemon(groupId, userId) {
        const currentEncounter = this.activeEncounters.get(groupId);
        if (currentEncounter && (Date.now() - currentEncounter.timestamp < 120000)) {
            return `🌿 Já tem um *${currentEncounter.pokemon.name.toUpperCase()}* selvagem aqui! Use *!poke capturar* rápido!`;
        }

        let findPokemon = function() {
            return Math.random() < 0.5; 
        }

        let pokemon = ""
        
        if(findPokemon){
            pokemon = await this.db.get(`
                SELECT * FROM pokedex 
                WHERE is_starter = 0 AND rarity = 'common' AND tier = 1
                ORDER BY RANDOM() LIMIT 1
            `);
        }
        else return "🦗 Você andou no matinho mas só achou grilos.";

        if(pokemon != ""){

            this.activeEncounters.set(groupId, {
                pokemon: pokemon,
                timestamp: Date.now()
            });
        }

        return {
            text: `⚔️ Um *${pokemon.name.toUpperCase()}* selvagem apareceu!\nTier: ${pokemon.tier} | Tipo: ${pokemon.type1}\n\nUse *!poke capturar* para tentar pegar!`,
            image: pokemon.sprite_url
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

        // Cálculo de Chance (Simplificado: 50% fixo por enquanto)
        const success = Math.random() < 0.5;

        if (success) {
            const pk = encounter.pokemon;
            
            const randIv = () => Math.floor(Math.random() * 32);
            
            await this.db.run(`
                INSERT INTO user_pokemons (user_id, pokedex_id, nickname, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, obtained_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, pk.id, pk.name, randIv(), randIv(), randIv(), randIv(), randIv(), randIv(), Date.now()]
            );

            this.activeEncounters.delete(groupId);
            return `🎉 *PARABÉNS!* Você capturou o *${pk.name.toUpperCase()}*!\nVocê tem agora ${balls - 1} Pokébolas.`;
        } else {
            return `💢 O *${encounter.pokemon.name.toUpperCase()}* escapou da pokebola!\nTente de novo! (Bolas restantes: ${balls - 1})`;
        }
    }

    async getUserProfile(userId) {
        const pokemons = await this.db.all(`
            SELECT p.name, up.level, up.nickname 
            FROM user_pokemons up
            JOIN pokedex p ON up.pokedex_id = p.id
            WHERE up.user_id = ?
            LIMIT 6
        `, [userId]);

        const user = await this.db.get("SELECT pokeballs FROM usuarios WHERE id_usuario = ?", [userId]);
        const balls = user ? user.pokeballs : 0;

        if (!pokemons.length) return `🎒 *MOCHILA*\nPokébolas: ${balls}\n\nVocê ainda não tem Pokémons. Use *!poke explorar*!`;

        let msg = `🎒 *MOCHILA DE TREINADOR* (Bolas: ${balls})\n\n`;
        pokemons.forEach(p => {
            msg += `🔴 *${p.name}* (Lvl ${p.level})\n`;
        });
        
        return msg;
    }
}

module.exports = PokemonHandler;