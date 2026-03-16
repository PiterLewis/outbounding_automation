import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    age: Number,
    city: String,
    phone: String,
    pushSubscription: String,
    interestedEvents: [String], // IDs de eventos de Eventbrite
    purchasedEvents: [String],
    visitedEvents: [String],
    waitlistEvents: [String],
    notifiedDiscount: [String], // Array de IDs de eventos para control anti-spam
    preferences: [String]
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);