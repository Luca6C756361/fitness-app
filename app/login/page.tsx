"use client";

import { useState } from "react";
import { supabase } from "../_lib/supabase/client";


export default function LoginPage() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);   // <-- NUOVO
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data.session) {
        setError("Sessione non creata. Riprova.");
        setLoading(false);
        return;
      }
      // Navigazione hard: il middleware deve rileggere il cookie appena scritto.
      // router.push resterebbe appeso su un redirect verso /login.
      window.location.assign("/today");
      return;   // niente setLoading(false): la pagina sta per essere sostituita
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Con "Confirm email" attivo la sessione è null: nessun redirect possibile
    if (!data.session) {
      setNotice("Ti abbiamo inviato una mail di conferma. Aprila, poi accedi.");
      setMode("login");
      setLoading(false);
      return;
    }
    window.location.assign("/today");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-center w-full">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Accedi" : "Registrati"}
          </h1>
        </div>
        <input className="w-full rounded border p-3" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-3" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {notice && <p className="text-sm text-emerald-700 text-center">{notice}</p>}   {/* <-- NUOVO */}
        <button onClick={submit} disabled={loading}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50">
          {loading ? "..." : mode === "login" ? "Entra" : "Crea account"}
        </button>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-sm underline">
          {mode === "login" ? "Non hai un account?" : "Hai già un account?"}
        </button>
      </div>
    </main>
  );
}