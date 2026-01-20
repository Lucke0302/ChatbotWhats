const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// Escopo necessário para ver, editar e criar arquivos no Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// Caminho onde o token de acesso será salvo após a primeira autenticação
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), '../credentials.json');

class DriveBackup {
    constructor() {
        this.auth = null;
        this.drive = null;
        this.targetFolderId = null; // Cache do ID da pasta
    }

    /**
     * Carrega as credenciais salvas anteriormente, se existirem.
     */
    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    /**
     * Salva o token de acesso em um arquivo para uso futuro.
     */
    async saveCredentials(client) {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
    }

    /**
     * Método principal de autenticação
     */
    async authorize() {
        // Tenta carregar token existente
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
            this.auth = client;
            return client;
        }

        // Se não existir, faz o login via navegador
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });

        // Salva para a próxima vez
        if (client.credentials) {
            await this.saveCredentials(client);
        }
        
        this.auth = client;
        return client;
    }

    /**
     * Exemplo de método para testar a conexão (Listar arquivos)
     */
    async listFiles() {
        const drive = google.drive({ version: 'v3', auth: this.auth });
        const res = await drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        });
        return res.data.files;
    }

    // Procura ou Cria a pasta no Drive
    async getFolderId(folderName = "WhatsApp Downloads") {
        if (this.targetFolderId) return this.targetFolderId;

        const res = await this.drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (res.data.files.length > 0) {
            this.targetFolderId = res.data.files[0].id;
            return this.targetFolderId;
        }

        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await this.drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        
        this.targetFolderId = folder.data.id;
        return this.targetFolderId;
    }

    // Faz o Upload do Buffer (memória) direto pro Drive
    async uploadFile(fileName, mimeType, buffer) {
        try {
            const folderId = await this.getFolderId();
            
            // Converte buffer para stream
            const bufferStream = new Readable();
            bufferStream.push(buffer);
            bufferStream.push(null);

            const fileMetadata = {
                name: fileName,
                parents: [folderId],
            };

            const media = {
                mimeType: mimeType,
                body: bufferStream,
            };

            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            console.log(`✅ Upload concluído: ${fileName} (ID: ${file.data.id})`);
            return file.data.id;

        } catch (error) {
            console.error("❌ Erro no Upload pro Drive:", error);
            return null;
        }
    }
}

module.exports = DriveBackup;