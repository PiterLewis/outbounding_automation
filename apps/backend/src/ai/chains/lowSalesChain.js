import { User } from "../../models/user.js";
import { notificationService } from "../../services/notifications.js";
import { eventbriteService } from "../../services/eventbrite.js";
import { llm } from "../model.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { Draft } from "../../models/draft.js"; // Importamos el modelo de borradores

export async function runLowSalesChain(eventId) {
    console.log(`\n[LowSales] Evaluando ventas para evento ${eventId}`);

    // 1. Leer métricas reales de Eventbrite
    const metrics = await eventbriteService.getEventMetrics(eventId);
    console.log(`[LowSales] Vendidas ${metrics.quantity_sold}/${metrics.quantity_total} (${(metrics.pct_sold * 100).toFixed(2)}%)`);

    // 2. Si las ventas superan el 40%, no se activa la promoción
    if (metrics.pct_sold >= 0.4) {
        console.log('[LowSales] Ventas suficientes, abortando promoción');
        return { status: 'skipped', reason: 'sales_ok' };
    }

    // 3. Buscar usuarios interesados en el evento
    const users = await User.find({
        interestedEvents: eventId,
    });

    if (users.length === 0) {
        console.log('[LowSales] No hay usuarios pendientes para este evento');
        return { status: 'skipped', reason: 'no_users' };
    }

    // 4. IA redacta el email de promoción
    const promoCode = `SALVA-${Date.now().toString().slice(-4)}`;
    console.log(`[LowSales] Generando campaña con código ${promoCode}`);

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

    // Separar la respuesta de la IA en Asunto y Cuerpo
    const parts = response.content.split('| CUERPO:');
    const subject = parts[0].replace('ASUNTO:', '').trim();
    const body = parts[1]?.trim() || response.content;

    // 5. Crear el objeto de descuento en Eventbrite
    console.log('[LowSales] Creando descuento del 20% en Eventbrite');
    try {
        await eventbriteService.createDiscount(eventId, promoCode, "20.00");
    } catch (err) {
        console.error('[LowSales] Error al crear descuento en Eventbrite (posible ID de prueba)');
    }

    // 6. GUARDAR COMO BORRADOR EN MONGODB
    // Esto es lo que permite que el botón "Aprobar" de la interfaz tenga algo que enviar
    console.log('[LowSales] Guardando borrador en la base de datos...');
    const nuevoBorrador = await Draft.create({
        eventId: eventId,
        chainUsed: 'low_sales_discount',
        subject: subject,
        body: body,
        targetAudienceCount: users.length,
        status: 'pending',
        metadata: { promoCode }
    });

    /* 7. ENVÍO AUTOMÁTICO DESACTIVADO
       Comentamos el envío para que el correo solo salga cuando 
       le des al botón "Aprobar y Programar" en el frontend.

    for (const user of users) {
        await notificationService.sendEmail(user.email, subject, body);
    }
    */


    console.log('[LowSales] Cadena completada exitosamente');

    // IMPORTANTE: Devolvemos draftId, subject y body para el ChatPanel
    return { 
        status: 'completed', 
        draftId: nuevoBorrador._id,
        notifiedCount: users.length, 
        promoCode,
        subject,
        body
    };
}