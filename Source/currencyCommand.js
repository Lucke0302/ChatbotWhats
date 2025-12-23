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
        const pair = `${fromCode}-${toCode}`;
        const url = `https://economia.awesomeapi.com.br/last/${pair}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API_ERROR: ${response.status}`);
        }

        const data = await response.json();
        const key = fromCode + toCode; 
        
        if (!data[key]) {
            return "💵 Não consegui fazer essa conversão específica agora.";
        }

        const rate = parseFloat(data[key].bid);
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