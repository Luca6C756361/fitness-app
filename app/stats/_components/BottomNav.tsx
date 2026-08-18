"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Apple, User } from "lucide-react";

/**
 * Barra di navigazione fissa in basso, visibile solo su mobile.
 * Usa usePathname() per evidenziare la voce attiva.
 */

const items = [
  { href: "/today", label: "Home", icon: Home },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/profilo", label: "Profilo", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-900/10 bg-white/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition ${
                active ? "text-emerald-700" : "text-emerald-800/50 hover:text-emerald-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
              {active && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
