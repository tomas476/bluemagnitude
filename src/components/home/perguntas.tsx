import { Acordeoes } from "@/components/ui/acordeao";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { PERGUNTAS } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

export function Perguntas() {
  return (
    <section
      id={ANCORAS.perguntas.slice(1)}
      className="field-shell section"
      aria-labelledby="perguntas-t"
    >
      <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <CabecalhoSeccao
          credito={PERGUNTAS.credito}
          titulo={PERGUNTAS.titulo}
          tituloId="perguntas-t"
        />
        <Acordeoes itens={PERGUNTAS.itens} />
      </div>
    </section>
  );
}
