const currencySymbols = {
    'BRL': 'R$', 'USD': 'US$', 'EUR': '€', 'GBP': '£',
    'JPY': '¥', 'ARS': '$', 'BTC': '₿'
};

const quoteCache = {};
const CACHE_DURATION_MINUTES = 10;


async function fetchFallback(fromCode, toCode, amount) {
    try {
        console.log(`[Currency] Tentando API Reserva para ${fromCode}-${toCode}...`);
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCode}`);
        
        if (!response.ok) throw new Error("Fallback API Error");
        
        const data = await response.json();
        const rate = data.rates[toCode];

        if (!rate) throw new Error("Rate not found in fallback");

        const result = amount * rate;

        const lastUpdate = new Date().toLocaleDateString('pt-BR'); 

        return {
            rate: rate,
            result: result,
            dateStr: lastUpdate
        };

    } catch (error) {
        console.error("Erro na API Reserva:", error);
        return null;
    }
}

async function convertCurrency(command) {
    const args = command.trim().split(/\s+/);
    
    if (args.length < 4) {
        throw new Error("MISSING_ARGS");
    }

    const fromName = args[1].toLowerCase();
    const toName = args[2].toLowerCase();
    let amountStr = args[3].replace(',', '.'); 
    const amount = parseFloat(amountStr);

    if (isNaN(amount)) {
        throw new Error("NOT_A_NUMBER");
    }

    const currencyMap = {
        'real': 'BRL', 'reais': 'BRL', 'brl': 'BRL',
        'dolar': 'USD', 'dólar': 'USD', 'dolares': 'USD', 'usd': 'USD',
        'euro': 'EUR', 'euros': 'EUR', 'eur': 'EUR',
        'libra': 'GBP', 'libras': 'GBP', 'gbp': 'GBP',
        'bitcoin': 'BTC', 'btc': 'BTC',
        'peso': 'ARS', 'pesos': 'ARS', 'ars': 'ARS',
        'iene': 'JPY', 'ien': 'JPY', 'jpy': 'JPY'
    };

    const fromCode = currencyMap[fromName];
    const toCode = currencyMap[toName];

    if (!fromCode || !toCode) throw new Error("NON-EXISTENT_CURRENCY");
    if (fromCode === toCode) throw new Error("SAME_CURRENCY");

    let rate = 0;
    let result = 0;
    let lastUpdate = "";
    let fromCache = false;

    const symbolFrom = currencySymbols[fromCode] || fromCode;
    const symbolTo = currencySymbols[toCode] || toCode;
    const formatNumber = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const pairKey = `${fromCode}-${toCode}`;

    try {
        const cachedData = quoteCache[pairKey];
        const now = Date.now();

        if (cachedData && (now - cachedData.time < CACHE_DURATION_MINUTES * 60 * 1000)) {
            rate = cachedData.rate;
            lastUpdate = cachedData.dateStr;
            result = amount * rate; 
            fromCache = true;
            console.log(`[CACHE] Usando cotação salva para ${pairKey}`);
        } else {
            const url = `https://economia.awesomeapi.com.br/last/${pairKey}`;
            const response = await fetch(url);
            
            if (response.status === 429) {
                throw new Error("[API] Bloqueio 429 detectado.");
            }

            if (!response.ok) throw new Error(`API_ERROR: ${response.status}`);

            const data = await response.json();
            const apiDataKey = fromCode + toCode; 
            
            if (!data[apiDataKey]) throw new Error("❌ Conversão não disponível no momento.");

            rate = parseFloat(data[apiDataKey].bid);
            lastUpdate = new Date(data[apiDataKey].create_date).toLocaleString('pt-BR');
            result = amount * rate;

            quoteCache[pairKey] = { rate: rate, time: now, dateStr: lastUpdate };
        }

    } catch (error) {
        console.warn(`[API Principal falhou] Motivo: ${error.message}. Tentando reserva...`);
        
        const fallbackData = await fetchFallback(fromCode, toCode, amount);
        
        if (fallbackData) {
            rate = fallbackData.rate;
            result = fallbackData.result;
            lastUpdate = fallbackData.dateStr;
            
            quoteCache[pairKey] = { rate: rate, time: Date.now(), dateStr: lastUpdate };
        } else {
            return "⏳ Todas as APIs de cotação estão ocupadas ou indisponíveis. Tente mais tarde.";
        }
    }

    return `💸 *Conversão Direta*\n` +
           `📉 Cotação: 1 ${fromCode} = ${rate.toFixed(4)} ${toCode}\n` +
           `💰 *${symbolFrom} ${formatNumber(amount)}* vale aproximadamente *${symbolTo} ${formatNumber(result)}*\n` +
           `_Atualizado em: ${lastUpdate}_`;
}

module.exports = { convertCurrency };