"use client";

import Link from "next/link";
import { supabase } from "../_lib/supabase/client";   // <-- NUOVO
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Apple,
  User,
  LogOut,
  Activity,
  Settings,
  ClipboardList,
} from "lucide-react";

const items = [
  { href: "/today", label: "Home", icon: Home },
  { href: "/scheda", label: "Scheda", icon: ClipboardList },
  { href: "/stats", label: "Statistiche", icon: BarChart3 },
  { href: "/nutrition", label: "Nutrizione", icon: Apple },
  { href: "/profilo", label: "Profilo", icon: User },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {                   // <-- NUOVO
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-emerald-900/10 bg-white md:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Activity className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-emerald-950">
          FitApp
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-emerald-800/60 hover:bg-emerald-50/60 hover:text-emerald-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-emerald-900/5 p-3">
          <button
            type="button"
            onClick={handleLogout}                        // <-- NUOVO
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
          <LogOut className="h-4 w-4" />
          Esci
        </button>
      </div>
    </aside>
  );
}
