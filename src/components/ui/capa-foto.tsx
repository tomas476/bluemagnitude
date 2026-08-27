import type { ReactNode } from "react";
import { TituloTeclado } from "@/components/ui/titulo-teclado";
import { ROTAS } from "@/content/rotas";

type Migalha = { rotulo: string; href?: string };

/**
 * A CAPA FOTOGRAFICA das paginas interiores que tem fotografia a serio: os
 * servicos e as fichas de projeto.
 *
 * ⚠️ SEIS CAMADAS, E A ORDEM DELAS E O EFEITO. Foto, tinta base para a lavar
 * ate a cor do site, subida do fundo para o ultimo pixel ser `--color-shell`
 * cheio, lavagem verde, vinheta no topo para a navbar transparente ter
 * contraste, e grao.
 *
 * ⚠️ A LAVAGEM VERDE E O ESPELHO EXACTO do primeiro gradiente do
 * `.campo-luz__luz` (mesma elipse, mesma percentagem, ancorada em baixo em vez
 * de em cima). E essa igualdade que faz a emenda capa/conteudo desaparecer.
 * Mudar um sem o outro desenha uma risca horizontal a toda a largura.
 *
 * ⚠️ QUEM USA ISTO NAO PODE POR `nav__espaco` NEM `SiteNav pousadaSempre`: a
 * capa passa POR BAIXO da barra, e e a barra que pousa quando a capa acaba.
 */
export function CapaFoto({
  imagem,
  credito,
  titulo,
  migalhas = [],
  abaixo,
}: {
  imagem: string;
  credito: string;
  titulo: string;
  migalhas?: ReadonlyArray<Migalha>;
  /** o que vier a seguir ao titulo, dentro da capa */
  abaixo?: ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-[62svh] flex-col justify-end overflow-hidden lg:min-h-[72svh]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src={imagem}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-shell" style={{ opacity: 0.22 }} />
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
          <a href={ROTAS.home}>Início</a>
          {migalhas.map((m) => (
            <span key={m.rotulo}>
              {" › "}
              {m.href ? <a href={m.href}>{m.rotulo}</a> : m.rotulo}
            </span>
          ))}
        </nav>

        <p className="credito rise mt-[var(--s-xs)] [animation-delay:60ms]">
          {credito}
        </p>

        <TituloTeclado
          texto={titulo}
          className="display rise mt-[var(--s-xs)] max-w-[18ch] [animation-delay:120ms]"
        />

        {abaixo}
      </div>
    </section>
  );
}
