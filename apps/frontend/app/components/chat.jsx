"use client";

import { useState, useRef, useEffect } from "react";
import "./chat.css";

const BACKEND_URL = "http://localhost:4000";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "system",
      text: "Conectado al backend. Escribe un mensaje para crear un job.",
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      text,
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { message: text } }),
      });

      const json = await res.json();

      const responseMsg = {
        id: Date.now() + 1,
        type: "backend",
        text: `Job creado correctamente`,
        jobId: json.jobId,
        time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "error",
          text: "Error al conectar con el backend. ¿Está corriendo en localhost:4000?",
          time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <h2>Outbounding Chat</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.type}`}>
            <div className={`bubble ${msg.type}`}>
              <p>{msg.text}</p>
              {msg.jobId && <p className="job-id">Job ID: {msg.jobId}</p>}
              <span className="time">{msg.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-row backend">
            <div className="bubble">
              <p>...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="chat-button" onClick={sendMessage} disabled={loading}>
          Enviar
        </button>
      </div>
    </div>
  );
}