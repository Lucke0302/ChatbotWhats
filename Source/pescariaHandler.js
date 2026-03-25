const FISH_CATALOG = [
    // LIXO 
    { id: 'bota', name: 'Bota Velha', emoji: '👢', avgWeight: 2.0, rarity: 'lixo' },
    { id: 'pneu', name: 'Pneu Furado', emoji: '🛞', avgWeight: 8.0, rarity: 'lixo' },
    { id: 'calota', name: 'Calota de Celta', emoji: '🛸', avgWeight: 1.2, rarity: 'lixo' },
    { id: 'baiacu_mc', name: 'Baiacu do Minecraft', emoji: '🐡', avgWeight: 0.5, rarity: 'lixo' },

    // COMUM
    { id: 'lambari', name: 'Lambari', emoji: '🐟', avgWeight: 0.1, rarity: 'comum' },
    { id: 'tilapia', name: 'Tilápia', emoji: '🐡', avgWeight: 1.5, rarity: 'comum' },
    { id: 'bagre', name: 'Bagre', emoji: '🐟', avgWeight: 2.5, rarity: 'comum' },
    { id: 'piranha', name: 'Piranha', emoji: '🐟', avgWeight: 0.8, rarity: 'comum' },

    // INCOMUM
    { id: 'tambaqui', name: 'Tambaqui', emoji: '🐟', avgWeight: 15.0, rarity: 'incomum' },
    { id: 'tucunare', name: 'Tucunaré', emoji: '🐠', avgWeight: 5.0, rarity: 'incomum' },
    { id: 'feebas', name: 'Feebas', emoji: '🐟', avgWeight: 7.4, rarity: 'incomum' },
    { id: 'peixe_fabric', name: 'Peixe Bugado do Fabric', emoji: '👾', avgWeight: 3.14, rarity: 'incomum' },

    // RARO
    { id: 'pirarucu', name: 'Pirarucu', emoji: '🐉', avgWeight: 100.0, rarity: 'raro' },
    { id: 'dourado', name: 'Dourado', emoji: '✨', avgWeight: 20.0, rarity: 'raro' },
    { id: 'magikarp', name: 'Magikarp', emoji: '🐠', avgWeight: 5.0, rarity: 'raro' },  
    { id: 'dratini', name: 'Dratini', emoji: '🐉', avgWeight: 3.3, rarity: 'raro' },

    // MUITO RARO
    { id: 'gyarados', name: 'Gyarados', emoji: '🐉', avgWeight: 125.0, rarity: 'muito_raro' },
    { id: 'marlin', name: 'Marlin Azul', emoji: '🦈', avgWeight: 300.0, rarity: 'muito_raro' },
    { id: 'tubarao_martelo', name: 'Tubarão Martelo', emoji: '🦕', avgWeight: 250.0, rarity: 'muito_raro' },
    { id: 'capivara', name: 'Capivara do Taquaral', emoji: '🐹', avgWeight: 60.0, rarity: 'muito_raro' },

    // LENDÁRIO
    { id: 'magikarp_d', name: 'Magikarp Dourada', emoji: '✨', avgWeight: 10.0, rarity: 'lendario' },
    { id: 'gyarados_v', name: 'Gyarados Vermelho', emoji: '🐉', avgWeight: 250.0, rarity: 'lendario' },
    { id: 'tubarao_branco', name: 'Kyogre', emoji: '🐋', avgWeight: 750.0, rarity: 'lendario' },
    { id: 'kraken_f', name: 'Kraken Filhote', emoji: '🦑', avgWeight: 500.0, rarity: 'lendario' },

    // MÍTICO
    { id: 'bostossauro_aq', name: 'Bostossauro Aquático', emoji: '🦖', avgWeight: 999.9, rarity: 'mitico' },
    { id: 'fizz', name: 'Fizz Feedado', emoji: '🔱', avgWeight: 70.0, rarity: 'mitico' },
    { id: 'cthulhu', name: 'Cthulhu Dorminhoco', emoji: '🐙', avgWeight: 5000.0, rarity: 'mitico' },
    { id: 'kraken', name: 'Kraken Adulto', emoji: '🐙', avgWeight: 2500.0, rarity: 'mitico' }
];

const ITEM_CATALOG = [
    // INSTANTÂNEOS
    { id: 'balde_iscas', name: 'Balde de Iscas', emoji: '🪣', type: 'instant', effect: 3, desc: 'Dá +3 iscas na hora!' },
    { id: 'gaivota', name: 'Gaivota Ladra', emoji: '🦅', type: 'instant_debuff', effect: -1, desc: 'Uma gaivota te atacou e roubou 1 isca!' },
    
    // BUFFS
    { id: 'anzol_duplo', name: 'Anzol Duplo', emoji: '🪝', type: 'buff', duration: 3, desc: 'Pesca 2 peixes de uma vez.' },
    { id: 'anzol_chumbo', name: 'Anzol de Chumbo', emoji: '⚓', type: 'buff', duration: 5, desc: 'Aumenta o peso dos peixes em 30%.' },
    { id: 'repelente', name: 'Repelente de Bota', emoji: '🧴', type: 'buff', duration: 4, desc: 'Zera a chance de pescar lixo.' },
    { id: 'ima_coins', name: 'Ímã de Bostocoins', emoji: '🧲', type: 'buff', duration: 3, desc: 'Pesca de 10 a 50 Bostocoins junto com o peixe.' },
    { id: 'isca_radioativa', name: 'Isca Radioativa', emoji: '☢️', type: 'buff', duration: 2, desc: 'Peso +50%, mas 20% de chance da linha derreter.' },

    // DEBUFFS
    { id: 'linha_podre', name: 'Linha Podre', emoji: '🧶', type: 'debuff', duration: 3, desc: '25% de chance da linha arrebentar e perder o peixe.' },
    { id: 'maldicao_baiacu', name: 'Maldição do Baiacu', emoji: '🐡', type: 'debuff', duration: 4, desc: 'Aumenta muito a chance de vir Lixo.' }
];

class PescariaHandler {
    constructor(db) {
        this.db = db;
    }

    async getPlayerData(userId) {
        const user = await this.db.get("SELECT pescaria_data FROM usuarios WHERE id_usuario = ?", [userId]);
        let data = {};
        
        if (user && user.pescaria_data) {
            try {
                data = JSON.parse(user.pescaria_data);
            } catch (e) {
                data = {};
            }
        }

        const now = Math.floor(Date.now() / 1000);

        let player = {
            total_weight: data.total_weight || 0,
            records: data.records || {},
            inventory: data.inventory || { vara: 'bambu' },
            active_items: data.active_items || {},
            fishBaits: data.fishBaits !== undefined ? data.fishBaits : 4,
            last_bait_regen: data.last_bait_regen || now
        };

        const REGEN_TIME = 6 * 60 * 60;

        if (player.fishBaits < 4) {
            const timePassed = now - player.last_bait_regen;
            const generatedBaits = Math.floor(timePassed / REGEN_TIME);
            
            if (generatedBaits > 0) {
                player.fishBaits = Math.min(4, player.fishBaits + generatedBaits);
                player.last_bait_regen += generatedBaits * REGEN_TIME;
            }
        } else {
            player.last_bait_regen = now;
        }

        return player;
    }

    async savePlayerData(userId, data) {
        const jsonString = JSON.stringify(data);
        await this.db.run("UPDATE usuarios SET pescaria_data = ? WHERE id_usuario = ?", [jsonString, userId]);
    }

    async pescar(userId, userTag) {
        let player = await this.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        if (player.fishBaits < 1) {
            const REGEN_TIME = 6 * 60 * 60;
            const nextBaitIn = REGEN_TIME - (now - player.last_bait_regen);
            const hours = Math.floor(nextBaitIn / 3600);
            const mins = Math.floor((nextBaitIn % 3600) / 60);
            return `${userTag}🪹 Seu balde de iscas está vazio!\nVocê recebe uma isca nova em **${hours}h e ${mins}m**.\n_(Máximo acumulado: 4)_`;
        }

        player.fishBaits -= 1;
        
        if (player.fishBaits === 3 && now - player.last_bait_regen < 10) {
            player.last_bait_regen = now;
        }

        let msg = `${userTag}🎣 **PESCARIA** 🎣\n_Iscas restantes: ${player.fishBaits}_\n\n`;

        let catches = 1;
        let weightMultiplierBuff = 1.0;
        let canCatchTrash = true;

        if (player.active_items['anzol_duplo']) catches = 2;
        if (player.active_items['anzol_chumbo']) weightMultiplierBuff *= 1.30;
        if (player.active_items['isca_radioativa']) weightMultiplierBuff *= 1.50;
        if (player.active_items['repelente']) canCatchTrash = false;

        const activeItemNames = Object.keys(player.active_items).map(id => ITEM_CATALOG.find(i => i.id === id)?.name).filter(Boolean);
        if (activeItemNames.length > 0) {
            msg += `✨ _Efeitos Ativos:_ ${activeItemNames.join(', ')}\n\n`;
        }

        for (let i = 0; i < catches; i++) {
            
            if (player.active_items['isca_radioativa'] && Math.random() < 0.20) {
                msg += `☢️ A isca radioativa derreteu sua linha! O peixe fugiu.\n`;
                continue;
            }

            let roll = Math.random() * 100;
            let selectedRarity = 'comum';
            
            if (roll < 0.5) selectedRarity = 'mitico';
            else if (roll < 5) selectedRarity = 'lendario';
            else if (roll < 20) selectedRarity = 'muito_raro';
            else if (roll < 40) selectedRarity = 'raro';
            else if (roll < 60) selectedRarity = 'incomum';
            else if (roll < 80) selectedRarity = 'lixo';

            if (player.active_items['maldicao_baiacu'] && Math.random() < 0.35) {
                selectedRarity = 'lixo';
            }

            if (selectedRarity === 'lixo' && !canCatchTrash) {
                selectedRarity = 'comum';
            }

            const possibleFishes = FISH_CATALOG.filter(f => f.rarity === selectedRarity);
            const caughtFish = possibleFishes[Math.floor(Math.random() * possibleFishes.length)];

            const baseMultiplier = 0.5 + Math.random(); 
            const actualWeight = caughtFish.avgWeight * baseMultiplier * weightMultiplierBuff;
            const formattedWeight = actualWeight.toFixed(2);

            if (player.active_items['linha_podre'] && Math.random() < 0.25) {
                msg += `🧶 A linha podre ARREBENTOU ao tentar puxar um(a) **${caughtFish.name}**!\n`;
                continue; 
            }

            if (caughtFish.rarity === 'lixo') {
                msg += `${caughtFish.emoji} Fisgou: **${caughtFish.name}** (${formattedWeight}kg).\n`;
            } else {
                msg += `${caughtFish.emoji} Fisgou: **${caughtFish.name}** de **${formattedWeight}kg**!\n`;
                player.total_weight += actualWeight;
                
                const currentRecord = player.records[caughtFish.id] || 0;
                if (actualWeight > currentRecord) {
                    player.records[caughtFish.id] = actualWeight;
                    msg += `   🌟 _NOVO RECORDE PESSOAL DA ESPÉCIE!_ 🌟\n`;
                }

                if (player.active_items['ima_coins']) {
                    const moedasAchadas = Math.floor(Math.random() * 41) + 10;
                    await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [moedasAchadas, userId]);
                    msg += `   🧲 Puxou junto 🪙 **${moedasAchadas} Bostocoins**!\n`;
                }
            }
        }

        if (Math.random() < 0.20) {
            const droppedItem = ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];
            msg += `\n🎁 **ACHADO NO LAGO!** Você fisgou: ${droppedItem.emoji} *${droppedItem.name}*\n`;
            
            if (droppedItem.type === 'instant') {
                player.fishBaits += droppedItem.effect;
                msg += `_${droppedItem.desc}_\n`;
            } else if (droppedItem.type === 'instant_debuff') {
                player.fishBaits = Math.max(0, player.fishBaits + droppedItem.effect);
                msg += `_${droppedItem.desc}_\n`;
            } else {
                player.active_items[droppedItem.id] = droppedItem.duration;
                msg += `_Ativo por ${droppedItem.duration} rodadas! (${droppedItem.desc})_\n`;
            }
        }

        for (const itemId in player.active_items) {
            player.active_items[itemId] -= 1;
            if (player.active_items[itemId] <= 0) {
                delete player.active_items[itemId]; 
            }
        }

        await this.savePlayerData(userId, player);
        return msg;
    }

    // RANKING DE PESCA
    async getRanking(userTag) {
        const users = await this.db.all("SELECT nome, pescaria_data FROM usuarios WHERE pescaria_data IS NOT NULL AND pescaria_data != '{}'");

        if (!users || users.length === 0) return `${userTag} Ninguém pescou nada ainda. Bando de preguiçosos!`;

        let ranking = [];
        for (const u of users) {
            try {
                const data = JSON.parse(u.pescaria_data);
                if (data.total_weight > 0) {
                    ranking.push({ nome: u.nome || 'Anônimo', peso: data.total_weight });
                }
            } catch (e) {
            }
        }

        ranking.sort((a, b) => b.peso - a.peso);
        const top10 = ranking.slice(0, 10);

        if (top10.length === 0) return `${userTag}🎣 Ninguém tirou um peixe da água ainda!`;

        let msg = `🏆 **RANKING DE PESCADORES** 🏆\n_Quem tem a maior... quantidade de quilos fisgados_\n\n`;
        const medalhas = ["🥇", "🥈", "🥉"];
        
        top10.forEach((p, i) => {
            const medalha = medalhas[i] || "🏅";
            msg += `${medalha} *${p.nome}* ➝ **${p.peso.toFixed(2)}kg**\n`;
        });

        return msg;
    }

    // PERFIL E INVENTÁRIO
    async getPerfil(userId, userTag) {
        const player = await this.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        let msg = `${userTag}🎣 **CARTEIRA DE PESCADOR** 🎣\n\n`;
        msg += `⚖️ *Peso Total Pescado:* ${player.total_weight.toFixed(2)}kg\n`;

        // Status das Iscas
        msg += `🪣 *Iscas no Balde:* ${player.fishBaits}/4\n`;
        if (player.fishBaits < 4) {
            const REGEN_TIME = 6 * 60 * 60;
            const nextBaitIn = REGEN_TIME - (now - player.last_bait_regen);
            const hours = Math.floor(nextBaitIn / 3600);
            const mins = Math.floor((nextBaitIn % 3600) / 60);
            msg += `⏳ _Próxima isca em: ${hours}h e ${mins}m_\n`;
        }

        // Efeitos/Itens Ativos
        const activeBuffs = Object.keys(player.active_items);
        if (activeBuffs.length > 0) {
            msg += `\n✨ *Efeitos Ativos:*\n`;
            for (const id of activeBuffs) {
                const item = ITEM_CATALOG.find(i => i.id === id);
                if (item) {
                    msg += ` ${item.emoji} ${item.name} (${player.active_items[id]} rodadas)\n`;
                }
            }
        }

        const records = player.records;
        const recordKeys = Object.keys(records);
        
        if (recordKeys.length > 0) {
            msg += `\n🌟 *Seus Maiores Troféus:*\n`;
            
            const sortedRecords = recordKeys
                .map(id => ({ id, weight: records[id] }))
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 5); 

            for (const r of sortedRecords) {
                const fishInfo = FISH_CATALOG.find(f => f.id === r.id);
                if (fishInfo) {
                    msg += ` ${fishInfo.emoji} ${fishInfo.name}: **${r.weight.toFixed(2)}kg**\n`;
                }
            }
        } else {
            msg += `\n🌟 *Troféus:* Nenhum peixe digno ainda.\n`;
        }

        return msg;
    }
}

module.exports = PescariaHandler;