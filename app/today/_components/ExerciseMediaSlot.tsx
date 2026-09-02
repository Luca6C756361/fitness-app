"use client";

import { PlayCircle } from "lucide-react";
import type { ExerciseDefinition } from "../_lib/types";

/**
 * Slot per la demo di esecuzione di un esercizio. Puro presentazionale:
 * nessuno stato, nessun fetch, nessun context. Oggi `media` non è
 * valorizzato da nessun esercizio: il placeholder è il caso normale, non
 * deve sembrare rotto né cliccabile.
 */

interface ExerciseMediaSlotProps {
  media?: ExerciseDefinition["media"];
  name: string;
  className?: string;
}

export default function ExerciseMediaSlot({
  media,
  name,
  className = "",
}: ExerciseMediaSlotProps) {
  const base = `aspect-video w-full overflow-hidden rounded-xl border border-emerald-900/10 bg-[#FAF7F0] ${className}`;

  if (!media) {
    return (
      <div className={`${base} flex flex-col items-center justify-center gap-1`}>
        <PlayCircle className="h-8 w-8 text-emerald-800/25" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/30">
          Demo in arrivo
        </span>
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className={base}>
        {/* eslint-disable-next-line @next/next/no-img-element -- sorgente esterna arbitraria (Supabase Storage/OFF-like), non ottimizzabile con next/image senza remotePatterns noti a priori */}
        <img
          src={media.src}
          alt={`Esecuzione di ${name}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <div className={base}>
        <video
          src={media.src}
          poster={media.poster}
          muted
          loop
          playsInline
          preload="none"
          controls={false}
          autoPlay
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // kind === "lottie": la libreria si aggiunge quando esisteranno asset
  // reali. Il tipo è già nel contratto: il giorno che arriva non si tocca
  // né types.ts né i chiamanti, solo questo ramo.
  return (
    <div className={`${base} flex flex-col items-center justify-center gap-1`}>
      <PlayCircle className="h-8 w-8 text-emerald-800/25" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/30">
        Demo in arrivo
      </span>
    </div>
  );
}
