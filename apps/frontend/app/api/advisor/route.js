import { NextResponse } from "next/server";

const CADENAS_DESC = `
1. low_sales_discount — Email masivo con código de descuento automático. Cuando las ventas están por debajo del 40% y quedan al menos 3 días. No sirve si el evento es mañana.
2. age_facebook_campaign — Post en Facebook/Instagram adaptado al perfil de edad de la audiencia. Para dar visibilidad extra. Mejor con 3+ días de margen.
3. checkin_welcome — Push personalizada al asistente justo al hacer check-in. Solo útil el día del evento. Requiere el email del asistente.
4. post_event_survey — Encuesta de satisfacción. Solo tiene sentido después de que el evento haya terminado.
5. vip_upsell — Oferta exclusiva para asistentes con historial de 3+ eventos. Genera un borrador para revisión humana antes de enviar.
6. last_minute_push — Push + SMS de urgencia. Solo cuando quedan menos de 48 horas Y quedan entradas disponibles.
`;

const SYSTEM_PROMPT = `Eres "Luma", una asistente de marketing de eventos experta y directa. Ayudas a organizadores a decidir qué acción de marketing tiene sentido dado su contexto real, no el genérico. Escribe siempre en texto plano, sin markdown, sin asteriscos, sin listas con guión — usa texto normal y saltos de línea.

Tienes acceso a estas automatizaciones:
${CADENAS_DESC}

Tu forma de trabajar:
- Escuchas la situación y preguntas lo que te falta (¿cuánto tiempo queda para el evento?, ¿cuántas entradas quedan?, ¿han mandado algo similar recientemente?, ¿qué tipo de público tienen?)
- Razonas comparando opciones — explica por qué una encaja mejor que otra en ESTE contexto concreto
- No repites siempre la misma sugerencia. Si el usuario ya mandó un descuento la semana pasada, propón otra cosa
- Si el usuario rechaza tu sugerencia, propón alternativas razonadas
- Eres directa y cercana. Sin tecnicismos. Si la situación lo permite, puedes ser un poco irónica o usar analogías

Cuando tengas contexto suficiente y una recomendación clara, añade AL FINAL de tu mensaje, en su propia línea, esta etiqueta (exactamente así, una sola vez, nada después):
[ACCION:id_cadena]

donde id_cadena es uno de: low_sales_discount, age_facebook_campaign, checkin_welcome, post_event_survey, vip_upsell, last_minute_push

CRÍTICO: nunca pongas [ACCION:...] en mitad del texto. Solo al final, una vez. No lo incluyas si te falta información o si el usuario rechaza tu sugerencia.

Responde siempre en español.`;

export async function POST(req) {
  const { messages } = await req.json();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Outbounding Automation",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenRouter error:", res.status, err);
    return NextResponse.json({ error: "Error del servidor de IA", detail: err }, { status: 500 });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const match = content.match(/\[ACCION:(\w+)\]/);
  const chainId = match?.[1] ?? null;
  const reply = content
    .replace(/\[ACCION:\w+\]/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\* /gm, "")
    .replace(/^- /gm, "")
    .trim();

  return NextResponse.json({ reply, chainId });
}
