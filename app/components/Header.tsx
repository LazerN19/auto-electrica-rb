"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = { role: string } | null;

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const fetchRole = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLogged(false);
      setRole(null);
      setLoading(false);
      return;
    }

    setLogged(true);

    // Traer rol desde profiles (si existe)
    const { data: prof, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      // Si no existe profiles o no hay policy, solo no mostramos panel
      setRole(null);
    } else {
      setRole((prof as Profile)?.role ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRole();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      fetchRole();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isEmployee = role === "employee" || role === "admin";

  return (
    <header
      style={{
        background: "#0b0b0f",
        color: "#eaeaf0",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Link
        href="/"
        style={{
          color: "#eaeaf0",
          textDecoration: "none",
          fontWeight: 900,
          letterSpacing: 0.2,
        }}
      >
        Auto Eléctrica RB
      </Link>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {loading ? (
          <span style={{ color: "rgba(234,234,240,0.7)", fontSize: 13 }}>
            …
          </span>
        ) : !logged ? (
          <Link
            href="/admin/login"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "#12121a",
              color: "#eaeaf0",
              border: "1px solid rgba(255,255,255,0.15)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            🔑 Iniciar sesión
          </Link>
        ) : (
          <>
            {isEmployee && (
              <Link
                href="/admin/parts"
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "#1f6feb",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                ⚙ Panel
              </Link>
            )}

            <button
              onClick={logout}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(255,0,0,0.12)",
                border: "1px solid rgba(255,0,0,0.25)",
                color: "#ffb3b3",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🚪 Salir
            </button>
          </>
        )}
      </div>
    </header>
  );
}
