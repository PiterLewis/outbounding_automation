import { NextResponse } from "next/server";

const CANAL_INSTRUCCIONES = {
  email: `Genera un email de marketing para el evento. Responde con JSON: {"asunto": "...", "cuerpo": "..."}. El cuerpo puede tener varios párrafos separados por saltos de línea.`,
  sms: `Genera un SMS de marketing. El cuerpo NO puede superar 160 caracteres. Responde con JSON: {"asunto": null, "cuerpo": "..."}`,
  push: `Genera una push notification. El asunto (título) máximo 50 caracteres, el cuerpo (mensaje) máximo 100 caracteres, directo y sin rodeos. Responde con JSON: {"asunto": "...", "cuerpo": "..."}`,
  facebook: `Genera un post de Facebook/Instagram para promocionar el evento. Incluye 2-3 hashtags relevantes al final del texto. Responde con JSON: {"asunto": null, "cuerpo": "..."}`,
};

const TONO_DESC = {
  urgente: "urgente, transmite escasez y necesidad de actuar ya",
  amigable: "cercano y casual, como si fuera un amigo recomendando el plan",
  profesional: "formal y directo, tono B2B corporativo",
  divertido: "con humor y energía desenfadada, perfecto para eventos sociales",
};

const IDIOMA_DESC = {
  es: "español",
  en: "inglés",
  pt: "portugués",
};

const EXTENSION_DESC = {
  corto: "muy conciso, solo lo esencial",
  medio: "equilibrado, cubre los puntos clave sin alargarse",
  largo: "detallado, incluye contexto y CTA claro",
};

export async function POST(req) {
  const { canal, tono, idioma, extension, eventoNombre } = await req.json();

  const canalInstr = CANAL_INSTRUCCIONES[canal] ?? CANAL_INSTRUCCIONES.email;
  const tonoDesc = TONO_DESC[tono] ?? TONO_DESC.urgente;
  const idiomaDesc = IDIOMA_DESC[idioma] ?? "español";
  const extensionDesc = EXTENSION_DESC[extension] ?? "equilibrado";

  const prompt = `Eres un experto en copywriting para eventos en vivo.

Evento: "${eventoNombre || "Comedy Night Live"}"
Tono: ${tonoDesc}
Idioma: ${idiomaDesc}
Extensión: ${extensionDesc}

Tarea: ${canalInstr}

Reglas:
- Responde SOLO con el JSON pedido, sin texto extra, sin bloques de código, sin markdown.
- El JSON debe ser parseable directamente.`;

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
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Error generando contenido" }, { status: 500 });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Strip markdown code blocks if present
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    try {
      parsed = JSON.parse(match ? match[1] : content);
    } catch {
      parsed = { asunto: null, cuerpo: content };
    }
  }

  return NextResponse.json({
    asunto: parsed.asunto ?? null,
    cuerpo: parsed.cuerpo ?? "",
  });
}
