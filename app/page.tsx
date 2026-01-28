"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Part = {
  id: number;
  sku: string;
  part_number: string | null;
  name: string;
  categories: string | null;
  marca: string | null;
  modelo: string | null;
};

const WHATSAPP_PHONE = "52XXXXXXXXXX"; // <-- CAMBIA ESTO (ej. 526141234567)

function waLink(p: Part) {
  const msg =
    `Hola, me interesa esta pieza:\n\n` +
    `Producto: ${p.name}\n` +
    `SKU: ${p.sku}\n` +
    `No. de parte: ${p.part_number ?? "-"}\n` +
    `Vehículo: ${(p.marca ?? "")} ${(p.modelo ?? "")}\n\n` +
    `¿Me confirmas precio y disponibilidad?`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

function uniqSorted(arr: string[]) {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Icono */}
      <div className="h-11 w-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 grid place-items-center">
        <div className="relative h-8 w-8 rounded-xl bg-orange-500 grid place-items-center shadow-sm">
          <span className="text-[11px] font-extrabold text-black tracking-wide">RB</span>
          <svg
            className="absolute -right-2 -top-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z"
              fill="black"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Texto */}
      <div className="leading-tight">
        <div className="text-lg font-extrabold">Auto Eléctrica RB</div>
        <div className="text-xs text-white/60">Catálogo vehicular por marca y modelo</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [categoria, setCategoria] = useState("");

  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelos, setModelos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Cargar marcas
  useEffect(() => {
    (async () => {
      setError(null);

      const { data, error } = await supabase
        .from("parts")
        .select("marca")
        .not("marca", "is", null)
        .limit(5000);

      if (error) {
        setError(error.message);
        setMarcas([]);
        return;
      }

      const list = (data ?? [])
        .map((r: any) => String(r.marca ?? "").trim())
        .filter(Boolean);

      setMarcas(uniqSorted(list));
    })();
  }, []);

  // 2) Al cambiar marca: limpiar y cargar modelos
  useEffect(() => {
    (async () => {
      setModelo("");
      setCategoria("");
      setModelos([]);
      setCategorias([]);
      setParts([]);

      if (!marca) return;

      setError(null);
      const { data, error } = await supabase
        .from("parts")
        .select("modelo")
        .eq("marca", marca)
        .not("modelo", "is", null)
        .limit(5000);

      if (error) {
        setError(error.message);
        return;
      }

      const list = (data ?? [])
        .map((r: any) => String(r.modelo ?? "").trim())
        .filter(Boolean);

      setModelos(uniqSorted(list));
    })();
  }, [marca]);

  // 3) Al cambiar modelo: limpiar y cargar categorías
  useEffect(() => {
    (async () => {
      setCategoria("");
      setCategorias([]);
      setParts([]);

      if (!marca || !modelo) return;

      setError(null);
      const { data, error } = await supabase
        .from("parts")
        .select("categories")
        .eq("marca", marca)
        .eq("modelo", modelo)
        .not("categories", "is", null)
        .limit(5000);

      if (error) {
        setError(error.message);
        return;
      }

      const set = new Set<string>();
      for (const r of data ?? []) {
        const raw = String((r as any).categories ?? "").trim();
        if (!raw) continue;
        raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((c) => set.add(c));
      }

      setCategorias(Array.from(set).sort((a, b) => a.localeCompare(b)));
    })();
  }, [marca, modelo]);

  async function buscar() {
    if (!marca || !modelo) return;

    setLoading(true);
    setError(null);

    let q = supabase
      .from("parts")
      .select("id, sku, part_number, name, categories, marca, modelo")
      .eq("marca", marca)
      .eq("modelo", modelo)
      .order("id", { ascending: false })
      .limit(200);

    if (categoria) {
      q = q.ilike("categories", `%${categoria}%`);
    }

    const { data, error } = await q;

    if (error) {
      setError(error.message);
      setParts([]);
      setLoading(false);
      return;
    }

    setParts((data ?? []) as Part[]);
    setLoading(false);
  }

  const subtitle = useMemo(() => {
    if (marca && modelo && categoria) return `Mostrando: ${marca} / ${modelo} / ${categoria}`;
    if (marca && modelo) return `Mostrando: ${marca} / ${modelo}`;
    return "Selecciona marca, modelo y (opcional) categoría para ver piezas disponibles.";
  }, [marca, modelo, categoria]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <Logo />

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 hidden sm:inline">{subtitle}</span>
            <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
              Catálogo
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <label className="text-xs text-white/60">Marca</label>
            <select
              className="mt-2 w-full rounded-xl bg-white text-black p-3 font-semibold"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            >
              <option value="">Selecciona marca</option>
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <label className="text-xs text-white/60">Modelo</label>
            <select
              className="mt-2 w-full rounded-xl bg-white text-black p-3 font-semibold disabled:bg-gray-200"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              disabled={!marca}
            >
              <option value="">
                {!marca ? "Elige una marca primero" : "Selecciona modelo"}
              </option>
              {modelos.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <label className="text-xs text-white/60">Categoría (opcional)</label>
            <select
              className="mt-2 w-full rounded-xl bg-white text-black p-3 font-semibold disabled:bg-gray-200"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={!marca || !modelo}
            >
              <option value="">
                {!marca || !modelo ? "Elige marca y modelo" : "Todas"}
              </option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-end">
            <button
              onClick={buscar}
              disabled={!marca || !modelo || loading}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-3 disabled:opacity-40"
            >
              {loading ? "Cargando..." : "Ver piezas"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
            Error: {error}
          </div>
        )}

        {/* Resultados */}
        <div className="mt-8">
          {parts.length === 0 ? (
            <div className="text-white/70">
              {marca && modelo
                ? "No hay resultados aún. Presiona “Ver piezas”."
                : "Selecciona marca y modelo para comenzar."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
                >
                  <div className="text-base font-extrabold leading-tight">
                    {p.name}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs rounded-full bg-white/10 border border-white/10 px-3 py-1">
                      SKU: <b>{p.sku}</b>
                    </span>
                    <span className="text-xs rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-orange-200">
                      No. parte: <b className="text-orange-100">{p.part_number || "-"}</b>
                    </span>
                  </div>

                  {p.categories && (
                    <div className="mt-3 text-xs text-white/60">
                      Categoría: {p.categories.split(",")[0]}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-white/60">
                    Vehículo: {p.marca} {p.modelo}
                  </div>

                  <a
                    href={waLink(p)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block text-center rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold py-3"
                  >
                    Cotizar por WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-xs text-white/40">
          Auto Eléctrica RB • Catálogo en línea
        </div>
      </div>
    </main>
  );
}
