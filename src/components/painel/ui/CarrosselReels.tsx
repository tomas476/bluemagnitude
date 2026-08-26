"use client";

import { ArrowDown, ArrowUpRight, Play, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { useFocusTrap, useFundoInerte } from "../lib/focus";
import { useEcraPequeno, usePonteiroFino, useScrollProgress } from "../lib/scroll-progress";
import { useReducedMotionSafe } from "../lib/motion";
import { cn } from "../lib/cn";
import { Particulas } from "./Particulas";

/* ==========================================================================
   FAIXA HORIZONTAL COM PIN — portada do Frame Pulse
   (clientes/frame-pulse/src/components/PortfolioSection.tsx).

   A IDEIA: a secção cola-se ao ecrã exactamente pelos pixéis que a faixa
   transborda, e o scroll vertical arrasta-a lateralmente, 1:1. Cartões 9:16 de
   alturas desencontradas, com sobreposição de propósito, a derivar
   verticalmente uns contra os outros — uma tira de cinema a passar, não uma
   grelha.

   Porque é barato:
   · UM useScrollProgress escreve `--p` no elemento do pin. Zero re-renders do
     React durante o scroll; a faixa lê `--p` num translate3d.
   · A geometria é medida no mount e em ResizeObserver/resize. Nada é medido
     dentro do ciclo de frames.
   · A deriva de cada cartão é `calc((var(--p) - 0.5) * var(--d) * 1rem)` — CSS
     puro sobre a mesma variável herdada, por isso mais cartões custam zero.

   Três caminhos de render, UMA ideia:
   · ponteiro fino + movimento permitido -> o scrub com pin acima.
   · ecrã pequeno                        -> a mesma tira, com scroll-snap.
     Arrastar É a interacção; sequestrar o scroll de um telemóvel não é.
   · prefers-reduced-motion              -> grelha editorial, quieta e completa.

   Adaptado à marca: sem o laranja "ember" do Frame Pulse — o acento aqui é o
   vermelho da marca (token `brass`).
   ========================================================================== */

/** O que cada cartão faz ao ser activado. */
export type AccaoRail =
  /** Abre um iframe (embed do Instagram) no lightbox. */
  | { readonly tipo: "embed"; readonly src: string }
  /** Abre um <video> local no lightbox. */
  | { readonly tipo: "video"; readonly src: string }
  /** Navega para fora — o disco de play passa a seta. */
  | { readonly tipo: "link"; readonly href: string };

export interface ItemRail {
  readonly id: string;
  /** Fotografia vertical (9:16). */
  readonly poster: string;
  readonly posterAlt?: string;
  /** Linha pequena em maiúsculas: tipologia · zona, ou "Instagram · Reel". */
  readonly eyebrow: string;
  /** Título grande do cartão. */
  readonly titulo: string;
  readonly accao: AccaoRail;
}

export interface RotulosRail {
  readonly scroll: string;
  readonly reproduzir: string;
  readonly abrir: string;
  readonly fechar: string;
  readonly novaJanela: string;
}

/** Composição de cada cartão na faixa: altura, deriva, sobreposição, plano.
 *
 * Os TETOS do clamp são o que faz a faixa transbordar (e portanto viajar) em
 * monitores grandes: medido a 2560×1440, com os tetos antigos (46/34/50/36/44/32
 * rem) a faixa só tinha 179px para andar — lia-se como parada. Com estes,
 * ~700px. Em ecrãs normais nada muda: aí quem manda é o valor em svh. */
const FORMA_FAIXA = [
  { altura: "clamp(19rem, 66svh, 56rem)", deriva: -2.6, sobrepor: 0, frente: true },
  { altura: "clamp(15rem, 48svh, 42rem)", deriva: 3.2, sobrepor: -2.5, frente: false },
  { altura: "clamp(20rem, 72svh, 60rem)", deriva: -3.6, sobrepor: -1, frente: true },
  { altura: "clamp(16rem, 52svh, 44rem)", deriva: 2.4, sobrepor: -2.75, frente: false },
  { altura: "clamp(18rem, 62svh, 54rem)", deriva: -1.8, sobrepor: -0.5, frente: true },
  { altura: "clamp(14rem, 45svh, 40rem)", deriva: 3.4, sobrepor: -2.5, frente: false },
] as const;

/** Larguras e offsets da grelha editorial (caminho reduced-motion). */
const FORMA_ESTATICA = [
  "col-span-6 lg:col-span-5",
  "col-span-6 lg:col-span-3 lg:mt-24",
  "col-span-6 lg:col-span-4 lg:mt-10",
  "col-span-6 lg:col-span-4",
  "col-span-6 lg:col-span-3 lg:mt-16",
  "col-span-12 lg:col-span-5 lg:mt-6",
] as const;

/* Altura dos cartões no caminho scroll-snap. Em telemóvel um 9:16 a 58svh
   ocupava ~475px (mais de metade do ecrã); em base fica ~300px (≈63%) e a
   partir de sm: volta o valor aprovado. Vem por CSS var para poder ser
   responsiva sem duplicar markup. */
/* QUANTO SCROLL CUSTA A FAIXA — o botão do "mais devagar".
   A faixa viaja sempre exactamente `railMax` px (o transbordo real). O que este
   factor muda é quanto SCROLL se gasta a fazê-la viajar: o pin reserva
   `100svh + railMax × FACTOR_SCRUB`, e como o `useScrollProgress` em modo
   "contain" mede `altura − vh`, o `--p` passa a levar 1,9× mais scroll a chegar
   a 1. O translate continua a ser `--p × --rail-max`, portanto o último cartão
   aterra no mesmo sítio — só leva mais tempo a chegar lá.
   1,9 é o limite prático: acima disso a secção começa a parecer que prende. */
const FACTOR_SCRUB = 1.9;

const H_SNAP = "var(--h-snap)";
const VARS_ALTURA_SNAP =
  "[--h-snap:clamp(18rem,45svh,20rem)] sm:[--h-snap:clamp(17rem,58svh,30rem)]";

const ordinal = (i: number): string => String(i + 1).padStart(2, "0");

function formaDe(i: number): (typeof FORMA_FAIXA)[number] {
  return FORMA_FAIXA[i % FORMA_FAIXA.length]!;
}

/* --------------------------------------------------------------------------
   Cartão
   -------------------------------------------------------------------------- */

function Cartao({
  item,
  indice,
  rotulos,
  prioridade,
  tituloGrande,
  aoAbrir,
  className,
}: {
  item: ItemRail;
  indice: number;
  rotulos: RotulosRail;
  prioridade: boolean;
  tituloGrande?: boolean;
  aoAbrir: () => void;
  className?: string;
}): JSX.Element {
  const [semPoster, setSemPoster] = useState(false);
  const ehLink = item.accao.tipo === "link";
  const Icone = ehLink ? ArrowUpRight : Play;
  const rotulo = `${ehLink ? rotulos.abrir : rotulos.reproduzir}: ${item.titulo}`;

  const conteudo = (
    <>
      {/* Media */}
      {semPoster ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-gradient-to-b from-surface-2 via-ink to-ink-deep"
        >
          <img
            src="/marca/monograma.png"
            alt=""
            loading="lazy"
            decoding="async"
            width={800}
            height={800}
            className="h-20 w-20 object-contain opacity-70"
          />
        </span>
      ) : (
        <img
          src={item.poster}
          alt={item.posterAlt ?? ""}
          aria-hidden={item.posterAlt ? undefined : "true"}
          width={720}
          height={1280}
          loading={prioridade ? "eager" : "lazy"}
          decoding="async"
          onError={() => setSemPoster(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            "transition-transform duration-900 ease-out",
            "group-hover/tile:scale-[1.05] group-focus-visible/tile:scale-[1.05]",
            "motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100",
          )}
        />
      )}

      {/* UM só scrim */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-transparent"
      />

      {/* Rim-light na aresta, na sua própria camada */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-card",
          indice % 2 === 0
            ? "shadow-[inset_0_0_0_1px_rgb(var(--c-brass)/0.22)]"
            : "shadow-[inset_0_0_0_1px_rgb(var(--c-bone)/0.12)]",
        )}
      />

      {/* Ordinal grande, como marca gráfica */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1 font-display text-4xl font-semibold leading-none text-bone/10 transition-colors duration-400 ease-out group-hover/tile:text-brass/45 sm:right-4 sm:text-7xl"
      >
        {ordinal(indice)}
      </span>

      {/* Disco de play ao centro */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill sm:h-16 sm:w-16",
          "border-2 border-brass/45 bg-ink/60 text-brass shadow-lift backdrop-blur-sm",
          "transition-[transform,background-color,border-color] duration-400 ease-out",
          "group-hover/tile:scale-110 group-hover/tile:border-brass group-hover/tile:bg-brass/20",
          "group-focus-visible/tile:scale-110 group-focus-visible/tile:border-brass",
          "motion-reduce:group-hover/tile:scale-100",
        )}
      >
        <Icone className={cn("h-5 w-5 sm:h-6 sm:w-6", !ehLink && "ml-0.5 fill-current")} />
      </span>

      {/* Legenda — em telemóvel o cartão é mais curto: menos padding, título
          mais pequeno e limitado a 2 linhas para o eyebrow nunca ficar
          encostado à aresta de baixo. */}
      <span className="absolute inset-x-0 bottom-0 block p-3.5 pb-4 sm:p-5">
        <span className="block font-sans text-2xs uppercase tracking-eyebrow text-brass">
          {item.eyebrow}
        </span>
        <span
          className={cn(
            "mt-1 block font-display leading-tight text-bone line-clamp-2 sm:mt-1.5 sm:line-clamp-none",
            tituloGrande ? "text-display-sm" : "text-fluid-base sm:text-fluid-xl",
          )}
        >
          {item.titulo}
        </span>
      </span>
    </>
  );

  const classesBase = cn(
    "group/tile relative block aspect-[9/16] overflow-hidden rounded-card bg-surface text-left shadow-lift",
    "transition-[transform,box-shadow] duration-400 ease-out hover:-translate-y-1 hover:shadow-cinema",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brass",
    className,
  );

  if (ehLink && item.accao.tipo === "link") {
    return (
      <a
        href={item.accao.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${rotulo} (${rotulos.novaJanela})`}
        className={classesBase}
      >
        {conteudo}
      </a>
    );
  }

  return (
    <button type="button" onClick={aoAbrir} aria-label={rotulo} className={classesBase}>
      {conteudo}
    </button>
  );
}

/* --------------------------------------------------------------------------
   Lightbox — UM para toda a secção
   -------------------------------------------------------------------------- */

function Lightbox({
  item,
  rotulos,
  aoFechar,
}: {
  item: ItemRail;
  rotulos: RotulosRail;
  aoFechar: () => void;
}): JSX.Element | null {
  const caixaRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, caixaRef);
  useFundoInerte(true);

  useEffect(() => {
    const onKey = (evento: KeyboardEvent): void => {
      if (evento.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aoFechar]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={caixaRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.titulo}
      className="safe-bottom fixed inset-0 z-modal flex flex-col bg-ink-deep/97 backdrop-blur-xl"
    >
      <div className="shell flex items-start justify-between gap-4 py-4 sm:gap-6 sm:py-5">
        <div className="min-w-0">
          <p className="font-sans text-2xs uppercase tracking-eyebrow text-brass">{item.eyebrow}</p>
          <p className="mt-1 truncate font-display text-fluid-lg text-bone">{item.titulo}</p>
        </div>
        <button
          type="button"
          onClick={aoFechar}
          aria-label={rotulos.fechar}
          className="hairline grid h-12 w-12 shrink-0 place-items-center rounded-pill text-bone transition-colors duration-250 ease-out hover:border-brass hover:text-brass sm:h-11 sm:w-11"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-gutter pb-5 sm:pb-6">
        {item.accao.tipo === "video" ? (
          /* Em telemóvel o vídeo toma a largura toda (menos as goteiras). */
          <video
            src={item.accao.src}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            preload="none"
            className="max-h-full w-full max-w-full rounded-card shadow-cinema sm:w-auto"
          />
        ) : item.accao.tipo === "embed" ? (
          /* max-w com min(): 26rem é mais largo do que um ecrã de 375px menos
             as goteiras, portanto o limite real é a largura disponível. */
          <iframe
            src={item.accao.src}
            title={item.titulo}
            allow="encrypted-media"
            allowFullScreen
            className="h-full max-h-[46rem] w-full max-w-[min(26rem,100%)] rounded-card border-0 bg-surface"
          />
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/* --------------------------------------------------------------------------
   A faixa
   -------------------------------------------------------------------------- */

export interface CarrosselReelsProps {
  itens: readonly ItemRail[];
  rotulos: RotulosRail;
  /** Painel que fecha a faixa — o CTA da secção. */
  painel?: ReactNode;
  className?: string;
}

export function CarrosselReels({ itens, rotulos, painel, className }: CarrosselReelsProps): JSX.Element {
  const reduced = useReducedMotionSafe();
  const pequeno = useEcraPequeno();
  const fino = usePonteiroFino();
  /** O scrub com pin é uma afordância de ponteiro fino, com movimento permitido. */
  const scrub = !reduced && !pequeno && fino;

  const [aberto, setAberto] = useState<number | null>(null);
  const [faixaMax, setFaixaMax] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* O PIN SÓ EXISTE SE A FAIXA VIAJAR MESMO.
     Num monitor largo os cartões e o painel cabem no ecrã: `faixaMax` é 0 — e
     reservar 100svh de scroll para nada se mexer é uma dobra inteira de nada. */
  const viaja = scrub && faixaMax > 0;

  /* smooth 90 -> 150: com o scrub 1,9× mais lento, a velocidade em px/ms é
     ~metade, logo o mesmo atraso em ms custa metade dos px de desfasamento.
     Subir a meia-vida devolve o peso sem voltar a ficar pastoso. */
  const { ref: pinRef } = useScrollProgress({
    modo: "contain",
    cssVar: "--p",
    smooth: 150,
    disabled: !viaja,
  });

  /* Quanto a faixa transborda o seu viewport é quanto ela viaja, que é por
     quantos pixéis a secção fica colada. Medido no mount e em resize. */
  useEffect(() => {
    if (!scrub) {
      setFaixaMax(0);
      return;
    }
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const medir = (): void => {
      const transbordo = Math.max(0, Math.round(track.scrollWidth - viewport.clientWidth));
      setFaixaMax((anterior) => (Math.abs(anterior - transbordo) > 2 ? transbordo : anterior));
    };
    medir();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(medir);
      ro.observe(track);
      ro.observe(viewport);
    }
    window.addEventListener("resize", medir, { passive: true });

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [scrub]);

  const cartao = (i: number, opcoes: { tituloGrande?: boolean; className?: string }): JSX.Element => {
    const item = itens[i]!;
    return (
      <Cartao
        item={item}
        indice={i}
        rotulos={rotulos}
        prioridade={i < 2}
        tituloGrande={opcoes.tituloGrande}
        aoAbrir={() => setAberto(i)}
        className={opcoes.className}
      />
    );
  };

  const itemAberto = aberto === null ? null : itens[aberto] ?? null;

  return (
    <div className={className}>
      {scrub ? (
        <div
          /* A altura do pin É a distância de scroll: um ecrã colado mais os
             pixéis que a faixa viaja, esticados por FACTOR_SCRUB para ela andar
             mais devagar — e nenhum deles quando ela não viaja. Finita sempre:
             ninguém fica preso. */
          ref={pinRef as RefObject<HTMLDivElement>}
          className="relative"
          style={
            viaja
              ? { height: `calc(100svh + ${Math.round(faixaMax * FACTOR_SCRUB)}px)` }
              : undefined
          }
        >
          <div
            className={cn(
              "relative flex flex-col justify-center overflow-hidden",
              viaja ? "sticky top-0 h-svh" : null,
            )}
          >
            {/* Pó de luz atrás de tudo (z-0 contra os z-10 dos irmãos). */}
            <Particulas className="z-0" />

            <div ref={viewportRef} className="relative z-10 w-full">
              <div
                ref={trackRef}
                className="flex w-max items-center gap-5 px-gutter lg:gap-8 xl:gap-12 2xl:gap-16"
                style={
                  {
                    "--rail-max": faixaMax,
                    transform: "translate3d(calc(var(--p, 0) * var(--rail-max, 0) * -1px), 0, 0)",
                    willChange: "transform",
                  } as CSSProperties
                }
              >
                <ul className="contents">
                  {itens.map((item, i) => {
                    const forma = formaDe(i);
                    return (
                      <li
                        key={item.id}
                        className={cn("flex-none", forma.frente ? "z-10" : "z-0")}
                        style={
                          {
                            height: forma.altura,
                            marginLeft: forma.sobrepor ? `${forma.sobrepor}rem` : undefined,
                            "--d": forma.deriva,
                            transform:
                              "translate3d(0, calc((var(--p, 0.5) - 0.5) * var(--d, 0) * 1rem), 0)",
                          } as CSSProperties
                        }
                      >
                        {cartao(i, { tituloGrande: true, className: "h-full w-auto" })}
                      </li>
                    );
                  })}
                </ul>

                {painel ? (
                  <div
                    className="z-10 flex-none"
                    style={{ height: "clamp(18rem, 58svh, 40rem)", marginLeft: "0.5rem" }}
                  >
                    <div className="h-full w-[min(24rem,72vw)]">{painel}</div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Leitura do scrub: um filete que enche conforme a faixa viaja. */}
            <div aria-hidden="true" className="relative z-10 mt-8 flex items-center gap-4 px-gutter">
              <span className="flex items-center gap-2 font-sans text-2xs uppercase tracking-eyebrow text-muted-deep">
                <ArrowDown className="h-3.5 w-3.5" />
                {rotulos.scroll}
              </span>
              <span className="relative h-px flex-1 overflow-hidden bg-hairline-strong">
                <span
                  className="absolute inset-0 origin-left bg-brass"
                  style={{ transform: "scaleX(var(--p, 0))" }}
                />
              </span>
            </div>
          </div>
        </div>
      ) : pequeno || !reduced ? (
        /* Toque / ponteiro grosso: a mesma tira, arrastada em vez de scrubada. */
        <ul
          className={cn(
            "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-gutter pb-2 sm:gap-4",
            /* scroll-padding = goteira: o primeiro cartão encosta à goteira em
               vez de ficar centrado, e o snap-start deixa sempre o "peek" do
               cartão seguinte à vista. */
            "scroll-px-gutter",
            VARS_ALTURA_SNAP,
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {itens.map((item, i) => (
            <li
              key={item.id}
              className="flex-none snap-start sm:snap-center"
              style={{ height: H_SNAP }}
            >
              {cartao(i, { className: "h-full w-auto" })}
            </li>
          ))}
          {painel ? (
            <li className="flex-none snap-start sm:snap-center" style={{ height: H_SNAP }}>
              <div className="h-full w-[min(19rem,78vw)] sm:w-72">{painel}</div>
            </li>
          ) : null}
        </ul>
      ) : (
        /* Reduced motion: grelha editorial, quieta, completa, à escala toda. */
        <ul className="grid grid-cols-12 gap-4 px-gutter sm:gap-6 lg:gap-8">
          {itens.map((item, i) => (
            <li key={item.id} className={FORMA_ESTATICA[i % FORMA_ESTATICA.length]}>
              {cartao(i, {})}
            </li>
          ))}
          {painel ? <li className="col-span-6 lg:col-span-4 lg:mt-16">{painel}</li> : null}
        </ul>
      )}

      {/* UM lightbox, seja qual for o caminho que desenhou os cartões. Vai por
          portal para o <body>, logo nada do que faz aterra dentro da subárvore
          do pin: a altura do pin, o scrollWidth da faixa e o clientWidth do
          viewport ficam intactos enquanto está aberto. */}
      {itemAberto ? (
        <Lightbox item={itemAberto} rotulos={rotulos} aoFechar={() => setAberto(null)} />
      ) : null}
    </div>
  );
}

export default CarrosselReels;
