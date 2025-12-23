/**
 * Realiza a conversão de moedas usando AwesomeAPI
 * @param {string} command
 * @returns {string}
 */

const currencySymbols = {
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'ARS': '$',
    'BTC': '₿'
};

const quoteCache = {};
const CACHE_DURATION_MINUTES = 10;

async function convertCurrency(command) {
    const args = command.trim().split(/\s+/);
    
    if (args.length < 4) {
        throw new Error("MISSING_ARGS")
    }

    const fromName = args[1].toLowerCase();
    const toName = args[2].toLowerCase();
    let amountStr = args[3].replace(',', '.'); 
    const amount = parseFloat(amountStr);

    if (isNaN(amount)) {
        throw new Error("NOT_A_NUMBER");
    }

    // Mapa de apelidos
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



    if (!fromCode || !toCode) {
        throw new Error("NON-EXISTENT_CURRENCY")
    }

    if (fromCode === toCode) {
        throw new Error("SAME_CURRENCY")
    }

    try {
        const pairKey = `${fromCode}-${toCode}`;

        let rate, lastUpdate;
        let fromCache = false;

        const cachedData = quoteCache[pairKey];
        const now = Date.now();

        const key = fromCode + toCode; 
        
        if (!data[key]) {
            return "💵 Não consegui fazer essa conversão específica agora.";
        }

        if (cachedData && (now - cachedData.time < CACHE_DURATION_MINUTES * 60 * 1000)) {
            rate = cachedData.rate;
            lastUpdate = cachedData.dateStr;
            fromCache = true;
            console.log(`[CACHE] Usando cotação salva para ${pairKey}`);
        }

        else {
            const url = `https://economia.awesomeapi.com.br/last/${pairKey}`;
            const response = await fetch(url);

            if (response.status === 429) {
                console.warn("[API] Bloqueio 429 detectado.");
                return "⏳ O servidor de cotação pediu um tempo (muitas requisições). Tente daqui a alguns minutos.";
            } else if (!response.ok) {
                throw new Error(`API_ERROR: ${response.status}`);
            }

            if (!response.ok) throw new Error(`API_ERROR: ${response.status}`);

            const data = await response.json();
            const apiDataKey = fromCode + toCode; 
            
            if (!data[apiDataKey]) return "❌ Conversão não disponível no momento.";

            rate = parseFloat(data[apiDataKey].bid);
            lastUpdate = new Date(data[apiDataKey].create_date).toLocaleString('pt-BR');
            
            quoteCache[pairKey] = { rate: rate, time: now, dateStr: lastUpdate };
        }
        const result = amount * rate;
        const date = new Date(data[key].create_date).toLocaleString('pt-BR');

        const symbolFrom = currencySymbols[fromCode] || fromCode;
        const symbolTo = currencySymbols[toCode] || toCode;

        const formatNumber = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const amountFormatted = `${symbolFrom} ${formatNumber(amount)}`;
        const resultFormatted = `${symbolTo} ${formatNumber(result)}`;

        return `💸 *Conversão Direta*\n` +
               `📉 Cotação: ${fromCode} = ${rate.toFixed(4)} ${toCode}\n` +
               `💰 *${amountFormatted}* vale aproximadamente *${resultFormatted}*\n` +
               `_Atualizado em: ${date}_`;

    } catch (error) {
        console.error("[CurrencyHandler] Erro:", error);
        return "⛓️‍💥 Erro na API. A bolsa deve ter quebrado.";
    }
}

module.exports = { convertCurrency };