"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, MoreVertical } from "lucide-react";

const plantillas = [
  {
    id: 1,
    titulo: "Cambio de fecha del evento",
    descripcion: "Comunica el cambio recien realizado sobre la fecha de tu evento.",
    tags: ["Amigable", "Corto", "Espanol", "Correo electronico"],
    seleccionada: true,
  },
  {
    id: 2,
    titulo: "Descuentos flash",
    descripcion: "Crea un descuento flash para los ultimos dias de la venta",
    tags: ["Amigable", "Corto", "Espanol", "Correo electronico"],
    seleccionada: false,
  },
  {
    id: 3,
    titulo: "Recordatorio de evento",
    descripcion: "Manda un recordatorio sobre la fecha, hora y lugar del evento a todos tus asistentes.",
    tags: ["Amigable", "Corto", "Espanol", "Correo electronico"],
    seleccionada: false,
  },
];

const triggerLabels = [
  "Ventas estancadas (< 5 tix/24h)",
  "Milestone alcanzado (50% vendido)",
  "Cuenta regresiva (T-24h)",
];

const nombresTabs = [
  "Panel de control",
  "Generacion de mensajes con IA",
  "Redes sociales",
  "Promociones",
  "Ajustes",
];

export default function Dashboard() {
  const [tabActiva, setTabActiva] = useState(1);
  const [triggersActivos, setTriggersActivos] = useState([true, true, true]);

  function toggleTrigger(i) {
    setTriggersActivos(triggersActivos.map((v, idx) => idx === i ? !v : v));
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Herramientas de marketing
      </h1>

      <div className="border-b border-gray-200 flex gap-0 overflow-x-auto">
        {nombresTabs.map((nombre, i) => {
          const activa = tabActiva === i;
          return (
            <button
              key={nombre}
              onClick={() => setTabActiva(i)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activa ? "border-brand text-brand font-medium" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {nombre}
              {i === 1 && <Sparkles size={14} className="inline ml-1.5" />}
            </button>
          );
        })}
      </div>

      {tabActiva === 1 ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Conecta con tu audiencia mediante anuncios generados con inteligencia artificial.
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Genera plantillas rapidamente para tus mensajes y anuncios, automatiza su envio y crea un seguimiento de los resultados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/message/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors">
                Generar mensaje
                <Sparkles size={16} />
              </button>
            </Link>
            <Link href="/borradores" className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Borradores
            </Link>
          </div>

          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Plantillas recomendadas
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plantillas.map(p => (
                <div
                  key={p.id}
                  className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    p.seleccionada ? "border-brand ring-1 ring-brand bg-white" : "border-gray-200 bg-white"
                  }`}
                >
                  <h4 className="font-semibold text-sm text-gray-900">{p.titulo}</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{p.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-3 mb-2">Etiquetas asociadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map(tag => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          p.seleccionada ? "bg-brand-light text-brand border-brand/30" : "bg-transparent text-gray-500 border-gray-200"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="p-5 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:shadow-md transition-shadow min-h-[180px]">
                <Plus size={28} strokeWidth={1.5} />
                <span className="text-xs">Generar nuevas plantillas</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Triggers activos
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {triggerLabels.map((label, i) => {
                const activo = triggersActivos[i];
                return (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTrigger(i)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${activo ? "bg-brand" : "bg-gray-300"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${activo ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="px-5 py-3">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Anadir trigger
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          {nombresTabs[tabActiva]} -- proximamente.
        </p>
      )}
    </div>
  );
}
