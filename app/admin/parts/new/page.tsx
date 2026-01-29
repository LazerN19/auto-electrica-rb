"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewPartPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    sku: "",
    name: "",
    part_number: "",
    marca: "",
    modelo: "",
  });

 const create = async () => {
  const { data, error } = await supabase
    .from("parts")
    .insert(form)
    .select("id")
    .single();

  if (error || !data) {
    alert("Error al crear la pieza");
    return;
  }

  alert("Creado ✅");
  router.push(`/admin/parts/${data.id}`);
};

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", color: "#eaeaf0", padding: 20 }}>
      <h1>➕ Nueva pieza</h1>

      <div style={{ maxWidth: 600, background: "#12121a", padding: 20, borderRadius: 12 }}>
        {Object.keys(form).map((k) => (
          <input
            key={k}
            placeholder={k.toUpperCase()}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              background: "#0b0b0f",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#eaeaf0",
            }}
          />
        ))}

        <button
          onClick={create}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "#1f6feb",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Crear
        </button>
      </div>
    </div>
  );
}
