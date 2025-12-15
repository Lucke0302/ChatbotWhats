// chatModel.js

const { error } = require("qrcode-terminal");

class ChatModel {
    constructor(sock, db, genAI) {
        this.sock = sock;
        this.db = db;
        this.genAI = genAI;
        this.myFullJid = sock.user.id || sock.user.lid; 
        this.isOnline = true;
        this.isTesting = true;
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
                return "resumo.webp"
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

        console.log(messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n'))

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
    };

    async formulatePrompt(sender, from, isGroup, command, quotedMessage) {
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

        const formatedMessages = await this.getMessagesByLimit(sender, limit);

        console.log(formatedMessages)

        prompt = `Você é um bot de WhatsApp engraçado e sarcástico, chamado Bostossauro.
        O usuário "${sender}" te mandou: "${command}".
        Use emojis (pelo menos um dinossauro 🦖), mas nunca use o emoji de cocô.
        Responda diretamente pelo nome. Seja criativo e mantenha o tom de uma conversa do whatsapp.`;

        if (quotedMessage !== "Vazio") {
            prompt += `\nO usuário respondeu a esta mensagem: "${quotedMessage}"`;
        }

        if (isGroup) {
            prompt += `\nVocê está em um grupo de amigos. Pode zoar à vontade, ninguém se ofende.`;
        } else {
            prompt += `\nEste é um chat privado, aja como um amigo.`;
        }

        prompt += `\n\nContexto das últimas mensagens:\n${formatedMessages}`;

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
            prompt += `\nComece a resposta EXATAMENTE com: "*Resumo da conversa* \\n"`;
        }
        return prompt;
    }
    
    async getAiResponse(from, sender, isGroup, command, quotedMessage = "Vazio"){    

        const finalPrompt = await this.formulatePrompt(from, sender, isGroup, command, quotedMessage)

        try{
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            const text = response.text();

            return text
        } catch (error) {
            if (error.message === "FEW_MESSAGES") {
                return "Pô, tem nem mensagem direito pra eu ler... Fala mais aí depois me chama.";
            }
            console.error(error);
            return 'Morri kkkkkkkkkk tenta de novo aí.'; 
        }
    }

    async handleLembrarCommand(sender, from, command){
        
    }

    //Controla o comando resumo
    async handleResumoCommand(from, sender, isGroup, command, quotedMessage){
        try {
            const text = await this.getAiResponse(from, sender, isGroup, command, quotedMessage)
            return text;

        } catch (error) {
            console.error("Erro no Model:", error);
            throw new Error("AI_ERROR"); 
        }
    }

    //Responde o comando !menu
    async handleMenuCommand(){
        return `📍 Os comandos até agora são: \n🎲 !d{número}: Número aleatório (ex: !d20)\n🤖 !gpt {texto}: Pergunta pra IA\n🧠 !lembrar: lembra de um certo período de tempo\n 🛎️!resumo: Resume a conversa - Parâmetros:\n1 - tamanho do resumo: curto, médio e completo\n2 - quantidade de mensagens a resumir (máximo 500)\n Ex: !resumo curto 100`;
    }

    //Responde o comando !gpt
    async handleGptCommand(){
        return "Ainda vazio 😓"
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
        try{
            if (command.startsWith('!d')) return await this.handleDiceCommand(command, sender)
            //if (command.startsWith('!gpt') && isGroup) return await this.handleGptCommand()
            if (command.startsWith('!menu')) return await this.handleMenuCommand()
            if (command.startsWith('!resumo') && isGroup) return await this.handleResumoCommand(from, sender, isGroup, command, quotedMessage)
            //if (!isGroup) return await this.getAiResponse(from, sender, isGroup, command)
        }
        catch(error){
            console.error("Tipo do erro:", error);
        }
    }

    async handleMessageWithoutCommand(msg, sender, from, isGroup, command, quotedMessage){
        return await this.getAiResponse(from, sender, isGroup, command, quotedMessage)
    }
}

module.exports = ChatModel;