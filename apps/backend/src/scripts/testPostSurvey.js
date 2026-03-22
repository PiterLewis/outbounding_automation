import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { runPostEventSurveyChain } from '../ai/chains/post_event_survey.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function runTest() {
    console.log('[Test] Iniciando prueba de cadena Post Event Survey');
    console.log('[Test] Servicios: MongoDB + OpenRouter');

    try {
        console.log('[Test] Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        const eventId = 'EVT-999';

        console.log('[Test] Ejecutando cadena...\n');
        const result = await runPostEventSurveyChain(eventId);

        console.log('\n[Test] Resultado:', result);

    } catch (error) {
        console.error('[Test] Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

runTest();

// EN POSTMAN
// 1. Encolar el job
// POST http://localhost:4000/api/chat
// json{
//     "prompt": "el evento ha terminado, necesito encuesta post-evento",
//     "eventId": "EVT-999"
// }
// 2. Ver el borrador directamente con el ID de los logs
// GET http://localhost:4000/api/drafts/ID_DEL_BORRADOR
// El status endpoint no es muy útil porque el job termina en segundos — es más rápido coger el ID directo de los logs del servidor.
