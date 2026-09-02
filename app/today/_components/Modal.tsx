"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * Modale generico: uno sfondo scuro semitrasparente + una card centrale.
 * Riutilizzabile da qualsiasi bottone. Si chiude con la X, click fuori, o ESC.
 */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** "md" (default, identico a oggi) o "lg" per contenuti più ricchi. */
  size?: "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  // Chiudi con il tasto ESC
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${SIZE_CLASSES[size]}`}
      >
        {/* Intestazione */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-800/60 transition hover:bg-emerald-50 hover:text-emerald-950"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
