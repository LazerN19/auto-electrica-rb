"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Cat = { id: string; name: string };

export default function EditPartPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const partId = useMemo(() => Number(params.id), [params.id]);

  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [cats, setCats] = useState<Cat[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Cargar: pieza + categorías + asignadas
  useEffect(() => {
    (async () => {
      setLoading(true);

      const [partRes, catsRes, assignedRes] = await Promise.all([
        supabase
          .from("parts")
          .select("id,sku,name,part_number,marca,modelo")
          .eq("id", partId)
          .single(),

        supabase
          .from("categories")
          .select("id,name")
          .eq("active", true)
          .order("name"),

        supabase
          .from("part_categories")
          .select("category_id")
          .eq("part_id", partId),
      ]);

      if (partRes.error) {
        console.error(partRes.error);
        alert(`Error cargando pieza: ${partRes.error.message}`);
      }

      if (catsRes.error) {
        console.error(catsRes.error);
        alert(`Error cargando categorías: ${catsRes.error.message}`);
      }

      if (assignedRes.error) {
        console.error(assignedRes.error);
        alert(`Error cargando asignadas: ${assignedRes.error.message}`);
      }

      setPart(partRes.data);
      setCats((catsRes.data as any) || []);
      setSelected(new Set((assignedRes.data || []).map((x: any) => x.category_id)));

      setLoading(false);
    })();
  }, [partId]);

  const toggleCat = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (!part) return;
    setSaving(true);

    // 1) Guardar datos de la pieza
    const { error: updErr } = await supabase
      .from("parts")
      .update({
        sku: part.sku,
        name: part.name,
        part_number: part.part_number,
        marca: part.marca,
        modelo: part.modelo,
      })
      .eq("id", partId);

    if (updErr) {
      setSaving(false);
      alert(`Error guardando pieza: ${updErr.message}`);
      return;
    }

    // 2) Guardar categorías (delete + insert)
    const { error: delErr } = await supabase
      .from("part_categories")
      .delete()
      .eq("part_id", partId);

    if (delErr) {
      setSaving(false);
      alert(`Error borrando categorías: ${delErr.message}`);
      return;
    }

    const ids = Array.from(selected);
    if (ids.length) {
      const { error: insErr } = await supabase.from("part_categories").insert(
        ids.map((category_id) => ({
          part_id: partId,
          category_id,
        }))
      );

      if (insErr) {
        setSaving(false);
        alert(`Error guardando categorías: ${insErr.message}`);
        return;
      }
    }

    setSaving(false);
    alert("Guardado ✅");
  };

  const removeThis = async () => {
    const ok = confirm(`¿Eliminar la pieza #${partId}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    setDeleting(true);
    const { error } = await supabase.from("parts").delete().eq("id", partId);
    setDeleting(false);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    alert("Eliminado ✅");
    router.push("/admin/parts");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f", color: "#eaeaf0", padding: 12 }}>
        Cargando…
      </div>
    );
  }

  if (!part) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f", color: "#eaeaf0", padding: 12 }}>
        No se encontró la pieza.
      </div>
    );
  }

  const selectedCount = selected.size;

  return (
    <div className="wrap">
      <style>{`
        .wrap{
          min-height:100vh;
          background:#0b0b0f;
          color:#eaeaf0;
          padding:12px 12px 96px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }
        .card{
          background:#12121a;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:12px;
        }
        .title{
          font-weight: 950;
          letter-spacing: .2px;
          font-size: 18px;
          margin: 6px 0 4px;
        }
        .muted{
          color: rgba(234,234,240,0.7);
          font-size: 13px;
        }
        .grid{ display:grid; gap:10px; }
        .field label{
          display:block;
          font-size: 12px;
          color: rgba(234,234,240,0.75);
          margin-bottom: 6px;
          font-weight: 700;
        }
        .input{
          width:100%;
          padding:12px 12px;
          border-radius:12px;
          background:#0b0b0f;
          border:1px solid rgba(255,255,255,0.15);
          color:#eaeaf0;
          outline:none;
        }
        .row{ display:flex; gap:10px; align-items:center; flex-wrap: wrap; }
        .btn{
          padding:12px 14px;
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.15);
          background:#12121a;
          color:#eaeaf0;
          font-weight: 900;
          cursor:pointer;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }
        .btnPrimary{ background:#1f6feb; border:none; color:#fff; }
        .btnDanger{
          background:rgba(255,0,0,0.12);
          border:1px solid rgba(255,0,0,0.25);
          color:#ffb3b3;
        }

        .chipsWrap{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
        }
        .chip{
          padding:10px 12px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.14);
          background:#0b0b0f;
          color:#eaeaf0;
          font-weight: 850;
          cursor:pointer;
          user-select:none;
          display:inline-flex;
          align-items:center;
          gap:8px;
          max-width: 100%;
        }
        .chipOn{
          background: rgba(31,111,235,0.18);
          border-color: rgba(31,111,235,0.40);
        }
        .chipDot{
          width:10px;
          height:10px;
          border-radius:999px;
          background: rgba(255,255,255,0.28);
        }
        .chipOn .chipDot{
          background: #1f6feb;
        }

        .stickyBar{
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px 12px;
          background: rgba(11,11,15,0.92);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,0.10);
          display:flex;
          gap:10px;
          z-index: 60;
        }
        .stickyBar .btn{ flex:1; }

        @media (min-width: 900px){
          .wrap{ padding:20px; }
          .stickyBar{
            position: static;
            padding: 0;
            background: transparent;
            border: 0;
            backdrop-filter: none;
            margin-top: 12px;
          }
          .stickyBar .btn{ flex: unset; }
          .twoCol{
            display:grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
      `}</style>

      {/* Encabezado */}
      <div className="card">
        <div className="muted">Editar pieza</div>
        <div className="title">
          #{partId} · {part.sku || "—"}
        </div>
        <div className="muted">
          {selectedCount} categoría{selectedCount === 1 ? "" : "s"} seleccionada{selectedCount === 1 ? "" : "s"}.
        </div>
      </div>

      <div style={{ height: 10 }} />

      {/* Formulario */}
      <div className="card">
        <div className="twoCol">
          <div className="grid">
            <div className="field">
              <label>SKU</label>
              <input
                className="input"
                value={part.sku || ""}
                onChange={(e) => setPart({ ...part, sku: e.target.value })}
                placeholder="008545"
              />
            </div>

            <div className="field">
              <label>Nombre</label>
              <input
                className="input"
                value={part.name || ""}
                onChange={(e) => setPart({ ...part, name: e.target.value })}
                placeholder="Sensor de temperatura..."
              />
            </div>

            <div className="field">
              <label>Part number</label>
              <input
                className="input"
                value={part.part_number || ""}
                onChange={(e) => setPart({ ...part, part_number: e.target.value })}
                placeholder="TX130; 125"
              />
            </div>
          </div>

          <div className="grid">
            <div className="field">
              <label>Marca</label>
              <input
                className="input"
                value={part.marca || ""}
                onChange={(e) => setPart({ ...part, marca: e.target.value })}
                placeholder="FORD"
              />
            </div>

            <div className="field">
              <label>Modelo</label>
              <input
                className="input"
                value={part.modelo || ""}
                onChange={(e) => setPart({ ...part, modelo: e.target.value })}
                placeholder="F-150"
              />
            </div>

            <button
              className="btn btnDanger"
              onClick={removeThis}
              disabled={deleting}
              style={{ width: "100%" }}
            >
              {deleting ? "Eliminando…" : "🗑 Eliminar pieza"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 10 }} />

      {/* Categorías con CHIPS */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontWeight: 950 }}>Categorías</div>
          <div className="muted">{cats.length} disponibles</div>
        </div>

        <div className="chipsWrap">
          {cats.map((c) => {
            const on = selected.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`chip ${on ? "chipOn" : ""}`}
                onClick={() => toggleCat(c.id)}
                title={c.name}
              >
                <span className="chipDot" />
                <span style={{ textAlign: "left", lineHeight: 1.15 }}>{c.name}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 10 }} className="muted">
          Tip: toca un chip para activar/desactivar.
        </div>
      </div>

      {/* Barra inferior */}
      <div className="stickyBar">
        <button className="btn" onClick={() => router.push("/admin/parts")}>
          ← Volver
        </button>

        <button
          className="btn btnPrimary"
          onClick={save}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Guardando…" : "💾 Guardar"}
        </button>
      </div>
    </div>
  );
}
