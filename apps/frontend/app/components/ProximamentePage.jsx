import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function ProximamentePage({ titulo }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 gap-4 text-gray-400">
      <Construction size={40} strokeWidth={1.5} />
      <p className="text-lg font-semibold text-gray-600">{titulo}</p>
      <p className="text-sm">Esta sección no está disponible.</p>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-brand hover:underline mt-2">
        <ArrowLeft size={14} /> Volver al inicio
      </Link>
    </div>
  );
}
