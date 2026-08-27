import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { Paineis, type ItemPainel } from "@/components/ui/paineis";
import { PROJETOS } from "@/content/site";
import { ROTAS, projetoHref } from "@/content/rotas";
import { caminho } from "@/lib/caminho";

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

  const outros: ItemPainel[] = PROJETOS.filter((p) => p.slug !== projeto.slug).map(
    (p) => ({
      id: p.slug,
      titulo: p.local,
      descricao: `${p.potencia.toLocaleString("pt-PT")} W · ${p.categoria}`,
      imagem: caminho(p.imagem),
      href: projetoHref(p.slug),
    }),
  );

  const specs = [
    { rotulo: "Localização", valor: projeto.local },
    { rotulo: "Painéis", valor: projeto.paineis },
    { rotulo: "Potência", valor: `${projeto.potencia.toLocaleString("pt-PT")} W` },
    { rotulo: "Inversor", valor: projeto.inversor },
    { rotulo: "Bateria", valor: projeto.bateria ?? "Sem armazenamento" },
  ];

  return (
    <PaginaInterior
      credito={projeto.categoria}
      titulo={projeto.titulo}
      lede={projeto.resumoCurto}
      migalhas={[
        { rotulo: "Projetos", href: ROTAS.projetos },
        { rotulo: projeto.local },
      ]}
    >
      <section className="field-shell section--tight" aria-label="Fotografia">
        <div className="shell">
          <Reveal as="figure">
            <img
              src={projeto.imagem}
              alt={projeto.imagemAlt}
              width={1920}
              height={1080}
              decoding="async"
              className="w-full rounded-[var(--radius-plate)] object-cover"
              style={{ aspectRatio: "16 / 9" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="field-shell section" aria-labelledby="ficha-t">
        <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <Reveal>
              <h2 id="ficha-t" className="title max-w-[24ch]">
                Resumo do projeto
              </h2>
            </Reveal>
            <div className="mt-[var(--s-md)] grid gap-[var(--s-sm)]">
              {projeto.resumo.map((p, i) => (
                <Reveal as="p" key={i} className="corpo" delay={i * 90}>
                  {p}
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="plate plate--lit" delay={90}>
            <p className="credito">Ficha técnica</p>
            <dl className="mt-[var(--s-sm)] grid gap-[var(--s-sm)]">
              {specs.map((spec) => (
                <div
                  key={spec.rotulo}
                  className="grid gap-[2px] pt-[var(--s-xs)]"
                  style={{ borderTop: "1px solid var(--color-line)" }}
                >
                  <dt className="meta">{spec.rotulo}</dt>
                  <dd className="corpo" style={{ fontWeight: 600 }}>
                    {spec.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
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
    </PaginaInterior>
  );
}
