import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { PROCESSO } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

export function Processo() {
  return (
    <section
      id={ANCORAS.processo.slice(1)}
      className="field-plate-2 section"
      aria-labelledby="processo-t"
    >
      <div className="shell">
        <CabecalhoSeccao
          credito={PROCESSO.credito}
          titulo={PROCESSO.titulo}
          tituloId="processo-t"
          lede={PROCESSO.lede}
        />

        <ol className="mt-[var(--s-lg)] grid gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-4">
          {PROCESSO.passos.map((passo, i) => (
            <Reveal as="li" key={passo.titulo} delay={i * 90}>
              <div
                className="pt-[var(--s-sm)]"
                style={{ borderTop: "2px solid var(--color-line-strong)" }}
              >
                <span className="figure" style={{ fontSize: "var(--t-label)" }}>
                  Passo {i + 1}
                </span>
                <h3 className="h3 mt-[var(--s-xs)]">{passo.titulo}</h3>
                <p className="corpo mt-[var(--s-xs)]">{passo.texto}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
