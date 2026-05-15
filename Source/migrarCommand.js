const { jidNormalizedUser } = require('@whiskeysockets/baileys');

async function handleMigrationCommand(ctx) {
    const { command, sender, from, sock, platform, reply } = ctx;

    if (platform !== 'whatsapp' || !sock) {
        return "🚫 Este comando lida com IDs de grupos do WhatsApp e não funciona nesta plataforma.";
    }

    const args = command.trim().split(/\s+/);

    if (args.length < 3) {
        await reply("⚠️ *Uso Incorreto*\nFormato: `!migrar [ID_Origem] [ID_Destino] [Numeros_Excecao...]`");
        return null; 
    }

    const sourceId = args[1].endsWith('@g.us') ? args[1] : `${args[1]}@g.us`;
    const targetId = args[2].endsWith('@g.us') ? args[2] : `${args[2]}@g.us`;
    
    const exceptions = args.slice(3).map(num => {
        const cleanNum = num.replace(/\D/g, '');
        return cleanNum.includes('@s.whatsapp.net') ? cleanNum : `${cleanNum}@s.whatsapp.net`;
    });

    console.log(`\n🚀 [MIGRAÇÃO] Iniciada por: ${sender} na conversa ${from}`);

    try {
        console.log(`🔍 [MIGRAÇÃO] Checando grupo origem: ${sourceId}`);
        let sourceMetadata;
        try {
            sourceMetadata = await sock.groupMetadata(sourceId); // Usa o sock extraído do ctx
        } catch (err) {
            console.error(`❌ [MIGRAÇÃO] Erro origem:`, err);
            await reply("❌ Não consegui ler o grupo de origem. Verifique o ID ou se estou lá.");
            return null;
        }

        console.log(`🔍 [MIGRAÇÃO] Checando grupo destino: ${targetId}`);
        let targetMetadata;
        try {
            targetMetadata = await sock.groupMetadata(targetId);
        } catch (err) {
            console.error(`❌ [MIGRAÇÃO] Erro destino:`, err);
            await reply("❌ Não consegui ler o grupo de destino. Verifique o ID ou se estou lá.");
            return null;
        }

        const botId = jidNormalizedUser(sock.user.id);

        const botInTarget = targetMetadata.participants.find(p => {
            const pId = jidNormalizedUser(p.id);
            const pPhone = p.phoneNumber ? jidNormalizedUser(p.phoneNumber) : null;
            return pId === botId || pPhone === botId;
        });
        
        if (!botInTarget) {
            console.log(`❌ ERRO DEBUG: Bot ID (${botId}) não encontrado na lista do destino.`);
            await reply("❌ Eu não estou no grupo de destino (ou não consegui me identificar na lista)!");
            return null;
        }

        if (botInTarget.admin !== 'admin' && botInTarget.admin !== 'superadmin') {
            console.warn(`⛔ [MIGRAÇÃO] Bot consta no grupo mas não é admin.`);
            await reply("⛔ *ERRO DE PERMISSÃO:*\nEu preciso ser **ADMINISTRADOR** no grupo de destino para adicionar pessoas.\nMe promove lá e tenta de novo.");
            return null;
        }

        const targetParticipantsSet = new Set(targetMetadata.participants.map(p => {
             return p.phoneNumber ? jidNormalizedUser(p.phoneNumber) : jidNormalizedUser(p.id);
        }));

        const participantsToMigrate = sourceMetadata.participants
            .map(p => {
                return p.phoneNumber ? jidNormalizedUser(p.phoneNumber) : jidNormalizedUser(p.id);
            })
            .filter(id => {
                const isBot = id === botId;
                const isException = exceptions.includes(id);
                const alreadyInTarget = targetParticipantsSet.has(id);
                
                return !isBot && !isException && !alreadyInTarget;
            });

        if (participantsToMigrate.length === 0) {
            await reply("⚠️ Ninguém para migrar (todos já estão no grupo ou são exceções).");
            return null;
        }

        console.log(`✅ [MIGRAÇÃO] ${participantsToMigrate.length} participantes novos para adicionar.`);

        const batchSize = 5;
        const results = { success: 0, failed: 0, errors: [] };

        for (let i = 0; i < participantsToMigrate.length; i += batchSize) {
            const batch = participantsToMigrate.slice(i, i + batchSize);
            const batchNumber = Math.floor(i/batchSize) + 1;
            console.log(`⏳ [MIGRAÇÃO] Processando lote ${batchNumber}...`);
            
            const addedInThisBatch = []; 

            try {
                const response = await sock.groupParticipantsUpdate(targetId, batch, 'add');
                
                if (Array.isArray(response)) {
                    response.forEach(res => {
                        if (res.status === '200') {
                            results.success++;
                            addedInThisBatch.push(res.jid); 
                        } else {
                            results.failed++;
                            let reason = res.status;
                            if(res.status === '403') reason = 'Privacidade';
                            if(res.status === '400') reason = 'Inválido';
                            if(res.status === '409') {
                                reason = 'Já no grupo';
                                results.failed--; 
                                results.success++; 
                            }
                            
                            if (res.status !== '409') {
                                results.errors.push(`${res.jid.split('@')[0]} (${reason})`);
                            }
                        }
                    });
                } else {
                    results.success += batch.length;
                    addedInThisBatch.push(...batch);
                }

                if (addedInThisBatch.length > 0) {
                    const text = `*Lote ${batchNumber} Processado*\n` + 
                                 `Foram adicionados ao grupo de destino:\n` +
                                 addedInThisBatch.map(jid => `+${jid.split('@')[0]}`).join(', ');
                    
                    try {
                        await reply(text); 
                    } catch (msgError) {
                        console.error("Erro ao enviar progresso do lote:", msgError);
                    }
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

        let report = `*Relatório Final de Migração*\n\n` +
                     `*Tentativas:* ${participantsToMigrate.length}\n` +
                     `*Sucesso:* ${results.success}\n` +
                     `*Falhas:* ${results.failed}`;

        if (results.errors.length > 0) {
            const errPreview = results.errors.slice(0, 5).join('\n');
            report += `\n\n⚠️ *Principais Falhas:*\n${errPreview}`;
            if(results.errors.length > 5) report += `\n...e mais ${results.errors.length - 5}.`;
        }

        await reply(report);
        return null;

    } catch (error) {
        console.error(`❌ [MIGRAÇÃO] Erro Geral:`, error);
        await reply(`❌ Erro fatal: ${error.message}`);
        return null;
    }
}

module.exports = { handleMigrationCommand };