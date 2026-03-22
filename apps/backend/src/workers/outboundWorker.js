import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { aiRouter } from "../ai/router.js";
import { runLowSalesChain } from "../ai/chains/lowSalesChain.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runVipUpsellChain } from "../ai/chains/vip_upsell.js";
import { runLastMinuteChain } from "../ai/chains/last_minute.js";
import { runAgeFacebookChain } from "../ai/chains/facebook_campaign.js";
import { runPostEventSurveyChain } from "../ai/chains/post_event_survey.js";
import { runCheckinWelcomeChain } from "../ai/chains/checkin_welcome.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const outboundWorker = new Worker('outbounding', async (job) => {
    console.log(`\n[Worker] Iniciando job ${job.id}`);
    const { eventId, prompt } = job.data;

    // Paso 1: el router decide la cadena
    console.log('[Worker] Consultando router IA...');
    const chainDecision = await aiRouter.invoke({ action: prompt });
    const cleanDecision = chainDecision.trim();
    console.log(`[Worker] Decision: ${cleanDecision}`);

    // Paso 2: ejecutar la cadena correspondiente
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

        case 'post_event_survey':
            resultDraft = await runPostEventSurveyChain(eventId, prompt);
            break;

        case 'checkin_welcome':
            resultDraft = await runCheckinWelcomeChain(eventId, job.data.attendeeEmail, prompt);
            break;

        default:
            console.log(`[Worker] Cadena no reconocida: ${cleanDecision}`);
            break;
    }

    return {
        draftId: resultDraft ? resultDraft._id : null,
        chain: cleanDecision,
        status: 'pending_approval'
    };
}, { connection });

outboundWorker.on('completed', (job, returnvalue) => {
    console.log('[Worker] Job completado.');
});

outboundWorker.on('failed', (job, err) => {
    console.error(`[Worker] Error en job ${job.id}:`);
    console.error(err.stack);
});
