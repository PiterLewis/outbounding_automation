"use client";

import { Bell, Plus, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4">
      {/* Hamburguesa en movil */}
      <button className="md:hidden" onClick={() => setMenuAbierto(!menuAbierto)}>
        {menuAbierto ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo solo en movil */}
      <span className="font-bold text-lg md:hidden">eventbrite</span>

      {/* Espacio para empujar todo a la derecha */}
      <div className="flex-1" />

      {/* Acciones de la derecha */}
      <div className="flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand text-brand text-sm font-medium hover:bg-brand-light transition-colors">
          <Plus size={16} />
          Crear
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-semibold">
            C
          </div>
          <span className="text-sm font-medium hidden sm:inline">Creador evento</span>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
