const helpDictionary = {
    'default': `🦖 *BOSTOSSAURO OS* v3.1 - O Retorno 🦖

Ô humano, tá perdido ou só quer me alugar?
Eu tô aqui processando bit igual um condenado e você pedindo ajuda... Tá, toma aí o que eu sei fazer (quando não tô fritando):

Pra saber os detalhes de um comando, digita:
👉 *!ajuda (ou !help) [nome_do_comando]* (Ex: _!ajuda sticker_)

🎨 *MÍDIA & UTILITÁRIOS*
• *!sticker (!s)* ➝ Faço figurinha. Se sua foto for feia, a culpa não é minha.
• *!audio* ➝ Transformo texto em áudio (Google).
• *!pdf* ➝ Converto imagens/docs em PDF.
• *!tradutor* ➝ Traduzo gringo pra português (ou o contrário).

📊 *ESTATÍSTICAS*
• *!falador* ➝ Ranking de quem não cala a boca hoje.

🎲 *JOGATINA*
• *!d* ➝ Dado. Pra ver se você tem sorte no jogo (já que no amor tá difícil).

📙 *ÚTIL*
• *!pdf* ➝ Converto suas imagens e documentos em pdf.
• *!menu* ➝ Listo todos os meus comandos.
• *!ajuda (ou !help)* ➝ Explico cada comando.

💸 *CRISE FINANCEIRA*
• *!cotacao* ➝ Pra você converter dinheiro e chorar no banho.

🌪️ *PREVISÃO DO CAOS*
• *!clima* ➝ Eu olho pra janela pra você não precisar levantar.

🧠 *CÉREBRO JURÁSSICO*
• *!gpt* ➝ Pergunte qualquer coisa. Eu sabo muito.
• *!resumo* ➝ Fofoca resumida pra quem tem preguiça de ler.
• *!lembrar* ➝ Eu puxo a capivara do que falaram aqui.
• *!notas* ➝ O que eu anotei sobre sua pessoa (medo).

🎮 *GAMES*
• *!lol* ➝ Exponho seu elo de papelão e seus mains horrríveis em praça pública.

👮 *AREA RESTRITA*
• *!timeout* ➝ O cantinho do pensamento pros chatos.`,

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
Português - pt
Inglês - en
Espanhol - es
Japonês - ja
Francês - fr
Alemão - de
Italiano - it
Russo - ru
Coreano - ko
Chinês - zh`,

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
    
    'd': `🎲 *COMANDO: !d*
Rola dados de RPG. Se cair 1, a culpa é sua.

*Como usar:* !d[lados]
*Exemplos:*
• _!d20_ (Clássico)
• _!d6_ (Dado de ludo)
• _!d100_ (Exagero)`,

    'lembrar': `🧠 *COMANDO: !lembrar*
Eu tenho memória de elefante... digo, de T-Rex.
Eu busco no banco de dados algo que falaram no passado.

*Como usar:* !lembrar [o que você quer buscar]
*Exemplo:* _!lembrar o que o João falou ontem_`,

    'notas': `📝 *COMANDO: !notas*
Mostra o que eu, em minha infinita sabedoria, anotei sobre você.
Se tiver escrito que você é chato, não reclama.`,

    'pdf' : `📙 *Comando: !pdf*
Transforma a imagem/documento que você enviou pra mim em um pdf.

*Como usar:* Envia a imagem/documento com !pdf na mensagem ou 
responde ela com o !pdf.
`,

    'timeout': `🚫 *COMANDO: !timeout* (Só Admin)
Manda o engraçadinho ficar pianinho por um tempo.

*Como usar:* !timeout @usuario [minutos]
*Efeito:* O sujeito toma um silêncio global e não consegue usar meus comandos. Paz reinando.`
};

/**
 * Busca a ajuda correspondente no dicionário
 * @param {string} args - O argumento enviado após !ajuda (ex: "sticker")
 */
function getHelp(args) {
    const command = args ? args.trim().toLowerCase().replace('!', '') : 'default';

    if (helpDictionary[command]) {
        return helpDictionary[command];
    } else {
        return `❌ *Que comando é esse, doido?* \nNunca nem vi *${command}*. O dev deve ter esquecido de programar ou você inventou isso agora.\n\nDigita só *!ajuda* pra ver o menu.`;
    }
}

module.exports = { getHelp };