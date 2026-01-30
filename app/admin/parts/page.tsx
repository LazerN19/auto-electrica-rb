"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 30;

export default function AdminPartsPage() {
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
    const ok = confirm(`¿Eliminar la pieza #${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    const { error } = await supabase.from("parts").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (parts.length === 1 && page > 0) setPage(page - 1);
    else load();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="adminWrap">
      <style>{`
        .adminWrap{
          min-height:100vh;
          background:#0b0b0f;
          color:#eaeaf0;
          padding:12px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }
        .card{
          background:#12121a;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:12px;
        }
        .row{ display:flex; gap:10px; align-items:center; }
        .col{ display:flex; flex-direction:column; gap:10px; }
        .input{
          width:100%;
          padding:12px 12px;
          border-radius:12px;
          background:#0b0b0f;
          border:1px solid rgba(255,255,255,0.15);
          color:#eaeaf0;
          outline:none;
        }
        .btn{
          padding:12px 14px;
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.15);
          background:#12121a;
          color:#eaeaf0;
          font-weight:900;
          cursor:pointer;
          text-decoration:none;
          text-align:center;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }
        .btnPrimary{
          background:#1f6feb;
          border:none;
          color:#fff;
        }
        .btnDanger{
          background:rgba(255,0,0,0.12);
          border:1px solid rgba(255,0,0,0.25);
          color:#ffb3b3;
        }
        .muted{ color: rgba(234,234,240,0.7); font-size:13px; }
        .spacer{ height:10px; }

        /* Desktop enhancements */
        .desktopTable { display:none; }
        .mobileCards { display:block; }

        @media (min-width: 900px){
          .adminWrap{ padding:20px; }
          .desktopTable{ display:block; }
          .mobileCards{ display:none; }

          .toolbar{ display:flex; gap:10px; align-items:center; }
          .toolbar .input{ max-width:520px; }
        }

        table{ width:100%; border-collapse:collapse; }
        thead{ background:#181824; }
        th, td{ padding:12px; text-align:left; }
        tbody tr{ border-top:1px solid rgba(255,255,255,0.08); }
      `}</style>

      {/* TOP TOOLBAR (mobile-first) */}
      <div className="card col">
        <div className="muted">Buscar / administrar piezas</div>

        <div className="col">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por SKU, nombre o part #"
          />

          <div className="col" style={{ gap: 10 }}>
            <button
              className="btn btnPrimary"
              onClick={() => {
                setPage(0);
                load();
              }}
            >
              🔎 Buscar
            </button>

            <Link className="btn" href="/admin/parts/new">
              ➕ Nueva pieza
            </Link>
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button
              className="btn"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              style={{ opacity: page === 0 || loading ? 0.5 : 1 }}
            >
              ← Anterior
            </button>

            <div className="muted">Página {page + 1}</div>

            <button
              className="btn"
              disabled={loading || parts.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              style={{ opacity: loading || parts.length < PAGE_SIZE ? 0.5 : 1 }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      <div className="spacer" />

      {/* MOBILE: CARDS */}
      <div className="mobileCards col">
        {loading ? (
          <div className="card">Cargando...</div>
        ) : parts.length === 0 ? (
          <div className="card">Sin resultados</div>
        ) : (
          parts.map((p) => (
            <div key={p.id} className="card col">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>{p.sku}</div>
                <div className="muted">#{p.id}</div>
              </div>

              <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>
                {p.name}
              </div>

              <div className="row" style={{ flexWrap: "wrap" }}>
                <span className="muted">Part #:</span>
                <span style={{ fontWeight: 800 }}>{p.part_number || "-"}</span>
              </div>

              <div className="row" style={{ flexWrap: "wrap" }}>
                <span className="muted">Vehículo:</span>
                <span style={{ fontWeight: 800 }}>
                  {p.marca || "-"} {p.modelo ? `• ${p.modelo}` : ""}
                </span>
              </div>

              <div className="row" style={{ marginTop: 6 }}>
                <Link className="btn btnPrimary" href={`/admin/parts/${p.id}`} style={{ flex: 1 }}>
                  ✏️ Editar
                </Link>

                <button
                  className="btn btnDanger"
                  onClick={() => removePart(p.id)}
                  style={{ flex: 1 }}
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP: TABLE */}
      <div className="desktopTable card">
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                {["SKU", "Nombre", "Part #", "Marca", "Modelo", "Editar", "Eliminar"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={7}>Sin resultados</td>
                </tr>
              ) : (
                parts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.part_number}</td>
                    <td>{p.marca}</td>
                    <td>{p.modelo}</td>
                    <td>
                      <Link href={`/admin/parts/${p.id}`} style={{ color: "#1f6feb", fontWeight: 900 }}>
                        Editar
                      </Link>
                    </td>
                    <td>
                      <button className="btn btnDanger" onClick={() => removePart(p.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
