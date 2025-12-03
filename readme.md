# 🦖 Bostossauro Bot 
> *"Eu sabo... mas às vezes a RAM acaba."*

Bem-vindo ao repositório oficial do **Bostossauro**, o bot de WhatsApp mais sarcástico, sincero e levemente instável do hemisfério sul. Este projeto nasceu da vontade de automatizar respostas, jogar RPG de mesa via texto e, principalmente, julgar as conversas dos seus grupos com o poder da Inteligência Artificial.

## 🧠 O Que Ele Faz? (Funcionalidades)
O Bostossauro não é apenas um bot, é um estilo de vida. Aqui estão as skills atuais:

- Ele responde qualquer mensagem enviada via DM, utilizando o Gemini para gerar as respostas, buscando as últimas 50 mensagens da conversa para contextualizar.

* **🎲 !d[número] (ex: !d20):** Rola dados para suas sessões de RPG. Se cair 1, ele vai rir da sua cara (tá no código, eu juro).

* **🗣️ !gpt [pergunta]:** O oráculo da sabedoria duvidosa. Conectado ao Google Gemini, ele responde qualquer coisa com a personalidade ácida de um dinossauro cansado.

* **🧠 !lembrar [contexto]:** Uma feature state-of-the-art que usa SQL Injection do bem (mentira, é só um SELECT gerado por IA) para buscar mensagens antigas no banco de dados e lembrar o que o João falou semana passada.

* **📝 !resumo [curto/médio/completo]:** Perdeu 300 mensagens no grupo? O bot lê o histórico, fofoca sobre quem falou mais besteira e resume tudo pra você.

* **😴 Modo Desonline:** Se o bot estiver em manutenção, ele manda uma figurinha do macaco desmaiado pra você não ficar no vácuo.

## 🛠️ Tecnologias (A.K.A. A Gambiarra)
Este projeto é sustentado por fita crepe digital e as seguintes tecnologias:

* **Baileys:** A biblioteca que faz a magia de conectar ao WhatsApp sem precisar de um navegador aberto.
* **Google Gemini AI:** O cérebro por trás do sarcasmo.
* **Node.js:** O motor do caos.
* **PM2:** A ama-seca que reinicia o bot toda vez que ele tropeça nos próprios pés.
* **SQLite:** Um banco de dados leve (porque a nossa VM não aguenta um Postgres) para guardar cada "bom dia" que você mandar.

## ☁️ A Saga da Infraestrutura (Google Cloud)
Este bot roda orgulhosamente em uma **VM Debian 12 no Google Cloud.**

Mas não se engane com o nome chique. Estamos falando de uma máquina guerreira com 1GB de RAM. Isso mesmo. Cada vez que alguém pede um !resumo de 500 mensagens, a ventoinha virtual da Google chora e o Swap entra em ação para evitar que o Linux mate o processo por falta de memória. É uma vida perigosa, mas é a vida que escolhemos.

## 🚀 Como Rodar na Sua Máquina

Quer testar localmente antes de colocar na sua própria batata na nuvem? Consulta o nosso guia detalhado em [INSTALL.md](INSTALL.md)***➡️Soon***.

Resumo rápido:
1.  Clonar o repositório.
2.  `npm install`
3.  Configurar o `.env` com a tua `GEMINI_API_KEY`.
4.  `npm start` e ler o QR Code.

## 🤝 Contribua (Por favor, sério)
Você entende de arquitetura de software? Sabe como evitar que o Node.js consuma 800MB de RAM para somar 2+2? Precisamos de você!

Estamos num processo de "componentização" (tirar tudo do index.js e jogar pro ChatModel.js), mas ainda tem muita função global perdida e try/catch segurando as pontas.

**Ideias para Pull Requests:**

* Melhorar a eficiência de memória (nossa VM agradece).

* Criar novos comandos inúteis mas divertidos.

* Melhorar os prompts da IA para ele ficar ainda mais engraçado.

* Refatorar o código para parecer que foi feito por um sênior.

Sinta-se à vontade para abrir uma Issue ou mandar um PR. Aceitamos qualquer ajuda, *inclusive doações de memória RAM*.

*Feito com ❤️, ☕ e muito console.log*.

## Recados:

🔗**Link para conversar com o bot**: https://wa.me/5513991526878

**IMPORTANTE**: Todas as suas mensagens com o bot são guardadas no banco de dados, **NÃO COMPARTILHE (EM HIPÓTESE ALGUMA)** dados que você não queira que mais ninguém saiba (em teoria só eu vou saber, além de você e o bot). A implementação de *criptografia* é uma ideia para o futuro do sistema. Suas mensagens só são utilizadas para alimentar os prompts para o **Gemini**, fornecendo contexto de conversas para a LLM.
