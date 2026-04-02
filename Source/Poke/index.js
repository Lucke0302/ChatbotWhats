const { handleBotError } = require('../errorHandler');
// const Database = require('./database'); 
// const BattleEngine = require('./battleEngine');
// const PlayerController = require('./playerController');

class PokeRouter {
    constructor(dbConnection) {
        // this.db = new Database(dbConnection);
        // this.player = new PlayerController(this.db);
        // this.battle = new BattleEngine(this.db);
    }

    async handleCommand(from, sender, command, sock, mentions, replyFunction) {
        const args = command.trim().split(/\s+/);
        const action = args[1] ? args[1].toLowerCase() : 'ajuda';
        const param = args.slice(2).join(' ');

        const errorContext = {
            command: `!poke2 ${action}`,
            sender: sender,
            from: from
        };

        try {
            // Roteamento puro. Nenhuma regra de negócio fica aqui.
            switch (action) {
                // --- INÍCIO E PERFIL ---
                case 'comecar':
                case 'start':
                case 'escolher':
                    // await this.player.handleStarter(sender, param, replyFunction);
                    throw new Error("POKE_WIP_ROUTE"); 

                case 'perfil':
                case 'time':
                case 'mostrar':
                    // await this.player.getProfileDetails(sender, action, param, sock, from, replyFunction);
                    throw new Error("POKE_WIP_ROUTE");

                // --- COMBATE ---
                case 'explorar':
                case 'hunt':
                case 'ginasio':
                case 'gym':
                    // await this.battle.spawnEncounter(from, sender, action, sock, replyFunction);
                    throw new Error("POKE_WIP_ROUTE");

                case 'atacar':
                case 'capturar':
                case 'fugir':
                    // Exemplo de validação prévia que joga o erro pro Middleware
                    if (action === 'atacar' && param && isNaN(parseInt(param))) {
                        throw new Error("NOT_A_NUMBER");
                    }
                    // await this.battle.processTurn(from, sender, action, param, sock, replyFunction);
                    throw new Error("POKE_WIP_ROUTE");

                // --- SISTEMAS EXTRAS ---
                case 'pc':
                case 'box':
                case 'trocar':
                case 'switch':
                    // await this.player.manageTeam(sender, action, param, replyFunction);
                    throw new Error("POKE_WIP_ROUTE");

                case 'curar':
                case 'heal':
                    // await this.player.healTeam(sender, replyFunction);
                    throw new Error("POKE_WIP_ROUTE");

                case 'ajuda':
                case 'help':
                    await replyFunction(this.getBetaHelpMenu());
                    break;
                
                default:
                    throw new Error("INVALID_COMMAND");
            }
        } catch (error) {
            await handleBotError(error, replyFunction, errorContext);
        }
    }

    getBetaHelpMenu() {
        return `🧪 *LABORATÓRIO POKÉMON V2* 🧪\n\n` +
               `Bem-vindo ao ambiente de testes da nova engine de combate!\n` +
               `Nenhuma funcionalidade foi implementada ainda, mas o sistema de erros já está monitorando tudo.`;
    }
}

module.exports = PokeRouter;