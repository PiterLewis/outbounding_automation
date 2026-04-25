# Encuesta post-evento — contrato con el front

Guía completa para implementar en el front el flujo de encuesta post-evento
con Google Forms. Probado y funcionando end-to-end.

---

## TL;DR

```
[POST /api/chat]
       ↓ devuelve jobId
[GET /api/chat/status/:jobId]  ← polling cada ~2s
       ↓ cuando state="completed", devuelve draftId
[GET /api/drafts/:draftId]
       ↓ pintar preview editable con metadata.questions + metadata.emailIntro
[PATCH /api/drafts/:draftId]   ← cuando el usuario edita
       ↓
[POST /api/drafts/:draftId/publish-form]
       ↓ devuelve responderUrl + editUrl
[POST /api/drafts/:draftId/send]
       ↓ devuelve {sent, failed, total}
       ✓ emails enviados
```

**El front nunca habla con Google.** Toda la integración con Google Forms vive
en el back. El front solo llama a estos 5 endpoints.

---

## Estados del draft

Un draft pasa por tres estados que el front debe entender:

| Estado | `status` | `metadata.googleForm` | Qué puede hacer el usuario |
|---|---|---|---|
| Recién generado por la IA | `pending` | `null` | Editar preguntas/intro, publicar form |
| Form publicado | `pending` | objeto con URLs | Reenviar a Google (no hace falta), enviar emails |
| Enviado | `sent` | objeto con URLs | Solo lectura — ya no se puede reenviar |

> **Nota:** después del `/send`, los `Attendee` que recibieron el mail quedan
> marcados como `surveyAnswered: true`. Si el usuario pide otra encuesta para
> el mismo evento, el chain devolverá `state: completed` pero **sin
> `draftId`** (ver "Edge cases" más abajo). El front debe manejarlo.

---

## Endpoints

### 1. `POST /api/chat` — disparar la generación de la encuesta

**Request**

```http
POST http://localhost:4000/api/chat
Content-Type: application/json

{
  "prompt": "hazme una encuesta post-evento de 5 preguntas para mi taller de yoga",
  "eventId": "EVT-999"
}
```

**Response 201**

```json
{
  "message": "La IA está analizando los datos y preparando la campaña...",
  "jobId": "22",
  "status": "queued"
}
```

**Notas para el front**

- El `prompt` es lo que el usuario escribe en el chat. La IA decide qué cadena
  ejecutar a partir de ahí (puede ser encuesta, pero también otras como
  campaña en Facebook, etc.). Para este flujo solo nos interesa cuando
  termina ejecutando la cadena `post_event_survey`.
- El `eventId` lo aporta el contexto del front (qué evento tiene seleccionado
  el usuario).
- El `jobId` devuelto es lo que se usa para hacer polling al siguiente
  endpoint.

**Errores típicos**

- `400` si falta `prompt` o `eventId`.

---

### 2. `GET /api/chat/status/:jobId` — polling hasta que termine

**Request**

```http
GET http://localhost:4000/api/chat/status/22
```

**Response 200 (en proceso)**

```json
{
  "jobId": "22",
  "state": "active",
  "result": null
}
```

**Response 200 (terminado correctamente)**

```json
{
  "jobId": "22",
  "state": "completed",
  "result": {
    "draftId": "69ecf4874346e45de3304668",
    "chain": "post_event_survey",
    "status": "pending_approval"
  }
}
```

**Notas para el front**

- Hacer polling cada **~2 segundos** hasta que `state === "completed"`.
  En la práctica el job termina en 3-5 segundos (lo que tarda el LLM).
- Posibles valores de `state`: `waiting`, `active`, `completed`, `failed`,
  `delayed`. Solo cuando es `completed` hay `result`.
- `result.chain` te dice qué cadena ejecutó el sistema. Si es
  `post_event_survey`, sigue al paso 3. Si fuese otra (ej: `last_minute_push`,
  `vip_upsell`), el flujo es distinto y este doc no aplica.

**Edge case importante: no hay asistentes pendientes**

Si el evento no tiene asistentes con `checkedIn: true` y `surveyAnswered: false`,
el chain aborta y la respuesta llega así:

```json
{
  "jobId": "22",
  "state": "completed",
  "result": {
    "chain": "post_event_survey",
    "status": "pending_approval"
  }
}
```

⚠️ Fíjate que **`result.draftId` no está**. El front debe detectar este caso
y mostrar al usuario un mensaje del tipo *"No hay asistentes pendientes de
encuestar para este evento"*. Pseudocódigo:

```js
if (state === "completed") {
  if (result?.draftId) {
    // flujo normal: pasar al paso 3
  } else {
    showError("No hay asistentes pendientes de encuestar.");
  }
}
```

---

### 3. `GET /api/drafts/:draftId` — leer el borrador generado

**Request**

```http
GET http://localhost:4000/api/drafts/69ecf4874346e45de3304668
```

**Response 200** (ejemplo real generado por la IA)

```json
{
  "_id": "69ecf4874346e45de3304668",
  "eventId": "EVT-999",
  "chainUsed": "post_event_survey",
  "subject": "Encuesta post-evento: Evento EVT-999",
  "body": "[...JSON de questions...]",
  "targetAudienceCount": 2,
  "isApproved": false,
  "status": "pending",
  "metadata": {
    "eventName": "Evento EVT-999",
    "eventType": "general",
    "emailIntro": "Agradecemos tu asistencia a Piccolo, nuestro evento de tecnología. Tu opinión es muy valiosa para nosotros y nos ayudará a mejorar futuras ediciones. Te invitamos a completar esta breve encuesta para compartir tu experiencia.",
    "questions": [
      { "question": "¿Cuál es tu nivel de satisfacción general con Piccolo?", "type": "rating" },
      { "question": "¿Qué fue lo que más te gustó de Piccolo?", "type": "text" },
      { "question": "¿Qué sugerencias tienes para mejorar Piccolo en el futuro?", "type": "text" }
    ],
    "recipientEmails": ["alguien@mail.com", "otra@mail.com"],
    "googleForm": null
  },
  "createdAt": "2026-04-25T17:06:15.061Z",
  "updatedAt": "2026-04-25T17:06:15.061Z"
}
```

**Lo único importante para pintar la UI vive en `metadata`:**

| Campo | Tipo | Descripción |
|---|---|---|
| `metadata.eventName` | `string` | Nombre del evento, útil para títulos. |
| `metadata.emailIntro` | `string` | Texto del email (2-3 frases). Editable. |
| `metadata.questions` | `Array<{question, type}>` | Lista de preguntas. Editable. |
| `metadata.questions[i].type` | `"text"` \| `"rating"` | **Solo estos dos tipos válidos.** |
| `metadata.recipientEmails` | `string[]` | A quién se le mandará el email al final. **Solo lectura**, lo gestiona el back. |
| `metadata.googleForm` | `null` \| `{formId, responderUrl, editUrl, publishedAt}` | `null` hasta que se publique el form. |

**Cuántas preguntas vienen**

El default son 3 preguntas, pero si el usuario en su prompt pide explícitamente
otro número (ej: *"hazme una encuesta de 10 preguntas"*), la IA respeta ese
número. El front no debe asumir un tamaño fijo.

**Errores típicos**

- `404` si el `draftId` no existe.

---

### 4. `PATCH /api/drafts/:draftId` — guardar ediciones del usuario

**Request**

```http
PATCH http://localhost:4000/api/drafts/69ecf4874346e45de3304668
Content-Type: application/json

{
  "questions": [
    { "question": "¿Recomendarías el evento?", "type": "rating" },
    { "question": "Cuéntanos tu mejor momento", "type": "text" }
  ],
  "emailIntro": "Mil gracias por venir, déjanos un par de palabras."
}
```

Ambos campos son **opcionales**. Puedes mandar solo `questions`, solo
`emailIntro`, o ambos. Si se manda `questions`, debe venir el array completo
(no es un patch parcial pregunta a pregunta — el back reemplaza el array).

**Response 200**: el draft entero actualizado (mismo shape que el `GET`).

**Notas para el front**

- Llama a este endpoint **antes** de `publish-form` si el usuario hizo
  cambios. El form se crea con los valores que estén guardados en el draft
  en ese momento.
- El back **no valida** los `type`. Si mandas un type que no sea `"text"` o
  `"rating"`, el endpoint guardará el draft, pero al publicar el form la
  pregunta se renderizará como `text` por defecto.
- No hay límite de preguntas, pero por sentido común mantenlo razonable
  (el LLM por defecto da 3).

**Errores típicos**

- `404` si el draft no existe.

---

### 5. `POST /api/drafts/:draftId/publish-form` — crear el Google Form

**Request**

```http
POST http://localhost:4000/api/drafts/69ecf4874346e45de3304668/publish-form
```

(Sin body.)

**Response 200**

```json
{
  "formId": "1trdlFuQQWzkOGisfiECJJvHBOQ7IvKNAlalrgb65X1k",
  "responderUrl": "https://docs.google.com/forms/d/e/1FAIpQLSdKUt18dMiyDunDwdFoa42IdSR6gZoMeKLR-Qx8IW9g4gD0sQ/viewform",
  "editUrl": "https://docs.google.com/forms/d/1trdlFuQQWzkOGisfiECJJvHBOQ7IvKNAlalrgb65X1k/edit"
}
```

**Notas para el front**

- `responderUrl` es lo que se le manda a los asistentes — el form para
  rellenar.
- `editUrl` abre Google Forms en modo edición. Solo funciona si el usuario
  está logueado con la cuenta de Google que es **dueña** del form (en la
  demo, la cuenta del admin que sacó el refresh token).
- Tras este endpoint, el `metadata.googleForm` del draft queda poblado.
  Si vuelves a hacer `GET /api/drafts/:id`, lo verás. Para evitar que el
  usuario cree dos forms del mismo draft, deshabilita el botón si
  `metadata.googleForm` no es `null`.
- La operación tarda ~1-2 segundos (dos llamadas a la Google API).
- El form se crea **siempre con las preguntas que tenga el draft en ese
  momento**, así que si quieres que refleje cambios recientes del usuario,
  llama antes a `PATCH`.

**Errores típicos**

- `400` si el draft no tiene preguntas.
- `404` si el draft no existe.
- `500` si Google rechaza la petición (refresh token caducado o revocado).
  El mensaje suele ser claro: `"invalid_grant"` o similar.

---

### 6. `POST /api/drafts/:draftId/send` — enviar email a los asistentes

**Request**

```http
POST http://localhost:4000/api/drafts/69ecf4874346e45de3304668/send
```

(Sin body.)

**Response 200**

```json
{
  "sent": 18,
  "failed": 2,
  "total": 20
}
```

**Notas para el front**

- Requiere que el form ya esté publicado. Si llamas a `/send` sin haber
  llamado antes a `/publish-form`, te devuelve **400** con el mensaje:
  `"El borrador aún no tiene un Google Form publicado..."`.
- Cada email contiene: saludo personalizado con el nombre del asistente,
  el `emailIntro` del draft, y un botón con el `responderUrl`.
- El back **marca a los asistentes como `surveyAnswered: true`** después de
  enviar, para que la próxima vez que se pida una encuesta para el mismo
  evento no se les vuelva a contactar.
- El back **marca el draft como `status: "sent"`**. Si el front recarga el
  draft, debe pintar la UI en modo "ya enviado" (sin botones de editar/enviar).

**Errores típicos**

- `400` si no hay form publicado o no hay destinatarios.
- `404` si el draft no existe.
- `500` si Resend falla. La respuesta sigue devolviendo `{sent, failed,
  total}`, así que `failed > 0` ya indica problemas parciales.

---

## Checklist para el front

Cosas a verificar al integrar:

- [ ] Manejar el caso `state: completed` **sin `draftId`** → mostrar mensaje
      "no hay asistentes pendientes".
- [ ] Solo permitir `text` y `rating` en el selector de tipo de pregunta.
- [ ] Bloquear el botón "Crear Google Form" si `metadata.googleForm` no es
      `null` (form ya creado).
- [ ] Bloquear o esconder los botones de edición si `draft.status === "sent"`.
- [ ] Llamar a `PATCH` antes de `publish-form` si el usuario editó algo
      después del último guardado.
- [ ] Pedir confirmación antes de `/send` mostrando cuántos destinatarios hay.
- [ ] Tras `/send` exitoso, refrescar el estado del draft o pintar la UI
      en modo "enviado".

---

## Setup del back (una sola vez)

Si tienes que configurar el back desde cero:

1. En [Google Cloud Console](https://console.cloud.google.com/): crear
   proyecto, habilitar **Google Forms API** y **Google Drive API**.
2. Crear credenciales OAuth 2.0 tipo **App de escritorio**.
3. En la pantalla de consentimiento OAuth → **Público** → **Usuarios de
   prueba** → añadir el email del admin.
4. Pegar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`.
5. Una vez:
   ```bash
   node --env-file=./.env apps/backend/src/scripts/getGoogleRefreshToken.js
   ```
6. Seguir el flujo en consola (abrir URL, aceptar permisos, pegar el `code`).
7. Copiar el `GOOGLE_REFRESH_TOKEN` que imprime el script en `.env`.

A partir de aquí el back puede crear forms automáticamente. Los forms son
propiedad de la cuenta de Google con la que te logueaste en el paso 6.

⚠️ **Mientras la app esté en estado "Testing" en Google Cloud, el refresh
token caduca a los 7 días.** Para producción real, hay que pasar la app a
"In production" (proceso de verificación de Google) o migrar a OAuth por
usuario.

---

## Resend (envío de emails)

El back usa Resend. En modo sandbox, **solo se puede enviar emails al email
de la cuenta de Resend** (el que verificaste al registrarte). Si quieres
enviar a asistentes reales, hay que verificar un dominio en Resend y
cambiar el `from` en `apps/backend/src/services/notifications.js`
(ahora apunta a `onboarding@resend.dev`).
