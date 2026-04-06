class StreamHandler {
    constructor(db) {
        this.db = db;
    }

    async getNetGroupId(groupId) {
        try {
            const link = await this.db.get("SELECT id_pai FROM grupos_linkados WHERE id_filho = ?", [groupId]);
            return link ? link.id_pai : groupId;
        } catch (e) {
            return groupId;
        }
    }

    async handleAnuncio(ctx) {
        const { sock, from, quotedMessage, name } = ctx;

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
        const { sock, from } = ctx;
        const targetGroupId = await this.getNetGroupId(from);

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