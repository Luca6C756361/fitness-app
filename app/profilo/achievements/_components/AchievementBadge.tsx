"use client";

import {
  Lock,
  Trophy,
  Flame,
  Dumbbell,
  Medal,
  Target,
  Zap,
  Apple,
  Clock,
  Compass,
  type LucideIcon,
} from "lucide-react";
import type { AchievementIcon, AchievementStatus } from "../../../today/_lib/achievements";
import { useUser } from "../../../today/_lib/UserContext";
import ShareButton from "../../../_components/ShareButton";

/**
 * Un badge singolo. Riceve lo status per prop: nessun import di Supabase
 * né di useAchievements qui dentro. useUser() è l'unica eccezione (serve
 * solo il nome già in memoria per la card condivisibile, nessuna query
 * nuova).
 */

interface AchievementBadgeProps {
  status: AchievementStatus;
}

const ICONS: Record<AchievementIcon, LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  dumbbell: Dumbbell,
  medal: Medal,
  target: Target,
  zap: Zap,
  apple: Apple,
  clock: Clock,
  compass: Compass,
};

export default function AchievementBadge({ status }: AchievementBadgeProps) {
  const { def, value, unlocked, progress } = status;
  const { profile } = useUser();
  const Icon = ICONS[def.icon];

  const ariaLabel = unlocked
    ? `${def.title}, sbloccato`
    : `${def.title}, bloccato, progresso ${value} su ${def.target} ${def.unit}`;

  return (
    <div
      role="listitem"
      aria-label={ariaLabel}
      className="rounded-2xl border border-emerald-900/5 bg-white p-4 text-center shadow-sm transition"
    >
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          unlocked ? "bg-amber-100" : "bg-[#FAF7F0]"
        }`}
      >
        {unlocked ? (
          <Icon className="h-6 w-6 text-amber-600" />
        ) : (
          <Lock className="h-5 w-5 text-emerald-800/30" />
        )}
      </div>

      <p
        className={`mt-2 text-sm font-bold ${
          unlocked ? "text-emerald-950" : "text-emerald-800/40"
        }`}
      >
        {def.title}
      </p>
      <p className="mt-0.5 text-[11px] text-emerald-800/60">{def.description}</p>

      {!unlocked && progress > 0 && (
        <div className="mt-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-emerald-900/5">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-medium tabular-nums text-emerald-800/50">
            {value} / {def.target} {def.unit}
          </p>
        </div>
      )}

      {unlocked && (
        <div className="mt-3">
          <ShareButton
            variant="compact"
            label="Condividi"
            data={{
              title: def.title,
              subtitle: "Traguardo sbloccato",
              stats: [{ label: def.unit, value: String(value) }],
              userName: profile.name,
            }}
          />
        </div>
      )}
    </div>
  );
}
