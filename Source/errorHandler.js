const ERROR_DICTIONARY = {
    "FEW_MESSAGES": "❌ Pô, tem nem mensagem direito pra eu ler... Conversem mais um pouco aí depois me chama.",
    "LEMBRAR_ERROR": "❌ Erro tentando lembrar, to com alzheimer.",
    "INVALID_SELECT": "❌ A IA pirou e não me deu a query SQL. Tenta ser mais específico na pergunta.",
    "AI_ERROR": "😵 A IA pifou ou tá dormindo. Tenta de novo já já.",
    "NO_AI_SQL_RESULT": "🔍 Não encontrei nenhuma mensagem para o período que você pediu, ou a IA deu um select doido.",
    "SQL_ERROR" : "Não sei lê",
    "INVALID_COMMAND": "⚠️ Esse comando não existe não.",
    "MISSING_ARGS": "⚠️ Opa, tá faltando coisa nesse comando. Escreve direito aí.",
    "AI_TIMEOUT": "⏳ A IA demorou demais pra pensar e eu desisti. Tenta algo mais simples.",
    "AI_OVERLOAD": "🔥 A IA tá fritando de tanta gente usando! Tenta de novo daqui 1 minutinho que ela esfria.",
    "LEMBRAR_UNAVAILABLE": "⏳ Comando !lembrar indisponível temporariamente",
    "ALL_QUOTAS_EXHAUSTED": "😵 Minhas baterias (e cotas do Google) acabaram por hoje! Volto amanhã cedinho.",
    "LOL_VERSION_ERROR": "❌ Erro ao buscar versão do jogo.",
    "CHAMPIONS_ERROR": "❌ Erro buscando os campeões.",
    "LOL_JSON_DATA_ERROR": "❌ Erro convertendo o json dos campeões.",
    "NICKNAME_OR_TAGLINE_WRONG": " 🎮❌ Player não existe",
    "LOL_ARGS_ERROR": "❌ Formato inválido. Use: *!lol Nickname #Tag* (Ex: !lol Faker #T1)",
    "KEY_UNAVAILABLE": "🔑 Erro na chave da API (fala com o dev)",
    "USER_QUOTA_EXCEEDED": "❌ Usou IA demais hoje, vai plantar uma árvore.",
    "USER_SELECT_ERROR": "❌ Erro na hora de buscar o usuário.",
    "NON-EXISTENT_CITY": "🗺️ Essa cidade aí não existe não.",
    "WEATHER_API_ERROR": "⛈️ Ocorreu um erro ao consultar a previsão. Acho que choveu no servidor.",
    "USER_TRANSLATE_EXCEEDED": "❌ Traduziu demais hoje",
    "NOT_A_NUMBER": "🔢 O parâmetro precisa ser um número",
    "NON-EXISTENT_CURRENCY": "💵 A moeda digitada não está disponível para cotação.",
    "SAME_CURRENCY": "🤡 Trocar seis por meia dúzia dá no mesmo, né, gênio.",
    "NO_USER_TO_TIMEOUT": "❌ Usuário inválido",
    "SEND_MESSAGE_ERROR": "❌ Deu algum ruim na hora de enviar a figurinha ou a mensagem. O WhatsApp me sabotou.",
    "EMPTY_DAYCARE": "🏡 **DAY CARE POKÉMON** 🏡\nO Day Care está vazio.\nUse: *!poke daycare [slot]* para deixar alguém treinando.\n\n💰 *Custo:* 200 coins por nível subido.",
    "DAYCARE_DB_ERROR": "❌ Deu algum erro maluco na hora de abrir o Daycare. O Sr. Pokémon deve ter tropeçado nos cabos do servidor."
};

// Mensagem padrão para erros não mapeados (bugs reais)
const DEFAULT_ERROR_MESSAGE = "😵 Ocorreu um erro interno bizarro. O dev deve ter feito gambiarra.";

/**
 * Função Middleware para tratar erros centralizados
 * @param {Error} error
 * @param {Function} replyFunction
 * @param {Object} context
 */
const handleBotError = async (error, replyFunction, context = {}) => {

    console.error(`[ERROR HANDLER] Erro em '${context.command || 'Desconhecido'}':`);
    console.error(`   Sender: ${context.sender}`);
    console.error(`   From: ${context.from}`);
    console.error(`   Detalhes:`, error);

    let errorKey = typeof error === 'string' ? error : error.message;

    // Timeout
    if (errorKey.startsWith("USER_BANNED|")) {
        const minutos = errorKey.split('|')[1];
        if (replyFunction) {
            await replyFunction(`🚫 *Tá de castigo!* \nFica pianinho aí e espera mais *${minutos} minutos* antes de usar o bot de novo.`);
        }
        return;
    }

    // Anti-Spam (SPAM_DETECTED|8)
    if (errorKey.startsWith("SPAM_DETECTED|")) {
        const segundos = errorKey.split('|')[1];
        if (replyFunction) {
            await replyFunction(`✋ *Calma, Flash!* \nEspera *${segundos} segundos* pra mandar outro comando.`);
        }
        return;
    }

    // DETECÇÃO INTELIGENTE DE ERROS DA API
    if (errorKey.includes("overloaded") || errorKey.includes("503")) {
        errorKey = "AI_OVERLOAD";
    }

    const userMessage = ERROR_DICTIONARY[errorKey] || DEFAULT_ERROR_MESSAGE;

    try {
        if (replyFunction) {
            await replyFunction(userMessage);
        }
    } catch (sendError) {
        console.error("❌ CRÍTICO: Erro ao tentar enviar a mensagem de erro para o usuário.", sendError);
    }
};

module.exports = { handleBotError };