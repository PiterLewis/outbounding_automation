"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, MessageSquare, Bell, Share2 } from "lucide-react";
import ChatPanel from "../../components/ChatPanel";
import TagsPanel from "../../components/TagsPanel";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TABS_PANEL = ["etiquetas", "chat", "manual"];

const CANAL_CONFIG = {
  email:    { label: "Email",             Icon: Mail,           color: "bg-blue-50 text-blue-700 border-blue-100" },
  sms:      { label: "SMS",               Icon: MessageSquare,  color: "bg-green-50 text-green-700 border-green-100" },
  push:     { label: "Push Notification", Icon: Bell,           color: "bg-purple-50 text-purple-700 border-purple-100" },
  facebook: { label: "Post de Facebook",  Icon: Share2,         color: "bg-sky-50 text-sky-700 border-sky-100" },
};

function CanalBadge({ canal }) {
  const c = CANAL_CONFIG[canal] || CANAL_CONFIG.email;
  const { Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.color}`}>
      <Icon size={12} /> {c.label}
    </span>
  );
}

function ContadorChars({ value, max, warningAt }) {
  const n = (value || "").length;
  let color = "text-gray-400";
  if (n > max) color = "text-red-500 font-semibold";
  else if (n > warningAt) color = "text-amber-500";
  return <span className={`text-xs tabular-nums ${color}`}>{n}/{max}</span>;
}

function EditorEmail({ asunto, onAsunto, cuerpo, onCuerpo }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700">Asunto</label>
        <input
          type="text"
          value={asunto}
          onChange={e => onAsunto(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Asunto del email..."
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Cuerpo del mensaje</label>
        <textarea
          value={cuerpo}
          onChange={e => onCuerpo(e.target.value)}
          rows={12}
          className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Contenido del email..."
        />
      </div>
    </div>
  );
}

function EditorSMS({ cuerpo, onCuerpo }) {
  const bloques = Math.ceil((cuerpo || "").length / 160) || 1;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Mensaje</label>
        <ContadorChars value={cuerpo} max={160} warningAt={130} />
      </div>
      <textarea
        value={cuerpo}
        onChange={e => onCuerpo(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-300"
        placeholder="Escribe el mensaje SMS..."
      />
      {(cuerpo || "").length > 160 && (
        <p className="text-xs text-amber-600">
          Supera 160 caracteres — se enviará como {bloques} SMS concatenados.
        </p>
      )}
      <p className="text-xs text-gray-400">Los SMS tienen un máximo de 160 caracteres por mensaje.</p>
    </div>
  );
}

function EditorPush({ asunto, onAsunto, cuerpo, onCuerpo }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Título <span className="text-gray-400 font-normal">(opcional)</span></label>
          <ContadorChars value={asunto} max={50} warningAt={40} />
        </div>
        <input
          type="text"
          value={asunto}
          onChange={e => onAsunto(e.target.value)}
          maxLength={60}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Título de la notificación..."
        />
        {(asunto || "").length > 50 && (
          <p className="text-xs text-amber-600 mt-1">
            El título supera 50 caracteres — puede quedar truncado en algunos dispositivos.
          </p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Mensaje</label>
          <ContadorChars value={cuerpo} max={100} warningAt={80} />
        </div>
        <textarea
          value={cuerpo}
          onChange={e => onCuerpo(e.target.value)}
          rows={3}
          maxLength={130}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Máximo 100 caracteres para mejor legibilidad..."
        />
        {(cuerpo || "").length > 100 && (
          <p className="text-xs text-amber-600 mt-1">
            Supera 100 caracteres — el mensaje puede quedar cortado en pantalla bloqueada.
          </p>
        )}
      </div>
      <p className="text-xs text-gray-400">Las push notifications se leen en pantalla bloqueada — sé directo y claro.</p>
    </div>
  );
}

function EditorFacebook({ cuerpo, onCuerpo, imageUrl, onImageUrl }) {
  return (
    <div className="space-y-3">
      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-sky-200 bg-sky-50">
          <img src={imageUrl} alt="Imagen del post" className="w-full max-h-56 object-cover" onError={() => onImageUrl("")} />
          <button
            onClick={() => onImageUrl("")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm border border-gray-200"
          >
            Quitar imagen
          </button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-4 py-3 space-y-1.5">
          <p className="text-xs font-medium text-sky-600">Imagen del post (opcional)</p>
          <input
            type="url"
            value={imageUrl}
            onChange={e => onImageUrl(e.target.value)}
            placeholder="https://... URL de la imagen"
            className="w-full px-3 py-1.5 text-xs border border-sky-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Texto del post</label>
          <ContadorChars value={cuerpo} max={280} warningAt={240} />
        </div>
        <textarea
          value={cuerpo}
          onChange={e => onCuerpo(e.target.value)}
          rows={7}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          placeholder="Escribe el texto del post. Incluye hashtags (#evento) y emojis..."
        />
        <p className="text-xs text-gray-400 mt-1">Tip: usa 2-3 hashtags relevantes y máximo 2 emojis para mejor alcance orgánico.</p>
      </div>
    </div>
  );
}

export default function MessageEditor() {
  const params = useParams();
  const esNuevo = params.id === "new";

  const [tabActiva, setTabActiva] = useState("etiquetas");
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [canal, setCanal] = useState("email");
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [cargandoDraft, setCargandoDraft] = useState(!esNuevo);
  const [errorDraft, setErrorDraft] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [facebookImage, setFacebookImage] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aprobado, setAprobado] = useState(false);
  const [errorAprobacion, setErrorAprobacion] = useState(null);

  useEffect(() => {
    if (params.id === "new") return;

    async function cargarDraft() {
      if (params.id.startsWith("local-")) {
        const guardados = JSON.parse(localStorage.getItem("borradores") || "[]");
        const local = guardados.find(b => b.id === params.id);
        if (local) {
          setAsunto(local.asunto ?? "");
          setCuerpo(local.cuerpo ?? "");
          setCurrentDraftId(local.id);
        } else {
          setErrorDraft("Borrador no encontrado");
        }
        setCargandoDraft(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/drafts/${params.id}`);
        if (!res.ok) throw new Error("Borrador no encontrado");
        const draft = await res.json();
        setAsunto(draft.subject ?? "");
        setCuerpo(draft.body ?? "");
        setCurrentDraftId(draft._id);
      } catch (err) {
        setErrorDraft(err.message);
      } finally {
        setCargandoDraft(false);
      }
    }

    cargarDraft();
  }, [params.id]);

  function aplicarDesdeChat(nuevoAsunto, nuevoCuerpo, draftId, canalRecibido, imageUrl, switchTab = false) {
    if (nuevoAsunto) setAsunto(nuevoAsunto);
    if (nuevoCuerpo) setCuerpo(nuevoCuerpo);
    setCurrentDraftId(draftId);
    if (canalRecibido) setCanal(canalRecibido);
    if (imageUrl !== undefined) setFacebookImage(imageUrl || "");
    if (switchTab) setTabActiva("manual");
  }

  async function manejarAprobacion() {
    if (!currentDraftId) {
      setErrorAprobacion("Genera un mensaje desde el Chat y pulsa 'Editar' primero.");
      setTimeout(() => setErrorAprobacion(null), 4000);
      return;
    }
    setEnviando(true);
    setErrorAprobacion(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/drafts/${currentDraftId}/approve`, { method: "POST" });
      if (res.ok) {
        setAprobado(true);
      } else {
        setErrorAprobacion("El envío automático estará disponible próximamente.");
        setTimeout(() => setErrorAprobacion(null), 4000);
      }
    } catch {
      setErrorAprobacion("Error de conexión con el servidor.");
      setTimeout(() => setErrorAprobacion(null), 4000);
    } finally {
      setEnviando(false);
    }
  }

  function guardarBorrador() {
    if (typeof window === "undefined") return;
    const borrador = {
      id: currentDraftId || `local-${Date.now()}`,
      asunto, cuerpo, canal,
      fecha: new Date().toISOString(),
    };
    const existentes = JSON.parse(localStorage.getItem("borradores") || "[]");
    const idx = existentes.findIndex(b => b.id === borrador.id);
    if (idx >= 0) existentes[idx] = borrador; else existentes.unshift(borrador);
    localStorage.setItem("borradores", JSON.stringify(existentes));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  function renderEditor() {
    switch (canal) {
      case "sms":      return <EditorSMS cuerpo={cuerpo} onCuerpo={setCuerpo} />;
      case "push":     return <EditorPush asunto={asunto} onAsunto={setAsunto} cuerpo={cuerpo} onCuerpo={setCuerpo} />;
      case "facebook": return <EditorFacebook cuerpo={cuerpo} onCuerpo={setCuerpo} imageUrl={facebookImage} onImageUrl={setFacebookImage} />;
      default:         return <EditorEmail asunto={asunto} onAsunto={setAsunto} cuerpo={cuerpo} onCuerpo={setCuerpo} />;
    }
  }

  function renderContenidoTab() {
    switch (tabActiva) {
      case "etiquetas": return (
        <TagsPanel
          canal={canal}
          onGenerar={(a, c) => {
            if (a != null) setAsunto(a);
            if (c) setCuerpo(c);
          }}
        />
      );
      case "chat":      return <ChatPanel onAplicar={aplicarDesdeChat} />;
      case "manual":
        return (
          <div className="space-y-3 text-sm text-gray-500">
            <p>Escribe directamente en el panel de la derecha.</p>
            <p className="text-xs text-gray-400">El asunto y el cuerpo son editables en todo momento sin necesidad de usar la IA.</p>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4 bg-white">
        <Link href="/" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-sm text-gray-500">
          {esNuevo ? "Nuevo mensaje" : "Editar mensaje"}
        </span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-72 lg:w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-200 px-2 pt-2 shrink-0">
            {TABS_PANEL.map(tab => (
              <button
                key={tab}
                onClick={() => setTabActiva(tab)}
                className={`px-3 py-2 text-xs capitalize ${tabActiva === tab ? "bg-gray-100 font-medium rounded-t-md" : "text-gray-500"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={tabActiva === "chat" ? "flex-1 min-h-0 flex flex-col" : "flex-1 overflow-auto p-4"}>
            {renderContenidoTab()}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Evento: <span className="text-brand">Comedy Night Live (EVT-999)</span>
              </h2>
              <CanalBadge canal={canal} />
            </div>

            <div className="flex gap-2 flex-wrap">
              {Object.entries(CANAL_CONFIG).map(([key, cfg]) => {
                const activo = canal === key;
                const { Icon } = cfg;
                return (
                  <button
                    key={key}
                    onClick={() => setCanal(key)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      activo ? `${cfg.color} font-medium` : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={11} /> {cfg.label}
                  </button>
                );
              })}
            </div>

            {cargandoDraft ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-8">
                <Loader2 size={16} className="animate-spin" />
                Cargando borrador...
              </div>
            ) : errorDraft ? (
              <p className="text-sm text-red-500 py-4">{errorDraft}</p>
            ) : (
              <>
                {renderEditor()}

                <div className="space-y-2 pt-2">
                  {aprobado ? (
                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                      ✓ ¡Campaña aprobada y programada!
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={manejarAprobacion}
                        disabled={enviando}
                        className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                      >
                        {enviando ? "Enviando..." : "Aprobar y Programar"}
                      </button>
                      <button
                        onClick={guardarBorrador}
                        className="px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {guardado ? "Guardado ✓" : "Guardar borrador"}
                      </button>
                    </div>
                  )}
                  {errorAprobacion && (
                    <p className="text-xs text-amber-600">{errorAprobacion}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
