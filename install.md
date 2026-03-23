# 🛠️ Guia de Instalação - Bostossauro Bot

Este documento detalha o processo de instalação e configuração do **Bostossauro**, o chatbot de WhatsApp integrado com o Google Gemini.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que o seu ambiente (seja local ou uma VPS/VM) possui os seguintes softwares instalados:

1.  **Node.js**: Versão 18 ou superior (Recomendado: v20 LTS).
    * *Verifique com:* `node -v`
2.  **Git**: Para clonar o repositório.
3.  **NPM**: Gerenciador de pacotes (geralmente vem com o Node.js).
4.  **Uma chave de API do Google Gemini**: Você pode obter uma gratuitamente no [Google AI Studio](https://aistudio.google.com/).
5.  **Uma chave da API da Riot Games** (Opcional): Necessária apenas se quiser usar o comando `!lol`. Obtenha no [Riot Developer Portal](https://developer.riotgames.com/).
---

## 🚀 Passo a Passo da Instalação

### 1. Clonar o Repositório

Abra o seu terminal e clone o projeto para a pasta desejada:

```bash
git clone [https://github.com/seu-usuario/ChatbotWhats.git](https://github.com/seu-usuario/ChatbotWhats.git)
cd ChatbotWhats
```

### 2. Instalar Dependências
Instale as bibliotecas necessárias listadas no package.json:

```bash
npm install
#Se estiver rodando em Linux (Debian/Ubuntu/Google Cloud)
npm install --platform=linux --arch=x64 sharp
```

### 3. Configurar Variáveis de Ambiente (.env)
O bot precisa da sua chave de API para funcionar. Crie um arquivo chamado .env na raiz do projeto:
```bash
# No Linux/Mac
touch .env

# No Windows (PowerShell)
New-Item .env -ItemType File
```

#### Dentro do arquivo configure sua variável de ambiente
```bash
GEMINI_API_KEY=Sua_Chave_Gemini_Aqui
RIOT_API_KEY=Sua_Chave_Riot_Aqui
```

### 4. Verificar Estrutura de Pastas
Para que os ***comandos de sticker (!s)*** e as reações automáticas funcionem, a pasta Assets deve existir na raiz com as imagens corretas.

```plaintext
ChatbotWhats/
├── Assets/
│   ├── desonline.webp      (Essencial: enviado quando o bot tá off)
│   ├── naogrita1.webp      (Opcional: reações de grito)
│   ├── eusabo1.webp        (Opcional: reações de inteligência)
│   └── resumo1.webp        (Opcional: sticker de resumo)
├── Source/
│   ├── chatModel.js
│   ├── usageControl.js
│   ├── errorHandler.js
│   └── index.js
├── .env
└── package.json
``` 
## ⚡ Executando o Bot
### ▶️ Modo Simples (Teste)
Para rodar o bot diretamente no terminal e visualizar o QR Code:

```bash
node Source/index.js
```

* **1.** O terminal exibirá um QR Code.

* **2.** Abra o WhatsApp no seu celular.

* **3.** Vá em Aparelhos Conectados > Conectar um aparelho.

* **4.** Escaneie o QR Code.

Se tudo der certo, você verá a mensagem: ***✅ Bot conectado e pronto!***

### 📶 Modo Produção (PM2)
Para manter o bot rodando 24/7 em um servidor *(mesmo que você feche o terminal)*, recomendamos o uso do PM2.

* **1.** Instale o PM2 globalmente:

```bash
npm install pm2 -g
```

* **2.** Configuração do ecossistema do bot
#### Crie e configure um arquivo chamado *ecosystem.config.js*

```javascript
module.exports = {
  apps : [{
    name: 'bostossauro',
    script: 'Source/index.js',
    watch: true,
    // Ignora arquivos que mudam constantemente para evitar restarts infinitos
    ignore_watch : [
        "usage_stats.json",
        "auth_info_baileys/.", 
        "chat_history.db", 
        "chat_history.db-journal", 
        "chat_history.db-wal"
    ],
    env: {
        NODE_ENV: "production",
    }
  }]
};
```

* **3.** Inicie o bot:

### 🆒 Comandos úteis do PM2:

* Ver status: pm2 status

* Ver logs (console): pm2 logs bostossauro

* Reiniciar: pm2 restart bostossauro

* Parar: pm2 stop bostossauro

### ⚠️ Importante:

#### Não se esqueça de configurar um ***.gitignore*** para arquivos que contenham chaves!

Exemplo de conteúdo do ***.gitignore***:

```.gitignore
node_modules/
.env
auth_info_baileys/
npm-debug.log
``` 



### 📂 Dados e Persistência (Onde fica tudo?)

#### auth_info_baileys/: Guarda sua sessão do WhatsApp. Se apagar, tem que escanear o QR Code de novo.

#### chat_history.db: Seu banco de dados SQLite. Guarda mensagens, usuários e cotas.

#### usage_stats.json: Controle simples de cotas da IA para rotação de modelos.

## ⚠️ Solução de Problemas Comuns

### Erro: "Module not found"

* Verifique se você rodou npm install.

* Verifique se está executando o comando a partir da raiz da pasta ChatbotWhats.

* Erro no SQLite ou Python (node-gyp)

* Algumas versões do Node requerem ferramentas de compilação para o SQLite.

* No Ubuntu/Debian: sudo apt-get install build-essential python3

* No Windows: npm install --global --production windows-build-tools

### Bot cai ao tentar enviar Sticker

* Verifique se a pasta Assets contém o arquivo desonline.webp. O caminho no código é relativo à raiz de execução (fs.readFileSync("Assets/desonline.webp")).

O bot armazena o histórico do WhatsApp em memória para o Baileys e usa a biblioteca `sharp` para compilar e destruir imagens. Em VMs gratuitas com 1GB de RAM (como a tier Always Free da Oracle Cloud — descanse em paz, free tier do Google), o servidor pode engasgar.

* **Solução:** É ALTAMENTE recomendado adicionar um arquivo de paginação (Swap file) de pelo menos 1GB a 2GB no seu servidor Ubuntu para evitar que o Node.js seja morto pelo sistema (OOM Killer) ao processar figurinhas.

### "SQL_ERROR" ou "Database locked"

* O SQLite não gosta de concorrência massiva de escrita. Se acontecer muito, verifique se não tem duas instâncias do bot rodando (ex: uma no terminal e outra no PM2).

* Solução: pm2 stop all e verifique se tem algum node rodando (killall node se necessário), depois inicie apenas um.

### Erro: "KEY_UNAVAILABLE" no comando !lol

* Sua chave da Riot expirou (elas duram 24h se for chave de desenvolvimento) ou não foi configurada.

* Solução: Gere uma nova chave no site da Riot e atualize o .env. É necessário reiniciar o bot (pm2 restart bostossauro) para pegar a nova chave.

### 🔄 Rodando em Segundo Plano (Recomendado para Oracle Cloud)
Não deixe o bot rodando direto no terminal SSH, senão ele desliga quando você fechar o console. Use o PM2:

1. `npm install -g pm2`
2. `pm2 start index.js --name "bostossauro"`
3. `pm2 logs bostossauro` (Para ver o tribunal da resenha trabalhando ao vivo)
 