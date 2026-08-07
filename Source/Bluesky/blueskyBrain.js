const { postarNoBlueSky } = require('./blueskyHandler');
const crypto = require('crypto');
const schedule = require('node-schedule');

class BlueskyBrain {
    constructor(db, chatbot) {
        this.db = db;
        this.chatbot = chatbot;
    }

    async processarAnotacao(anotacoes, timestampOriginal) {
        const { contexto, humor, nota, temas } = anotacoes;
        const id = crypto.randomUUID();
        const temasStr = JSON.stringify(temas || []);

        if (nota <= 5) return;

        try {
            const query = `INSERT INTO pensamentos_bot (id, contexto, humor_origem, nota_tweet, status, timestamp_evento, temas) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            if (nota >= 6 && nota <= 7) {
                await this.db.run(query, [id, contexto, humor, nota, 'avaliado', timestampOriginal, temasStr]);
            }
            
            if (nota >= 8) {
                await this.db.run(query, [id, contexto, humor, nota, 'postado', timestampOriginal, temasStr]);
                this.surtoInstantaneo(contexto, humor, timestampOriginal, temas).catch(e => console.error(e));
            }
        } catch (error) {
            console.error("❌ Erro ao salvar pensamento:", error);
        }
    }

    formatarData(ts) {
        if (!ts) ts = Math.floor(Date.now() / 1000); 
        
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo'
        }).format(new Date(ts * 1000));
    }

    async surtoInstantaneo(id, contexto, humor, timestampEvento, temasAtuais) {
        const delay = Math.floor(Math.random() * 10000) + 10000;
        console.log(`⏳ [BLUESKY] Aguardando ${delay/1000}s para parecer natural...`);
        await new Promise(r => setTimeout(r, delay));

        console.log(`🔥 [BLUESKY] O Bostossauro pegou o celular pra reclamar no BlueSky!`);
        await this.gerarEPostar(id, contexto, humor, timestampEvento, temasAtuais);
    }

    async escolherEPostar() {
        const eleito = await this.db.get(`SELECT * FROM pensamentos_bot WHERE status = 'avaliado' ORDER BY nota_tweet DESC LIMIT 1`);
        
        if (!eleito) {
            console.log("🥱 [BLUESKY] Geladeira vazia. Sem post agora.");
            return; 
        }

        console.log(`🕒 [BLUESKY] Turno de postagem! Postando: ${eleito.id}`);
        const temasEleito = JSON.parse(eleito.temas || '[]'); 

        await this.gerarEPostar(eleito.id, eleito.contexto, eleito.humor_origem, eleito.timestamp_evento, temasEleito);
    }

    async gerarEPostar(id, contexto, humor, timestampEvento, temasAtuais = []) {
        const historico = await this.db.all(`SELECT temas, post_texto, timestamp FROM historico_bluesky ORDER BY timestamp DESC LIMIT 100`);
        let melhoresMatches = [];
        for (const post of historico) {
            try {
                const temasAntigos = JSON.parse(post.temas || '[]');
                const matches = temasAntigos.filter(tag => temasAtuais.includes(tag)).length;
                if (matches > 0) melhoresMatches.push({ ...post, matches });
            } catch (e) {}
        }

        melhoresMatches.sort((a, b) => b.matches - a.matches || b.timestamp - a.timestamp);
        let selecionados = melhoresMatches.filter(p => p.matches >= 2).slice(0, 2);
        if (selecionados.length === 0 && melhoresMatches.length > 0) selecionados = [melhoresMatches[0]];

        let contextoHistorico = "";
        if (selecionados.length > 0) {
            contextoHistorico = "\n[MEMÓRIA DE LONGO PRAZO] Você já fez posts sobre assuntos parecidos no BlueSky. Use isso para criar uma lore contínua:\n";
            selecionados.forEach(p => {
                contextoHistorico += `- Em ${this.formatarData(p.timestamp)}: "${p.post_texto}"\n`;
            });
        }

        const dataEvento = this.formatarData(timestampEvento);
        const dataAgora = this.formatarData(Math.floor(Date.now() / 1000));

        const promptPost = `Você é o Bostossauro, um bot dinossauro ranzinza. Escreva um post curto para o BlueSky.
        Seu estado de espírito: "${humor}".
        Não use aspas, nem hashtags. Fale em primeira pessoa coloquialmente.
        CONTEXTO TEMPORAL:
        - Ocorreu em: ${dataEvento}
        - Agora: ${dataAgora}
        ${contextoHistorico}
        Evento original: "${contexto}"`;

        let textoFinal = "";
        try {
            textoFinal = await this.chatbot.getAiResponse("sistema", "sistema", "sistema", false, "sys", promptPost, "gemini-3.1-flash-lite-preview");
        } catch(e) {
            console.error("❌ Erro ao gerar texto com IA. Devolvendo para geladeira...");
            await this.db.run(`UPDATE pensamentos_bot SET status = 'avaliado' WHERE id = ?`, [id]);
            return false;
        }

        let tentativas = 0;
        let sucesso = false;

        while (tentativas < 3 && !sucesso) {
            try {
                tentativas++;
                console.log(`📤 Postando no BlueSky (Tentativa ${tentativas}/3)...`);
                await postarNoBlueSky(textoFinal);
                sucesso = true;
                
                await this.db.run(`INSERT INTO historico_bluesky (id, temas, post_texto, timestamp) VALUES (?, ?, ?, ?)`, 
                    [crypto.randomUUID(), JSON.stringify(temasAtuais), textoFinal, Math.floor(Date.now()/1000)]
                );
                await this.db.run(`DELETE FROM pensamentos_bot WHERE id = ?`, [id]);
                
            } catch (error) {
                console.error(`⚠️ Falha na tentativa ${tentativas}.`);
                if (tentativas < 3) {
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        }

        if (!sucesso) {
            console.log(`❄️ Falha definitiva da API. Devolvendo pensamento ${id} para a geladeira.`);
            await this.db.run(`UPDATE pensamentos_bot SET status = 'avaliado' WHERE id = ?`, [id]);
            return false;
        }

        return true;
    }

    iniciarRotina() {
        if (schedule.scheduledJobs['post_manha']) schedule.scheduledJobs['post_manha'].cancel();
        if (schedule.scheduledJobs['post_tarde']) schedule.scheduledJobs['post_tarde'].cancel();
        if (schedule.scheduledJobs['post_noite']) schedule.scheduledJobs['post_noite'].cancel();

        console.log("⏰ [BLUESKY] Rotinas engatilhadas (Manhã, Tarde e Noite).");
        
        const rodarComDelay = async () => {
            const delayRandom = Math.floor(Math.random() * 45) * 60000;
            console.log(`⏰ [BLUESKY] Horário acionado. Disfarçando por ${delayRandom/60000} minutos...`);
            await new Promise(r => setTimeout(r, delayRandom));
            await this.escolherEPostar();
        };
        schedule.scheduleJob('post_manha', '0 12 * * *', rodarComDelay);
        schedule.scheduleJob('post_tarde', '0 18 * * *', rodarComDelay);
        schedule.scheduleJob('post_noite', '0 23 * * *', rodarComDelay);
    }
}

module.exports = BlueskyBrain;