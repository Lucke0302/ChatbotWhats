const { jidNormalizedUser } = require('@whiskeysockets/baileys');

async function handleMigrationCommand(sock, command, sender) {
    const args = command.trim().split(/\s+/);

    if (args.length < 3) {
        return "⚠️ *Uso Incorreto*\nFormato: `!migrar [ID_Origem] [ID_Destino] [Numeros_Excecao...]`";
    }

    const sourceId = args[1].endsWith('@g.us') ? args[1] : `${args[1]}@g.us`;
    const targetId = args[2].endsWith('@g.us') ? args[2] : `${args[2]}@g.us`;

    const exceptions = args.slice(3).map(num => {
        const cleanNum = num.replace(/\D/g, '');
        return cleanNum.includes('@s.whatsapp.net') ? cleanNum : `${cleanNum}@s.whatsapp.net`;
    });

    console.log(`\n🚀 [MIGRAÇÃO] Iniciada por: ${sender}`);

    try {
        console.log(`🔍 [MIGRAÇÃO] Checando grupo origem: ${sourceId}`);
        let sourceMetadata;
        try {
            sourceMetadata = await sock.groupMetadata(sourceId);
        } catch (err) {
            console.error(`❌ [MIGRAÇÃO] Erro origem:`, err);
            return "❌ Não consegui ler o grupo de origem. Verifique o ID ou se estou lá.";
        }

        console.log(`🔍 [MIGRAÇÃO] Checando grupo destino: ${targetId}`);
        let targetMetadata;
        try {
            targetMetadata = await sock.groupMetadata(targetId);
        } catch (err) {
            console.error(`❌ [MIGRAÇÃO] Erro destino:`, err);
            return "❌ Não consegui ler o grupo de destino. Verifique o ID ou se estou lá.";
        }

        const botId = jidNormalizedUser(sock.user.id);

        const botInTarget = targetMetadata.participants.find(p => jidNormalizedUser(p.id) === botId);
        
        if (!botInTarget) {
            return "❌ Eu não estou no grupo de destino!";
        }

        if (!botInTarget.admin) {
            console.warn(`⛔ [MIGRAÇÃO] Bot não é admin no destino.`);
            return "⛔ *ERRO DE PERMISSÃO:*\nEu preciso ser **ADMINISTRADOR** no grupo de destino para adicionar pessoas.\nMe promove lá e tenta de novo.";
        }

        const targetParticipantsSet = new Set(targetMetadata.participants.map(p => jidNormalizedUser(p.id)));

        const participantsToMigrate = sourceMetadata.participants
            .map(p => jidNormalizedUser(p.id))
            .filter(id => {
                const isBot = id === botId;
                const isException = exceptions.includes(id);
                const alreadyInTarget = targetParticipantsSet.has(id);
                
                return !isBot && !isException && !alreadyInTarget;
            });

        if (participantsToMigrate.length === 0) {
            return "⚠️ Ninguém para migrar (todos já estão no grupo ou são exceções).";
        }

        console.log(`✅ [MIGRAÇÃO] ${participantsToMigrate.length} participantes novos para adicionar.`);

        const batchSize = 5;
        const results = { success: 0, failed: 0, errors: [] };

        for (let i = 0; i < participantsToMigrate.length; i += batchSize) {
            const batch = participantsToMigrate.slice(i, i + batchSize);
            console.log(`⏳ [MIGRAÇÃO] Processando lote ${Math.floor(i/batchSize) + 1}...`);

            try {
                const response = await sock.groupParticipantsUpdate(targetId, batch, 'add');
                if (Array.isArray(response)) {
                    response.forEach(res => {
                        if (res.status === '200') {
                            results.success++;
                        } else {
                            results.failed++;
                            let reason = res.status;
                            if(res.status === '403') reason = 'Privacidade/Bloqueado';
                            if(res.status === '400') reason = 'Inválido';
                            
                            results.errors.push(`${res.jid.split('@')[0]} (${reason})`);
                        }
                    });
                } else {
                    results.success += batch.length;
                }

                await new Promise(r => setTimeout(r, 2000));

            } catch (batchError) {
                console.error(`❌ [MIGRAÇÃO] Erro crítico no lote:`, batchError);
                if (batchError.data === 400 || batchError.output?.statusCode === 500) {
                     results.failed += batch.length;
                     results.errors.push(`Erro Crítico no Lote (Bad Request)`);
                } else {
                     results.failed += batch.length;
                     results.errors.push(`Erro desconhecido: ${batchError.message}`);
                }
            }
        }

        let report = `🏁 *Relatório de Migração*\n\n` +
                     `👥 *Novos Tentados:* ${participantsToMigrate.length}\n` +
                     `✅ *Sucesso:* ${results.success}\n` +
                     `❌ *Falhas:* ${results.failed}`;

        if (results.errors.length > 0) {
            const errPreview = results.errors.slice(0, 5).join('\n');
            report += `\n\n⚠️ *Falhas (Top 5):*\n${errPreview}`;
            if(results.errors.length > 5) report += `\n...e mais ${results.errors.length - 5}.`;
        }

        return report;

    } catch (error) {
        console.error(`❌ [MIGRAÇÃO] Erro Geral:`, error);
        return `❌ Erro fatal: ${error.message}`;
    }
}

module.exports = { handleMigrationCommand };