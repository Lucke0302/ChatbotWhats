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
        let row = await this.db.get("SELECT canteiros, upgrades, armazem, trofeus FROM fazenda_inventario WHERE id_usuario = ?", [userId]);
        
        if (!row) {
            const defaultCanteiros = [
                { id: 1, seedId: null, plantTime: 0, harvestTime: 0, regas: 0, adubado: false } 
            ];
            const defaultUpgrades = { enxada: 1, trator: 1, maxCanteiros: 1, adubos: 0 };
            const defaultArmazem = [];
            const defaultTrofeus = {};

            await this.db.run(
                "INSERT INTO fazenda_inventario (id_usuario, canteiros, upgrades, armazem, trofeus) VALUES (?, ?, ?, ?, ?)", 
                [userId, JSON.stringify(defaultCanteiros), JSON.stringify(defaultUpgrades), JSON.stringify(defaultArmazem), JSON.stringify(defaultTrofeus)]
            );
            return { canteiros: defaultCanteiros, upgrades: defaultUpgrades, armazem: defaultArmazem, trofeus: defaultTrofeus };
        }

        let canteirosParse = JSON.parse(row.canteiros);
        canteirosParse.forEach(c => { if (c.adubado === undefined) c.adubado = false; });
        
        let upgradesParse = JSON.parse(row.upgrades);
        if (upgradesParse.adubos === undefined) upgradesParse.adubos = 0;

        return {
            canteiros: canteirosParse,
            upgrades: upgradesParse,
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

    async getGroupedDispensa(userId) {
        const { sellableArray, player } = await this.pescariaHandler.getSellableList(userId);
        
        let inedible = [];
        if (this.pescariaHandler.parqueHandler && this.pescariaHandler.parqueHandler.INEDIBLE_ITEMS) {
            inedible = this.pescariaHandler.parqueHandler.INEDIBLE_ITEMS;
        } else {
            inedible = ['bota', 'pneu', 'calota', 'baiacu_mc', 'placa_mae_queimada', 'teclado_multilaser', 'cabo_vga', 'pote_sorvete', 'memoria_ddr1', 'cooler_box', 'mouse_bolinha', 'tcc_reprovado', 'cd_aol', 'fio_cobre', 'ram_2_gb_ddr2', 'ram_2_gb_ddr3', 'ram_8_gb_ddr3', 'ram_8_gb_ddr4', 'ram_16_gb_ddr4', 'ram_16_gb_ddr5', 'ram_64_gb_ddr5', 'rtx_5090', 'codigo_tcc'];
        }

        const edibleFishes = sellableArray.filter(f => !inedible.includes(f.id));

        const grouped = [];
        for (const fish of edibleFishes) {
            const weightStr = fish.weight.toFixed(2);
            const existing = grouped.find(g => g.id === fish.id && g.weightStr === weightStr);
            if (existing) {
                existing.count++;
                existing.instances.push(fish);
            } else {
                grouped.push({
                    id: fish.id, name: fish.name, emoji: fish.emoji,
                    weight: fish.weight, weightStr: weightStr, count: 1,
                    instances: [fish]
                });
            }
        }
        return { grouped, player, edibleFishes };
    }

    // FABRICAR ADUBO
    async compostar(userId, userTag, paramStr) {
        const { grouped, player, edibleFishes } = await this.getGroupedDispensa(userId);
        
        if (edibleFishes.length === 0) {
            return `${userTag} 🪹 Seu isopor está vazio ou só tem sucata! Vá pescar para ter o que compostar.`;
        }

        if (!paramStr || paramStr.trim() === '') {
            let msg = `${userTag}💩 **COMPOSTEIRA JURÁSSICA** 💩\n_Transforme peixe em Adubo Orgânico (10kg = 1 Saco)_\n\n`;
            
            grouped.forEach((g, i) => {
                const prefixo = g.count > 1 ? `**${g.count}x** ` : '';
                msg += `*[ ${i + 1} ]* ${prefixo}${g.emoji} ${g.name} (**${g.weightStr}kg**)\n`;
            });

            msg += `\n♻️ *!fazenda compostar [numero]* (Pode pôr vários: _!fazenda compostar 1 3 5_)\n`;
            msg += `♻️ *!fazenda compostar repetidos* (Gasta os clones, salva o maior)\n`;
            msg += `♻️ *!fazenda compostar tudo* (Moe TUDO que for peixe!)`;
            return msg;
        }

        const args = paramStr.trim().split(/\s+/);
        const action = args[0].toLowerCase();
        
        let fishesToCompost = [];
        let msgAction = "";

        if (action === 'tudo' || action === 'all') {
            fishesToCompost = [...edibleFishes];
            msgAction = "o seu ISOPOR INTEIRO";
        } 
        else if (action === 'repetidos' || action === 'repetido') {
            const bestFishes = {};
            for (const fish of edibleFishes) {
                if (!bestFishes[fish.id] || fish.weight > bestFishes[fish.id].weight) {
                    bestFishes[fish.id] = fish;
                }
            }
            
            const bestInstanceIds = Object.values(bestFishes).map(f => f.instanceId);
            fishesToCompost = edibleFishes.filter(f => !bestInstanceIds.includes(f.instanceId));
            
            if (fishesToCompost.length === 0) {
                return `${userTag} 🐟 Você só tem um exemplar de cada espécie no isopor. Não há peixes repetidos para compostar!`;
            }
            msgAction = "**todos os peixes repetidos**";
        } 
        else {
            let indices = args.map(s => parseInt(s) - 1).filter(i => !isNaN(i) && i >= 0 && i < grouped.length);
            indices = [...new Set(indices)]; 
            
            if (indices.length === 0) {
                return `${userTag} ⚠️ Número inválido. Veja a lista com *!fazenda compostar*.`;
            }
            
            for (const idx of indices) {
                fishesToCompost.push(grouped[idx].instances[0]);
            }
            msgAction = `**${fishesToCompost.length} peixe(s) selecionado(s)**`;
        }

        let pesoAcumulado = 0;
        let instancesToRemove = [];

        for (const f of fishesToCompost) {
            pesoAcumulado += f.weight;
            instancesToRemove.push(f.instanceId);
        }

        const qtdSacos = Math.floor(pesoAcumulado / 10.0);
        const sobra = pesoAcumulado % 10.0;

        if (qtdSacos <= 0) {
            return `${userTag} 🛑 Deu ruim! Você jogou ${pesoAcumulado.toFixed(2)}kg na máquina. São necessários no mínimo **10kg** para fabricar 1 Saco de Adubo!\nJunte mais peixes na seleção (Ex: _*!fazenda compostar 1 2 3*_).`;
        }

        player.records = player.records.filter(r => !instancesToRemove.includes(r.instanceId));

        let msgSobra = "";
        if (sobra > 0.01) {
            const ultimoPeixe = fishesToCompost[fishesToCompost.length - 1];
            player.records.push({
                id: ultimoPeixe.id,
                weight: sobra,
                group_id: ultimoPeixe.group_id || '120363422139578370@g.us',
                date: Math.floor(Date.now() / 1000),
                instanceId: crypto.randomUUID()
            });
            msgSobra = `🦴 **Troco:** Um retalho de **${sobra.toFixed(2)}kg** de ${ultimoPeixe.emoji} ${ultimoPeixe.name} voltou pro seu isopor para a próxima compostagem!\n\n`;
        }

        await this.pescariaHandler.savePlayerData(userId, player);

        const data = await this.getFazendaData(userId);
        data.upgrades.adubos += qtdSacos;
        await this.saveFazendaData(userId, data);

        let msg = `${userTag} ♻️ **COMPOSTAGEM CONCLUÍDA!**\n\n`;
        msg += `Você triturou ${msgAction} (Usou: ${(pesoAcumulado - sobra).toFixed(2)}kg).\n\n`;
        msg += `💩 **Fabricou:** ${qtdSacos} Saco(s) de Adubo Orgânico!\n`;
        msg += msgSobra;
        msg += `Use *!fazenda adubar [nº_canteiro]* para aplicar na lavoura.`;
        
        return msg;
    }

    // APLICAR ADUBO NO CANTEIRO
    async adubar(userId, userTag, canteiroIdStr) {
        const cId = parseInt(canteiroIdStr);
        if (isNaN(cId)) return `${userTag} ⚠️ Informe o número do canteiro. Ex: *!fazenda adubar 1*`;

        const data = await this.getFazendaData(userId);
        const canteiro = data.canteiros.find(c => c.id === cId);

        if (!canteiro) return `${userTag} ❌ Canteiro não existe.`;
        if (!canteiro.seedId) return `${userTag} 🟫 Jogar adubo na terra vazia? Plante algo primeiro!`;
        if (canteiro.adubado) return `${userTag} 🛑 Esse canteiro já está super-adubado! Se colocar mais, a planta morre queimada.`;

        let msg = `${userTag} 💩 **TERRA FERTILIZADA!**\n`;

        if (data.upgrades.adubos > 0) {
            data.upgrades.adubos -= 1;
            msg += `Você usou **1 Saco de Adubo Orgânico** (Feito de peixe)!\n`;
        } 
        else {
            const gastou = await this.consumirSuprimento(userId, 1);
            if (!gastou) return `${userTag} 🪹 Você não tem Sacos de Adubo Orgânico e está sem Suprimentos (Energia) para fazer o adubo químico!`;
            msg += `Você gastou **1 Suprimento de Energia** para aplicar fertilizante sintético!\n`;
        }

        canteiro.adubado = true;
        await this.saveFazendaData(userId, data);

        msg += `🌱 A colheita final do Canteiro [ ${cId} ] renderá **+50% de peso**!`;
        return msg;
    }

    // PERFIL E CANTEIROS
    async verFazenda(userId, userTag, canteiroIdStr) {
        const data = await this.getFazendaData(userId);
        let pescariaPlayer = await this.pescariaHandler.getPlayerData(userId);
        const now = Math.floor(Date.now() / 1000);

        if (canteiroIdStr && !isNaN(parseInt(canteiroIdStr))) {
            const cId = parseInt(canteiroIdStr);
            const canteiro = data.canteiros.find(c => c.id === cId);
            
            if (!canteiro) {
                return `${userTag} ❌ Canteiro [ ${cId} ] não existe. Você possui apenas ${data.canteiros.length} canteiro(s)!`;
            }

            let msg = `${userTag}🟫 **DETALHES DO CANTEIRO [ ${cId} ]** 🟫\n\n`;

            if (!canteiro.seedId) {
                msg += `🌱 _A terra está arada, mas o canteiro está vazio!_\n\n`;
                msg += `🛒 Use *!fazenda loja* para ver o catálogo e *!fazenda plantar [semente]* para iniciar a lavoura.`;
                return msg;
            }

            const seed = SEEDS_CATALOG.find(s => s.id === canteiro.seedId);
            msg += `**Plantação:** ${seed.emoji} ${seed.name}\n`;
            msg += `🧬 **Saturação:** ${seed.saturation.toFixed(1)}x (XP)\n`;
            
            const tratorLevel = data.upgrades.trator || 1;
            const tratorMult = TOOLS_CATALOG['trator'].find(t => t.level === tratorLevel).multiplier;
            let baseKilos = this.BASE_YIELD_KG * seed.yieldMultiplier * tratorMult;
            if (canteiro.adubado) baseKilos *= 1.5;
            
            msg += `⚖️ **Estimativa de Safra:** ~${baseKilos.toFixed(2)}kg ${canteiro.adubado ? '(💩 Adubado!)' : ''}\n\n`;

            if (now >= canteiro.harvestTime) {
                msg += `✅ **STATUS:** PRONTA PARA COLHEITA!\n`;
                msg += `🌾 _Use !fazenda colher ${cId}_\n`;
            } else {
                const timeLeft = canteiro.harvestTime - now;
                const hours = Math.floor(timeLeft / 3600);
                const mins = Math.floor((timeLeft % 3600) / 60);
                msg += `⏳ **STATUS:** Crescendo... (Faltam ${hours}h e ${mins}m)\n`;
                msg += `💧 **Regas aplicadas:** ${canteiro.regas}x\n\n`;
                msg += `_Dica: !fazenda regar ${cId} para gastar energia e adiantar o crescimento!_\n`;
            }
            return msg;
        }

        let msg = `${userTag}🚜 **SUA BOSTOFAZENDA** 🚜\n_Suprimentos: 📦 ${pescariaPlayer.suprimentos}/${this.MAX_SUPPLY}_\n\n`;

        data.canteiros.forEach(c => {
            if (!c.seedId) {
                msg += `*[ ${c.id} ]* 🌱 _Vazio_\n`;
            } else {
                const seed = SEEDS_CATALOG.find(s => s.id === c.seedId);
                if (now >= c.harvestTime) {
                    msg += `*[ ${c.id} ]* ✅ Pronta: ${seed.emoji} ${seed.name}\n`;
                } else {
                    const timeLeft = c.harvestTime - now;
                    const hours = Math.floor(timeLeft / 3600);
                    const mins = Math.floor((timeLeft % 3600) / 60);
                    msg += `*[ ${c.id} ]* ⏳ Crescendo: ${seed.emoji} (Falta ${hours}h${mins}m)\n`;
                }
            }
        });

        msg += `\n🔍 _Use *!fazenda perfil [nº]* para ver os detalhes e a estimativa de peso da safra._`;
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
            msg += `🚜 _Ce já tem o maior trator!_\n`;
        }

        const limiteCanteiros = 5;
        if (data.canteiros.length < limiteCanteiros) {
            const nextTerrenoPrice = 1000 * Math.pow(data.canteiros.length, 2);
            msg += `🗺️ **Expansão de Terras** (Canteiro ${data.canteiros.length + 1})\n`;
            msg += `   Permite plantar mais uma semente simultaneamente.\n`;
            msg += `   💰 Custo: 🪙 ${nextTerrenoPrice} ➝ _*!fazenda comprar terreno*_\n`;
        } else {
            msg += `🗺️ _Fazenda em Tamanho Máximo (${limiteCanteiros} canteiros)!_\n`;
        }

        return msg;
    }

    async comprarUpgrade(userId, userTag, tipo) {
        if (tipo !== 'enxada' && tipo !== 'trator' && tipo !== 'terreno') {
            return `${userTag} ⚠️ O que você quer comprar? Use *!fazenda comprar enxada*, *trator* ou *terreno*.`;
        }

        const data = await this.getFazendaData(userId);
        const userDb = await this.db.get("SELECT bostocoins FROM usuarios WHERE id_usuario = ?", [userId]);
        const balance = userDb ? userDb.bostocoins : 0;

        // LÓGICA DE COMPRA DE TERRENO
        if (tipo === 'terreno') {
            const limiteCanteiros = 5; 
            
            if (data.canteiros.length >= limiteCanteiros) {
                return `${userTag} 🛑 Você já atingiu o limite máximo de ${limiteCanteiros} canteiros! O Ibama proibiu desmatar o resto da reserva.`;
            }

            const price = 1000 * Math.pow(data.canteiros.length, 2);

            if (balance < price) {
                return `${userTag} 💸 A imobiliária riu da sua cara! Um novo lote de terra custa 🪙 **${price} Bostocoins**.`;
            }

            await this.db.run("UPDATE usuarios SET bostocoins = bostocoins - ? WHERE id_usuario = ?", [price, userId]);

            const novoId = data.canteiros.length + 1;
            data.canteiros.push({ id: novoId, seedId: null, plantTime: 0, harvestTime: 0, regas: 0 });
            data.upgrades.maxCanteiros = novoId;

            await this.saveFazendaData(userId, data);

            return `${userTag} 🗺️ **EXPANSÃO AGRÍCOLA!**\n\nVocê subornou o Ibama, desmatou um pedaço da floresta e adquiriu o **Canteiro ${novoId}**!\nAgora você pode plantar mais sementes simultaneamente. Use *!fazenda perfil* para ver sua nova propriedade.`;
        }

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
        
        let baseKilos = this.BASE_YIELD_KG * seed.yieldMultiplier * tratorMult;
        if (canteiro.adubado) baseKilos *= 1.5;
        
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
        canteiro.adubado = false;

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