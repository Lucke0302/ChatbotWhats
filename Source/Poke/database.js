class PokeDatabase {
    constructor(dbConnection) {
        this.db = dbConnection;
    }

    // ==========================================
    //  USUÁRIOS E PERFIL
    // ==========================================

    async getUserInfo(userId) {
        return await this.db.get("SELECT nome, color, financas, pokecoins, pokeballs, potions, badges, gym_progress, claimed_events FROM usuarios WHERE id_usuario = ?", [userId]);
    }

    async updateCoins(userId, amount) {
        return await this.db.run("UPDATE usuarios SET pokecoins = pokecoins + ? WHERE id_usuario = ?", [amount, userId]);
    }

    async updateBadges(userId, rewardCoins) {
        return await this.db.run("UPDATE usuarios SET badges = badges + 1, pokecoins = pokecoins + ?, gym_progress = NULL WHERE id_usuario = ?", [rewardCoins, userId]);
    }

    async updateGymProgress(userId, remainingTrainers) {
        return await this.db.run("UPDATE usuarios SET gym_progress = ? WHERE id_usuario = ?", [remainingTrainers, userId]);
    }

    async updateColor(userId, newColor) {
        return await this.db.run("UPDATE usuarios SET color = ? WHERE id_usuario = ?", [newColor, userId]);
    }

    // ==========================================
    //  POKÉDEX E GOLPES GLOBAIS
    // ==========================================

    async getPokedexById(id) {
        return await this.db.get("SELECT * FROM pokedex WHERE id = ?", [id]);
    }

    async getPokedexByName(name) {
        return await this.db.get("SELECT * FROM pokedex WHERE name LIKE ? OR id = ?", [`%${name}%`, name]);
    }

    async getRandomWildPokemon(maxTier, minXp = 0, maxXp = 999) {
        return await this.db.get(
            `SELECT * FROM pokedex WHERE base_xp >= ? AND base_xp < ? AND rarity = 'common' AND is_starter = 0 AND tier <= ? ORDER BY RANDOM() LIMIT 1`, 
            [minXp, maxXp, maxTier]
        );
    }

    async getMoveById(moveId) {
        return await this.db.get("SELECT * FROM moves WHERE id = ?", [moveId]);
    }

    async getMoveByName(moveName) {
        return await this.db.get("SELECT * FROM moves WHERE name LIKE ?", [moveName]);
    }

    async getLearnableMovesByLevel(pokedexId, level) {
        return await this.db.all(
            `SELECT m.* FROM pokemon_moves pm JOIN moves m ON pm.move_id = m.id WHERE pm.pokemon_id = ? AND pm.level_learned <= ? ORDER BY pm.level_learned DESC LIMIT 4`, 
            [pokedexId, level]
        );
    }

    // ==========================================
    //  POKÉMON DO JOGADOR (TIME E PC)
    // ==========================================

    async getTeam(userId) {
        return await this.db.all(`
            SELECT up.*, p.name as species_name, p.type1, p.type2, p.sprite_url, p.evolve_to, p.evolve_level, p.evolve_method, p.evolve_condition
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.user_id = ? AND up.team_slot BETWEEN 1 AND 6
            ORDER BY up.team_slot ASC`, [userId]);
    }

    async getPokemonBySlot(userId, slot) {
        return await this.db.get(`
            SELECT up.*, p.name as species_name, p.type1, p.type2, p.sprite_url, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe, p.evolve_to, p.evolve_level, p.evolve_method, p.evolve_condition
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.user_id = ? AND up.team_slot = ?`, [userId, slot]);
    }

    async getPokemonById(pokemonId) {
        return await this.db.get(`
            SELECT up.*, p.name as species_name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe
            FROM user_pokemons up 
            JOIN pokedex p ON up.pokedex_id = p.id 
            WHERE up.id = ?`, [pokemonId]);
    }

    async getCountUserPokemons(userId) {
        const result = await this.db.get("SELECT count(*) as total FROM user_pokemons WHERE user_id = ?", [userId]);
        return result ? result.total : 0;
    }

    async getOccupiedSlots(userId) {
        return await this.db.all("SELECT team_slot FROM user_pokemons WHERE user_id = ? AND team_slot > 0 ORDER BY team_slot ASC", [userId]);
    }

    async insertUserPokemon(data) {
        return await this.db.run(`
            INSERT INTO user_pokemons 
            (user_id, pokedex_id, nickname, level, exp, current_hp, max_hp, 
             move1, move2, move3, move4, move1_pp, move2_pp, move3_pp, move4_pp, 
             obtained_at, iv_hp, iv_atk, iv_def, iv_spa, iv_spd, iv_spe, team_slot, nature, is_shiny) 
            VALUES (?,?,?,?, ?,?,?, ?,?,?,?, ?,?,?,?, ?, ?,?,?,?,?,?, ?, ?, ?)`,
            [
                data.user_id, data.pokedex_id, data.nickname, data.level, data.exp, data.current_hp, data.max_hp, 
                data.move1, data.move2, data.move3, data.move4, data.move1_pp, data.move2_pp, data.move3_pp, data.move4_pp,
                data.obtained_at, data.iv_hp, data.iv_atk, data.iv_def, data.iv_spa, data.iv_spd, data.iv_spe, data.team_slot, data.nature, data.is_shiny || 0
            ]
        );
    }

    async updatePokemonHP(pokemonId, currentHp) {
        return await this.db.run("UPDATE user_pokemons SET current_hp = MAX(0, ?) WHERE id = ?", [currentHp, pokemonId]);
    }

    async healEntireTeam(userId) {
        await this.db.run("UPDATE user_pokemons SET current_hp = max_hp, status = NULL WHERE user_id = ?", [userId]);
        return await this.db.run(`
            UPDATE user_pokemons 
            SET move1_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move1),
                move2_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move2),
                move3_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move3),
                move4_pp = (SELECT pp FROM moves WHERE id = user_pokemons.move4)
            WHERE user_id = ?
        `, [userId]);
    }

    async updatePokemonSlot(pokemonId, newSlot) {
        return await this.db.run("UPDATE user_pokemons SET team_slot = ? WHERE id = ?", [newSlot, pokemonId]);
    }

    async updatePokemonStatus(pokemonId, statusString) {
        return await this.db.run("UPDATE user_pokemons SET status = ? WHERE id = ?", [statusString, pokemonId]);
    }

    async updatePokemonItem(pokemonId, itemId) {
        return await this.db.run("UPDATE user_pokemons SET held_item = ? WHERE id = ?", [itemId, pokemonId]);
    }

    async updatePokemonExpAndLevel(pokemonId, exp, level, newMaxHp, currentHp) {
        return await this.db.run(
            "UPDATE user_pokemons SET exp = ?, level = ?, max_hp = ?, current_hp = ? WHERE id = ?", 
            [exp, level, newMaxHp, currentHp, pokemonId]
        );
    }

    async updatePokemonEvolution(pokemonId, newPokedexId, newNickname, consumedItem) {
        let itemQuery = consumedItem ? ", held_item = NULL" : "";
        return await this.db.run(`UPDATE user_pokemons SET pokedex_id = ?, nickname = ? ${itemQuery} WHERE id = ?`, [newPokedexId, newNickname, pokemonId]);
    }

    async addPokemonEVs(pokemonId, evStatsObject) {
        const col = evStatsObject.statName; 
        return await this.db.run(`UPDATE user_pokemons SET ${col} = ${col} + ? WHERE id = ?`, [evStatsObject.amount, pokemonId]);
    }

    // ==========================================
    //  INVENTÁRIO E ITENS
    // ==========================================

    async getBag(userId) {
        return await this.db.all(`
            SELECT i.id, i.name, i.type, inv.quantity, i.description 
            FROM inventory inv 
            JOIN items i ON inv.item_id = i.id 
            WHERE inv.user_id = ? AND inv.quantity > 0
            ORDER BY i.type ASC, i.name ASC`, [userId]);
    }

    async getItemQuantity(userId, itemId) {
        const res = await this.db.get("SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
        return res ? res.quantity : 0;
    }

    async addItem(userId, itemId, amount = 1) {
        const current = await this.getItemQuantity(userId, itemId);
        if (current > 0) {
            return await this.db.run("UPDATE inventory SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?", [amount, userId, itemId]);
        } else {
            return await this.db.run("INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)", [userId, itemId, amount]);
        }
    }

    async removeItem(userId, itemId, amount = 1) {
        const current = await this.getItemQuantity(userId, itemId);
        if (current < amount) return false;

        if (current === amount) {
            await this.db.run("DELETE FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
        } else {
            await this.db.run("UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?", [amount, userId, itemId]);
        }
        return true;
    }

    async getShopItems() {
        return await this.db.all("SELECT * FROM items WHERE type != 'tm' AND price > 0 ORDER BY type ASC, price ASC");
    }

    // ==========================================
    //  SISTEMA DE BATALHA (ENCOUNTERS)
    // ==========================================

    async getActiveEncounter(userId) {
        return await this.db.get(`
            SELECT ae.*, p.name, p.type1, p.type2, p.base_hp, p.base_atk, p.base_def, p.base_spa, p.base_spd, p.base_spe, p.sprite_url, p.base_xp, p.rarity
            FROM active_encounters ae
            JOIN pokedex p ON ae.pokedex_id = p.id
            WHERE ae.user_id = ?`, [userId]);
    }

    async createEncounter(data) {
        return await this.db.run(`
            INSERT INTO active_encounters (
                user_id, group_id, pokedex_id, current_hp, max_hp, level, 
                is_shiny, moves, battle_type, extra_data, started_at, active_pokemon_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [
                data.userId, data.groupId, data.pokedexId, data.currentHp, data.maxHp, data.level, 
                data.isShiny ? 1 : 0, JSON.stringify(data.moves), data.battleType, 
                JSON.stringify(data.extraData || {}), Date.now(), data.activePokemonId
            ]
        );
    }

    async updateEncounterState(userId, activePokemonId, currentHp, enemyMovesArray, extraDataObj) {
        return await this.db.run(`
            UPDATE active_encounters 
            SET active_pokemon_id = ?, current_hp = MAX(0, ?), moves = ?, extra_data = ? 
            WHERE user_id = ?`, 
            [activePokemonId, currentHp, JSON.stringify(enemyMovesArray), JSON.stringify(extraDataObj), userId]
        );
    }

    async advanceGymBattle(userId, newPokedexId, newLevel, newHp, newMovesArray, updatedExtraData) {
        return await this.db.run(`
            UPDATE active_encounters 
            SET pokedex_id = ?, current_hp = ?, max_hp = ?, level = ?, moves = ?, extra_data = ?
            WHERE user_id = ?`,
            [newPokedexId, newHp, newHp, newLevel, JSON.stringify(newMovesArray), JSON.stringify(updatedExtraData), userId]
        );
    }

    async clearEncounter(userId) {
        return await this.db.run("DELETE FROM active_encounters WHERE user_id = ?", [userId]);
    }
}

module.exports = PokeDatabase;