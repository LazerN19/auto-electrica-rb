"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 30;

export default function AdminPartsPage() {
  const router = useRouter();

  const [parts, setParts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);

    let query = supabase
      .from("parts")
      .select("id,sku,name,part_number,marca,modelo")
      .order("id", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (q.trim()) {
      const term = q.trim();
      query = query.or(
        `sku.ilike.%${term}%,name.ilike.%${term}%,part_number.ilike.%${term}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      alert(error.message);
      console.error(error);
    }

    setParts(data || []);
    setLoading(false);
  };

  const removePart = async (id: number) => {
    const ok = confirm(
      `¿Eliminar la pieza #${id}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    const { error } = await supabase.from("parts").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (parts.length === 1 && page > 0) setPage(page - 1);
    else load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "#eaeaf0",
        padding: 20,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>📦 Panel de piezas</h1>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#12121a",
              color: "#eaeaf0",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ↩ Volver a la app
          </button>

          <button
            onClick={logout}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,0,0,0.12)",
              border: "1px solid rgba(255,0,0,0.25)",
              color: "#ffb3b3",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por SKU, nombre o part #"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#eaeaf0",
            outline: "none",
          }}
        />

        <button
          onClick={() => {
            setPage(0);
            load();
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#1f6feb",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Buscar
        </button>

        <Link
          href="/admin/parts/new"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#12121a",
            color: "#eaeaf0",
            border: "1px solid rgba(255,255,255,0.15)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          + Nueva pieza
        </Link>
      </div>

      {/* TABLA */}
      <div
        style={{
          background: "#12121a",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#181824" }}>
            <tr>
              {["SKU", "Nombre", "Part #", "Marca", "Modelo", "Editar", "Eliminar"].map(
                (h) => (
                  <th key={h} style={{ padding: 12, textAlign: "left" }}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>
                  Cargando...
                </td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>
                  Sin resultados
                </td>
              </tr>
            ) : (
              parts.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 12 }}>{p.sku}</td>
                  <td style={{ padding: 12 }}>{p.name}</td>
                  <td style={{ padding: 12 }}>{p.part_number}</td>
                  <td style={{ padding: 12 }}>{p.marca}</td>
                  <td style={{ padding: 12 }}>{p.modelo}</td>

                  <td style={{ padding: 12 }}>
                    <Link
                      href={`/admin/parts/${p.id}`}
                      style={{ color: "#1f6feb", fontWeight: 700 }}
                    >
                      Editar
                    </Link>
                  </td>

                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => removePart(p.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: "rgba(255,0,0,0.12)",
                        border: "1px solid rgba(255,0,0,0.25)",
                        color: "#ffb3b3",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          disabled={page === 0 || loading}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          ← Anterior
        </button>
        <span>Página {page + 1}</span>
        <button
          disabled={loading || parts.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
