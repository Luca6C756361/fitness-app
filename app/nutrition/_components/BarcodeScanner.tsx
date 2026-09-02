"use client";

import { Camera, Keyboard, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

/*
 * BarcodeScanner: overlay fotocamera per la lettura di codici a barre.
 *
 * Decoder a due livelli:
 * - BarcodeDetector nativo (Chrome/Android): zero KB di bundle.
 * - Fallback dinamico a @zxing/browser (Safari/iOS, Firefox): import
 *   dinamico, così chi ha il detector nativo non lo scarica mai.
 *
 * Espone sempre un input manuale come fallback (nessuna camera, permesso
 * negato, contesto non sicuro, o semplicemente preferenza dell'utente).
 */

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void; // chiamato UNA sola volta per apertura
}

type ErrorKind = "permission" | "no-camera" | "insecure" | "generic" | null;

const NATIVE_FORMATS: BarcodeFormatString[] = ["ean_13", "ean_8", "upc_a", "upc_e"];
const SCAN_INTERVAL_MS = 250;

export default function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const detectedRef = useRef(false); // guardia anti-doppio-scan

  const [starting, setStarting] = useState(true);
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [flash, setFlash] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const manualValid = /^\d{8,14}$/.test(manualValue);

  /** Ferma tutto: track della camera, interval del detector nativo, reader ZXing. */
  const stopCamera = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (zxingControlsRef.current) {
      zxingControlsRef.current.stop();
      zxingControlsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  /** Riportato UNA volta sola: ferma la camera, feedback, poi notifica il chiamante. */
  const handleDetected = useCallback(
    (barcode: string) => {
      if (detectedRef.current) return;
      detectedRef.current = true;
      stopCamera();
      navigator.vibrate?.(60);
      setFlash(true);
      window.setTimeout(() => onDetected(barcode), 150);
    },
    [onDetected, stopCamera]
  );

  const startNativeDetector = useCallback(
    (video: HTMLVideoElement) => {
      const detector = new window.BarcodeDetector!({ formats: NATIVE_FORMATS });
      intervalRef.current = window.setInterval(async () => {
        if (detectedRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length > 0) handleDetected(codes[0].rawValue);
        } catch {
          /* frame non decodificabile: ignora e riprova al prossimo tick */
        }
      }, SCAN_INTERVAL_MS);
    },
    [handleDetected]
  );

  const startZxing = useCallback(
    async (stream: MediaStream, video: HTMLVideoElement) => {
      // Import dinamico obbligatorio: ZXing non deve pesare sul bundle di
      // chi ha già il BarcodeDetector nativo.
      const [{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ]);
      const reader = new BrowserMultiFormatReader(hints);
      zxingControlsRef.current = await reader.decodeFromStream(stream, video, (result) => {
        if (result && !detectedRef.current) handleDetected(result.getText());
      });
    },
    [handleDetected]
  );

  const startCamera = useCallback(async () => {
    setStarting(true);
    setErrorKind(null);
    setManualValue("");
    setFlash(false);

    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setErrorKind("insecure");
      setStarting(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorKind("no-camera");
      setStarting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }
      video.srcObject = stream;
      await video.play().catch(() => {});
      setStarting(false);

      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        startNativeDetector(video);
      } else {
        await startZxing(stream, video);
      }
    } catch (err) {
      setStarting(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorKind("permission");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setErrorKind("no-camera");
      } else {
        console.error("[scanner]", err);
        setErrorKind("generic");
      }
    }
  }, [startNativeDetector, startZxing]);

  // Avvia/ferma la camera in base a `open`. Cleanup rigoroso allo smontaggio.
  useEffect(() => {
    if (!open) return;
    detectedRef.current = false;
    const timer = window.setTimeout(() => {
      void startCamera();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Chiudi con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Blocca lo scroll del body mentre lo scanner è aperto
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const submitManual = () => {
    if (!manualValid) return;
    handleDetected(manualValue);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-emerald-900/10 bg-emerald-950 shadow-sm"
      >
        {/* Intestazione */}
        <div className="flex items-center justify-between px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/70">
            <Camera className="h-3.5 w-3.5" />
            Scansiona codice a barre
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorKind ? (
          <ErrorPanel kind={errorKind} />
        ) : (
          <div className="relative aspect-[3/4] w-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {starting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-6 w-6 animate-spin text-white/80" />
              </div>
            )}

            {flash && <div className="absolute inset-0 bg-emerald-400/50 transition" />}

            {!starting && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <div className="h-1/3 w-2/3 rounded-2xl border-2 border-emerald-400/90" />
                <p className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                  Inquadra il codice a barre
                </p>
              </div>
            )}
          </div>
        )}

        {/* Input manuale: sempre disponibile, in fondo alla vista normale e in ogni stato di errore */}
        <div className="space-y-2 border-t border-white/10 p-4">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/60">
            <Keyboard className="h-3.5 w-3.5" />
            Oppure inserisci il codice a mano
          </label>
          <div className="flex gap-2">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitManual();
              }}
              placeholder="8-14 cifre"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="button"
              onClick={submitManual}
              disabled={!manualValid}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cerca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorPanel({ kind }: { kind: Exclude<ErrorKind, null> }) {
  const copy: Record<Exclude<ErrorKind, null>, { title: string; hint: string }> = {
    permission: {
      title: "Permesso fotocamera negato",
      hint: 'Sblocca la fotocamera dal lucchetto nella barra indirizzi del browser, poi riprova.',
    },
    "no-camera": {
      title: "Nessuna fotocamera disponibile",
      hint: "Usa l'input manuale qui sotto per cercare il prodotto.",
    },
    insecure: {
      title: "La fotocamera richiede HTTPS",
      hint: "Apri l'app da una connessione sicura, oppure usa l'input manuale qui sotto.",
    },
    generic: {
      title: "Impossibile avviare la fotocamera",
      hint: "Usa l'input manuale qui sotto per cercare il prodotto.",
    },
  };
  const { title, hint } = copy[kind];

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-white/60">{hint}</p>
    </div>
  );
}
