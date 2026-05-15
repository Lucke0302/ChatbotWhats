const { NATURES, TYPE_CHART } = require('./constants');

class PokeMath {
    
    // ==========================================
    //  GERAÇÃO DE GENÉTICA
    // ==========================================

    static generateRandomIVs() {
        const rand = () => Math.floor(Math.random() * 32);
        return { hp: rand(), atk: rand(), def: rand(), spa: rand(), spd: rand(), spe: rand() };
    }

    static getNatureModifier(natureKey, statName) {
        if (statName === 'hp') return 1.0;
        
        const nature = NATURES[natureKey?.toLowerCase()] || NATURES['hardy'];
        if (nature.up === statName) return 1.1;
        if (nature.down === statName) return 0.9;
        
        return 1.0;
    }

    // ==========================================
    //  CÁLCULO DE STATUS REAIS
    // ==========================================

    static computeXp(level) {
        return Math.pow(level, 3);
    }

    static computeStat(base, iv, ev, level, natureKey, statName) {
        const ivVal = iv || 0;
        const evVal = ev || 0;
        const evBonus = Math.floor(evVal / 4);

        if (statName === 'hp') {
            if (base === 1) return 1;
            return Math.floor(((2 * base + ivVal + evBonus + 100) * level) / 100 + 10);
        } else {
            const rawStat = Math.floor(((2 * base + ivVal + evBonus) * level) / 100 + 5);
            const multiplier = this.getNatureModifier(natureKey, statName);
            return Math.floor(rawStat * multiplier);
        }
    }

    // ==========================================
    //  MATEMÁTICA DE BATALHA
    // ==========================================

    static applyStages(statValue, stage) {
        if (!stage || stage === 0) return statValue;
        
        const multiplier = stage > 0 
            ? (2 + stage) / 2 
            : 2 / (2 + Math.abs(stage));
            
        return Math.floor(statValue * multiplier);
    }

    static calculateBaseDamage(level, power, atkStat, defStat) {
        return Math.floor(((2 * level / 5 + 2) * power * (atkStat / defStat)) / 50 + 2);
    }

    static calculateCatchChance(baseXp, maxHp, currentHp, ballMultiplier, isFainted) {
        let estimatedCatchRate = Math.floor(5000 / (baseXp || 60)); 
        estimatedCatchRate = Math.max(15, Math.min(200, estimatedCatchRate));
        
        let hpFactor = ((3 * maxHp) - (2 * currentHp)) / (3 * maxHp);
        let statusFactor = isFainted ? 0.75 : 1.0; 
        
        let finalChance = (estimatedCatchRate / 255) * hpFactor * ballMultiplier * statusFactor;
        
        return finalChance + 0.05; 
    }

    static getTypeMultiplier(moveType, defType1, defType2) {
        if (!moveType || !TYPE_CHART[moveType.toLowerCase()]) return 1.0;
        
        let multiplier = 1.0;
        const chartData = TYPE_CHART[moveType.toLowerCase()];
        
        if (defType1) {
            const val = chartData[defType1.toLowerCase()];
            multiplier *= (val !== undefined ? val : 1.0);
        }
        if (defType2) {
            const val = chartData[defType2.toLowerCase()];
            multiplier *= (val !== undefined ? val : 1.0);
        }
        
        return multiplier;
    }

    static getStabMultiplier(moveType, atkType1, atkType2) {
        if (!moveType) return 1.0;
        const mt = moveType.toLowerCase();
        
        if ((atkType1 && mt === atkType1.toLowerCase()) || 
            (atkType2 && mt === atkType2.toLowerCase())) {
            return 1.5;
        }
        return 1.0;
    }

    static calculateFinalDamage(baseDamage, typeMultiplier, stabMultiplier, isCrit) {
        let finalDamage = baseDamage;
        
        finalDamage = Math.floor(finalDamage * typeMultiplier);
        
        if (finalDamage < 1 && typeMultiplier > 0) finalDamage = 1;

        finalDamage = Math.floor(finalDamage * stabMultiplier);

        if (isCrit) finalDamage *= 2; 

        const roll = (Math.random() * 0.15) + 0.85;
        finalDamage = Math.floor(finalDamage * roll);

        return finalDamage;
    }
}

module.exports = PokeMath;