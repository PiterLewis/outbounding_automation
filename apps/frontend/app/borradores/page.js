"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Trash2, Users, Clock, CheckCircle, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const CHAIN_LABELS = {
  low_sales_discount: "Descuento ventas",
  age_facebook_campaign: "Campaña Facebook",
  checkin_welcome: "Bienvenida check-in",
  post_event_survey: "Encuesta post-evento",
  vip_upsell: "Upsell VIP",
  last_minute_push: "Último aviso",
};

const STATUS_CONFIG = {
  pending:  { cls: "bg-yellow-100 text-yellow-800 border-yellow-200", Icon: Clock,        label: "Pendiente aprobación" },
  sent:     { cls: "bg-green-100 text-green-800 border-green-200",    Icon: CheckCircle,  label: "Enviado" },
  approved: { cls: "bg-green-100 text-green-800 border-green-200",    Icon: CheckCircle,  label: "Aprobado" },
  rejected: { cls: "bg-gray-100 text-gray-600 border-gray-200",       Icon: X,            label: "Rechazado" },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status];
  if (!c) return null;
  const { Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.cls}`}>
      <Icon size={10} />
      {c.label}
    </span>
  );
}

export default function Borradores() {
  const [borradores, setBorradores] = useState(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("borradores") || "[]") : []
  );
  const [aprobandoId, setAprobandoId] = useState(null);
  const [errorAprobacionId, setErrorAprobacionId] = useState(null);

  useEffect(() => {
    async function refreshRemote() {
      const guardados = JSON.parse(localStorage.getItem("borradores") || "[]");
      const updated = await Promise.all(guardados.map(async b => {
        if (!b.id || String(b.id).startsWith("local-")) return b;
        try {
          const res = await fetch(`${API_URL}/api/drafts/${b.id}`);
          if (!res.ok) return b;
          const data = await res.json();
          const draft = data.draft || data;
          return {
            ...b,
            asunto: draft.subject ?? b.asunto,
            cuerpo: draft.body ?? b.cuerpo,
            chainUsed: draft.chainUsed ?? b.chainUsed,
            status: draft.status ?? b.status,
            targetAudienceCount: draft.targetAudienceCount ?? b.targetAudienceCount,
          };
        } catch {
          return b;
        }
      }));

      if (JSON.stringify(updated) !== JSON.stringify(guardados)) {
        localStorage.setItem("borradores", JSON.stringify(updated));
        setBorradores(updated);
      }
    }
    refreshRemote();
  }, []);

  function persist(lista) {
    localStorage.setItem("borradores", JSON.stringify(lista));
    setBorradores(lista);
  }

  function eliminar(id) {
    persist(borradores.filter(b => b.id !== id));
  }

  async function aprobar(id) {
    setAprobandoId(id);
    setErrorAprobacionId(null);
    try {
      const res = await fetch(`${API_URL}/api/drafts/${id}/approve`, { method: "POST" });
      if (res.ok) {
        // Re-fetch desde el servidor para tener el estado real tras el envío
        let nuevoStatus = "approved";
        try {
          const draftRes = await fetch(`${API_URL}/api/drafts/${id}`);
          if (draftRes.ok) {
            const data = await draftRes.json();
            nuevoStatus = (data.draft || data).status ?? "approved";
          }
        } catch { /* usar "approved" por defecto */ }
        persist(borradores.map(b => b.id === id ? { ...b, status: nuevoStatus } : b));
      } else {
        setErrorAprobacionId(id);
        setTimeout(() => setErrorAprobacionId(null), 4000);
      }
    } catch {
      setErrorAprobacionId(id);
      setTimeout(() => setErrorAprobacionId(null), 4000);
    } finally {
      setAprobandoId(null);
    }
  }

  function rechazar(id) {
    persist(borradores.map(b => b.id === id ? { ...b, status: "rejected" } : b));
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Borradores guardados</h1>
      </div>

      {borradores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <FileText size={40} strokeWidth={1.5} />
          <p className="text-sm">No hay borradores guardados todavia.</p>
          <Link href="/message/new" className="text-sm text-brand hover:underline">
            Crear nuevo mensaje
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {borradores.map(b => {
            const chainLabel = b.chainUsed ? CHAIN_LABELS[b.chainUsed] || b.chainUsed : null;
            return (
              <li key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/message/${b.id}`} className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {chainLabel && (
                        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-brand border border-orange-100">
                          {chainLabel}
                        </span>
                      )}
                      <StatusBadge status={b.status} />
                      {typeof b.targetAudienceCount === "number" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                          <Users size={12} />
                          {b.targetAudienceCount} destinatarios
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {b.asunto || "Sin asunto"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{b.cuerpo}</p>
                    <p className="text-xs text-gray-300 mt-2">
                      {b.fecha ? new Date(b.fecha).toLocaleString("es-ES", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }) : "—"}
                    </p>
                  </Link>
                  <button
                    onClick={() => eliminar(b.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    aria-label="Eliminar borrador"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {b.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => aprobar(b.id)}
                      disabled={aprobandoId === b.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-brand text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      {aprobandoId === b.id ? "Aprobando..." : "Aprobar"}
                    </button>
                    {errorAprobacionId === b.id && (
                      <p className="w-full text-xs text-amber-600 mt-1">El envío automático estará disponible próximamente.</p>
                    )}
                    <button
                      onClick={() => rechazar(b.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
