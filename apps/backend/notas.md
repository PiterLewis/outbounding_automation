Te dejo por aquí documentado el estado actual del backend y la arquitectura que hemos montado para que puedas arrancar sin bloqueos.A grandes rasgos, este sistema es un motor de automatización para marketing de eventos. Conecta la API de Eventbrite con LangChain (usando Gemini 2.0 Flash) para analizar datos de ventas y comportamiento, y dispara acciones en múltiples canales como emails, SMS, notificaciones push y publicaciones en redes sociales .La visión principal para este MVP es que funcione como un Copiloto (Human-in-the-loop). No queremos que el sistema ejecute campañas y gaste dinero de forma 100% autónoma en la sombra. Todo se va a gestionar a través de un chat en el frontend: la IA analiza el contexto, le propone un plan de acción al cliente (mostrando su proceso de razonamiento) y solo se ejecuta si el cliente confirma explícitamente.Arquitectura y Stack TecnológicoEntorno: Node.js (v24+)Base de Datos: MongoDB con Mongoose para almacenar el historial de usuarios e interacciones .IA: @langchain/openai configurado para apuntar a OpenRouter usando el modelo Gemini 2.0 Flash . Mantenemos la temperatura a 0 para que las respuestas devuelvan formatos estrictos y predecibles.Integraciones:Eventbrite: Lectura de métricas de entradas y creación de códigos de descuento .Facebook Graph API: Publicación de posts con imágenes.Resend: Emails transaccionales.Twilio: SMS.OneSignal: Notificaciones Push.Instalación y Setup InicialPara levantar el proyecto en local, primero instala las dependencias base :Bashnpm install express bullmq ioredis mongoose dotenv
npm install @langchain/openai @langchain/core langchain
npm install resend twilio
Nota importante sobre Node: Al ejecutar los scripts de prueba, estamos usando la carga de variables de entorno nativa de Node v24. Acuérdate de usar el flag --env-file en lugar de requerir dotenv en el código. Por ejemplo:Bashnode --env-file=../../.env src/scripts/testLowSales.js
Variables de Entorno (.env)Crea un archivo .env en la raíz del proyecto. Para agilizar tu setup, ya he configurado y validado las credenciales más complejas (Meta y Eventbrite). Puedes usar estas directamente. Para el resto de servicios, necesitarás crearte cuentas gratuitas de desarrollo y poner tus propias keys.Bash# --- CLAVES YA CONFIGURADAS (Pídeselas a Santi) ---

# EVENTBRITE (Acceso a la Organización y Eventos)
EB_TOKEN=...

# FACEBOOK GRAPH API (Ya tiene los permisos de página configurados)
FB_PAGE_ID=1021407381060012
FB_ACCESS_TOKEN=EAAX... 

# --- CLAVES QUE DEBES GENERAR TÚ ---

# MONGODB (Usa tu cluster local o MongoDB Atlas)
MONGODB_URI=mongodb://...

# OPENROUTER (Para consumir Gemini 2.0 Flash) -> openrouter.ai
OPENROUTER_API_KEY=sk-or-v1-...

# RESEND (Emails) -> resend.com
RESEND_API_KEY=re_...

# TWILIO (SMS) -> console.twilio.com
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=+123456789

# ONESIGNAL (Push) -> onesignal.com
ONESIGNAL_APP_ID=...
ONESIGNAL_API_KEY=...
Estado actual del desarrollo (Core)He dejado las bases del backend funcionando y probadas de extremo a extremo. Esto es lo que ya está implementado:El modelo (src/ai/model.js): Ya está configurado con OpenRouter.Servicios (src/services/):eventbrite.js: Conectado a la API moderna de Organizations para crear descuentos sin errores de permisos.notifications.js: Servicios de envío para Resend, Twilio y Facebook (este último ya soporta subida de imágenes dinámicas a través del endpoint /photos).Cadenas completadas:Ventas Bajas (lowSalesChain.js): Lee ventas reales de Eventbrite. Si el aforo vendido es menor al umbral, la IA redacta un correo, crea un código de descuento real en Eventbrite y lo envía por Resend, marcando luego al usuario en Mongo para evitar spam .Campaña Facebook (facebook_campaign.js): Lee la edad media en Mongo, redacta un post, selecciona una foto aleatoria de un array y publica en la Fan Page real .(Tienes scripts en src/scripts/ para probar estas cadenas directamente contra la base de datos).Siguientes Pasos (Tu Misión)El foco ahora mismo es adaptar esta lógica que ya funciona para que sirva a la interfaz de chat del frontend, implementando el flujo de aprobación.1. Integración Front-Back (Flujo de Aprobación)Necesitamos dividir la ejecución de las cadenas en dos fases controladas por el cliente:Endpoint de Planificación (POST /api/chat/plan): Recibe la consulta del usuario. La IA analiza el contexto (Mongo/Eventbrite) y devuelve una propuesta en formato JSON o texto al chat (Ej: "He detectado ventas bajas. Propongo enviar este borrador de email con un 20% de descuento"). Nota: Valora usar Server-Sent Events (SSE) si queremos simular el tipado de la IA en el front.Endpoint de Ejecución (POST /api/chat/execute): Se llama únicamente cuando el usuario pulsa "Confirmar" en el frontend. Aquí es donde realmente importaremos notificationService y eventbriteService para impactar en el mundo real.2. Finalizar las Cadenas RestantesSiguiendo este nuevo patrón de propuesta/ejecución, hay que montar las dos cadenas que faltan:Último Minuto (last_minute.js): Avisos por SMS usando Twilio para usuarios en lista de espera .Check-in (checkin_welcome.js): Bienvenida en puerta vía OneSignal .3. Cron Jobs (Enfoque MVP)En la arquitectura original se propuso el uso de BullMQ/Redis para procesos en segundo plano . Para este MVP, los cron jobs son opcionales y actuarán como simples "monitores".
Si el cliente activa un toggle en el front, el sistema encolará revisiones periódicas. Si detecta una anomalía (ej. ventas estancadas), en lugar de disparar la campaña automáticamente, enviará una alerta proactiva al chat del usuario ("Tus ventas han bajado, ¿quieres que analice opciones?"), derivando de nuevo al flujo de aprobación humana.Cualquier duda con el código actual o las credenciales, coméntamelo. ¡A por ello!