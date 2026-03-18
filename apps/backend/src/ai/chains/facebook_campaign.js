import { Attendee } from "../../models/Attendee.js";
import { User } from "../../models/user.js";
import { notificationService } from "../../services/notifications.js";
import { eventbriteService } from "../../services/eventbrite.js";
import { llm } from "../model.js";
import { PromptTemplate } from "@langchain/core/prompts";

export async function runAgeFacebookChain(eventId) {
    console.log(`\n[Facebook] Iniciando campana para evento ${eventId}`);

    // Calcular media de edad con aggregate
    const stats = await Attendee.aggregate([
        { $match: { eventId: eventId } },
        { $group: { _id: null, avgAge: { $avg: "$age" }, topCity: { $first: "$city" } } }
    ]);
    const avgAge = Math.round(stats[0]?.avgAge || 28);
    const topCity = stats[0]?.topCity || "Madrid";

    // Decidir canal segun edad: >=30 Facebook, <30 Instagram
    const channel = 'Facebook';
    if (channel !== 'Facebook') {
        console.log(`[Facebook] Audiencia joven (${avgAge} anios), saltando FB`);
        return { status: 'skipped', reason: 'young_audience' };
    }

    // Obtener metricas del evento
    const metrics = await eventbriteService.getEventMetrics(eventId);

    // Pool de imagenes para variar el post
    const eventPhotos = [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad"
    ];
    const selectedPhoto = eventPhotos[Math.floor(Math.random() * eventPhotos.length)];

    // IA redacta el copy del post
    console.log(`[Facebook] Generando copy para audiencia de ${avgAge} anios`);
    const prompt = PromptTemplate.fromTemplate(`
        Eres CM de eventos. Crea un post de {channel} para el evento ID {eventId}.
        Audiencia: {avgAge} años en {city}. 
        Usa 2 emojis y 2 hashtags. Máximo 280 caracteres.
    `);
    const response = await prompt.pipe(llm).invoke({
        channel, eventId, avgAge, city: topCity
    });

    // Publicar en Facebook
    console.log('[Facebook] Publicando post con imagen...');
    await notificationService.createFacebookPost(response.content, selectedPhoto);

    // Crear codigo de descuento
    const promoCode = `FBVISUAL-${Date.now().toString().slice(-4)}`;
    await eventbriteService.createDiscount(eventId, promoCode, "15.00");

    // Notificar a usuarios interesados
    const users = await User.find({ interestedEvents: eventId }).limit(3);
    for (const user of users) {
        await notificationService.sendEmail(
            user.email,
            "Novedades en nuestro Facebook",
            `Te hemos dejado un regalo visual y un código: <b>${promoCode}</b>`
        );
    }

    console.log('[Facebook] Cadena completada');
    return { status: 'posted', photo: selectedPhoto, promoCode };
}