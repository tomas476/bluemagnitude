import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { SOBRE, EMPRESA } from "@/content/site";
import { ROTAS } from "@/content/rotas";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Quem é a Blue Magnitude: missão, visão, equipa e os padrões de qualidade e segurança com que trabalhamos em Leiria, Santarém e Lisboa.",
};

export default function Sobre() {
  return (
    <PaginaInterior
      credito={SOBRE.credito}
      titulo={SOBRE.titulo}
      migalhas={[{ rotulo: "Sobre nós" }]}
    >
      <section className="field-shell section" aria-label="Quem somos">
        <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="grid gap-[var(--s-sm)]">
            {SOBRE.paragrafos.map((p, i) => (
              <Reveal as="p" key={i} className="corpo" delay={i * 90}>
                {p}
              </Reveal>
            ))}
          </div>

          <Reveal as="figure" delay={120}>
            <img
              src={SOBRE.imagens[0].src}
              alt={SOBRE.imagens[0].alt}
              width={1280}
              height={854}
              loading="lazy"
              decoding="async"
              className="w-full rounded-[var(--radius-plate)] object-cover"
              style={{ aspectRatio: "4 / 3" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="field-shell section--tight" aria-label="Missão e visão">
        <div className="shell grid gap-[var(--s-sm)] sm:grid-cols-2">
          {SOBRE.blocos.map((bloco, i) => (
            <Reveal key={bloco.titulo} className="plate" delay={i * 90}>
              <p className="credito">{bloco.titulo}</p>
              <h2 className="h3 mt-[var(--s-xs)]">{bloco.subtitulo}</h2>
              <p className="corpo mt-[var(--s-xs)]">{bloco.texto}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="field-shell section" aria-labelledby="qualidade-t">
        <div className="shell">
          <Reveal>
            <p className="credito">Qualidade e segurança</p>
            <h2 id="qualidade-t" className="title mt-[var(--s-xs)] max-w-[24ch]">
              {SOBRE.qualidade.titulo}
            </h2>
          </Reveal>

          <div className="mt-[var(--s-lg)] grid gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-4">
            {SOBRE.qualidade.itens.map((item, i) => (
              <Reveal key={item.titulo} delay={i * 90}>
                <div
                  className="pt-[var(--s-sm)]"
                  style={{ borderTop: "2px solid var(--color-line-strong)" }}
                >
                  <h3 className="h3">{item.titulo}</h3>
                  <p className="corpo mt-[var(--s-xs)]">{item.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-[var(--s-lg)]" delay={120}>
            <p className="corpo">
              Operações em {EMPRESA.zonas}. Sede na {EMPRESA.morada}.
            </p>
            <a className="btn mt-[var(--s-sm)]" href={ROTAS.contacto}>
              Pedir proposta
            </a>
          </Reveal>
        </div>
      </section>
    </PaginaInterior>
  );
}
