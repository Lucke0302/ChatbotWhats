const { postarNoBlueSky } = require('./blueskyHandler');
const crypto = require('crypto');
const schedule = require('node-schedule');

class BlueskyBrain {
    constructor(db, chatbot) {
        this.db = db;
        this.chatbot = chatbot;
        this.ultimoSurto = 0;
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
                const agora = Date.now();
                const TEMPO_COOLDOWN = .5 * 60 * 60 * 1000; 
                const emCooldown = (agora - this.ultimoSurto) < TEMPO_COOLDOWN;

                if (emCooldown) {
                    console.log(`❄️ [BLUESKY] Nota ${nota}, mas o surto está em cooldown. Mandando para a geladeira...`);
                    await this.db.run(query, [id, contexto, humor, nota, 'avaliado', timestampOriginal, temasStr]);
                } else {
                    this.ultimoSurto = agora; 
                    await this.db.run(query, [id, contexto, humor, nota, 'postado', timestampOriginal, temasStr]);
                    this.surtoInstantaneo(id, contexto, humor, timestampOriginal, temas).catch(e => console.error(e));
                }
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

        // =================================================================
        // 🔄 REDUNDÂNCIA 1: ROTAÇÃO DE MODELOS COM RETRY ATÉ CONSEGUIR O TEXTO
        // =================================================================
        const modelosDisponiveis = [
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite-preview",
        ];

        let textoFinal = "";
        let delayIa = 5000;
        let indexModelo = 0;

        while (!textoFinal) {
            const modeloAtual = modelosDisponiveis[indexModelo % modelosDisponiveis.length];
            try {
                console.log(`🤖 [BLUESKY IA] Tentando gerar com ${modeloAtual}...`);
                textoFinal = await this.chatbot.getAiResponse("sistema", "sistema", "sistema", false, "sys", promptPost, modeloAtual);
            } catch (e) {
                console.warn(`⚠️ [BLUESKY IA] Falha no modelo ${modeloAtual} (${e.message || e}). Próxima tentativa em ${delayIa / 1000}s...`);
                indexModelo++;
                await new Promise(r => setTimeout(r, delayIa));
                delayIa = Math.min(delayIa * 1.5, 60000); // Sobe o intervalo gradualmente até no máximo 60s
            }
        }

        // =================================================================
        // 🔄 REDUNDÂNCIA 2: INSISTÊNCIA NO ENVIO AO BLUESKY ATÉ DAR SUCESSO
        // =================================================================
        let postadoComSucesso = false;
        let delayEnvio = 5000;
        let tentativaPost = 0;

        while (!postadoComSucesso) {
            try {
                tentativaPost++;
                console.log(`📤 [BLUESKY] Enviando post (Tentativa ${tentativaPost})...`);
                await postarNoBlueSky(textoFinal);
                postadoComSucesso = true;
                
                await this.db.run(`INSERT INTO historico_bluesky (id, temas, post_texto, timestamp) VALUES (?, ?, ?, ?)`, 
                    [crypto.randomUUID(), JSON.stringify(temasAtuais), textoFinal, Math.floor(Date.now() / 1000)]
                );
                await this.db.run(`DELETE FROM pensamentos_bot WHERE id = ?`, [id]);
                console.log(`🎉 [BLUESKY] Pensamento ${id} publicado e salvo no histórico!`);
                
            } catch (error) {
                console.error(`⚠️ [BLUESKY] Erro ao postar (${error.message}). Nova tentativa em ${delayEnvio / 1000}s...`);
                await new Promise(r => setTimeout(r, delayEnvio));
                delayEnvio = Math.min(delayEnvio * 1.5, 60000);
            }
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