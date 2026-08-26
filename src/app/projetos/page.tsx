import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { PROJETOS } from "@/content/site";
import { projetoHref } from "@/content/rotas";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Instalações fotovoltaicas concluídas pela Blue Magnitude, com painéis, potência, inversor e bateria de cada sistema.",
};

export default function Projetos() {
  return (
    <PaginaInterior
      credito="Projetos"
      titulo="Sistemas que já estão a produzir"
      lede="Cada ficha traz o equipamento e a potência instalada."
      migalhas={[{ rotulo: "Projetos" }]}
    >
      <section className="field-shell section" aria-label="Lista de projetos">
        <div className="shell grid gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-3">
          {PROJETOS.map((p, i) => (
            <Reveal as="article" key={p.slug} delay={i * 90}>
              <a href={projetoHref(p.slug)} className="block h-full">
                <div className="overflow-hidden rounded-[var(--radius-plate)]">
                  <img
                    src={p.imagem}
                    alt={p.imagemAlt}
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-cover"
                    style={{ aspectRatio: "16 / 10" }}
                  />
                </div>
                <div className="mt-[var(--s-sm)] flex items-center gap-[var(--s-xs)]">
                  <span className="capsula figure">
                    {p.potencia.toLocaleString("pt-PT")} W
                  </span>
                  <span className="meta">{p.local}</span>
                </div>
                <h2 className="h3 mt-[var(--s-xs)]">{p.titulo}</h2>
                <p className="corpo mt-[var(--s-xs)]">{p.resumoCurto}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </PaginaInterior>
  );
}
