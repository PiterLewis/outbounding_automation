import { Router } from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Draft } from '../models/draft.js';
import { Attendee } from '../models/Attendee.js';
import { googleFormsService } from '../services/googleForms.js';
import { notificationService } from '../services/notifications.js';

const router = Router();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

const outboundingQueue = new Queue('outbounding', { connection });

// Enviar prompt al sistema de IA
router.post('/chat', async (req, res) => {
    const { prompt, eventId, attendeeEmail} = req.body;

    if (!prompt || !eventId) {
        return res.status(400).json({ error: "Faltan datos: se requiere 'prompt' y 'eventId'" });
    }

    try {
        const job = await outboundingQueue.add('agent_workflow', { prompt, eventId, attendeeEmail });
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

/**
 * Actualizar preguntas / intro del email en un borrador.
 * Pensado para que el front guarde lo que el usuario edita en el preview.
 * Body (todo opcional):
 *   { questions: [{question, type}], emailIntro: string }
 */
router.patch('/drafts/:id', async (req, res) => {
    try {
        const { questions, emailIntro } = req.body;
        const draft = await Draft.findById(req.params.id);
        if (!draft) return res.status(404).json({ error: "Borrador no encontrado" });

        if (Array.isArray(questions)) {
            draft.metadata.questions = questions;
            draft.body = JSON.stringify(questions);
            draft.markModified('metadata');
        }
        if (typeof emailIntro === 'string') {
            draft.metadata.emailIntro = emailIntro;
            draft.markModified('metadata');
        }

        await draft.save();
        res.status(200).json(draft);
    } catch (error) {
        console.error('[PATCH /drafts/:id] Error:', error);
        res.status(500).json({ error: "Error al actualizar el borrador" });
    }
});

/**
 * Publicar el borrador como un Google Form real.
 * Toma las `questions` actuales del draft, llama a Google Forms API, guarda
 * las URLs en metadata.googleForm y las devuelve.
 *
 * Response: { formId, responderUrl, editUrl }
 */
router.post('/drafts/:id/publish-form', async (req, res) => {
    try {
        const draft = await Draft.findById(req.params.id);
        if (!draft) return res.status(404).json({ error: "Borrador no encontrado" });

        const questions = draft.metadata?.questions || [];
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: "El borrador no tiene preguntas" });
        }

        const title = draft.subject || `Encuesta ${draft.eventId}`;
        const description = draft.metadata?.emailIntro || '';

        const formInfo = await googleFormsService.createFormFromQuestions({
            title,
            description,
            questions
        });

        draft.metadata.googleForm = {
            ...formInfo,
            publishedAt: new Date()
        };
        draft.markModified('metadata');
        await draft.save();

        res.status(200).json(formInfo);
    } catch (error) {
        console.error('[POST /drafts/:id/publish-form] Error:', error);
        res.status(500).json({ error: error.message || "Error al publicar el Google Form" });
    }
});

/**
 * Enviar la encuesta por email a los asistentes del draft.
 * Usa `metadata.emailIntro` + `metadata.googleForm.responderUrl`.
 * Marca el draft como 'sent' y los asistentes como surveyAnswered.
 *
 * Response: { sent: number, failed: number }
 */
router.post('/drafts/:id/send', async (req, res) => {
    try {
        const draft = await Draft.findById(req.params.id);
        if (!draft) return res.status(404).json({ error: "Borrador no encontrado" });

        const formUrl = draft.metadata?.googleForm?.responderUrl;
        if (!formUrl) {
            return res.status(400).json({ error: "El borrador aún no tiene un Google Form publicado. Llama antes a /publish-form." });
        }

        const recipients = draft.metadata?.recipientEmails || [];
        if (recipients.length === 0) {
            return res.status(400).json({ error: "El borrador no tiene destinatarios" });
        }

        const eventName = draft.metadata?.eventName || 'el evento';
        const intro = draft.metadata?.emailIntro || `Gracias por asistir a ${eventName}. Tu opinión nos ayuda un montón a mejorar.`;
        const subject = `¿Qué te pareció ${eventName}? Cuéntanos (2 min)`;

        // Recuperamos nombre del asistente para personalizar el saludo
        const attendees = await Attendee.find({ email: { $in: recipients } });
        const nameByEmail = Object.fromEntries(attendees.map(a => [a.email, a.name || '']));

        const results = await Promise.allSettled(
            recipients.map(email => {
                const name = nameByEmail[email] || '';
                const html = `
                    <p>Hola${name ? ` ${name}` : ''},</p>
                    <p>${intro}</p>
                    <p style="margin: 24px 0;">
                        <a href="${formUrl}"
                           style="display:inline-block; padding:12px 24px; background:#4f46e5; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600;">
                           Responder la encuesta
                        </a>
                    </p>
                    <p style="color:#666; font-size:13px;">
                        O copia este enlace en tu navegador:<br/>
                        <a href="${formUrl}">${formUrl}</a>
                    </p>
                `;
                return notificationService.sendEmail(email, subject, html);
            })
        );

        const sent = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
        const failed = results.length - sent;

        // Marcar draft como enviado
        draft.status = 'sent';
        draft.isApproved = true;
        await draft.save();

        // Marcar asistentes como surveyAnswered (para que no se vuelva a enviar)
        await Attendee.updateMany(
            { email: { $in: recipients } },
            { $set: { surveyAnswered: true } }
        );

        res.status(200).json({ sent, failed, total: recipients.length });
    } catch (error) {
        console.error('[POST /drafts/:id/send] Error:', error);
        res.status(500).json({ error: error.message || "Error al enviar la encuesta" });
    }
});

export default router;
