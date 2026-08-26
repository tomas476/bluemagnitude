# Contexto do site da Blue Magnitude

## O que é

Site novo da Blue Magnitude (bluemagnitude.pt), empresa de instalações
fotovoltaicas de Leiria. Substitui um WordPress com o tema comprado Energyland.

## Onde vive

- Fonte: `~/Desktop/bluemagnitude-site` no Mac, espelhada em
  `~/bluemagnitude-site` na VPS `filipe@167.86.123.215`.
- Pré-visualização: `bluemagnitude.imogrow.pt`.

## Stack

Next 16 + React 19 + Tailwind 4, `output: "export"`. Zero framer-motion, zero
GSAP, zero shadcn. A única dependência de UI é `lucide-react`, que veio com o
carrossel de reels.

## As três regras que não se mexem

1. **O contrato de conteúdo é `src/content/site.ts`.** Nenhum componente escreve
   texto de marca, números ou contactos. O que não está lá não vai ao ecrã, e o
   que falta está em `PERGUNTAS-AO-CLIENTE.md`.

2. **O blend do herói.** A camada 2b do `video-backdrop.tsx` espelha, ancorado
   em `50% 100%`, o mesmo gradiente que o `.campo-luz__luz` pinta no topo, com a
   mesma percentagem (10% de verde). Se um mudar sem o outro, aparece uma risca
   horizontal a toda a largura na fronteira entre o vídeo e a secção seguinte.
   A correcção nunca é mascarar o topo do campo.

3. **O `Reveal` precisa dos dois `requestAnimationFrame`.** Com um só, o browser
   resolve os dois estados no mesmo frame, nunca pinta o `opacity: 0` e não há
   transição nenhuma. E nada de `rootMargin` negativo, que condena o rodapé a
   ficar invisível.

## O carrossel de reels

Veio do painel de componentes da imogrow
(`~/imogrow-realtor-kit/componentes/react/ui/CarrosselReels.tsx`) e está em
`src/components/painel/`. Não foi reescrito. As únicas mudanças foram de
integração, todas anotadas: `"use client"` no topo, tipos de `RefObject`
ajustados ao React 19, `type JSX` importado, e um `lib/motion.tsx` local que
serve o único hook de que ele precisava sem arrastar o framer-motion.

Os nomes de tokens que ele assume (`brass`, `bone`, `ink-deep`, `surface`,
`hairline-strong`, ...) estão mapeados para a paleta da Blue Magnitude no fim do
`globals.css`, na secção "ponte para o painel de componentes".

A secção só aparece quando `src/content/reels.ts` tiver itens.

## O vídeo do herói

Gerado no Higgsfield, drone em órbita descendente sobre a equipa a montar
painéis, com o logótipo na fachada do armazém. O master é HEVC 10 bits e não
serve para a web. O laço é cosido com um `xfade` de 0,8s entre o fim e o
princípio, e não em ping-pong, porque um drone a voar para trás lê-se logo como
truque. Receita completa no plano.
