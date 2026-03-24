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

  const [tabActiva, setTabActiva] = useState("etiquetas");
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  
  // NUEVO: Estado para guardar el ID del borrador que viene de la IA
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  let tabsPanel = ["etiquetas", "chat", "manual"];

  // MODIFICADO: Ahora recibimos también el draftId
  function aplicarDesdeChat(nuevoAsunto, nuevoCuerpo, draftId) {
    console.log("DEBUG: Datos recibidos del chat:", { nuevoAsunto, nuevoCuerpo, draftId });
    if (nuevoAsunto) setAsunto(nuevoAsunto);
    setCuerpo(nuevoCuerpo);
    setCurrentDraftId(draftId); // Guardamos el ID para poder aprobarlo luego
    console.log("Borrador vinculado ID:", draftId);
  }

  // NUEVA FUNCIÓN: Llamada al backend para enviar los correos reales
  async function manejarAprobacion() {
    if (!currentDraftId) {
      alert("Primero usa el Chat para generar una propuesta y pulsa 'Aplicar'.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/drafts/${currentDraftId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        alert("¡Campaña aprobada y correos enviados!");
      } else {
        alert("Error al aprobar");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  }

  function renderContenidoTab() {
    if (tabActiva === "etiquetas") {
      return <TagsPanel onGenerar={(texto) => setCuerpo(texto)} />;
    }
    if (tabActiva === "chat") {
      return <ChatPanel onAplicar={aplicarDesdeChat} />;
    }
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* barra superior */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4 bg-white">
        <Link href="/" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-sm text-gray-500">
          {esNuevo ? "Nuevo mensaje" : "Editar mensaje"}
        </span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* panel izquierdo */}
        <div className="w-full md:w-72 lg:w-80 border-r border-gray-200 bg-white overflow-auto">
          <div className="flex border-b border-gray-200 px-2 pt-2">
            {tabsPanel.map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActiva(tab)}
                className={`px-3 py-2 text-xs capitalize ${
                  tabActiva === tab ? "bg-gray-100 font-medium rounded-t-md" : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">{renderContenidoTab()}</div>
        </div>

        {/* panel derecho - editor */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">
              Evento: <span className="text-brand">Comedy Night Live (EVT-999)</span>
            </h2>

            <div className="space-y-3">
              <label className="text-sm font-medium">Asunto</label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              
              <label className="text-sm font-medium">Cuerpo del mensaje</label>
              <textarea
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {/* BOTÓN VINCULADO A LA ACCIÓN REAL */}
              <button 
                onClick={manejarAprobacion}
                disabled={enviando}
                className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Aprobar y Programar"}
              </button>
              
              <button className="px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700">
                Guardar borrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}