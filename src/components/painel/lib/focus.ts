"use client";

import { useEffect, type RefObject } from "react";

/* ==========================================================================
   Acessibilidade de camadas sobrepostas (menu mobile, lightbox).

   Regra: enquanto uma camada está aberta, o teclado e o leitor de ecrã não
   podem sair dela. Sem isto o Tab passa para os botões que estão tapados por
   baixo do overlay — que é exactamente o que acontecia no menu mobile.
   ========================================================================== */

const SELECTOR_FOCAVEIS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focaveis(raiz: HTMLElement): HTMLElement[] {
  return Array.from(raiz.querySelectorAll<HTMLElement>(SELECTOR_FOCAVEIS)).filter(
    (elemento) => elemento.offsetParent !== null || elemento === document.activeElement,
  );
}

/**
 * Prende o foco dentro de `ref` enquanto `activo` for verdadeiro:
 * põe o foco no primeiro elemento focável, faz o Tab circular e devolve o
 * foco ao elemento que estava activo quando a camada fecha.
 */
export function useFocusTrap(activo: boolean, ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!activo) return;
    const raiz = ref.current;
    if (!raiz) return;

    const anterior = document.activeElement as HTMLElement | null;

    const primeiro = focaveis(raiz)[0];
    if (primeiro) {
      primeiro.focus({ preventScroll: true });
    } else {
      raiz.setAttribute("tabindex", "-1");
      raiz.focus({ preventScroll: true });
    }

    const onKeyDown = (evento: KeyboardEvent): void => {
      if (evento.key !== "Tab") return;
      const lista = focaveis(raiz);
      if (lista.length === 0) {
        evento.preventDefault();
        return;
      }
      const inicio = lista[0]!;
      const fim = lista[lista.length - 1]!;
      const activoAgora = document.activeElement;

      if (!raiz.contains(activoAgora)) {
        evento.preventDefault();
        inicio.focus({ preventScroll: true });
        return;
      }
      if (evento.shiftKey && activoAgora === inicio) {
        evento.preventDefault();
        fim.focus({ preventScroll: true });
      } else if (!evento.shiftKey && activoAgora === fim) {
        evento.preventDefault();
        inicio.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      anterior?.focus?.({ preventScroll: true });
    };
  }, [activo, ref]);
}

/** Bloqueia o scroll do body enquanto `activo`. */
export function useBloquearScroll(activo: boolean): void {
  useEffect(() => {
    if (!activo) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [activo]);
}

/**
 * Enquanto `activo`: bloqueia o scroll do body e retira o `<main>` da árvore
 * de acessibilidade (`inert` + `aria-hidden`), para que nada por baixo da
 * camada seja alcançável por Tab ou anunciado pelo leitor de ecrã.
 *
 * A camada tem de estar FORA de `#conteudo` (portal ou header fixo), senão
 * fica inerte a si própria.
 */
export function useFundoInerte(activo: boolean, idFundo = "conteudo"): void {
  useEffect(() => {
    if (!activo) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fundo = document.getElementById(idFundo);
    fundo?.setAttribute("inert", "");
    fundo?.setAttribute("aria-hidden", "true");

    return () => {
      document.body.style.overflow = overflowAnterior;
      fundo?.removeAttribute("inert");
      fundo?.removeAttribute("aria-hidden");
    };
  }, [activo, idFundo]);
}
