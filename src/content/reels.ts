import type { Cartao } from "@/components/ui/carrossel";
import { EMPRESA } from "@/content/site";
import { caminho } from "@/lib/caminho";

/**
 * Os cinco reels do Instagram da Blue Magnitude, na ordem de curadoria do
 * Tomas, com o destaque a cabeca.
 *
 * As capas sao as CAPAS REAIS dos reels, e os videos sao os reels verdadeiros:
 * sacados a 27/8/2026 com `yt-dlp --cookies-from-browser chrome`, com a sessao
 * do Tomas iniciada (sem sessao o Instagram recusa, e recusou durante duas
 * rondas). Os masters completos ficaram em ~/Downloads/bm-reels-master, fora
 * do repositorio.
 *
 * ⚠️ O QUE CORRE NO CARTAO SAO OS PRIMEIROS 20 SEGUNDOS, a 720x1280. Os cinco
 * originais somam 89 MB e um deles tem 1m52s; inteiros nao entram numa landing.
 * Por isso ha `excerto` em cada cartao e uma linha por baixo do titulo da
 * seccao a dize-lo: um excerto que nao se anuncia e a peca truncada a fingir
 * que esta inteira. O card continua a levar ao reel completo no Instagram.
 *
 * ⚠️ OS CAMINHOS PASSAM TODOS POR `caminho()`. O GitHub Pages serve o site numa
 * subpasta; um "/reels/x.webp" escrito a mao da 404 la.
 */

const SHORTCODES = [
  "DR5QkzNAKF5",
  "DUptUr5FK9a",
  "DV01xOrCuTX",
  "DZZkpDjtM1g",
  "DZ95xrKQdvg",
] as const;

/** O que corre em cada cartao, ja em frase, para o nome acessivel do link. */
const EXCERTO = "excerto de 20 s";

/** Onde o carrossel abre centrado: o destaque da curadoria e o primeiro. */
export const REEL_DESTAQUE = 0;

export const REELS: Cartao[] = SHORTCODES.map((codigo, i) => ({
  tipo: "reel",
  id: codigo,
  poster: caminho(`/reels/${codigo}.webp`),
  video: caminho(`/reels/${codigo}.mp4`),
  excerto: EXCERTO,
  href: `https://www.instagram.com/reel/${codigo}/`,
  /**
   * ⚠️ SEM LEGENDAS INVENTADAS. Nao sabemos o que cada reel mostra ao ponto de
   * o descrever por escrito, e este site nao poe factos que nao verificou. O
   * nome acessivel diz a posicao e o destino, que e verdade inteira.
   */
  legenda: `Reel ${i + 1} de ${SHORTCODES.length}`,
  alt: `Publicacao de Instagram da ${EMPRESA.nome}`,
  largura: 720,
  altura: 1280,
}));

export const ROTULOS_REELS = {
  carrossel: "carrossel",
  regiao: "Reels da",
  dono: EMPRESA.nome,
  anterior: "Reel anterior",
  seguinte: "Reel seguinte",
  reel: "reel",
  posicoes: SHORTCODES.map((_, i) => `Reel ${i + 1} de ${SHORTCODES.length}`),
  ligarSom: "Ligar o som",
  desligarSom: "Desligar o som",
  verNoInstagram: "ver no Instagram",
} as const;
