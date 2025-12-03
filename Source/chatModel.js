// chatModel.js

class ChatModel {
    constructor(sock, db, genAI) {
        this.sock = sock;
        this.db = db;
        this.genAI = genAI;
        this.myFullJid = sock.user.id || sock.user.lid; 
        this.isOnline = true;
        this.isTesting = true;
    }

    async sendDesonlineSticker(sock, db, from, sender){
        if (!fs.existsSync("Assets/desonline.webp")) {
            await sendMessage(sock, db, from, '❌ Erro: O arquivo do sticker não foi encontrado no servidor.', null, [sender]);
            return;
        }
    
        try {
            const stickerBuffer = fs.readFileSync("Assets/desonline.webp");
    
            const sentMessage = await sock.sendMessage(from, { 
                sticker: stickerBuffer 
            });
            
            console.log(`✅ Sticker enviado com sucesso: ${sentMessage.key.id}`);
    
        } catch (error) {
            console.error("❌ Erro ao enviar sticker:", error);
            await sendMessage(sock, db, from, "Desonline... 😴", null, [sender]);
        }
    }

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

    async sendAndSave(sock, database, from, text, msgKey = null, mentions = []){
        const sentMessage = await sock.sendMessage(from, { 
            text: text, 
            mentions: mentions 
        }, { quoted: msgKey });
        
        await saveBotMessage(database, from, text, sentMessage.key.id);
    };

    async getMessageCount(db, from){
        const sqlQuery = `SELECT COUNT(*) AS total FROM mensagens WHERE id_conversa = '${from}'`;
        const result = await db.get(sqlQuery); 
        return result ? result.total : 0;
    };

    async getMessagesByLimit(db, from, limit){
        const sqlQuery = `SELECT nome_remetente, conteudo 
        FROM mensagens 
        WHERE id_conversa = '${from}' 
        ORDER BY timestamp DESC 
        LIMIT ${limit}`;
        
        const messagesDb = await db.all(sqlQuery);

        console.log(messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n'))

        return messagesDb.map(m => `${m.nome_remetente || 'Desconhecido'}: ${m.conteudo}`).join('\n');
    };

    async getAiResponse(from, isGroup, command){        
        let formatedMessages = await this.getMessagesByLimit();

        /*`
        ${complement}
        
        Conversa:
        ${formatedMessages}`*/;

        if(isGroup){
            prompt = `Você é um bot de WhatsApp engraçado e sarcástico num grupo de amigos,
            chamado Bostossauro. 
            Nenhum deles vai achar qualquer brincadeira ruim, pode falar o que quiser e fazer piadas.`
        }
        else if(!isGroup && this.isTesting){
            prompt = `Você é um bot de WhatsApp chamado Bostossauro, o usuário do WhatsApp
            chamado "${nomeUsuario}" te enviou a seguinte pergunta ou comando: "${command}".
            Responda ele diretamente pelo nome. Seja criativo, útil e mantenha o tom 
            de uma conversa de WhatsApp.
            
            Contexto da conversa (opcional):
            ${formatedMessages}`
        }

        if(trimmedCommand == "!gpt"){

        }

        try{
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            await sendAndSave(sock, db, from, text); 
        } catch (error) {
            console.error(error);
            await sendAndSave(sock, db, from, 'Morri kkkkkkkkkk tenta de novo aí.'); 
        }
    }
    
    async handleResumoCommand(msg, text, from, command){
        tamanho = command.split(' ')
        if (getMessageCount(db, from) < 5) {
            await sendAndSave(sock, db, from, '❌ Poucas mensagens para resumir. Conversem mais um pouco!'); 
            return;
        }       

        const mensagensFormatadas = await getMessagesByLimit(db, from, 500);

        await sendAndSave(sock, db, from, '🤖 Ces falam demais, preciso ler tudo...'); 

        complemento = " ";

        switch(tamanho[1]){
            case "curto":
                complemento = "Responda de maneira concisa, dois ou três parágrafos."
                break;
            case "médio":
                complemento = "Responda com certa concisão (até 2 linhas pra cada assunto), limite em no máximo 5 assuntos."
            case "completo":
                complemento = "Se aprofunde (até 5 linhas) em cada assunto"
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
            const prompt = `Você é um bot de WhatsApp engraçado e sarcástico num grupo de amigos, chamado Bostossauro. 
            Resuma a conversa abaixo destacando os tópicos principais e quem falou mais besteira.
            Use tópicos para resumir a conversa.
            Nenhum deles vai achar qualquer brincadeira ruim, pode falar o que quiser e fazer piadas.
            ${complemento}
            
            Conversa:
            ${mensagensFormatadas}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            await sendAndSave(sock, db, from, text); 
        } catch (error) {
            console.error(error);
            await sendAndSave(sock, db, from, 'Morri kkkkkkkkkk tenta de novo aí.'); 
        }
    }

    async handleDiceCommand(msg, text, from){
        var num = text.slice(2).trim(); 
        if(isNaN(pergunta) || pergunta === ""){
            await sendAndSave(sock, db, from, `Digita um número válido, imbecil`); 
        }
        else{                
            const max = parseInt(pergunta);
            const val = Math.floor(Math.random() * max) + 1;
            let mssg = "";
            
            if(val == 1) mssg = "❌ FALHA CRÍTICA!"
            else if(val < max/2) mssg = "🫠 meh."
            else if(val < max/1.5) mssg = "🫤 até que não foi ruim."
            else if(val < max) mssg = "😎 nice."
            else if(val == max) mssg = "🎰 SORTE GRANDE!"
            
            const responseText = `🎲 O dado caiu em: *${val}* \n${mssg}`;

            await sendAndSave(sock, db, from, responseText); 
        }

    }

    async handleCommand(msg, from, isGroup, command) {
        if (command.startsWith('!resumo') && isGroup) {
            return await this.handleResumoCommand(msg, command, from)
        }
        if (command.startsWith('!d')){
            return this.handleDiceCommand(msg, command, from)
        }
        if (!isGroup){
            return await this.getAiResponse(from, isGroup, command)
        }
    }
}

module.exports = ChatModel;