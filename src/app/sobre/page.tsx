import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AncorasSuaves } from "@/components/ancoras-suaves";
import { CampoLuz } from "@/components/ui/campo-luz";
import { Reveal } from "@/components/reveal";
import { MarcaAnimada } from "@/components/ui/marca-animada";
import { ArranqueAnimado } from "@/components/ui/arranque-animado";
import { Passos } from "@/components/ui/passos";
import { TituloTeclado } from "@/components/ui/titulo-teclado";
import { ListaLuz } from "@/components/ui/lista-luz";
import { ARRANQUE, SOBRE, EMPRESA } from "@/content/site";
import { ROTAS } from "@/content/rotas";
import { caminho } from "@/lib/caminho";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Quem é a Blue Magnitude: o que fazemos, onde operamos e os padrões de qualidade e segurança com que trabalhamos em Leiria, Santarém e Lisboa.",
};

export default function Sobre() {
  return (
    <>
      <SiteNav pousadaSempre />
      <AncorasSuaves />
      <div className="nav__espaco" />

      <main id="conteudo" tabIndex={-1}>
        {/* ARRANQUE, a referencia do Tomas: fundo claro, a fita verde com os
            cartoes (ilustracao gerada a partir da referencia dele) e o titulo
            no canto superior esquerdo, que a imagem deixa livre. */}
        <section className="arranque section--tight" aria-labelledby="arranque-t">
          <ArranqueAnimado />

          <div className="shell w-full" style={{ paddingBlock: "var(--s-sm)" }}>
            <nav aria-label="Caminho" className="meta">
              <a href={ROTAS.home}>Início</a> › Sobre nós
            </nav>

            <div className="max-w-[30rem]">
              <Reveal className="mt-[var(--s-xs)]">
                <p className="credito">{ARRANQUE.credito}</p>
                {/* o claim deles, e mais nada: a ilustracao fala pelo resto */}
                <h1
                  id="arranque-t"
                  className="display mt-[var(--s-xs)] max-w-[13ch]"
                  style={{
                    fontSize: "clamp(2.125rem, 1.4rem + 2.4vw, 3.5rem)",
                  }}
                >
                  {ARRANQUE.titulo}
                </h1>
              </Reveal>

              <Reveal className="mt-[var(--s-md)]" delay={160}>
                <a className="btn" href={ROTAS.contacto}>
                  Falar connosco
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* a faixa escura de numeros, como a "by the stats" da referencia.
            So numeros verificaveis, com a legenda a dizer o que cada um conta. */}
        <section className="field-deep section--tight" aria-labelledby="numeros-t">
          <div className="shell">
            <Reveal>
              <h2 id="numeros-t" className="title text-center">
                A Blue Magnitude em{" "}
                <span style={{ color: "var(--color-accent)" }}>números</span>
              </h2>
            </Reveal>
            <div className="numeros mt-[var(--s-lg)]">
              {ARRANQUE.numeros.map((n, i) => (
                <Reveal key={n.rotulo} delay={i * 90} className="text-center">
                  <p className="numeros__valor">{n.valor}</p>
                  <p className="meta mt-[var(--s-xs)]">{n.rotulo}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <CampoLuz>
          <section className="sobre__historia field-shell section" aria-label="Quem somos">
            <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <Reveal as="figure" className="sobre__foto lg:sticky lg:top-24">
                {/* fotografia REAL deles, da pagina de autoconsumo do site
                    actual. Nada de fotos inventadas. */}
                <img
                  src={caminho("/projetos/instalacao-autoconsumo.jpg")}
                  alt="Instalação de autoconsumo feita pela Blue Magnitude."
                  width={570}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover"
                />
              </Reveal>

              <div className="sobre__texto">
                <Reveal>
                  <p className="credito">{SOBRE.credito}</p>
                  <TituloTeclado
                    as="h2"
                    aoEntrar
                    texto={SOBRE.titulo}
                    className="title mt-[var(--s-xs)] max-w-[22ch]"
                  />
                </Reveal>

                {/* os quatro pilares na forma dos passos do "Como
                    trabalhamos": regua cortada e linha que se desenha, em vez
                    de quatro chapas empilhadas */}
                <Passos
                  className="mt-[var(--s-md)]"
                  colunas={2}
                  passos={SOBRE.blocos.map((bloco) => ({
                    rotulo: bloco.titulo,
                    titulo: bloco.subtitulo,
                    texto: bloco.texto,
                    icone: bloco.icone,
                  }))}
                />
              </div>
            </div>
          </section>

          <section className="field-shell section--tight" aria-labelledby="qualidade-t">
            <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <Reveal>
                  <MarcaAnimada tamanho="pequena" />
                </Reveal>
                <Reveal className="mt-[var(--s-sm)]" delay={90}>
                  <p className="credito">Qualidade e segurança</p>
                  <h2 id="qualidade-t" className="title mt-[var(--s-xs)] max-w-[22ch]">
                    {SOBRE.qualidade.titulo}
                  </h2>
                </Reveal>
              </div>

              <ListaLuz itens={SOBRE.qualidade.itens} variante="icone" />
            </div>
          </section>

          <section className="field-shell section--tight" aria-label="Falar connosco">
            <div className="shell">
              <Reveal>
                <p className="corpo">
                  Operações em {EMPRESA.zonas}. Sede na {EMPRESA.morada}.
                </p>
                <a className="btn mt-[var(--s-sm)]" href={ROTAS.contacto}>
                  Pedir proposta
                </a>
              </Reveal>
            </div>
          </section>
        </CampoLuz>
      </main>

      <SiteFooter />
    </>
  );
}
