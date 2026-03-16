import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { User } from "../../models/user.js";
import { Draft } from "../../models/Draft.js";

// Instanciamos el modelo para esta cadena específica
const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
});

export async function runLowSalesChain(eventId) {
    console.log(`\n [Chain: Low Sales] Iniciando rescate para el evento ${eventId}...`);

    // 1. CONTEXTO DE BD: Buscamos usuarios interesados que no hayan recibido descuento 
    const targetUsers = await User.find({
        interestedEvents: eventId,
        notifiedDiscount: { $ne: eventId }
    });
    const audienceCount = targetUsers.length;
    console.log(` Usuarios objetivo encontrados en Mongo: ${audienceCount}`);

    // Simulación de datos de Eventbrite (Métricas) [cite: 136, 137]
    const pctSold = "40%";
    const daysLeft = 2;
    const discountCode = `SOS-${eventId.slice(-4).toUpperCase()}`; // Código autogenerado [cite: 166]

    // 2. LANGCHAIN: Generación de contenido [cite: 161, 162, 163, 164, 165, 166, 167]
    const prompt = PromptTemplate.fromTemplate(`
        El evento {eventId} tiene solo {pctSold} de entradas vendidas.
        Faltan {daysLeft} días. Crea un email persuasivo con:
        - Asunto urgente (max 60 chars)
        - Cuerpo corto (max 80 words)
        - Incluye el código descuento: {discountCode}
        - Tono: amigable pero urgente

        Responde ESTRICTAMENTE en JSON válido con este formato:
        {{"subject": "Tu asunto", "body": "El cuerpo del mensaje"}}
    `);

    // Ejecutamos la cadena
    console.log(`LLM redactando el correo persuasivo...`);
    const result = await prompt.pipe(llm).invoke({
        eventId,
        pctSold,
        daysLeft,
        discountCode
    });

    // Parseamos la respuesta JSON del LLM
    let parsedContent = { subject: "Aviso Urgente", body: result.content };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log(" Error parseando JSON, se usará texto plano.");
    }

    // 3. HUMAN IN THE LOOP: Guardar borrador en MongoDB
    console.log(` Guardando borrador en la Base de Datos...`);
    const draft = await Draft.create({
        eventId: eventId,
        chainUsed: 'low_sales_discount',
        subject: parsedContent.subject,
        body: parsedContent.body,
        targetAudienceCount: audienceCount,
        isApproved: false, // ¡Bloqueo de seguridad activado!
        status: 'pending',
        metadata: { discountCode } // Guardamos el código para cuando se envíe de verdad
    });

    console.log(` [Chain: Low Sales] Borrador generado (ID: ${draft._id}).`);
    return draft;
}