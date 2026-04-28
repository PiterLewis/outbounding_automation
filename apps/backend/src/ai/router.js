import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "./model.js";

// Prompt del router de cadenas
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

// Pipeline: Prompt -> LLM -> texto limpio
export const aiRouter = routerPrompt.pipe(llm).pipe(new StringOutputParser());

// Test rapido del router
export async function testRouter(actionText) {
    console.log(`[Router] Analizando: "${actionText}"`);
    const decision = await aiRouter.invoke({ action: actionText });
    console.log(`[Router] Decision: ${decision}`);
    return decision;
}