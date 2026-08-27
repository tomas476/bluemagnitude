import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AncorasSuaves } from "@/components/ancoras-suaves";
import { CampoLuz } from "@/components/ui/campo-luz";
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
    <>
      {/* a barra nasce transparente sobre a capa e pousa quando ela acaba,
          exactamente como na homepage */}
      <SiteNav />
      <AncorasSuaves />

      <main id="conteudo" tabIndex={-1}>
        {/* A CAPA: a fotografia do servico e o hero da pagina, com o mesmo
            sistema de blend do heroi principal: tinta base, subida do fundo
            ate --color-shell cheio, e a lavagem verde espelhada do CampoLuz
            para a emenda nao existir. */}
        <section className="relative isolate flex min-h-[62svh] flex-col justify-end overflow-hidden lg:min-h-[72svh]">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src={servico.imagem}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
            <div
              className="absolute inset-0 bg-shell"
              style={{ opacity: 0.22 }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-shell via-shell/85 to-transparent" />
            <div
              className="absolute inset-x-0 bottom-0 h-[60%]"
              style={{
                backgroundImage:
                  "radial-gradient(140% 120vh at 50% 100%, rgba(132,200,133,0.10), rgba(132,200,133,0) 82%)",
              }}
            />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(11,20,55,.55)] to-transparent" />
            <div className="grain" />
          </div>

          <div
            className="shell relative z-10 w-full"
            style={{
              paddingBottom: "calc(var(--s-lg) + var(--safe-b))",
              paddingTop: "calc(var(--s-xl) + var(--safe-t))",
            }}
          >
            <nav aria-label="Caminho" className="meta rise [animation-delay:20ms]">
              <a href={ROTAS.home}>Início</a> ›{" "}
              <a href={ROTAS.servicos}>Serviços</a> › {servico.nome}
            </nav>

            <p className="credito rise mt-[var(--s-xs)] [animation-delay:60ms]">
              {servico.credito}
            </p>

            <TituloTeclado
              texto={servico.titulo}
              className="display rise mt-[var(--s-xs)] max-w-[18ch] [animation-delay:120ms]"
            />
          </div>
        </section>

        <CampoLuz>
          <section className="field-shell section--tight" aria-label="O serviço">
            <div className="shell">
              <Reveal as="p" className="corpo" delay={150}>
                {servico.intro}
              </Reveal>
            </div>
          </section>

          <section className="field-shell section--tight" aria-labelledby="ganhos-t">
            <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <Reveal>
                <h2 id="ganhos-t" className="title max-w-[20ch]">
                  {servico.listaTitulo}
                </h2>
              </Reveal>
              <ListaLuz itens={servico.lista} variante="icone" delayBase={90} />
            </div>
          </section>

          {servico.extra && servico.extraTitulo ? (
            <section className="field-shell section--tight" aria-labelledby="extra-t">
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
        </CampoLuz>
      </main>

      <SiteFooter />
    </>
  );
}
