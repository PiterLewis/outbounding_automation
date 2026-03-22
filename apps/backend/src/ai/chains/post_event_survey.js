import { PromptTemplate } from "@langchain/core/prompts";
import { Attendee } from "../../models/Attendee.js";
import { Draft } from "../../models/Draft.js";
import { llm } from "../model.js";

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

    // Datos del evento (simulados hasta integrar Eventbrite)
    const eventName = `Evento ${eventId}`;
    const eventType = 'general';

    // 2. LANGCHAIN: generar preguntas adaptadas al tipo de evento
    const prompt = PromptTemplate.fromTemplate(`
      Crea una encuesta post-evento de exactamente 3 preguntas para:
      Evento: {eventName}. Tipo: {eventType}.

      Instrucciones adicionales del organizador: {userPrompt}

      Las 3 preguntas deben cubrir:
      - Satisfacción general (tipo: rating del 1 al 5)
      - Aspecto favorito del evento (tipo: text)
      - Qué mejorarías para la próxima vez (tipo: text)

      Responde ESTRICTAMENTE en JSON válido con este formato exacto:
      {{"questions": [{{"question": "...", "type": "rating"}}, {{"question": "...", "type": "text"}}, {{"question": "...", "type": "text"}}]}}
    `);

    const result = await prompt.pipe(llm).invoke({ eventName, eventType, userPrompt });

    let parsedContent = { questions: [] };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log('[PostSurvey] Error parseando JSON, se usará estructura vacía');
    }

    console.log(`[PostSurvey] Preguntas generadas: ${parsedContent.questions.length}`);

    // 3. HUMAN IN THE LOOP: guardar borrador en MongoDB
    console.log('[PostSurvey] Guardando borrador en BD...');
    const draft = await Draft.create({
        eventId: eventId,
        chainUsed: 'post_event_survey',
        subject: `Encuesta post-evento: ${eventName}`,
        body: JSON.stringify(parsedContent.questions),
        targetAudienceCount: audienceCount,
        isApproved: false,
        status: 'pending',
        metadata: {
            eventName,
            eventType,
            questions: parsedContent.questions,
            recipientEmails: checkedIn.map(a => a.email)
        }
    });

    console.log(`[PostSurvey] Borrador generado (ID: ${draft._id})`);
    return draft;
}
