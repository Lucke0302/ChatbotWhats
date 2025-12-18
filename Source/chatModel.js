const usage = require('./usageControl');
const RIOT_API_KEY = process.env.RIOT_API_KEY;

class ChatModel {
    constructor(db, genAI) {
        this.db = db;
        this.genAI = genAI;
        this.isOnline = true;
        this.isTesting = true;
        this.modelLimits = {
            "gemini-2.5-flash": 20,
            "gemini-2.5-flash-lite": 20,
            "gemini-3.0-flash": 20,
            "gemma-3-27b": 5000,
            "gemma-3-12b": 5000,
            "gemma-3-4b": 9999
        };
        this.updateOnlineStatus();
        this.lolChampionsMap = null;
        this.lolVersion = '14.23.1';
        setInterval(() => {
            console.log("⏰ Atualizando versão e campeões do LoL (Rotina Diária)...");
            this.initLoLData();
        }, 1000 * 60 * 60 * 24);
    }

    //Atualiza os dados do LOL
    async initLoLData() {
        try {
            const versionResp = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
            const versions = await versionResp.json();
            this.lolVersion = versions[0];
            
            console.log(`🎮 LoL DataDragon atualizado para versão: ${this.lolVersion}`);

            //Busca o mapa de campeões
            const champsResp = await fetch(`https://ddragon.leagueoflegends.com/cdn/${this.lolVersion}/data/pt_BR/champion.json`);
            const champsJson = await champsResp.json();
            
            //Transforma em um objeto
            this.lolChampionsMap = {};
            for (const key in champsJson.data) {
                const champ = champsJson.data[key];
                this.lolChampionsMap[champ.key] = champ.name;
            }
            
        } catch (error) {
            console.error("❌ Erro ao inicializar dados do LoL:", error.message);
        }
    }

    getChampName(id) {
        console.log(this.lolChampionsMap)
        return this.lolChampionsMap ? (this.lolChampionsMap[id] || `ID: ${id}`) : `ID: ${id}`;
    }

    updateOnlineStatus() {
        this.isOnline = usage.hasAnyQuotaAvailable(this.modelLimits);
    }

    //Função de monitoramento de recursos
    async getStatus() {
        const stats = usage.getData(); // Pega os dados do usageControl.js
        const date = stats.date;
        const counts = stats.counts;

        let report = `📊 *STATUS DO BOSTOSSAURO* - ${date}\n\n`;
        report += `🌐 *Status:* ${this.isOnline ? '✅ ONLINE' : '❌ OFFLINE'}\n\n`;
        
        report += `🛡️ *Uso de Modelos:* (Usado / Limite)\n`;

        for (const [model, limit] of Object.entries(this.modelLimits)) {
            const used = counts[model] || 0;
            const remaining = limit - used;
            const icon = used >= limit ? '🔴' : (used > limit * 0.8 ? '🟡' : '🟢');
            
            report += `${icon} *${model}:* ${used}/${limit}\n`;
        }

        report += `\n⚠️ _Modelos com 🔴 serão ignorados no fallback._`;
        
        return report;
    }

    //Escolhe qual figurinha deve ser enviada (ou nenhuma)
    async getSticker(command) {
        let stickerPath = "Assets/";
        const cmd = command.split(' ')[0];

        const commandActions = {
            '!gpt': async () => {
                if(await this.verifyCapitalLetters(command)){return "naogrita"+await this.rollDice(4)+".webp";}
                else return "eusabo"+await this.rollDice(2)+".webp"
            },
            '!resumo': async () =>{
                return "resumo"+await this.rollDice(2)+".webp"
            }
        };

        if (!this.isOnline) {
            stickerPath += "desonline.webp"
        }

        else if (commandActions[cmd]) {
            stickerPath += await commandActions[cmd]();
        }
        
        else return null

        return stickerPath;
    }      

    //Essa função verifica a quantidade de letras maiúsculas na mensagem pra responder
    //com a figurinha do "não grita"
    async verifyCapitalLetters(command){
        let sendedText = command;
        if (command.startsWith("!")) {
            const args = command.split(" ");
            if (args.length > 1) {
                args.shift();
                sendedText = args.join(" ");
            } else {
                sendedText = "";
            }
        }
        
        if (!sendedText) return false;
        
        const onlyLetters = sendedText.replace(/[^a-zA-ZÀ-ÿ]/g, '');
        if (onlyLetters.length === 0) return false;
        const capitalTotal = onlyLetters.replace(/[^A-ZÀ-ÖØ-Þ]/g, '').length;
        console.log(`capitalTotal: ${capitalTotal}. onlyLetters: ${onlyLetters}. Texto: ${sendedText}`);

        return capitalTotal > (onlyLetters.length / 4);
    }

    //Verifica qual é a primeira palavra usando regex
    async verifyCommand(command){
        return command.trim().split(/\s+/)[0];
    }

    //Retorna a contagem total de mensagens de uma conversa
    async getMessageCount(sender){
        const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE id_conversa = '${sender}'`;
        const result = await this.db.get(sqlQuery); 
        return result ? result.total : 0;
    };

    //Retorna mensagens do banco de dados para um certo remetente (pessoa ou grupo) com um limite
    async getMessagesByLimit(sender, limit){
        
        const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE id_conversa = '${sender}' 
        AND conteudo NOT LIKE '*Resumo da conversa*%'
        ORDER BY timestamp DESC 
        LIMIT ${limit}`;
        
        const messagesDb = await this.db.all(sqlQuery);
        if (!messagesDb || messagesDb.length === 0) {
            throw new Error("SQL_ERROR");
        }

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
    };

    //Função para o comando !resumo, retorna a resposta de um select feito pelo Gemini
    async getMessagesByAiResponse(response){
        const sqlQuery = response
        
        const messagesDb = await this.db.all(sqlQuery);
        if (!messagesDb || messagesDb.length === 0) {
            throw new Error("NO_AI_SQL_RESULT");
        }

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');        
    }

    // Define qual modelo usar baseado no comando, força e cota
    selectBestModel(command, forceModel) {
        let candidates = [];

        if (forceModel) {
            candidates.push(forceModel);
            if (forceModel === "gemini-3-flash") candidates.push("gemini-2.5-flash");
        } 
        else if (command.startsWith("!resumo")){            
            candidates = ["gemini-2.5-flash-lite", "gemini-3-flash", "gemini-2.5-flash", "gemma-3-27b","gemma-3-12b"]; 
        }
        else if (command.startsWith("!gpt")){            
            candidates = ["gemini-2.5-flash-lite", "gemini-3-flash", "gemini-2.5-flash", "gemma-3-4b"]; 
        }
        else if (command.startsWith("!lembrar")) {
            candidates = ["gemini-3-flash", "gemma-3-27b", "gemini-2.5-flash"]; 
        } 
        else {
            candidates = [
                "gemini-2.5-flash-lite",                
                "gemini-3-flash",
                "gemini-2.5-flash",
                "gemma-3-4b"
            ];
        }

        for (const model of candidates) {
            const limit = this.modelLimits[model] || 20;            
            if (usage.hasQuota(model, limit)) {
                return model;
            }            
            console.log(`[QUOTA] Sem cota para ${model}, tentando próximo...`);
        }

        if (command.startsWith("!lembrar")) {
            throw new Error("LEMBRAR_UNAVAILABLE");
        }        

        throw new Error("ALL_QUOTAS_EXHAUSTED");
    }

    //Modifica o prompt pra cada comando
    async formulatePrompt(from, sender, isGroup, command, complement = "Vazio") {
        let prompt = "";
        let limit = 200;
        
        const args = command.split(" ");
        const action = args[0].toLowerCase();
        const subAction = args[1] ? args[1].toLowerCase() : null;
        const num = parseInt(args[2]);

        if (action === "!resumo" && !isNaN(num) && num > 0 && num <= 200) {
            limit = num;
        }

        const msgCount = await this.getMessageCount(sender);
        if (msgCount < 5) {
            throw new Error("FEW_MESSAGES");
        }
        
        let formatedMessages

        prompt = `Você é um bot de WhatsApp engraçado e sarcástico, chamado Bostossauro.
        O usuário "${sender}" te mandou: "${command}".
        Não inicie a mensagem com "Bostossauro: " apenas escreva como se estivesse conversando normalmente com alguém.
        Use emojis (pelo menos um dinossauro 🦖), mas nunca use o emoji de cocô.
        Responda diretamente pelo nome. Seja criativo e mantenha o tom de uma conversa do whatsapp.
        A mensagem não deve conter o "${sender}".`;

        if (complement !== "Vazio" && action !== "!lembrar") {
            prompt += `\nO usuário respondeu a esta mensagem: "${complement}". Não repita ela.`;
        }

        if (isGroup) {
            prompt += `\nVocê está em um grupo de amigos. Pode zoar à vontade, ninguém se ofende.`;
        } else {
            prompt += `\nEste é um chat privado, aja como um amigo.`;
        }

        if(action !== "!lembrar") {
            formatedMessages = await this.getMessagesByLimit(sender, limit);
            prompt += `\n\nContexto das últimas mensagens:\n${formatedMessages}`;
        }
        else{
            prompt += `Mensagens que o usuário te pediu para "lembrar":
            ${complement}.
            Resuma o que foi dito nas mensagens recuperadas e responda à mensagem do usuário diretamente.`
        }

        if (action === "!resumo") {
            prompt += `\n\n${sender} pediu um RESUMO da conversa acima.
            Destaque os tópicos principais e quem falou mais besteira.`;

            switch (subAction) {
                case "curto":
                    prompt += "\nDiretriz: Resuma em 2 ou 3 parágrafos curtos (max 30 palavras cada).";
                    break;
                case "médio":
                    prompt += "\nDiretriz: Resuma com moderação (max 60 palavras por parágrafo).";
                    break;
                case "completo":
                    prompt += "\nDiretriz: Se aprofunde nos detalhes (até 60 palavras por assunto).";
                    break;
                default:
                    prompt += "\nDiretriz: Faça um resumo equilibrado.";
            }
        }
        else if(action === "!gpt"){
            prompt += "Seja útil e responda diretamente a mensagem do usuário com dados que julgar importantes."
        }
        return prompt;
    }

    //Recebe a resposta do Gemini utilizando o prompt recebido
    async getAiResponse(from, sender, isGroup, command, prompt, forceModel = null) {
        this.updateOnlineStatus();

        let modelName = this.selectBestModel(command, forceModel);

        try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            
            usage.increment(modelName);

            console.log(`Mensagem gerada usando o ${modelName}`)
            
            return result.response.text();
        } catch (error) {
            // Se der erro 503 ou 429, você pode disparar aquela sua lógica de retry aqui
            throw error;
        }
    }

    // Responde o comando !lol
    async handleLolCommand(command) {
        const args = command.trim().split(' ');
        args.shift();
        
        const fullArg = args.join(' ');
        const [gameName, tagLine] = fullArg.split('#');

        if (!gameName || !tagLine) {
            return "❌ Formato inválido. Use: *!lol Nome #Tag* (Ex: !lol Faker #T1)";
        }

        const region = 'americas';
        const platform = 'br1';

        // Busca Conta (PUUID)
        const accountResp = await fetch(`https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName.trim())}/${encodeURIComponent(tagLine.trim())}`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        if (!accountResp.ok) {
            if (accountResp.status === 404) throw new Error(`NICKNAME_OR_TAGLINE_WRONG`);
            if (accountResp.status === 403) throw new Error(`KEY_UNAVAILABLE`)
        }

        const accountData = await accountResp.json();
        const puuid = accountData.puuid;

        const leagueResp = await fetch(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`, {
                headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        const leagueData = await leagueResp.json();

        // Busca elo na solo e flex
        const soloQueue = leagueData.find(q => q.queueType === 'RANKED_SOLO_5x5');
        const flexQueue = leagueData.find(q => q.queueType === 'RANKED_FLEX_SR');
        
        let rankSolo = "Unranked";
        if (soloQueue) {
            rankSolo = `${soloQueue.tier} ${soloQueue.rank} (${soloQueue.leaguePoints} PDL)`;
        }

        let rankFlex = "Unranked";
        if (flexQueue) {
            rankFlex = `${flexQueue.tier} ${flexQueue.rank} (${flexQueue.leaguePoints} PDL)`;
        }

        // Busca Maestrias
        const masteryResp = await fetch(`https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });
        const masteryData = await masteryResp.json();

        let response = `📊 *ESTATÍSTICAS LOZINHO*\n\n`;
        response += `👤 *Jogador:* ${accountData.gameName} #${accountData.tagLine}\n`;
        response += `🏆 *Elo Solo:* ${rankSolo}\n`;
        
        if (soloQueue) {
            const winRate = Math.round((soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100);
            response += `📈 *Winrate:* ${winRate}% (${soloQueue.wins}V / ${soloQueue.losses}D)\n`;
        }
        
        response += `👥 *Elo Flex:* ${rankFlex}\n`;

        if(flexQueue){
            const winRate = Math.round((flexQueue.wins / (flexQueue.wins + flexQueue.losses)) * 100);
            response += `📈 *Winrate:* ${winRate}% (${flexQueue.wins}V / ${flexQueue.losses}D)\n`;
        }

        response += `\n⚔️ *Top 3 Maestrias:*\n`;
        masteryData.forEach((m, i) => {
            const nomeChamp = this.getChampName(m.championId);
            const pontos = m.championPoints.toLocaleString('pt-BR');
            response += `${i+1}º ${nomeChamp} - Nvl ${m.championLevel} (${pontos} pts)\n`;
        });

        return response;
    }

    //Responde o comando !lembrar
    async handleLembrarCommand(from, sender, isGroup, command, complement){
            const pergunta = command.slice(8).trim()
            const selectPrompt = `Você é um gerador de consulta SQL para SQLite. Sua única saída deve ser uma consulta SQL (SELECT), sem NENHUMA explicação ou texto adicional.
            A tabela é 'mensagens' e o campo de tempo é 'timestamp' (UNIX time em segundos).
            O ID da conversa atual é '${from}'.
            O usuário quer recuperar mensagens que se encaixam no período de tempo da pergunta, limitando o resultado a 500 mensagens no máximo.
            Recupere as colunas 'nome_remetente' e 'conteudo'.
            Use a condição WHERE para filtrar pelo id_conversa = '${from}' E pelo intervalo de tempo (timestamp).
            A ordenação deve ser por timestamp DESC, e o limite deve ser de 200. Se a pergunta não especificar um período de tempo, recupere as últimas 200 mensagens da conversa.

            Exemplo de saída para "o que rolou ontem": SELECT nome_remetente, conteudo FROM mensagens WHERE id_conversa = '${from}' AND timestamp BETWEEN 1764355200 AND 1764441600 ORDER BY timestamp DESC LIMIT 200;

            Pergunta do usuário: ${pergunta}`

            let sqlQuery = await this.getAiResponse(from, sender, isGroup, command, selectPrompt, "gemini-2.5-flash")

            // Remove blocos de código markdown (```sql e ```) e espaços extras
            sqlQuery = sqlQuery.replace(/```sql/gi, '').replace(/```/g, '').trim(); 
            
            if (!sqlQuery.toLowerCase().startsWith('select')) {
                console.log("IA gerou SQL inválido:", sqlQuery);
                throw new Error("INVALID_SELECT");
            }
            
            if (!sqlQuery.toLowerCase().includes('limit')) {
                sqlQuery = sqlQuery.replace(/;?$/, ` LIMIT 200;`);
            }
            
            let selectedMessages = await this.getMessagesByAiResponse(sqlQuery)

            let finalPrompt = await this.formulatePrompt(from, sender, isGroup, command, selectedMessages)
            
            return await this.getAiResponse(from, sender, isGroup, "any", finalPrompt)
    }

    //Responde o comando !menu
    async handleMenuCommand(){
        return `📍 Os comandos até agora são: \n🎲 !d{número}: Número aleatório (ex: !d20)\n🤖 !gpt {texto}: Pergunta pra IA\n🧠 !lembrar: lembra de um certo período de tempo\n🖼️ !s (ou !sticker): cria um sticker para a imagem/gif quotado ou na própria mensagem - Parâmetros:\npodi: qualidade absurdamente baixa\nbaixa: em baixa qualidade\nnormal(ou sem parâmetro nenhum): qualidade normal\n🛎️ !resumo: Resume a conversa - Parâmetros:\n1 - tamanho do resumo: curto, médio e completo\n2 - quantidade de mensagens a resumir (máximo 200)\n Ex: !resumo curto 100`;
    }

    //Responde o comando !d
    async handleDiceCommand(text, sender){
        var num = text.slice(2).trim(); 
        const max = parseInt(num);

        if(isNaN(num) || num === ""){
            return false
        }
        else{               
            let val = await this.rollDice(num); 
            let mssg = "";
            
            if(val == 1) mssg = "❌ FALHA CRÍTICA! Tomou gap..."
            else if(val < max/2) mssg = "🫠 meh."
            else if(val < max/1.5) mssg = "🫤 até que não foi ruim."
            else if(val < max) mssg = "😎 nice."
            else if(val == max) mssg = "🎰 SORTE GRANDE!"
            
            return `🎲 O dado caiu em: *${val}* \n${mssg}`;
        }
    }
    
    //Gera um número aleatório entre 1 e um número via parâmetro
    async rollDice(num){        
        const max = parseInt(num);
        const val = Math.floor(Math.random() * max) + 1;
        return val
    }

    //Faz o controle de todos os comandos
    async handleCommand(msg, sender, from, isGroup, command, quotedMessage) {
        if(command.startsWith('!d')) return await this.handleDiceCommand(command, sender)
        
        if(command.startsWith('!menu')) return await this.handleMenuCommand()
        
        if(command.startsWith('!resumo') && isGroup || command.startsWith("!gpt") && isGroup) return await this.getAiResponse(from, sender, isGroup, command, await this.formulatePrompt(from, sender, isGroup, command, quotedMessage));
        
        if(command.startsWith('!lol')) return await this.handleLolCommand(command);
        if(command.startsWith("!lembrar")){
            return await this.handleLembrarCommand(from, sender, isGroup, command)
        }
    }

    async handleMessageWithoutCommand(msg, sender, from, isGroup, command, quotedMessage){
        let finalPrompt = await this.formulatePrompt(from, sender, isGroup, command, quotedMessage);
        return await this.getAiResponse(from, sender, isGroup, command, finalPrompt)
    }
}

module.exports = ChatModel;