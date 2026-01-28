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

const WHATSAPP_PHONE = "5216271071855"; // ✅ tu número

function uniqSorted(arr: string[]) {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
}

function waLinkGeneral(marca: string, modelo: string, categoria: string) {
  const msg =
    `Hola, vengo del catálogo de Auto Eléctrica RB.\n\n` +
    `Busco piezas para:\n` +
    `Marca: ${marca || "-"}\n` +
    `Modelo: ${modelo || "-"}\n` +
    `Categoría: ${categoria || "Todas"}\n\n` +
    `¿Me puedes apoyar?`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

function waLinkPart(p: Part) {
  const msg =
    `Hola, me interesa esta pieza:\n\n` +
    `Producto: ${p.name}\n` +
    `SKU: ${p.sku}\n` +
    `No. de parte: ${p.part_number ?? "-"}\n` +
    `Vehículo: ${(p.marca ?? "")} ${(p.modelo ?? "")}\n\n` +
    `¿Me confirmas precio y disponibilidad?`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 grid place-items-center">
        <div className="relative h-7 w-7 rounded-xl bg-orange-500 grid place-items-center shadow-sm">
          <span className="text-[10px] font-extrabold text-black tracking-wide">RB</span>
          <svg className="absolute -right-2 -top-2 h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z" fill="black" opacity="0.9" />
          </svg>
        </div>
      </div>

      <div className="leading-tight">
        <div className="text-base font-extrabold">Auto Eléctrica RB</div>
        <div className="text-[11px] text-white/60">Catálogo vehicular</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"filters" | "results">("filters");

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [categoria, setCategoria] = useState("");

  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelos, setModelos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRight = useMemo(() => {
    if (marca && modelo && categoria) return `${marca} • ${modelo} • ${categoria}`;
    if (marca && modelo) return `${marca} • ${modelo}`;
    return "Selecciona tu vehículo";
  }, [marca, modelo, categoria]);

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

  // 2) Cambia marca -> carga modelos
  useEffect(() => {
    (async () => {
      setModelo("");
      setCategoria("");
      setModelos([]);
      setCategorias([]);
      setParts([]);
      setError(null);

      if (!marca) return;

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

  // 3) Cambia modelo -> carga categorías
  useEffect(() => {
    (async () => {
      setCategoria("");
      setCategorias([]);
      setParts([]);
      setError(null);

      if (!marca || !modelo) return;

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

    if (categoria) q = q.ilike("categories", `%${categoria}%`);

    const { data, error } = await q;

    if (error) {
      setError(error.message);
      setParts([]);
      setLoading(false);
      return;
    }

    setParts((data ?? []) as Part[]);
    setLoading(false);
    setScreen("results");
    // “feel app”: scroll arriba al entrar a resultados
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToFilters() {
    setScreen("filters");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header fijo tipo app */}
      <header className="sticky top-0 z-50 bg-gray-950/85 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {screen === "results" ? (
              <button
                onClick={backToFilters}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                aria-label="Volver"
                title="Volver"
              >
                {/* Flecha */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div className="hidden sm:block">
                <Logo />
              </div>
            )}

            <div className="sm:hidden">
              <div className="text-sm font-extrabold">Auto Eléctrica RB</div>
              <div className="text-[11px] text-white/60">{screen === "results" ? "Resultados" : "Selecciona vehículo"}</div>
            </div>
          </div>

          <div className="min-w-0 text-right">
            <div className="text-xs text-white/60 truncate">{titleRight}</div>
            <div className="text-[11px] text-white/40">
              {screen === "results" ? `${parts.length} resultados` : "Filtros"}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 pb-24">
        {/* Pantalla 1: filtros */}
        {screen === "filters" && (
          <section className="animate-in">
            <div className="mt-2 hidden sm:block">
              <Logo />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
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
                  <option value="">{!marca ? "Elige una marca primero" : "Selecciona modelo"}</option>
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
                  <option value="">{!marca || !modelo ? "Elige marca y modelo" : "Todas"}</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
                Error: {error}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={buscar}
                disabled={!marca || !modelo || loading}
                className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-4 disabled:opacity-40 transition"
              >
                {loading ? "Cargando..." : "Ver piezas"}
              </button>

              <div className="mt-2 text-[11px] text-white/50">
                Tip: si no encuentras el modelo, revisa que esté cargado en tu catálogo.
              </div>
            </div>
          </section>
        )}

        {/* Pantalla 2: resultados */}
        {screen === "results" && (
          <section className="animate-in">
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
                Error: {error}
              </div>
            )}

            {parts.length === 0 ? (
              <div className="mt-6 text-white/70">
                No hay resultados. Vuelve y cambia los filtros.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      href={waLinkPart(p)}
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
          </section>
        )}
      </div>

      {/* Botón flotante WhatsApp (FAB) */}
      <a
        href={waLinkGeneral(marca, modelo, categoria)}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-black shadow-lg grid place-items-center border border-black/10"
        aria-label="WhatsApp"
        title="WhatsApp"
      >
        {/* Icono simple */}
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.37c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.36-.81-.72-1.36-1.6-1.52-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.64 1.11 2.82c.14.18 1.93 2.95 4.67 4.13.65.28 1.16.45 1.56.57.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.82-1.27.23-.62.23-1.15.16-1.27-.07-.12-.25-.2-.52-.34z" />
          <path d="M26.64 5.36A13.94 13.94 0 0 0 16.02 1C8.29 1 2 7.29 2 15.02c0 2.47.65 4.88 1.88 7.01L2 31l9.16-1.83a13.96 13.96 0 0 0 4.86.87h.01c7.73 0 14.02-6.29 14.02-14.02 0-3.75-1.46-7.28-4.1-9.66zm-10.62 22.3h-.01a11.6 11.6 0 0 1-4.4-.86l-.32-.13-5.43 1.08 1.15-5.29-.21-.34a11.63 11.63 0 0 1-1.78-6.1C5.02 8.57 10.57 3.02 16.02 3.02c3.1 0 6.02 1.21 8.21 3.4a11.53 11.53 0 0 1 3.39 8.6c0 6.45-5.25 11.64-11.6 11.64z" />
        </svg>
      </a>

      {/* Animación ligera sin librerías */}
      <style jsx global>{`
        .animate-in {
          animation: fadeUp 180ms ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}


