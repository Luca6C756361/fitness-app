"use client";

import { useHoldToConfirm } from "../_lib/useHoldToConfirm";

/**
 * Bottone gigante per i controlli dentro il Focus: 64x64 minimo, label
 * sempre visibile (sotto sforzo non si decodificano icone mute).
 */

interface FocusButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "primary" | "ghost" | "danger";
  holdToConfirm?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<NonNullable<FocusButtonProps["variant"]>, string> = {
  primary: "bg-[#12D6A0] text-[#04140D]",
  ghost: "border border-white/20 text-white bg-white/5",
  danger: "border border-[#FF6B6B]/40 text-[#FF6B6B] bg-[#FF6B6B]/10",
};

const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function FocusButton({
  onClick,
  icon,
  label,
  variant = "primary",
  holdToConfirm = false,
  className = "",
}: FocusButtonProps) {
  const { onHoldStart, onHoldEnd, progress } = useHoldToConfirm(onClick, 600);

  const sharedProps = {
    type: "button" as const,
    "aria-label": holdToConfirm ? `Tieni premuto: ${label}` : label,
    className: `relative flex min-h-16 min-w-16 flex-1 flex-col items-center justify-center gap-1.5 rounded-3xl px-4 py-3 select-none touch-manipulation transition active:scale-95 ${VARIANT_STYLES[variant]} ${className}`,
  };

  if (!holdToConfirm) {
    return (
      <button {...sharedProps} onClick={onClick}>
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </button>
    );
  }

  return (
    <button
      {...sharedProps}
      onPointerDown={onHoldStart}
      onPointerUp={onHoldEnd}
      onPointerCancel={onHoldEnd}
      onPointerLeave={onHoldEnd}
    >
      {progress > 0 && (
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
      )}
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );
}
