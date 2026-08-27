import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { TituloTeclado } from "@/components/ui/titulo-teclado";
import { ListaLuz } from "@/components/ui/lista-luz";
import { SERVICOS, EMPRESA } from "@/content/site";
import { ROTAS } from "@/content/rotas";

export function generateStaticParams() {
  return SERVICOS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servico = SERVICOS.find((s) => s.slug === slug);
  if (!servico) return {};
  return {
    title: servico.nome,
    description: servico.resumo,
    openGraph: { images: [servico.imagem] },
  };
}

export default async function PaginaServico({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servico = SERVICOS.find((s) => s.slug === slug);
  if (!servico) notFound();

  const mensagem = encodeURIComponent(
    `Olá, queria uma proposta para ${servico.nome.toLowerCase()}.`,
  );

  return (
    <PaginaInterior
      credito={servico.credito}
      titulo={servico.titulo}
      tituloTeclado
      migalhas={[
        { rotulo: "Serviços", href: ROTAS.servicos },
        { rotulo: servico.nome },
      ]}
    >
      <section className="field-shell section" aria-label="O serviço">
        <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal as="p" className="corpo" delay={200}>
            {servico.intro}
          </Reveal>
          <Reveal as="figure" delay={300}>
            <img
              src={servico.imagem}
              alt={servico.imagemAlt}
              width={890}
              height={600}
              loading="lazy"
              decoding="async"
              className="w-full rounded-[var(--radius-plate)] object-cover"
              style={{ aspectRatio: "4 / 3" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="field-shell section--tight" aria-labelledby="ganhos-t">
        <div className="shell">
          <Reveal>
            <h2 id="ganhos-t" className="title max-w-[24ch]">
              {servico.listaTitulo}
            </h2>
          </Reveal>
          <ListaLuz
            className="mt-[var(--s-md)]"
            itens={servico.lista}
            variante="icone"
            delayBase={90}
          />
        </div>
      </section>

      {servico.extra && servico.extraTitulo ? (
        <section className="field-shell section" aria-labelledby="extra-t">
          <div className="shell">
            <Reveal>
              <h2 id="extra-t" className="title max-w-[24ch]">
                {servico.extraTitulo}
              </h2>
            </Reveal>
            <ol className="mt-[var(--s-md)] grid gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-3">
              {servico.extra.map((item, i) => (
                <Reveal as="li" key={item.titulo} delay={i * 90}>
                  <div
                    className="pt-[var(--s-sm)]"
                    style={{ borderTop: "2px solid var(--color-line-strong)" }}
                  >
                    <h3 className="h3">{item.titulo}</h3>
                    {item.texto ? (
                      <p className="corpo mt-[var(--s-xs)]">{item.texto}</p>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="field-deep section" aria-label="Pedir proposta">
        <div className="shell">
          <Reveal>
            <h2 className="title max-w-[22ch]">Pede a tua proposta gratuita</h2>
            <p className="lede mt-[var(--s-sm)]">
              Dizes-nos o que precisas, fazemos as contas e apresentamos os
              números antes de haver qualquer decisão.
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
    </PaginaInterior>
  );
}
