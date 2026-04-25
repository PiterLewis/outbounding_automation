/**
 * Script one-time para obtener un refresh_token de Google.
 *
 * USO (desde la raíz del repo):
 *   1. En Google Cloud Console, crea un proyecto, habilita "Google Forms API" y
 *      "Google Drive API", crea credenciales OAuth 2.0 de tipo "Desktop app".
 *   2. Pon GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.
 *   3. Ejecuta:
 *        node --env-file=./.env apps/backend/src/scripts/getGoogleRefreshToken.js
 *   4. Abre la URL que imprime, loguéate con la cuenta de Google que será
 *      "dueña" de los forms generados, acepta los permisos.
 *   5. Google te redirige a una URL con ?code=... Copia ese code y pégalo aquí.
 *   6. El script imprime el refresh_token. Pégalo en .env como
 *      GOOGLE_REFRESH_TOKEN=...
 *
 * Esto solo hace falta UNA VEZ. El refresh token no caduca mientras nadie lo
 * revoque desde la cuenta de Google.
 */

import { google } from 'googleapis';
import readline from 'readline';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // para desktop apps: muestra el code en la pagina

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Falta GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env');
    process.exit(1);
}

const SCOPES = [
    'https://www.googleapis.com/auth/forms.body',
    'https://www.googleapis.com/auth/drive.file'
];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // fuerza a Google a devolver refresh_token
    scope: SCOPES
});

console.log('\n=== Paso 1 ===');
console.log('Abre esta URL en tu navegador y loguéate con la cuenta de Google que será dueña de los forms:\n');
console.log(authUrl);
console.log('\n=== Paso 2 ===');
console.log('Despues de aceptar, Google te mostrara un "code". Pegalo aqui abajo:\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('code: ', async (code) => {
    rl.close();
    try {
        const { tokens } = await oauth2Client.getToken(code.trim());
        if (!tokens.refresh_token) {
            console.error('\nGoogle no devolvió refresh_token. Prueba otra vez revocando el acceso previo en https://myaccount.google.com/permissions');
            process.exit(1);
        }
        console.log('\n=== Listo ===');
        console.log('Copia esta linea en tu .env:\n');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n(El access_token es temporal, no hace falta guardarlo. El servicio lo renueva solo cada vez que se usa.)');
    } catch (err) {
        console.error('\nError canjeando el code:', err.message);
        process.exit(1);
    }
});
