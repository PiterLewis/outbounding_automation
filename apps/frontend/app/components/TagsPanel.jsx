"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronRight } from "lucide-react";

const opcionesTono = [
  { valor: "urgente", label: "Urgente", desc: "Crea sentido de urgencia para actuar rapido" },
  { valor: "amigable", label: "Amigable", desc: "Tono casual y cercano para conectar" },
  { valor: "profesional", label: "Profesional", desc: "Formal y directo, ideal para B2B" },
  { valor: "divertido", label: "Divertido", desc: "Humor y energia para eventos sociales" },
];

const opcionesIdioma = [
  { valor: "es", label: "Espanol" },
  { valor: "en", label: "English" },
  { valor: "pt", label: "Portugues" },
];

const opcionesCanal = [
  { valor: "email", label: "Email" },
  { valor: "sms", label: "SMS" },
  { valor: "push", label: "Push Notification" },
];

const opcionesExtension = [
  { valor: "corto", label: "Corto" },
  { valor: "medio", label: "Medio" },
  { valor: "largo", label: "Largo" },
];

// mensajes de ejemplo segun el tono
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

  function toggleSeccion(nombre) {
    let estaAbierta = seccionesAbiertas.includes(nombre);

    if (estaAbierta) {
      // la quitamos de la lista
      let nuevaLista = seccionesAbiertas.filter(function (s) {
        return s !== nombre;
      });
      setSeccionesAbiertas(nuevaLista);
    } else {
      // la anadimos
      setSeccionesAbiertas([...seccionesAbiertas, nombre]);
    }
  }

  function generar() {
    let mensaje = mensajesEjemplo[tono];
    if (!mensaje) {
      mensaje = mensajesEjemplo.urgente;
    }
    onGenerar(mensaje);
  }

  return (
    <div className="space-y-1">
      <button
        onClick={generar}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors mb-4"
      >
        <Sparkles size={16} />
        Generar
      </button>

      {/* tono (con descripcion en cada opcion) */}
      <Seccion
        titulo="Tono"
        abierta={seccionesAbiertas.includes("tono")}
        onToggle={function () { toggleSeccion("tono"); }}
      >
        <div className="space-y-2">
          {opcionesTono.map(function (opt) {
            let claseLabel = "border-gray-200 hover:border-gray-300";
            if (tono === opt.valor) {
              claseLabel = "border-brand bg-brand-light";
            }

            return (
              <label key={opt.valor} className={"flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors " + claseLabel}>
                <input
                  type="radio"
                  name="tono"
                  checked={tono === opt.valor}
                  onChange={function () { setTono(opt.valor); }}
                  className="mt-0.5 accent-brand"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </Seccion>

      {/* idioma */}
      <Seccion
        titulo="Idioma"
        abierta={seccionesAbiertas.includes("idioma")}
        onToggle={function () { toggleSeccion("idioma"); }}
      >
        <RadioSimple opciones={opcionesIdioma} nombre="idioma" valor={idioma} onChange={setIdioma} />
      </Seccion>

      {/* canal */}
      <Seccion
        titulo="Canal"
        abierta={seccionesAbiertas.includes("canal")}
        onToggle={function () { toggleSeccion("canal"); }}
      >
        <RadioSimple opciones={opcionesCanal} nombre="canal" valor={canal} onChange={setCanal} />
      </Seccion>

      {/* extension */}
      <Seccion
        titulo="Extension"
        abierta={seccionesAbiertas.includes("extension")}
        onToggle={function () { toggleSeccion("extension"); }}
      >
        <RadioSimple opciones={opcionesExtension} nombre="extension" valor={extension} onChange={setExtension} />
      </Seccion>
    </div>
  );
}


// componente para las secciones que se abren y cierran
function Seccion({ titulo, abierta, onToggle, children }) {
  let icono;
  if (abierta) {
    icono = <ChevronDown size={16} />;
  } else {
    icono = <ChevronRight size={16} />;
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-3 text-sm font-medium text-gray-700 hover:text-brand transition-colors"
      >
        {icono}
        {titulo}
      </button>

      {abierta && (
        <div className="pb-3">{children}</div>
      )}
    </div>
  );
}


// radios simples para idioma, canal y extension
function RadioSimple({ opciones, nombre, valor, onChange }) {
  return (
    <div className="space-y-2">
      {opciones.map(function (opt) {
        let claseLabel = "border-gray-200 hover:border-gray-300";
        if (valor === opt.valor) {
          claseLabel = "border-brand bg-brand-light";
        }

        return (
          <label key={opt.valor} className={"flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors " + claseLabel}>
            <input
              type="radio"
              name={nombre}
              checked={valor === opt.valor}
              onChange={function () { onChange(opt.valor); }}
              className="accent-brand"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
