import { User } from "../../models/user.js";
import { notificationService } from "../../services/notifications.js";
import { eventbriteService } from "../../services/eventbrite.js";
import { llm } from "../model.js";
import { PromptTemplate } from "@langchain/core/prompts";

export async function runLowSalesChain(eventId) {
    console.log(`\n[LowSales] Evaluando ventas para evento ${eventId}`);

    // Leer metricas reales de Eventbrite
    const metrics = await eventbriteService.getEventMetrics(eventId);
    console.log(`[LowSales] Vendidas ${metrics.quantity_sold}/${metrics.quantity_total} (${(metrics.pct_sold * 100).toFixed(2)}%)`);

    // Si las ventas superan el 40%, no se activa la promocion
    if (metrics.pct_sold >= 0.4) {
        console.log('[LowSales] Ventas suficientes, abortando promocion');
        return { status: 'skipped', reason: 'sales_ok' };
    }

    // Buscar usuarios interesados que no hayan sido notificados
    const users = await User.find({
        interestedEvents: eventId,
        notifiedDiscount: { $ne: eventId }
    });

    if (users.length === 0) {
        console.log('[LowSales] No hay usuarios pendientes para este evento');
        return { status: 'skipped', reason: 'no_users' };
    }

    // IA redacta el email de promocion
    const promoCode = `SALVA-${Date.now().toString().slice(-4)}`;
    console.log(`[LowSales] Generando campana con codigo ${promoCode}`);

    const prompt = PromptTemplate.fromTemplate(`
        El evento (ID: {eventId}) tiene un aforo de {total} personas, pero solo hemos vendido {sold}.
        Crea el asunto (max 50 chars) y el cuerpo (max 40 palabras) de un email urgente para vender las restantes.
        Incluye el código de 20% descuento: {code}.
        Responde estrictamente en este formato: ASUNTO: [asunto] | CUERPO: [cuerpo]
    `);

    const response = await prompt.pipe(llm).invoke({
        eventId,
        total: metrics.quantity_total,
        sold: metrics.quantity_sold,
        code: promoCode
    });

    const parts = response.content.split('| CUERPO:');
    const subject = parts[0].replace('ASUNTO:', '').trim();
    const body = parts[1]?.trim() || response.content;

    // Crear descuento en Eventbrite
    console.log('[LowSales] Creando descuento del 20% en Eventbrite');
    await eventbriteService.createDiscount(eventId, promoCode, "20.00");

    // Enviar emails a los usuarios
    console.log(`[LowSales] Enviando ${users.length} correos`);
    for (const user of users) {
        await notificationService.sendEmail(user.email, subject, body);
    }

    // Marcar usuarios como notificados (anti-spam)
    await User.updateMany(
        { _id: { $in: users.map(u => u._id) } },
        { $push: { notifiedDiscount: eventId } }
    );

    console.log('[LowSales] Cadena completada');
    return { status: 'completed', notifiedCount: users.length, promoCode };
}