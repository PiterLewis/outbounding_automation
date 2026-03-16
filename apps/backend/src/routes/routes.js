import { Router } from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const router = Router();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

const outboundingQueue = new Queue('outbounding', { connection });

// 1. Endpoint para enviar el prompt (el que ya tienes)
router.post('/chat', async (req, res) => {
    const { prompt, eventId } = req.body;

    if (!prompt || !eventId) {
        return res.status(400).json({ error: "Faltan datos: se requiere 'prompt' y 'eventId'" });
    }

    try {
        const job = await outboundingQueue.add('agent_workflow', { prompt, eventId });
        res.status(201).json({
            message: "La IA está analizando los datos y preparando la campaña...",
            jobId: job.id,
            status: "queued"
        });
    } catch (error) {
        res.status(500).json({ error: "Error al encolar la tarea." });
    }
});

// 2. NUEVO: Endpoint para consultar el estado del Job
router.get('/chat/status/:jobId', async (req, res) => {
    try {
        const job = await outboundingQueue.getJob(req.params.jobId);

        if (!job) {
            return res.status(404).json({ error: "Trabajo no encontrado" });
        }

        // Obtiene el estado actual (waiting, active, completed, failed)
        const state = await job.getState();
        // Si ha terminado, aquí estará el borrador generado por LangChain
        const result = job.returnvalue;

        res.status(200).json({
            jobId: job.id,
            state: state,
            // Solo devolvemos el resultado si el estado es 'completed'
            result: state === 'completed' ? result : null
        });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar el trabajo" });
    }
});

export default router;