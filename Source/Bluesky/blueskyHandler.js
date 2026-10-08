const { AtpAgent } = require('@atproto/api');
require('dotenv').config();

// 🛡️ [FASE 4 - TIMEOUT] Nenhuma chamada ao Bluesky sem teto de tempo: o
// AbortController cancela a requisição HTTP pendente em 15s, garantindo que
// login e postagem nunca fiquem presos (sem promises eternas no processo).
const TIMEOUT_API_MS = 15000;

function fetchComTimeout(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_API_MS);

    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
}

// O handler é injetado no agente para valer em TODAS as requisições XRPC.
const agent = new AtpAgent({ service: 'https://bsky.social', fetch: fetchComTimeout });

async function postarNoBlueSky(texto) {
    try {
        await agent.login({
            identifier: process.env.BLUESKY_HANDLE,
            password: process.env.BLUESKY_PASSWORD,
        });

        await agent.api.app.bsky.feed.post.create(
            { repo: agent.session.did },
            {
                text: texto,
                createdAt: new Date().toISOString(),
            }
        );

        console.log("🦋 [BLUESKY] Postado com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao postar no BlueSky:", error.message);
        throw error; 
    }
}

module.exports = { postarNoBlueSky };