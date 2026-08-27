"use client";

import * as React from "react";
import { SERVICOS } from "@/content/site";
import { servicoHref } from "@/content/rotas";

const VELOCIDADE = 0.55; // px por frame, o andamento lento aprovado

/**
 * Os servicos em fita horizontal, sempre em movimento para a esquerda, E
 * arrastavel: se um cartao com interesse ja passou, arrasta-se para tras com o
 * dedo ou com o rato e ele volta.
 *
 * A lista e desenhada duas vezes e o deslocamento vive em modulo da largura de
 * UMA copia: quando a primeira sai do ecra, a segunda esta exactamente onde a
 * primeira comecou, e o ciclo fecha sem salto, em qualquer dos sentidos.
 *
 * Um so requestAnimationFrame move a fita por transform. O arrasto soma o
 * delta do ponteiro ao mesmo deslocamento, por isso arrastar e andar sozinho
 * nunca lutam um com o outro. touch-action: pan-y deixa o scroll vertical da
 * pagina passar; um arrasto de mais de 6px engole o clique para o cartao nao
 * abrir sem querer.
 */
export function FitaServicos() {
  const pistaRef = React.useRef<HTMLUListElement | null>(null);
  const meio = React.useRef(0);
  const desloc = React.useRef(0);
  const aArrastar = React.useRef(false);
  const parado = React.useRef(false);
  const arrastou = React.useRef(0);
  const ultimoX = React.useRef(0);

  React.useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const medir = () => {
      meio.current = pista.scrollWidth / 2;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(pista);

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vivo = true;
    const passo = () => {
      if (!vivo) return;
      if (!aArrastar.current && !parado.current && !reduzido) {
        desloc.current -= VELOCIDADE;
      }
      const m = meio.current;
      if (m > 0) {
        // modulo nos dois sentidos: a fita e um anel
        if (desloc.current <= -m) desloc.current += m;
        if (desloc.current > 0) desloc.current -= m;
      }
      pista.style.transform = `translate3d(${desloc.current}px, 0, 0)`;
      requestAnimationFrame(passo);
    };
    const pedido = requestAnimationFrame(passo);

    return () => {
      vivo = false;
      cancelAnimationFrame(pedido);
      ro.disconnect();
    };
  }, []);

  function aoDescer(evento: React.PointerEvent) {
    aArrastar.current = true;
    arrastou.current = 0;
    ultimoX.current = evento.clientX;
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
  }

  function aoMover(evento: React.PointerEvent) {
    if (!aArrastar.current) return;
    const dx = evento.clientX - ultimoX.current;
    ultimoX.current = evento.clientX;
    desloc.current += dx;
    arrastou.current += Math.abs(dx);
  }

  function aoLargar() {
    aArrastar.current = false;
  }

  const cartoes = (duplicado: boolean) =>
    SERVICOS.map((s) => (
      <li key={`${duplicado ? "b" : "a"}-${s.slug}`} className="fita__item">
        <a
          href={servicoHref(s.slug)}
          className="fita__cartao"
          tabIndex={duplicado ? -1 : undefined}
          draggable={false}
        >
          <div className="fita__moldura">
            <img
              src={s.imagem}
              alt={duplicado ? "" : s.imagemAlt}
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

  return (
    <div
      className="fita"
      onPointerDown={aoDescer}
      onPointerMove={aoMover}
      onPointerUp={aoLargar}
      onPointerCancel={aoLargar}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") parado.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") parado.current = false;
        aoLargar();
      }}
      onClickCapture={(evento) => {
        // um arrasto nao e um clique
        if (arrastou.current > 6) {
          evento.preventDefault();
          evento.stopPropagation();
        }
      }}
    >
      <ul ref={pistaRef} className="fita__pista">
        {cartoes(false)}
        <li aria-hidden="true" className="contents">
          <ul className="contents">{cartoes(true)}</ul>
        </li>
      </ul>
    </div>
  );
}
