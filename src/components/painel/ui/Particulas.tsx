"use client";

import { useEffect, useRef, type JSX } from "react";

import { useReducedMotionSafe } from "../lib/motion";
import { observarElemento, subscreverRaf } from "../lib/scroll-progress";
import { cn } from "../lib/cn";

/* ==========================================================================
   PÓ DE LUZ — camada decorativa atrás da faixa de reels
   (a mesma ideia de atmosfera do Frame Pulse, mas em 2D e barata).

   O que é: 40 pontos de luz a subir muito devagar, brancos e vermelhos da
   marca, a opacidades tão baixas que se leem como grão do ar e não como
   "partículas". Nunca compete com os cartões: fica atrás deles, é
   `aria-hidden` e `pointer-events-none`.

   CUSTO MEDIDO: +0,5 ms de main-thread por frame durante o scrub da secção a
   1920×1080 (Performance.getMetrics do Chrome, TaskDuration/frame, 4 passagens
   de 4 s com a camada ligada contra 4 com ela desligada, duas corridas: 5,51 vs
   5,02 e 5,54 vs 4,92 ms). O fps não mexeu. O que a mantém nesse orçamento:
   1. UM só rAF na página — entra pelo `subscreverRaf` do motor de scroll, o
      mesmo loop que já move a faixa. Nunca chama requestAnimationFrame.
   2. Só desenha quando está no ecrã (`observarElemento`); fora dele o
      subscritor é REMOVIDO, portanto não há sequer callback a correr.
   3. Zero reamostragem: o buffer está a meia resolução (`RES`), desenha-se em
      px de BUFFER (matriz identidade), os sprites existem em 4 tamanhos fixos
      e vão para o ecrã com `drawImage(sprite, x, y)` em coordenadas inteiras —
      sem escalar, sem filtrar, sem `shadowBlur`, sem `lighter`.
   4. O PINTAR está travado a ~30 fps (`MS_FRAME`); a física continua a correr
      todos os frames, que é aritmética sobre 40 objectos.
   5. `translateZ(0)`: camada de composição própria, para os frames do canvas
      não obrigarem a repintar o contentor colado por baixo (onde vivem os
      `backdrop-blur` dos discos de play). Este é o único ponto que o ambiente
      de teste — Chrome headless, sem compositing real — não consegue medir.

   prefers-reduced-motion: desenha UM frame estático e não subscreve loop
   nenhum. O campo continua lá, apenas quieto. (Na prática o ReelRail só monta
   esta camada no caminho do scrub, que já exige movimento permitido — o ramo
   existe para a camada ser segura em qualquer outro sítio.)
   ========================================================================== */

/** Quantas partículas. */
const N = 46;
/** Tecto do DPR: acima de 2 o custo dobra e ninguém vê a diferença num pó. */
const DPR_MAX = 2;
/** Resolução do buffer em fracção dos px CSS. Metade = 4× menos textura/frame. */
const RES = 0.5;
/** Intervalo mínimo entre redesenhos (ms). As partículas andam ~2% da altura
 *  por segundo: a 30 fps ninguém distingue, e o custo por frame é metade. */
const MS_FRAME = 32;
/** Lados do sprite em px CSS. Quantizar permite desenhar sem escalar.
 *  Aferido a olho no ecrã: com lados de 5–20 px o campo desaparecia de todo
 *  sobre o `ink`; a 8–32 lê-se como pó sem nunca virar "estrelas". */
const LADOS_CSS = [8, 14, 22, 32] as const;

interface Particula {
  /** 0..1 na largura — resolve-se em px no desenho, logo o resize é grátis. */
  x: number;
  /** 0..1 na altura, a descer para 0 (ou seja: a subir no ecrã). */
  y: number;
  /** Índice em LADOS_CSS: o tamanho do sprite desta partícula. */
  tamanho: number;
  /** Fracção da altura por segundo. */
  vy: number;
  /** Deriva lateral em fracção da largura por segundo. */
  vx: number;
  /** Opacidade base. */
  a: number;
  /** Fase e ritmo do cintilar. */
  fase: number;
  ritmo: number;
  /** 0 = bone, 1 = vermelho da marca. */
  cor: 0 | 1;
}

/** Aleatório determinista: o campo é sempre o mesmo, logo é depurável e o
 *  caminho estático não muda de forma entre paints. */
function criarRandom(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function criarCampo(): Particula[] {
  const rnd = criarRandom(0x5eed1e);
  const campo: Particula[] = [];
  for (let i = 0; i < N; i++) {
    const d = rnd();
    /* Distribuição enviesada para o pequeno: poucas luzes maiores dão a
       sensação de profundidade, muitas dariam confetti. */
    const tamanho = d > 0.94 ? 3 : d > 0.8 ? 2 : d > 0.5 ? 1 : 0;
    campo.push({
      x: rnd(),
      y: rnd(),
      tamanho,
      /* 1,4%–4,5% da altura por segundo: uma travessia leva 22 a 71 s. */
      vy: 0.014 + rnd() * 0.031,
      vx: (rnd() - 0.5) * 0.006,
      /* As maiores mais opacas, mas nada acima de 0,26: é pó, não estrelas. */
      a: tamanho >= 2 ? 0.14 + rnd() * 0.12 : 0.07 + rnd() * 0.09,
      fase: rnd() * Math.PI * 2,
      ritmo: 0.25 + rnd() * 0.5,
      cor: rnd() > 0.74 ? 1 : 0,
    });
  }
  return campo;
}

/** Lê `--c-brass` / `--c-bone` (triplos "r g b") do próprio elemento, para a
 *  camada seguir a paleta em vez de repetir hexadecimais à mão. */
function lerCor(no: Element, nome: string, fallback: string): string {
  const valor = getComputedStyle(no).getPropertyValue(nome).trim();
  return /^\d+\s+\d+\s+\d+$/.test(valor) ? valor.replace(/\s+/g, ",") : fallback;
}

/** Um disco com queda radial suave, no tamanho exacto em que será desenhado. */
function criarSprite(rgb: string, lado: number): HTMLCanvasElement | null {
  const c = document.createElement("canvas");
  c.width = lado;
  c.height = lado;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const meio = lado / 2;
  const g = ctx.createRadialGradient(meio, meio, 0, meio, meio, meio);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.3, `rgba(${rgb},0.5)`);
  g.addColorStop(0.65, `rgba(${rgb},0.13)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, lado, lado);
  return c;
}

export interface ParticulasProps {
  className?: string;
}

/**
 * Campo de pó de luz em canvas, para pôr ATRÁS de conteúdo (z-index abaixo).
 * Absoluto por omissão: o pai precisa de `relative`.
 */
export function Particulas({ className }: ParticulasProps): JSX.Element {
  const reduced = useReducedMotionSafe();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const campo = criarCampo();
    /** Dimensões do BUFFER (px de dispositivo já reduzidos por RES). */
    let largura = 0;
    let altura = 0;
    /** px de buffer por px CSS. */
    let escala = RES;

    /** sprites[cor][tamanho] — 2 × 4, todos no tamanho final de desenho. */
    let sprites: (HTMLCanvasElement | null)[][] = [];
    /** Metade do lado de cada sprite, em px de buffer, para centrar. */
    let meios: number[] = [];

    const construirSprites = (): void => {
      const cores = [
        lerCor(canvas, "--c-bone", "242,239,233"),
        lerCor(canvas, "--c-brass", "234,58,69"),
      ];
      const lados = LADOS_CSS.map((l) => Math.max(4, Math.round(l * escala)));
      meios = lados.map((l) => l / 2);
      sprites = cores.map((rgb) => lados.map((l) => criarSprite(rgb, l)));
    };

    const desenhar = (tempo: number): void => {
      if (largura <= 0 || altura <= 0 || sprites.length === 0) return;
      ctx.clearRect(0, 0, largura, altura);
      const t = tempo / 1000;
      for (const p of campo) {
        const sprite = sprites[p.cor]?.[p.tamanho];
        if (!sprite) continue;
        /* Cintilar: ±35% da opacidade base, nunca a apagar de todo. */
        ctx.globalAlpha = p.a * (0.65 + 0.35 * Math.sin(p.fase + t * p.ritmo));
        /* Inteiros: drawImage sem escala e sem offset fraccionário não
           reamostra nada. É metade do orçamento desta camada. */
        const meio = meios[p.tamanho]!;
        ctx.drawImage(sprite, (p.x * largura - meio) | 0, (p.y * altura - meio) | 0);
      }
      ctx.globalAlpha = 1;
    };

    const medir = (): void => {
      const rect = canvas.getBoundingClientRect();
      const nova = Math.min(window.devicePixelRatio || 1, DPR_MAX) * RES;
      const trocou = nova !== escala;
      escala = nova;
      largura = Math.max(1, Math.round(Math.max(1, rect.width) * escala));
      altura = Math.max(1, Math.round(Math.max(1, rect.height) * escala));
      canvas.width = largura;
      canvas.height = altura;
      /* Desenha-se em px de BUFFER: nenhuma matriz, nenhuma reamostragem. */
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (trocou || sprites.length === 0) construirSprites();
    };

    medir();

    /* ---- reduced motion: um frame e fica quieto. Sem loop, sem observer. -- */
    if (reduced) {
      desenhar(0);
      let roEstatico: ResizeObserver | null = null;
      if (typeof ResizeObserver === "function") {
        roEstatico = new ResizeObserver(() => {
          medir();
          desenhar(0);
        });
        roEstatico.observe(canvas);
      }
      return () => roEstatico?.disconnect();
    }

    /* ---- movimento permitido ---------------------------------------------- */
    let pararRaf: (() => void) | null = null;
    let acumulado = MS_FRAME;

    const frame = (tempo: number, delta: number): void => {
      const dt = Math.min(delta, 64) / 1000;
      for (const p of campo) {
        p.y -= p.vy * dt;
        p.x += p.vx * dt;
        /* Reciclagem: sai por cima, volta a entrar por baixo noutra coluna. */
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05) p.x = 1.05;
        else if (p.x > 1.05) p.x = -0.05;
      }
      /* A física corre a cada frame (é aritmética sobre 40 objectos); o que
         está travado a ~30 fps é o PINTAR, que é o que custa. */
      acumulado += delta;
      if (acumulado < MS_FRAME) return;
      acumulado = 0;
      desenhar(tempo);
    };

    const arrancar = (): void => {
      if (!pararRaf) pararRaf = subscreverRaf(frame);
    };
    const suspender = (): void => {
      pararRaf?.();
      pararRaf = null;
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => medir());
      ro.observe(canvas);
    }

    const deixarDeObservar = observarElemento(canvas, (entrada) => {
      if (entrada.isIntersecting) arrancar();
      else suspender();
    });
    /* Sem IntersectionObserver não há sinal de visibilidade: anima sempre. */
    if (typeof window.IntersectionObserver !== "function") arrancar();

    return () => {
      deixarDeObservar();
      suspender();
      ro?.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      /* Camada de composição própria: os frames do canvas não devem obrigar a
         repintar o conteúdo por baixo. `translateZ(0)` basta para promover —
         sem `will-change` permanente, que reservaria a textura para sempre. */
      style={{ transform: "translateZ(0)" }}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}

export default Particulas;
