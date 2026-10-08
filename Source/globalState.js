// 🛡️ [FASE 2 - SEGURANÇA/ESTABILIDADE] Estado vivo do runtime.
//
// PROBLEMA: `connectToWhatsApp()` roda novamente a cada queda do Baileys e cria
// um NOVO `sock` e um NOVO `chatbot`. Conectores externos (Twitch/Discord) que
// guardavam a instância da primeira conexão em closure continuavam escrevendo
// em um socket MORTO (zumbi) — vazando memória na VM de 1GB e travando o
// `sendTo()`/`handleCommand()`.
//
// SOLUÇÃO: este módulo é a única fonte de verdade. Quem precisa do WhatsApp
// ativo consome via getter (`getGlobalSock()`) em tempo de execução, nunca
// guardando a referência.
module.exports = { setGlobalSock, getGlobalSock, setGlobalChatbot, getGlobalChatbot };

let currentSock = null;
let currentChatbot = null;

function setGlobalSock(sock) {
    currentSock = sock || null;
}

function getGlobalSock() {
    return currentSock;
}

function setGlobalChatbot(chatbot) {
    currentChatbot = chatbot || null;
}

function getGlobalChatbot() {
    return currentChatbot;
}
