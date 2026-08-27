import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AncorasSuaves } from "@/components/ancoras-suaves";
import { CampoLuz } from "@/components/ui/campo-luz";
import { CapaFoto } from "@/components/ui/capa-foto";
import { Reveal } from "@/components/reveal";
import { TextoRealcado } from "@/components/ui/texto-realcado";
import { Paineis, type ItemPainel } from "@/components/ui/paineis";
import { PROJETOS, EMPRESA } from "@/content/site";
import { ROTAS, projetoHref } from "@/content/rotas";

export function generateStaticParams() {
  return PROJETOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projeto = PROJETOS.find((p) => p.slug === slug);
  if (!projeto) return {};
  return {
    title: projeto.titulo,
    description: projeto.resumoCurto,
    openGraph: { images: [projeto.imagem] },
  };
}

export default async function PaginaProjeto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projeto = PROJETOS.find((p) => p.slug === slug);
  if (!projeto) notFound();

  /* ⚠️ SEM `caminho()` AQUI: o site.ts ja o aplicou. Aplicar outra vez
     duplicava o prefixo do GitHub Pages e partia as imagens. */
  const outros: ItemPainel[] = PROJETOS.filter((p) => p.slug !== projeto.slug).map(
    (p) => ({
      id: p.slug,
      titulo: p.local,
      descricao: `${p.potencia.toLocaleString("pt-PT")} W · ${p.categoria}`,
      imagem: p.imagem,
      href: projetoHref(p.slug),
    }),
  );

  const ficha = [
    { rotulo: "Localização", valor: projeto.local },
    { rotulo: "Potência", valor: `${projeto.potencia.toLocaleString("pt-PT")} W` },
    { rotulo: "Painéis", valor: projeto.paineis },
    { rotulo: "Inversor", valor: projeto.inversor },
    { rotulo: "Bateria", valor: projeto.bateria ?? "Sem armazenamento" },
  ];

  const mensagem = encodeURIComponent(
    `Olá, vi a instalação de ${projeto.local} no site e queria uma proposta para algo parecido.`,
  );

  return (
    <>
      {/* a barra nasce transparente sobre a capa e pousa quando ela acaba,
          igual as paginas de servico. Por isso nao ha nav__espaco. */}
      <SiteNav />
      <AncorasSuaves />

      <main id="conteudo" tabIndex={-1}>
        <CapaFoto
          imagem={projeto.imagem}
          credito={projeto.categoria}
          titulo={projeto.titulo}
          migalhas={[
            { rotulo: "Projetos", href: ROTAS.projetos },
            { rotulo: projeto.local },
          ]}
        />

        <CampoLuz>
          <section className="field-shell section--tight" aria-label="O projeto">
            <div className="shell">
              <Reveal delay={150}>
                <TextoRealcado className="lede" texto={projeto.resumo} />
              </Reveal>
            </div>
          </section>

          {/* ⚠️ A FICHA TECNICA NAO E UM CARD. Era uma chapa branca encostada
              a direita, e uma chapa dentro de uma pagina que ja e clara nao
              acrescenta nada: le-se como uma caixa a flutuar. Aqui e a mesma
              regua cortada do bloco extra das paginas de servico, que e o
              vocabulario da casa para listas de factos. */}
          <section className="field-shell section--tight" aria-labelledby="ficha-t">
            <div className="shell">
              <Reveal>
                <h2 id="ficha-t" className="title max-w-[20ch]">
                  Ficha técnica
                </h2>
              </Reveal>

              <dl className="mt-[var(--s-md)] grid gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-3">
                {ficha.map((linha, i) => (
                  <Reveal key={linha.rotulo} delay={i * 70}>
                    <div
                      className="pt-[var(--s-sm)]"
                      style={{ borderTop: "2px solid var(--color-line-strong)" }}
                    >
                      <dt className="meta">{linha.rotulo}</dt>
                      <dd className="h3 mt-[var(--s-xs)]">{linha.valor}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </section>

          <section className="field-shell section--tight" aria-labelledby="outros-t">
            <div className="shell">
              <Reveal>
                <h2 id="outros-t" className="title">
                  Outras instalações
                </h2>
              </Reveal>
              <Reveal className="mt-[var(--s-md)]">
                <Paineis itens={outros} rotuloLista="Outras instalações" />
              </Reveal>
            </div>
          </section>

          <section className="field-deep section" aria-label="Pedir proposta">
            <div className="shell">
              <Reveal>
                <h2 className="title max-w-[22ch]">
                  Queres um sistema como este?
                </h2>
                <p className="lede mt-[var(--s-sm)]">
                  Dizes-nos o consumo e o telhado que tens, fazemos as contas e
                  apresentamos os números antes de haver qualquer decisão.
                </p>
                <div className="mt-[var(--s-md)] flex flex-wrap gap-[var(--s-sm)]">
                  <a
                    className="btn"
                    href={`https://wa.me/${EMPRESA.whatsapp}?text=${mensagem}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar por WhatsApp
                  </a>
                  <a className="btn btn--contorno" href={ROTAS.contacto}>
                    Preencher o formulário
                  </a>
                </div>
              </Reveal>
            </div>
          </section>
        </CampoLuz>
      </main>

      <SiteFooter />
    </>
  );
}
