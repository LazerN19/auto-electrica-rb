"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      // 🔍 DEBUG: ver si hay sesión previa
      const { data } = await supabase.auth.getSession();
      console.log("SESSION ANTES DE LOGIN:", data.session);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("ERROR LOGIN:", error.message);
        setMsg(error.message);
        return;
      }

      setMsg("✅ Login correcto");
      inputRef.current?.blur();
      router.replace("/admin/parts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b0b0f] px-4">
      <form
        onSubmit={signIn}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-xl"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-white">
            Auto Eléctrica RB
          </h1>
          <p className="text-sm text-white/60">
            Panel de empleados
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Correo</label>
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-3 text-white outline-none focus:border-[#9A99FF]"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-3 text-white outline-none focus:border-[#9A99FF]"
            enterKeyHint="go"
          />
        </div>

        {msg && (
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-[#9A99FF] font-medium text-black transition disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-xs text-white/40">
          Login de pruebas
        </p>
      </form>
    </div>
  );
}
