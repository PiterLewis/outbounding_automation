import { Router } from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const router = Router();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

// Conectamos a la misma cola que el Worker
const outboundingQueue = new Queue('outbounding', { connection });

router.post('/chat', async (req, res) => {
    const { prompt, eventId } = req.body;

    if (!prompt || !eventId) {
        return res.status(400).json({ error: "Faltan datos: se requiere 'prompt' y 'eventId'" });
    }

    try {
        // Encolamos el trabajo para que el Worker lo recoja en segundo plano
        const job = await outboundingQueue.add('agent_workflow', { prompt, eventId });

        // Respondemos INMEDIATAMENTE al frontend
        res.status(201).json({
            message: "La IA está analizando los datos y preparando la campaña...",
            jobId: job.id,
            status: "queued"
        });
    } catch (error) {
        res.status(500).json({ error: "Error al encolar la tarea." });
    }
});

export default router;