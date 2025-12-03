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