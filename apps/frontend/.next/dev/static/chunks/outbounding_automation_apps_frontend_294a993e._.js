(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const BACKEND_URL = "http://localhost:4000";
function ChatPanel({ onAplicar }) {
    _s();
    const [mensajes, setMensajes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            rol: "asistente",
            texto: "Hola! Soy tu asistente de marketing. Dime que quieres hacer con tu evento y me encargo de analizarlo."
        }
    ]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cargando, setCargando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const bottomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // cada vez que cambian los mensajes, bajamos el scroll
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPanel.useEffect": function() {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }["ChatPanel.useEffect"], [
        mensajes
    ]);
    // consulta el estado del job cada 2 segundos hasta que termine
    async function esperarResultado(jobId) {
        let intentos = 0;
        let maxIntentos = 30; // como mucho 60 segundos
        while(intentos < maxIntentos){
            // esperamos 2 segundos entre cada consulta
            await new Promise(function(resolve) {
                setTimeout(resolve, 2000);
            });
            let respuesta = await fetch(BACKEND_URL + "/api/chat/status/" + jobId);
            let datos = await respuesta.json();
            if (datos.state === "completed") {
                return datos.result;
            }
            if (datos.state === "failed") {
                throw new Error("El proceso fallo en el servidor");
            }
            // si no ha terminado, seguimos esperando
            intentos = intentos + 1;
        }
        throw new Error("Timeout: el proceso tardo demasiado");
    }
    // trae el borrador de mongo
    async function traerBorrador(draftId) {
        let respuesta = await fetch(BACKEND_URL + "/api/drafts/" + draftId);
        let borrador = await respuesta.json();
        return borrador;
    }
    // manda el mensaje al backend y espera la respuesta
    async function enviar() {
        let texto = input.trim();
        if (!texto) {
            return;
        }
        if (cargando) {
            return;
        }
        // ponemos el mensaje del usuario en el chat
        setMensajes(function(prev) {
            return [
                ...prev,
                {
                    rol: "usuario",
                    texto: texto
                }
            ];
        });
        setInput("");
        setCargando(true);
        try {
            // mandamos el prompt al backend
            let respuesta = await fetch(BACKEND_URL + "/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: texto,
                    eventId: "EVT-999"
                })
            });
            let datos = await respuesta.json();
            let jobId = datos.jobId;
            // esperamos a que el worker de bullmq termine
            let resultado = await esperarResultado(jobId);
            // si genero un borrador, lo traemos de la base de datos
            let borrador = null;
            if (resultado && resultado.draftId) {
                borrador = await traerBorrador(resultado.draftId);
            }
            // armamos el texto de respuesta segun lo que devolvio
            let textoRespuesta = "";
            if (borrador) {
                textoRespuesta = "Cadena: " + resultado.chain;
                textoRespuesta += "\n\nAsunto: " + borrador.subject;
                textoRespuesta += "\n\n" + borrador.body;
            } else {
                textoRespuesta = "Cadena ejecutada: " + (resultado.chain || "completado");
            }
            // lo agregamos al chat
            setMensajes(function(prev) {
                return [
                    ...prev,
                    {
                        rol: "asistente",
                        texto: textoRespuesta,
                        borrador: borrador
                    }
                ];
            });
        } catch (error) {
            // si algo falla mostramos el error
            setMensajes(function(prev) {
                return [
                    ...prev,
                    {
                        rol: "asistente",
                        texto: "Error: " + error.message,
                        esError: true
                    }
                ];
            });
        } finally{
            setCargando(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col min-h-[300px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 space-y-3 overflow-auto mb-4",
                children: [
                    mensajes.map(function(msg, i) {
                        // decidimos las clases segun quien manda el mensaje
                        let claseMensaje = "bg-gray-100 text-gray-800";
                        if (msg.rol === "usuario") {
                            claseMensaje = "bg-brand text-white ml-4";
                        }
                        if (msg.esError) {
                            claseMensaje = "bg-red-50 text-red-700";
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm p-3 rounded-lg whitespace-pre-wrap " + claseMensaje,
                            children: [
                                msg.texto,
                                msg.borrador && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: function() {
                                        onAplicar(msg.borrador.subject, msg.borrador.body);
                                    },
                                    className: "block mt-2 text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors",
                                    children: "Aplicar al editor"
                                }, void 0, false, {
                                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                                    lineNumber: 151,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this);
                    }),
                    cargando && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-sm text-gray-400 p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                size: 14,
                                className: "animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                                lineNumber: 167,
                                columnNumber: 13
                            }, this),
                            "La IA esta analizando..."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: bottomRef
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: input,
                        onChange: function(e) {
                            setInput(e.target.value);
                        },
                        onKeyDown: function(e) {
                            if (e.key === "Enter") {
                                enviar();
                            }
                        },
                        placeholder: "Escribe tu peticion...",
                        disabled: cargando,
                        className: "flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand disabled:opacity-50"
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: enviar,
                        disabled: cargando,
                        className: "w-9 h-9 flex items-center justify-center bg-brand text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                            lineNumber: 195,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
                lineNumber: 176,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
_s(ChatPanel, "cnnTCF03gfJNwWQmcrJLxF6l6f0=");
_c = ChatPanel;
var _c;
__turbopack_context__.k.register(_c, "ChatPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TagsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const opcionesTono = [
    {
        valor: "urgente",
        label: "Urgente",
        desc: "Crea sentido de urgencia para actuar rapido"
    },
    {
        valor: "amigable",
        label: "Amigable",
        desc: "Tono casual y cercano para conectar"
    },
    {
        valor: "profesional",
        label: "Profesional",
        desc: "Formal y directo, ideal para B2B"
    },
    {
        valor: "divertido",
        label: "Divertido",
        desc: "Humor y energia para eventos sociales"
    }
];
const opcionesIdioma = [
    {
        valor: "es",
        label: "Espanol"
    },
    {
        valor: "en",
        label: "English"
    },
    {
        valor: "pt",
        label: "Portugues"
    }
];
const opcionesCanal = [
    {
        valor: "email",
        label: "Email"
    },
    {
        valor: "sms",
        label: "SMS"
    },
    {
        valor: "push",
        label: "Push Notification"
    }
];
const opcionesExtension = [
    {
        valor: "corto",
        label: "Corto"
    },
    {
        valor: "medio",
        label: "Medio"
    },
    {
        valor: "largo",
        label: "Largo"
    }
];
// mensajes de ejemplo segun el tono
const mensajesEjemplo = {
    urgente: "Ultima oportunidad! Las entradas para Comedy Night Live se agotan. No te quedes sin la tuya.\n\nQuedan pocas entradas disponibles. Asegura tu lugar ahora antes de que sea demasiado tarde.",
    amigable: "Hola! Te queriamos contar que Comedy Night Live ya esta a la vuelta de la esquina.\n\nVa a ser una noche increible llena de risas. Nos encantaria verte ahi!",
    profesional: "Estimado/a [Nombre],\n\nLe informamos que quedan plazas limitadas para Comedy Night Live. Le invitamos a asegurar su participacion.\n\nAtentamente, El equipo organizador.",
    divertido: "Preparado/a para reirte hasta que te duela la barriga?\n\nComedy Night Live promete carcajadas garantizadas. No seas el/la que se quede sin plan!"
};
function TagsPanel({ onGenerar }) {
    _s();
    const [tono, setTono] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("urgente");
    const [idioma, setIdioma] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("es");
    const [canal, setCanal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("email");
    const [extension, setExtension] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("medio");
    const [seccionesAbiertas, setSeccionesAbiertas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        "tono"
    ]);
    function toggleSeccion(nombre) {
        let estaAbierta = seccionesAbiertas.includes(nombre);
        if (estaAbierta) {
            // la quitamos de la lista
            let nuevaLista = seccionesAbiertas.filter(function(s) {
                return s !== nombre;
            });
            setSeccionesAbiertas(nuevaLista);
        } else {
            // la anadimos
            setSeccionesAbiertas([
                ...seccionesAbiertas,
                nombre
            ]);
        }
    }
    function generar() {
        let mensaje = mensajesEjemplo[tono];
        if (!mensaje) {
            mensaje = mensajesEjemplo.urgente;
        }
        onGenerar(mensaje);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: generar,
                className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    "Generar"
                ]
            }, void 0, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Seccion, {
                titulo: "Tono",
                abierta: seccionesAbiertas.includes("tono"),
                onToggle: function() {
                    toggleSeccion("tono");
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: opcionesTono.map(function(opt) {
                        let claseLabel = "border-gray-200 hover:border-gray-300";
                        if (tono === opt.valor) {
                            claseLabel = "border-brand bg-brand-light";
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors " + claseLabel,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "radio",
                                    name: "tono",
                                    checked: tono === opt.valor,
                                    onChange: function() {
                                        setTono(opt.valor);
                                    },
                                    className: "mt-0.5 accent-brand"
                                }, void 0, false, {
                                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                                    lineNumber: 99,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium text-gray-900",
                                            children: opt.label
                                        }, void 0, false, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                                            lineNumber: 107,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500",
                                            children: opt.desc
                                        }, void 0, false, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                                            lineNumber: 108,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                                    lineNumber: 106,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, opt.valor, true, {
                            fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                            lineNumber: 98,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Seccion, {
                titulo: "Idioma",
                abierta: seccionesAbiertas.includes("idioma"),
                onToggle: function() {
                    toggleSeccion("idioma");
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioSimple, {
                    opciones: opcionesIdioma,
                    nombre: "idioma",
                    valor: idioma,
                    onChange: setIdioma
                }, void 0, false, {
                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Seccion, {
                titulo: "Canal",
                abierta: seccionesAbiertas.includes("canal"),
                onToggle: function() {
                    toggleSeccion("canal");
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioSimple, {
                    opciones: opcionesCanal,
                    nombre: "canal",
                    valor: canal,
                    onChange: setCanal
                }, void 0, false, {
                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Seccion, {
                titulo: "Extension",
                abierta: seccionesAbiertas.includes("extension"),
                onToggle: function() {
                    toggleSeccion("extension");
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioSimple, {
                    opciones: opcionesExtension,
                    nombre: "extension",
                    valor: extension,
                    onChange: setExtension
                }, void 0, false, {
                    fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 135,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(TagsPanel, "c6q3WuZg8LtNT5OOduAnwQOXmFM=");
_c = TagsPanel;
// componente para las secciones que se abren y cierran
function Seccion({ titulo, abierta, onToggle, children }) {
    let icono;
    if (abierta) {
        icono = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
            lineNumber: 151,
            columnNumber: 13
        }, this);
    } else {
        icono = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
            lineNumber: 153,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-b border-gray-100 last:border-b-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "w-full flex items-center gap-2 py-3 text-sm font-medium text-gray-700 hover:text-brand transition-colors",
                children: [
                    icono,
                    titulo
                ]
            }, void 0, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            abierta && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pb-3",
                children: children
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 167,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
        lineNumber: 157,
        columnNumber: 5
    }, this);
}
_c1 = Seccion;
// radios simples para idioma, canal y extension
function RadioSimple({ opciones, nombre, valor, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: opciones.map(function(opt) {
            let claseLabel = "border-gray-200 hover:border-gray-300";
            if (valor === opt.valor) {
                claseLabel = "border-brand bg-brand-light";
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors " + claseLabel,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "radio",
                        name: nombre,
                        checked: valor === opt.valor,
                        onChange: function() {
                            onChange(opt.valor);
                        },
                        className: "accent-brand"
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                        lineNumber: 186,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-700",
                        children: opt.label
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                        lineNumber: 193,
                        columnNumber: 13
                    }, this)
                ]
            }, opt.valor, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
                lineNumber: 185,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx",
        lineNumber: 177,
        columnNumber: 5
    }, this);
}
_c2 = RadioSimple;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "TagsPanel");
__turbopack_context__.k.register(_c1, "Seccion");
__turbopack_context__.k.register(_c2, "RadioSimple");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MessageEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$app$2f$components$2f$ChatPanel$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/app/components/ChatPanel.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$app$2f$components$2f$TagsPanel$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/app/components/TagsPanel.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function MessageEditor() {
    _s();
    let params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    let esNuevo = params.id === "new";
    // valores iniciales segun si es mensaje nuevo o existente
    let asuntoInicial = "";
    let cuerpoInicial = "";
    if (!esNuevo) {
        asuntoInicial = "No te lo pierdas! Comedy Night es manana";
        cuerpoInicial = "Hola [Nombre], consigue tus entradas antes de que se agoten! Nos preparamos para una noche increible de comedia.\n\nNo dejes pasar esta oportunidad unica.";
    }
    const [tabActiva, setTabActiva] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("etiquetas");
    const [asunto, setAsunto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(asuntoInicial);
    const [cuerpo, setCuerpo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(cuerpoInicial);
    let tabsPanel = [
        "etiquetas",
        "chat",
        "manual"
    ];
    // cuando el chat devuelve un borrador, lo aplicamos al editor
    function aplicarDesdeChat(nuevoAsunto, nuevoCuerpo) {
        if (nuevoAsunto) {
            setAsunto(nuevoAsunto);
        }
        setCuerpo(nuevoCuerpo);
    }
    // renderiza el contenido de la tab del panel izquierdo
    function renderContenidoTab() {
        if (tabActiva === "etiquetas") {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$app$2f$components$2f$TagsPanel$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                onGenerar: function(texto) {
                    setCuerpo(texto);
                }
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                lineNumber: 40,
                columnNumber: 14
            }, this);
        }
        if (tabActiva === "chat") {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$app$2f$components$2f$ChatPanel$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                onAplicar: aplicarDesdeChat
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                lineNumber: 44,
                columnNumber: 14
            }, this);
        }
        if (tabActiva === "manual") {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-400",
                children: "Usa el editor de la derecha para escribir directamente."
            }, void 0, false, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                lineNumber: 49,
                columnNumber: 9
            }, this);
        }
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-gray-200 px-4 py-3 flex items-center gap-4 bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "text-gray-400 hover:text-gray-700 transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-500",
                        children: esNuevo ? "Nuevo mensaje" : "Editar mensaje"
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 ml-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                        lineNumber: 71,
                                        columnNumber: 13
                                    }, this),
                                    "Generar Mensaje"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-md text-sm hover:bg-orange-600 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                        lineNumber: 75,
                                        columnNumber: 13
                                    }, this),
                                    "Envio"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col md:flex-row overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-white overflow-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex border-b border-gray-200 px-2 pt-2",
                                children: tabsPanel.map(function(tab) {
                                    let claseTab = "text-gray-500 hover:text-gray-700";
                                    if (tabActiva === tab) {
                                        claseTab = "bg-gray-100 text-gray-900 font-medium rounded-t-md";
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: function() {
                                            setTabActiva(tab);
                                        },
                                        className: "px-3 py-2 text-xs capitalize transition-colors " + claseTab,
                                        children: tab
                                    }, tab, false, {
                                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4",
                                children: renderContenidoTab()
                            }, void 0, false, {
                                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 p-4 md:p-8 overflow-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-2xl mx-auto space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl md:text-2xl font-bold text-gray-900",
                                    children: [
                                        "Nombre del Evento: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-brand",
                                            children: "Comedy Night Live"
                                        }, void 0, false, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                            lineNumber: 116,
                                            columnNumber: 34
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-gray-700 mb-1 block",
                                                    children: "Asunto"
                                                }, void 0, false, {
                                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                                    lineNumber: 121,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: asunto,
                                                    onChange: function(e) {
                                                        setAsunto(e.target.value);
                                                    },
                                                    placeholder: "Escribe el asunto del mensaje...",
                                                    className: "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand"
                                                }, void 0, false, {
                                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                                    lineNumber: 122,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-gray-700 mb-1 block",
                                                    children: "Cuerpo del mensaje"
                                                }, void 0, false, {
                                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                                    lineNumber: 131,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    value: cuerpo,
                                                    onChange: function(e) {
                                                        setCuerpo(e.target.value);
                                                    },
                                                    placeholder: "Escribe el contenido del mensaje...",
                                                    rows: 12,
                                                    className: "w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y focus:outline-none focus:border-brand"
                                                }, void 0, false, {
                                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                                    lineNumber: 132,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2 pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors",
                                            children: "Aprobar y Programar"
                                        }, void 0, false, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
                                            children: "Guardar como borrador"
                                        }, void 0, false, {
                                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                            lineNumber: 146,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/outbounding_automation/apps/frontend/app/message/[id]/page.js",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(MessageEditor, "SoIhwHCvc4PnRH3CBPGhTNot4Ck=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = MessageEditor;
var _c;
__turbopack_context__.k.register(_c, "MessageEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowLeft
]);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m12 19-7-7 7-7",
            key: "1l729n"
        }
    ],
    [
        "path",
        {
            d: "M19 12H5",
            key: "x3x0zl"
        }
    ]
];
const ArrowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("arrow-left", __iconNode);
;
 //# sourceMappingURL=arrow-left.js.map
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowLeft",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript)");
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Sparkles
]);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
            key: "1s2grr"
        }
    ],
    [
        "path",
        {
            d: "M20 2v4",
            key: "1rf3ol"
        }
    ],
    [
        "path",
        {
            d: "M22 4h-4",
            key: "gwowj6"
        }
    ],
    [
        "circle",
        {
            cx: "4",
            cy: "20",
            r: "2",
            key: "6kqj1y"
        }
    ]
];
const Sparkles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("sparkles", __iconNode);
;
 //# sourceMappingURL=sparkles.js.map
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sparkles",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript)");
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Send
]);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
            key: "1ffxy3"
        }
    ],
    [
        "path",
        {
            d: "m21.854 2.147-10.94 10.939",
            key: "12cjpa"
        }
    ]
];
const Send = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("send", __iconNode);
;
 //# sourceMappingURL=send.js.map
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Send",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript)");
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LoaderCircle
]);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21 12a9 9 0 1 1-6.219-8.56",
            key: "13zald"
        }
    ]
];
const LoaderCircle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("loader-circle", __iconNode);
;
 //# sourceMappingURL=loader-circle.js.map
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Loader2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript)");
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronRight
]);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m9 18 6-6-6-6",
            key: "mthhwq"
        }
    ]
];
const ChevronRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("chevron-right", __iconNode);
;
 //# sourceMappingURL=chevron-right.js.map
}),
"[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$outbounding_automation$2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/outbounding_automation/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=outbounding_automation_apps_frontend_294a993e._.js.map