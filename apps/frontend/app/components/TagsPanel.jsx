"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronRight, Mail, MessageSquare, Bell, Share2, Loader2 } from "lucide-react";

const opcionesTono = [
  { valor: "urgente",      label: "Urgente",      desc: "Crea sentido de urgencia para actuar rapido" },
  { valor: "amigable",     label: "Amigable",      desc: "Tono casual y cercano para conectar" },
  { valor: "profesional",  label: "Profesional",   desc: "Formal y directo, ideal para B2B" },
  { valor: "divertido",    label: "Divertido",     desc: "Humor y energia para eventos sociales" },
];

const opcionesIdioma = [
  { valor: "es", label: "Español" },
  { valor: "en", label: "English" },
  { valor: "pt", label: "Português" },
];

const opcionesExtension = [
  { valor: "corto", label: "Corto" },
  { valor: "medio", label: "Medio" },
  { valor: "largo", label: "Largo" },
];

const CANAL_META = {
  email:    { label: "Email",             Icon: Mail,           color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",   hint: "Genera asunto + cuerpo del email" },
  sms:      { label: "SMS",               Icon: MessageSquare,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100",  hint: "Máximo 160 caracteres · Sin asunto" },
  push:     { label: "Push Notification", Icon: Bell,           color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", hint: "Título (50 ch) + mensaje (100 ch)" },
  facebook: { label: "Facebook / Instagram", Icon: Share2,      color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-100",    hint: "Incluye hashtags relevantes · Sin asunto" },
};

export default function TagsPanel({ canal = "email", onGenerar }) {
  const [tono, setTono] = useState("urgente");
  const [idioma, setIdioma] = useState("es");
  const [extension, setExtension] = useState("medio");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const [abiertas, setAbiertas] = useState(["tono", "extension"]);

  const meta = CANAL_META[canal] ?? CANAL_META.email;
  const mostrarExtension = canal !== "sms" && canal !== "push";

  function toggle(nombre) {
    setAbiertas(prev =>
      prev.includes(nombre) ? prev.filter(s => s !== nombre) : [...prev, nombre]
    );
  }

  async function generar() {
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal, tono, idioma, extension, eventoNombre: "Comedy Night Live" }),
      });

      if (!res.ok) throw new Error("Error del servidor");
      const { asunto, cuerpo } = await res.json();
      onGenerar(asunto, cuerpo);
    } catch {
      setError("No se pudo generar. Inténtalo de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${meta.bg} ${meta.border}`}>
        <meta.Icon size={14} className={meta.color} />
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>
          <p className="text-[11px] text-gray-400 leading-tight">{meta.hint}</p>
        </div>
      </div>

      <button
        onClick={generar}
        disabled={generando}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors mb-4"
      >
        {generando ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {generando ? "Generando..." : "Generar con IA"}
      </button>

      {error && <p className="text-xs text-red-500 mb-3 px-1">{error}</p>}

      <Seccion titulo="Tono" abierta={abiertas.includes("tono")} onToggle={() => toggle("tono")}>
        <div className="space-y-2">
          {opcionesTono.map(opt => {
            const activo = tono === opt.valor;
            return (
              <label
                key={opt.valor}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${activo ? "border-brand bg-brand-light" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input type="radio" name="tono" checked={activo} onChange={() => setTono(opt.valor)} className="mt-0.5 accent-brand" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </Seccion>

      <Seccion titulo="Idioma" abierta={abiertas.includes("idioma")} onToggle={() => toggle("idioma")}>
        <RadioSimple opciones={opcionesIdioma} nombre="idioma" valor={idioma} onChange={setIdioma} />
      </Seccion>

      {mostrarExtension && (
        <Seccion titulo="Extensión" abierta={abiertas.includes("extension")} onToggle={() => toggle("extension")}>
          <RadioSimple opciones={opcionesExtension} nombre="extension" valor={extension} onChange={setExtension} />
        </Seccion>
      )}
    </div>
  );
}

function Seccion({ titulo, abierta, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-3 text-sm font-medium text-gray-700 hover:text-brand transition-colors"
      >
        {abierta ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {titulo}
      </button>
      {abierta && <div className="pb-3">{children}</div>}
    </div>
  );
}

function RadioSimple({ opciones, nombre, valor, onChange }) {
  return (
    <div className="space-y-2">
      {opciones.map(opt => {
        const activo = valor === opt.valor;
        return (
          <label
            key={opt.valor}
            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${activo ? "border-brand bg-brand-light" : "border-gray-200 hover:border-gray-300"}`}
          >
            <input type="radio" name={nombre} checked={activo} onChange={() => onChange(opt.valor)} className="accent-brand" />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
