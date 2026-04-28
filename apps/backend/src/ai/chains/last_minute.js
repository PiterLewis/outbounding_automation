import { PromptTemplate } from "@langchain/core/prompts";
import { User } from "../../models/user.js";
import { Draft } from "../../models/draft.js";
import { llm } from "../model.js";

export async function runLastMinuteChain(eventId) {
    console.log(`\n[LastMinute] Iniciando aviso de ultima hora para ${eventId}`);

    // Buscar usuarios en waitlist, visitantes o interesados
    const targetUsers = await User.find({
        $or: [
            { waitlistEvents: eventId },
            { visitedEvents: eventId },
            { interestedEvents: eventId }
        ]
    });

    const audienceCount = targetUsers.length;
    console.log(`[LastMinute] Usuarios encontrados: ${audienceCount}`);

    // Datos del evento (simulados)
    const hoursLeft = 24;
    const ticketsLeft = 15;

    // Generar mensaje de urgencia con IA
    const prompt = PromptTemplate.fromTemplate(`
        Quedan {hoursLeft} horas para el evento {eventId}.
        Solo {ticketsLeft} entradas disponibles.
        
        Crea una notificación PUSH / SMS de MÁXIMA urgencia (max 90 chars).
        Incluye los números concretos ({hoursLeft}h, {ticketsLeft} entradas).
        REGLA ESTRICTA: NO uses signos de exclamación.

        Responde ESTRICTAMENTE en JSON válido con este formato:
        {{"subject": "SMS", "body": "El texto del SMS corto"}}
    `);

    console.log('[LastMinute] Generando SMS de urgencia...');
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
        console.log('[LastMinute] Error parseando JSON, usando texto plano');
    }

    // Guardar borrador para aprobacion manual
    console.log('[LastMinute] Guardando borrador SMS en BD...');
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

    console.log(`[LastMinute] Borrador generado (ID: ${draft._id})`);
    return draft;
}