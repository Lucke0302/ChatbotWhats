const crypto = require('crypto');

const SEEDS_CATALOG = [
    { id: 'trigo', name: 'Trigo Rápido', emoji: '🌾', growthTimeHours: 4, saturation: 1.0, yieldMultiplier: 1.0, cost: 20, sellPriceKg: 0.6 },
    { id: 'batata', name: 'Batata do Minecraft', emoji: '🥔', growthTimeHours: 6, saturation: 1.1, yieldMultiplier: 1.2, cost: 35, sellPriceKg: 0.8 },
    { id: 'cenoura', name: 'Cenoura Comum', emoji: '🥕', growthTimeHours: 8, saturation: 1.2, yieldMultiplier: 1.5, cost: 50, sellPriceKg: 1.0 },

    { id: 'soja', name: 'Soja Transgênica', emoji: '🌱', growthTimeHours: 12, saturation: 1.5, yieldMultiplier: 2.0, cost: 80, sellPriceKg: 1.2 },
    { id: 'girassol', name: 'Girassol Mutante (PvZ)', emoji: '🌻', growthTimeHours: 14, saturation: 1.8, yieldMultiplier: 1.8, cost: 90, sellPriceKg: 1.4 },
    { id: 'abobora', name: 'Abóbora Gigante', emoji: '🎃', growthTimeHours: 16, saturation: 2.0, yieldMultiplier: 2.2, cost: 120, sellPriceKg: 1.5 },

    { id: 'melancia', name: 'Melancia Quadrada', emoji: '🍉', growthTimeHours: 24, saturation: 4.0, yieldMultiplier: 2.5, cost: 250, sellPriceKg: 3.0 },
    { id: 'cogumelo', name: 'Fungo do Nether', emoji: '🍄', growthTimeHours: 36, saturation: 5.5, yieldMultiplier: 3.0, cost: 500, sellPriceKg: 5.0 },
    { id: 'feijao', name: 'Pé de Feijão Mágico', emoji: '🌿', growthTimeHours: 48, saturation: 7.0, yieldMultiplier: 4.0, cost: 1000, sellPriceKg: 8.0 },

    { id: 'fruta_estelar', name: 'Fruta Estelar (Stardew)', emoji: '⭐', growthTimeHours: 72, saturation: 12.0, yieldMultiplier: 5.0, cost: 3000, sellPriceKg: 20.0 },
    { id: 'akuma', name: 'Akuma no Mi', emoji: '🍇', growthTimeHours: 120, saturation: 25.0, yieldMultiplier: 1.0, cost: 8000, sellPriceKg: 100.0 }
];

const TOOLS_CATALOG = {
    'enxada': [
        { level: 1, name: 'Enxada de Madeira', multiplier: 1.0, price: 0 },
        { level: 2, name: 'Enxada de Ferro', multiplier: 1.1, price: 2000 },
        { level: 3, name: 'Enxada de Diamante', multiplier: 1.3, price: 10000 }
    ],
    'trator': [
        { level: 1, name: 'Carrinho de Mão', multiplier: 1.0, price: 0 },
        { level: 2, name: 'Tratorzinho Velho', multiplier: 1.5, price: 5000 },
        { level: 3, name: 'Colheitadeira Agrícola', multiplier: 2.0, price: 25000 }
    ]
};

class FazendaHandler {
    constructor(db, casinoHandler, pescariaHandler) {
        this.db = db;
        this.casinoHandler = casinoHandler;
        this.pescariaHandler = pescariaHandler;

        this.BASE_YIELD_KG = 50.0;
        this.MAX_SUPPLY = 10;
    }

    async getFazendaData(userId) {
        let row = await this.db.get("SELECT canteiros, upgrades, armazem FROM fazenda_inventario WHERE id_usuario = ?", [userId]);
        
        if (!row) {
            const defaultCanteiros = [
                { id: 1, seedId: null, plantTime: 0, harvestTime: 0, regas: 0 }
            ];
            const defaultUpgrades = { enxada: 1, trator: 1, maxCanteiros: 1 };
            const defaultArmazem = [];

            await this.db.run(
                "INSERT INTO fazenda_inventario (id_usuario, canteiros, upgrades, armazem) VALUES (?, ?, ?, ?)", 
                [userId, JSON.stringify(defaultCanteiros), JSON.stringify(defaultUpgrades), JSON.stringify(defaultArmazem)]
            );
            return { canteiros: defaultCanteiros, upgrades: defaultUpgrades, armazem: defaultArmazem };
        }

            return {
            canteiros: JSON.parse(row.canteiros),
            upgrades: JSON.parse(row.upgrades),
            armazem: JSON.parse(row.armazem || '[]'),
            trofeus: row.trofeus ? JSON.parse(row.trofeus) : {}
        };
    }

    async saveFazendaData(userId, data) {
        await this.db.run(
            "UPDATE fazenda_inventario SET canteiros = ?, upgrades = ?, armazem = ?, trofeus = ? WHERE id_usuario = ?", 
            [JSON.stringify(data.canteiros), JSON.stringify(data.upgrades), JSON.stringify(data.armazem), JSON.stringify(data.trofeus), userId]
        );
    }

    async consumirSuprimento(userId, quantidade = 1) {
        let pescariaPlayer = await this.pescariaHandler.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        if (pescariaPlayer.suprimentos < quantidade) return false;

        if (pescariaPlayer.suprimentos === this.pescariaHandler.MAX_SUPPLIES) {
            pescariaPlayer.last_supply_regen = now;
        }

        pescariaPlayer.suprimentos -= quantidade;
        await this.pescariaHandler.savePlayerData(userId, pescariaPlayer);
        return true;
    }

    // PERFIL E CANTEIROS
    async verFazenda(userId, userTag) {
        const data = await this.getFazendaData(userId);
        let pescariaPlayer = await this.pescariaHandler.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        let msg = `${userTag}🚜 **SUA BOSTOFAZENDA** 🚜\n_Suprimentos: 📦 ${pescariaPlayer.suprimentos}/${this.MAX_SUPPLY}_\n\n`;

        data.canteiros.forEach(c => {
            msg += `🟫 **Canteiro [ ${c.id} ]:**\n`;
            if (!c.seedId) {
                msg += `   🌱 _Vazio_ (Pronto para plantar)\n\n`;
            } else {
                const seed = SEEDS_CATALOG.find(s => s.id === c.seedId);
                if (now >= c.harvestTime) {
                    msg += `   ✅ ${seed.emoji} **${seed.name}** PRONTA PARA COLHEITA!\n`;
                    msg += `   🌾 _Use !fazenda colher ${c.id}_\n\n`;
                } else {
                    const timeLeft = c.harvestTime - now;
                    const hours = Math.floor(timeLeft / 3600);
                    const mins = Math.floor((timeLeft % 3600) / 60);
                    msg += `   ⏳ ${seed.emoji} Crescendo... (Faltam ${hours}h e ${mins}m)\n`;
                    msg += `   💧 Regas aplicadas: ${c.regas}\n\n`;
                }
            }
        });

        msg += `💡 _Dica: Use !fazenda regar [nº] pra gastar 1 Suprimento e adiantar um pouco o tempo pra colher!_`;
        return msg;
    }

    // LOJA DE SEMENTES
    async getLoja(userId, userTag) {
        const userDb = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const balance = userDb ? userDb.bostocoins : 0;
        const data = await this.getFazendaData(userId);

        let msg = `${userTag}🏪 **COOPERATIVA AGRÍCOLA** 🏪\n_Saldo: 🪙 ${balance} Bostocoins_\n\n`;
        
        msg += `🌱 **CATÁLOGO DE SEMENTES**\n`;
        SEEDS_CATALOG.forEach(s => {
            msg += `${s.emoji} **${s.name}** ➝ 🪙 ${s.cost}\n`;
            msg += `   ⏱️ Tempo: ${s.growthTimeHours}h | 🧬 Saturação: ${s.saturation}x\n`;
            msg += `   🛒 *!fazenda plantar ${s.id}*\n\n`;
        });

        msg += `\n🛠️ **EQUIPAMENTOS E TRATORES**\n_Aumentam a sua produção passiva!_\n\n`;
        
        const nextEnxada = TOOLS_CATALOG['enxada'].find(e => e.level === data.upgrades.enxada + 1);
        if (nextEnxada) {
            msg += `⛏️ **${nextEnxada.name}** (Nvl ${nextEnxada.level})\n`;
            msg += `   Buff: +${Math.floor((nextEnxada.multiplier - 1) * 100)}% de Qualidade\n`;
            msg += `   💰 Custo: 🪙 ${nextEnxada.price} ➝ _*!fazenda comprar enxada*_\n\n`;
        } else {
            msg += `⛏️ _Enxada Máxima Atingida!_\n\n`;
        }

        const nextTrator = TOOLS_CATALOG['trator'].find(t => t.level === data.upgrades.trator + 1);
        if (nextTrator) {
            msg += `🚜 **${nextTrator.name}** (Nvl ${nextTrator.level})\n`;
            msg += `   Buff: +${Math.floor((nextTrator.multiplier - 1) * 100)}% de Peso Colhido\n`;
            msg += `   💰 Custo: 🪙 ${nextTrator.price} ➝ _*!fazenda comprar trator*_\n`;
        } else {
            msg += `🚜 _Trator Máximo Atingido!_\n`;
        }

        return msg;
    }

    async comprarUpgrade(userId, userTag, tipo) {
        if (tipo !== 'enxada' && tipo !== 'trator') {
            return `${userTag} ⚠️ O que você quer comprar? Use *!fazenda comprar enxada* ou *!fazenda comprar trator*.`;
        }

        const data = await this.getFazendaData(userId);
        const userDb = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const balance = userDb ? userDb.bostocoins : 0;

        const currentLevel = data.upgrades[tipo];
        const nextUpgrade = TOOLS_CATALOG[tipo].find(t => t.level === currentLevel + 1);

        if (!nextUpgrade) {
            return `${userTag} 🛑 Você já possui o melhor equipamento de ${tipo} do mercado! O John Deere tem inveja de você.`;
        }

        if (balance < nextUpgrade.price) {
            return `${userTag} 💸 Você tá pobre! A ${nextUpgrade.name} custa 🪙 ${nextUpgrade.price} Bostocoins. Vá vender umas cenouras.`;
        }

        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [nextUpgrade.price, userId]);
        
        data.upgrades[tipo] = nextUpgrade.level;
        await this.saveFazendaData(userId, data);

        return `${userTag} 🤝 **NEGÓCIO FECHADO!**\n\nVocê acaba de adquirir a **${nextUpgrade.name}**!\nSuas próximas colheitas terão um multiplicador de **${nextUpgrade.multiplier}x**.`;
    }

    // PLANTAR
    async plantar(userId, userTag, seedId) {
        if (!seedId) return `${userTag} ⚠️ Qual semente? Use *!fazenda loja* para ver os IDs.`;
        
        const seed = SEEDS_CATALOG.find(s => s.id === seedId.toLowerCase());
        if (!seed) return `${userTag} ❌ Semente desconhecida.`;

        const userDb = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const balance = userDb ? userDb.bostocoins : 0;

        if (balance < seed.cost) return `${userTag} 💸 Você não tem 🪙 ${seed.cost} para comprar esta semente.`;

        const data = await this.getFazendaData(userId);
        const canteiroLivre = data.canteiros.find(c => !c.seedId);

        if (!canteiroLivre) return `${userTag} 🛑 Todos os seus canteiros estão ocupados!`;

        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [seed.cost, userId]);

        const now = Math.floor(Date.now() / 1000);
        canteiroLivre.seedId = seed.id;
        canteiroLivre.plantTime = now;
        canteiroLivre.harvestTime = now + (seed.growthTimeHours * 3600);
        canteiroLivre.regas = 0;

        await this.saveFazendaData(userId, data);

        return `${userTag} 🌱 **SEMENTE PLANTADA!**\nVocê gastou 🪙 ${seed.cost} e plantou ${seed.emoji} **${seed.name}** no Canteiro ${canteiroLivre.id}.\nFicará pronta em ${seed.growthTimeHours} horas!`;
    }

    // REGAR
    async regar(userId, userTag, canteiroIdStr) {
        const cId = parseInt(canteiroIdStr);
        if (isNaN(cId)) return `${userTag} ⚠️ Informe o número do canteiro. Ex: *!fazenda regar 1*`;

        const data = await this.getFazendaData(userId);
        const canteiro = data.canteiros.find(c => c.id === cId);

        if (!canteiro) return `${userTag} ❌ Canteiro não existe.`;
        if (!canteiro.seedId) return `${userTag} 🟫 Vai regar terra pura? O canteiro está vazio!`;

        const now = Math.floor(Date.now() / 1000);
        if (now >= canteiro.harvestTime) return `${userTag} ✅ A planta já cresceu! Use *!fazenda colher ${cId}*.`;

        const seed = SEEDS_CATALOG.find(s => s.id === canteiro.seedId);
        
        const gastou = await this.consumirSuprimento(userId, 1);
        if (!gastou) return `${userTag} 🪹 Você não tem Suprimentos (Água/Iscas)! Espere recarregar.`;

        const porcentagemRegador = Math.max(5, 30 - seed.saturation);
        const tempoTotalSegundos = seed.growthTimeHours * 3600;
        const tempoReduzido = Math.floor(tempoTotalSegundos * (porcentagemRegador / 100));
        
        canteiro.harvestTime -= tempoReduzido;
        canteiro.regas += 1;

        if (canteiro.harvestTime < now) canteiro.harvestTime = now;
        await this.saveFazendaData(userId, data);

        let msg = `${userTag} 💦 **CANTEIRO REGADO!**\nVocê gastou 1 Suprimento e adiantou o crescimento em **${porcentagemRegador.toFixed(1)}%**.\n`;
        
        if (canteiro.harvestTime === now) {
            msg += `🎉 A planta brotou e está pronta para a colheita!`;
        } else {
            const timeLeft = canteiro.harvestTime - now;
            const hours = Math.floor(timeLeft / 3600);
            const mins = Math.floor((timeLeft % 3600) / 60);
            msg += `⏳ Faltam ${hours}h e ${mins}m para crescer.`;
        }

        return msg;
    }

    // COLHER 
    async colher(userId, userTag, canteiroIdStr, groupId) {
        const cId = parseInt(canteiroIdStr);
        if (isNaN(cId)) return `${userTag} ⚠️ Informe o canteiro. Ex: *!fazenda colher 1*`;

        const data = await this.getFazendaData(userId);
        const canteiro = data.canteiros.find(c => c.id === cId);

        if (!canteiro || !canteiro.seedId) return `${userTag} ❌ Este canteiro está vazio.`;

        const now = Math.floor(Date.now() / 1000);
        if (now < canteiro.harvestTime) return `${userTag} 🛑 Tá verde ainda! Volte mais tarde ou use *!fazenda regar*.`;

        const seed = SEEDS_CATALOG.find(s => s.id === canteiro.seedId);
        
        const tratorLevel = data.upgrades.trator || 1;
        const tratorMult = TOOLS_CATALOG['trator'].find(t => t.level === tratorLevel).multiplier;
        
        const baseKilos = this.BASE_YIELD_KG * seed.yieldMultiplier * tratorMult;
        
        let finalKilos = baseKilos;
        let rngMsg = "";
        const roll = Math.random() * 100;

        if (roll < 5) {
            finalKilos = 0;
            rngMsg = `\n🦗 **DESASTRE!** Uma nuvem de gafanhotos devorou sua plantação. Você perdeu TUDO!`;
        } else if (roll < 15) {
            finalKilos = baseKilos * 0.5;
            rngMsg = `\n☀️ **SECA FORTE!** A terra rachou e sua colheita rendeu apenas a metade.`;
        } else {
            rngMsg = `\n🌟 Colheita perfeita! A terra estava fértil.`;
        }

        let msg = `${userTag} 🚜 **COLHEITA REALIZADA** 🚜${rngMsg}\n`;

        if (finalKilos > 0) {
            data.armazem.push({
                id: seed.id, name: seed.name, emoji: seed.emoji, weight: finalKilos, saturation: seed.saturation, date: now, instanceId: crypto.randomUUID()
            });
            msg += `\n📦 Você colheu **${finalKilos.toFixed(2)}kg** de ${seed.emoji} ${seed.name}!\n_(Foi guardado na sua !fazenda despensa)_`;

            if (!data.trofeus) data.trofeus = {};
            if (!data.trofeus[seed.id] || finalKilos > data.trofeus[seed.id].weight) {
                data.trofeus[seed.id] = { weight: finalKilos, date: now, group_id: groupId };
            }
        }

        canteiro.seedId = null;
        canteiro.plantTime = 0;
        canteiro.harvestTime = 0;
        canteiro.regas = 0;

        await this.saveFazendaData(userId, data);
        return msg;
    }

    // EXPOSIÇÃO AGROPECUÁRIA
    async getTrofeusGrupo(groupId, userTag) {
        const rows = await this.db.all("SELECT u.nome, f.trofeus FROM fazenda_inventario f JOIN usuarios u ON f.id_usuario = u.id_usuario WHERE f.trofeus IS NOT NULL AND f.trofeus != '{}'");
        
        let bestCrops = {};

        for (const row of rows) {
            try {
                const trofeus = JSON.parse(row.trofeus);
                for (const [seedId, t] of Object.entries(trofeus)) {
                    if (t.group_id === groupId || !t.group_id) {
                        if (!bestCrops[seedId] || t.weight > bestCrops[seedId].weight) {
                            bestCrops[seedId] = { weight: t.weight, nome: row.nome || 'Anônimo', date: t.date };
                        }
                    }
                }
            } catch (e) {}
        }

        if (Object.keys(bestCrops).length === 0) return `${userTag} 🏆 A feira agropecuária deste grupo está vazia! Ninguém colheu nada ainda.`;

        const sortedSeedIds = Object.keys(bestCrops).sort((a, b) => {
            return SEEDS_CATALOG.findIndex(s => s.id === a) - SEEDS_CATALOG.findIndex(s => s.id === b);
        });

        let msg = `${userTag}🏆 **EXPOSIÇÃO AGROPECUÁRIA (Recordes)** 🏆\n_As maiores colheitas já registradas no grupo._\n\n`;

        for (const seedId of sortedSeedIds) {
            const seed = SEEDS_CATALOG.find(s => s.id === seedId);
            const record = bestCrops[seedId];
            if (seed) {
                msg += `${seed.emoji} **${seed.name}** ➝ ⚖️ **${record.weight.toFixed(2)} kg** (👑 ${record.nome})\n`;
            }
        }

        return msg;
    }

    // ARMAZÉM / DESPENSA
    async verArmazem(userId, userTag) {
        const data = await this.getFazendaData(userId);
        if (data.armazem.length === 0) return `${userTag} 🪹 Seu armazém está vazio!`;

        let msg = `${userTag}🎒 **ARMAZÉM AGRÍCOLA** 🎒\n\n`;
        let totalValor = 0;

        data.armazem.forEach((item, index) => {
            const seed = SEEDS_CATALOG.find(s => s.id === item.id);
            const valorEstimado = Math.floor(item.weight * (seed ? seed.sellPriceKg : 1.0));
            totalValor += valorEstimado;
            
            msg += `*[ ${index + 1} ]* ${item.emoji} ${item.name} (**${item.weight.toFixed(2)}kg**)\n`;
            msg += `   🧬 Saturação: ${item.saturation}x | 🪙 Vale: ${valorEstimado}\n`;
        });

        msg += `\n💰 Valor Total Estimado: 🪙 **${totalValor} Bostocoins**\n`;
        msg += `_Use !fazenda vender [num/tudo] ou doe para o parque com !parque depositar_`;
        return msg;
    }

    // VENDER 
    async vender(userId, userTag, param) {
        const data = await this.getFazendaData(userId);
        if (data.armazem.length === 0) return `${userTag} ❌ Armazém vazio!`;

        let ganhoTotal = 0;
        let msg = `${userTag}🤝 **MERCADÃO AGRÍCOLA**\n\n`;

        if (param === 'tudo' || param === 'all') {
            data.armazem.forEach(item => {
                const seed = SEEDS_CATALOG.find(s => s.id === item.id);
                ganhoTotal += Math.floor(item.weight * (seed ? seed.sellPriceKg : 1.0));
            });
            msg += `Você despejou TODO o seu estoque no mercado!\n`;
            data.armazem = [];
        } else {
            const idx = parseInt(param) - 1;
            if (isNaN(idx) || idx < 0 || idx >= data.armazem.length) return `${userTag} ⚠️ Número inválido. Veja a !fazenda despensa.`;

            const item = data.armazem[idx];
            const seed = SEEDS_CATALOG.find(s => s.id === item.id);
            ganhoTotal = Math.floor(item.weight * (seed ? seed.sellPriceKg : 1.0));
            
            msg += `Você vendeu ${item.weight.toFixed(2)}kg de ${item.emoji} ${item.name}!\n`;
            data.armazem.splice(idx, 1);
        }

        await this.saveFazendaData(userId, data);
        
        const profitResult = await this.casinoHandler.verifyProfit(userId, ganhoTotal);
        await this.db.run("UPDATE usuarios SET bostocoins = bostocoins + ? WHERE id_usuario = ?", [profitResult.finalProfit, userId]);

        msg += `💰 **Lucro Final:** 🪙 **${ganhoTotal} Bostocoins**${profitResult.msg}`;
        return msg;
    }
}

module.exports = { FazendaHandler, SEEDS_CATALOG, TOOLS_CATALOG };