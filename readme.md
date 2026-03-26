# 🦖 Bostossauro Bot 
> *"Eu sabo... mas às vezes a RAM acaba."*

Bem-vindo ao repositório oficial do **Bostossauro**, o bot de WhatsApp mais sarcástico, sincero e levemente instável do hemisfério sul. Este projeto nasceu da vontade de automatizar respostas, jogar RPG de mesa via texto e, principalmente, julgar as conversas dos seus grupos com o poder da Inteligência Artificial.

## 🧠 O Que Ele Faz? (Funcionalidades)
O Bostossauro não é apenas um bot, é um estilo de vida. Aqui estão as skills atuais:

* **✉️ Conversa Contextual:** Ele responde qualquer mensagem (especialmente no privado) usando o Gemini, lembrando das últimas mensagens para não parecer um peixinho dourado.

* **🎲 !d[número] (ex: !d20):** Rola dados para suas sessões de RPG. Se cair 1, ele vai rir da sua cara (tá no código, eu juro).

* **🗣️ !gpt [pergunta]:** O oráculo da sabedoria duvidosa. Conectado ao Google Gemini, ele responde qualquer coisa com a personalidade ácida de um dinossauro cansado.

* **🧠 !lembrar [contexto]:** Uma feature state-of-the-art que usa SQL Injection do bem (mentira, é só um SELECT gerado por IA) para buscar mensagens antigas no banco de dados e lembrar o que o João falou semana passada.

* **🎮 !lol [Nick #Tag]:** Integração direta com a API da Riot Games pra humilhar o seu elo publicamente. Mostra ranking (Solo/Flex), winrate e suas maestrias. Ex: `!lol Faker #T1`.

* **🧐 !resenha:** O Tribunal oficial da zueira. A IA julga o contexto da conversa e decide se rolou uma "Resenha Confirmada", "Moderada" ou se foi "Cancelada".

* **📝 !resumo [curto/médio/completo]:** Perdeu 200 mensagens no grupo? O bot lê o histórico, fofoca sobre quem falou mais besteira e resume tudo pra você.

* **🖼️ !s (ou !sticker):** Faz figurinhas estáticas. Tem suporte a parâmetros de "qualidade" para os amantes de shitpost:
    * `!s`: Qualidade normal.
    * `!s baixa`: Qualidade duvidosa.
    * `!s podi`: Modo *deep fried*, destrói a imagem até virar arte abstrata.

* **💸 Sistema Econômico Completo (Capitalismo Selvagem):** Uma economia viva rodando no banco de dados com a moeda oficial *Bostocoins*.
    * `!pix @amigo [valor]`: Transferência instantânea entre membros do grupo.
    * `!trabalhar`: Sistema de CLT virtual com trabalhos gerados procedimentalmente (e cooldown de 12 horas).
    * `!minhabosta`: O programa social "Minha Bosta, Minha Vida". Se você quebrou (saldo < 50), o governo te dá um auxílio.
    * `!investir (Bolsa Jurássica)`: Aplique fundos em empresas como "McBostossauro" e "OnlySaurs". Conta com sistema de juros compostos e tributação em faixas para quem tem muito dinheiro.
    * `!emprestimo (Agiota)`: Pegue empréstimos predatórios. O bot retém 30% de todo lucro futuro (pesca, trabalho) direto na fonte até abater a dívida.
    * `!titulo`: Cartório de ostentação para comprar a tag de "Faria Limer" ou "Agiota" ao lado do seu nome.

* **🎰 Cassino do Bostossauro:** Pra onde vai todo o dinheiro do grupo.
    * **Jogos Rápidos:** Slots (`!cassino [valor]`), Cara ou Coroa (`!cassino cara/coroa [valor]`) e Roleta (`!cassino roleta vermelho [valor]`).
    * **🎟️ Loterias Semanais (Toda Segunda às 10h):**
        * **MegaBosta:** Adivinhe de 1 a 100. Paga 100x a aposta e acumula o multiplicador a cada semana sem vencedores.
        * **Bolão da Rapaziada:** Jogo colaborativo de 1 a 20. O vencedor leva o pote total com todas as apostas somadas. 
    * **Eventos Agendados:** O bot recompensa automaticamente o "Top 1 Falador" (total de msgs x 2) e o "Patrocínio do Ódio" (xingamentos x 10) na rotina matinal.

* **🎣 Pescaria Jurássica:** Um sistema completo de pesca e gerenciamento de stamina.
    * `!pescar`: Tente a sorte no lago. O peso e a raridade variam por RNG. 
    * `!pescaria loja`: Compre consumíveis (Ímãs, Repelentes) ou invista para FORJAR VARAS MELHORES (Fibra, Carbono, Adamantium) que multiplicam o peso dos peixes permanentemente.
    * `!pescaria vender`: Capitalismo brutal aplicado. Venda seus troféus para gerar Bostocoins com o multiplicador do Agiota comendo parte da grana.

* **🔴 Sistema Pokémon Integrado:** Batalha RPG em turnos via chat com captura e ginásios.
    * Possui sistema de fila de golpes (JSON) para gerenciar ataques aprendidos em level up múltiplo (`!poke pendentes` e `!poke ensinar`).
    * Gerenciamento de Daycare passivo, Box de PC, inventário de TMs/Itens e Natures.

* **🔌 Sistema de Cotas Persistente (SQLite):** Implementamos um controle de uso diário por modelo de IA (Gemini Flash, Flash-Lite, Gemma). Diferente de outras arquiteturas falhas, o Bostossauro salva os hits da API direto no SQLite, então mesmo que o PM2 reinicie ou falhe, ele nunca esquece que a cota do dia já foi pro espaço. Conta com o comando de disjuntor `!cota exaurir` para forçar testes de fallback.

* **😴 Modo Desonline:** Se o bot estiver em manutenção, ele manda uma figurinha do macaco desmaiado pra você não ficar no vácuo.

* **🐘 Memória de Longo Prazo:** Agora o bot "anota" fatos sobre você (nome, gostos, profissão) no banco de dados para personalizar as respostas futuras. Cuidado com o que fala.

* **🚫 !timeout @usuario [minutos]:** (Admin Only) O martelo do ban. Silencia o usuário chato por X minutos. Se tentar falar, toma gap.

* **💸 Sistema de Cotas:** Implementamos um controle de uso diário por usuário e rotação de modelos de IA (Gemini Flash, Flash-Lite, Gemma), porque a API é de graça mas tem limite e a gente não quer pagar.

## 🛠️ Tecnologias (A.K.A. A Gambiarra)
Este projeto é sustentado por fita crepe digital e as seguintes tecnologias:

* **Baileys:** A biblioteca que faz a magia de conectar ao WhatsApp sem precisar de um navegador aberto.
* **Google Gemini AI:** O cérebro por trás do sarcasmo.
* **Riot Games API:** Para buscar dados do LoL (e passar raiva com a autenticação).
* **Sharp:** Para processamento de imagem e criação de stickers crocantes.
* **Node.js:** O motor do caos.
* **PM2:** A ama-seca que reinicia o bot toda vez que ele tropeça nos próprios pés.
* **SQLite:** Um banco de dados leve (porque a nossa VM não aguenta um Postgres) para guardar cada "bom dia" que você mandar.

## ☁️ A Saga da Infraestrutura (Google Cloud)
Este bot roda orgulhosamente em uma **VM Debian 12 no Google Cloud.**

Mas não se engane com o nome chique. Estamos falando de uma máquina guerreira com 1GB de RAM. Isso mesmo. Cada vez que alguém pede um !resumo de 200 mensagens, a ventoinha virtual da Google chora e o Swap entra em ação para evitar que o Linux mate o processo por falta de memória. É uma vida perigosa, mas é a vida que escolhemos.

## 🚀 Como Rodar na Sua Máquina

Quer testar localmente antes de colocar na sua própria batata na nuvem? Consulta o nosso guia detalhado em [INSTALL.md](INSTALL.md).

Resumo rápido:
1.  Clonar o repositório.
2.  `npm install`
3.  Configurar o `.env` com a tua `GEMINI_API_KEY` e, opcionalmente, a `RIOT_API_KEY` (se quiser que o comando !lol funcione).
4.  `npm start` e ler o QR Code.

## 🤝 Contribua (Por favor, sério)
Você entende de arquitetura de software? Sabe como evitar que o Node.js consuma 800MB de RAM para somar 2+2? Precisamos de você!

A Google passou a faca na nossa VM e provou ser mercenária, então agora o Bostossauro vive de favor nas instâncias da Oracle Cloud. Nossa arquitetura melhorou muito com a separação dos comandos (obrigado, `chatModel.js`), mas toda ajuda é bem-vinda.

**Ideias para Pull Requests:**

* Melhorar a eficiência de memória (nossa VM da Oracle agradece).

* Criar novos comandos inúteis, mas divertidos.

* Refinar os prompts da IA para o tribunal da resenha ficar ainda mais assertivo.

Sinta-se à vontade para abrir uma Issue ou mandar um PR. Aceitamos qualquer ajuda, *inclusive doações de memória RAM*.

*Feito com ❤️, ☕ e muito console.log*.

## Recados:

🔗**Link para conversar com o bot**: https://wa.me/5513991526878

**IMPORTANTE**: Todas as suas mensagens com o bot são guardadas no banco de dados, **NÃO COMPARTILHE (EM HIPÓTESE ALGUMA)** dados que você não queira que mais ninguém saiba (em teoria só eu vou saber, além de você e o bot). A implementação de *criptografia* é uma ideia para o futuro do sistema. Suas mensagens só são utilizadas para alimentar os prompts para o **Gemini**, fornecendo contexto de conversas para a LLM.
