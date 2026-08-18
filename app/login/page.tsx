"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../_lib/supabase/client";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/today");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Accedi" : "Registrati"}
        </h1>
        <input className="w-full rounded border p-3" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-3" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
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