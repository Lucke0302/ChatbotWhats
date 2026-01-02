const { jidNormalizedUser } = require('@whiskeysockets/baileys');

const BATCH_SIZE = 5; 
const DELAY_MS = 5000; 

async function migrateMembers(sock, originGroupId, destinationGroupId, exceptions = []) {
    let log = `🚀 *MIGRAÇÃO INICIADA*\n\n`;
    
    try {
        if (!originGroupId || !originGroupId.endsWith('@g.us')) {
            return `❌ ID de Origem inválido: "${originGroupId}".\nTem que terminar com @g.us`;
        }
        if (!destinationGroupId || !destinationGroupId.endsWith('@g.us')) {
            return `❌ ID de Destino inválido: "${destinationGroupId}".\nTem que terminar com @g.us`;
        }

        try {
            console.log(`🔍 [DEBUG] Verificando permissões no grupo: ${destinationGroupId}`);
            
            const destMetadata = await sock.groupMetadata(destinationGroupId);
            
            const botId = jidNormalizedUser(sock.user.id);
            console.log(`🤖 [DEBUG] ID do Bot: ${botId}`);

            const botMember = destMetadata.participants.find(p => jidNormalizedUser(p.id) === botId);
            
            console.log(`📋 [DEBUG] Status do Bot no grupo:`, botMember);

            if (!botMember) {
                return `❌ CRÍTICO: O Bot não consta na lista de participantes desse grupo! (Cache desatualizado?)`;
            }

            if (!botMember.admin) {
                return `❌ O Bot vê que está no grupo, mas o cargo dele é: ${botMember.admin} (Deveria ser 'admin').\n\n💡 SOLUÇÃO: Remova o admin do bot e dê novamente.`;
            }
            
            console.log(`✅ [DEBUG] O Bot é admin! Prosseguindo...`);

        } catch (e) {
            console.error("Erro no debug de admin:", e);
            return `❌ Erro ao ler grupo de destino. Verifique o ID: ${e.message}`;
        }

        console.log(`[Migração] Lendo origem: ${originGroupId}`);
        const originMetadata = await sock.groupMetadata(originGroupId);
        const participants = originMetadata.participants;

        if (!participants || participants.length === 0) {
            return "❌ O grupo de origem está vazio.";
        }

        const botId = jidNormalizedUser(sock.user.id);
        const normalizedExceptions = exceptions.map(id => id.replace(/[^0-9]/g, '') + '@s.whatsapp.net');

        const membersToAdd = participants
            .map(p => jidNormalizedUser(p.id)) 
            .filter(id => {
                if (!id || !id.includes('@s.whatsapp.net')) return false;
                if (id === botId) return false;
                if (normalizedExceptions.includes(id)) return false;
                return true;
            });

        log += `📂 *De:* ${originMetadata.subject}\n`;
        log += `🎯 *Para:* ${destinationGroupId}\n`;
        log += `👥 *Membros Filtrados:* ${membersToAdd.length}\n\n`;
        console.log(log);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < membersToAdd.length; i += BATCH_SIZE) {
            const chunk = membersToAdd.slice(i, i + BATCH_SIZE);
            
            console.log(`➡️ Processando Lote ${Math.ceil((i+1)/BATCH_SIZE)}:`, chunk);

            try {
                const response = await sock.groupParticipantsUpdate(
                    destinationGroupId, 
                    chunk, 
                    "add"
                );
                
                if (response && Array.isArray(response)) {
                    response.forEach(res => {
                        if (res.status === '200' || res.status === '201') successCount++;
                        else failCount++;
                    });
                } else {
                    successCount += chunk.length;
                }

                if (i + BATCH_SIZE < membersToAdd.length) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                }

            } catch (err) {
                console.error(`❌ ERRO FATAL NO LOTE ${i}:`, err.message);
                if (err.message && err.message.includes('bad-request')) {
                    log += `⚠️ Lote falhou (Bad Request). Verifique se os usuários existem.\n`;
                }
                failCount += chunk.length;
            }
        }

        return `🏁 *MIGRAÇÃO FINALIZADA*\n✅ Adicionados: ${successCount}\n❌ Falhas: ${failCount}`;

    } catch (error) {
        console.error("Erro geral:", error);
        return `❌ Erro crítico: ${error.message}`;
    }
}

module.exports = { migrateMembers };