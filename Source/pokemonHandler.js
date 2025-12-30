const axios = require('axios');
const fs = require('fs');

const POKEMON_COUNT = 151; 
const GAME_VERSION = 'sword-shield';

async function fetchPokemonData() {
    const pokedex = [];

    console.log(`Iniciando download de ${POKEMON_COUNT} pokémon...`);

    for (let i = 1; i <= POKEMON_COUNT; i++) {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);
            const data = response.data;

            const stats = {};
            data.stats.forEach(s => {
                stats[s.stat.name] = s.base_stat;
            });

            const moves = data.moves
                .map(m => {
                    const versionDetail = m.version_group_details.find(
                        v => v.version_group.name === GAME_VERSION && v.move_learn_method.name === 'level-up'
                    );

                    if (versionDetail) {
                        return {
                            name: m.move.name,
                            level: versionDetail.level_learned_at,
                            url: m.move.url
                        };
                    }
                    return null;
                })
                .filter(m => m !== null) 
                .sort((a, b) => a.level - b.level);

            const cleanPokemon = {
                id: data.id,
                name: data.name,
                types: data.types.map(t => t.type.name),
                base_stats: stats,
                moves: moves,
                sprite: data.sprites.front_default,
                base_xp: data.base_experience
            };

            pokedex.push(cleanPokemon);
            console.log(`[${i}/${POKEMON_COUNT}] ${data.name} processado.`);

        } catch (error) {
            console.error(`Erro no ID ${i}:`, error.message);
        }
    }

    fs.writeFileSync('pokedex_clean.json', JSON.stringify(pokedex, null, 2));
    console.log('Pokédex salva com sucesso!');
}

fetchPokemonData();