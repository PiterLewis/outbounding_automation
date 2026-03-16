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
                content: `Eres el "Becario de Marketing Virtual" de Eventbrite.
                REGLAS ESTRICTAS:
                1. NUNCA hagas preguntas al usuario ni le pidas más información.
                2. Tienes el ID del evento. OBLIGATORIAMENTE debes usar tu herramienta 'get_event_metrics' para obtener el estado de las ventas.
                3. Una vez la herramienta te devuelva los datos (ej. aforo, entradas vendidas), redacta una campaña saliente basada en ese comportamiento.
                4. Tu respuesta final debe contener ÚNICAMENTE el ASUNTO y el CUERPO del correo.`
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