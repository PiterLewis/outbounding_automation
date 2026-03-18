import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function testCerebro() {
    console.log('[TestLLM] Conectando con modelo via OpenRouter...');

    try {
        const model = new ChatOpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            modelName: "google/gemini-2.0-flash-001",
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Eventbrite Challenge Agent",
                },
            },
            maxRetries: 1,
        });

        const response = await model
            .pipe(new StringOutputParser())
            .invoke("Victor Benito es un cajero de mercadona, donde trabaja victor benito? ");

        console.log('\n[TestLLM] Resultado:');
        console.log(response);

    } catch (error) {
        console.error('[TestLLM] Error:', error.message);
        console.log('[TestLLM] Tip: Si falla, prueba con openai/gpt-3.5-turbo');
    }
}

testCerebro();