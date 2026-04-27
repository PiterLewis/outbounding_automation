import { Resend } from 'resend';
import twilio from 'twilio';

// Inicializar clientes de notificaciones (solo si las keys existen)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export const notificationService = {
    // Enviar email via Resend
    async sendEmail(to, subject, htmlContent) {
        try {
            console.log(`[Email] Enviando a ${to}`);
            const data = await resend.emails.send({
                from: 'Eventos <onboarding@resend.dev>',
                to: to,
                subject: subject,
                html: htmlContent
            });
            if (data.error) {
                console.error(`[Email] Error de Resend: ${data.error.message}`);
                return { success: false, error: data.error };
            }
            return { success: true, data };
        } catch (error) {
            console.error('[Email] Error:', error);
            return { success: false, error };
        }
    },

    // Enviar SMS via Twilio
    async sendSMS(to, message) {
        try {
            console.log(`[SMS] Enviando a ${to}`);
            const result = await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_NUMBER,
                to: to
            });
            return { success: true, result };
        } catch (error) {
            console.error('[SMS] Error:', error);
            return { success: false, error };
        }
    },

    // Enviar push via OneSignal
    async sendPush(externalUserIds, message) {
        try {
            console.log(`[Push] Enviando a ${externalUserIds.join(', ')}`);
            const response = await fetch('https://onesignal.com/api/v1/notifications', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    app_id: process.env.ONESIGNAL_APP_ID,
                    include_external_user_ids: externalUserIds,
                    contents: { en: message, es: message }
                })
            });
            return { success: true, data: await response.json() };
        } catch (error) {
            console.error('[Push] Error:', error);
            return { success: false, error };
        }
    },

    // Publicar post en Facebook
    async createFacebookPost(message, imageUrl = null) {
        try {
            const endpoint = imageUrl ? 'photos' : 'feed';
            const url = `https://graph.facebook.com/v19.0/${process.env.FB_PAGE_ID}/${endpoint}`;

            const body = {
                access_token: process.env.FB_ACCESS_TOKEN,
                message: message
            };

            if (imageUrl) {
                body.url = imageUrl;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error.message);

            console.log(`[Facebook] Post publicado (${endpoint})`);
            return { success: true, id: data.id };
        } catch (error) {
            console.error('[Facebook] Error:', error.message);
            return { success: false, error: error.message };
        }
    }
};