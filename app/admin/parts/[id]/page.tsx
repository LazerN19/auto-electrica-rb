"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditPartPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const partId = useMemo(() => Number(params.id), [params.id]);

  const [part, setPart] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  useEffect(() => {
    supabase
      .from("parts")
      .select("id,sku,name,part_number,marca,modelo")
      .eq("id", partId)
      .single()
      .then(({ data }) => setPart(data));
  }, [partId]);

  const save = async () => {
    if (!part) return;
    setSaving(true);

    await supabase
      .from("parts")
      .update({
        sku: part.sku,
        name: part.name,
        part_number: part.part_number,
        marca: part.marca,
        modelo: part.modelo,
      })
      .eq("id", partId);

    setSaving(false);
    alert("Guardado ✅");
  };

  const removeThis = async () => {
    const ok = confirm(`¿Eliminar la pieza #${partId}?`);
    if (!ok) return;

    setDeleting(true);
    await supabase.from("parts").delete().eq("id", partId);
    setDeleting(false);

    alert("Eliminado ✅");
    router.push("/admin/parts");
  };

  if (!part) {
    return <div style={{ padding: 20, color: "#eaeaf0" }}>Cargando…</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "#eaeaf0",
        padding: 20,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => (window.location.href = "/")}>↩ Volver a la app</button>
        <button onClick={logout} style={{ color: "#ffb3b3" }}>
          Cerrar sesión
        </button>
      </div>

      <h1>✏️ Editar pieza #{partId}</h1>

      <div style={{ maxWidth: 720, background: "#12121a", padding: 18, borderRadius: 12 }}>
        {["sku", "name", "part_number", "marca", "modelo"].map((key) => (
          <input
            key={key}
            value={part[key] || ""}
            onChange={(e) => setPart({ ...part, [key]: e.target.value })}
            placeholder={key.toUpperCase()}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              background: "#0b0b0f",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#eaeaf0",
            }}
          />
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>

          <button onClick={() => router.push("/admin/parts")}>← Volver</button>

          <button onClick={removeThis} disabled={deleting} style={{ color: "#ffb3b3" }}>
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
