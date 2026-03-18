import { Router } from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Draft } from '../models/Draft.js';

const router = Router();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

const outboundingQueue = new Queue('outbounding', { connection });

// Enviar prompt al sistema de IA
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

// Consultar estado de un job
router.get('/chat/status/:jobId', async (req, res) => {
    try {
        const job = await outboundingQueue.getJob(req.params.jobId);

        if (!job) {
            return res.status(404).json({ error: "Trabajo no encontrado" });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        res.status(200).json({
            jobId: job.id,
            state: state,
            result: state === 'completed' ? result : null
        });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar el trabajo" });
    }
});

// Obtener borrador por ID
router.get('/drafts/:id', async (req, res) => {
    try {
        const draft = await Draft.findById(req.params.id);
        if (!draft) {
            return res.status(404).json({ error: "Borrador no encontrado" });
        }
        res.status(200).json(draft);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar el borrador" });
    }
});
export default router;