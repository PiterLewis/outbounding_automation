import { PromptTemplate } from "@langchain/core/prompts";
import { Attendee } from "../../models/Attendee.js";
import { Draft } from "../../models/draft.js";
import { llm } from "../model.js";
import { notificationService } from "../../services/notifications.js";

export async function runPostEventSurveyChain(eventId, userPrompt = '') {
    console.log(`\n[PostSurvey] Generando encuesta post-evento para ${eventId}`);

    // 1. CONTEXTO DE BD: asistentes que hicieron check-in y no han respondido encuesta
    const checkedIn = await Attendee.find({
        eventId: eventId,
        checkedIn: true,
        surveyAnswered: { $ne: true }
    });

    const audienceCount = checkedIn.length;
    console.log(`[PostSurvey] Asistentes pendientes de encuesta: ${audienceCount}`);

    if (audienceCount === 0) {
        console.log('[PostSurvey] No hay asistentes pendientes, abortando');
        return { status: 'skipped', reason: 'no_attendees' };
    }

    const eventName = `Evento ${eventId}`;
    const eventType = 'general';

    // 2. LANGCHAIN: generar preguntas adaptadas al tipo de evento
    const prompt = PromptTemplate.fromTemplate(`
        Crea una encuesta post-evento de exactamente 3 preguntas para:
        Evento: {eventName}. Tipo: {eventType}.

        Las 3 preguntas deben cubrir:
        - Satisfacción general (tipo: rating del 1 al 5)
        - Aspecto favorito del evento (tipo: text)
        - Qué mejorarías para la próxima vez (tipo: text)

        {extraInstructions}

        Responde ESTRICTAMENTE en JSON válido con este formato exacto:
        {{"questions": [{{"question": "...", "type": "rating"}}, {{"question": "...", "type": "text"}}, {{"question": "...", "type": "text"}}]}}
    `);

    console.log('[PostSurvey] LLM generando preguntas de encuesta...');
    const result = await prompt.pipe(llm).invoke({
        eventName,
        eventType,
        extraInstructions: userPrompt ? `Instrucciones adicionales: ${userPrompt}` : ''
    });

    let parsedContent = { questions: [] };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log('[PostSurvey] Error parseando JSON, se usará estructura vacía');
    }

    console.log(`[PostSurvey] Preguntas generadas: ${parsedContent.questions.length}`);

    // 3. GUARDAR borrador en MongoDB (para registro)
    const draft = await Draft.create({
        eventId,
        chainUsed: 'post_event_survey',
        subject: `Encuesta post-evento: ${eventName}`,
        body: JSON.stringify(parsedContent.questions),
        targetAudienceCount: audienceCount,
        isApproved: true,
        status: 'sent',
        metadata: {
            eventName,
            eventType,
            questions: parsedContent.questions,
            recipientEmails: checkedIn.map(a => a.email)
        }
    });

    // 4. ENVIAR emails directamente a todos los asistentes
    console.log(`[PostSurvey] Enviando encuesta a ${audienceCount} asistentes...`);

    const questionsHtml = parsedContent.questions.map((q, i) =>
        `<p><strong>${i + 1}. ${q.question}</strong> ${q.type === 'rating' ? '(del 1 al 5)' : ''}</p>`
    ).join('');

    await Promise.allSettled(
        checkedIn.map(a =>
            notificationService.sendEmail(
                a.email,
                `¿Qué te pareció ${eventName}? Cuéntanos (2 min)`,
                `
                <p>Hola ${a.name || a.email},</p>
                <p>Gracias por asistir a <strong>${eventName}</strong>. Tu opinión nos ayuda a mejorar.</p>
                ${questionsHtml}
                <p>Responde a este email con tus respuestas.</p>
                `
            )
        )
    );

    // 5. MARCAR asistentes como surveyAnswered
    await Attendee.updateMany(
        { _id: { $in: checkedIn.map(a => a._id) } },
        { $set: { surveyAnswered: true } }
    );

    console.log(`[PostSurvey] Encuesta enviada a ${audienceCount} asistentes`);
    return draft;
}
