const PokeMath = require('./pokeMath');
const { STATUS_EFFECTS, STATUS_MOVES, STAT_DICT, TYPE_EMOJIS, HIGH_CRIT_MOVES } = require('./constants');

class BattleEngine {
    constructor(db) {
        this.db = db;
    }

    async processTurn(from, sender, action, param, sock, replyFunction) {
        
        // CARREGAR ESTADO
        const encounter = await this.db.getActiveEncounter(sender);
        if (!encounter) throw new Error("POKE_NO_BATTLE");

        const activeUserPoke = await this.db.getPokemonById(encounter.active_pokemon_id);
        
        const battleState = encounter.extra_data ? JSON.parse(encounter.extra_data) : this.getInitialBattleState();

        // DEFINIR A AÇÃO DO JOGADOR
        const playerAction = await this.resolvePlayerAction(action, param, activeUserPoke, encounter);
        
        // DEFINIR A AÇÃO DA IA INIMIGA
        const enemyAction = await this.resolveEnemyAction(encounter, activeUserPoke);

        // ORDENAR A FILA
        const turnQueue = this.sortActionQueue(
            { actor: 'user', action: playerAction, speed: this.getRealSpeed(activeUserPoke, battleState, 'user') },
            { actor: 'enemy', action: enemyAction, speed: this.getRealSpeed(encounter, battleState, 'enemy') }
        );

        // LOOP DE EXECUÇÃO
        let turnLog = "";
        for (const act of turnQueue) {
            if (activeUserPoke.current_hp <= 0 || encounter.current_hp <= 0) break;

            if (act.actor === 'user') {
                turnLog += await this.executeAction(act, activeUserPoke, encounter, battleState, sender);
            } else {
                turnLog += await this.executeAction(act, encounter, activeUserPoke, battleState, sender);
            }
        }

        turnLog += await this.processEndOfTurnEffects(activeUserPoke, encounter, battleState);

        if (encounter.current_hp <= 0) {
            return await this.handleVictory(sender, encounter, battleState, turnLog, replyFunction);
        }
        if (activeUserPoke.current_hp <= 0) {
            return await this.handleFaint(sender, activeUserPoke, turnLog, replyFunction);
        }

        await this.db.updateEncounterState(sender, activeUserPoke.id, encounter.current_hp, encounter.moves, battleState);
        await this.db.updatePokemonHP(activeUserPoke.id, activeUserPoke.current_hp);

        await replyFunction(this.formatTurnResponse(turnLog, activeUserPoke, encounter));
    }

    // ==========================================
    // MÉTODOS DE APOIO 
    // ==========================================

    sortActionQueue(userAction, enemyAction) {        
        const q = [userAction, enemyAction];
        q.sort((a, b) => {
            if (a.action.priority !== b.action.priority) {
                return b.action.priority - a.action.priority;
            }
            if (a.speed !== b.speed) {
                return b.speed - a.speed;
            }
            return Math.random() > 0.5 ? 1 : -1;
        });
        return q;
    }

    async resolvePlayerAction(actionType, param, userPoke, encounter) {
        if (actionType === 'fugir') return { type: 'FLEE', priority: 6 };
        if (actionType === 'capturar') return { type: 'CATCH', ball: param, priority: 6 };
        if (actionType === 'trocar') return { type: 'SWITCH', slot: param, priority: 6 };
        if (actionType === 'usar') return { type: 'ITEM', itemId: param, priority: 6 };
        
        const move = await this.db.getMoveById(param);
        return { type: 'ATTACK', move: move, priority: move.priority || 0 }; 
    }

    async executeAction(actData, attacker, defender, battleState, userId) {
        let log = "";
        const isPlayer = actData.actor === 'user';
        const actorKey = isPlayer ? 'user' : 'enemy';
        const targetKey = isPlayer ? 'enemy' : 'user';

        if (actData.action.type === 'FLEE') {
            return `\n🏃💨 *${attacker.nickname || attacker.name}* fugiu da batalha com sucesso!`;
        }
        if (actData.action.type === 'CATCH') {
            return `\n🔴 Você lançou uma Pokébola... (A lógica de captura vai interceptar isso no processTurn!)`;
        }
        if (actData.action.type !== 'ATTACK') return "";

        const move = actData.action.move;
        const attackerName = attacker.nickname || attacker.name;
        const defenderName = defender.nickname || defender.name;

        const statusCheck = this.checkStatusBeforeMove(battleState, actorKey, attackerName);
        if (statusCheck.log) log += `\n${statusCheck.log}`;
        
        if (statusCheck.selfDamage) {
            const dmg = Math.floor(attacker.max_hp * 0.15);
            attacker.current_hp = Math.max(0, attacker.current_hp - dmg);
            await this.updateActorHp(attacker, isPlayer, userId, encounter);
            log += ` (Perdeu ${dmg} HP na confusão)`;
        }

        if (!statusCheck.canMove) return log;

        const alwaysHitMoves = ['swift', 'aerial-ace', 'faint-attack', 'magical-leaf', 'shock-wave'];
        let moveAcc = move.accuracy === null ? 100 : move.accuracy;

        if (!alwaysHitMoves.includes(move.name) && moveAcc < 999) {
            const accStage = battleState.stages[actorKey].acc || 0;
            const evaStage = battleState.stages[targetKey].eva || 0;
            const combinedStage = Math.max(-6, Math.min(6, accStage - evaStage));

            const stageMultipliers = {
                '-6': 0.33, '-5': 0.38, '-4': 0.43, '-3': 0.50, '-2': 0.60, '-1': 0.75,
                '0': 1.0, '1': 1.33, '2': 1.67, '3': 2.0, '4': 2.33, '5': 2.67, '6': 3.0
            };

            const hitChance = moveAcc * (stageMultipliers[String(combinedStage)] || 1.0);
            
            if (Math.random() * 100 > hitChance) {
                return log + `\n💨 *${attackerName}* usou ${move.name}, mas errou!`;
            }
        }

        const typeEmoji = TYPE_EMOJIS[move.type] || '';
        const classIcon = move.damage_class === 'physical' ? "💥" : (move.damage_class === 'special' ? "🔮" : "✨");
        log += `\n${isPlayer ? '🗡️' : '💢'} *${attackerName}* usou *${move.name}* ${typeEmoji} ${classIcon}!`;

        if (move.damage_class === 'status') {
            const statusRes = this.processStatusMove(move.name, battleState, actorKey, targetKey);
            log += `\n${statusRes.msg}`;
            return log;
        }

        const atkStatType = move.damage_class === 'special' ? 'spa' : 'atk';
        const defStatType = move.damage_class === 'special' ? 'spd' : 'def';

        if (move.damage_class === 'status') {
            const statusRes = await this.processStatusMove(move, battleState, attacker, defender, isPlayer, userId);
            log += `\n${statusRes.msg}`;
            
            if (statusRes.selfDamage > 0) {
                attacker.current_hp = Math.max(0, attacker.current_hp - statusRes.selfDamage);
                await this.updateActorHp(attacker, isPlayer, userId);
                log += ` (Perdeu ${statusRes.selfDamage} HP)`;
            }
            
            if (statusRes.healAmount > 0) {
                attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + statusRes.healAmount);
                await this.updateActorHp(attacker, isPlayer, userId);
            }

            return log;
        }

        const rawAtk = this.getRealStat(attacker, atkStatType, isPlayer);
        const rawDef = this.getRealStat(defender, defStatType, !isPlayer);

        const finalAtk = PokeMath.applyStages(rawAtk, battleState.stages[actorKey][atkStatType]);
        const finalDef = PokeMath.applyStages(rawDef, battleState.stages[targetKey][defStatType]);

        const baseDmg = PokeMath.calculateBaseDamage(attacker.level, move.power, finalAtk, finalDef);
        const typeMult = PokeMath.getTypeMultiplier(move.type, defender.type1, defender.type2);
        const stabMult = PokeMath.getStabMultiplier(move.type, attacker.type1, attacker.type2);

        let critRate = 0.0625;
        if (HIGH_CRIT_MOVES.includes(move.name)) critRate = 0.125;
        const isCrit = Math.random() < critRate;

        const finalDamage = PokeMath.calculateFinalDamage(baseDmg, typeMult, stabMult, isCrit);

        if (typeMult === 0) {
            log += `\n❌ Não afetou o inimigo...`;
            return log;
        }

        defender.current_hp = Math.max(0, defender.current_hp - finalDamage);
        
        await this.updateActorHp(defender, !isPlayer, userId);

        if (isCrit) log += `\n⚠️ *GOLPE CRÍTICO!*`;
        log += `\n💥 Causou **${finalDamage}** de dano.`;
        if (typeMult > 1) log += ` (Super Efetivo!)`;
        if (typeMult < 1) log += ` (Não muito efetivo...)`;

        const specialEffects = this.processSpecialMoveEffects(move, attacker, defender, finalDamage, battleState, isPlayer);
        log += specialEffects.log;

        if (specialEffects.selfDamage > 0) {
            attacker.current_hp = Math.max(0, attacker.current_hp - specialEffects.selfDamage);
            await this.updateActorHp(attacker, isPlayer, userId);
            log += ` (Sofreu ${specialEffects.selfDamage} de dano de recuo)`;
        }

        if (specialEffects.healAmount > 0) {
            attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + specialEffects.healAmount);
            await this.updateActorHp(attacker, isPlayer, userId);
        }

        return log;
    }

    async updateActorHp(pokeObj, isPlayer, userId) {
        if (isPlayer) {
            await this.db.updatePokemonHP(pokeObj.id, pokeObj.current_hp);
        } else {
            const encounterRaw = await this.db.getActiveEncounter(userId);
            await this.db.updateEncounterState(userId, encounterRaw.active_pokemon_id, pokeObj.current_hp, JSON.parse(encounterRaw.moves), JSON.parse(encounterRaw.extra_data));
        }
    }

    getRealStat(poke, statName, isPlayer) {
        if (isPlayer) {
            return PokeMath.computeStat(
                poke[`base_${statName}`], 
                poke[`iv_${statName}`], 
                poke[`ev_${statName}`] || 0,
                poke.level, 
                poke.nature, 
                statName
            );
        }
        return Math.floor(((2 * poke[`base_${statName}`] + 15) * poke.level) / 100 + 5);
    }

    checkStatusBeforeMove(battleState, actorKey, pokeName) {
        const status = battleState[`${actorKey}Status`];
        const counters = battleState.counters[actorKey];
        let canMove = true;
        let selfDamage = false;
        let log = "";

        if (status === 'slp') {
            if (counters.sleep > 0) {
                counters.sleep--;
                return { canMove: false, log: `😴 *${pokeName}* está dormindo profundamente!` };
            } else {
                battleState[`${actorKey}Status`] = null;
                log += `⏰ *${pokeName}* acordou!\n`;
            }
        }

        if (status === 'frz') {
            if (Math.random() < 0.2) {
                battleState[`${actorKey}Status`] = null;
                log += `🔥 *${pokeName}* descongelou!\n`;
            } else {
                return { canMove: false, log: `🧊 *${pokeName}* está congelado solidamente!` };
            }
        }

        if (status === 'par') {
            if (Math.random() < 0.25) {
                return { canMove: false, log: `⚡ *${pokeName}* está paralisado e não consegue se mover!` };
            }
        }

        if (counters.confusion > 0) {
            counters.confusion--;
            log += `🌀 *${pokeName}* está confuso...\n`;
            if (Math.random() < 0.33) {
                return { canMove: false, log: log + `😵 Bateu em si mesmo na confusão!`, selfDamage: true };
            }
            if (counters.confusion === 0) log += `✨ *${pokeName}* saiu da confusão!\n`;
        }

        return { canMove: true, log: log, selfDamage: false };
    }

    getInitialBattleState() {
        return {
            stages: { user: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, enemy: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 } },
            weather: null,
            field: { user: [], enemy: [] }
        };
    }

    async processStatusMove(move, battleState, attacker, defender, isPlayer, userId) {
        const moveName = move.name.toLowerCase();
        const effect = STATUS_MOVES[moveName];
        
        const actorKey = isPlayer ? 'user' : 'enemy';
        const targetKey = isPlayer ? 'enemy' : 'user';

        let result = { msg: `usou ${move.name}.`, healAmount: 0, selfDamage: 0 };

        // === MALDIÇÃO (CURSE) ===
        if (moveName === 'curse') {
            const isGhost = (attacker.type1 === 'ghost' || attacker.type2 === 'ghost');
            if (isGhost) {
                result.selfDamage = Math.floor(attacker.max_hp / 2);
                if (!battleState.counters[targetKey].cursed) {
                    battleState.counters[targetKey].cursed = true;
                    result.msg += ` Cortou o próprio HP para lançar uma Maldição!`;
                } else {
                    result.msg += ` Sacrificou HP, mas o alvo já estava amaldiçoado!`;
                }
            } else {
                battleState.stages[actorKey].spe = Math.max(-6, (battleState.stages[actorKey].spe || 0) - 1);
                battleState.stages[actorKey].atk = Math.min(6, (battleState.stages[actorKey].atk || 0) + 1);
                battleState.stages[actorKey].def = Math.min(6, (battleState.stages[actorKey].def || 0) + 1);
                result.msg = ` Ficou mais lento, mas aumentou o ATAQUE e a DEFESA!`;
            }
            return result;
        }

        if (!effect) return result;

        const affectKey = effect.target === 'self' ? actorKey : targetKey;
        const targetObj = effect.target === 'self' ? attacker : defender;

        if (effect.stat) {
            const statsToMod = effect.stat.split('&');
            let changedAny = false;

            for (const statName of statsToMod) {
                const currentStage = battleState.stages[affectKey][statName] || 0;
                const newStage = Math.max(-6, Math.min(6, currentStage + effect.stage));
                if (newStage !== currentStage) {
                    battleState.stages[affectKey][statName] = newStage;
                    changedAny = true;
                }
            }

            if (!changedAny) {
                result.msg = `usou ${move.name}, mas os status não podem mudar mais!`;
            } else {
                result.msg = `usou ${move.name} e ${effect.msg}`;
            }
        }

        if (effect.status) {
            const currentStatus = battleState[`${affectKey}Status`];
            if (currentStatus) {
                result.msg = `tentou usar ${move.name}, mas falhou (alvo já tem um status)!`;
            } else {
                let immune = false;
                if (effect.status === 'brn' && (targetObj.type1 === 'fire' || targetObj.type2 === 'fire')) immune = true;
                if (effect.status === 'psn' && (targetObj.type1 === 'poison' || targetObj.type2 === 'poison' || targetObj.type1 === 'steel' || targetObj.type2 === 'steel')) immune = true;
                if (effect.status === 'par' && (targetObj.type1 === 'electric' || targetObj.type2 === 'electric')) immune = true;
                if (effect.status === 'frz' && (targetObj.type1 === 'ice' || targetObj.type2 === 'ice')) immune = true;

                if (immune) {
                    result.msg = `tentou usar ${move.name}, mas não afetou o alvo!`;
                } else {
                    battleState[`${affectKey}Status`] = effect.status;
                    
                    if (affectKey === 'user') {
                        await this.db.updatePokemonStatus(targetObj.id, effect.status);
                    }

                    if (effect.status === 'slp') battleState.counters[affectKey].sleep = Math.floor(Math.random() * 3) + 1;
                    if (effect.status === 'tox') battleState.counters[affectKey].toxic = 0;
                    
                    result.msg = `usou ${move.name} e ${effect.msg}`;
                }
            }
        }

        if (moveName === 'confuse-ray' || moveName === 'supersonic') {
            if (battleState.counters[affectKey].confusion > 0) {
                result.msg = `usou ${move.name}, mas o alvo já está confuso!`;
            } else {
                battleState.counters[affectKey].confusion = Math.floor(Math.random() * 4) + 1;
                result.msg = `usou ${move.name} e ${effect.msg}`;
            }
        }

        if (effect.heal) {
            result.healAmount = Math.floor(attacker.max_hp * effect.heal);
            if (effect.status) {
                battleState[`${actorKey}Status`] = effect.status; // Para o "Rest" que faz dormir
                if (actorKey === 'user') await this.db.updatePokemonStatus(attacker.id, effect.status);
            }
            result.msg = `usou ${move.name} e ${effect.msg}`;
        }

        if (!effect.stat && !effect.status && !effect.heal && effect.msg) {
            result.msg = `usou ${move.name} e ${effect.msg}`;
        }

        return result;
    }
}

module.exports = BattleEngine;