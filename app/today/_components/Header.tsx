"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../_lib/supabase/client";
import Link from "next/link";
import {
  Scale,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatToday } from "../_lib/utils";
import { useUser } from "../_lib/UserContext";
import { useWeight } from "../_lib/WeightContext";

/** Header con dati letti dal WeightContext (fonte di verità sul peso). */
export default function Header() {
  const { profile } = useUser();
  const { currentWeight, previousWeight } = useWeight();
  const [menuOpen, setMenuOpen] = useState(false);
  const [today, setToday] = useState(""); 
  const menuRef = useRef<HTMLDivElement>(null);

  // Peso da mostrare: se ci sono misurazioni le usa, altrimenti fallback al profilo
  const weight = currentWeight ?? profile.weight;
  const delta =
    currentWeight !== null && previousWeight !== null
      ? currentWeight - previousWeight
      : null;

  useEffect(() => {
    setToday(formatToday());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    // Reload completo, non router.push: azzera lo stato di TUTTI i context
    window.location.href = "/login";
  };

  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kh-ink)]">
          TODAY
        </h1>
        <p className="mt-0.5 min-h-[1.25rem] text-sm font-medium text-[var(--kh-ink-muted)]">
          {today}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kh-ink-subtle)]" />
          <input
            type="search"
            placeholder="Cerca alimenti, esercizi…"
            className="w-56 rounded-full border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] py-2 pl-9 pr-4 text-sm text-[var(--kh-ink)] placeholder:text-[var(--kh-ink-subtle)] outline-none transition focus:w-64 focus:ring-2 focus:ring-[var(--kh-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] py-1.5 pl-2.5 pr-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--kh-surface-2)] text-[var(--kh-primary)]">
            <Scale className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <span className="block font-mono text-sm font-bold text-[var(--kh-ink)] tabular-nums">
              {weight.toFixed(1)} kg
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              Peso
            </span>
          </div>

          {delta !== null && delta !== 0 && (
            <span
              className={`ml-1 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                delta < 0
                  ? "bg-[var(--kh-primary)]/15 text-[var(--kh-primary)]"
                  : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {delta < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </span>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="group flex items-center gap-1 rounded-full transition hover:opacity-80"
            aria-label="Menu utente"
          >
            <img
              src={profile.avatar}
              alt={`Foto profilo di ${profile.name}`}
              className="h-11 w-11 rounded-full border-2 border-[var(--kh-primary)] object-cover"
            />
            <ChevronDown
              className={`h-4 w-4 text-[var(--kh-ink-subtle)] transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] shadow-lg">
              <div className="border-b border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--kh-ink-subtle)]">
                  Ciao
                </p>
                <p className="text-sm font-bold text-[var(--kh-ink)]">{profile.name}</p>
              </div>

              <nav className="py-1">
                <Link
                  href="/profilo"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--kh-ink)] transition hover:bg-[var(--kh-surface-2)]"
                >
                  <User className="h-4 w-4 text-[var(--kh-primary)]" />
                  Profilo
                </Link>
                <Link
                  href="/impostazioni"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--kh-ink)] transition hover:bg-[var(--kh-surface-2)]"
                >
                  <Settings className="h-4 w-4 text-[var(--kh-primary)]" />
                  Impostazioni
                </Link>
                <div className="my-1 border-t border-[var(--kh-hairline)]" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Esci
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}