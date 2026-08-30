import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { ListaEditorial } from "@/components/ui/lista-editorial";
import { SERVICOS } from "@/content/site";
import { servicoHref } from "@/content/rotas";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Autoconsumo, autoconsumo com baterias, sistemas off-grid, AVAC e climatização, manutenção e consultoria em sistemas fotovoltaicos.",
};

export default function Servicos() {
  const linhas = SERVICOS.map((s, i) => ({
    id: s.slug,
    indice: String(i + 1).padStart(2, "0"),
    nome: s.nome,
    // a coluna curta de acento: os dois primeiros ganhos do servico
    mini: s.lista.slice(0, 3).map((item) => item.titulo),
    imagem: s.imagem,
    imagemAlt: s.imagemAlt,
    href: servicoHref(s.slug),
  }));

  return (
    <PaginaInterior
      credito="Serviços"
      titulo="Serviços"
      gigante
      fita="desce"
      lede="Instalamos, legalizamos e mantemos. A mesma equipa do princípio ao fim."
      migalhas={[{ rotulo: "Serviços" }]}
    >
      <section className="field-shell section--tight" aria-label="Lista de serviços">
        <div style={{ paddingBottom: "var(--s-xl)" }}>
          <ListaEditorial linhas={linhas} accao="Ver serviço" />
        </div>
      </section>
    </PaginaInterior>
  );
}
