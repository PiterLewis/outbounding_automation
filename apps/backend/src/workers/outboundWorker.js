import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getEventMetrics } from "../tools/eventTools.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

// 1. Configurar el Modelo
const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
});

// 2. Darle las Herramientas
const tools = [getEventMetrics];

// 3. Instanciar el Agente (Estándar moderno LangGraph)
const agent = createReactAgent({
    llm: llm,
    tools: tools
});

// 4. El Worker de BullMQ
export const outboundWorker = new Worker('outbounding', async (job) => {
    console.log(`\n🤖 [Worker] Iniciando Job ${job.id}`);
    console.log(`📩 Contexto recibido: Evento ${job.data.eventId} | Prompt: "${job.data.prompt}"`);

    // Ejecutamos el agente pasándole el rol del sistema y el mensaje del usuario
    const result = await agent.invoke({
        messages: [
            {
                role: "system",
                content: "Eres el asistente de marketing virtual de Eventbrite. Tu objetivo es redactar campañas salientes basándote en el comportamiento de la audiencia. Usa tus herramientas para investigar el evento. Devuelve un borrador de correo (Asunto y Cuerpo)."
            },
            {
                role: "user",
                content: `El ID del evento es ${job.data.eventId}. El usuario pide: ${job.data.prompt}`
            }
        ]
    });

    console.log(`✅ [Worker] Borrador generado con éxito.`);

    // LangGraph devuelve el historial, sacamos el último mensaje (la respuesta final de la IA)
    const finalMessage = result.messages[result.messages.length - 1].content;

    // Requisito Obligatorio: Human in the loop. 
    return {
        status: 'pending_approval',
        isApproved: false,
        draftContent: finalMessage
    };
}, { connection });

outboundWorker.on('completed', (job, returnvalue) => {
    console.log(`🎉 Job ${job.id} completado. Listo para validación humana.`);
});

outboundWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} ha fallado con error: ${err.message}`);
});