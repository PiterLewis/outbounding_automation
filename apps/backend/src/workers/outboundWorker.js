import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getEventMetrics } from "../tools/eventTools.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

// 1. Configurar el Modelo (Cerebro)
const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
});

// 2. Darle las Herramientas
const tools = [getEventMetrics];

// 3. Definir su Personalidad y Reglas
const prompt = ChatPromptTemplate.fromMessages([
    ["system", `Eres el "Becario de Marketing Virtual" de Eventbrite. 
    Tu objetivo es redactar campañas salientes basadas en el comportamiento de la audiencia.
    Usa tus herramientas para investigar el evento antes de redactar.
    Siempre devuelve un ASUNTO y un CUERPO DE CORREO listos para enviar.`],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"], // Espacio para que el agente piense
]);

// 4. Instanciar el Agente
const agent = createToolCallingAgent({ llm, tools, prompt });
const agentExecutor = new AgentExecutor({ agent, tools });

// 5. El Worker de BullMQ
export const outboundWorker = new Worker('outbounding', async (job) => {
    console.log(`\n [Worker] Iniciando Job ${job.id}`);
    console.log(` Contexto recibido: Evento ${job.data.eventId} | Prompt: "${job.data.prompt}"`);

    // Ejecutamos la Cadena de Razonamiento del Agente
    const result = await agentExecutor.invoke({
        input: `El ID del evento es ${job.data.eventId}. El usuario pide: ${job.data.prompt}`
    });

    console.log(` [Worker] Borrador generado con éxito.`);

    // Requisito Obligatorio: Human in the loop. 
    // Guardamos el borrador como pendiente, NUNCA se envía automáticamente.
    return {
        status: 'pending_approval',
        isApproved: false,
        draftContent: result.output
    };
}, { connection });

outboundWorker.on('completed', (job, returnvalue) => {
    console.log(`🎉 Job ${job.id} completado. Resultado guardado en BD (simulado).`);
});