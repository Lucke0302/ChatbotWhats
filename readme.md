# 🦖 Bostossauro Bot v7.1 - O Relógio Suíço em vez de Bomba Relógio 💣
> *"A vida não encontrou um meio. Eu encontrei."*

Bem-vindo ao repositório oficial do **Bostossauro**, o bot de WhatsApp (e agora Twitch e Discord) mais sarcástico, sincero e levemente instável do hemisfério sul. Este projeto nasceu da vontade de automatizar respostas, jogar RPG de mesa via texto e, principalmente, julgar as conversas dos seus grupos com o poder da Inteligência Artificial.

## 🌐 Novidade da v7.0: O Multiverso (Cross-Save)
O Bostossauro quebrou a barreira das plataformas! Através de uma arquitetura Adapter, o cérebro central (`chatModel.js`) agora conversa nativamente com o WhatsApp, **Discord** e **Twitch**. 
Com o comando `!gerartoken` no WhatsApp e `!vincular` nas outras redes, os usuários unificam suas contas. Se você ganha 500 Bostocoins no Discord, você gasta eles no WhatsApp. É a hegemonia da InGen em todas as telas!

## 🧠 O Que Ele Faz? (Funcionalidades)
O Bostossauro não é apenas um bot, é um estilo de vida. Aqui estão as skills atuais:

* **⏳ Sistema de Temporadas (Wipe Quinzenal):** A cada ciclo, a economia entra em colapso. O dinheiro, os barcos e as fazendas resetam, mas os jogadores ganham "Heranças" (buffs passivos e cashback) baseadas no progresso que tiveram na season anterior!

* **🎯 Missões da Comunidade:** O lucro da bilheteria do Jurassic Park diminui após o Wipe. O grupo inteiro precisa cooperar (pescando, plantando, gastando no cassino e comprando upgrades) para encher a barra de progresso global e restaurar a receita de todos!

* **✉️ Conversa Contextual:** Ele responde qualquer mensagem (especialmente no privado) usando o Gemini, lembrando das últimas mensagens para não parecer um peixinho dourado.

* **🎲 !d[número] (ex: !d20):** Rola dados para suas sessões de RPG. Se cair 1, ele vai rir da sua cara (tá no código, eu juro).

* **🗣️ !gpt [pergunta]:** O oráculo da sabedoria duvidosa. Conectado ao Google Gemini, ele responde qualquer coisa com a personalidade ácida de um dinossauro cansado.

* **🧠 !lembrar [contexto]:** Uma feature state-of-the-art onde a IA escreve um SELECT pra buscar mensagens antigas no banco e lembrar o que o João falou semana passada. Antigamente ela escrevia qualquer coisa e executava sem perguntar; hoje existe um cinturão de segurança em volta dela (se a IA tentar `UNION`, `DROP`, `PRAGMA` ou inventar de ler `usuarios_web`, o bot responde `DANGEROUS_SQL` e vai embora). SQL Injection do bem, agora com coleira antitumulto.

* **🎮 !lol [Nick #Tag]:** Integração direta com a API da Riot Games pra humilhar o seu elo publicamente. Mostra ranking (Solo/Flex), winrate e suas maestrias. Ex: `!lol Faker #T1`.

* **🧐 !resenha:** O Tribunal oficial da zueira. A IA julga o contexto da conversa e decide se rolou uma "Resenha Confirmada", "Moderada" ou se foi "Cancelada".

* **📝 !resumo [curto/médio/completo]:** Perdeu 200 mensagens no grupo? O bot lê o histórico, fofoca sobre quem falou mais besteira e resume tudo pra você.

* **🖼️ !s (ou !sticker):** Faz figurinhas estáticas. Tem suporte a parâmetros de "qualidade" para os amantes de shitpost:
    * `!s`: Qualidade normal.
    * `!s baixa`: Qualidade duvidosa.
    * `!s podi`: Modo *deep fried*, destrói a imagem até virar arte abstrata.

* **🦕 BlueSky Integrado (O Cérebro Julgador):** O Bot avalia suas conversas em background. Se a burrice (ou genialidade) for alta o suficiente, ele aciona o `BlueskyBrain`, formata um Tweet raivoso e publica sozinho na rede social. Conta com sistema de resiliência e retentativas limitadas a **3 tentativas** (antes ele insistia para sempre em loop enquanto a rede social ardia, segurando a promise na RAM como um rancor).

* **🦖 Jurassic BostoPark (v5.1 - A Ameaça Híbrida):** Um ecossistema massivo de "Tamagotchi Comunitário" interligado à economia.
    * `!escavar`: Divide a estamina com o bico. Minere pedras preciosas ou ache Âmbar com DNA!
    * `!parque alimentar`: Os dinossauros agora se alimentam dos peixes do seu isopor (`!parque despensa`). Possuem fase de crescimento (Filhote a Ancião) e geram **Bilheteria Diária** dividida com os membros ativos!
    * **🧬 Laboratório de Híbridos (Endgame):** Se o grupo reunir os DNAs corretos (Ex: T-Rex + Velociraptor), o bot sintetiza passivamente aberrações como o **Indominus Rex** e o temido **Bostossauro**, pagando royalties aos criadores originais!
    * **👑 Cartório Genético:** Use `!parque titulo pai t_rex` para ostentar a guarda da fera no seu nome global.
    * **🤖 Despertar do Rei:** Se o grupo sintetizar o Supremo Bostossauro, a IA acorda e tem 0.2% de chance de interromper organicamente as conversas do WhatsApp (usando o Gemma 3 27B) para dar pitacos ou reclamar de fome.
    * **☄️ O Meteoro (Soft-Delete):** Administradores podem acionar a Sétima Extinção. Os dinossauros não são apagados, eles são enviados para o "Céu dos Dinos" no banco de dados como fósseis eternos de antigas eras.

* **💸 Sistema Econômico Completo (Capitalismo Selvagem):** Uma economia viva rodando no banco de dados com a moeda oficial *Bostocoins*.
    * `!pix @amigo [valor]`: Transferência instantânea entre membros do grupo.
    * `!trabalhar`: Sistema de Carreira (The Sims style). Você tem uma profissão fixa (nível 1 a 5) que rende um salário tabelado a cada 8 horas. Em breve contará com sistema de `!estudar` para promoções.
    * `!bico`: Precisa de dinheiro rápido? Faça bicos aleatórios e duvidosos (gerados procedimentalmente) a cada 2 horas para faturar entre 15 e 90 Bostocoins.
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

* **🎣 Pescaria Jurássica (v4.3 - O Sindicato dos Pescadores):** Um sistema completo de pesca, gerenciamento de stamina e colecionismo de troféus.
    * `!pescar`: Tente a sorte no lago. O peso e a raridade variam por RNG. Agora com peixes Míticos (0.5%) e Secretos (0.1%) para os mais viciados.
    * `!pescaria loja`: Compre consumíveis (Ímãs, Repelentes) ou invista para FORJAR VARAS MELHORES (Fibra, Carbono, Grafeno, Adamantium) que multiplicam o peso dos peixes permanentemente e servem como itens de colecionador.
    * `!pescaria vender`: Capitalismo brutal aplicado. Venda seus troféus para gerar Bostocoins. Suporta venda em lote (`!pescaria vender 1 2 5`) e coleta seletiva (`!pescaria vender lixo`) para reciclar sucata automaticamente.
    * `!pescaria avaliar`: Calcula o valor total do seu patrimônio de peixes retidos no isopor.
    * `!pescaria titulo`: Sistema de conquistas integrado à economia global. Acumule riquezas no isopor ou forje a Vara de Adamantium para ganhar títulos exclusivos como "Mestre Pescador" e "Wolverine dos Mares".
    * `Múltiplos Rankings`: Competição tóxica alimentada por `!pescaria ranking`, `trofeus`, `toppessoal` e `topgrupo`.

* **🚜 BostoFazenda (Beta / MVP):** O Agronegócio chegou ao parque!
    * Compartilha a mesma barra de **"Suprimentos"** (energia) com a pescaria. Você escolhe se gasta pescando ou regando.
    * `!fazenda plantar`: Plante sementes com diferentes tempos de crescimento e saturação de XP (Trigo, Cenoura, Abóbora, Melancia).
    * `!fazenda regar`: Gaste 1 Suprimento para acelerar o tempo de crescimento da planta em 25%.
    * `!fazenda colher`: Sistema de risco (RNG). A colheita pode ser perfeita, sofrer uma seca (-50%) ou ser devastada por gafanhotos (perda total).
    * Alimente os herbívoros do parque com toneladas de vegetais transferindo sua safra para a Câmara Frigorífica da InGen!

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
* **SQLite:** Um banco de dados leve (porque a nossa VM não aguenta um Postgres) para guardar cada "bom dia" que você mandar. Roda em modo **WAL** com `busy_timeout` e índices cirúrgicos, que é o jeito chique de dizer que o dashboard, a Twitch e o bot conseguem ler enquanto ele escreve — sem `SQLITE_BUSY` e sem drama.
* **`dbHelper.js`:** A blindagem financeira do banco. Transações `BEGIN IMMEDIATE` → `COMMIT`/`ROLLBACK` com mutex em memória, débitos condicionais (`WHERE bostocoins >= ?`) e escrita atômica em blobs JSON via `json_set`/`json_insert`/`json_remove`. É o motivo pelo qual o Pix não clona dinheiro mais.
* **`globalState.js`:** A única fonte de verdade do `sock`/`chatbot` vivos. Twitch e Discord consomem por getter em tempo de execução, então nunca mais ficaram gritando num socket zumbi depois de uma queda do Baileys.
* **node-schedule:** O gerente de plantão dos jobs Singleton (Bom Dia, retenção de dados e varredura de memória), que agora são agendados **uma vez por processo** e sobrevivem às reconexões.

## ☁️ A Saga da Infraestrutura (A.K.A. "A Era de Ouro da Estabilidade")
Este bot roda orgulhosamente em uma **VM Debian 12 na Oracle Cloud.**

Mas não se engane com o nome chique. Estamos falando de uma máquina guerreira com 1GB de RAM. Isso mesmo. Cada vez que alguém pede um !resumo de 200 mensagens, a ventoinha virtual da Google chora e o Swap entra em ação para evitar que o Linux mate o processo por falta de memória. É uma vida perigosa, mas é a vida que escolhemos.

### ☄️ A Mega Auditoria de Segurança e Performance (Fases 1 a 5)
Por muito tempo o Bostossauro foi o que os engenheiros chamam de *bomba-relógio com bom humor*: cada soluço do Baileys reconstruía o mundo inteiro (banco, servidor web, cron, timers da Riot) e deixava os cacos na RAM. Depois de cinco fases de auditoria, ele virou um relógio suíço com dentes de dinossauro.

#### 🔁 Fase 1 - O Fim dos Clones (Ciclo de Vida do Runtime)
* **1 SQLite por processo:** o banco era reaberto a cada queda do WhatsApp, deixando handles zumbis e descritores de arquivo pendurados. Agora existe guard (`isDbInitialized`) e a conexão é única.
* **1 Express, 1 Socket.io, 1 `setInterval`:** o servidor web e o loop do dashboard de 3 segundos eram recriados a cada queda e nunca morriam (a closure do timer segurava o servidor inteiro). Agora tudo nasce sob guard (`isWebInitialized`) e as rotas falam com o `sock`/`chatbot` **vivos** via `globalState.js`.
* **1 cron de Bom Dia:** o job das 10h era reagendado a cada reconexão — o que, na prática, significava bom dia, loteria e prêmios pagos em duplicidade. Agora é Singleton (`isCronInitialized`).
* **Socket zumbi encerrado:** `removeAllListeners()` + `sock.end()` antes de reconectar, em `try/catch` (o socket já pode estar morto).
* **Semáforo de mídia:** no máximo **2** processamentos simultâneos de `sharp`/`ffmpeg`/sticker, com os buffers anulados no `finally`. Adeus, OOM Killer.

#### 💰 Fase 2/3 - A Economia Parou de Clonar Dinheiro (ACID)
* **Fim do Double-Spend:** o padrão "lê no JS → valida → grava" foi abolido. `debitarSaldo` faz `UPDATE ... SET bostocoins = bostocoins - ? WHERE id_usuario = ? AND bostocoins >= ?` e exige `changes === 1` para continuar.
* **Transações de verdade:** Pix, apostas (slots, cara/coroa, roleta, MegaBosta, bolão), vendas de peixe e de safra, compras de vara/barco/canteiro, resgates de presente e os sorteios de segunda agora rodam dentro de `withTransaction` (`BEGIN IMMEDIATE` → `COMMIT`, com `ROLLBACK` em qualquer erro). Ou o dinheiro sai **e** chega, ou nada acontece.
* **Fim das anomalias dos blobs JSON:** `financas`, `pescaria_data`, `canteiros`/`armazem` da fazenda e `conquistas_json` do parque usavam `JSON.parse → mexer → stringify` — o clássico *lost update*, que clonava peixe, sumia com safra e subia marco comunitário duas vezes. Agora é `json_set`/`json_insert`/`json_remove` atômico (peixe novo entra por *append*, sem sobrescrever o do vizinho).
* **Cooldown à prova de flood:** `!minhabosta`, `!trabalhar` e `!bico` reivindicam o cooldown no próprio SQL (`WHERE last_minhabosta <= ?` / `json_extract(financas, '$.last_bico') <= ?`), então nem o mais rápido dos dedos fura a fila.

#### 🛡️ Fase 2/5 - O Cinturão de Segurança (IA, SQL e Web)
* **Coleira no Gemini:** o SQL que a IA escreve para o `!lembrar` passa por um validador que exige literalmente `SELECT nome_remetente, conteudo FROM mensagens ... LIMIT 200`. Qualquer outra coisa leva um `UNSAFE_AI_SQL_BLOCKED` na cara, e payloads destrutivos (`UNION`, `DROP`, `DELETE`, `PRAGMA`, `;` extra, comentários) caem no `DANGEROUS_SQL` antes de chegar ao banco.
* **Sem SQL Injection:** consultas com JID e rede pai/filho usam `id_conversa = ?` / `IN (?, ?)` com parâmetros, e identificadores de coluna (EVs dos Pokémon, slots de golpe/PP, colunas JSON) passam por **whitelist**. Não existe mais `${coluna}` vindo de input.
* **Prompt injection domada:** os canais secretos `||MEMORIA||` e `||ANOTACOES||` são truncados e neutralizados, com tipo e faixa validados (`nota` 0-10, `mudanca_afinidade` -5 a 5). O usuário não escreve mais na própria memória nem dá `nota 10` pra forçar uma publicação no BlueSky.
* **Perímetro fechado:** rate limiters em memória com `429` + `Retry-After` nas rotas caras (`/api/send-code`, `/api/xoxo`, `/api/dashboard`, login e registro), `JWT_SECRET` obrigatório no `.env`, Socket.io com allowlist das mesmas origens do CORS e validação do JWT no handshake, e token de cross-save de **8 caracteres** via `crypto.randomBytes` com busca `COLLATE NOCASE`, cooldown por usuário e queima exata da chave.
* **Arquivo morto removido:** o módulo de backup do Google Drive (`handleDriveBackup.js`) foi deletado, junto com os blocos comentados que ainda o referenciavam. Menos `require` fantasma, menos fita crepe.

#### 🧯 Fase 4 - Contingência de Verdade (Timeouts e Anti-Loop)
* **Teto rígido de 15 segundos** em todas as APIs externas (clima, cotação, Riot e Bluesky) via `AbortController` + *Promise.race* — porque o `node-fetch@2` tem a audácia de ignorar `signal`. Promise pendente de API externa nunca mais fica girando até o fim dos tempos.
* **FFmpeg com coleira:** `{ timeout: 15000, killSignal: 'SIGKILL' }`. Nenhum vídeo malformado segurando slot do semáforo de mídia.
* **Falha fatal = restart limpo:** `uncaughtException` e `unhandledRejection` logam o erro e chamam `process.exit(1)`, e o PM2 levanta o dinossauro. Nada de processo zumbi vagando por aí concatenando bugs.
* **BlueSky sem loop infinito:** teto de 3 tentativas para gerar e 3 para postar; se falhar, o pensamento volta pra geladeira e o próximo turno tenta de novo — a promise nunca fica pendurada "para sempre".

#### ♻️ Fase 5 - Retenção, Micro-Caches e TTL de Memória
* **Retenção de dados:** job diário às 04:30 apaga mensagens com mais de **60 dias**, mas somente de conversas com mais de **500 mensagens**. Grupo pequeno com histórico de 90 dias fica intacto (ninguém aqui quer perder fofoca antiga).
* **Micro-cache de 60s:** a rota `/api/dashboard`, o `io.on('connection')` e o loop de 3 segundos passaram a servir um snapshot em memória com *single-flight* (leituras concorrentes são coalescidas). O SQLite levava ~20 leituras por minuto só para o painel; agora leva 1. A cota de IA por modelo também ganhou cache de 60s chaveado por data, invalidado quando a cota é alterada.
* **Varredura periódica de lixo na memória:** varredor Singleton de 30 minutos (`.unref()`, apontando sempre para o `chatbot` vivo, sem segurar instâncias antigas) que expurga sessões de escavação abandonadas (TTL de 2h de inatividade), sessões de troca de Pokémon (5 min), `spamCooldowns`, cooldowns de token e o `pollCache` do Baileys.
* **Índice cirúrgico:** `idx_mensagens_conversa_tempo` matou o *full table scan* numa tabela que só cresce — dá para conferir com `EXPLAIN QUERY PLAN` mostrando `SEARCH mensagens USING INDEX`.
* **SQLite em WAL + `busy_timeout = 5000`:** dashboard, Twitch, Discord e IA leem enquanto o bot grava. O `SQLITE_BUSY` deixou de ser personagem da lore.

> **Resumindo em uma frase:** o Bostossauro deixou de ser um processo que **se multiplica** a cada soluço e virou um processo que **se recupera** de cada soluço — com economia auditável, memória higienizada e um cinturão anti-injeção em volta da IA.

## 🚀 Como Rodar na Sua Máquina

Quer testar localmente antes de colocar na sua própria batata na nuvem? Consulta o nosso guia detalhado em [INSTALL.md](INSTALL.md).

Resumo rápido:
1.  Clonar o repositório.
2.  `npm install`
3.  Configurar o `.env` com a tua `GEMINI_API_KEY`, a `JWT_SECRET` (obrigatória para o dashboard manter os logins válidos entre reinícios — sem ela o bot gera um segredo efêmero e todo mundo precisa logar de novo a cada restart) e, opcionalmente, a `RIOT_API_KEY` (se quiser que o comando !lol funcione).
4.  `npm start` e ler o QR Code.

## 🤝 Contribua (Por favor, sério)
Você entende de arquitetura de software? Sabe como evitar que o Node.js consuma 800MB de RAM para somar 2+2? Precisamos de você!

A Google passou a faca na nossa VM e provou ser mercenária, então agora o Bostossauro vive de favor nas instâncias da Oracle Cloud. Nossa arquitetura melhorou muito com a separação dos comandos (obrigado, `chatModel.js`), mas toda ajuda é bem-vinda.

**Ideias para Pull Requests:**

* Melhorar a eficiência de memória (nossa VM da Oracle agradece — a era de ouro é um processo contínuo, não um evento).

* Colocar timeout no `Source/catchModels.js` (script de diagnóstico standalone, o único `fetch` do repositório que ainda vive sem coleira).

* Migrar o `preCompressVideo` de `exec` para `spawn` com `taskkill /T /F` caso o bot um dia rode em runtime Windows (no Debian, o `SIGKILL` já mata o FFmpeg direto).

* Criar novos comandos inúteis, mas divertidos.

* Refinar os prompts da IA para o tribunal da resenha ficar ainda mais assertivo.

Sinta-se à vontade para abrir uma Issue ou mandar um PR. Aceitamos qualquer ajuda, *inclusive doações de memória RAM*.

*Feito com ❤️, ☕ e muito console.log*.

## Recados:

🔗**Link para conversar com o bot**: https://wa.me/5513991526878

**IMPORTANTE**: Todas as suas mensagens com o bot são guardadas no banco de dados, **NÃO COMPARTILHE (EM HIPÓTESE ALGUMA)** dados que você não queira que mais ninguém saiba (em teoria só eu vou saber, além de você e o bot). A implementação de *criptografia* é uma ideia para o futuro do sistema. Suas mensagens só são utilizadas para alimentar os prompts para o **Gemini**, fornecendo contexto de conversas para a LLM.
