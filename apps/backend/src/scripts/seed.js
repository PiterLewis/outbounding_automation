import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { Attendee } from '../models/Attendee.js';
import { Draft } from '../models/Draft.js';

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventbrite_challenge';

async function seedDatabase() {
    try {
        await mongoose.connect(mongoURI);
        console.log(' Conectado a MongoDB. Limpiando datos antiguos...');

        await User.deleteMany({});
        await Attendee.deleteMany({});
        await Draft.deleteMany({});

        console.log('Sembrando usuarios falsos...');

        // 1. Usuarios normales (Interesados en nuestro evento fatal EVT-999)
        const users = await User.insertMany([
            { email: 'maria@ejemplo.com', name: 'María', age: 28, city: 'Madrid', interestedEvents: ['EVT-999'] },
            { email: 'juan@ejemplo.com', name: 'Juan', age: 35, city: 'Barcelona', interestedEvents: ['EVT-999'] },
            { email: 'lucia@ejemplo.com', name: 'Lucía', age: 22, city: 'Valencia', interestedEvents: ['EVT-999'] }
        ]);

        console.log(' Sembrando asistentes e historial VIP...');

        // 2. Asistente VIP (Ha ido a 3 eventos de nuestro organizador)
        await Attendee.insertMany([
            {
                email: 'vip@ejemplo.com',
                organizerId: 'ORG-1',
                pastEvents: ['EVT-100', 'EVT-101', 'EVT-102'], // Cumple regla >= 3 eventos
                interests: ['Música', 'Tecnología'],
                ticketPrice: 150,
                name: 'Carlos VIP'
            },
            // Asistente normal (solo 1 evento)
            {
                email: 'nuevo@ejemplo.com',
                organizerId: 'ORG-1',
                pastEvents: ['EVT-200'],
                interests: ['Arte'],
                ticketPrice: 20,
                name: 'Ana Novata'
            }
        ]);

        console.log(' ¡Base de datos poblada con éxito!');
        process.exit(0);
    } catch (error) {
        console.error(' Error sembrando:', error);
        process.exit(1);
    }
}

seedDatabase();