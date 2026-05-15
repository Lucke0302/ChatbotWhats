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
            CREATE TABLE IF NOT EXISTS contas_linkadas (
                id_twitch TEXT PRIMARY KEY,
                id_whatsapp TEXT
            );
            CREATE TABLE IF NOT EXISTS tokens_vinculo (
                token TEXT PRIMARY KEY,
                id_whatsapp TEXT,
                expira_em INTEGER
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

    async isMod(sender, id_pai, ctx) {
        if (sender === this.OWNER || sender === 'lucke0302@twitch.net') return true;
        
        if (ctx && ctx.platform === 'twitch' && ctx.isTwitchMod) return true;

        const row = await this.db.get(
            "SELECT id_usuario FROM stream_mods WHERE id_usuario = ? AND id_pai = ?", 
            [sender, id_pai]
        );
        return !!row;
    }

    async handleAddMod(ctx) {
        const { sender, from, command, mentions, reply } = ctx;
        const id_pai = await this.getNetGroupId(from);
        
        if (!(await this.isMod(sender, id_pai, ctx))) {
            return null;
        }

        const targetUser = this.parseTargetUser(command.trim().split(/\s+/), mentions);
        if (!targetUser) {
            await reply("⚠️ Use: *!addmod @usuario* ou *!addmod numero (sem espaços ou caracteres especiais)*");
            return null;
        }

        try {
            await this.db.run(
                "INSERT INTO stream_mods (id_usuario, id_pai) VALUES (?, ?)", 
                [targetUser, id_pai]
            );
            await reply(`✅ Usuário promovido a Moderador!`);
        } catch (e) {
            await reply("⚠️ Este usuário já é moderador por aqui.");
        }
        return null;
    }

    async handleRemoveMod(ctx) {
        const { sender, from, command, mentions, reply } = ctx;
        const id_pai = await this.getNetGroupId(from);
        
        if (!(await this.isMod(sender, id_pai, ctx))) {
            await reply("🚫 Acesso negado.");
            return null;
        }

        const targetUser = this.parseTargetUser(command.trim().split(/\s+/), mentions);
        if (!targetUser) {
            await reply("⚠️ Use: *!removemod @usuario*");
            return null;
        }
        
        if (targetUser === this.OWNER) {
            await reply("🚫 Boa tentativa.");
            return null;
        }

        const result = await this.db.run(
            "DELETE FROM stream_mods WHERE id_usuario = ? AND id_pai = ?", 
            [targetUser, id_pai]
        );
        
        await reply(result.changes > 0 ? "🗑️ Moderador removido." : "⚠️ Usuário não era mod deste grupo.");
        return null;
    }

    async handleListMods(ctx) {
        const { sock, from, sender, reply, platform } = ctx;
        const id_pai = await this.getNetGroupId(from);

        if (!(await this.isMod(sender, id_pai, ctx))) {
            await reply("🚫 Acesso negado. A lista da equipe é confidencial.");
            return null;
        }

        const matchJid = (jid1, jid2) => {
            const n1 = jid1.split('@')[0];
            const n2 = jid2.split('@')[0];
            
            if (n1 === n2) return true;
            
            if (n1.startsWith('55') && n2.startsWith('55')) {
                const base1 = n1.length === 13 ? n1.slice(0, 4) + n1.slice(5) : n1;
                const base2 = n2.length === 13 ? n2.slice(0, 4) + n2.slice(5) : n2;
                return base1 === base2;
            }
            return false;
        };

        try {
            const modsDb = await this.db.all(`
                SELECT sm.id_usuario, u.nome 
                FROM stream_mods sm
                LEFT JOIN usuarios u ON sm.id_usuario = u.id_usuario
                WHERE sm.id_pai = ?
            `, [id_pai]);

            if (!modsDb || modsDb.length === 0) {
                await reply("⚠️ Nenhum moderador registrado nesta Ilha ainda.");
                return null;
            }

            let participants = [];
            if (platform === 'whatsapp' && sock) {
                try {
                    const groupMetadata = await sock.groupMetadata(id_pai);
                    participants = groupMetadata.participants;
                } catch (e) {
                    console.error("Erro ao buscar metadata do grupo:", e);
                }
            }

            let msg = "🛡️ *MODERADORES DA ILHA* 🛡️\n\n";

            modsDb.forEach((mod, index) => {
                const inGroup = participants.length > 0 ? participants.find(p => matchJid(p.id, mod.id_usuario)) : true;
                
                const numeroLimpo = mod.id_usuario.replace('@s.whatsapp.net', '');
                let displayName = mod.nome && mod.nome !== 'Desconhecido' ? mod.nome : `+${numeroLimpo}`;
                
                if (mod.id_usuario === this.OWNER) {
                    displayName = `👑 ${displayName} (Arquiteto)`;
                }

                const statusTag = (platform === 'whatsapp' && !inGroup) ? " _(Fora do grupo)_" : "";

                msg += `*[ ${index + 1} ]* ${displayName}${statusTag}\n`;
            });

            await reply(msg);
            return null;

        } catch (error) {
            console.error("Erro ao listar mods:", error);
            await reply("❌ Erro ao acessar os arquivos. O RH deve estar de folga.");
            return null;
        }
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
        const { sock, from, quotedMessage, name, sender, reply, command } = ctx;
        const id_pai = await this.getNetGroupId(from);
        
        if (!(await this.isMod(sender, id_pai, ctx))) {
            return null;
        }

        let textoAnuncio = quotedMessage;
        if (!textoAnuncio || textoAnuncio === "[Midia/Sticker sem texto]") {
            const args = command.trim().split(/\s+/);
            args.shift();
            if (args.length > 0) {
                textoAnuncio = args.join(" ");
            } else {
                await reply("⚠️ Você precisa responder a uma mensagem ou digitar o texto do anúncio logo após o comando.");
                return null;
            }
        }

        const targetGroupId = await this.getNetGroupId(from);

        if (!targetGroupId.endsWith('@g.us')) {
            await reply("⚠️ A moderação não está linkada a nenhum grupo oficial do WhatsApp. Use *!link [ID_DO_GRUPO]* aqui primeiro.");
            return null;
        }

        if (!sock) {
            await reply("❌ O módulo do WhatsApp não está conectado no momento para enviar o anúncio.");
            return null;
        }

        try {
            const groupMetadata = await sock.groupMetadata(targetGroupId);
            const participants = groupMetadata.participants;
            const allMentions = participants.map(p => p.id);

            const anuncioText = `📢 *ANÚNCIO DA ILHA* 📢\n_Por: ${name} (Via ${ctx.platform === 'twitch' ? 'Twitch 🟪' : 'WhatsApp 🟩'})_\n\n${textoAnuncio}`;

            await sock.sendMessage(targetGroupId, {
                text: anuncioText,
                mentions: allMentions
            });

            await reply("✅ Anúncio disparado com sucesso no grupo principal!");
        } catch (error) {
            console.error("Erro no !anuncio:", error);
            await reply("❌ Deu erro ao enviar. O Bostossauro é Admin no grupo principal e o ID do grupo é válido?");
        }
        return null;
    }

    async handleLiveStatus(ctx, status) {
        const { sock, from, sender, reply } = ctx;
        const targetGroupId = await this.getNetGroupId(from);

        if (!(await this.isMod(sender, targetGroupId, ctx))) {
            return null;
        }

        if (!sock) {
            await reply("❌ O módulo do WhatsApp não está conectado para alterar o título.");
            return null;
        }

        const novoNome = status === 'on'
            ? "Ilha do CAPS!! | Live ON🟢"
            : "Ilha do CAPS!! | Live OFF🔴";

        try {
            await sock.groupUpdateSubject(targetGroupId, novoNome);
            await reply(`✅ Título da Ilha atualizado para: *${novoNome}*`);
        } catch (error) {
            console.error("Erro ao mudar título do grupo:", error);
            await reply("❌ Erro ao mudar o título. Confere se eu tenho permissão de Admin no grupo principal!");
        }
        return null;
    }
}

module.exports = StreamHandler;