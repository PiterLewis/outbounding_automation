"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import ChatPanel from "../../components/ChatPanel";
import TagsPanel from "../../components/TagsPanel";

export default function MessageEditor() {
  let params = useParams();
  let esNuevo = (params.id === "new");

  // valores iniciales segun si es mensaje nuevo o existente
  let asuntoInicial = "";
  let cuerpoInicial = "";

  if (!esNuevo) {
    asuntoInicial = "No te lo pierdas! Comedy Night es manana";
    cuerpoInicial = "Hola [Nombre], consigue tus entradas antes de que se agoten! Nos preparamos para una noche increible de comedia.\n\nNo dejes pasar esta oportunidad unica.";
  }

  const [tabActiva, setTabActiva] = useState("etiquetas");
  const [asunto, setAsunto] = useState(asuntoInicial);
  const [cuerpo, setCuerpo] = useState(cuerpoInicial);

  let tabsPanel = ["etiquetas", "chat", "manual"];

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
      return <TagsPanel onGenerar={function (texto) { setCuerpo(texto); }} />;
    }

    if (tabActiva === "chat") {
      return <ChatPanel onAplicar={aplicarDesdeChat} />;
    }

    if (tabActiva === "manual") {
      return (
        <p className="text-sm text-gray-400">
          Usa el editor de la derecha para escribir directamente.
        </p>
      );
    }

    return null;
  }

  return (
    <div className="flex flex-col h-full">

      {/* barra superior */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4 bg-white">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-sm text-gray-500">
          {esNuevo ? "Nuevo mensaje" : "Editar mensaje"}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Sparkles size={14} />
            Generar Mensaje
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-md text-sm hover:bg-orange-600 transition-colors">
            <Send size={14} />
            Envio
          </button>
        </div>
      </div>

      {/* contenido: panel izquierdo + editor derecho */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* panel izquierdo con tabs */}
        <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-white overflow-auto">
          {/* tabs */}
          <div className="flex border-b border-gray-200 px-2 pt-2">
            {tabsPanel.map(function (tab) {
              let claseTab = "text-gray-500 hover:text-gray-700";
              if (tabActiva === tab) {
                claseTab = "bg-gray-100 text-gray-900 font-medium rounded-t-md";
              }

              return (
                <button
                  key={tab}
                  onClick={function () { setTabActiva(tab); }}
                  className={"px-3 py-2 text-xs capitalize transition-colors " + claseTab}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* contenido de la tab seleccionada */}
          <div className="p-4">
            {renderContenidoTab()}
          </div>
        </div>

        {/* panel derecho - editor del mensaje */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Nombre del Evento: <span className="text-brand">Comedy Night Live</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Asunto</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={function (e) { setAsunto(e.target.value); }}
                  placeholder="Escribe el asunto del mensaje..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Cuerpo del mensaje</label>
                <textarea
                  value={cuerpo}
                  onChange={function (e) { setCuerpo(e.target.value); }}
                  placeholder="Escribe el contenido del mensaje..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors">
                Aprobar y Programar
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Guardar como borrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
