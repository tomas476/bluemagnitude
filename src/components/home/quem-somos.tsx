import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { MarcaAnimada } from "@/components/ui/marca-animada";
import { ListaLuz } from "@/components/ui/lista-luz";
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
          <Reveal className="mb-[var(--s-md)] block">
            <MarcaAnimada className="marca-animada--esquerda" />
          </Reveal>

          <CabecalhoSeccao
            titulo={QUEM_SOMOS.titulo}
            tituloId="quem-somos-t"
          />

          <ListaLuz
            className="mt-[var(--s-md)]"
            itens={QUEM_SOMOS.pilares}
            delayBase={110}
          />

          <Reveal className="mt-[var(--s-md)]" delay={240}>
            <a className="btn-quiet" href={ROTAS.sobre}>
              Conhecer a Blue Magnitude
            </a>
          </Reveal>
        </div>

        <Reveal as="figure" delay={120} className="hidden lg:block">
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
