import type { ItemRail } from "@/components/painel/ui/CarrosselReels";

/**
 * Reels do Instagram da Blue Magnitude, por ordem de curadoria: o primeiro e o
 * destaque e leva a forma maior da faixa.
 *
 * O /embed do Instagram NAO e um leitor: o botao de play atira o visitante para
 * fora do site. Por isso o unico caminho para um reel tocar aqui e o ficheiro
 * local em public/reels/<shortcode>.mp4 (H.264, 1080x1920, abaixo de 8 MB) com
 * a capa em public/reels/<shortcode>.webp.
 *
 * Enquanto nao houver capa e video, o item fica com accao "link", que e uma
 * accao honesta (abre o reel no Instagram) em vez de um controlo morto.
 *
 * A seccao so aparece se REELS tiver itens: um leque de reels sem reels
 * denuncia abandono.
 */

export const REELS_PRONTOS = false;

export const REELS: ReadonlyArray<ItemRail> = REELS_PRONTOS
  ? [
      {
        id: "DR5QkzNAKF5",
        poster: "/reels/DR5QkzNAKF5.webp",
        eyebrow: "Instagram · Reel",
        titulo: "Instalação em curso",
        accao: { tipo: "video", src: "/reels/DR5QkzNAKF5.mp4" },
      },
      {
        id: "DUptUr5FK9a",
        poster: "/reels/DUptUr5FK9a.webp",
        eyebrow: "Instagram · Reel",
        titulo: "No telhado",
        accao: { tipo: "video", src: "/reels/DUptUr5FK9a.mp4" },
      },
      {
        id: "DV01xOrCuTX",
        poster: "/reels/DV01xOrCuTX.webp",
        eyebrow: "Instagram · Reel",
        titulo: "Equipa em obra",
        accao: { tipo: "video", src: "/reels/DV01xOrCuTX.mp4" },
      },
      {
        id: "DZZkpDjtM1g",
        poster: "/reels/DZZkpDjtM1g.webp",
        eyebrow: "Instagram · Reel",
        titulo: "Sistema ligado",
        accao: { tipo: "video", src: "/reels/DZZkpDjtM1g.mp4" },
      },
      {
        id: "DZ95xrKQdvg",
        poster: "/reels/DZ95xrKQdvg.webp",
        eyebrow: "Instagram · Reel",
        titulo: "Painéis montados",
        accao: { tipo: "video", src: "/reels/DZ95xrKQdvg.mp4" },
      },
    ]
  : [];

export const ROTULOS_REELS = {
  scroll: "Arrasta para ver",
  reproduzir: "Reproduzir",
  abrir: "Abrir",
  fechar: "Fechar",
  novaJanela: "abre numa nova janela",
} as const;
