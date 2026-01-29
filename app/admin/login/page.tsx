"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";




export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const signIn = async () => {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    setMsg(error ? `Error: ${error.message}` : "✅ Login correcto");
    router.push("/admin/parts");
  return;
  };
  useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) router.push("/admin/parts");
  });
}, [router]);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0f",
        padding: 16,
        color: "#eaeaf0",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#12121a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
          Login empleados
        </h1>
        <p style={{ marginTop: 6, marginBottom: 14, color: "rgba(234,234,240,0.7)" }}>
          Acceso para editar el catálogo
        </p>

        <label style={{ fontSize: 13, color: "rgba(234,234,240,0.75)" }}>
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@empresa.com"
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#0b0b0f",
            color: "#eaeaf0",
            outline: "none",
          }}
        />

        <label style={{ fontSize: 13, color: "rgba(234,234,240,0.75)" }}>
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#0b0b0f",
            color: "#eaeaf0",
            outline: "none",
          }}
        />

        <button
          onClick={signIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: loading ? "#2a2a38" : "#1f6feb",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {msg && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#eaeaf0",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
