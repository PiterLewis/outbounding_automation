// import mongoose from 'mongoose';
// import { User } from '../models/user.js';
// import { Attendee } from '../models/Attendee.js';
// import { Draft } from '../models/Draft.js';

// const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventbrite_challenge';

// async function seedDatabase() {
//     try {
//         await mongoose.connect(mongoURI);
//         console.log('[Seed] Conectado a MongoDB, limpiando datos...');

//         await User.deleteMany({});
//         await Attendee.deleteMany({});
//         await Draft.deleteMany({});

//         console.log('[Seed] Insertando usuarios...');

//         // Usuarios interesados en el evento EVT-999
//         const users = await User.insertMany([
//             { email: 'maria@ejemplo.com', name: 'María', age: 28, city: 'Madrid', interestedEvents: ['EVT-999'] },
//             { email: 'juan@ejemplo.com', name: 'Juan', age: 35, city: 'Barcelona', interestedEvents: ['EVT-999'] },
//             { email: 'lucia@ejemplo.com', name: 'Lucía', age: 22, city: 'Valencia', interestedEvents: ['EVT-999'] }
//         ]);

//         console.log('[Seed] Insertando asistentes...');

//         // Asistente VIP (3+ eventos) y asistente normal
//         await Attendee.insertMany([
//             {
//                 email: 'vip@ejemplo.com',
//                 organizerId: 'ORG-1',
//                 pastEvents: ['EVT-100', 'EVT-101', 'EVT-102'],
//                 interests: ['Música', 'Tecnología'],
//                 ticketPrice: 150,
//                 name: 'Carlos VIP'
//             },
//             {
//                 email: 'nuevo@ejemplo.com',
//                 organizerId: 'ORG-1',
//                 pastEvents: ['EVT-200'],
//                 interests: ['Arte'],
//                 ticketPrice: 20,
//                 name: 'Ana Novata'
//             }
//         ]);

//         console.log('[Seed] Base de datos poblada correctamente');
//         process.exit(0);
//     } catch (error) {
//         console.error('[Seed] Error:', error);
//         process.exit(1);
//     }
// }

// seedDatabase();

import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { Attendee } from '../models/attendee.js';
import { Draft } from '../models/draft.js';

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventbrite_challenge';

async function seedDatabase() {
    try {
        await mongoose.connect(mongoURI);
        console.log('[Seed] Conectado a MongoDB, limpiando datos...');

        await User.deleteMany({});
        await Attendee.deleteMany({});
        await Draft.deleteMany({});

        console.log('[Seed] Insertando usuarios...');

        await User.insertMany([
            { email: 'afernandz26@gmail.com', name: 'María', age: 28, city: 'Madrid', interestedEvents: ['EVT-999'] },
            { email: 'juan.batta2005@gmail.com', name: 'Juan', age: 35, city: 'Barcelona', interestedEvents: ['EVT-999'] },
            { email: 'gepetotallaveta@gmail.com', name: 'Lucía', age: 22, city: 'Valencia', interestedEvents: ['EVT-999'] }
        ]);

        console.log('[Seed] Insertando asistentes...');

        await Attendee.insertMany([
            // VIP — 3+ eventos pasados
            {
                email: 'victorbenito8@gmail.com',
                name: 'Carlos VIP',
                organizerId: 'ORG-1',
                eventId: 'EVT-999',
                eventType: 'Tecnología',
                age: 35,
                city: 'Madrid',
                ticketPrice: 150,
                checkedIn: true,
                attended: true,
                surveyAnswered: false,
                interests: ['Música', 'Tecnología'],
                pastEvents: ['EVT-100', 'EVT-101', 'EVT-102']
            },
            // Asistente normal — hizo check-in, pendiente de encuesta
            {
                email: 'victorbenito8@gmail.com',
                name: 'María',
                organizerId: 'ORG-1',
                eventId: 'EVT-999',
                eventType: 'Tecnología',
                age: 28,
                city: 'Madrid',
                ticketPrice: 40,
                checkedIn: true,
                attended: true,
                surveyAnswered: false,
                interests: ['Arte', 'Tecnología'],
                pastEvents: ['EVT-200']
            },
            // Asistente que NO hizo check-in — no debe aparecer en la encuesta
            {
                email: 'nuevo@ejemplo.com',
                name: 'Ana Novata',
                organizerId: 'ORG-1',
                eventId: 'EVT-999',
                eventType: 'Tecnología',
                age: 22,
                city: 'Valencia',
                ticketPrice: 20,
                checkedIn: false,
                attended: false,
                surveyAnswered: false,
                interests: ['Arte'],
                pastEvents: []
            }
        ]);

        console.log('[Seed] Base de datos poblada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('[Seed] Error:', error);
        process.exit(1);
    }
}

seedDatabase();
