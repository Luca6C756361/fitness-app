"use client";

import { useEffect } from "react";

/** Registra il service worker. Solo in produzione: in dev interferisce con l'HMR. */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((e) => console.error("[sw]", e));
  }, []);

  return null;
}