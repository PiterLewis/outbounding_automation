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
    console.log(`\n💎 [Chain: VIP Upsell] Buscando clientes premium para el evento ${eventId}...`);

    // 1. CONTEXTO DE BD: Buscar VIPs (Usuarios con 3 o más eventos en pastEvents)
    // Usamos un truco de Mongo: si el índice 2 existe, el array tiene al menos 3 elementos.
    const vipAttendees = await Attendee.find({ 'pastEvents.2': { $exists: true } });

    if (vipAttendees.length === 0) {
        console.log("⚠️ No se encontraron clientes VIP.");
        return null;
    }

    const vip = vipAttendees[0]; // Para este ejemplo, le escribimos al primer VIP encontrado
    console.log(`⭐ VIP Encontrado: ${vip.name} (Intereses: ${vip.interests.join(', ')})`);

    const discountPct = 20;
    const safeName = vip.name ? vip.name.split(' ')[0].toUpperCase() : 'CLIENTE';
    const discountCode = `VIP-${safeName}-${discountPct}`;

    // 2. LANGCHAIN: Generación de contenido hiper-personalizado
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

    console.log(`✍️  LLM redactando la oferta exclusiva 1:1...`);
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
        console.log("⚠️ Error parseando JSON, se usará texto plano.");
    }

    // 3. HUMAN IN THE LOOP: Guardar borrador
    console.log(`💾 Guardando borrador VIP en la BD...`);
    const draft = await Draft.create({
        eventId: eventId,
        chainUsed: 'vip_upsell',
        subject: parsedContent.subject,
        body: parsedContent.body,
        targetAudienceCount: 1, // Es 1:1 para este VIP
        isApproved: false,
        status: 'pending',
        metadata: { vipEmail: vip.email, discountCode: discountCode }
    });

    console.log(`✅ [Chain: VIP Upsell] Borrador generado (ID: ${draft._id}).`);
    return draft;
}