import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { SERVICOS } from "@/content/site";
import { servicoHref } from "@/content/rotas";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Autoconsumo, autoconsumo com baterias, sistemas off-grid, AVAC e climatização, manutenção e consultoria em sistemas fotovoltaicos.",
};

export default function Servicos() {
  return (
    <PaginaInterior
      credito="Serviços"
      titulo="Do painel ao ar condicionado"
      lede="Instalamos, legalizamos e mantemos. A mesma equipa do princípio ao fim."
      migalhas={[{ rotulo: "Serviços" }]}
    >
      <section className="field-shell section" aria-label="Lista de serviços">
        <div className="shell grid gap-[var(--s-md)]">
          {SERVICOS.map((s, i) => (
            <Reveal as="article" key={s.slug} delay={i * 70}>
              <a
                href={servicoHref(s.slug)}
                className="plate grid gap-[var(--s-sm)] sm:grid-cols-[0.9fr_1.1fr] sm:items-center"
              >
                <img
                  src={s.imagem}
                  alt={s.imagemAlt}
                  width={890}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-[var(--radius-plate)] object-cover"
                  style={{ aspectRatio: "16 / 10" }}
                />
                <div>
                  <h2 className="title" style={{ fontSize: "var(--t-h3)" }}>
                    {s.nome}
                  </h2>
                  <p className="corpo mt-[var(--s-xs)]">{s.resumo}</p>
                  <span className="btn-quiet mt-[var(--s-xs)]">Mais detalhes</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </PaginaInterior>
  );
}
