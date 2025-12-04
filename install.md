# 🛠️ Guia de Instalação - Bostossauro Bot

Este documento detalha o processo de instalação e configuração do **Bostossauro**, o chatbot de WhatsApp integrado com o Google Gemini.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que o seu ambiente (seja local ou uma VPS/VM) possui os seguintes softwares instalados:

1.  **Node.js**: Versão 18 ou superior (Recomendado: v20 LTS).
    * *Verifique com:* `node -v`
2.  **Git**: Para clonar o repositório.
3.  **NPM**: Gerenciador de pacotes (geralmente vem com o Node.js).
4.  **Uma chave de API do Google Gemini**: Você pode obter uma gratuitamente no [Google AI Studio](https://aistudio.google.com/).

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
npm install --platform=linux --arch=x64 sharp #(se não instalar o sharp)
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
GEMINI_API_KEY=COLE_SUA_CHAVE_DO_GOOGLE_AISTUDIO_AQUI
```

### 4. Verificar Estrutura de Pastas
Para garantir que o comando de sticker de ***"Desonline"*** funcione, verifique se a imagem existe no local correto. A estrutura deve ser:

```plaintext
ChatbotWhats/
├── Assets/
│   └── desonline.webp
├── Source/
│   ├── chatModel.js
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

```javascript
module.exports = {
  apps : [{
    name: 'bostossauro',
    script: 'Source/index.js',
    watch: true,
    // Garanta que esta lista de arquivos e pastas está correta
    // Essa parte ignora a observação de modificações nesses aquivos,
    //que são arquivos que mudam muito, mas não modificam o funcionamento do bot
    // Toda vez que arquivos são modificados no diretório, o pm2 reinicia o bot 
    // para colocar as alterações em vigor
    ignore_watch : [
        "auth_info_baileys/.", 
        "chat_history.db", 
        "chat_history.db-journal", 
        "chat_history.db-wal"
    ],
  }]
};
```

* **3.** Inicie o bot:

```bash
pm2 start ecosystem.config.js
```

### 🆒 Comandos úteis do PM2:

* Ver status: pm2 status

* Ver logs (console): pm2 logs bostossauro

* Reiniciar: pm2 restart bostossauro

* Parar: pm2 stop bostossauro

### ⚠️ Importante:

Não se esqueça de configurar um ***.gitignore*** para arquivos que contenham chaves!

Exemplo de conteúdo do ***.gitignore***:

```.gitignore
node_modules/
.env
auth_info_baileys/
npm-debug.log
``` 

## 📂 Banco de Dados e Sessão
Sessão do WhatsApp: Após o login, uma pasta chamada auth_info_baileys será criada automaticamente na raiz. Não apague esta pasta, a menos que queira desconectar o bot e escanear o QR Code novamente.

Histórico de Conversas: Um arquivo chat_history.db (SQLite) será criado automaticamente na raiz para armazenar o contexto das conversas.

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

* Memória RAM Alta
O bot armazena histórico em memória para o baileys e processa dados com o sharp. Em VMs com 1GB de RAM (como a free tier do Google Cloud), recomenda-se adicionar Swap file.
 