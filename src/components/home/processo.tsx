import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { Passos } from "@/components/ui/passos";
import { PROCESSO } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

/** A seccao entrega o conteudo; a forma dos passos vive em ui/passos.tsx. */
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

        <Passos
          className="mt-[calc(var(--s-lg)+var(--s-sm))]"
          passos={PROCESSO.passos.map((passo, i) => ({
            ...passo,
            rotulo: `Passo ${i + 1}`,
          }))}
        />
      </div>
    </section>
  );
}
