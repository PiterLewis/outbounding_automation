"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:4000";

export default function ChatPanel({ onAplicar }) {
  const [mensajes, setMensajes] = useState([
    {
      rol: "asistente",
      texto: "Hola! Soy tu asistente de marketing. Dime que quieres hacer con tu evento y me encargo de analizarlo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef(null);

  // cada vez que cambian los mensajes, bajamos el scroll
  useEffect(function () {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);


  // consulta el estado del job cada 2 segundos hasta que termine
  async function esperarResultado(jobId) {
    let intentos = 0;
    let maxIntentos = 30; // como mucho 60 segundos

    while (intentos < maxIntentos) {
      // esperamos 2 segundos entre cada consulta
      await new Promise(function (resolve) {
        setTimeout(resolve, 2000);
      });

      let respuesta = await fetch(BACKEND_URL + "/api/chat/status/" + jobId);
      let datos = await respuesta.json();

      if (datos.state === "completed") {
        return datos.result;
      }

      if (datos.state === "failed") {
        throw new Error("El proceso fallo en el servidor");
      }

      // si no ha terminado, seguimos esperando
      intentos = intentos + 1;
    }

    throw new Error("Timeout: el proceso tardo demasiado");
  }


  // trae el borrador de mongo
  async function traerBorrador(draftId) {
    let respuesta = await fetch(BACKEND_URL + "/api/drafts/" + draftId);
    let borrador = await respuesta.json();
    return borrador;
  }


  // manda el mensaje al backend y espera la respuesta
  async function enviar() {
    let texto = input.trim();

    if (!texto) {
      return;
    }
    if (cargando) {
      return;
    }

    // ponemos el mensaje del usuario en el chat
    setMensajes(function (prev) {
      return [...prev, { rol: "usuario", texto: texto }];
    });
    setInput("");
    setCargando(true);

    try {
      // mandamos el prompt al backend
      let respuesta = await fetch(BACKEND_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: texto, eventId: "EVT-999" }),
      });
      let datos = await respuesta.json();
      let jobId = datos.jobId;

      // esperamos a que el worker de bullmq termine
      let resultado = await esperarResultado(jobId);

      // si genero un borrador, lo traemos de la base de datos
      let borrador = null;
      if (resultado && resultado.draftId) {
        borrador = await traerBorrador(resultado.draftId);
      }

      // armamos el texto de respuesta segun lo que devolvio
      let textoRespuesta = "";
      if (borrador) {
        textoRespuesta = "Cadena: " + resultado.chain;
        textoRespuesta += "\n\nAsunto: " + borrador.subject;
        textoRespuesta += "\n\n" + borrador.body;
      } else {
        textoRespuesta = "Cadena ejecutada: " + (resultado.chain || "completado");
      }

      // lo agregamos al chat
      setMensajes(function (prev) {
        return [...prev, { rol: "asistente", texto: textoRespuesta, borrador: borrador }];
      });

    } catch (error) {
      // si algo falla mostramos el error
      setMensajes(function (prev) {
        return [...prev, { rol: "asistente", texto: "Error: " + error.message, esError: true }];
      });

    } finally {
      setCargando(false);
    }
  }


  return (
    <div className="flex flex-col min-h-[300px]">

      {/* lista de mensajes */}
      <div className="flex-1 space-y-3 overflow-auto mb-4">
        {mensajes.map(function (msg, i) {

          // decidimos las clases segun quien manda el mensaje
          let claseMensaje = "bg-gray-100 text-gray-800";

          if (msg.rol === "usuario") {
            claseMensaje = "bg-brand text-white ml-4";
          }

          if (msg.esError) {
            claseMensaje = "bg-red-50 text-red-700";
          }

          return (
            <div key={i} className={"text-sm p-3 rounded-lg whitespace-pre-wrap " + claseMensaje}>
              {msg.texto}

              {/* si hay borrador, boton para pasarlo al editor */}
              {msg.borrador && (
                <button
                  onClick={function () {
                    onAplicar(msg.borrador.subject, msg.borrador.body);
                  }}
                  className="block mt-2 text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Aplicar al editor
                </button>
              )}
            </div>
          );
        })}

        {/* indicador de carga */}
        {cargando && (
          <div className="flex items-center gap-2 text-sm text-gray-400 p-3">
            <Loader2 size={14} className="animate-spin" />
            La IA esta analizando...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input para escribir */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          onKeyDown={function (e) {
            if (e.key === "Enter") {
              enviar();
            }
          }}
          placeholder="Escribe tu peticion..."
          disabled={cargando}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand disabled:opacity-50"
        />
        <button
          onClick={enviar}
          disabled={cargando}
          className="w-9 h-9 flex items-center justify-center bg-brand text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
