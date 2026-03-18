import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { notificationService } from '../services/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function runDiagnostics() {
    console.log('[Diagnostico] Iniciando test de APIs\n');

    // Eventbrite
    console.log('[Diagnostico] 1. Probando Eventbrite...');
    try {
        const ebRes = await fetch('https://www.eventbriteapi.com/v3/users/me/', {
            headers: { 'Authorization': `Bearer ${process.env.EB_TOKEN}` }
        });
        const ebData = await ebRes.json();
        if (ebData.error) throw new Error(ebData.error_description);
        console.log(`  OK - Conectado como: ${ebData.emails[0].email}`);
    } catch (e) {
        console.log('  FALLO -', e.message);
    }

    // Resend
    console.log('\n[Diagnostico] 2. Probando Resend...');
    const emailRes = await notificationService.sendEmail(
        'santiigdd@gmail.com',
        'Test de Diagnostico MVP',
        '<h1>Las llaves de Resend funcionan</h1>'
    );
    console.log(emailRes.success ? '  OK' : `  FALLO: ${emailRes.error?.message || emailRes.error}`);

    // Twilio
    console.log('\n[Diagnostico] 3. Probando Twilio...');
    const smsRes = await notificationService.sendSMS(
        '+34683433503',
        'Las llaves de Twilio del MVP funcionan.'
    );
    console.log(smsRes.success ? `  OK - ID: ${smsRes.result?.sid}` : `  FALLO: ${smsRes.error?.message}`);

    // OneSignal
    console.log('\n[Diagnostico] 4. Probando OneSignal...');
    const pushRes = await notificationService.sendPush(['test_user_id'], 'Prueba de conexion OneSignal');
    if (pushRes.success && !pushRes.data?.errors) {
        console.log('  OK - Autenticacion correcta');
    } else {
        console.log(`  FALLO: ${JSON.stringify(pushRes.data?.errors || pushRes.error)}`);
    }

    // Facebook Graph API
    console.log('\n[Diagnostico] 5. Probando Facebook Graph API...');
    const fbRes = await notificationService.createFacebookPost('Prueba de conexion del backend.');
    console.log(fbRes.success && !fbRes.data?.error ? `  OK - Post ID: ${fbRes.data?.id}` : `  FALLO: ${fbRes.data?.error?.message}`);

    console.log('\n[Diagnostico] Test finalizado');
    process.exit(0);
}

runDiagnostics();