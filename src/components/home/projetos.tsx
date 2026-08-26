import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { PROJETOS } from "@/content/site";
import { ANCORAS, ROTAS, projetoHref } from "@/content/rotas";

export function Projetos() {
  return (
    <section
      id={ANCORAS.projetos.slice(1)}
      className="field-shell section"
      aria-labelledby="projetos-t"
    >
      <div className="shell">
        <CabecalhoSeccao
          credito="Instalações"
          titulo="Sistemas que já estão a produzir"
          tituloId="projetos-t"
          lede="Cinco instalações reais, com o equipamento e a potência de cada uma."
        />

        <div className="mt-[var(--s-lg)] grid gap-[var(--s-lg)] sm:gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="mt-[var(--s-sm)]">
                  <span className="capsula figure">
                    {p.potencia.toLocaleString("pt-PT")} W
                  </span>
                </div>
                <h3 className="h3 mt-[var(--s-xs)]">{p.local}</h3>
                <p className="meta mt-[2px]">{p.categoria}</p>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-[var(--s-md)]" delay={120}>
          <a className="btn-quiet" href={ROTAS.projetos}>
            Ver todos os projetos
          </a>
        </Reveal>
      </div>
    </section>
  );
}
