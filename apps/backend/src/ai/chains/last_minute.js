import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { User } from "../../models/user.js";
import { Draft } from "../../models/Draft.js";

const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
});

export async function runLastMinuteChain(eventId) {
    console.log(`\n⏳ [Chain: Last Minute] Iniciando aviso de última hora para ${eventId}...`);

    // 1. CONTEXTO BD: Buscar usuarios en waitlist o que visitaron sin comprar.
    // Como en nuestro seed.js no pusimos a nadie en waitlist, usamos interestedEvents como fallback para la prueba.
    const targetUsers = await User.find({
        $or: [
            { waitlistEvents: eventId },
            { visitedEvents: eventId },
            { interestedEvents: eventId } // Fallback para que encuentre a nuestros 3 usuarios de prueba
        ]
    });

    const audienceCount = targetUsers.length;
    console.log(`👥 Usuarios en lista de espera/visitantes encontrados: ${audienceCount}`);

    // Datos simulados del evento (Quedan 24h y 15 entradas)
    const hoursLeft = 24;
    const ticketsLeft = 15;

    // 2. LANGCHAIN: Mensaje multicanal (Push/SMS) de urgencia
    const prompt = PromptTemplate.fromTemplate(`
        Quedan {hoursLeft} horas para el evento {eventId}.
        Solo {ticketsLeft} entradas disponibles.
        
        Crea una notificación PUSH / SMS de MÁXIMA urgencia (max 90 chars).
        Incluye los números concretos ({hoursLeft}h, {ticketsLeft} entradas).
        REGLA ESTRICTA: NO uses signos de exclamación.

        Responde ESTRICTAMENTE en JSON válido con este formato:
        {{"subject": "SMS", "body": "El texto del SMS corto"}}
    `);

    console.log(`✍️  LLM redactando SMS de urgencia sin exclamaciones...`);
    const result = await prompt.pipe(llm).invoke({
        hoursLeft,
        ticketsLeft,
        eventId
    });

    let parsedContent = { subject: "Último aviso", body: result.content };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log("⚠️ Error parseando JSON, se usará texto plano.");
    }

    // 3. HUMAN IN THE LOOP: Guardar borrador en BD
    console.log(`💾 Guardando borrador de SMS en la BD...`);
    const draft = await Draft.create({
        eventId: eventId,
        chainUsed: 'last_minute_push',
        subject: parsedContent.subject,
        body: parsedContent.body,
        targetAudienceCount: audienceCount,
        isApproved: false,
        status: 'pending',
        metadata: { channels: ['SMS', 'Push Notification'] }
    });

    console.log(`✅ [Chain: Last Minute] Borrador SMS generado (ID: ${draft._id}).`);
    return draft;
}