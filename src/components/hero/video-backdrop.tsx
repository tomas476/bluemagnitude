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
 * ⚠️ O LACO NAO USA O ATRIBUTO `loop`
 * O clipe tem 4,3 segundos, por isso o fim chega de meio em meio minuto varias
 * vezes. Com `loop`, o browser faz um `seek` ate ao zero em cada volta: o
 * descodificador e limpo, o primeiro fotograma volta a ser desenhado do nada, e
 * via-se a imagem recuar e so depois seguir. A primeira passagem era limpa
 * porque nao havia `seek` nenhum.
 *
 * A solucao e nao voltar atras: ha DOIS <video> com o mesmo ficheiro, um por
 * cima do outro. Um toca, o outro espera parado no primeiro fotograma, ja
 * descodificado. Quando faltam ~80 ms para o fim, o que esperava arranca e
 * fica a vista no mesmo fotograma em que o outro acabava; o que acabou e
 * rebobinado com o ecra todo para ele, com quatro segundos de folga. Nao ha
 * `seek` nenhum na fronteira, por isso nao ha quebra.
 *
 * O segundo <video> so e montado depois do primeiro estar a tocar, para o
 * ficheiro vir da cache e nao duplicar o download.
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
  // qual dos dois esta a vista: 0 e o primeiro, 1 e o de reserva
  const [activo, setActivo] = React.useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const reservaRef = React.useRef<HTMLVideoElement | null>(null);
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

  const prepararVideo = React.useCallback((elemento: HTMLVideoElement | null) => {
    if (!elemento) return;
    elemento.muted = true;
    elemento.defaultMuted = true;
    elemento.setAttribute("muted", "");
  }, []);

  const guardarRef = React.useCallback(
    (elemento: HTMLVideoElement | null) => {
      videoRef.current = elemento;
      if (!elemento) return;
      prepararVideo(elemento);
      tentar();
    },
    [prepararVideo, tentar],
  );

  const guardarReserva = React.useCallback(
    (elemento: HTMLVideoElement | null) => {
      reservaRef.current = elemento;
      if (!elemento) return;
      prepararVideo(elemento);
      elemento.pause();
    },
    [prepararVideo],
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

  /* o que esta escondido fica sempre parado no primeiro fotograma, pronto a
     arrancar sem esperar por descodificacao nenhuma */
  React.useEffect(() => {
    if (!aTocar) return;
    const escondido = activo === 0 ? reservaRef.current : videoRef.current;
    if (!escondido) return;
    escondido.pause();
    try {
      escondido.currentTime = 0;
    } catch {
      /* um seek antes dos metadados chegarem atira; na proxima volta ja vai */
    }
  }, [activo, aTocar]);

  /* a vigia da fronteira: ~80 ms antes do fim passa a vez ao outro */
  React.useEffect(() => {
    if (!aTocar) return;
    const emCena = activo === 0 ? videoRef.current : reservaRef.current;
    const seguinte = activo === 0 ? reservaRef.current : videoRef.current;
    if (!emCena) return;

    let parado = false;
    let temporizador: number | null = null;
    let fotograma: number | null = null;
    const MARGEM = 0.08;

    function trocar() {
      if (parado) return;
      parado = true;
      if (!seguinte) {
        // sem reserva montada, o laco simples serve de rede
        if (emCena) {
          emCena.currentTime = 0;
          void emCena.play().catch(() => {});
        }
        return;
      }
      seguinte.currentTime = 0;
      void seguinte.play().catch(() => {});
      setActivo((anterior) => (anterior === 0 ? 1 : 0));
    }

    function vigiar() {
      if (parado || !emCena) return;
      const total = emCena.duration;
      if (Number.isFinite(total) && total > 0 && total - emCena.currentTime <= MARGEM) {
        trocar();
        return;
      }
      agendar();
    }

    function agendar() {
      if (parado || !emCena) return;
      const comFotograma = emCena as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
        cancelVideoFrameCallback?: (id: number) => void;
      };
      if (typeof comFotograma.requestVideoFrameCallback === "function") {
        fotograma = comFotograma.requestVideoFrameCallback(vigiar);
      } else {
        temporizador = window.setTimeout(vigiar, 40);
      }
    }

    agendar();
    // rede de seguranca: se a vigia falhar o instante, o `ended` troca na mesma
    emCena.addEventListener("ended", trocar);

    return () => {
      parado = true;
      emCena.removeEventListener("ended", trocar);
      if (temporizador !== null) window.clearTimeout(temporizador);
      const comFotograma = emCena as HTMLVideoElement & {
        cancelVideoFrameCallback?: (id: number) => void;
      };
      if (fotograma !== null && typeof comFotograma.cancelVideoFrameCallback === "function") {
        comFotograma.cancelVideoFrameCallback(fotograma);
      }
    };
  }, [activo, aTocar]);

  const mostrarVideo = Boolean(fonte) && !desistiu;

  /* ⚠️ SEM TRANSICAO DE OPACIDADE NOS VIDEOS. Uma transicao aqui viraria a
     troca do laco num fade cruzado entre o ultimo e o primeiro fotograma, que
     e exactamente a quebra que se quer tirar. Quem faz o aparecimento suave e
     o poster, que se apaga por baixo. */
  const classeVideo = "absolute inset-0 h-full w-full object-cover";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img
        src={posterActivo}
        alt={descricao}
        className={
          aTocar
            ? "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
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
          className={classeVideo}
          style={{ objectPosition, opacity: aTocar && activo === 0 ? 1 : 0 }}
          src={fonte ?? undefined}
          poster={posterActivo}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setATocar(true)}
        />
      ) : null}

      {mostrarVideo && aTocar ? (
        /* o de reserva. Nasce so depois do primeiro estar a tocar, para o
           ficheiro vir da cache do browser em vez de ser pedido outra vez. */
        <video
          ref={guardarReserva}
          className={classeVideo}
          style={{ objectPosition, opacity: activo === 1 ? 1 : 0 }}
          src={fonte ?? undefined}
          poster={posterActivo}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
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

      {/* 3. sombra no topo, para a barra pousar enquanto esta transparente.
          ⚠️ 10rem DE ALTURA E O QUE A SENTINELA DA NAVBAR MEDE (site-nav.tsx).
          Se esta altura mudar, a sentinela muda com ela, senao a barra anda
          transparente por cima de fundo claro e desaparece. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(11,20,55,.55)] to-transparent" />

      {/* 4. grao de pelicula */}
      <div className="grain" />
    </div>
  );
}
