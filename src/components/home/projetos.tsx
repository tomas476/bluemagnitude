import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { Paineis, type ItemPainel } from "@/components/ui/paineis";
import { PROJETOS } from "@/content/site";
import { ANCORAS, ROTAS, projetoHref } from "@/content/rotas";
import { caminho } from "@/lib/caminho";

export function Projetos() {
  const itens: ItemPainel[] = PROJETOS.map((p) => ({
    id: p.slug,
    titulo: p.local,
    descricao: `${p.potencia.toLocaleString("pt-PT")} W · ${p.categoria}`,
    imagem: caminho(p.imagem),
    href: projetoHref(p.slug),
  }));

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
          lede="Cinco instalações reais. Escolhe uma para ver o equipamento e a potência."
        />

        <Reveal className="mt-[var(--s-lg)]">
          <Paineis itens={itens} rotuloLista="Instalações concluídas" />
        </Reveal>

        <Reveal className="mt-[var(--s-md)]" delay={120}>
          <a className="btn-quiet" href={ROTAS.projetos}>
            Ver todos os projetos
          </a>
        </Reveal>
      </div>
    </section>
  );
}
