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

            const speciesRes = await axios.get(data.species.url);
            const sp = speciesRes.data;

            let rarity = 'common';
            if (sp.is_legendary || sp.is_mythical) rarity = 'rare';

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

function traverseEvolutionChain(chainNode, tier, familyId, list) {
    let minLevel = null;
    let trigger = null;
    let item = null;

    if (chainNode.evolution_details && chainNode.evolution_details.length > 0) {
        const detail = chainNode.evolution_details[0];
        trigger = detail.trigger.name;
        minLevel = detail.min_level;
        item = detail.item ? detail.item.name : null;
    }

    list.push({
        species_name: chainNode.species.name,
        tier: tier,
        family_id: familyId,
        evolves_at_level: minLevel,
        evolution_trigger: trigger,
        evolution_item: item
    });

    if (chainNode.evolves_to.length > 0) {
        chainNode.evolves_to.forEach(childNode => {
            traverseEvolutionChain(childNode, tier + 1, familyId, list);
        });
    }
}

async function getEvolutionData(pokemonId) {
    try {
        const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const chainUrl = speciesRes.data.evolution_chain.url;
        const familyId = chainUrl.split('/').slice(-2, -1)[0];

        const chainRes = await axios.get(chainUrl);
        const chainData = chainRes.data.chain;

        const flatList = [];
        traverseEvolutionChain(chainData, 1, familyId, flatList);

        return flatList;

    } catch (error) {
        console.error("Erro:", error.message);
        return [];
    }
}

getEvolutionData(60).then(data => console.log(JSON.stringify(data, null, 2)));

fetchPokemonData();