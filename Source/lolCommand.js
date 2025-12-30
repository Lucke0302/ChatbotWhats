const fetch = require('node-fetch');
require('dotenv').config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;

let lolChampionsMap = null;
let lolVersion = '14.23.1';

const UPDATE_INTERVAL = 1000 * 60 * 60 * 24;

async function init() {
    console.log("🎮 Inicializando módulo League of Legends...");
    
    await updateLoLData().catch(err => console.error("❌ Falha ao iniciar dados do LoL:", err.message));

    setInterval(async () => {
        console.log("⏰ Atualizando versão e campeões do LoL (Rotina Diária)...");
        await updateLoLData().catch(err => console.error("❌ Erro na atualização diária do LoL:", err.message));
    }, UPDATE_INTERVAL);
}

async function updateLoLData() {
    try {
        const versionResp = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        
        if (!versionResp.ok) throw new Error(`LOL_VERSION_ERROR`);
        
        const versions = await versionResp.json();
        lolVersion = versions[0];

        const champUrl = `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/pt_BR/champion.json`;
        const champsResp = await fetch(champUrl);
        
        if (!champsResp.ok) throw new Error(`CHAMPIONS_ERROR`);

        const champsJson = await champsResp.json();
        
        if (!champsJson.data) throw new Error(`LOL_JSON_DATA_ERROR`);

        const newMap = {};
        for (const key in champsJson.data) {
            const champ = champsJson.data[key];
            newMap[champ.key] = champ.name;
        }
        lolChampionsMap = newMap;
        console.log(`✅ Dados do LoL atualizados. Versão: ${lolVersion}`);

    } catch (error) {
        throw error;
    }
}

/**
 * Helper para pegar nome do champ pelo ID
 */
function getChampName(id) {
    return lolChampionsMap ? (lolChampionsMap[id] || `ID: ${id}`) : `ID: ${id}`;
}

/**
 * Lógica principal do comando !lol
 */
async function handleLolCommand(command) {
    // Valida se a API Key existe
    if (!RIOT_API_KEY) throw new Error("KEY_UNAVAILABLE");

    const args = command.trim().split(' ');
    args.shift();
    
    const fullArg = args.join(' ');
    const [gameName, tagLine] = fullArg.split('#');

    if (!gameName || !tagLine) throw new Error("LOL_ARGS_ERROR");

    const region = 'americas';
    const platform = 'br1';

    try {
        // 1. Busca Conta (PUUID)
        const accountResp = await fetch(`https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName.trim())}/${encodeURIComponent(tagLine.trim())}`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        if (!accountResp.ok) {
            if (accountResp.status === 404) throw new Error(`NICKNAME_OR_TAGLINE_WRONG`);
            if (accountResp.status === 403) throw new Error(`KEY_UNAVAILABLE`);
            throw new Error(`Erro API Riot Account: ${accountResp.status}`);
        }

        const accountData = await accountResp.json();
        const puuid = accountData.puuid;

        // 2. Busca Elo/Rank
        const leagueResp = await fetch(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`, {
                headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        if (!leagueResp.ok) throw new Error(`Erro API League: ${leagueResp.status}`);

        const leagueData = await leagueResp.json();

        const soloQueue = leagueData.find(q => q.queueType === 'RANKED_SOLO_5x5');
        const flexQueue = leagueData.find(q => q.queueType === 'RANKED_FLEX_SR');
        
        let rankSolo = "Unranked";
        if (soloQueue) {
            rankSolo = `${soloQueue.tier} ${soloQueue.rank} (${soloQueue.leaguePoints} PDL)`;
        }

        let rankFlex = "Unranked";
        if (flexQueue) {
            rankFlex = `${flexQueue.tier} ${flexQueue.rank} (${flexQueue.leaguePoints} PDL)`;
        }

        // 3. Busca Maestrias
        const masteryResp = await fetch(`https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });
        
        if (!masteryResp.ok) throw new Error(`Erro API Mastery: ${masteryResp.status}`);
        
        const masteryData = await masteryResp.json();

        // 4. Monta a Resposta
        let response = `📊 *ESTATÍSTICAS LOLZINHO*\n\n`;
        response += `👤 *Player:* ${accountData.gameName} #${accountData.tagLine}\n`;
        response += `🏆 *Elo Solo:* ${rankSolo}\n`;
        
        if (soloQueue) {
            const winRate = Math.round((soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100);
            response += `📈 *Winrate:* ${winRate}% (${soloQueue.wins}V / ${soloQueue.losses}D)\n`;
        }
        
        response += `👥 *Elo Flex:* ${rankFlex}\n`;

        if(flexQueue){
            const winRate = Math.round((flexQueue.wins / (flexQueue.wins + flexQueue.losses)) * 100);
            response += `📈 *Winrate:* ${winRate}% (${flexQueue.wins}V / ${flexQueue.losses}D)\n`;
        }

        response += `\n⚔️ *Top 3 Maestrias:*\n`;
        masteryData.forEach((m, i) => {
            const nomeChamp = getChampName(m.championId);
            const pontos = m.championPoints.toLocaleString('pt-BR');
            response += `${i+1}º ${nomeChamp} - Nvl ${m.championLevel} (${pontos} pts)\n`;
        });

        return response;

    } catch (error) {
        throw error;
    }
}

module.exports = { init, handleLolCommand };