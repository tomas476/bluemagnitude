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
 * O fundo do heroi, refeito do zero a pedido do Tomas: um <video loop> e
 * mais nada.
 *
 * ⚠️ NAO VOLTAR A POR MAQUINARIA AQUI. Ja houve duas versoes com dois <video>
 * a trocarem de lugar na fronteira do laco, vigias por fotograma, aquecimento
 * do descodificador e redes de seguranca. Continuava a fritar no iPhone. O
 * que ficou e o laco nativo do browser sobre um ficheiro codificado direito
 * (H.264 High 8 bits, yuv420p, faststart, keyframe por segundo), sem
 * costura, sem xfade, sem duplicacao.
 *
 * ⚠️ SEM GRAO POR CIMA DO VIDEO. O `.grain` e um `mix-blend-mode: overlay` a
 * ecra inteiro; compor isso sobre um video a andar e caro num telemovel e
 * deixa cair fotogramas. As capas das paginas de servico, que sao fotografia
 * parada, continuam com ele.
 *
 * O poster fica por baixo ate o video desenhar o primeiro fotograma, para o
 * iOS nunca mostrar o botao de play do sistema num rectangulo parado. Se o
 * sistema recusar o autoplay, fica o poster e acabou.
 *
 * As camadas 1, 2 e 2b sao o blend com o CampoLuz que vem a seguir e nao se
 * tocam sem ler a nota em cada uma.
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
    if (prefersLightweight() || movimentoReduzido()) return;
    setFonte(estreito ? fontes.estreito : fontes.largo);
  }, [fontes.estreito, fontes.largo, poster, posterEstreito]);

  /* muted tem de estar na propriedade E no atributo antes do autoplay, senao
     o Safari recusa. E a unica coisa que fica alem do proprio elemento. */
  const guardarRef = React.useCallback((elemento: HTMLVideoElement | null) => {
    if (!elemento) return;
    elemento.muted = true;
    elemento.defaultMuted = true;
    elemento.setAttribute("muted", "");
  }, []);

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

      {fonte ? (
        <video
          ref={guardarRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition, opacity: aTocar ? 1 : 0 }}
          src={fonte}
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
          dela e a chapa lisa do .campo-luz). A camada 2b, essa, continua atada
          ao campo-luz. */}
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
    </div>
  );
}
