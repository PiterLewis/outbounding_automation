import { PromptTemplate } from "@langchain/core/prompts";
import { Attendee } from "../../models/Attendee.js";
import { Draft } from "../../models/draft.js";
import { llm } from "../model.js";

/**
 * Genera un borrador de encuesta post-evento.
 *
 * NO envía emails ni marca asistentes. Su único trabajo es:
 *   - pedirle al LLM un `emailIntro` personalizado + las `questions`
 *   - guardar el borrador en MongoDB con status: 'pending'
 *
 *
 *
 */
export async function runPostEventSurveyChain(eventId, userPrompt = '') {
    console.log(`\n[PostSurvey] Generando borrador de encuesta post-evento para ${eventId}`);

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

    // 2. LANGCHAIN: pedir al LLM intro de email + 3 preguntas
    const prompt = PromptTemplate.fromTemplate(`
        Eres un asistente que prepara encuestas post-evento y sus emails de invitación.

        Evento: {eventName}
        Tipo: {eventType}
        Instrucciones extra del organizador: {extraInstructions}

        Devuelve ESTRICTAMENTE un JSON válido con este formato exacto (sin texto alrededor, sin markdown):
        {{
          "emailIntro": "2-3 frases cálidas y breves para introducir el email que invita a responder la encuesta. Habla del evento, agradece la asistencia e invita a dar feedback. NO incluyas saludo (Hola/Querido) — eso se añade aparte. NO incluyas links ni listas de preguntas — solo el párrafo de intro.",
          "questions": [
            {{"question": "...", "type": "rating"}},
            {{"question": "...", "type": "text"}}
          ]
        }}

        Reglas para "questions":
        - Por defecto, genera 3 preguntas. Si las instrucciones del organizador piden explicitamente otro numero (por ejemplo "5 preguntas", "10 preguntas"), respeta ese numero exacto.
        - Tipos válidos: "rating" (escala 1 al 5) o "text" (respuesta libre). NO uses otros tipos aunque el organizador los mencione.
        - Si el organizador pide "tipos variados", combina rating y text alternando.
        - Incluye al menos una pregunta de satisfaccion general de tipo "rating", a menos que el organizador diga explicitamente lo contrario.
        - Adapta el tono y el texto al tipo de evento y a las instrucciones del organizador.
    `);

    console.log('[PostSurvey] LLM generando intro + preguntas...');
    const result = await prompt.pipe(llm).invoke({
        eventName,
        eventType,
        extraInstructions: userPrompt || '(ninguna)'
    });

    let parsedContent = { emailIntro: '', questions: [] };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log('[PostSurvey] Error parseando JSON del LLM, se usará estructura vacía');
    }

    console.log(`[PostSurvey] Preguntas generadas: ${parsedContent.questions.length}`);

    // 3. GUARDAR borrador en MongoDB como PENDIENTE
    const draft = await Draft.create({
        eventId,
        chainUsed: 'post_event_survey',
        subject: `Encuesta post-evento: ${eventName}`,
        body: JSON.stringify(parsedContent.questions),
        targetAudienceCount: audienceCount,
        isApproved: false,
        status: 'pending',
        metadata: {
            eventName,
            eventType,
            emailIntro: parsedContent.emailIntro || '',
            questions: parsedContent.questions || [],
            recipientEmails: checkedIn.map(a => a.email),
            googleForm: null // se rellena al publicar
        }
    });

    console.log(`[PostSurvey] Borrador creado id=${draft._id} (pending, sin enviar)`);
    return draft;
}
