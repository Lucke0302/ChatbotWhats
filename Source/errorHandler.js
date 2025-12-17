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
    "LIMITED_MODE_ACTIVE": "⏳ Comando !lembrar indisponível temporariamente",
    "ALL_QUOTAS_EXHAUSTED": "😵 Minhas baterias (e cotas do Google) acabaram por hoje! Volto amanhã cedinho."
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