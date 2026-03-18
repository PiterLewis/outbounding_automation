import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { runAgeFacebookChain } from '../ai/chains/facebook_campaign.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const eventId = '1985454109689';

        console.log('[Test] Disparando campana de Facebook...');
        const result = await runAgeFacebookChain(eventId);
        console.log('\n[Test] Resultado:', result);

    } catch (error) {
        console.error('[Test] Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
runTest();