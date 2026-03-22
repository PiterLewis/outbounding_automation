import mongoose from 'mongoose';

const DraftSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    chainUsed: { type: String, required: true },
    subject: String,
    body: String,
    targetAudienceCount: Number,
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'sent'], default: 'pending' },
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export const Draft = mongoose.models.Draft || mongoose.model('Draft', DraftSchema);
