import type { ItemRail } from "@/components/painel/ui/CarrosselReels";
import { EMPRESA } from "@/content/site";
import { caminho } from "@/lib/caminho";

/**
 * Os cinco reels do Instagram da Blue Magnitude, na ordem de curadoria do
 * Tomas, com o destaque a cabeca.
 *
 * As capas sao as CAPAS REAIS dos reels, sacadas do endpoint de media do
 * Instagram. Os videos nao se conseguem sacar sem sessao iniciada, por isso a
 * accao e "link": o cartao abre o reel verdadeiro no Instagram, que e uma
 * accao honesta em vez de um leitor morto. Quando o cliente exportar os .mp4
 * (1080x1920, H.264, abaixo de 8 MB), basta po-los em public/reels/<id>.mp4 e
 * trocar a accao para { tipo: "video", src: "/reels/<id>.mp4" }.
 */

const SHORTCODES = [
  "DR5QkzNAKF5",
  "DUptUr5FK9a",
  "DV01xOrCuTX",
  "DZZkpDjtM1g",
  "DZ95xrKQdvg",
] as const;

export const REELS: ReadonlyArray<ItemRail> = SHORTCODES.map((codigo) => ({
  id: codigo,
  poster: caminho(`/reels/${codigo}.webp`),
  posterAlt: `Reel de Instagram da ${EMPRESA.nome}`,
  eyebrow: "Instagram · Reel",
  titulo: EMPRESA.instagramHandle,
  accao: { tipo: "link", href: `https://www.instagram.com/reel/${codigo}/` },
}));

export const ROTULOS_REELS = {
  scroll: "Arrasta para ver",
  reproduzir: "Reproduzir",
  abrir: "Ver no Instagram",
  fechar: "Fechar",
  novaJanela: "abre numa nova janela",
} as const;
