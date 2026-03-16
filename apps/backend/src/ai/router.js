import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Instanciamos el modelo (el mismo que ya te funciona de lujo)
const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" },
    temperature: 0 // CLAVE: Temperatura 0 para que no sea creativo, queremos precisión absoluta.
});

// 2. Creamos el Prompt del Router basado en tu documento de diseño
const routerPrompt = PromptTemplate.fromTemplate(`
Eres el enrutador principal de un sistema de automatización de marketing para eventos.
Tu único trabajo es analizar el contexto o la acción del usuario y decidir qué flujo (cadena) ejecutar.

Acción / Contexto recibido: {action}

Decide cuál de estas cadenas es la más apropiada:
- low_sales_discount: ventas bajas, pocos tickets vendidos.
- age_facebook_campaign: campaña segmentada para redes sociales.
- checkin_welcome: asistente hace check-in en el evento.
- post_event_survey: evento terminado, pedir feedback.
- last_minute_push: faltan <48h y hay entradas libres, máxima urgencia.
- vip_upsell: el asistente tiene un historial recurrente, trato VIP.

Responde ÚNICA Y EXCLUSIVAMENTE con el nombre exacto de la cadena. Sin puntos, sin comillas, sin saludos.
`);

// 3. Montamos la tubería (Pipeline) que une el Prompt -> LLM -> Texto limpio
export const aiRouter = routerPrompt.pipe(llm).pipe(new StringOutputParser());

// Función auxiliar para testearlo rápido
export async function testRouter(actionText) {
    console.log(`🧠 Router analizando: "${actionText}"...`);
    const decision = await aiRouter.invoke({ action: actionText });
    console.log(`🎯 Decisión del LLM: ${decision}`);
    return decision;
}