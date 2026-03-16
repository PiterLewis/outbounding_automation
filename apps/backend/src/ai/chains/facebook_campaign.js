import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { Attendee } from "../../models/Attendee.js";
import { Draft } from "../../models/Draft.js";

const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
});

export async function runAgeFacebookChain(eventId) {
    console.log(`\n [Chain: Social Media] Analizando demografía para la campaña de ${eventId}...`);

    // 1. CONTEXTO BD: Calcular media de edad y ciudad principal [cite: 198-206]
    // Buscamos a los asistentes del organizador y calculamos la media
    const stats = await Attendee.aggregate([
        { $match: { organizerId: 'ORG-1' } }, // Usamos el ID del organizador de nuestro seed
        {
            $group: {
                _id: null,
                avgAge: { $avg: '$age' },
                topCity: { $first: '$city' }
            }
        }
    ]);

    // Fallbacks de seguridad por si no hay datos de edad en la BD todavía
    const avgAge = Math.round(stats[0]?.avgAge || 32);
    const topCity = stats[0]?.topCity || 'Madrid';

    // 2. LÓGICA DE NEGOCIO: Decidir el canal [cite: 190, 209-211]
    const channel = avgAge < 30 ? 'Instagram' : 'Facebook';
    console.log(` Demografía: Edad media ${avgAge} años en ${topCity}.`);
    console.log(` Canal seleccionado por el algoritmo: ${channel}`);

    const discountCode = `SOCIAL-${eventId.slice(-4).toUpperCase()}`;

    // 3. LANGCHAIN: Generar el copy del post [cite: 192, 220-225]
    const prompt = PromptTemplate.fromTemplate(`
        Crea un post de {channel} para promocionar el evento con ID: {eventId}.
        La audiencia media tiene {avgAge} años y la mayoría son de {topCity}.
        
        El copy debe ser atractivo para esa edad y mencionar la ciudad de forma natural.
        Incluye este código de descuento para los seguidores: {discountCode}.
        Incluye 3 hashtags relevantes. Max 280 caracteres.

        Responde ESTRICTAMENTE en JSON válido con este formato:
        {{"subject": "Copy del Post", "body": "El texto para publicar en la red social"}}
    `);

    console.log(`LLM redactando el post para ${channel}...`);
    const result = await prompt.pipe(llm).invoke({
        channel,
        eventId,
        avgAge,
        topCity,
        discountCode
    });

    let parsedContent = { subject: "Borrador de Post", body: result.content };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log("Error parseando JSON, se usará texto plano.");
    }

    // 4. HUMAN IN THE LOOP: Guardar borrador para aprobación [cite: 193]
    console.log(`Guardando propuesta de Post en la BD...`);
    const draft = await Draft.create({
        eventId: eventId,
        chainUsed: 'age_facebook_campaign',
        subject: `[${channel}] ${parsedContent.subject}`,
        body: parsedContent.body,
        targetAudienceCount: 0, // Es un post público, no se envía a usuarios individuales
        isApproved: false,
        status: 'pending',
        metadata: { channel: channel, targetAge: avgAge, topCity: topCity }
    });

    console.log(`[Chain: Social Media] Post generado (ID: ${draft._id}).`);
    return draft;
}