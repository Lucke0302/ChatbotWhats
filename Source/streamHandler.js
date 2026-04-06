class StreamHandler {
    constructor(db) {
        this.db = db;
        this.OWNER = "5513991008854@s.whatsapp.net";
        this.initDB();
    }

    async initDB() {
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS stream_mods (
                id_usuario TEXT,
                id_pai TEXT,
                PRIMARY KEY (id_usuario, id_pai)
            );
        `);
    }

    async getNetGroupId(groupId) {
        try {
            const link = await this.db.get("SELECT id_pai FROM grupos_linkados WHERE id_filho = ?", [groupId]);
            return link ? link.id_pai : groupId;
        } catch (e) {
            return groupId;
        }
    }

    async isMod(sender, id_pai) {
        if (sender === this.OWNER) return true;
        const row = await this.db.get(
            "SELECT id_usuario FROM stream_mods WHERE id_usuario = ? AND id_pai = ?", 
            [sender, id_pai]
        );
        return !!row;
    }

    async handleAddMod(ctx) {
        const { sender, from, command, mentions } = ctx;
        const id_pai = await this.getNetGroupId(from);
        
        if (!(await this.isMod(sender, id_pai))) {
            return "";
        }

        const targetUser = this.parseTargetUser(command.trim().split(/\s+/), mentions);
        if (!targetUser) return "⚠️ Use: *!addmod @usuario* ou *!addmod numero (sem espaços ou caracteres especiais)*";

        try {
            await this.db.run(
                "INSERT INTO stream_mods (id_usuario, id_pai) VALUES (?, ?)", 
                [targetUser, id_pai]
            );
            return `✅ Usuário promovido a Moderador!`;
        } catch (e) {
            return "⚠️ Este usuário já é moderador por aqui.";
        }
    }

    async handleRemoveMod(ctx) {
        const { sender, from, command, mentions } = ctx;
        const id_pai = await this.getNetGroupId(from);
        
        if (!(await this.isMod(sender, id_pai))) {
            return "🚫 Acesso negado.";
        }

        const targetUser = this.parseTargetUser(command.trim().split(/\s+/), mentions);
        if (!targetUser) return "⚠️ Use: *!removemod @usuario*";
        
        if (targetUser === this.OWNER) return "🚫 Boa tentativa.";

        const result = await this.db.run(
            "DELETE FROM stream_mods WHERE id_usuario = ? AND id_pai = ?", 
            [targetUser, id_pai]
        );
        
        return result.changes > 0 ? "🗑️ Moderador removido." : "⚠️ Usuário não era mod deste grupo.";
    }

    parseTargetUser(args, mentions) {
        if (mentions && mentions.length > 0) return mentions[0];
        const numberArg = args.find(a => /\d/.test(a) && !a.startsWith('!'));
        if (!numberArg) return null;
        let cleaned = numberArg.replace(/\D/g, '');
        if (cleaned.length === 10 || cleaned.length === 11) cleaned = '55' + cleaned;
        return cleaned + '@s.whatsapp.net';
    }

    async handleAnuncio(ctx) {
        const { sock, from, quotedMessage, name, sender } = ctx;
        const id_pai = await this.getNetGroupId(from);
        
        if (!(await this.isMod(sender, id_pai))) {
            return "";
        }

        if (!quotedMessage || quotedMessage === "[Midia/Sticker sem texto]") {
            return "⚠️ Você precisa responder a uma mensagem de texto com *!anuncio* para eu disparar.";
        }

        const targetGroupId = await this.getNetGroupId(from);

        if (targetGroupId === from) {
            return "⚠️ A moderação não está linkada a nenhum grupo oficial. Use *!link [ID_DO_GRUPO]* aqui primeiro.";
        }

        try {
            const groupMetadata = await sock.groupMetadata(targetGroupId);
            const participants = groupMetadata.participants;
            const allMentions = participants.map(p => p.id);

            const anuncioText = `📢 *ANÚNCIO DA ILHA* 📢\n_Por: ${name}_\n\n${quotedMessage}`;

            await sock.sendMessage(targetGroupId, {
                text: anuncioText,
                mentions: allMentions
            });

            return "✅ Anúncio disparado com sucesso no grupo principal!";
        } catch (error) {
            console.error("Erro no !anuncio:", error);
            return "❌ Deu erro ao enviar. O Bostossauro é Admin no grupo principal?";
        }
    }

    async handleLiveStatus(ctx, status) {
        const { sock, from, sender } = ctx;
        const targetGroupId = await this.getNetGroupId(from);

        if (!this.isMod(sender)) {
            return;
        }

        const novoNome = status === 'on'
            ? "Ilha do CAPS!! | Live ON🟢"
            : "Ilha do CAPS!! | Live OFF🔴";

        try {
            // Altera o nome do grupo Pai
            await sock.groupUpdateSubject(targetGroupId, novoNome);
            return `✅ Título da Ilha atualizado para: *${novoNome}*`;
        } catch (error) {
            console.error("Erro ao mudar título do grupo:", error);
            return "❌ Erro ao mudar o título. Confere se eu tenho permissão de Admin no grupo principal!";
        }
    }
}

module.exports = StreamHandler;