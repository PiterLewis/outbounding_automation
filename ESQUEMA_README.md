# ESQUEMA_README.md: Guía Exhaustiva del Proyecto Outbounding Automation (Orientado a IA)

Este documento sirve como una guía de referencia completa para el proyecto "Outbounding Automation", diseñada para proporcionar a una Inteligencia Artificial un contexto profundo sobre su estructura, funcionamiento y lógica interna. El objetivo es que la IA pueda comprender las interdependencias entre los componentes, el flujo de datos y la funcionalidad de cada módulo, con un énfasis particular en el backend y sus integraciones con sistemas de IA y colas.

## Tabla de Contenidos

1.  [Introducción al Proyecto](#1-introducción-al-proyecto)
2.  [Visión General de la Arquitectura](#2-visión-general-de-la-arquitectura)
3.  [Stack Tecnológico](#3-stack-tecnológico)
4.  [Estructura Detallada del Proyecto](#4-estructura-detallada-del-proyecto)
    *   [Raíz del Repositorio](#41-raíz-del-repositorio)
    *   [Backend (`apps/backend/`)](#42-backend-appsbackend)
        *   [`index.js` (Punto de Entrada)](#indexjs-punto-de-entrada)
        *   [`src/routes/routes.js` (Definición de Rutas)](#srcroutesroutesjs-definición-de-rutas)
        *   [`src/models/` (Modelos de Datos)](#srcmodels-modelos-de-datos)
        *   [`src/ai/chains/` (Cadenas de Lógica de IA - LangChain)](#srcaichains-cadenas-de-lógica-de-ia---langchain)
        *   [`src/tools/eventTools.js` (Herramientas de LangChain)](#srctoolseventtoolsjs-herramientas-de-langchain)
        *   [`src/workers/outboundWorker.js` (Procesador de Cola)](#srcworkersoutboundworkerjs-procesador-de-cola)
        *   [`src/scripts/seed.js` (Script de Seeding)](#srcscriptsseedjs-script-de-seeding)
    *   [Frontend (`apps/frontend/`)](#43-frontend-appsfrontend)
5.  [Configuración del Entorno y Despliegue](#5-configuración-del-entorno-y-despliegue)
    *   [Variables de Entorno (`.env`)](#51-variables-de-entorno-env)
    *   [Uso de Docker Compose](#52-uso-de-docker-compose)
6.  [Flujo de Trabajo Detallado de Outbounding](#6-flujo-de-trabajo-detallado-de-outbounding)
7.  [Directrices de Contribución](#7-directrices-de-contribución)

---

## 1. Introducción al Proyecto

El proyecto "Outbounding Automation" es una plataforma diseñada para automatizar la generación de borradores de contenido de marketing (como campañas para Facebook, emails de seguimiento, mensajes de bienvenida, etc.) mediante la integración de Modelos de Lenguaje Grandes (LLMs) a través del framework LangChain. Utiliza un enfoque asíncrono basado en colas de mensajes (BullMQ con Redis) para procesar solicitudes de IA de manera eficiente y no bloqueante. La aplicación está dividida en un frontend (Next.js) y un backend (Node.js/Express.js), con MongoDB para la persistencia de datos.

## 2. Visión General de la Arquitectura

La arquitectura es de tipo microservicio (o servicio monorepo con backend/frontend separados) y se compone de los siguientes elementos clave:

*   **Frontend (Next.js)**: Interfaz de usuario que permite a los usuarios interactuar con el sistema, enviar prompts y visualizar el estado y los resultados de las tareas de IA. Se comunica con el backend a través de una API RESTful.
*   **Backend (Node.js/Express.js)**: Servidor de API que orquesta toda la lógica de negocio.
    *   Expone endpoints para recibir solicitudes del frontend.
    *   Encola tareas de procesamiento de IA en un sistema de colas.
    *   Se comunica con MongoDB para almacenar y recuperar datos.
*   **BullMQ (con Redis)**: Actúa como el sistema de colas de mensajes. El backend encola trabajos aquí, y los *workers* dedicados extraen y procesan estos trabajos de forma asíncrona. Redis es el *broker* de mensajes subyacente.
*   **Workers (Node.js)**: Procesos separados dentro del backend que escuchan las colas de BullMQ. Cuando detectan un trabajo, ejecutan la lógica compleja de IA (usando LangChain) y manejan la persistencia de los resultados.
*   **LangChain.js**: Framework utilizado para construir y orquestar las "cadenas" de procesamiento con LLMs. Define cómo los prompts, modelos, herramientas y parsers interactúan para generar el contenido deseado.
*   **MongoDB**: Base de datos NoSQL utilizada para almacenar los borradores de contenido generados por la IA (`Drafts`) y otros datos relevantes del negocio (ej. `Attendees`, `Users`).
*   **Docker & Docker Compose**: Herramientas para empaquetar, desplegar y gestionar todos estos servicios en contenedores aislados, facilitando el desarrollo y la consistencia del entorno.

**Flujo de Datos Principal:**
1.  **Usuario (Frontend)**: Envía un `prompt` y un `eventId` a la API del Backend.
2.  **Backend (API)**: Recibe la solicitud, valida los datos, y encola un nuevo "job" (`agent_workflow`) en la cola `outbounding` de BullMQ. Devuelve un `jobId` al frontend.
3.  **Frontend**: Utiliza el `jobId` para periódicamente consultar al Backend sobre el estado del trabajo.
4.  **Worker (Backend)**: Escucha la cola `outbounding`. Al recibir un "job", invoca la cadena de LangChain correspondiente para procesar el `prompt` y `eventId`.
5.  **LangChain Chain**: Interactúa con un LLM (a través de `OPENROUTER_API_KEY`) y posiblemente con `eventTools` para obtener información adicional. Genera el contenido de marketing.
6.  **Worker**: Una vez generados los resultados por LangChain, los guarda como un `Draft` en MongoDB. Actualiza el estado del "job" en BullMQ a `completed` y adjunta el ID del `Draft` (o el contenido directamente) como resultado.
7.  **Backend (API - consulta de estado)**: Cuando el frontend consulta el estado y el "job" está `completed`, recupera el `result` (que incluye el `draftId` o el contenido) del job y lo devuelve al frontend.
8.  **Frontend**: Muestra el borrador generado al usuario.

## 3. Stack Tecnológico

La selección de tecnologías se orienta a un ecosistema JavaScript moderno, escalable y con capacidad de IA.

### General
*   **Docker**: Contenedorización de aplicaciones.
*   **Docker Compose**: Orquestación de contenedores multi-servicio.

### Backend (apps/backend)
*   **Node.js**: Entorno de ejecución JavaScript.
*   **Express.js `^5.2.1`**: Framework web minimalista y flexible.
*   **LangChain.js `^1.2.30`**: Orquestación de LLMs, incluyendo:
    *   `@langchain/core ^1.1.32`
    *   `@langchain/langgraph ^1.2.2`
    *   `@langchain/openai ^1.2.13` (para integrar con modelos compatibles con la API de OpenAI, incluyendo OpenRouter).
*   **BullMQ `^5.70.4`**: Framework de colas robusto y de alto rendimiento.
*   **Redis `redis:alpine`**: Base de datos en memoria, usada por BullMQ como _broker_ de mensajes y para persistencia de colas.
*   **Mongoose `^9.3.0`**: ODM (Object Data Modeling) para MongoDB, facilitando la interacción con la base de datos.
*   **MongoDB `mongo:latest`**: Base de datos NoSQL para almacenamiento de documentos.
*   **ioredis `^5.10.0`**: Cliente Redis de alto rendimiento, utilizado directamente para la conexión de BullMQ.
*   **cors `^2.8.6`**: Middleware para habilitar Cross-Origin Resource Sharing.
*   **dotenv `^17.3.1`**: Carga de variables de entorno desde archivos `.env`.
*   **@openrouter/sdk `^0.9.11`**: Posiblemente utilizado para interactuar con la plataforma OpenRouter, que actúa como un _proxy_ para varios LLMs.

### Frontend (apps/frontend)
*   **Next.js `16.1.6`**: Framework de React para producción (SSR, SSG).
*   **React `19.2.3`**: Biblioteca UI.
*   **react-dom `19.2.3`**: Punto de entrada de React para el DOM.
*   **Tailwind CSS `^4`**: Framework CSS _utility-first_ para estilos.
*   **ESLint `^9`**: Linter de código.
*   **@tailwindcss/postcss `^4`**: Integración de Tailwind con PostCSS.

## 4. Estructura Detallada del Proyecto

```
.
├── .env.example              # Plantilla para variables de entorno sensibles.
├── .gitignore                # Reglas de ignorado para Git.
├── docker-compose.yml        # Definición de servicios, redes y volúmenes para Docker Compose.
├── ESQUEMA_README.md         # Este documento.
├── README.md                 # README principal del proyecto (posiblemente una versión más breve).
├── .git/                     # Metadatos del repositorio Git.
├── .github/                  # Configuración de GitHub Actions para CI/CD.
│   └── workflows/
│       └── ci.yml            # Workflow de Integración Continua (testing, building, etc.).
├── apps/                     # Contenedor de las aplicaciones principales (backend y frontend).
│   ├── backend/              # Directorio raíz del servicio backend.
│   │   ├── Dockerfile        # Instrucciones de build para la imagen Docker del backend.
│   │   ├── GUIA_DEL_EQUIPO.md# Guía específica para desarrolladores de backend.
│   │   ├── index.js          # Punto de entrada principal del servidor Express.
│   │   ├── package-lock.json # Bloqueo de versiones de dependencias de npm.
│   │   ├── package.json      # Metadatos del proyecto backend y scripts.
│   │   ├── notas.txt         # Notas varias del desarrollo del backend.
│   │   ├── node_modules/     # Dependencias de Node.js instaladas localmente.
│   │   └── src/              # Código fuente modularizado del backend.
│   │       ├── testllm.js    # Script para pruebas aisladas de la integración de LLMs.
│   │       ├── ai/           # Lógica y configuración de la Inteligencia Artificial.
│   │       │   ├── router.js # Posiblemente rutas específicas para gestionar modelos de IA o configuraciones.
│   │       │   └── chains/   # Definiciones de LangChain para tareas específicas.
│   │       │       ├── checkin_welcome.js # Cadena para mensajes de bienvenida al check-in.
│   │       │       ├── facebook_campaign.js # Cadena para generar contenido de campañas de Facebook.
│   │       │       ├── last_minute.js # Cadena para mensajes de última hora.
│   │       │       ├── lowSalesChain.js # Cadena para estrategias ante bajas ventas.
│   │       │       ├── post_event_survey.js # Cadena para encuestas post-evento.
│   │       │       └── vip_upsell.js # Cadena para estrategias de upsell VIP.
│   │       ├── models/       # Definiciones de esquemas y modelos de Mongoose.
│   │       │   ├── Attendee.js # Modelo para datos de asistentes.
│   │       │   ├── Draft.js # Modelo para borradores de contenido generados por IA.
│   │       │   └── User.js # Modelo para usuarios del sistema.
│   │       ├── routes/       # Archivos que definen las rutas API principales del Express.js.
│   │       │   └── routes.js # Rutas de la API como /chat, /chat/status, /drafts.
│   │       ├── scripts/      # Scripts utilitarios o de una sola ejecución.
│   │       │   └── seed.js # Script para poblar la base de datos con datos de prueba.
│   │       ├── services/     # Módulos para lógica de negocio encapsulada o integración con terceros.
│   │       │   └── sample.js # Ejemplo o placeholder de servicio.
│   │       └── tools/        # Herramientas utilizables por las cadenas de LangChain.
│   │           └── eventTools.js # Funciones para interactuar con datos de eventos.
│   │       └── workers/      # Controladores de procesos de cola de BullMQ.
│   │           ├── cron.js # Posible worker para tareas programadas (ej. limpieza).
│   │           └── outboundWorker.js # Worker principal para procesar tareas de outbounding.
│   └── frontend/             # Directorio raíz del servicio frontend (aplicación Next.js).
│       ├── .gitignore        # Reglas de ignorado para Git específicas del frontend.
│       ├── Dockerfile        # Instrucciones de build para la imagen Docker del frontend.
│       ├── eslint.config.mjs # Configuración de ESLint para linting de código.
│       ├── GUIA_DEL_EQUIPO.md# Guía específica para desarrolladores de frontend.
│       ├── jsconfig.json     # Configuración para Intellisense de JavaScript (VSCode).
│       ├── next.config.mjs   # Configuración de Next.js (ej. optimizaciones, variables de entorno).
│       ├── package-lock.json # Bloqueo de versiones de dependencias de npm.
│       ├── package.json      # Metadatos del proyecto frontend y scripts.
│       ├── postcss.config.mjs# Configuración de PostCSS (para Tailwind CSS).
│       ├── README.md         # README específico del frontend.
│       ├── .next/            # Directorio de build de Next.js (generado automáticamente).
│       │   └── types/        # Archivos de tipos generados.
│       │       ├── cache-life.d.ts
│       │       ├── routes.d.ts
│       │       └── validator.ts
│       ├── app/              # Directorio de App Router de Next.js.
│       │   ├── favicon.ico   # Icono de la aplicación.
│       │   ├── globals.css   # Estilos globales, incluyendo directivas de Tailwind.
│       │   ├── layout.js     # Componente de layout raíz para toda la aplicación.
│       │   ├── page.js       # Componente de la página principal (`/`).
│       │   └── components/   # Componentes React reutilizables.
│       │       ├── chat.css  # Estilos específicos para el componente Chat.
│       │       └── chat.jsx  # Componente principal para la interacción de chat con la IA.
│       └── public/           # Archivos estáticos servidos directamente.
│           ├── file.svg
│           ├── globe.svg
│           ├── next.svg
│           ├── vercel.svg
│           └── window.svg
└── node_modules/             # Dependencias de Node.js a nivel de monorepo (si existe).
```

### 4.1. Raíz del Repositorio

*   `.env.example`: Un archivo de plantilla que lista todas las variables de entorno requeridas por el proyecto. **Es imperativo crear un archivo `.env` en la raíz (no versionado) y poblarlo con los valores correspondientes, incluyendo claves API sensibles.**
*   `docker-compose.yml`: Define la configuración para todos los servicios dockerizados del proyecto: `frontend`, `backend`, `redis` y `mongo`. Detalla las imágenes, puertos expuestos, volúmenes montados, variables de entorno específicas de Docker y las dependencias entre servicios.

### 4.2. Backend (`apps/backend/`)

El servicio backend es una API RESTful construida con Node.js y Express.js, encargada de la lógica de negocio, la interacción con la IA, el sistema de colas y la base de datos.

#### `index.js` (Punto de Entrada)

Este es el archivo principal que inicializa el servidor Express.js.
**Funcionalidades Clave:**
*   **Configuración del Servidor Express**: Inicializa la aplicación Express, configura middleware como CORS y body-parser.
*   **Conexión a MongoDB**: Establece la conexión a la base de datos MongoDB utilizando Mongoose (`mongoose.connect(process.env.MONGODB_URI)`).
*   **Carga de Rutas**: Importa y usa las rutas definidas en `src/routes/routes.js`.
*   **Inicio del Servidor**: Escucha en el puerto especificado por `process.env.PORT`.

#### `src/routes/routes.js` (Definición de Rutas)

Este módulo define los endpoints de la API que el frontend y otros servicios pueden consumir. Utiliza `express.Router()`.
**Funciones/Endpoints Principales:**

1.  **`POST /chat`**:
    *   **Propósito**: Iniciar un proceso de generación de contenido de IA.
    *   **Input (`req.body`)**:
        *   `prompt` (String, **requerido**): La instrucción en lenguaje natural para la IA.
        *   `eventId` (String, **requerido**): El ID del evento al que se relaciona la solicitud (utilizado por las herramientas de IA para contextualizar).
    *   **Lógica**:
        *   Valida la presencia de `prompt` y `eventId`.
        *   Obtiene una conexión a Redis para BullMQ (`const connection = new Redis(...)`).
        *   Instancia una cola de BullMQ (`outboundingQueue = new Queue('outbounding', { connection })`).
        *   Añade un nuevo "job" a la cola `outbounding` con el nombre `agent_workflow` y los datos `{ prompt, eventId }`.
        *   Devuelve una respuesta 201 (`Created`) con un mensaje de confirmación y el `jobId` generado por BullMQ.
    *   **Output (`res.json`)**: `{ message: "...", jobId: string, status: "queued" }`

2.  **`GET /chat/status/:jobId`**:
    *   **Propósito**: Permite al cliente consultar el estado actual y el resultado de un trabajo de IA previamente encolado.
    *   **Input (`req.params.jobId`)**: El ID del trabajo de BullMQ.
    *   **Lógica**:
        *   Busca el "job" en la `outboundingQueue` por su `jobId`.
        *   Si el "job" no existe, devuelve 404.
        *   Obtiene el `state` actual del "job" (ej., `waiting`, `active`, `completed`, `failed`).
        *   Recupera el `returnvalue` del "job", que contiene el resultado final si el estado es `completed`.
        *   Devuelve el `jobId`, `state` y el `result` (si está `completed`).
    *   **Output (`res.json`)**: `{ jobId: string, state: string, result: any | null }` (donde `result` sería el borrador de IA o su ID si el trabajo ha finalizado).

3.  **`GET /drafts/:id`**:
    *   **Propósito**: Recuperar un borrador específico de la base de datos.
    *   **Input (`req.params.id`)**: El ID de MongoDB del `Draft`.
    *   **Lógica**:
        *   Utiliza el modelo `Draft` de Mongoose (`Draft.findById(req.params.id)`) para buscar el borrador.
        *   Devuelve el objeto `Draft` si se encuentra, o un 404 si no.
    *   **Output (`res.json`)**: `Draft` object (`{ _id: string, title: string, content: string, type: string, eventId: string, ... }`)

#### `src/models/` (Modelos de Datos)

Define los esquemas de datos para MongoDB usando Mongoose.

*   **`Draft.js`**:
    *   Define el esquema (`mongoose.Schema`) para los borradores de contenido generados por la IA.
    *   **Campos esperados**:
        *   `title` (String): Título del borrador.
        *   `content` (String): El contenido generado por la IA (ej., texto de campaña, email).
        *   `type` (String): Tipo de borrador (ej., `facebook_campaign`, `checkin_welcome`, `post_event_survey`).
        *   `eventId` (String): Referencia al evento asociado.
        *   `createdAt` (Date): Timestamp de creación.
        *   `updatedAt` (Date): Timestamp de última actualización.
    *   Exporta el modelo (`mongoose.model('Draft', draftSchema)`).

*   `Attendee.js` y `User.js`: Modelos placeholder para futuros desarrollos de gestión de asistentes y usuarios.

#### `src/ai/chains/` (Cadenas de Lógica de IA - LangChain)

Este directorio contiene las definiciones de las "cadenas" de LangChain. Cada archivo exporta una función o un objeto que representa un flujo de trabajo de IA específico. Utilizan un LLM (a través de `OPENROUTER_API_KEY`) y pueden incorporar prompts, parsers y herramientas (`eventTools`).

*   **Ejemplo de estructura (`checkin_welcome.js`)**:
    ```javascript
    import { ChatOpenAI } from "@langchain/openai"; // O ChatGoogleGenerativeAI, etc.
    import { PromptTemplate } from "@langchain/core/prompts";
    import { StringOutputParser } from "@langchain/core/output_parsers";
    // Posibles imports de herramientas (eventTools)

    // 1. Instanciar el modelo LLM
    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENROUTER_API_KEY, // O la clave de tu proveedor
        // ... otras configuraciones del modelo (ej. modelName, temperature)
    });

    // 2. Definir el Prompt
    const promptTemplate = PromptTemplate.fromTemplate(
        `Genera un mensaje de bienvenida personalizado para un asistente que acaba de hacer check-in en el evento '{eventName}' (ID: {eventId}).
         Considera que el evento tiene lugar en {eventLocation} y comienza a las {eventTime}.
         El mensaje debe ser amable, breve y dar indicaciones básicas.
         Información adicional del evento: {eventDetails}.`
    );

    // 3. Crear la cadena
    export const checkinWelcomeChain = async ({ eventId, eventName, eventLocation, eventTime, eventDetails }) => {
        // En un escenario real, 'eventDetails' se obtendría usando una herramienta.
        // Aquí se simula su provisión.

        // Combinar el prompt con el modelo y un parser
        const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

        const result = await chain.invoke({ eventId, eventName, eventLocation, eventTime, eventDetails });
        return result; // Retorna el texto generado
    };
    ```
*   **Funcionalidad esperada de cada cadena**:
    *   Toman parámetros relevantes (ej., `prompt`, `eventId`).
    *   Construyen un `PromptTemplate` específico para su tarea.
    *   Utilizan un LLM (ej., `ChatOpenAI`) configurado con `OPENROUTER_API_KEY`.
    *   Pueden integrar `tools` (como `eventTools`) para obtener información externa o realizar acciones.
    *   Pueden usar `output_parsers` (ej., `StringOutputParser`, `StructuredOutputParser`) para formatear la salida del LLM.
    *   Retornan el contenido de marketing generado o una estructura de datos procesada.

#### `src/tools/eventTools.js` (Herramientas de LangChain)

Este módulo contendrá funciones que las cadenas de LangChain pueden invocar para interactuar con sistemas externos o la base de datos, proporcionando a la IA información contextual o permitiéndole realizar acciones.
**Funciones esperadas:**

*   **`getEventDetails(eventId: string)`**:
    *   **Propósito**: Recuperar información detallada de un evento específico de una fuente de datos (ej., una API externa de Eventbrite, o la base de datos local).
    *   **Input**: `eventId`.
    *   **Output**: Objeto con detalles del evento (nombre, fecha, ubicación, descripción, etc.).

#### `src/workers/outboundWorker.js` (Procesador de Cola)

Este es un proceso de Node.js independiente que escucha la cola `outbounding` de BullMQ y procesa los trabajos de IA. Es crítico para la ejecución asíncrona de las tareas.
**Funcionalidades Clave:**
*   **Conexión a Redis y BullMQ**: Establece una conexión a Redis y un `Worker` de BullMQ para la cola `outbounding`.
*   **Manejo de Trabajos (`worker.on('completed'/'failed', ...)`)**:
    *   Define una función `processor` que se ejecuta cada vez que un nuevo "job" (`agent_workflow`) es extraído de la cola.
    *   Dentro del `processor`:
        *   Extrae `prompt` y `eventId` de `job.data`.
        *   **Lógica de Selección de Cadena**: Basado en el `prompt` o algún metadato, decide qué cadena de LangChain (`src/ai/chains/`) debe ejecutar (ej., `facebook_campaign.js`, `checkin_welcome.js`). Podría usar lógica condicional o un mapeo.
        *   **Invocación de la Cadena de IA**: Llama a la función de la cadena de LangChain seleccionada, pasándole los datos necesarios.
        *   **Persistencia de Resultados**: Una vez que la cadena de IA devuelve el resultado (ej., el texto del borrador), crea una nueva instancia del modelo `Draft` (`new Draft(...)`) y la guarda en MongoDB (`draft.save()`).
        *   **Actualización del Job**: Retorna el `draft._id` (o el objeto `Draft` completo) como `returnvalue` del job de BullMQ, marcándolo como `completed`. Esto hace que el resultado esté disponible para la consulta de estado del frontend.
*   **Manejo de Errores**: Captura excepciones durante el procesamiento del job y marca el job como `failed` en BullMQ, registrando el error.

#### `src/scripts/seed.js` (Script de Seeding)

Un script para poblar la base de datos (MongoDB) con datos iniciales o de prueba. Útil para entornos de desarrollo y testing.
**Funcionalidades Clave:**
*   **Conexión a MongoDB**: Establece la conexión a la base de datos.
*   **Limpieza de Datos**: Opcionalmente, puede limpiar colecciones existentes (`Draft.deleteMany({})`).
*   **Creación de Datos**: Crea y guarda nuevas instancias de modelos (ej., `Draft`, `Attendee`, `User`) con datos dummy.

### 4.3. Frontend (`apps/frontend/`)

Aplicación Next.js que consume la API del backend.

*   `apps/frontend/app/components/chat.jsx`:
    *   **Propósito**: Componente interactivo para que el usuario envíe prompts a la IA.
    *   **Funcionalidades**:
        *   Formulario de entrada de texto para el `prompt` y un campo para el `eventId`.
        *   Botón para enviar la solicitud (`POST /chat`) al backend.
        *   Manejo del estado de carga y visualización de un `jobId` inicial.
        *   **Polling**: Implementa un mecanismo de _polling_ (consultas repetidas) al endpoint `GET /chat/status/:jobId` del backend para verificar el progreso del trabajo de IA.
        *   Visualización del borrador de contenido generado (`Draft`) una vez que el trabajo de IA ha sido `completed`.

## 5. Configuración del Entorno y Despliegue

### 5.1. Variables de Entorno (`.env`)

El archivo `.env.example` en la raíz del proyecto es la plantilla. Un archivo `.env` real debe ser creado y llenado.

*   `NODE_ENV=development` | `production`: Define el entorno de ejecución.
*   `OPENROUTER_API_KEY=your_openrouter_api_key_here`: **CLAVE CRÍTICA**. API Key para autenticarse con OpenRouter (o directamente con OpenAI, Google Gemini, etc. si se cambia la configuración de LangChain). Permite a los LLMs ser invocados.
*   `REDIS_URL=redis://localhost:6379` (local) | `redis://redis:6379` (Docker Compose): URL de conexión a la instancia de Redis.
*   `PORT=4000`: Puerto en el que el servidor backend escuchará.
*   `MONGODB_URI=mongodb://localhost:27017/eventbrite_challenge` (local) | `mongodb://mongo:27017/eventbrite_challenge` (Docker Compose): URL de conexión a la base de datos MongoDB.
*   `NEXT_PUBLIC_API_URL=http://localhost:4000`: Variable de entorno *pública* para el frontend, apuntando a la URL base del backend.

### 5.2. Uso de Docker Compose

El `docker-compose.yml` define cómo levantar el entorno completo.

```yaml
services:
  frontend:
    build:
      context: ./apps/frontend # Construye la imagen desde el Dockerfile del frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000" # Mapea el puerto 3000 del host al 3000 del contenedor
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000 # El frontend se comunica con el backend usando el nombre de servicio 'backend'
    depends_on:
      - backend # Asegura que el backend esté listo antes de iniciar el frontend

  backend:
    build:
      context: ./apps/backend # Construye la imagen desde el Dockerfile del backend
    volumes:
      - ./apps/backend:/app # Monta el código fuente para desarrollo (hot-reloading)
      - /app/node_modules # Evita que los node_modules del host sobrescriban los del contenedor
    ports:
      - "4000:4000" # Mapea el puerto 4000 del host al 4000 del contenedor
    env_file:
      - ./.env # Carga las variables de entorno desde el archivo .env de la raíz
    environment: # Sobrescribe o añade variables de entorno específicas para Docker
      - REDIS_URL=redis://redis:6379 # La URL interna del servicio Redis
      - MONGODB_URI=mongodb://mongo:27017/eventbrite_challenge # La URL interna del servicio Mongo
      - PORT=4000
      - NODE_ENV=development
    depends_on:
      - redis # Asegura que Redis esté listo
      - mongo # Asegura que Mongo esté listo

  redis:
    image: redis:alpine # Usa la imagen oficial de Redis
    ports:
      - "6379:6379" # Mapea el puerto de Redis para acceso externo (opcional, pero útil para depuración)
    volumes:
      - redis_data:/data # Persiste los datos de Redis

  mongo:
    image: mongo:latest # Usa la imagen oficial de MongoDB
    ports:
      - "27017:27017" # Mapea el puerto de Mongo para acceso externo (opcional)
    volumes:
      - mongo_data:/data/db # Persiste los datos de MongoDB

volumes: # Define volúmenes persistentes
  redis_data:
  mongo_data:
```

**Comando de Ejecución**: `docker-compose up --build` (desde la raíz del proyecto).

## 6. Flujo de Trabajo Detallado de Outbounding

Este es el proceso paso a paso que ocurre cuando un usuario solicita la generación de contenido de outbounding:

1.  **Activación (Frontend)**: El usuario en el `chat.jsx` del frontend introduce un `prompt` y un `eventId`, y envía la solicitud.
2.  **Request API (Frontend -> Backend)**: El frontend realiza una llamada `POST` al endpoint `/chat` del backend con `{ prompt, eventId }`.
3.  **Encoldado del Job (Backend - `routes.js`)**:
    *   La función `router.post('/chat', ...)` en `src/routes/routes.js` recibe la solicitud.
    *   Valida los datos.
    *   Utiliza `outboundingQueue.add('agent_workflow', { prompt, eventId })` para crear y añadir un nuevo trabajo a la cola de BullMQ.
    *   Responde al frontend con el `jobId` (identificador único de la tarea asíncrona).
4.  **Consulta de Estado (Frontend - `chat.jsx`)**: El frontend inicia un bucle de _polling_ (`setInterval`) llamando `GET /chat/status/:jobId` con el ID recibido.
5.  **Procesamiento del Job (Backend - `outboundWorker.js`)**:
    *   El proceso `outboundWorker.js` está escuchando continuamente la cola `outbounding` en Redis.
    *   Cuando un nuevo trabajo (`agent_workflow`) es detectado, el `processor` del worker extrae `job.data` (que contiene `prompt` y `eventId`).
    *   **Selección Dinámica de Cadena**: Basándose en el `prompt` o en reglas predefinidas, el worker decide qué cadena de IA de `src/ai/chains/` debe ejecutar (ej. `facebook_campaign.js`, `vip_upsell.js`).
    *   **Ejecución de la Cadena LangChain**:
        *   Invoca la función de la cadena de LangChain seleccionada, pasándole los datos (`prompt`, `eventId`).
        *   Dentro de la cadena, se interactúa con el LLM (usando `OPENROUTER_API_KEY`).
        *   Posiblemente se utiliza `eventTools.getEventDetails(eventId)` para obtener información contextual del evento y enriquecer el prompt del LLM.
        *   El LLM genera el contenido de marketing.
        *   El `StringOutputParser` de LangChain extrae el texto final.
    *   **Persistencia (Backend - `outboundWorker.js` -> `Draft.js`)**:
        *   El contenido generado por la cadena de IA se utiliza para crear una nueva instancia del modelo `Draft` (ej., `new Draft({ title: "...", content: "...", type: "...", eventId: eventId })`).
        *   Este `Draft` se guarda en MongoDB (`draft.save()`).
    *   **Finalización del Job (Backend - `outboundWorker.js`)**: El worker marca el trabajo en BullMQ como `completed` y adjunta el ID del `Draft` (o el objeto `Draft` completo) como su `returnvalue`.
6.  **Actualización del Estado (Backend - `routes.js`)**: Cuando el frontend consulta `GET /chat/status/:jobId` y el `job` ha sido `completed`, la función `router.get('/chat/status/:jobId', ...)` recupera el `returnvalue` del job y lo devuelve al frontend.
7.  **Visualización (Frontend - `chat.jsx`)**: El componente `chat.jsx` del frontend recibe el `Draft` generado y lo muestra al usuario.

## 7. Directrices de Contribución

Se espera que los colaboradores sigan los principios de diseño y codificación establecidos en el proyecto.

*   **Coherencia**: Mantener la coherencia con el código existente, patrones y convenciones de nomenclatura.
*   **Pruebas**: Escribir pruebas unitarias y de integración para nuevas funcionalidades.
*   **Documentación**: Actualizar este README y cualquier otra documentación relevante para reflejar cambios.
*   **Linter/Formateador**: Asegurarse de que el código pase las comprobaciones de ESLint y cualquier formateador configurado.

Consulte la `GUIA_DEL_EQUIPO.md` dentro de `apps/backend/` y `apps/frontend/` para directrices específicas de cada módulo.