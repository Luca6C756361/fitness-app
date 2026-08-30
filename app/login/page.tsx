"use client";

import { useState } from "react";
import { supabase } from "../_lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";   // <-- NUOVO


export default function LoginPage() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);   // <-- NUOVO
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);   // <-- NUOVO
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

        <input
          className="w-full rounded border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && submit()}
        />

        <div className="relative">
          <input
            className="w-full rounded border p-3 pr-12"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && submit()}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900/40 transition hover:text-emerald-900"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {notice && <p className="text-sm text-emerald-700 text-center">{notice}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? "..." : mode === "login" ? "Entra" : "Crea account"}
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-sm underline"
        >
          {mode === "login" ? "Non hai un account?" : "Hai già un account?"}
        </button>

      </div>
    </main>
  );
}