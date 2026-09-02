"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { drawShareCard, shareOrDownload, type ShareCardData } from "../today/_lib/shareCard";

interface ShareButtonProps {
  data: ShareCardData;
  label?: string;
  /** "default" (bottone pieno) o "compact" (solo icona + label piccola, per i badge). */
  variant?: "default" | "compact";
}

type Status = "idle" | "working" | "error";

const VARIANT_CLASSES: Record<NonNullable<ShareButtonProps["variant"]>, string> = {
  default:
    "inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50",
  compact:
    "inline-flex items-center gap-1.5 rounded-lg bg-transparent px-2 py-1 text-[11px] font-bold text-teal-700 transition hover:bg-teal-50 disabled:opacity-50",
};

export default function ShareButton({
  data,
  label = "Condividi",
  variant = "default",
}: ShareButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  const handleClick = async () => {
    setStatus("working");
    try {
      const blob = await drawShareCard(data);
      const filename = `fitapp-${Date.now()}.png`;
      await shareOrDownload(blob, filename);
      setStatus("idle");
    } catch (err) {
      console.error("[share]", err);
      setStatus("error");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "working"}
        aria-label={label}
        className={VARIANT_CLASSES[variant]}
      >
        <Share2 className={variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {status === "working" ? "Genero…" : label}
      </button>
      {status === "error" && (
        <p className="mt-1.5 text-[11px] text-red-600">
          Non sono riuscito a generare l&apos;immagine. Riprova.
        </p>
      )}
    </div>
  );
}
