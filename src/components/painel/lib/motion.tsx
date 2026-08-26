"use client";

import { useEffect, useState } from "react";

/**
 * Ponte para o painel de componentes.
 *
 * O CarrosselReels e o Particulas vieram do painel da imogrow e importam
 * daqui. No painel este ficheiro traz a biblioteca de movimento inteira, que
 * assenta em framer-motion. Este site nao usa biblioteca de animacao nenhuma,
 * por isso reimplementa-se aqui a UNICA funcao de que o carrossel precisa,
 * com a mesma assinatura. O componente fica intacto.
 */
export function useReducedMotionSafe(): boolean {
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(mq.matches);
    const aoMudar = (evento: MediaQueryListEvent) => setReduzido(evento.matches);
    mq.addEventListener("change", aoMudar);
    return () => mq.removeEventListener("change", aoMudar);
  }, []);

  return reduzido;
}
