require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function testAliases() {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Testando as tags "latest" contra as tags fixas
    const targets = [
        "gemini-2.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
        "gemini-flash-latest"
    ];

    const prompt = `Resolva o seguinte enigma lógico passo a passo.
    
Você precisa alocar 5 serviços (Bostossauro, TeamMatch, Banco de Dados, API da Steam e OCR) em 5 servidores (S1, S2, S3, S4, S5) enfileirados da esquerda para a direita.

Regras absolutas:
1. O TeamMatch não pode ficar nas pontas (S1 ou S5).
2. O Banco de Dados deve ficar exatamente dois servidores à direita do Bostossauro.
3. A API da Steam e o OCR devem ficar em servidores adjacentes (um do lado do outro).
4. O servidor do meio (S3) roda um serviço pesado, e sabemos com certeza absoluta que nem o TeamMatch nem o OCR são pesados.
5. O Bostossauro está à esquerda da API da Steam.
6. A API da Steam está o mais longe possível do Bostossauro, respeitando as outras regras.

Pergunta: Qual serviço está rodando em qual servidor (de S1 a S5)? Explique sua dedução.`;

    console.log("🔥 COMPARANDO VERSÕES LATEST VS FIXAS 🔥\n");

    for (const modelName of targets) {
        console.log(`\n==================================================`);
        console.log(`🚀 Testando: ${modelName}`);
        console.log(`==================================================`);
        
        try {
            const response = await genAI.models.generateContent({
                model: modelName,
                contents: prompt,
                config: { temperature: 0.1 }
            });

            const answer = response.text || (response.response ? response.response.text() : "Sem resposta textual.");
            // Exibindo apenas a conclusão para não poluir o terminal
            console.log("... " + answer.substring(answer.length - 300));

        } catch (e) {
            console.error(`💥 Falha ao testar ${modelName}:`, e.message);
        }
        
        // Pausa de 12 segundos vitalícia para não tomar Quota Exceeded nos Free Tiers
        console.log("\n⏳ Aguardando resfriamento (12s)...");
        await new Promise(r => setTimeout(r, 12000));
    }
}

testAliases();

async function listAllModelDetails() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERRO: GEMINI_API_KEY não encontrada no arquivo .env");
        return;
    }

    try {
        console.log("🔍 Invadindo o mainframe do Google AI Studio para buscar limites...\n");
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const models = data.models;

        console.log("==================================================");
        console.log(`✅ Total de Modelos Identificados: ${models.length}`);
        console.log("==================================================\n");

        models.forEach((m) => {
            const cleanName = m.name.replace('models/', '');
            const methods = m.supportedGenerationMethods ? m.supportedGenerationMethods.join(", ") : 'Nenhum';
            const inputLimit = m.inputTokenLimit || 'Não informado';
            const outputLimit = m.outputTokenLimit || 'Não informado';
            
            console.log(`🤖 NOME: ${cleanName}`);
            console.log(`   ⚙️ MÉTODOS SUPORTADOS: ${methods}`);
            console.log(`   📥 LIMITE INPUT (Leitura): ${inputLimit} tokens`);
            console.log(`   📤 LIMITE OUTPUT (Escrita): ${outputLimit} tokens`);
            console.log(`   📄 DESCRIÇÃO: ${m.description}`);
            console.log("--------------------------------------------------");
        });

    } catch (error) {
        console.error("❌ Erro ao buscar os detalhes dos modelos:", error.message);
    }
}

//listAllModelDetails();