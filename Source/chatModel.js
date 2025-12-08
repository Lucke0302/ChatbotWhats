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


    //Salva mensagem no banco de dados
    async saveBotMessage (database, from, text, externalId = null){
        const timestamp = Math.floor(Date.now() / 1000);
        
        try {
            await database.run(
                `INSERT INTO mensagens 
                (id_conversa, timestamp, id_remetente, nome_remetente, conteudo, id_mensagem_externo)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [from, timestamp, myFullJid, 'Bot-Zap', text, externalId]            
            );
            console.log(`✅ OUTGOING: Resposta do Bot salva no BD. (Conversa: ${from})`);
        } catch (error) {
            if (error && !error.message.includes('UNIQUE constraint failed')) {
                console.error("❌ Erro ao salvar mensagem do Bot no BD:", error);
            }
        }
    };

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
    async getMessageCount(from){
        const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE id_conversa = '${from}'`;
        const result = await this.db.get(sqlQuery); 
        return result ? result.total : 0;
    };

    //Retorna mensagens do banco de dados para um certo remetente (pessoa ou grupo) com um limite
    async getMessagesByLimit(from, limit){
        const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE id_conversa = '${from}' 
        AND conteudo NOT LIKE '*Resumo da conversa*%'
        ORDER BY timestamp DESC 
        LIMIT ${limit}`;
        
        const messagesDb = await this.db.all(sqlQuery);

        console.log(messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n'))

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
    };

    //Essa função concatena o prompt para para a IA por algumas condicionais
    //Verifica se a mensagem veio de um grupo, quem enviou e uma série de fatores
    //pra moldar a melhor resposta possível (lógica ainda em desenvolvimento)
    async getAiResponse(from, sender, isGroup, command){        
        let formatedMessages = await this.getMessagesByLimit(from, 50);

        if(isGroup){
            this.prompt = `Você é um bot de WhatsApp engraçado e sarcástico num grupo de amigos,
            chamado Bostossauro. 
            Nenhum deles vai achar qualquer brincadeira ruim, pode falar o que quiser e fazer piadas.`
        }
        else if(!isGroup && this.isTesting){
            this.prompt = `Você é um bot de WhatsApp chamado Bostossauro, o usuário do WhatsApp
            chamado "${sender}" te enviou a seguinte pergunta ou comando: "${command}".
            Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom 
            de uma conversa de WhatsApp.
            
            Contexto da conversa (opcional):
            ${formatedMessages}`
        }
        else{
            this.prompt = `Você é um bot de WhatsApp chamado Bostossauro, o usuário do WhatsApp
            chamado "${sender}" te enviou a seguinte pergunta ou comando: "${command}".
            Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom 
            de uma conversa de WhatsApp.
            
            Contexto da conversa (opcional):
            ${formatedMessages}`
        }

        try{
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

            const result = await model.generateContent(this.prompt);
            const response = await result.response;
            const text = response.text();

            return text
        } catch (error) {
            console.error(error);
            return 'Morri kkkkkkkkkk tenta de novo aí.'; 
        }
    }

    //Controla o comando resumo
    async handleResumoCommand(sender, from, command){
        console.log(`Sender: ${sender}, from: ${from}`)
        const tamanho = command.split(' ');
        const numero = parseInt(tamanho[2]);

        //Retorna um erro se tiver poucas mensagens 
        if (await this.getMessageCount(from) < 5) {
            throw new Error("FEW_MESSAGES");
        }   

        let mensagensFormatadas;

        //Se o número receber Nan (not a number), joga no máximo de mensagens
        //que ele pode resumir (limite determinado por mim mesmo)
        if(!isNaN(numero) && numero > 0 && numero <= 500){
            mensagensFormatadas = await this.getMessagesByLimit(from, tamanho[2]);
        }else{mensagensFormatadas = await this.getMessagesByLimit(from, 200);}    

        let complemento = " "; 

        //Adiciona complemento à resposta
        switch(tamanho[1]){
            case "curto":
                complemento = "Responda de maneira concisa, dois ou três parágrafos.";
                break;
            case "médio":
                complemento = "Responda com certa concisão (até 2 linhas pra cada assunto), limite em no máximo 5 assuntos.";
                break; 
            case "completo":
                complemento = "Se aprofunde (até 5 linhas) em cada assunto";
                break;
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
            
            const prompt = `Você é um bot de WhatsApp engraçado e sarcástico num grupo de amigos, chamado Bostossauro. 
            No banco de dados, você é o Bot-Zap, não mencione esse nome na conversa, é irrelevante.
            ${sender} te chamou para fazer um resumo da conversa.
            Resuma a conversa abaixo destacando os tópicos principais e quem falou mais besteira.
            Use tópicos para resumir a conversa.
            Use emojis quando achar adequado, e use pelo menos uma vez o emoji de dinossaro, é sua marca registrada.
            Não usa o emoji de cocô.
            Nenhum deles vai achar qualquer brincadeira ruim, pode falar o que quiser e fazer piadas.
            Responda indicando, no primeiro parágrafo, quantas mensagens foram recuperadas.
            Comece a resposta com "*Resumo da conversa* \\n".
            ${complemento}
            
            Conversa:
            ${mensagensFormatadas}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

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
    async handleDiceCommand(text, from){
        var num = text.slice(2).trim(); 

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
    async handleCommand(msg, sender, from, isGroup, command) {
        try{
            if (command.startsWith('!d')) return await this.handleDiceCommand(command, from)
            //if (command.startsWith('!gpt') && isGroup) return await this.handleGptCommand()
            if (command.startsWith('!menu')) return await this.handleMenuCommand()
            if (command.startsWith('!resumo') && isGroup) return await this.handleResumoCommand(sender, from, command)
            if (!isGroup) return await this.getAiResponse(from, sender, isGroup, command)
        }
        catch(error){
            console.error("Tipo do erro:", error);
        }
    }
}

module.exports = ChatModel;