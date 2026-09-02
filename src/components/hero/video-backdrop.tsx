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
 * descodificado. Quando faltam ~100 ms para o fim manda-se o que espera
 * arrancar, e SO SE TROCA A VISTA NO PRIMEIRO FOTOGRAMA QUE ELE DESENHAR.
 * O que acabou e rebobinado escondido, com quatro segundos de folga. Nao ha
 * `seek` nenhum na fronteira, por isso nao ha quebra.
 *
 * ⚠️ PORQUE E QUE A VISTA SO TROCA NO PRIMEIRO FOTOGRAMA
 * O `play()` e assincrono. A primeira versao trocava a opacidade no mesmo
 * instante em que pedia o play, e num iPhone o video demora dezenas de
 * milissegundos a arrancar mesmo: via-se o primeiro fotograma congelado e so
 * depois e que andava. Era exactamente a travagem que se queria tirar. Agora o
 * que esta em cena continua a tocar ate o outro ter fotograma desenhado.
 *
 * ⚠️ O DE RESERVA TAMBEM LEVA `autoPlay`
 * O iOS ignora `preload="auto"`: um <video> que nunca tocou nao tem um unico
 * byte de video carregado, e o `play()` da troca teria de ir buscar o ficheiro
 * inteiro. Por isso o de reserva arranca sozinho, e no primeiro `playing` e
 * posto em pausa no zero. Fica com o descodificador quente e o ficheiro na
 * cache, e o `play()` da troca e imediato.
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
  // o de reserva ja tocou uma vez e esta estacionado no zero, pronto a entrar
  const [reservaAquecida, setReservaAquecida] = React.useState(false);
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
    },
    [prepararVideo],
  );

  /* ⚠️ SO A PRIMEIRA VEZ. O de reserva arranca sozinho so para aquecer o
     descodificador; no primeiro `playing` volta ao zero e fica em pausa, a
     espera da vez. Da segunda em diante o `playing` dele e o da troca, e ai
     nao se pode tocar: pausa-lo seria congelar o heroi, que foi exactamente o
     que aconteceu enquanto isto era so uma pausa a seco. */
  const aquecerReserva = () => {
    if (reservaAquecida) return;
    setReservaAquecida(true);
    const elemento = reservaRef.current;
    if (!elemento) return;
    elemento.pause();
    try {
      elemento.currentTime = 0;
    } catch {
      /* sem metadados ainda; a proxima passagem poe no sitio */
    }
  };

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
    // enquanto a reserva aquece nao se lhe toca: e ela que se estaciona no
    // fim do aquecimento. Parar-lha aqui era o que a impedia de carregar.
    if (activo === 0 && !reservaAquecida) return;
    const escondido = activo === 0 ? reservaRef.current : videoRef.current;
    if (!escondido) return;
    escondido.pause();
    try {
      escondido.currentTime = 0;
    } catch {
      /* um seek antes dos metadados chegarem atira; na proxima volta ja vai */
    }
  }, [activo, aTocar, reservaAquecida]);

  /* a vigia da fronteira: manda arrancar cedo, troca no primeiro fotograma */
  React.useEffect(() => {
    if (!aTocar) return;
    const talvezEmCena = activo === 0 ? videoRef.current : reservaRef.current;
    const seguinte =
      activo === 0 ? (reservaAquecida ? reservaRef.current : null) : videoRef.current;
    if (!talvezEmCena) return;
    // uma const ja estreitada: dentro das funcoes declaradas o TypeScript nao
    // arrasta o estreitamento do `if` la de cima
    const emCena: HTMLVideoElement = talvezEmCena;

    let parado = false;
    let mandado = false;
    let temporizador: number | null = null;
    let rede: number | null = null;
    let fotogramaVigia: number | null = null;
    let fotogramaEntrada: number | null = null;

    // quanto antes do fim se manda o seguinte arrancar
    const ANTECEDENCIA = 0.1;
    // se ele nao desenhar nada neste tempo, troca-se a vista na mesma
    const PACIENCIA = 300;

    type ComFotograma = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (id: number) => void;
    };

    function cortar() {
      if (parado) return;
      parado = true;
      setActivo((anterior) => (anterior === 0 ? 1 : 0));
    }

    /* sem reserva montada, ou com o play() recusado, faz-se o laco a moda
       antiga no proprio elemento. Volta a haver o solavanco, mas nunca fica
       um rectangulo parado no ecra. */
    function laco() {
      if (parado) return;
      parado = true;
      emCena.currentTime = 0;
      void emCena.play().catch(() => {});
    }

    function mandarArrancar() {
      if (mandado || parado) return;
      mandado = true;
      if (!seguinte) return;
      const promessa = seguinte.play();
      if (promessa && typeof promessa.catch === "function") {
        promessa.catch(() => {
          mandado = false;
        });
      }
      const entrada = seguinte as ComFotograma;
      if (typeof entrada.requestVideoFrameCallback === "function") {
        fotogramaEntrada = entrada.requestVideoFrameCallback(() => cortar());
      }
      // rede: se o fotograma nunca vier, troca-se a vista a mesma
      rede = window.setTimeout(cortar, PACIENCIA);
    }

    function vigiar() {
      if (parado) return;
      const total = emCena.duration;
      if (Number.isFinite(total) && total > 0 && total - emCena.currentTime <= ANTECEDENCIA) {
        if (!seguinte) {
          laco();
          return;
        }
        mandarArrancar();
      }
      agendar();
    }

    function agendar() {
      if (parado) return;
      const palco = emCena as ComFotograma;
      if (typeof palco.requestVideoFrameCallback === "function") {
        fotogramaVigia = palco.requestVideoFrameCallback(vigiar);
      } else {
        temporizador = window.setTimeout(vigiar, 30);
      }
    }

    /* se o que esta em cena chegar mesmo ao fim antes de o outro desenhar,
       segura o ultimo fotograma, que com o laco cosido a xfade e quase igual
       ao primeiro. Ninguem ve, e o corte acontece logo a seguir. */
    function aoAcabar() {
      if (!seguinte) {
        laco();
        return;
      }
      mandarArrancar();
    }

    agendar();
    emCena.addEventListener("ended", aoAcabar);

    return () => {
      parado = true;
      emCena.removeEventListener("ended", aoAcabar);
      if (temporizador !== null) window.clearTimeout(temporizador);
      if (rede !== null) window.clearTimeout(rede);
      const palco = emCena as ComFotograma;
      if (fotogramaVigia !== null && typeof palco.cancelVideoFrameCallback === "function") {
        palco.cancelVideoFrameCallback(fotogramaVigia);
      }
      const entrada = seguinte as ComFotograma | null;
      if (
        entrada &&
        fotogramaEntrada !== null &&
        typeof entrada.cancelVideoFrameCallback === "function"
      ) {
        entrada.cancelVideoFrameCallback(fotogramaEntrada);
      }
    };
  }, [activo, aTocar, reservaAquecida]);

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
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={aquecerReserva}
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

      {/* ⚠️ NAO VOLTA A HAVER SOMBRA NO TOPO. Havia aqui uma faixa de 10rem que
          escurecia o principio do video para a barra transparente se ler. Lia-se
          como uma tira suja por cima da imagem, sobretudo no telemovel, e o
          Tomas pediu para sair: em cima fica so o logotipo e o botao do menu,
          sem chapa nenhuma. Quem segura a leitura agora e a sombra projectada
          do proprio logotipo e do botao, em site-nav.tsx. */}

      {/* 4. grao de pelicula */}
      <div className="grain" />
    </div>
  );
}
