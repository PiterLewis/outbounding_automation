import { Attendee } from "../../models/attendee.js";
import { User } from "../../models/user.js";
import { eventbriteService } from "../../services/eventbrite.js";
import { Draft } from "../../models/draft.js";
import { llm } from "../model.js";
import { PromptTemplate } from "@langchain/core/prompts";

export async function runAgeFacebookChain(eventId) {
    console.log(`\n[Facebook] Iniciando cadena para evento ${eventId}`);

    // Calcular media de edad
    const stats = await Attendee.aggregate([
        { $match: { eventId } },
        { $group: { _id: null, avgAge: { $avg: "$age" }, topCity: { $first: "$city" } } }
    ]);
    const avgAge = Math.round(stats[0]?.avgAge || 28);
    const topCity = stats[0]?.topCity || "Madrid";

    const channel = 'Facebook';

    // Obtener métricas del evento
    await eventbriteService.getEventMetrics(eventId);

    // Pool de imágenes para el post
    const eventPhotos = [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad"
    ];
    const selectedPhoto = eventPhotos[Math.floor(Math.random() * eventPhotos.length)];

    // IA redacta el copy
    console.log(`[Facebook] Generando copy para audiencia de ${avgAge} años en ${topCity}`);
    const prompt = PromptTemplate.fromTemplate(`
        Eres Community Manager de eventos. Crea un post de {channel} para el evento ID {eventId}.
        Audiencia media: {avgAge} años, ciudad principal: {city}.
        Requisitos: usa entre 2 y 4 emojis, incluye exactamente 3 hashtags relevantes al final,
        máximo 280 caracteres, tono cercano y con llamada a la acción.
    `);
    const response = await prompt.pipe(llm).invoke({ channel, eventId, avgAge, city: topCity });
    const postContent = response.content.trim();

    // Código de descuento reservado para cuando se apruebe
    const promoCode = `FB-${Date.now().toString().slice(-4)}`;

    // Guardar como borrador para revisión — NO publicar todavía
    console.log('[Facebook] Guardando borrador para revisión humana...');
    const draft = await Draft.create({
        eventId,
        chainUsed: 'age_facebook_campaign',
        subject: `Post Facebook · Evento ${eventId}`,
        body: postContent,
        status: 'pending',
        isApproved: false,
        metadata: { channel, imageUrl: selectedPhoto, promoCode, avgAge, topCity }
    });

    console.log(`[Facebook] Borrador listo: ${draft._id}`);
    return draft;
}