"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, Tag, UserCheck, ClipboardList,
  Crown, Clock, Share2, CheckCircle, XCircle,
  Info, Mail, AlertTriangle, Pencil, Zap, ImageIcon, X,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const CADENAS = [
  {
    id: "low_sales_discount",
    nombre: "Descuento ventas bajas",
    desc: "Email + código promo automático",
    Icono: Tag,
    colorClass: "text-orange-500",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    prompt: "Las ventas del evento están bajas, activa un descuento",
    steps: [
      "Obteniendo métricas de Eventbrite...",
      "Buscando usuarios interesados...",
      "Generando email con IA...",
      "Creando código de descuento...",
      "Enviando emails...",
    ],
  },
  {
    id: "age_facebook_campaign",
    nombre: "Campaña Facebook / Instagram",
    desc: "Post segmentado por perfil de edad",
    Icono: Share2,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    prompt: "Quiero lanzar una campaña en redes sociales",
    steps: [
      "Calculando perfil de edad de asistentes...",
      "Eligiendo canal (Facebook / Instagram)...",
      "Obteniendo datos del evento...",
      "Generando copy del post con IA...",
      "Publicando en redes sociales...",
    ],
  },
  {
    id: "checkin_welcome",
    nombre: "Bienvenida check-in",
    desc: "Push personalizado al escanear entrada",
    Icono: UserCheck,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    prompt: "Un asistente acaba de hacer check-in en el evento",
    needsEmail: true,
    steps: [
      "Buscando perfil del asistente...",
      "Detectando si es VIP...",
      "Generando bienvenida con IA...",
      "Enviando push notification via OneSignal...",
    ],
  },
  {
    id: "post_event_survey",
    nombre: "Encuesta post-evento",
    desc: "Encuesta de satisfacción con IA",
    Icono: ClipboardList,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    prompt: "El evento terminó, quiero enviar una encuesta de feedback",
    steps: [
      "Buscando asistentes con check-in...",
      "Generando preguntas con IA...",
      "Creando encuesta en base de datos...",
      "Enviando emails personalizados...",
    ],
  },
  {
    id: "vip_upsell",
    nombre: "Upsell VIP",
    desc: "Oferta exclusiva para asistentes con 3+ eventos",
    Icono: Crown,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    prompt: "Quiero hacer una oferta especial a mis asistentes VIP",
    steps: [
      "Identificando asistentes VIP...",
      "Analizando preferencias y gasto...",
      "Generando oferta exclusiva con IA...",
      "Preparando borrador para tu revisión...",
    ],
  },
  {
    id: "last_minute_push",
    nombre: "Último aviso",
    desc: "Push + SMS urgente con entradas disponibles",
    Icono: Clock,
    colorClass: "text-red-500",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    prompt: "Quedan pocas horas para el evento y hay entradas disponibles",
    steps: [
      "Calculando entradas disponibles...",
      "Buscando lista de espera e interesados...",
      "Generando mensaje urgente con IA...",
      "Preparando borrador para tu revisión...",
    ],
  },
];

const STEPS_GENERICOS = [
  "El router de IA está decidiendo la estrategia...",
  "Consultando datos del evento...",
  "Generando contenido con IA...",
  "Procesando la campaña...",
  "Finalizando...",
];

const RAZONES_SKIPPED = {
  sales_ok: "Las ventas están en buen nivel, no hace falta activar un descuento ahora.",
  no_users: "No hay usuarios interesados registrados para este evento.",
  young_audience: "La audiencia es menor de 30 años — se recomienda Instagram en su lugar.",
};

const CHAIN_CARD_CONFIG = {
  low_sales_discount:    { label: "Campaña de descuento lista",    color: "text-orange-600",  bg: "bg-orange-50",   border: "border-orange-200"  },
  age_facebook_campaign: { label: "Post de Facebook / Instagram",  color: "text-sky-600",     bg: "bg-sky-50",      border: "border-sky-100"     },
  vip_upsell:            { label: "Oferta VIP lista",              color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200"   },
  last_minute_push:      { label: "Mensaje de último aviso",       color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"     },
  post_event_survey:     { label: "Encuesta post-evento lista",    color: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-200"  },
  checkin_welcome:       { label: "Mensaje de bienvenida",         color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" },
};

function BotAvatar() {
  return (
    <div className="shrink-0 mt-0.5">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="#F05537"/>
        <path d="M16 5L7.5 14.5H13.5L12 23L20.5 13.5H14.5L16 5Z" fill="white"/>
      </svg>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg width="110" height="84" viewBox="0 0 110 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ticket base */}
      <rect x="8" y="24" width="94" height="40" rx="9" fill="#FFF0EC"/>
      {/* Notch left */}
      <circle cx="8" cy="44" r="8" fill="#FEFCFB"/>
      {/* Notch right */}
      <circle cx="102" cy="44" r="8" fill="#FEFCFB"/>
      {/* Dashed divider */}
      <line x1="16" y1="44" x2="94" y2="44" stroke="#FED4C9" strokeWidth="1.5" strokeDasharray="4 3"/>
      {/* Left content area */}
      <rect x="20" y="31" width="30" height="11" rx="2.5" fill="#F05537" fillOpacity="0.1"/>
      <rect x="22" y="33" width="18" height="2.5" rx="1.25" fill="#F05537" fillOpacity="0.55"/>
      <rect x="22" y="37" width="12" height="2" rx="1" fill="#F05537" fillOpacity="0.35"/>
      {/* Barcode strips */}
      <rect x="62" y="31" width="2.5" height="11" rx="1" fill="#F05537" fillOpacity="0.3"/>
      <rect x="66" y="31" width="1.5" height="9" rx="0.75" fill="#F05537" fillOpacity="0.22"/>
      <rect x="69" y="31" width="3" height="11" rx="1" fill="#F05537" fillOpacity="0.3"/>
      <rect x="74" y="31" width="1.5" height="8" rx="0.75" fill="#F05537" fillOpacity="0.22"/>
      <rect x="77" y="31" width="2.5" height="11" rx="1" fill="#F05537" fillOpacity="0.28"/>
      <rect x="81" y="31" width="1" height="9" rx="0.5" fill="#F05537" fillOpacity="0.2"/>
      <rect x="83.5" y="31" width="2.5" height="11" rx="1" fill="#F05537" fillOpacity="0.28"/>
      {/* Sparkles */}
      <path d="M94 14L95.8 19.5L101.5 14L95.8 8.5L94 14Z" fill="#F05537" fillOpacity="0.65"/>
      <path d="M11 9L12.4 13L16 9L12.4 5L11 9Z" fill="#F05537" fillOpacity="0.45"/>
      <circle cx="84" cy="70" r="3" fill="#F05537" fillOpacity="0.3"/>
      <circle cx="24" cy="72" r="2" fill="#F05537" fillOpacity="0.22"/>
      <circle cx="55" cy="5" r="2.5" fill="#F05537" fillOpacity="0.4"/>
      <circle cx="100" cy="62" r="1.5" fill="#F05537" fillOpacity="0.25"/>
      <circle cx="10" cy="60" r="1" fill="#F05537" fillOpacity="0.2"/>
    </svg>
  );
}

export default function ChatPanel({ onAplicar }) {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoAdvisor, setCargandoAdvisor] = useState(false);
  const [cadenaActiva, setCadenaActiva] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [facebookImageUrl, setFacebookImageUrl] = useState("");
  const [previaMsg, setPreviaMsg] = useState(null);
  const [historialAdvisor, setHistorialAdvisor] = useState([]);
  const scrollContainerRef = useRef(null);
  const montadoRef = useRef(true);
  const pasoTimerRef = useRef(null);
  const textareaRef = useRef(null);
  const ultimoTextoRef = useRef("");

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      clearInterval(pasoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando, cargandoAdvisor, previaMsg]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  function iniciarPasos(steps) {
    setPasoActual(0);
    clearInterval(pasoTimerRef.current);
    let paso = 0;
    const intervalo = Math.floor(55000 / steps.length);
    pasoTimerRef.current = setInterval(() => {
      paso++;
      if (paso < steps.length - 1) {
        if (montadoRef.current) setPasoActual(paso);
      } else {
        clearInterval(pasoTimerRef.current);
      }
    }, intervalo);
  }

  async function esperarResultado(jobId) {
    for (let intentos = 0; intentos < 30; intentos++) {
      await new Promise(r => setTimeout(r, 2000));
      if (!montadoRef.current) return null;
      const res = await fetch(`${BACKEND_URL}/api/chat/status/${jobId}`);
      const datos = await res.json();
      if (datos.state === "completed") return datos.result;
      if (datos.state === "failed") {
        const msg = datos.result?.error || datos.result?.message || "El servidor no pudo procesar la solicitud.";
        throw new Error(msg);
      }
    }
    throw new Error("Tiempo de espera agotado");
  }

  function enviar(textoOverride) {
    const texto = (textoOverride || input).trim();
    if (!texto || cargando || previaMsg || cargandoAdvisor) return;

    if (cadenaActiva?.needsEmail && !attendeeEmail.trim()) {
      alert("Introduce el email del asistente antes de continuar.");
      return;
    }

    setMensajes(prev => [...prev, { rol: "usuario", texto }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    ultimoTextoRef.current = texto;

    if (cadenaActiva) {
      setPreviaMsg({ texto, cadena: cadenaActiva });
      return;
    }

    consultarAdvisor(texto);
  }

  async function consultarAdvisor(texto) {
    setCargandoAdvisor(true);
    const nuevoHistorial = [...historialAdvisor, { role: "user", content: texto }];
    setHistorialAdvisor(nuevoHistorial);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nuevoHistorial }),
      });

      if (!res.ok) throw new Error("Error del asesor");
      const { reply, chainId } = await res.json();
      if (!montadoRef.current) return;

      setHistorialAdvisor([...nuevoHistorial, { role: "assistant", content: reply }]);

      const cadenaSugerida = chainId ? CADENAS.find(c => c.id === chainId) : null;
      setMensajes(prev => [...prev, {
        rol: "asistente",
        esAdvisor: true,
        texto: reply,
        cadenaSugerida,
      }]);
    } catch (e) {
      if (!montadoRef.current) return;
      setMensajes(prev => [...prev, {
        rol: "asistente",
        esError: true,
        texto: "No pude conectar con el asesor. Puedes usar los atajos de abajo.",
      }]);
    } finally {
      if (montadoRef.current) setCargandoAdvisor(false);
    }
  }

  function ejecutarCadenaSugerida(cadena) {
    setCadenaActiva(cadena);
    setPreviaMsg({ texto: ultimoTextoRef.current || cadena.prompt, cadena });
  }

  async function confirmarEjecucion() {
    if (!previaMsg || cargando) return;
    const { texto, cadena } = previaMsg;
    setPreviaMsg(null);
    setCargando(true);

    const steps = cadena?.steps || STEPS_GENERICOS;
    iniciarPasos(steps);

    try {
      let promptFinal = texto;
      if (cadena?.id === "age_facebook_campaign" && facebookImageUrl) {
        promptFinal = `${texto}\nImagen para el post: ${facebookImageUrl}`;
      }

      const body = { prompt: promptFinal, eventId: "EVT-999" };
      if (cadena?.id) body.chainId = cadena.id;
      if (attendeeEmail) body.attendeeEmail = attendeeEmail;

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("No se pudo iniciar la tarea. Comprueba que el servidor esté activo.");
      const { jobId } = await res.json();
      const resultado = await esperarResultado(jobId);
      if (!montadoRef.current) return;

      clearInterval(pasoTimerRef.current);
      const cadenaId = cadena?.id || resultado?.chainUsed || resultado?.chain || null;
      const draftId = resultado?.draftId || resultado?._id;

      if (cadenaId === "post_event_survey") {
        if (!draftId) {
          setMensajes(prev => [...prev, { rol: "asistente", cadena: "post_event_survey", resultado: { status: "no_attendees" } }]);
        } else {
          try {
            const draftRes = await fetch(`${BACKEND_URL}/api/drafts/${draftId}`);
            const fullDraft = draftRes.ok ? await draftRes.json() : { _id: draftId, status: "pending" };
            setMensajes(prev => [...prev, { rol: "asistente", cadena: "post_event_survey", resultado: fullDraft }]);
          } catch {
            setMensajes(prev => [...prev, { rol: "asistente", cadena: "post_event_survey", resultado: { _id: draftId, status: "pending" } }]);
          }
        }
      } else {
        // El job result solo trae draftId; el contenido real está en el Draft
        let resultadoFinal = resultado;
        if (draftId && !resultado?.body) {
          try {
            const draftRes = await fetch(`${BACKEND_URL}/api/drafts/${draftId}`);
            if (draftRes.ok) {
              const fullDraft = await draftRes.json();
              resultadoFinal = {
                ...resultado,
                subject: fullDraft.subject ?? resultado.subject,
                body: fullDraft.body ?? resultado.body,
                draftId,
              };
            }
          } catch { /* usar resultado original */ }
        }

        setMensajes(prev => [...prev, { rol: "asistente", resultado: resultadoFinal, cadena: cadenaId }]);

        if (draftId && (resultado?.status === "pending_approval" || resultado?.status === "pending")) {
          const borrador = {
            id: draftId,
            asunto: resultadoFinal.subject || "",
            cuerpo: resultadoFinal.body || "",
            chainUsed: cadenaId,
            status: "pending",
            fecha: new Date().toISOString(),
          };
          const existentes = JSON.parse(localStorage.getItem("borradores") || "[]");
          const idx = existentes.findIndex(b => b.id === borrador.id);
          if (idx < 0) existentes.unshift(borrador);
          localStorage.setItem("borradores", JSON.stringify(existentes));
        }

        if (onAplicar && (resultado?.status === "pending_approval" || resultadoFinal?.subject || resultadoFinal?.body)) {
          const canalEditor = cadenaId === "last_minute_push" ? "sms"
            : cadenaId === "age_facebook_campaign" ? "facebook"
            : cadenaId === "checkin_welcome" ? "push"
            : "email";
          onAplicar(
            resultadoFinal.subject ?? null,
            resultadoFinal.body ?? "",
            draftId,
            canalEditor,
            cadenaId === "age_facebook_campaign" ? facebookImageUrl : null,
          );
        }
      }

      setCadenaActiva(null);
      setHistorialAdvisor([]);
      setAttendeeEmail("");
      setFacebookImageUrl("");
    } catch (e) {
      if (!montadoRef.current) return;
      clearInterval(pasoTimerRef.current);
      setMensajes(prev => [...prev, { rol: "asistente", esError: true, texto: e.message }]);
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  }

  function cancelarEjecucion() {
    setPreviaMsg(null);
    setCadenaActiva(null);
    setAttendeeEmail("");
    setFacebookImageUrl("");
  }

  async function aprobarDraft(draftId) {
    if (!draftId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/drafts/${draftId}/approve`, { method: "POST" });
      if (res.ok) {
        setMensajes(prev => prev.map(m => {
          const id = m.resultado?.draftId || m.resultado?._id;
          return id === draftId ? { ...m, resultado: { ...m.resultado, status: "approved" } } : m;
        }));
      } else {
        setMensajes(prev => prev.map(m => {
          const id = m.resultado?.draftId || m.resultado?._id;
          return id === draftId ? { ...m, aprobacionError: "El envío automático estará disponible próximamente." } : m;
        }));
        setTimeout(() => setMensajes(prev => prev.map(m => ({ ...m, aprobacionError: undefined }))), 4000);
      }
    } catch {
      setMensajes(prev => prev.map(m => {
        const id = m.resultado?.draftId || m.resultado?._id;
        return id === draftId ? { ...m, aprobacionError: "Error de conexión." } : m;
      }));
      setTimeout(() => setMensajes(prev => prev.map(m => ({ ...m, aprobacionError: undefined }))), 4000);
    }
  }

  function rechazarDraft(draftId) {
    setMensajes(prev => prev.map(m => {
      const id = m.resultado?.draftId || m.resultado?._id;
      return id === draftId ? { ...m, resultado: { ...m.resultado, status: "rejected" } } : m;
    }));
  }

  function seleccionarAtajo(cadena) {
    setCadenaActiva(cadena);
    setInput(cadena.prompt);
    textareaRef.current?.focus();
  }

  const hayMensajesUsuario = mensajes.some(m => m.rol === "usuario");
  const stepsActivos = cadenaActiva?.steps || STEPS_GENERICOS;
  const inputDesactivado = cargando || !!previaMsg || cargandoAdvisor;
  const esFacebook = cadenaActiva?.id === "age_facebook_campaign";

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden" style={{ background: "#FEFCFB", border: "1px solid #F0EBE8" }}>

      {/* Scroll area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">

        {/* Welcome / empty state */}
        {!hayMensajesUsuario && !cargando && !cargandoAdvisor && (
          <div className="px-4 pt-6 pb-4 space-y-5">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <EmptyIllustration />
              </div>
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="14" fill="#F05537"/>
                    <path d="M16 5L7.5 14.5H13.5L12 23L20.5 13.5H14.5L16 5Z" fill="white"/>
                  </svg>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#F05537" }}>EventBot · AI</span>
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "#39364F" }}>¡Hola! Soy EventBot, ¿qué está pasando con tu evento?</h2>
                <p className="text-xs leading-relaxed" style={{ color: "#9491A7" }}>
                  Cuéntame la situación y te sugiero la mejor estrategia.
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: "#C4C2D0" }}>
                <Zap size={9} style={{ color: "#C4C2D0" }} /> Acciones rápidas
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CADENAS.map(cadena => {
                  const { Icono } = cadena;
                  const activa = cadenaActiva?.id === cadena.id;
                  return (
                    <button
                      key={cadena.id}
                      onClick={() => seleccionarAtajo(cadena)}
                      className="text-left p-3 rounded-xl bg-white transition-all hover:shadow-md"
                      style={{
                        border: activa ? "1.5px solid #F05537" : "1.5px solid #EDE9F0",
                        boxShadow: activa ? "0 0 0 3px #FFF0EC" : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{ background: activa ? "#F05537" : "#FFF0EC" }}
                        >
                          <Icono size={12} style={{ color: activa ? "white" : "#F05537" }} />
                        </div>
                        <span className="text-[11px] font-semibold leading-tight" style={{ color: "#39364F" }}>{cadena.nombre}</span>
                      </div>
                      <p className="text-[10px] leading-tight pl-8" style={{ color: "#9491A7" }}>{cadena.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="px-4 pb-4 space-y-4">
          {mensajes.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.rol === "usuario" ? "justify-end" : "justify-start items-start"}`}>
              {msg.rol !== "usuario" && <BotAvatar />}
              {msg.rol === "usuario" ? (
                <div
                  className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed"
                  style={{ background: "#F05537", color: "white" }}
                >
                  {msg.texto}
                </div>
              ) : msg.esError ? (
                <div
                  className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm"
                  style={{ background: "#FFF1F2", color: "#BE123C", border: "1px solid #FECDD3" }}
                >
                  {msg.texto}
                </div>
              ) : msg.esAdvisor ? (
                <div className="max-w-[90%] space-y-2">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ background: "white", color: "#39364F", border: "1px solid #EDE9F0" }}
                  >
                    {msg.texto}
                  </div>
                  {msg.cadenaSugerida && !cargando && !previaMsg && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        onClick={() => ejecutarCadenaSugerida(msg.cadenaSugerida)}
                        disabled={cargandoAdvisor}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-40 hover:shadow-sm"
                        style={{ background: "#FFF0EC", color: "#F05537", borderColor: "#FED4C9" }}
                      >
                        {(() => { const { Icono } = msg.cadenaSugerida; return <Icono size={12} />; })()}
                        Ejecutar: {msg.cadenaSugerida.nombre}
                      </button>
                      <span className="text-[11px]" style={{ color: "#C4C2D0" }}>o sigue escribiendo</span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="max-w-[92%] rounded-2xl rounded-bl-sm p-4 space-y-2.5"
                  style={{ background: "white", border: "1px solid #EDE9F0" }}
                >
                  {renderResultadoCadena(msg.resultado, msg.cadena, onAplicar, aprobarDraft, rechazarDraft, msg.aprobacionError, (body) => {
                    const esFB = msg.cadena === "age_facebook_campaign";
                    setInput(esFB
                      ? `Modifica este post de Facebook (mantén los hashtags, ajusta el tono o añade lo que quieras):\n\n${body}\n\nCambio: `
                      : `Genera una versión diferente de este mensaje:\n\n${body}\n\nSolicitud: `
                    );
                    textareaRef.current?.focus();
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Typing dots */}
          {cargandoAdvisor && (
            <div className="flex gap-2.5 items-start">
              <BotAvatar />
              <div
                className="px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                style={{ background: "white", border: "1px solid #EDE9F0" }}
              >
                {[0, 150, 300].map(d => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#F05537", opacity: 0.65, animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Before-execute card */}
          {previaMsg && (
            <div className="flex gap-2.5 items-start">
              <BotAvatar />
              <div
                className="max-w-[92%] rounded-2xl rounded-bl-sm p-4 space-y-3"
                style={{ background: "#FFF9F8", border: "1px solid #FED4C9" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: "#F05537" }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#F05537" }}>
                    Antes de ejecutar
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#39364F" }}>
                  Esto es lo que haré para{" "}
                  <span className="font-semibold">{previaMsg.cadena?.nombre || "tu solicitud"}</span>:
                </p>
                <ul className="space-y-2">
                  {(previaMsg.cadena?.steps || STEPS_GENERICOS).map((step, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs" style={{ color: "#6B6880" }}>
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ background: "#FFF0EC", color: "#F05537" }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={confirmarEjecucion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "#F05537" }}
                  >
                    <CheckCircle size={13} /> Confirmar y ejecutar
                  </button>
                  <button
                    onClick={cancelarEjecucion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-50 transition-colors"
                    style={{ background: "white", color: "#6B6880", border: "1px solid #EDE9F0" }}
                  >
                    <XCircle size={13} /> Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading steps */}
          {cargando && (
            <div className="flex gap-2.5 items-start">
              <BotAvatar />
              <div
                className="rounded-2xl rounded-bl-sm p-4 space-y-2.5"
                style={{ background: "white", border: "1px solid #EDE9F0" }}
              >
                {stepsActivos.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-xs transition-all"
                    style={{
                      color: i < pasoActual ? "#D4D2E0" : i === pasoActual ? "#39364F" : "#D4D2E0",
                      fontWeight: i === pasoActual ? 600 : 400,
                    }}
                  >
                    {i < pasoActual ? (
                      <CheckCircle size={13} color="#34D399" className="shrink-0" />
                    ) : i === pasoActual ? (
                      <Loader2 size={13} className="animate-spin shrink-0" style={{ color: "#F05537" }} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ border: "1.5px solid #E2E0EC" }} />
                    )}
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Check-in email */}
      {cadenaActiva?.needsEmail && (
        <div className="px-4 pb-2">
          <input
            type="email"
            value={attendeeEmail}
            onChange={e => setAttendeeEmail(e.target.value)}
            placeholder="Email del asistente que hizo check-in..."
            className="w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none"
            style={{ border: "1px solid #A7F3D0", background: "#F0FDF4", color: "#166534" }}
          />
        </div>
      )}

      {/* Facebook image */}
      {esFacebook && (
        <div className="px-4 pb-3 space-y-1.5">
          <p className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: "#4B87F5" }}>
            <ImageIcon size={11} /> Imagen para el post (opcional)
          </p>
          {facebookImageUrl ? (
            <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid #BFDBFE" }}>
              <img src={facebookImageUrl} alt="Preview" className="w-full h-20 object-cover" onError={() => setFacebookImageUrl("")} />
              <button onClick={() => setFacebookImageUrl("")} className="absolute top-1.5 right-1.5 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors">
                <X size={11} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={facebookImageUrl}
                onChange={e => setFacebookImageUrl(e.target.value)}
                placeholder="https://... URL de la imagen"
                className="flex-1 px-3 py-2 text-xs rounded-xl focus:outline-none"
                style={{ border: "1px solid #BFDBFE", background: "#EFF6FF" }}
              />
              <label className="flex items-center gap-1 px-3 py-2 text-xs rounded-xl cursor-pointer hover:opacity-80 shrink-0" style={{ background: "#EFF6FF", color: "#4B87F5", border: "1px solid #BFDBFE" }}>
                <ImageIcon size={11} /> Subir
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setFacebookImageUrl(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3" style={{ borderTop: "1px solid #F0EBE8", background: "white" }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-3.5 py-2 transition-all"
          style={{ background: "#F7F5FA", border: "1.5px solid #EDE9F0" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
            }}
            rows={1}
            className="flex-1 bg-transparent text-sm focus:outline-none resize-none overflow-hidden leading-5"
            style={{ minHeight: "28px", color: "#39364F" }}
            placeholder={cadenaActiva ? cadenaActiva.prompt : "Cuéntame qué está pasando con tu evento..."}
            disabled={inputDesactivado}
          />
          <button
            onClick={() => enviar()}
            disabled={cargando || cargandoAdvisor || !input.trim()}
            className="rounded-xl p-2 transition-all disabled:cursor-not-allowed"
            style={{ background: input.trim() && !cargando && !cargandoAdvisor ? "#F05537" : "#EDE9F0" }}
          >
            <Send size={15} style={{ color: input.trim() && !cargando && !cargandoAdvisor ? "white" : "#B0AEBF" }} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-1.5" style={{ color: "#D4D2E0" }}>
          EventBot · Para eventos Eventbrite
        </p>
      </div>
    </div>
  );
}

function renderResultadoCadena(resultado, cadena, onAplicar, aprobarDraft, rechazarDraft, aprobacionError, onRefinar) {
  if (cadena === "checkin_welcome") {
    if (resultado?.status === "skipped") {
      return (
        <p className="flex items-start gap-1.5 text-sm text-gray-600">
          <Info size={14} className="shrink-0 mt-0.5 text-blue-400" />
          Asistente no encontrado en la base de datos.
        </p>
      );
    }
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <CheckCircle size={14} /> Push de bienvenida enviada{resultado?.isVIP ? " · VIP 👑" : ""}
        </p>
        {resultado?.message && (
          <div className="rounded-lg px-3 py-2.5 border text-sm text-gray-700 bg-emerald-50 border-emerald-200">
            {resultado.message}
          </div>
        )}
      </div>
    );
  }

  if (cadena === "post_event_survey") {
    if (resultado?.status === "no_attendees") {
      return <p className="text-sm text-gray-500 flex items-center gap-1.5"><Info size={14} className="text-blue-400 shrink-0" /> No hay asistentes pendientes de encuestar para este evento.</p>;
    }
    if (resultado?._id) return <SurveyCard draft={resultado} />;
    return <p className="text-sm text-gray-500">No se pudo cargar la encuesta.</p>;
  }

  if (!resultado) {
    if (cadena === "vip_upsell") {
      return <p className="text-sm text-gray-500">No hay asistentes VIP registrados para este evento.</p>;
    }
    return <p className="text-sm text-gray-500">No se recibió respuesta del servidor.</p>;
  }

  if (resultado.status === "skipped") {
    return (
      <p className="flex items-start gap-1.5 text-sm text-gray-600">
        <Info size={14} className="shrink-0 mt-0.5 text-blue-400" />
        {RAZONES_SKIPPED[resultado.reason] || "La acción no fue necesaria en este momento."}
      </p>
    );
  }

  if (resultado.status === "approved") {
    return <p className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle size={14} /> Campaña aprobada y enviada.</p>;
  }

  if (resultado.status === "rejected") {
    return <p className="flex items-center gap-1.5 text-sm text-gray-400"><XCircle size={14} /> Borrador rechazado.</p>;
  }

  // Handler universal: el worker siempre devuelve status "pending_approval" con subject + body
  if (resultado.status === "pending_approval" || resultado.subject || resultado.body) {
    const cfg = CHAIN_CARD_CONFIG[cadena] || { label: "Campaña lista", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
    const requiereAprobacion = cadena === "vip_upsell" || cadena === "last_minute_push";
    const draftId = resultado.draftId || resultado._id;

    // Canal para el editor
    const canalEditor = cadena === "last_minute_push" ? "sms"
      : cadena === "age_facebook_campaign" ? "facebook"
      : cadena === "checkin_welcome" ? "push"
      : "email";

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
            {cfg.label}
          </p>
          {requiereAprobacion && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle size={11} /> Requiere aprobación
            </span>
          )}
        </div>

        {resultado.subject && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Asunto</p>
            <p className="text-sm font-medium text-gray-800">{resultado.subject}</p>
          </div>
        )}

        {resultado.body && (
          <div className={`rounded-lg px-3 py-2.5 border text-sm text-gray-700 whitespace-pre-wrap leading-relaxed ${cfg.bg} ${cfg.border}`}>
            {resultado.body}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            onClick={() => aprobarDraft(draftId)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#F05537" }}
          >
            <CheckCircle size={12} /> Aprobar y enviar
          </button>
          {onRefinar && resultado.body && (
            <button
              onClick={() => onRefinar(resultado.body)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium hover:shadow-sm transition-all"
              style={{ background: "#FFF0EC", color: "#F05537", border: "1px solid #FED4C9" }}
            >
              <Pencil size={12} /> Ajustar texto
            </button>
          )}
          {onAplicar && (resultado.subject || resultado.body) && (
            <button
              onClick={() => onAplicar(resultado.subject, resultado.body, draftId, canalEditor, undefined, true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors"
              style={{ background: "white", color: "#6B6880", border: "1px solid #EDE9F0" }}
            >
              <Mail size={12} /> Editar
            </button>
          )}
          <button
            onClick={() => rechazarDraft(draftId)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors"
            style={{ background: "white", color: "#9491A7", border: "1px solid #EDE9F0" }}
          >
            <XCircle size={12} /> Rechazar
          </button>
          {aprobacionError && (
            <p className="w-full text-xs mt-0.5" style={{ color: "#D97706" }}>{aprobacionError}</p>
          )}
        </div>
      </div>
    );
  }

  return <p className="text-sm text-gray-400 italic">No hay contenido que mostrar.</p>;
}

function SurveyCard({ draft: initialDraft }) {
  const [intro, setIntro] = useState(initialDraft.metadata?.emailIntro || "");
  const [questions, setQuestions] = useState(initialDraft.metadata?.questions || []);
  const [formInfo, setFormInfo] = useState(initialDraft.metadata?.googleForm || null);
  const [sendResult, setSendResult] = useState(null);
  const [status, setStatus] = useState(initialDraft.status);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const draftId = initialDraft._id;
  const recipientCount = initialDraft.metadata?.recipientEmails?.length || 0;
  const isSent = status === "sent";

  function updateQuestion(i, field, value) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  function removeQuestion(i) {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  }

  function addQuestion() {
    setQuestions(prev => [...prev, { question: "", type: "text" }]);
  }

  async function publishForm() {
    setLoading("publish");
    setError(null);
    try {
      await fetch(`${BACKEND_URL}/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, emailIntro: intro }),
      });
      const res = await fetch(`${BACKEND_URL}/api/drafts/${draftId}/publish-form`, { method: "POST" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error al publicar"); }
      const data = await res.json();
      setFormInfo(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function sendEmails() {
    if (!confirm(`¿Enviar la encuesta a ${recipientCount} asistente${recipientCount !== 1 ? "s" : ""}?`)) return;
    setLoading("send");
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/drafts/${draftId}/send`, { method: "POST" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error al enviar"); }
      const data = await res.json();
      setSendResult(data);
      setStatus("sent");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  if (isSent && sendResult) {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <CheckCircle size={14} /> Encuesta enviada
        </p>
        <p className="text-xs text-gray-500">
          {sendResult.sent} enviados · {sendResult.failed} fallidos · {sendResult.total} total
        </p>
        {formInfo?.responderUrl && (
          <a href={formInfo.responderUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-purple-600 underline underline-offset-2 hover:text-purple-800">
            Ver formulario
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="flex items-center gap-1.5 text-sm font-medium text-purple-600">
          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
          Encuesta post-evento lista
        </p>
        <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {recipientCount} destinatario{recipientCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Intro del email */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Intro del email</p>
        <textarea
          value={intro}
          onChange={e => setIntro(e.target.value)}
          disabled={isSent}
          rows={3}
          className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-purple-300 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* Preguntas */}
      <div>
        <p className="text-xs text-gray-400 mb-1.5">Preguntas ({questions.length})</p>
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                type="text"
                value={q.question}
                onChange={e => updateQuestion(i, "question", e.target.value)}
                disabled={isSent}
                placeholder={`Pregunta ${i + 1}`}
                className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-300 disabled:bg-gray-50"
              />
              <div className="flex gap-1 shrink-0">
                {["text", "rating"].map(t => (
                  <button
                    key={t}
                    onClick={() => updateQuestion(i, "type", t)}
                    disabled={isSent}
                    className={`text-[10px] px-1.5 py-1 rounded border transition-colors disabled:opacity-50 ${
                      q.type === t ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {t === "text" ? "Texto" : "⭐"}
                  </button>
                ))}
                {!isSent && (
                  <button onClick={() => removeQuestion(i)} className="text-gray-300 hover:text-red-400 px-1">
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {!isSent && (
            <button onClick={addQuestion} className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 mt-1">
              + Añadir pregunta
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Botones de acción */}
      {!formInfo ? (
        <button
          onClick={publishForm}
          disabled={!!loading || questions.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading === "publish" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
          {loading === "publish" ? "Creando formulario..." : "Crear Google Form"}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 space-y-1">
            <p className="text-[11px] font-medium text-purple-700">Google Form creado</p>
            <a href={formInfo.responderUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-purple-600 underline underline-offset-2 hover:text-purple-800 block truncate">
              {formInfo.responderUrl}
            </a>
          </div>
          {!isSent && (
            <button
              onClick={sendEmails}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading === "send" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              {loading === "send" ? "Enviando..." : `Enviar a ${recipientCount} asistente${recipientCount !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
