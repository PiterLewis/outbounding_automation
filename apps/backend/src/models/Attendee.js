import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    organizerId: String,
    eventId: String,
    eventType: String,
    age: Number,
    city: String,
    ticketPrice: Number,
    checkedIn: Boolean,
    attended: Boolean,
    interests: [String],
    pastEvents: [String],
    surveyAnswered: Boolean
}, { timestamps: true });

export const Attendee = mongoose.model('Attendee', AttendeeSchema);