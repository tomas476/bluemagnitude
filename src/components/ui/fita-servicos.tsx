"use client";

import * as React from "react";
import { SERVICOS } from "@/content/site";
import { servicoHref } from "@/content/rotas";

/** px por frame do avanco automatico. O andamento lento aprovado. */
const VELOCIDADE = 0.55;

/** quanto tempo depois do ultimo gesto o automatico volta a pegar */
const RETOMA_MS = 1400;

/**
 * Os servicos em fita horizontal, sempre em movimento para a esquerda.
 *
 * ⚠️ O ARRASTO NO TELEMOVEL E SCROLL NATIVO, E ESSA E A CORRECCAO INTEIRA.
 * As duas primeiras versoes liam `pointermove` e escreviam um `transform`.
 * Em iOS isso nunca vai colar ao dedo: com `touch-action: pan-y` o browser
 * fica a decidir de quem e o gesto durante os primeiros pixeis, retem os
 * eventos, e a meio de um arrasto pode mandar `pointercancel` e ficamos sem
 * gesto nenhum. O resultado era a fita a saltar e a lutar com o dedo.
 * Aqui a caixa e um `overflow-x: auto` verdadeiro: quem arrasta e o browser,
 * com a inercia dele, 1:1 por construcao. O automatico limita-se a somar ao
 * `scrollLeft`, e cala-se enquanto houver dedo em cima.
 *
 * ⚠️ A LISTA APARECE TRES VEZES, nao duas. Com duas copias o `scrollLeft`
 * chega a zero quando se arrasta para tras, o browser faz o efeito de
 * elastico e a inercia morre. Com tres, vive-se sempre no terco do meio e ha
 * uma copia inteira de folga para cada lado.
 *
 * ⚠️ O RATO CONTINUA A ARRASTAR, porque num ecra grande nao ha gesto nativo
 * horizontal: ai o `pointermove` escreve no `scrollLeft`, que e a mesma coisa
 * que o dedo faz, sem transform nenhum pelo meio.
 *
 * As SETAS dos lados andam um cartao de cada vez, por `scrollBy` suave, e
 * calam o automatico como qualquer outro gesto. O anel das tres copias
 * garante que ha sempre para onde ir nos dois sentidos.
 */
export function FitaServicos() {
  const caixaRef = React.useRef<HTMLDivElement | null>(null);
  const unidade = React.useRef(0);
  const paradoAte = React.useRef(0);
  const comRato = React.useRef(false);
  const ultimoX = React.useRef(0);

  React.useEffect(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;

    const medir = () => {
      unidade.current = caixa.scrollWidth / 3;
      // arranca no terco do meio, para haver folga nos dois sentidos
      if (caixa.scrollLeft < 1) caixa.scrollLeft = unidade.current;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(caixa);

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vivo = true;
    let pedido = 0;

    const passo = () => {
      if (!vivo) return;
      const u = unidade.current;

      if (u > 0) {
        // o anel: volta-se ao terco do meio antes de chegar a qualquer bordo
        if (caixa.scrollLeft < u * 0.5) caixa.scrollLeft += u;
        else if (caixa.scrollLeft > u * 1.5) caixa.scrollLeft -= u;
      }

      if (!reduzido && performance.now() > paradoAte.current) {
        caixa.scrollLeft += VELOCIDADE;
      }

      pedido = requestAnimationFrame(passo);
    };
    pedido = requestAnimationFrame(passo);

    /* qualquer gesto (dedo, roda, teclado) cala o automatico e ele so volta
       um bocado depois do ultimo movimento */
    const adiar = () => {
      paradoAte.current = performance.now() + RETOMA_MS;
    };
    caixa.addEventListener("touchstart", adiar, { passive: true });
    caixa.addEventListener("touchmove", adiar, { passive: true });
    caixa.addEventListener("wheel", adiar, { passive: true });

    return () => {
      vivo = false;
      cancelAnimationFrame(pedido);
      ro.disconnect();
      caixa.removeEventListener("touchstart", adiar);
      caixa.removeEventListener("touchmove", adiar);
      caixa.removeEventListener("wheel", adiar);
    };
  }, []);

  function aoDescer(evento: React.PointerEvent) {
    if (evento.pointerType !== "mouse") return;
    comRato.current = true;
    ultimoX.current = evento.clientX;
    paradoAte.current = performance.now() + RETOMA_MS;
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
  }

  function aoMover(evento: React.PointerEvent) {
    if (!comRato.current) return;
    const caixa = caixaRef.current;
    if (!caixa) return;
    caixa.scrollLeft -= evento.clientX - ultimoX.current;
    ultimoX.current = evento.clientX;
    paradoAte.current = performance.now() + RETOMA_MS;
  }

  function aoLargar() {
    comRato.current = false;
  }

  /** um cartao de cada vez: a largura do item mede-se na hora, que ela muda
      com o ecra */
  function saltar(sentido: 1 | -1) {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const item = caixa.querySelector<HTMLElement>(".fita__item");
    const passo = item ? item.offsetWidth : caixa.clientWidth * 0.8;
    paradoAte.current = performance.now() + RETOMA_MS * 2;
    caixa.scrollBy({ left: sentido * passo, behavior: "smooth" });
  }

  const cartoes = (copia: number) =>
    SERVICOS.map((s) => (
      <li key={`${copia}-${s.slug}`} className="fita__item">
        <a
          href={servicoHref(s.slug)}
          className="fita__cartao"
          tabIndex={copia === 0 ? undefined : -1}
          aria-hidden={copia === 0 ? undefined : true}
          draggable={false}
        >
          <div className="fita__moldura">
            <img
              src={s.imagem}
              alt={copia === 0 ? s.imagemAlt : ""}
              width={890}
              height={600}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="fita__foto"
            />
            <h3 className="fita__titulo">{s.nome}</h3>
          </div>
          <span className="btn-quiet fita__accao">Ver serviço</span>
        </a>
      </li>
    ));

  const seta = (sentido: 1 | -1) => (
    <button
      type="button"
      className={`fita__seta ${sentido === 1 ? "fita__seta--dir" : "fita__seta--esq"}`}
      aria-label={sentido === 1 ? "Serviços seguintes" : "Serviços anteriores"}
      onClick={() => saltar(sentido)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={sentido === 1 ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <div className="fita-conjunto">
      {seta(-1)}
      {seta(1)}
    <div
      ref={caixaRef}
      className="fita"
      onPointerDown={aoDescer}
      onPointerMove={aoMover}
      onPointerUp={aoLargar}
      onPointerCancel={aoLargar}
      onPointerLeave={aoLargar}
      onMouseEnter={() => {
        paradoAte.current = performance.now() + 1e9;
      }}
      onMouseLeave={() => {
        paradoAte.current = performance.now();
      }}
    >
      <ul className="fita__pista">
        {cartoes(0)}
        {cartoes(1)}
        {cartoes(2)}
      </ul>
    </div>
    </div>
  );
}
