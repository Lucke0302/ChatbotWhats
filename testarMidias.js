require('dotenv').config();
const fs = require('fs');
const path = require('path');

const DOWNLOAD_DIR = 'C:\\Users\\Lucas.Moraes.CIS\\Downloads';

function criarCabecalhoWav(tamanhoDados, sampleRate) {
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + tamanhoDados, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(tamanhoDados, 40);
    return header;
}

async function gerarAudioComCerebro() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("🧠 ETAPA 1: Gerando o texto com o Cérebro (Flash Lite)...");
    
    let textoGerado = "";
    
    try {
        const resTexto = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: "Você é o Bostossauro, um dinossauro sarcástico e mal-humorado que estuda Análise de Sistemas na FATEC. Dê respostas curtas, grossas e diretas, em no máximo 3 frases. Você odeia calouros." }]
                },
                contents: [{ 
                    parts: [{ text: "Me ajuda a formatar meu pen drive?" }] 
                }]
            })
        });

        const dataTexto = await resTexto.json();
        
        if (dataTexto.error) {
            console.error("❌ Erro da API (Cérebro):", dataTexto.error.message);
            return;
        }

        textoGerado = dataTexto.candidates[0].content.parts[0].text;
        
        // Limpa formatação Markdown
        textoGerado = textoGerado.replace(/[*#_]/g, '').trim();
        console.log(`💬 Texto Original: "${textoGerado}"`);

        // ====================================================================
        // ETAPA 1.5: O "HACK" DA VELOCIDADE
        // Troca vírgulas e pontos por reticências para forçar a voz a pausar e soar cansada
        // ====================================================================
        textoGerado = textoGerado.replace(/,/g, '...').replace(/\./g, '... ');
        console.log(`💬 Texto Modificado (Para TTS): "${textoGerado}"`);

    } catch (e) {
        console.error("💥 Erro Crítico no Cérebro:", e.message);
        return;
    }

    console.log("\n🎙️ ETAPA 2: Mandando a Boca (TTS) ler o texto...");

    try {
        const resAudio = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: textoGerado }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: { 
                            prebuiltVoiceConfig: { voiceName: "Charon" } // Charon ou Fenrir
                        }
                    }
                }
            })
        });

        const dataAudio = await resAudio.json();

        // AGORA SIM: Pegando o erro real que a API devolver
        if (dataAudio.error) {
            console.error("❌ Erro da API (Boca):", JSON.stringify(dataAudio.error, null, 2));
            return;
        }

        const part = dataAudio.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (part && part.inlineData?.data) {
            const rawBuffer = Buffer.from(part.inlineData.data, 'base64');
            const wavHeader = criarCabecalhoWav(rawBuffer.length, 24000);
            const finalWavBuffer = Buffer.concat([wavHeader, rawBuffer]);

            const filePath = path.join(DOWNLOAD_DIR, 'bostossauro_charon_lento.wav');
            fs.writeFileSync(filePath, finalWavBuffer);
            
            console.log(`✅ SUCESSO ABSOLUTO! O áudio foi salvo em: ${filePath}`);
        } else {
            console.log("❌ Falha: A API não retornou o erro, mas também não retornou o áudio.");
        }

    } catch (e) {
        console.error("💥 Erro Crítico na Boca:", e.message);
    }
}

gerarAudioComCerebro();