"use client";

import type { MuscleAnatomyId } from "../_lib/types";
import { muscleAnatomyLabels } from "../_lib/muscleAnatomy";

/**
 * Mappa anatomica vettoriale (omino front/back) per l'atlante esercizi.
 * Componente unico e statico: costo fisso indipendente dal numero di
 * esercizi, zero richieste di rete. L'evidenziazione è puramente
 * dichiarativa — nessun useRef/querySelector: il fill di ogni <path> è
 * derivato a ogni render dalle prop `primary`/`secondary`.
 *
 * Le forme sono una silhouette semplificata (blocchi poligonali, non un
 * tracciato anatomico fedele): l'obiettivo è comunicare "dove" a colpo
 * d'occhio, non un atlante medico. Ogni fascio è un <path id="{MuscleAnatomyId}">
 * per restare agganciabile 1:1 alla tassonomia di muscleAnatomy.ts.
 */

interface MuscleMapSvgProps {
  primary: MuscleAnatomyId[];
  secondary: MuscleAnatomyId[];
  className?: string;
}

interface MusclePathDef {
  id: MuscleAnatomyId;
  d: string;
}

/** Silhouette decorativa (testa, tronco, arti): solo contorno, nessun id. */
const BODY_OUTLINE = {
  front: [
    "M100,10 a18,18 0 1,0 0.01,0 Z", // testa
    "M92,30 L108,30 L108,44 L92,44 Z", // collo
    "M62,44 L138,44 L146,180 L54,180 Z", // torso
    "M54,180 L146,180 L140,212 L60,212 Z", // bacino
    "M30,44 L62,44 L62,196 L30,196 Z", // braccio sx (contorno)
    "M138,44 L170,44 L170,196 L138,196 Z", // braccio dx (contorno)
    "M60,210 L140,210 L134,340 L66,340 Z", // gambe (contorno unico)
  ],
  back: [
    "M100,10 a18,18 0 1,0 0.01,0 Z",
    "M92,30 L108,30 L108,44 L92,44 Z",
    "M62,44 L138,44 L146,180 L54,180 Z",
    "M54,180 L146,180 L140,212 L60,212 Z",
    "M30,44 L62,44 L62,196 L30,196 Z",
    "M138,44 L170,44 L170,196 L138,196 Z",
    "M60,210 L140,210 L134,340 L66,340 Z",
  ],
};

/** Fasci muscolari — vista FRONTALE. Ogni `d` include, quando bilaterale, le due metà (sinistra + destra) come sotto-percorsi dello stesso path. */
const FRONT_MUSCLES: MusclePathDef[] = [
  { id: "pettorale-superiore", d: "M66,58 L134,58 L131,84 L69,84 Z" },
  { id: "pettorale-medio", d: "M69,84 L131,84 L128,108 L72,108 Z" },
  { id: "pettorale-inferiore", d: "M72,108 L128,108 L125,128 L75,128 Z" },

  { id: "deltoide-anteriore", d: "M32,46 L62,46 L62,68 L34,72 Z M168,46 L138,46 L138,68 L166,72 Z" },
  { id: "deltoide-laterale", d: "M30,48 L36,46 L38,74 L30,76 Z M170,48 L164,46 L162,74 L170,76 Z" },

  { id: "bicipite-brachiale", d: "M36,80 L58,76 L56,128 L40,130 Z M164,80 L142,76 L144,128 L160,130 Z" },
  { id: "brachiale", d: "M40,118 L48,118 L46,136 L38,136 Z M160,118 L152,118 L154,136 L162,136 Z" },
  { id: "avambraccio", d: "M36,136 L58,136 L52,192 L42,192 Z M164,136 L142,136 L148,192 L158,192 Z" },

  { id: "quadricipite-retto-femorale", d: "M80,214 L94,214 L92,330 L82,330 Z M120,214 L106,214 L108,330 L118,330 Z" },
  { id: "quadricipite-vasti", d: "M66,216 L80,214 L82,330 L70,330 Z M134,216 L120,214 L118,330 L130,330 Z" },

  { id: "retto-addominale", d: "M86,128 L114,128 L112,182 L88,182 Z" },
  { id: "obliqui", d: "M69,130 L86,128 L88,180 L74,178 Z M131,130 L114,128 L112,180 L126,178 Z" },
  { id: "core-profondo", d: "M94,132 L106,132 L105,180 L95,180 Z" },
];

/** Fasci muscolari — vista POSTERIORE. */
const BACK_MUSCLES: MusclePathDef[] = [
  { id: "trapezio-medio", d: "M86,46 L100,44 L98,96 L88,94 Z M114,46 L100,44 L102,96 L112,94 Z" },
  { id: "trapezio-inferiore", d: "M92,96 L100,96 L98,140 L92,138 Z M108,96 L100,96 L102,140 L108,138 Z" },
  { id: "romboidi", d: "M88,70 L100,68 L98,96 L90,94 Z M112,70 L100,68 L102,96 L110,94 Z" },
  { id: "gran-dorsale", d: "M62,84 L88,80 L82,168 L66,166 Z M138,84 L112,80 L118,168 L134,166 Z" },
  { id: "lombari", d: "M86,150 L114,150 L110,182 L90,182 Z" },

  { id: "deltoide-posteriore", d: "M32,46 L62,46 L62,68 L34,72 Z M168,46 L138,46 L138,68 L166,72 Z" },

  { id: "tricipite-capo-laterale", d: "M36,80 L44,78 L42,130 L38,130 Z M164,80 L156,78 L158,130 L162,130 Z" },
  { id: "tricipite-capo-lungo", d: "M44,78 L52,78 L50,130 L44,130 Z M156,78 L148,78 L150,130 L156,130 Z" },
  { id: "tricipite-capo-mediale", d: "M52,78 L58,80 L56,130 L50,130 Z M148,78 L142,80 L144,130 L150,130 Z" },

  { id: "gluteo-medio", d: "M62,182 L78,180 L76,198 L64,198 Z M138,182 L122,180 L124,198 L136,198 Z" },
  { id: "gluteo-massimo", d: "M64,198 L98,196 L96,222 L68,222 Z M136,198 L102,196 L104,222 L132,222 Z" },

  { id: "femorale-bicipite", d: "M66,222 L80,220 L82,330 L70,330 Z M134,222 L120,220 L118,330 L130,330 Z" },
  { id: "femorale-semitendinoso", d: "M80,220 L94,220 L92,330 L82,330 Z M120,220 L106,220 L108,330 L118,330 Z" },

  { id: "gastrocnemio", d: "M70,300 L94,300 L90,338 L74,338 Z M130,300 L106,300 L110,338 L126,338 Z" },
  { id: "soleo", d: "M74,338 L90,338 L86,376 L78,376 Z M126,338 L110,338 L114,376 L122,376 Z" },
];

function fillFor(
  id: MuscleAnatomyId,
  primary: MuscleAnatomyId[],
  secondary: MuscleAnatomyId[]
): string {
  if (primary.includes(id)) return "var(--anatomy-primary)";
  if (secondary.includes(id)) return "var(--anatomy-secondary)";
  return "var(--fg-muted-fill)";
}

function FigureView({
  muscles,
  primary,
  secondary,
}: {
  muscles: MusclePathDef[];
  primary: MuscleAnatomyId[];
  secondary: MuscleAnatomyId[];
}) {
  return (
    <svg viewBox="0 0 200 390" className="h-56 w-auto sm:h-64">
      {/* Silhouette decorativa: solo contorno, non evidenziabile. */}
      <g fill="none" stroke="var(--border-strong)" strokeWidth={1.5} strokeLinejoin="round">
        {BODY_OUTLINE.front.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {/* Fasci muscolari: fill dinamico, dichiarativo, derivato dalle prop. */}
      <g>
        {muscles.map((m) => (
          <path
            key={m.id}
            id={m.id}
            d={m.d}
            style={{ fill: fillFor(m.id, primary, secondary), transition: "fill 0.15s ease" }}
          />
        ))}
      </g>
    </svg>
  );
}

export default function MuscleMapSvg({
  primary,
  secondary,
  className = "",
}: MuscleMapSvgProps) {
  const describedLabels = [...primary, ...secondary]
    .map((id) => muscleAnatomyLabels[id])
    .filter(Boolean);
  const description =
    describedLabels.length > 0
      ? `Mappa anatomica: evidenzia ${describedLabels.join(", ")}.`
      : "Mappa anatomica del corpo, nessun fascio muscolare specifico evidenziato.";

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Descrizione accessibile a livello di contenitore: l'SVG sotto è
          aria-hidden, l'informazione equivalente esiste già come testo nel
          resto del modal (pill gruppo muscolare + istruzioni). */}
      <span className="sr-only">{description}</span>
      <div aria-hidden="true" className="flex items-center justify-center gap-3">
        <FigureView muscles={FRONT_MUSCLES} primary={primary} secondary={secondary} />
        <FigureView muscles={BACK_MUSCLES} primary={primary} secondary={secondary} />
      </div>
    </div>
  );
}
