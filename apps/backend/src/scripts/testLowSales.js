import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { runLowSalesChain } from '../ai/chains/lowSalesChain.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function runTest() {
    console.log('[Test] Iniciando prueba de cadena Low Sales');
    console.log('[Test] Servicios: Eventbrite + OpenAI + MongoDB + Resend');

    try {
        console.log('[Test] Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        const eventId = '1985454109689';

        // Preparar usuario de prueba
        console.log('[Test] Preparando usuario de prueba...');
        await User.findOneAndUpdate(
            { email: 'santiigdd@gmail.com' },
            {
                name: 'Santiago',
                $addToSet: { interestedEvents: eventId },
                $pull: { notifiedDiscount: eventId }
            },
            { upsert: true, new: true }
        );

        console.log('[Test] Ejecutando cadena...\n');
        const result = await runLowSalesChain(eventId);

        console.log('\n[Test] Resultado:', result);

    } catch (error) {
        console.error('[Test] Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

runTest();