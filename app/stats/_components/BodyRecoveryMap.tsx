"use client";

import type { MuscleGroup } from "../../today/_lib/types";

/**
 * Sagoma anatomica fronte/retro in stile "cyber-mesh" (Fitbod Muscle
 * Recovery): griglia tecnica sulla silhouette, fasci muscolari colorati
 * dinamicamente in base allo stato di recupero passato via prop.
 *
 * Stessa architettura di MuscleMapSvg.tsx (today/_components): componente
 * unico, dichiarativo, un solo SVG inline, nessun asset esterno — qui però
 * i 10 MuscleGroup "coarse" (non i 28 MuscleAnatomyId fini dell'atlante
 * esercizi) perché è la tassonomia con cui la UI di recupero comunica
 * (stessa di calculateMuscleRecovery). Le coordinate delle regioni sono
 * derivate raggruppando quelle di MuscleMapSvg — stesso "omino", stessa
 * scala — solo lette in stile scuro/neon invece che rosso su chiaro.
 */

interface BodyRecoveryMapProps {
  /** Colore hex per ciascun gruppo muscolare (da MuscleRecovery[].color). */
  colorByMuscle: Partial<Record<MuscleGroup, string>>;
  className?: string;
}

interface RegionDef {
  muscle: MuscleGroup;
  d: string;
}

/** Silhouette decorativa (testa, tronco, arti): solo contorno, nessun colore di stato. */
const BODY_OUTLINE = [
  "M100,10 a18,18 0 1,0 0.01,0 Z", // testa
  "M92,30 L108,30 L108,44 L92,44 Z", // collo
  "M62,44 L138,44 L146,180 L54,180 Z", // torso
  "M54,180 L146,180 L140,212 L60,212 Z", // bacino
  "M30,44 L62,44 L62,196 L30,196 Z", // braccio sx
  "M138,44 L170,44 L170,196 L138,196 Z", // braccio dx
  "M60,210 L140,210 L134,340 L66,340 Z", // gambe
];

/** Regioni FRONTALI, un path per MuscleGroup (fusione dei fasci fini di MuscleMapSvg). */
const FRONT_REGIONS: RegionDef[] = [
  { muscle: "petto", d: "M66,58 L134,58 L131,84 L69,84 Z M69,84 L131,84 L128,108 L72,108 Z M72,108 L128,108 L125,128 L75,128 Z" },
  { muscle: "spalle", d: "M32,46 L62,46 L62,68 L34,72 Z M168,46 L138,46 L138,68 L166,72 Z M30,48 L36,46 L38,74 L30,76 Z M170,48 L164,46 L162,74 L170,76 Z" },
  { muscle: "bicipiti", d: "M36,80 L58,76 L56,128 L40,130 Z M164,80 L142,76 L144,128 L160,130 Z M40,118 L48,118 L46,136 L38,136 Z M160,118 L152,118 L154,136 L162,136 Z M36,136 L58,136 L52,192 L42,192 Z M164,136 L142,136 L148,192 L158,192 Z" },
  { muscle: "quadricipiti", d: "M80,214 L94,214 L92,330 L82,330 Z M120,214 L106,214 L108,330 L118,330 Z M66,216 L80,214 L82,330 L70,330 Z M134,216 L120,214 L118,330 L130,330 Z" },
  { muscle: "core", d: "M86,128 L114,128 L112,182 L88,182 Z M69,130 L86,128 L88,180 L74,178 Z M131,130 L114,128 L112,180 L126,178 Z M94,132 L106,132 L105,180 L95,180 Z" },
];

/** Regioni POSTERIORI. */
const BACK_REGIONS: RegionDef[] = [
  { muscle: "schiena", d: "M86,46 L100,44 L98,96 L88,94 Z M114,46 L100,44 L102,96 L112,94 Z M92,96 L100,96 L98,140 L92,138 Z M108,96 L100,96 L102,140 L108,138 Z M88,70 L100,68 L98,96 L90,94 Z M112,70 L100,68 L102,96 L110,94 Z M62,84 L88,80 L82,168 L66,166 Z M138,84 L112,80 L118,168 L134,166 Z M86,150 L114,150 L110,182 L90,182 Z" },
  { muscle: "spalle", d: "M32,46 L62,46 L62,68 L34,72 Z M168,46 L138,46 L138,68 L166,72 Z" },
  { muscle: "tricipiti", d: "M36,80 L44,78 L42,130 L38,130 Z M164,80 L156,78 L158,130 L162,130 Z M44,78 L52,78 L50,130 L44,130 Z M156,78 L148,78 L150,130 L156,130 Z M52,78 L58,80 L56,130 L50,130 Z M148,78 L142,80 L144,130 L150,130 Z" },
  { muscle: "glutei", d: "M62,182 L78,180 L76,198 L64,198 Z M138,182 L122,180 L124,198 L136,198 Z M64,198 L98,196 L96,222 L68,222 Z M136,198 L102,196 L104,222 L132,222 Z" },
  { muscle: "femorali", d: "M66,222 L80,220 L82,330 L70,330 Z M134,222 L120,220 L118,330 L130,330 Z M80,220 L94,220 L92,330 L82,330 Z M120,220 L106,220 L108,330 L118,330 Z" },
  { muscle: "polpacci", d: "M70,300 L94,300 L90,338 L74,338 Z M130,300 L106,300 L110,338 L126,338 Z M74,338 L90,338 L86,376 L78,376 Z M126,338 L110,338 L114,376 L122,376 Z" },
];

const NEUTRAL_FILL = "#1E293B"; // slate-800: regione senza dato/stato

function FigureView({
  regions,
  colorByMuscle,
  gridId,
  glowId,
}: {
  regions: RegionDef[];
  colorByMuscle: Partial<Record<MuscleGroup, string>>;
  gridId: string;
  glowId: string;
}) {
  return (
    <svg viewBox="0 0 200 390" className="h-52 w-auto sm:h-60">
      {/* Silhouette: contorno tecnico sottile. */}
      <g fill="none" stroke="#334155" strokeWidth={1.25} strokeLinejoin="round">
        {BODY_OUTLINE.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Fasci muscolari: colore di stato + glow, dichiarativo. */}
      <g>
        {regions.map((r) => {
          const color = colorByMuscle[r.muscle] ?? NEUTRAL_FILL;
          return (
            <path
              key={r.muscle}
              data-muscle={r.muscle}
              d={r.d}
              fill={color}
              filter={`url(#${glowId})`}
              style={{ transition: "fill 0.2s ease" }}
            />
          );
        })}
      </g>

      {/* Reticolo tecnico: sovrapposto, clippato alla sola silhouette. */}
      <g clipPath={`url(#${gridId}-clip)`} opacity={0.55}>
        <rect x="0" y="0" width="200" height="390" fill={`url(#${gridId})`} />
      </g>
      <clipPath id={`${gridId}-clip`}>
        {BODY_OUTLINE.map((d, i) => (
          <path key={i} d={d} />
        ))}
        {regions.map((r) => (
          <path key={r.muscle} d={r.d} />
        ))}
      </clipPath>
    </svg>
  );
}

export default function BodyRecoveryMap({
  colorByMuscle,
  className = "",
}: BodyRecoveryMapProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          {/* Griglia tecnica: linee sottili cyan translucide, passo 10px. */}
          <pattern id="cyberGrid" width={10} height={10} patternUnits="userSpaceOnUse">
            <path d="M10,0 L0,0 L0,10" fill="none" stroke="#38BDF8" strokeWidth={1} opacity={0.85} />
          </pattern>
          {/* Glow neon sui fasci colorati. */}
          <filter id="recoveryGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div aria-hidden="true" className="flex items-center justify-center gap-4">
        <FigureView
          regions={FRONT_REGIONS}
          colorByMuscle={colorByMuscle}
          gridId="cyberGrid"
          glowId="recoveryGlow"
        />
        <FigureView
          regions={BACK_REGIONS}
          colorByMuscle={colorByMuscle}
          gridId="cyberGrid"
          glowId="recoveryGlow"
        />
      </div>
      <span className="sr-only">
        Mappa del corpo con lo stato di recupero per gruppo muscolare, elencato in dettaglio sotto.
      </span>
    </div>
  );
}
