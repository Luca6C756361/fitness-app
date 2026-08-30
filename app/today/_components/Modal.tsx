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
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]"
      >
        {/* Intestazione */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--kh-ink)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--kh-ink-subtle)] transition hover:bg-[var(--kh-surface-2)] hover:text-[var(--kh-ink)]"
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