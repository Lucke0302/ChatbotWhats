const helpDictionary = {
    'default': `🦖 *BOSTOSSAURO OS* v7.0 - O Multiverso e a Extinção ☄️

Ô humano, tá perdido ou só quer me alugar?
Eu tô aqui processando bit igual um condenado e você pedindo ajuda... Tá, toma aí o que eu sei fazer (quando não tô fritando):

Pra saber os detalhes de um comando, digita:
👉 *!ajuda (ou !help) [nome_do_comando]* (Ex: _!ajuda pescaria_)

🌐 *O MULTIVERSO (Cross-Save)*
• *!gerartoken* ➝ (No Zap) Gera o código pra espelhar sua conta.
• *!vincular [token]* ➝ (No Discord/Twitch) Puxa seu dinheiro, itens e dinossauros pra outra plataforma!

🔴 *POKÉMON*
• *!poke* ➝ O comando principal para ser um mestre Pokémon.

💸 *ECONOMIA & CASSINO*
• *!cassino* ➝ Aposte seus Bostocoins, jogue na Mega e no Bolão.
• *!pix* ➝ Transfira dinheiro pra quem tá devendo.
• *!trabalhar* ➝ Assine a CLT e ganhe o pão de cada dia.
• *!minhabosta* ➝ Auxílio emergencial pra quem faliu de vez.
• *!vip* ➝ Loja de cotas de IA (Mercado Negro).

🎣 *PESCARIA & AGRONEGÓCIO*
• *!pescar/pesca* ➝ Pra pescar um peixe (se tiver isca). 
• *!pescaria* ➝ Sistema completo de pesca, frota naval e mercado! 
• *!fazenda* ➝ Plantações, colheitas e agronegócio (Beta).

🦖 *JURASSIC BOSTOPARK*
• *!parque* ➝ Administre os dinossauros do grupo, alimente-os e receba a bilheteria diária!

🎨 *MÍDIA & UTILITÁRIOS*
• *!sticker (!s)* ➝ Faço figurinha. Se sua foto for feia, a culpa não é minha.
• *!audio* ➝ Transformo texto em áudio.
• *!pdf* ➝ Converto imagens/docs em PDF.
• *!tradutor* ➝ Traduzo gringo pra português.

📊 *ESTATÍSTICAS & UTILIDADE*
• *!falador* ➝ Ranking de quem não cala a boca hoje.
• *!cotacao* ➝ Pra você converter dinheiro e chorar no banho.
• *!clima* ➝ Eu olho pra janela pra você não precisar levantar.

🧠 *CÉREBRO JURÁSSICO*
• *!gpt* ➝ Pergunte qualquer coisa. Eu sabo muito.
• *!resumo* ➝ Fofoca resumida pra quem tem preguiça de ler.
• *!lembrar* ➝ Eu puxo a capivara do que falaram aqui.
• *!notas* ➝ O que eu anotei sobre sua pessoa (medo).

🎲 *GAMES & RPG*
• *!lol* ➝ Exponho seu elo de papelão e seus mains horrríveis.
• *!d* ➝ Rola dados de RPG.

👮 *AREA RESTRITA*
• *!timeout* ➝ O cantinho do pensamento pros chatos.
• *!cota* ➝ Painel de disjuntores da IA (Admin).`,

    'vip': `💎 *COMANDO: !vip*
O mercado negro do Bostossauro. Se você estourou sua cota diária de respostas inteligentes (!gpt e !resumo), aqui você pode comprar perdão.

*Como usar:*
• *!vip* ➝ Abre o catálogo do mercado negro e vê sua cota atual.
• *!vip comprar [numero]* ➝ Compra um item (Ex: Overclock Cerebral) para diminuir seu uso de IA do dia. Custam uma fortuna, mas o conhecimento não tem preço.`,

'poke': `🎮 *COMANDO: !poke*
O sistema completo de batalha, captura e ginásios!

*Comandos Básicos:*
• *!poke comecar (ou start)* ➝ Escolhe seu inicial.
• *!poke explorar* ➝ Acha um Pokémon selvagem.
• *!poke atacar [1-4]* ➝ Usa um golpe em batalha.
• *!poke capturar* ➝ Joga uma Pokébola.

*Gerenciamento e Time:*
• *!poke perfil* ➝ Vê seus Pokémon, insígnias e dinheiro.
• *!poke mostrar (ou show) [1-6]* ➝ Vê ficha completa (HP, IVs, Nature, Item).
• *!poke pc* ➝ Acessa seus Pokémon guardados na Box.
• *!poke trocar [slot]* ➝ Muda a ordem do time.
• *!poke daycare* ➝ Deixa o Pokémon treinando passivamente na creche.

*Ataques e Itens:*
• *!poke pendentes* ➝ Vê a fila de golpes novos aguardando aprendizado.
• *!poke ensinar [slot] [1-4]* ➝ Substitui um golpe velho por um novo da fila.
• *!poke usar [item] [slot]* ➝ Usa poções ou itens no Pokémon.
• *!poke tm [numero] [slot]* ➝ Ensina um TM da sua mochila.

*Progresso:*
• *!poke ginasio* ➝ Desafia os líderes para ganhar insígnias.`,

    'sticker': `🖼️ *COMANDO: !s (ou !sticker)*
Manda a mídia com a legenda *!s* ou responde a mensagem com *!s*.
Não vem mandar vídeo de 2 horas que eu não sou cinema, hein!

*Modos de destruição (Parâmetros):*
• *!s baixa* ➝ Qualidade Tekpix (4k do paraguai).
• *!s podi* ➝ Destruo a imagem até ela pedir socorro.`,

    'falador': `🗣️ *COMANDO: !falador*
Mostra o TOP 3 das pessoas que mais mandaram mensagem *hoje*.
O contador zera automaticamente quando vira o dia.
Se ninguém falou nada, eu aviso.`,

    'audio': `🗣️ *COMANDO: !audio*
Minha irmã mais nova lê a sua mensagem em voz alta (ou a que você respondeu)

*Como usar:*
!audio [língua (abreviação)] [conteúdo (limite de 200 caracteres, se quiser mais, patrocina o dev)]

*Línguagens suportadas - abreviações:*
Português - pt | Inglês - en | Espanhol - es | Japonês - ja | Francês - fr
Alemão - de | Italiano - it | Russo - ru | Coreano - ko | Chinês - zh`,

    'cotacao': `💸 *COMANDO: !cotacao*
Calculadora de depressão. Vê quanto seu dinheiro não vale nada.

*Como usar:*
!cotacao [origem] [destino] [valor]

*Exemplos:*
• _!cotacao real dolar 10_ (Dá nem pra comprar bala)
• _!cotacao btc real 1_ (Sonho de consumo)
• _!cotacao peso real 1000_ (Troco de pão)`,

    'clima': `🌡️ *COMANDO: !clima*
Eu viro a Maju Coutinho por 5 segundos.

*Como usar:*
• _!clima Santos_ (Clima agora, derretendo ou chovendo)
• _!clima São Paulo amanhã_ (Previsão pra você levar guarda-chuva e esquecer no ônibus)

Se der erro, é culpa de São Pedro ou do servidor que choveu.`,

    'lol': `🎮 *COMANDO: !lol*
Ferramenta oficial de humilhação. Mostra Elo, Winrate e se você é mono.

*Como usar:* !lol [Nick] #[Tag]
*Exemplo:* _!lol Faker #T1_ (Ou seu nick de bronze aí)`,

    'gpt': `🤖 *COMANDO: !gpt*
Usa minha inteligência suprema de predador digital.

*Como usar:* !gpt [pergunta]
*Exemplo:* _!gpt por que o céu é azul?_
*Obs:* Se você gritar (CAPSLOCK), eu não deixo barato. Aqui é reciprocidade, fiote.`,

    'tradutor': `🗣️ *COMANDO: !tradutor*
Eu traduzo porque aparentemente você faltou na aula de inglês do Fisk.

*Como usar:* !tradutor [lingua] [texto]
*Exemplo:* _!tradutor japones bom dia_`,

    'resumo': `📜 *COMANDO: !resumo*
Preguiça de ler 500 mensagens de "bom dia"? Eu leio e te conto o que presta.

*Como usar:*
• _!resumo_ (Padrão, leio as últimas 50 e resumo)
• _!resumo curto_ (Curto e grosso)
• _!resumo completo 100_ (Leio 100 msgs. Haja paciência...)`,

    'cassino': `🎰 *COMANDO: !cassino*
Bem-vindo ao antro da perdição e do capitalismo selvagem!

*Jogos Rápidos:*
1️⃣ *Caça-Níqueis* ➝ \`!cassino [aposta]\` (Prêmios: 1.5x a 20x)
2️⃣ *Cara/Coroa* ➝ \`!cassino [cara/coroa] [aposta]\` (Prêmio: 1.8x)
3️⃣ *Roleta* ➝ \`!cassino roleta [vermelho/preto/verde] [aposta]\` (Verde paga 12x!)

🎟️ *Loterias (Sorteio toda Segunda-feira às 10h):*
4️⃣ *BostoSena (Mega)* ➝ \`!cassino mega [1-100] [aposta]\` 
5️⃣ *Bolão da Rapaziada* ➝ \`!cassino bolao [1-20] [aposta]\` 

📈 *Wall Street Jurássica:*
• \`!investir\` ➝ Aplique seu dinheiro e ganhe rendimentos passivos diários.
• \`!emprestimo\` ➝ Faliu? Pegue dinheiro com o Agiota do bot (ele cobra do seu lucro).
• \`!titulo loja\` ➝ Compre títulos de nobreza para ostentar do lado do seu nome.

📊 *Fofoca Financeira:*
• \`!cassino mega apostadores\` ➝ Lista quem jogou na Mega.
• \`!cassino bolao apostadores\` ➝ Lista quem tá no Bolão.
• \`!cassino saldo\` ➝ Mostra o que sobrou na sua carteira.`,

    'parque': `🦖 *COMANDO: !parque*
O Jurassic BostoPark é um ecossistema cooperativo. Escave, clone e alimente!

*Missões da Temporada:*
🎯 *!parque missoes* ➝ Veja as metas da comunidade para restaurar o lucro da bilheteria!

*Mineração & DNA:*
⛏️ *!escavar* ➝ Explore o Abismo! Um minigame de sobrevivência para achar minérios e Âmbar. Use *!ajuda escavar* para ver o tutorial e as regras de desmoronamento.
🎒 *!parque mochila* ➝ Veja seus minérios escavados.
🤝 *!parque vender [numero/tudo]* ➝ Venda as pedras no mercado negro.

*Zoológico & Estoque comunitário:*
🖼️ *!parque mural* ➝ Veja os dinossauros vivos do grupo (Seus níveis, cores e ID).
🥩 *!parque despensa* ➝ Abre seu inventário para escolher um lanchinho.
🏢 *!parque reserva* ➝ Veja o estoque coletivo de comida do grupo.
🚚 *!parque depositar [ID] [tudo]* ➝ Doe sua comida para a reserva do parque.
🔪 *!parque porcionar [ID] [Kg]* ➝ Fatie peças grandes de carne em pedaços menores.
🍗 *!parque alimentar [ID] [Nº_Comida/reserva]* ➝ Alimente o dinossauro com a sua comida ou com a reserva!
🧬 *!parque perfil* ➝ Veja suas métricas, bônus de ticket injetado no grupo e seus Top 5 clones.

*Híbridos & Guarda:*
🏷️ *!parque nome [ID] [Nome]* ➝ Batize um dinossauro que você descobriu.
👑 *!parque titulo [pai/mae/nazare] [ID]* ➝ Assuma a guarda legal da fera!
🧪 _Híbridos são gerados passivamente se o grupo possuir as matrizes._`,

    'fazenda': `🚜 *COMANDO: !fazenda*
Bem-vindo ao Agronegócio Jurássico! Divida seus suprimentos entre a pesca e a lavoura.

*Ações de Trabalho:*
🌱 *!fazenda plantar [semente]* ➝ Compra e planta (Ex: !fazenda plantar trigo).
💧 *!fazenda regar [canteiro]* ➝ Gasta 1 Suprimento para adiantar o crescimento em 25%.
🌾 *!fazenda colher [canteiro]* ➝ Tenta a colheita. Cuidado com secas ou gafanhotos.

*Gerenciamento:*
🚜 *!fazenda perfil* ➝ Veja todos os canteiros e o tempo de crescimento.
🏪 *!fazenda loja* ➝ Veja o catálogo de sementes e preços.
🎒 *!fazenda despensa* ➝ Veja as toneladas de comida colhidas.
💰 *!fazenda vender [numero/tudo]* ➝ Venda pro Ceasa e ganhe Bostocoins.`,

'escavar': `⛏️ *COMANDO: !escavar (O ABISMO)* ⛏️
Bem-vindo ao minigame de Risco e Recompensa! Quanto mais fundo você for, melhores os minérios, mas se o teto cair, você perde tudo e vai pro hospital.

*Ações na Caverna:*
• *!escavar* ➝ Entra na caverna (Camada 0).
• *!escavar fundo* ➝ Arrisca descer mais fundo (ou cavar pros lados). Aumenta o risco de desmoronar!
• *!escavar guardar* ➝ Foge da caverna e guarda o loot na mochila.

*Gerenciamento da Picareta:*
_Cada turno na caverna gasta 1 de durabilidade. Se chegar a 0, ela fica cega._
• *!escavar loja* ➝ Mostra o catálogo de picaretas e preços.
• *!escavar consertar* ➝ Paga 25% do valor da picareta para restaurar o HP dela.
• *!escavar sucatear* ➝ Quebrou e tá sem dinheiro? Volte para a picareta anterior de graça.
• *!escavar upar* ➝ Forja a próxima picareta usando Bostocoins e Minérios da sua mochila.

⚠️ *DICA DE SOBREVIVÊNCIA:* Se você desmoronar, você perde todo o loot da descida atual, fica de molho no hospital por 1 hora e tem 35% de chance da sua picareta perder todo o HP na hora!`,

    'pix': `💸 *COMANDO: !pix*
O Banco Central do Bostossauro permite agiotagem e doações entre WhatsApp, Twitch e Discord!

*Como usar:* !pix @usuario [valor]
*Exemplo:* _!pix @João 50_`,

    'trabalhar': `💼 *COMANDO: !trabalhar*
Assine a CLT virtual! Agora você tem uma carreira oficial (The Sims style).
Seu salário é fixo e baseado no seu nível profissional.

*Como usar:* !trabalhar
*Cooldown:* 8 horas.`,

    'bico': `🛠️ *COMANDO: !bico*
Precisa de grana rápida? Vá fazer um trampo duvidoso.
Paga entre 15 e 90 Bostocoins dependendo do seu esforço.

*Como usar:* !bico
*Cooldown:* 2 horas.`,

    'minhabosta': `🪙 *COMANDO: !minhabosta*
O famoso "Minha Bosta Minha Vida". Auxílio emergencial do governo jurássico.

*Regras:* Seu saldo precisa ser menor que 50 Bostocoins. Só pode pedir a cada 48 horas.
*Como usar:* !minhabosta`,
    
    'd': `🎲 *COMANDO: !d*
Rola dados de RPG. Se cair 1, a culpa é sua.

*Como usar:* !d[lados]
*Exemplos:*
• _!d20_ (Clássico)
• _!d6_ (Dado de ludo)
• _!d100_ (Exagero)`,

    'lembrar': `🧠 *COMANDO: !lembrar*
Eu busco no banco de dados algo que falaram no passado usando a Inteligência do Gemini para ler o SQL.

*Como usar:* !lembrar [o que você quer buscar]
*Exemplo:* _!lembrar o que o João falou ontem_`,

    'notas': `📝 *COMANDO: !notas*
Mostra o que eu, em minha infinita sabedoria, anotei sobre você na minha memória de longo prazo.`,

    'pdf' : `📙 *Comando: !pdf*
Transforma a imagem/documento que você enviou pra mim em um pdf.

*Como usar:* Envia a imagem/documento com !pdf na mensagem ou responde ela com o !pdf.`,

    'pescaria': `🎣 *COMANDO: !pescaria*
Bem-vindo ao Lago do Bostossauro!
Você regenera 1 isca a cada 2 horas (Máximo 10).

*Ação:*
🎣 *!pescar* (ou !pesca) ➝ Joga a isca na água e tenta a sorte.

*Mercado, Loja & Forja:*
🏪 *!pescaria loja* ➝ Compre Iscas, Buffs ou FORJE UMA VARA MELHOR.
🛍️ *!pescaria comprar [número_ou_vara]* ➝ Compra o item da loja.
⚖️ *!pescaria vender* ➝ Veja o preço dos seus troféus e venda (ex: !pescaria vender 1 2 5).
♻️ *!pescaria vender lixo* ➝ Limpa o oceano reciclando botas e pneus.
📦 *!pescaria vender repetidos* ➝ Vende todas as duplicatas mantendo apenas o seu recorde absoluto de cada espécie.
📊 *!pescaria avaliar* ➝ Calcula a fortuna acumulada no seu isopor.

*Inventário & Ostentação:*
🎒 *!pescaria perfil* ➝ Veja suas iscas, frota, efeitos ativos e seus top 5 peixes.
👑 *!pescaria titulo* ➝ Ostente seu império de peixes e ganhe títulos de nobreza da pesca.

*Competição e Rankings:*
🏆 *!pescaria ranking* ➝ O Top 10 de quem mais pescou (em Kg) na vida.
🦈 *!pescaria trofeus* ➝ O Mural do Grupo: Os 10 peixes mais pesados pescados nesse chat.
🌍 *!pescaria topgrupo* ➝ A elite do grupo: Peixes mais perfeitos por raridade.
🏅 *!pescaria toppessoal* ➝ Seus troféus absolutos por raridade.`,

    'admin': `🔌 *COMANDOS RESTRITOS (Só Admin)*
As chaves do servidor.

• *!cota listar / exaurir [N]* ➝ Manipula a cota de uso das LLMs.
• *!timeout @usuario [minutos]* ➝ Silencia um bagunceiro no banco de dados.
• *!link [ID] / !unlink* ➝ Conecta/desconecta as redes interdimensionais.
• *!parque meteoro [ID_GRUPO]* ➝ Aciona a 7ª Extinção em Massa. Mata todos os dinos e manda eles pro Céu dos Dinos.`
};

function getHelp(args) {
    const command = args ? args.trim().toLowerCase().replace('!', '') : 'default';

    if (helpDictionary[command]) {
        return helpDictionary[command];
    } else {
        return `❌ *Que comando é esse, doido?* \nNunca nem vi *${command}*. O dev deve ter esquecido de programar ou você inventou isso agora.\n\nDigita só *!ajuda* pra ver o menu.`;
    }
}

module.exports = { getHelp };