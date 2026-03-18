import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { Attendee } from "../../models/Attendee.js";
import { Draft } from "../../models/Draft.js";

const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-001",
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
});

export async function runVipUpsellChain(eventId) {
    console.log(`\n[VipUpsell] Buscando clientes premium para evento ${eventId}`);

    // Buscar VIPs (usuarios con 3+ eventos pasados)
    const vipAttendees = await Attendee.find({ 'pastEvents.2': { $exists: true } });

    if (vipAttendees.length === 0) {
        console.log('[VipUpsell] No se encontraron clientes VIP');
        return null;
    }

    const vip = vipAttendees[0];
    console.log(`[VipUpsell] VIP encontrado: ${vip.name} (Intereses: ${vip.interests.join(', ')})`);

    const discountPct = 20;
    const safeName = vip.name ? vip.name.split(' ')[0].toUpperCase() : 'CLIENTE';
    const discountCode = `VIP-${safeName}-${discountPct}`;

    // Generar contenido personalizado con IA
    const prompt = PromptTemplate.fromTemplate(`
        Tenemos un cliente VIP llamado {vipName}.
        Le interesan temas de: {vipInterests}.
        Ha asistido a {eventCount} de nuestros eventos en el pasado.
        
        Hay un nuevo evento disponible con el ID: {eventId}.
        
        Redacta un correo EXCLUSIVO para él, agradeciendo su lealtad pasada y ofreciéndole un {discountPct}% de descuento.
        Incluye su código personal: {discountCode}.
        Tono: Muy cercano, premium, haciéndole sentir especial.

        Responde ESTRICTAMENTE en JSON válido con este formato:
        {{"subject": "Tu asunto", "body": "El cuerpo del mensaje"}}
    `);

    console.log('[VipUpsell] Generando oferta personalizada...');
    const result = await prompt.pipe(llm).invoke({
        vipName: vip.name,
        vipInterests: vip.interests.join(', '),
        eventCount: vip.pastEvents.length,
        eventId: eventId,
        discountPct: discountPct,
        discountCode: discountCode
    });

    let parsedContent = { subject: "Oferta Exclusiva", body: result.content };
    try {
        const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedContent = JSON.parse(cleanJson);
    } catch (e) {
        console.log('[VipUpsell] Error parseando JSON, usando texto plano');
    }

    // Guardar borrador para aprobacion manual
    console.log('[VipUpsell] Guardando borrador en BD...');
    const draft = await Draft.create({
        eventId: eventId,
        chainUsed: 'vip_upsell',
        subject: parsedContent.subject,
        body: parsedContent.body,
        targetAudienceCount: 1,
        isApproved: false,
        status: 'pending',
        metadata: { vipEmail: vip.email, discountCode: discountCode }
    });

    console.log(`[VipUpsell] Borrador generado (ID: ${draft._id})`);
    return draft;
}