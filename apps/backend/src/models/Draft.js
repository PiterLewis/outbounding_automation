import mongoose from 'mongoose';

const DraftSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    chainUsed: { type: String, required: true }, // Ej: 'low_sales_discount', 'vip_upsell'
    subject: String,
    body: String,
    targetAudienceCount: Number, // A cuántos usuarios impactará
    isApproved: { type: Boolean, default: false }, // ESTRICTO: Siempre false por defecto
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'sent'], default: 'pending' },
    metadata: mongoose.Schema.Types.Mixed // Para guardar el código de descuento generado, etc.
}, { timestamps: true });

export const Draft = mongoose.model('Draft', DraftSchema);