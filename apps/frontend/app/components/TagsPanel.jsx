"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronRight } from "lucide-react";

const opciones = {
  tono: [
    { valor: "urgente", label: "Urgente", desc: "Crea sentido de urgencia para actuar rapido" },
    { valor: "amigable", label: "Amigable", desc: "Tono casual y cercano para conectar" },
    { valor: "profesional", label: "Profesional", desc: "Formal y directo, ideal para B2B" },
    { valor: "divertido", label: "Divertido", desc: "Humor y energia para eventos sociales" },
  ],
  idioma: [
    { valor: "es", label: "Espanol" },
    { valor: "en", label: "English" },
    { valor: "pt", label: "Portugues" },
  ],
  canal: [
    { valor: "email", label: "Email" },
    { valor: "sms", label: "SMS" },
    { valor: "push", label: "Push Notification" },
  ],
  extension: [
    { valor: "corto", label: "Corto" },
    { valor: "medio", label: "Medio" },
    { valor: "largo", label: "Largo" },
  ],
};

// Mensajes de ejemplo segun el tono seleccionado
const mensajesEjemplo = {
  urgente:
    "Ultima oportunidad! Las entradas para Comedy Night Live se agotan. No te quedes sin la tuya.\n\nQuedan pocas entradas disponibles. Asegura tu lugar ahora antes de que sea demasiado tarde.",
  amigable:
    "Hola! Te queriamos contar que Comedy Night Live ya esta a la vuelta de la esquina.\n\nVa a ser una noche increible llena de risas. Nos encantaria verte ahi!",
  profesional:
    "Estimado/a [Nombre],\n\nLe informamos que quedan plazas limitadas para Comedy Night Live. Le invitamos a asegurar su participacion.\n\nAtentamente, El equipo organizador.",
  divertido:
    "Preparado/a para reirte hasta que te duela la barriga?\n\nComedy Night Live promete carcajadas garantizadas. No seas el/la que se quede sin plan!",
};

export default function TagsPanel({ onGenerar }) {
  const [tono, setTono] = useState("urgente");
  const [idioma, setIdioma] = useState("es");
  const [canal, setCanal] = useState("email");
  const [extension, setExtension] = useState("medio");
  const [seccionesAbiertas, setSeccionesAbiertas] = useState(["tono"]);

  const toggleSeccion = (nombre) => {
    if (seccionesAbiertas.includes(nombre)) {
      setSeccionesAbiertas(seccionesAbiertas.filter((s) => s !== nombre));
    } else {
      setSeccionesAbiertas([...seccionesAbiertas, nombre]);
    }
  };

  const generar = () => {
    onGenerar(mensajesEjemplo[tono] || mensajesEjemplo.urgente);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={generar}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors mb-4"
      >
        <Sparkles size={16} />
        Generar
      </button>

      {/* Tono (con descripcion en cada opcion) */}
      <Seccion
        titulo="Tono"
        abierta={seccionesAbiertas.includes("tono")}
        onToggle={() => toggleSeccion("tono")}
      >
        <div className="space-y-2">
          {opciones.tono.map((opt) => (
            <label
              key={opt.valor}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                tono === opt.valor
                  ? "border-brand bg-brand-light"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="tono"
                checked={tono === opt.valor}
                onChange={() => setTono(opt.valor)}
                className="mt-0.5 accent-brand"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Seccion>

      {/* Idioma */}
      <Seccion
        titulo="Idioma"
        abierta={seccionesAbiertas.includes("idioma")}
        onToggle={() => toggleSeccion("idioma")}
      >
        <RadioSimple opciones={opciones.idioma} nombre="idioma" valor={idioma} onChange={setIdioma} />
      </Seccion>

      {/* Canal */}
      <Seccion
        titulo="Canal"
        abierta={seccionesAbiertas.includes("canal")}
        onToggle={() => toggleSeccion("canal")}
      >
        <RadioSimple opciones={opciones.canal} nombre="canal" valor={canal} onChange={setCanal} />
      </Seccion>

      {/* Extension */}
      <Seccion
        titulo="Extension"
        abierta={seccionesAbiertas.includes("extension")}
        onToggle={() => toggleSeccion("extension")}
      >
        <RadioSimple opciones={opciones.extension} nombre="extension" valor={extension} onChange={setExtension} />
      </Seccion>
    </div>
  );
}

// Secciones colapsables del panel
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

// Radios simples para idioma, canal, extension
function RadioSimple({ opciones, nombre, valor, onChange }) {
  return (
    <div className="space-y-2">
      {opciones.map((opt) => (
        <label
          key={opt.valor}
          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
            valor === opt.valor
              ? "border-brand bg-brand-light"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name={nombre}
            checked={valor === opt.valor}
            onChange={() => onChange(opt.valor)}
            className="accent-brand"
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
