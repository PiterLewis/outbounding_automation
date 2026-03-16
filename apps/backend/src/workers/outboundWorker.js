import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { aiRouter } from "../ai/router.js";
import { runLowSalesChain } from "../ai/chains/lowSalesChain.js"; // <-- Importamos al especialista
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runVipUpsellChain } from "../ai/chains/vip_upsell.js";
import { runLastMinuteChain } from "../ai/chains/last_minute.js";
import { runAgeFacebookChain } from "../ai/chains/facebook_campaign.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const outboundWorker = new Worker('outbounding', async (job) => {
    console.log(`\n[Worker] Iniciando Job ${job.id}`);
    const { eventId, prompt } = job.data;

    // PASO 1: EL ROUTER DECIDE
    console.log(` Consultando al Router de IA...`);
    const chainDecision = await aiRouter.invoke({ action: prompt });
    const cleanDecision = chainDecision.trim();
    console.log(` Decisión del Router: ${cleanDecision}`);

    // PASO 2: EJECUTAR LA CADENA ESPECIALIZADA
    let resultDraft;

    switch (cleanDecision) {
        case 'low_sales_discount':
            resultDraft = await runLowSalesChain(eventId);
            break;

        case 'vip_upsell':
            resultDraft = await runVipUpsellChain(eventId);
            break;

        case 'last_minute_push':
            resultDraft = await runLastMinuteChain(eventId);
            break;

        case 'age_facebook_campaign':
            resultDraft = await runAgeFacebookChain(eventId);
            break;

        default:
            console.log(` Cadena desconocida o genérica: ${cleanDecision}`);
            break;
    }

    return {
        draftId: resultDraft ? resultDraft._id : null,
        chain: cleanDecision,
        status: 'pending_approval'
    };
}, { connection });

outboundWorker.on('completed', (job, returnvalue) => {
    console.log(`🎉 Job completado con éxito.`);
});