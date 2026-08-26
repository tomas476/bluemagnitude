import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { QUEM_SOMOS, EMPRESA } from "@/content/site";
import { ANCORAS, ROTAS } from "@/content/rotas";

export function QuemSomos() {
  return (
    <section
      id={ANCORAS.sobre.slice(1)}
      className="field-shell section"
      aria-labelledby="quem-somos-t"
    >
      <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <CabecalhoSeccao
            credito={QUEM_SOMOS.credito}
            titulo={QUEM_SOMOS.titulo}
            tituloId="quem-somos-t"
          />

          <div className="mt-[var(--s-lg)] grid gap-[var(--s-sm)]">
            {QUEM_SOMOS.paragrafos.map((p, i) => (
              <Reveal as="p" key={i} className="corpo" delay={i * 90}>
                {p}
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-[var(--s-md)]" delay={180}>
            <ul className="grid gap-[var(--s-xs)]">
              {QUEM_SOMOS.pilares.map((pilar) => (
                <li key={pilar} className="flex items-start gap-[var(--s-xs)]">
                  <svg
                    className="mt-1 flex-none"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 8.5l3.5 3.5 7.5-8"
                      stroke="var(--color-accent-ink)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="corpo">{pilar}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-[var(--s-md)]" delay={240}>
            <a className="btn-quiet" href={ROTAS.sobre}>
              Conhecer a Blue Magnitude
            </a>
          </Reveal>
        </div>

        <Reveal as="figure" delay={120}>
          <img
            src={QUEM_SOMOS.imagem}
            alt={QUEM_SOMOS.imagemAlt}
            width={768}
            height={890}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[var(--radius-plate)] object-cover"
            style={{ aspectRatio: "4 / 5" }}
          />
          <figcaption className="meta mt-[var(--s-xs)]">
            Operações em {EMPRESA.zonas}.
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
