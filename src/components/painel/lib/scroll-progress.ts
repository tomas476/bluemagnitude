"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/* ==========================================================================
   MOTOR DE SCROLL — portado do Frame Pulse (clientes/frame-pulse:
   src/hooks/use-raf.ts, use-in-view.ts, use-scroll-progress.ts), reduzido ao
   que a faixa horizontal precisa. A mecânica é a mesma, de propósito.

   Três peças, uma ideia: o scroll é lido por UM listener passivo, a geometria
   é medida fora do ciclo de frames, e o progresso é escrito directamente numa
   CSS variable — o React nunca re-renderiza durante o scroll.
   ========================================================================== */

const isBrowser = typeof window !== "undefined";

export const clamp = (v: number, min = 0, max = 1): number => (v < min ? min : v > max ? max : v);

/** Suavização exponencial independente do frame rate. */
export const damp = (atual: number, alvo: number, meiaVida: number, delta: number): number =>
  alvo + (atual - alvo) * Math.pow(2, -delta / Math.max(1, meiaVida));

/* --------------------------------------------------------------------------
   1) UM só requestAnimationFrame na página
   -------------------------------------------------------------------------- */

export type RafCallback = (tempo: number, delta: number) => void;

const subscritores = new Set<RafCallback>();
let frameId = 0;
let ultimoTempo = 0;
let visibilidadeLigada = false;

const escondido = (): boolean =>
  typeof document !== "undefined" && document.visibilityState === "hidden";

const loop = (tempo: number): void => {
  frameId = window.requestAnimationFrame(loop);
  /* Delta travado a 64 ms: um separador em segundo plano não pode produzir um
     salto gigante quando volta. */
  const delta = ultimoTempo === 0 ? 16.667 : Math.min(tempo - ultimoTempo, 64);
  ultimoTempo = tempo;
  for (const cb of subscritores) cb(tempo, delta);
};

const arrancar = (): void => {
  if (!isBrowser || frameId !== 0 || subscritores.size === 0 || escondido()) return;
  ultimoTempo = 0;
  frameId = window.requestAnimationFrame(loop);
};

const parar = (): void => {
  if (frameId !== 0) {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }
  ultimoTempo = 0;
};

const ligarVisibilidade = (): void => {
  if (visibilidadeLigada || typeof document === "undefined") return;
  visibilidadeLigada = true;
  document.addEventListener(
    "visibilitychange",
    () => (escondido() ? parar() : arrancar()),
    { passive: true },
  );
};

/**
 * Entra no ÚNICO requestAnimationFrame da página.
 *
 * Público de propósito: qualquer camada animada (ex.: `ui/Particulas`) tem de
 * partilhar este loop em vez de abrir o seu próprio rAF — assim a página tem
 * sempre um só frame callback, que dorme quando o separador está escondido e
 * pára de vez quando ninguém está subscrito.
 *
 * @param cb recebe `(tempo, delta)`; o delta vem travado a 64 ms.
 * @returns a função de cancelamento (chamar no cleanup do efeito).
 */
export function subscreverRaf(cb: RafCallback): () => void {
  if (!isBrowser) return () => {};
  ligarVisibilidade();
  subscritores.add(cb);
  arrancar();
  return () => {
    subscritores.delete(cb);
    if (subscritores.size === 0) parar();
  };
}

/* --------------------------------------------------------------------------
   2) Singleton de scroll — um listener passivo, e dorme quando ninguém scrolla
   -------------------------------------------------------------------------- */

interface EstadoScroll {
  /** window.scrollY no último frame. */
  y: number;
}

const estado: EstadoScroll = { y: isBrowser ? window.scrollY : 0 };
type OuvinteScroll = (estado: EstadoScroll, delta: number) => void;
const ouvintes = new Set<OuvinteScroll>();

let yBruto = isBrowser ? window.scrollY : 0;
let ligado = false;
let pararLoop: (() => void) | null = null;

/** ms de silêncio depois dos quais o loop se liberta. */
const TIMEOUT_INACTIVO = 700;
let ultimoInput = 0;

const acordar = (): void => {
  ultimoInput = isBrowser ? performance.now() : 0;
  if (!pararLoop && ouvintes.size > 0) pararLoop = subscreverRaf(tick);
};

const onScroll = (): void => {
  yBruto = window.scrollY;
  acordar();
};

const tick = (t: number, delta: number): void => {
  estado.y = yBruto;
  for (const o of ouvintes) o(estado, delta);
  if (t - ultimoInput > TIMEOUT_INACTIVO && pararLoop) {
    pararLoop();
    pararLoop = null;
  }
};

const ligar = (): void => {
  if (ligado || !isBrowser) return;
  ligado = true;
  window.addEventListener("scroll", onScroll, { passive: true });
};

function subscreverScroll(ouvinte: OuvinteScroll): () => void {
  if (!isBrowser) return () => {};
  ligar();
  ouvintes.add(ouvinte);
  acordar();
  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0 && pararLoop) {
      pararLoop();
      pararLoop = null;
    }
  };
}

/* --------------------------------------------------------------------------
   3) IntersectionObserver partilhado — um por rootMargin, não um por elemento
   -------------------------------------------------------------------------- */

type OuvinteEmVista = (entrada: IntersectionObserverEntry) => void;

interface Pool {
  observer: IntersectionObserver;
  ouvintes: Map<Element, Set<OuvinteEmVista>>;
}

const pools = new Map<string, Pool>();

function obterPool(rootMargin: string): Pool {
  const existente = pools.get(rootMargin);
  if (existente) return existente;

  const ouvintesPool = new Map<Element, Set<OuvinteEmVista>>();
  const observer = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        const conjunto = ouvintesPool.get(entrada.target);
        if (!conjunto) continue;
        for (const ouvinte of Array.from(conjunto)) ouvinte(entrada);
      }
    },
    { rootMargin, threshold: [0, 0.01, 0.5, 1] },
  );

  const pool: Pool = { observer, ouvintes: ouvintesPool };
  pools.set(rootMargin, pool);
  return pool;
}

export function observarElemento(
  no: Element,
  ouvinte: OuvinteEmVista,
  rootMargin = "20% 0px 20% 0px",
): () => void {
  if (!isBrowser || typeof window.IntersectionObserver !== "function") return () => {};
  const pool = obterPool(rootMargin);
  const conjunto = pool.ouvintes.get(no) ?? new Set<OuvinteEmVista>();
  if (conjunto.size === 0) {
    pool.ouvintes.set(no, conjunto);
    pool.observer.observe(no);
  }
  conjunto.add(ouvinte);

  return () => {
    conjunto.delete(ouvinte);
    if (conjunto.size === 0) {
      pool.ouvintes.delete(no);
      pool.observer.unobserve(no);
    }
  };
}

/* --------------------------------------------------------------------------
   4) useScrollProgress — 0..1 da travessia do elemento
   -------------------------------------------------------------------------- */

export type ModoProgresso =
  /** 0 quando o topo entra pela base do ecrã, 1 quando a base sai pelo topo. Parallax. */
  | "cover"
  /** 0 quando o topo toca o topo do ecrã, 1 quando a base toca a base. Pins/scrubs. */
  | "contain";

export interface OpcoesProgresso {
  modo?: ModoProgresso;
  /** Escreve o progresso nesta custom property do elemento (sem re-render). */
  cssVar?: string;
  /** Meia-vida da suavização em ms. 0 = cru. */
  smooth?: number;
  /** Desliga tudo (fica no meio-estado 0.5). */
  disabled?: boolean;
}

export interface ResultadoProgresso {
  ref: RefObject<HTMLElement | null>;
  /** Valor vivo, para ler dentro do teu próprio rAF. */
  progressoRef: { current: number };
}

/**
 * Escreve `--p` (0..1) no elemento conforme ele atravessa o ecrã.
 *
 * A geometria é medida no mount e em resize/intersecção — nunca dentro do
 * ciclo de frames — e o loop está parado enquanto o elemento está fora do ecrã.
 * Com reduced motion (ou `disabled`) reporta 0.5: o meio-estado composto, em
 * que todas as derivas resolvem a zero.
 */
export function useScrollProgress(opcoes: OpcoesProgresso = {}): ResultadoProgresso {
  const { modo = "cover", cssVar, smooth = 0, disabled = false } = opcoes;
  const ref = useRef<HTMLElement>(null);
  const progressoRef = useRef(disabled ? 0.5 : 0);

  useEffect(() => {
    const no = ref.current;
    if (!no) return;

    if (disabled) {
      progressoRef.current = 0.5;
      if (cssVar) no.style.setProperty(cssVar, "0.5");
      return;
    }

    let top = 0;
    let altura = 0;
    let vh = window.innerHeight;
    let actual = -1;

    const medir = (): void => {
      const rect = no.getBoundingClientRect();
      top = rect.top + window.scrollY;
      altura = rect.height;
      vh = window.innerHeight;
    };

    const calcular = (y: number): number => {
      const span = modo === "cover" ? altura + vh : Math.max(1, altura - vh) || altura + vh;
      const inicio = modo === "cover" ? top - vh : top;
      return clamp((y - inicio) / Math.max(1, span));
    };

    const escrever = (p: number): void => {
      progressoRef.current = p;
      if (cssVar) no.style.setProperty(cssVar, p.toFixed(4));
    };

    let pararFrames: (() => void) | null = null;

    /* A CAUDA DA SUAVIZAÇÃO TEM DE FECHAR.
       O `damp` é assimptótico e o loop de scroll liberta-se ~700 ms depois do
       último input: com `smooth` alto o progresso congelava um fio ANTES do
       alvo — 0,994 em vez de 1, ou seja a faixa parava ~5 px antes do último
       cartão. Duas correcções, ambas invisíveis:
       · nos EXTREMOS (o alvo cru já está no primeiro/último 0,1% do curso, onde
         não lhe resta praticamente nada para mudar) a meia-vida encurta para
         40 ms, e 700 ms dão-lhe 17 meias-vidas para fechar em vez de 4,7. A
         margem de 0,1% é preciso existir: `window.scrollY` é arredondado, logo
         o cru pode parar em 0,9999 sem nunca ser exactamente 1;
       · e abaixo de EPSILON encosta-se ao alvo de uma vez: 0,15% do curso é
         sub-pixel em qualquer largura razoável.
       No meio do curso nada disto actua, portanto o peso do scrub mantém-se. */
    const EPSILON = 0.0015;
    const MEIA_VIDA_FIM = 40;

    const frame = (scroll: EstadoScroll, delta: number): void => {
      const cru = calcular(scroll.y);
      if (actual < 0 || smooth <= 0 || Math.abs(cru - actual) < EPSILON) {
        actual = cru;
      } else {
        const noExtremo = cru <= 0.001 || cru >= 0.999;
        actual = damp(actual, cru, noExtremo ? Math.min(smooth, MEIA_VIDA_FIM) : smooth, delta);
      }
      escrever(actual);
    };

    const arrancarFrames = (): void => {
      if (pararFrames) return;
      medir();
      pararFrames = subscreverScroll(frame);
    };
    const pararFrames_ = (): void => {
      pararFrames?.();
      pararFrames = null;
    };

    const onResize = (): void => medir();
    window.addEventListener("resize", onResize, { passive: true });

    const deixarDeObservar = observarElemento(no, (entrada) => {
      if (entrada.isIntersecting) arrancarFrames();
      else {
        pararFrames_();
        /* Encosta ao extremo mais próximo, para não congelar a meio. */
        escrever(entrada.boundingClientRect.top > 0 ? 0 : 1);
      }
    });

    if (typeof window.IntersectionObserver !== "function") arrancarFrames();

    return () => {
      deixarDeObservar();
      pararFrames_();
      window.removeEventListener("resize", onResize);
    };
  }, [disabled, modo, cssVar, smooth]);

  return { ref, progressoRef };
}

/* --------------------------------------------------------------------------
   5) Ambiente de movimento
   -------------------------------------------------------------------------- */

const corresponde = (query: string): boolean =>
  isBrowser && typeof window.matchMedia === "function" && window.matchMedia(query).matches;

/** Media query reactiva, com o valor inicial calculado já no primeiro paint. */
export function useMediaQuery(query: string): boolean {
  const [valor, setValor] = useState(() => corresponde(query));

  useEffect(() => {
    if (!isBrowser || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = (): void => setValor(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return valor;
}

/** Ecrã pequeno (breakpoint md do Tailwind): a faixa passa a ser arrastada. */
export const useEcraPequeno = (): boolean => useMediaQuery("(max-width: 767px)");

/** Ponteiro fino (rato/trackpad): condição do scrub com pin. */
export const usePonteiroFino = (): boolean =>
  useMediaQuery("(hover: hover) and (pointer: fine)");
