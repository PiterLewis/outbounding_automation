"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, FileText, Megaphone,
  BarChart3, Building2, Settings, LayoutGrid, HelpCircle,
} from "lucide-react";

// navegacion principal del sidebar
const navItems = [
  { icon: Home, path: "/home", label: "Inicio" },
  { icon: CalendarDays, path: "/calendar", label: "Calendario" },
  { icon: FileText, path: "/orders", label: "Pedidos" },
  { icon: Megaphone, path: "/", label: "Marketing" },
  { icon: BarChart3, path: "/performance", label: "Estadisticas" },
  { icon: Building2, path: "/organization", label: "Organizacion" },
  { icon: Settings, path: "/settings", label: "Ajustes" },
];

// iconos de abajo del todo
const bottomItems = [
  { icon: LayoutGrid, path: "/apps", label: "Apps" },
  { icon: HelpCircle, path: "/help", label: "Ayuda" },
];

export default function Sidebar() {
  let pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[60px] border-r border-gray-200 bg-white flex-col items-center justify-between py-5">

      {/* logo */}
      <div className="flex flex-col items-center gap-5">
        <Link href="/" className="mb-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-xs font-bold">
            eb
          </div>
        </Link>

        {/* iconos de navegacion */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map(function (item) {
            let activo = (pathname === item.path);

            // segun si esta activo o no, le damos un estilo distinto
            let claseIcono = "text-gray-400 hover:bg-gray-100 hover:text-gray-700";
            if (activo) {
              claseIcono = "bg-sidebar-active text-white";
            }

            let IconoComponente = item.icon;

            return (
              <Link
                key={item.label}
                href={item.path}
                title={item.label}
                className={"flex items-center justify-center w-11 h-11 rounded-xl transition-colors " + claseIcono}
              >
                <IconoComponente size={20} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* iconos de abajo */}
      <nav className="flex flex-col items-center gap-2">
        {bottomItems.map(function (item) {
          let IconoComponente = item.icon;
          return (
            <Link
              key={item.label}
              href={item.path}
              title={item.label}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <IconoComponente size={20} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
