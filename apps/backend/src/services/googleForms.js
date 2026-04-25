import { google } from 'googleapis';

/**
 * Servicio que encapsula la creación de Google Forms via API.
 *
 * Usa OAuth 2.0 con un refresh_token fijo del organizador (ver
 * src/scripts/getGoogleRefreshToken.js para obtenerlo la primera vez).
 *
 * Todas las preguntas se mapean a tipos de Google Forms:
 *   - type: 'rating' -> scaleQuestion 1..5
 *   - type: 'text'   -> textQuestion (paragraph)
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

function getOAuthClient() {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('Faltan credenciales de Google en .env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)');
    }
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    return oauth2Client;
}

/**
 * Convierte una pregunta del JSON interno en un `createItem` request
 * del Google Forms API.
 */
function questionToCreateItem(q, index) {
    const common = {
        title: q.question,
        questionItem: { question: { required: false } }
    };

    if (q.type === 'rating') {
        common.questionItem.question.scaleQuestion = {
            low: 1,
            high: 5,
            lowLabel: 'Muy malo',
            highLabel: 'Excelente'
        };
    } else {
        // default: texto largo
        common.questionItem.question.textQuestion = {
            paragraph: true
        };
    }

    return {
        createItem: {
            item: common,
            location: { index }
        }
    };
}

/**
 * Crea un Google Form con las preguntas dadas.
 *
 * @param {object} params
 * @param {string} params.title        - Título del form (obligatorio)
 * @param {string} [params.description] - Descripción opcional
 * @param {Array<{question: string, type: 'text'|'rating'}>} params.questions
 * @returns {Promise<{formId: string, responderUrl: string, editUrl: string}>}
 */
export async function createFormFromQuestions({ title, description = '', questions }) {
    if (!title) throw new Error('createFormFromQuestions: falta title');
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('createFormFromQuestions: questions vacío');
    }

    const auth = getOAuthClient();
    const forms = google.forms({ version: 'v1', auth });

    // 1. Crear el form (solo se puede pasar title en create; lo demas va via batchUpdate)
    console.log(`[GoogleForms] Creando form "${title}"`);
    const createRes = await forms.forms.create({
        requestBody: { info: { title } }
    });

    const formId = createRes.data.formId;
    const responderUrl = createRes.data.responderUri;

    // 2. Añadir preguntas (+ description si la hay) con batchUpdate
    const requests = [];

    if (description) {
        requests.push({
            updateFormInfo: {
                info: { description },
                updateMask: 'description'
            }
        });
    }

    questions.forEach((q, i) => {
        requests.push(questionToCreateItem(q, i));
    });

    console.log(`[GoogleForms] Añadiendo ${questions.length} preguntas al form ${formId}`);
    await forms.forms.batchUpdate({
        formId,
        requestBody: { requests }
    });

    const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

    console.log(`[GoogleForms] Form listo: ${responderUrl}`);
    return { formId, responderUrl, editUrl };
}

export const googleFormsService = {
    createFormFromQuestions
};
