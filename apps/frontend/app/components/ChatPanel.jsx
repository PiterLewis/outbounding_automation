"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatPanel({ onAplicar }) {
  const [mensajes, setMensajes] = useState([
    {
      rol: "asistente",
      texto: "Hola! Soy tu asistente de marketing. Dime que tipo de mensaje quieres crear y te ayudo a redactarlo.",
    },
  ]);
  const [input, setInput] = useState("");

  const enviar = () => {
    if (!input.trim()) return;

    // Respuesta simulada, luego esto se conecta al backend
    const respuesta = `He analizado tu peticion: "${input}". Aqui tienes una propuesta:\n\nUltima oportunidad para Comedy Night Live! Consigue tus entradas ahora y no te pierdas la mejor noche de comedia.`;

    setMensajes([
      ...mensajes,
      { rol: "usuario", texto: input },
      { rol: "asistente", texto: respuesta },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col min-h-[300px]">
      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-auto mb-4">
        {mensajes.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-3 rounded-lg ${
              msg.rol === "asistente"
                ? "bg-gray-100 text-gray-800"
                : "bg-brand text-white ml-4"
            }`}
          >
            {msg.texto}
            {/* Boton para aplicar al editor (solo en respuestas del asistente) */}
            {msg.rol === "asistente" && i > 0 && (
              <button
                onClick={() => onAplicar(msg.texto)}
                className="block mt-2 text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Aplicar al editor
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input del chat */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escribe tu peticion..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand"
        />
        <button
          onClick={enviar}
          className="w-9 h-9 flex items-center justify-center bg-brand text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
