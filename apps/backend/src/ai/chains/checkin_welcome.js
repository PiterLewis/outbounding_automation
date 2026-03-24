import { PromptTemplate } from "@langchain/core/prompts";
import { Attendee } from "../../models/attendee.js";
import { llm } from "../model.js";
import { notificationService } from "../../services/notifications.js";

export async function runCheckinWelcomeChain(eventId, attendeeEmail, userPrompt = '') {
    console.log(`\n[CheckinWelcome] Check-in detectado — ${attendeeEmail} en evento ${eventId}`);

    // 1. CONTEXTO DE BD: buscar historial completo del asistente
    const profile = await Attendee.findOne({ email: attendeeEmail });

    if (!profile) {
        console.log(`[CheckinWelcome] Asistente ${attendeeEmail} no encontrado en BD, abortando`);
        return { status: 'skipped', reason: 'attendee_not_found' };
    }

    const firstName = profile.name ? profile.name.split(' ')[0] : attendeeEmail.split('@')[0];
    const pastCount = profile.pastEvents?.length || 0;
    const isVIP = pastCount >= 3;
    const interests = profile.interests?.join(', ') || 'eventos';
    const city = profile.city || null;

    console.log(`[CheckinWelcome] ${firstName} | Eventos previos: ${pastCount} | VIP: ${isVIP} | Intereses: ${interests}`);

    // 2. LANGCHAIN: generar mensaje de bienvenida personalizado
    const prompt = PromptTemplate.fromTemplate(`
        Eres el sistema de bienvenida de un evento en vivo. Acaba de llegar {firstName}.

        Lo que sabemos de él/ella:
        - Ha asistido a {pastCount} eventos anteriores con nosotros
        - Sus intereses son: {interests}
        {cityLine}
        - Es cliente VIP: {isVIP}

        Escribe un mensaje de bienvenida push notification que:
        - Sea MUY personal, usa su nombre
        - Le haga sentir especial y que le esperábamos
        - Si es VIP, hazle sentir que es parte de algo exclusivo (sin decir literalmente "eres VIP")
        - Si lleva varios eventos, menciona su fidelidad de forma cálida
        - Si es su primera vez, dale una bienvenida extra especial
        - Tono: cercano, cálido, genuino — como si lo escribiera una persona real
        - Máximo 100 caracteres
        {extraInstructions}

        Responde SOLO con el mensaje, sin comillas ni explicaciones.
    `);

    console.log(`[CheckinWelcome] LLM generando mensaje personalizado...`);
    const result = await prompt.pipe(llm).invoke({
        firstName,
        pastCount,
        interests,
        cityLine: city ? `- Viene desde ${city}` : '',
        isVIP: isVIP ? 'sí' : 'no',
        extraInstructions: userPrompt ? `Instrucciones adicionales del organizador: ${userPrompt}` : ''
    });

    const message = result.content.trim().slice(0, 100);
    console.log(`[CheckinWelcome] Mensaje: "${message}"`);

    // 3. ENVIAR push notification via OneSignal en tiempo real
    console.log(`[CheckinWelcome] Enviando push a ${attendeeEmail}...`);
    const pushResult = await notificationService.sendPush([attendeeEmail], message);

    if (pushResult.success) {
        console.log(`[CheckinWelcome] Push enviada correctamente`);
    } else {
        console.log(`[CheckinWelcome] Error enviando push:`, pushResult.error);
    }

    // 4. Si es VIP, añadir badge en la BD
    if (isVIP) {
        await Attendee.updateOne(
            { email: attendeeEmail },
            { $set: { isVIP: true } }
        );
        console.log(`[CheckinWelcome] Badge VIP añadido a ${attendeeEmail}`);
    }

    return {
        status: 'sent',
        attendee: attendeeEmail,
        message,
        isVIP,
        pushSent: pushResult.success
    };
}
