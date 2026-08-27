"use client";

import * as React from "react";
import { movimentoReduzido, prefersLightweight } from "@/lib/lightweight";

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
 * callback do ref ANTES de tudo.
 *
 * ⚠️ O QUE ACONTECE QUANDO O SISTEMA RECUSA
 * Num iPhone em poupanca de bateria o Safari recusa o autoplay e desenha o SEU
 * botao de play por cima do video. Um rectangulo parado com um controlo do
 * sistema ao meio e pior do que uma fotografia, por isso quando o play() e
 * recusado o <video> e DESMONTADO e fica so o poster a respirar.
 *
 * Antes de desistir tenta-se outra vez em dois momentos que costumam
 * desbloquear: o primeiro toque no documento e o regresso do separador a
 * visivel. Uma vez cada, sem listeners pendurados.
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
  const [desistiu, setDesistiu] = React.useState(false);
  const [posterActivo, setPosterActivo] = React.useState(poster);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const tentativas = React.useRef(0);

  React.useEffect(() => {
    const estreito = window.matchMedia("(max-width: 768px)").matches;
    setPosterActivo(estreito ? posterEstreito : poster);
    if (prefersLightweight() || movimentoReduzido()) return;
    setFonte(estreito ? fontes.estreito : fontes.largo);
  }, [fontes.estreito, fontes.largo, poster, posterEstreito]);

  const tentar = React.useCallback(() => {
    const elemento = videoRef.current;
    if (!elemento) return;
    const promessa = elemento.play();
    if (!promessa || typeof promessa.catch !== "function") return;
    promessa.catch(() => {
      tentativas.current += 1;
      // duas recusas seguidas: o sistema nao vai deixar. Fica o poster.
      if (tentativas.current >= 3) setDesistiu(true);
    });
  }, []);

  const guardarRef = React.useCallback(
    (elemento: HTMLVideoElement | null) => {
      videoRef.current = elemento;
      if (!elemento) return;
      elemento.muted = true;
      elemento.defaultMuted = true;
      elemento.setAttribute("muted", "");
      tentar();
    },
    [tentar],
  );

  React.useEffect(() => {
    if (!fonte || aTocar || desistiu) return;

    const aoTocarNoEcra = () => tentar();
    const aoVoltar = () => {
      if (document.visibilityState === "visible") tentar();
    };

    document.addEventListener("touchstart", aoTocarNoEcra, { once: true, passive: true });
    document.addEventListener("click", aoTocarNoEcra, { once: true });
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      document.removeEventListener("touchstart", aoTocarNoEcra);
      document.removeEventListener("click", aoTocarNoEcra);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [fonte, aTocar, desistiu, tentar]);

  const mostrarVideo = Boolean(fonte) && !desistiu;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img
        src={posterActivo}
        alt={descricao}
        className={
          aTocar
            ? "absolute inset-0 h-full w-full object-cover opacity-0"
            : "hero-respira absolute inset-0 h-full w-full object-cover"
        }
        style={{ objectPosition }}
        fetchPriority="high"
        decoding="async"
      />

      {mostrarVideo ? (
        /* ⚠️ opacity 0 ate ao onPlaying: um <video> pausado no iOS desenha o
           botao de play DO SISTEMA por cima. Invisivel, nao desenha nada, e o
           poster fica a respirar ate o play() vingar. */
        <video
          ref={guardarRef}
          className={
            aTocar
              ? "absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500"
              : "absolute inset-0 h-full w-full object-cover opacity-0"
          }
          style={{ objectPosition }}
          src={fonte ?? undefined}
          poster={posterActivo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setATocar(true)}
        />
      ) : null}

      {/* 1. tinta base uniforme */}
      <div
        className="absolute inset-0 bg-shell"
        style={{ opacity: "var(--scrim)" }}
      />

      {/* 2. subida do fundo: o ultimo pixel do heroi e --color-shell cheio.
          ⚠️ A ALTURA E O MEIO-TERMO SAO OS UNICOS NUMEROS DO BLEND QUE SE PODEM
          MEXER SOZINHOS: esta camada nao tem espelho no CampoLuz (a contraparte
          dela e a chapa lisa do .campo-luz). Desceu de 64% para 46% e de 85%
          para 72% porque a lavagem comia metade do video. A camada 2b, essa,
          continua atada ao campo-luz. */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-shell via-shell/72 to-transparent" />

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
