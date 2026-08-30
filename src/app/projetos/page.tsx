import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { ListaEditorial } from "@/components/ui/lista-editorial";
import { PROJETOS } from "@/content/site";
import { projetoHref } from "@/content/rotas";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Instalações fotovoltaicas concluídas pela Blue Magnitude, com painéis, potência, inversor e bateria de cada sistema.",
};

export default function Projetos() {
  const linhas = PROJETOS.map((p, i) => ({
    id: p.slug,
    indice: String(i + 1).padStart(2, "0"),
    nome: p.local,
    mini: [
      `${p.potencia.toLocaleString("pt-PT")} W`,
      p.paineis,
      p.bateria ? "Com bateria" : "Sem bateria",
    ],
    imagem: p.imagem,
    imagemAlt: p.imagemAlt,
    href: projetoHref(p.slug),
  }));

  return (
    <PaginaInterior
      credito="Instalações"
      titulo="Projetos"
      gigante
      fita="diagonal"
      lede="Sistemas que já estão a produzir, com o equipamento de cada um."
      migalhas={[{ rotulo: "Projetos" }]}
    >
      <section className="field-shell section--tight" aria-label="Lista de projetos">
        <div style={{ paddingBottom: "var(--s-xl)" }}>
          <ListaEditorial linhas={linhas} accao="Ver ficha" />
        </div>
      </section>
    </PaginaInterior>
  );
}
