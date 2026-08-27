import type { Cartao } from "@/components/ui/carrossel";
import { EMPRESA } from "@/content/site";
import { caminho } from "@/lib/caminho";

/**
 * Os cinco reels do Instagram da Blue Magnitude, na ordem de curadoria do
 * Tomas, com o destaque a cabeca.
 *
 * As capas sao as CAPAS REAIS dos reels, sacadas do endpoint de media do
 * Instagram (720x1280). Os videos nao se conseguem sacar sem sessao iniciada,
 * por isso o cartao e a capa e o card inteiro e o link: abre o reel verdadeiro
 * no Instagram, que e uma accao honesta em vez de um leitor morto.
 *
 * Quando o cliente exportar os .mp4 (1080x1920, H.264, abaixo de 8 MB), basta
 * po-los em public/reels/<id>.mp4, acrescentar `video: caminho(...)` a cada
 * cartao e escrever o `excerto` se o que correr nao for a peca inteira.
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

/** Onde o carrossel abre centrado: o destaque da curadoria e o primeiro. */
export const REEL_DESTAQUE = 0;

export const REELS: Cartao[] = SHORTCODES.map((codigo, i) => ({
  tipo: "reel",
  id: codigo,
  poster: caminho(`/reels/${codigo}.webp`),
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
