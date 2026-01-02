const { jidNormalizedUser } = require('@whiskeysockets/baileys');

const BATCH_SIZE = 5;
const DELAY_MS = 5000;

async function migrateMembers(sock, originGroupId, destinationGroupId, exceptions = []) {
    let log = `*INICIANDO MIGRAÇÃO*\n\n`;
    
    try {
        if (!originGroupId.endsWith('@g.us') || !destinationGroupId.endsWith('@g.us')) {
            return "❌ IDs inválidos. Certifique-se de usar IDs de grupo (terminam em @g.us).";
        }

        console.log(`Buscando membros de ${originGroupId}...`);
        const originMetadata = await sock.groupMetadata(originGroupId);
        const participants = originMetadata.participants;

        if (!participants || participants.length === 0) {
            return "❌ O grupo de origem parece estar vazio ou não consegui ler os membros.";
        }

        const botId = jidNormalizedUser(sock.user.id);
        const normalizedExceptions = exceptions.map(id => jidNormalizedUser(id));

        const membersToAdd = participants
            .map(p => jidNormalizedUser(p.id))
            .filter(id => {
                if (id === botId) return false;
                if (normalizedExceptions.includes(id)) return false;
                return true;
            });

        log += `📂 Origem: ${originMetadata.subject}\n`;
        log += `👥 Total na origem: ${participants.length}\n`;
        log += `🎯 Filtrados para adicionar: ${membersToAdd.length}\n`;
        log += `⏳ Tempo estimado: ${Math.ceil((membersToAdd.length / BATCH_SIZE) * (DELAY_MS / 1000))} segundos\n\n`;
        
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < membersToAdd.length; i += BATCH_SIZE) {
            const chunk = membersToAdd.slice(i, i + BATCH_SIZE);
            
            try {
                const response = await sock.groupParticipantsUpdate(
                    destinationGroupId, 
                    chunk, 
                    "add"
                );
                response.forEach(res => {
                    if (res.status === '200' || res.status === '201') {
                        successCount++;
                    } else {
                        failCount++;
                    }
                });

                console.log(`✅ Lote ${Math.ceil((i + 1) / BATCH_SIZE)} processado.`);

                if (i + BATCH_SIZE < membersToAdd.length) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                }

            } catch (err) {
                console.error(`Erro no lote ${i}:`, err);
                log += `⚠️ Erro ao processar lote iniciando em ${i}\n`;
            }
        }

        log += `\n🏁 *MIGRAÇÃO CONCLUÍDA*\n`;
        log += `✅ Adicionados: ${successCount}\n`;
        log += `🔒 Bloqueados (Privacidade): ${failCount}\n`;
        
        return log;

    } catch (error) {
        console.error("Erro fatal na migração:", error);
        return `❌ Erro fatal: ${error.message}`;
    }
}

module.exports = { migrateMembers };