const { AtpAgent } = require('@atproto/api');
require('dotenv').config();

const agent = new AtpAgent({ service: 'https://bsky.social' });

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