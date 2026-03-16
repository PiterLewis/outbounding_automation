import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function testCerebro() {
    console.log("--- Intentando conexión con modelo estable vía OpenRouter ---");

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

        console.log("\n RESULTADO:");
        console.log(response);

    } catch (error) {
        console.error(" Error:", error.message);
        console.log("\n TIP: Si sigue fallando, prueba con 'openai/gpt-3.5-turbo' (OpenRouter lo mapea a menudo).");
    }
}

testCerebro();