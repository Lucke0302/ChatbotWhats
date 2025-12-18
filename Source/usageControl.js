const fs = require('fs');
const path = './usage_stats.json';

const usageControl = {
    getData() {
        if (!fs.existsSync(path)) return { date: new Date().toLocaleDateString(), counts: {} };
        const data = JSON.parse(fs.readFileSync(path));
        if (data.date !== new Date().toLocaleDateString()) {
            return { date: new Date().toLocaleDateString(), counts: {} };
        }
        return data;
    },

    increment(modelName) {
        const data = this.getData();
        data.counts[modelName] = (data.counts[modelName] || 0) + 1;
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    },

    hasQuota(modelName, limit) {
        const data = this.getData();
        return (data.counts[modelName] || 0) < limit;
    },

    hasAnyQuotaAvailable(modelLimits) {
        return Object.entries(modelLimits).some(([model, limit]) => this.hasQuota(model, limit));
    }
};

module.exports = usageControl;