import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    age: Number,
    city: String,
    phone: String,
    pushSubscription: String,
    interestedEvents: [String],
    purchasedEvents: [String],
    visitedEvents: [String],
    waitlistEvents: [String],
    notifiedDiscount: [String],
    preferences: [String]
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
