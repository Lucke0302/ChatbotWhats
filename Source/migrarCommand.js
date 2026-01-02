const { jidNormalizedUser } = require('@whiskeysockets/baileys');

async function handleMigrationCommand(sock, command, sender) {
    const args = command.trim().split(/\s+/);

    if (args.length < 3) {
        return "⚠️ *Uso Incorreto*\nFormato: `!migrar [ID_Origem] [ID_Destino] [Numeros_Excecao...]`\n\nExemplo: `!migrar 12345@g.us 67890@g.us 551399999999`";
    }

    const sourceId = args[1].endsWith('@g.us') ? args[1] : `${args[1]}@g.us`;
    const targetId = args[2].endsWith('@g.us') ? args[2] : `${args[2]}@g.us`;
    
    const exceptions = args.slice(3).map(num => {
        const cleanNum = num.replace(/\D/g, '');
        return cleanNum.includes('@s.whatsapp.net') ? cleanNum : `${cleanNum}@s.whatsapp.net`;
    });

    console.log(`\n🚀 [MIGRAÇÃO] Iniciada por: ${sender}`);
    console.log(`ℹ️ [MIGRAÇÃO] De: ${sourceId} | Para: ${targetId}`);
    console.log(`🚫 [MIGRAÇÃO] Exceções (${exceptions.length}): ${exceptions.join(', ')}`);

    try {
        console.log(`🔍 [MIGRAÇÃO] Buscando participantes do grupo origem...`);
        let sourceMetadata;
        try {
            sourceMetadata = await sock.groupMetadata(sourceId);
        } catch (err) {
            console.error(`❌ [MIGRAÇÃO] Falha ao buscar grupo origem: ${err.message}`);
            return "❌ Não consegui acessar o grupo de origem. Verifique o ID e se estou nele.";
        }

        const botId = jidNormalizedUser(sock.user.id);
        
        const participantsToMigrate = sourceMetadata.participants
            .map(p => jidNormalizedUser(p.id))
            .filter(id => {
                const isBot = id === botId;
                const isException = exceptions.includes(id);
                return !isBot && !isException;
            });

        if (participantsToMigrate.length === 0) {
            console.warn(`⚠️ [MIGRAÇÃO] Nenhum participante elegível encontrado.`);
            return "⚠️ Nenhum participante para migrar (ou todos estão na lista de exceções).";
        }

        console.log(`✅ [MIGRAÇÃO] ${participantsToMigrate.length} participantes elegíveis encontrados.`);

        const batchSize = 5;
        const results = { success: 0, failed: 0, errors: [] };

        for (let i = 0; i < participantsToMigrate.length; i += batchSize) {
            const batch = participantsToMigrate.slice(i, i + batchSize);
            console.log(`⏳ [MIGRAÇÃO] Processando lote ${Math.floor(i/batchSize) + 1} (${batch.length} usuários)...`);

            try {
                const response = await sock.groupParticipantsUpdate(targetId, batch, 'add');
                
                if (Array.isArray(response)) {
                    response.forEach(res => {
                        if (res.status === '200' || res.status === '409') {
                            results.success++;
                        } else {
                            results.failed++;
                            results.errors.push(`${res.jid} (Status: ${res.status})`);
                            console.warn(`⚠️ [MIGRAÇÃO] Falha ao adicionar ${res.jid}: Status ${res.status}`);
                        }
                    });
                } else {
                    results.success += batch.length;
                }

                await new Promise(r => setTimeout(r, 1000));

            } catch (batchError) {
                console.error(`❌ [MIGRAÇÃO] Erro crítico no lote:`, batchError);
                results.failed += batch.length;
                results.errors.push(`Erro de Lote: ${batchError.message}`);
            }
        }

        console.log(`🏁 [MIGRAÇÃO] Concluída. Sucesso: ${results.success} | Falhas: ${results.failed}`);

        let report = `🏁 *Relatório de Migração*\n\n` +
                     `👥 *Total Tentado:* ${participantsToMigrate.length}\n` +
                     `✅ *Sucesso/Já no Grupo:* ${results.success}\n` +
                     `❌ *Falhas:* ${results.failed}`;

        if (results.errors.length > 0) {
            const errPreview = results.errors.slice(0, 3).join('\n');
            report += `\n\n⚠️ *Alguns Erros:*\n${errPreview}${results.errors.length > 3 ? '\n...' : ''}`;
        }

        return report;

    } catch (error) {
        console.error(`❌ [MIGRAÇÃO] Erro Geral:`, error);
        return `❌ Ocorreu um erro crítico ao tentar migrar: ${error.message}`;
    }
}

module.exports = { handleMigrationCommand };