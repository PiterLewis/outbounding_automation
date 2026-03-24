"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:4000";

export default function ChatPanel({ onAplicar }) {
  const [mensajes, setMensajes] = useState([
    {
      rol: "asistente",
      texto: "¡Hola! Soy tu asistente. Pídeme ayuda con tus eventos (ej: 'tengo pocas ventas') y generaré una propuesta.",
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function esperarResultado(jobId) {
    let intentos = 0;
    while (intentos < 30) {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch(`${BACKEND_URL}/api/chat/status/${jobId}`);
      const datos = await res.json();

      if (datos.state === "completed") return datos.result;
      if (datos.state === "failed") throw new Error("Error en el Worker");
      intentos++;
    }
    throw new Error("Tiempo de espera agotado");
  }

  async function enviar() {
    if (!input.trim() || cargando) return;

    const textoUsuario = input.trim();
    setMensajes(prev => [...prev, { rol: "usuario", texto: textoUsuario }]);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textoUsuario, eventId: "EVT-999" }),
      });
      const { jobId } = await res.json();
      
      const resultado = await esperarResultado(jobId);

      if (resultado && resultado.subject) {
        setMensajes(prev => [...prev, { 
          rol: "asistente", 
          texto: `Propuesta generada:\n\nASUNTO: ${resultado.subject}\n\n${resultado.body}`,
          // Guardamos los datos para el botón
          borrador: {
            subject: resultado.subject,
            body: resultado.body,
            draftId: resultado.draftId // <-- AQUÍ ESTÁ LA LLAVE PARA EL BOTÓN NARANJA
          }
        }]);
      } else {
        setMensajes(prev => [...prev, { rol: "asistente", texto: "No se pudo generar contenido." }]);
      }
    } catch (e) {
      setMensajes(prev => [...prev, { rol: "asistente", texto: "Error: " + e.message, esError: true }]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px]">
        {mensajes.map((msg, i) => (
          <div key={i} className={`flex ${msg.rol === "usuario" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.rol === "usuario" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-800"
            } ${msg.esError ? "bg-red-100 text-red-600 border border-red-200" : ""}`}>
              {msg.texto}
              
              {msg.borrador && (
                <button
                  onClick={() => onAplicar(msg.borrador.subject, msg.borrador.body, msg.borrador.draftId)}
                  className="mt-3 w-full py-2 bg-white text-orange-600 font-bold rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
                >
                  Aplicar al editor
                </button>
              )}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex items-center gap-2 text-gray-400 text-xs italic">
            <Loader2 className="animate-spin" size={14} /> Redactando propuesta...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && enviar()}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Escribe aquí..."
          disabled={cargando}
        />
        <button onClick={enviar} disabled={cargando} className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}