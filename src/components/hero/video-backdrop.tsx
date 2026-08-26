"use client";

import * as React from "react";
import { prefersLightweight } from "@/lib/lightweight";

type Props = {
  poster: string;
  posterEstreito: string;
  descricao: string;
  fontes: { largo: string; estreito: string };
  objectPosition?: string;
};

/**
 * O fundo do heroi.
 *
 * O <video> nasce visivel e no HTML servido, que e a unica forma de o Safari o
 * arrancar sozinho. muted, defaultMuted e setAttribute("muted") entram no
 * callback do ref ANTES de tudo. Se o sistema recusar o autoplay, fica o poster
 * a respirar em vez de um rectangulo parado.
 *
 * A fonte e escolhida em JS com matchMedia e vai como src unico: o atributo
 * media dentro de <video> ja nao e honrado, so o <picture> o respeita.
 */
export function VideoBackdrop({
  poster,
  posterEstreito,
  descricao,
  fontes,
  objectPosition = "center 45%",
}: Props) {
  const [fonte, setFonte] = React.useState<string | null>(null);
  const [aTocar, setATocar] = React.useState(false);
  const [posterActivo, setPosterActivo] = React.useState(poster);

  React.useEffect(() => {
    const estreito = window.matchMedia("(max-width: 768px)").matches;
    setPosterActivo(estreito ? posterEstreito : poster);
    if (prefersLightweight()) return;
    setFonte(estreito ? fontes.estreito : fontes.largo);
  }, [fontes.estreito, fontes.largo, poster, posterEstreito]);

  const guardarRef = React.useCallback((elemento: HTMLVideoElement | null) => {
    if (!elemento) return;
    elemento.muted = true;
    elemento.defaultMuted = true;
    elemento.setAttribute("muted", "");
    const promessa = elemento.play();
    if (promessa && typeof promessa.catch === "function") {
      promessa.catch(() => {
        /* o sistema recusou: fica o poster */
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img
        src={posterActivo}
        alt={descricao}
        className={aTocar ? "absolute inset-0 h-full w-full object-cover opacity-0" : "hero-respira absolute inset-0 h-full w-full object-cover"}
        style={{ objectPosition }}
        fetchPriority="high"
        decoding="async"
      />

      {fonte ? (
        <video
          ref={guardarRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
          src={fonte}
          poster={posterActivo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setATocar(true)}
        />
      ) : null}

      {/* 1. tinta base uniforme */}
      <div
        className="absolute inset-0 bg-shell"
        style={{ opacity: "var(--scrim)" }}
      />

      {/* 2. subida do fundo: o ultimo pixel do heroi e --color-shell cheio */}
      <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-shell via-shell/85 to-transparent" />

      {/* 2b. a lavagem de saida.
          ESPELHA o gradiente que o CampoLuz pinta no topo dele, ancorado em
          50% 100% e com a MESMA percentagem. E esta igualdade que faz a emenda
          desaparecer: sem ela, o heroi acaba em shell puro, o campo comeca em
          shell mais 10% de verde, e a diferenca desenha uma risca horizontal a
          toda a largura. Nao se resolve mascarando o topo do campo. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          backgroundImage:
            "radial-gradient(140% 120vh at 50% 100%, rgba(132,200,133,0.10), rgba(132,200,133,0) 82%)",
        }}
      />

      {/* 3. sombra no topo, para a barra pousar enquanto esta transparente */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(11,20,55,.55)] to-transparent" />

      {/* 4. grao de pelicula */}
      <div className="grain" />
    </div>
  );
}
