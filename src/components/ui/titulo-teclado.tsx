"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const PASSO = 45;

/**
 * Titulo escrito a maquina, que fica escrito no fim.
 *
 * ⚠️ O texto COMPLETO esta sempre no DOM. As letras entram por opacity, uma a
 * uma, com um animation-delay por indice. Se as letras fossem acrescentadas por
 * JavaScript, o leitor de ecra e o motor de busca apanhavam a frase a meio, e o
 * h1 de uma pagina de servico e exactamente aquilo por que ela e encontrada.
 *
 * O cursor e um pseudo-elemento que se apaga quando a escrita acaba.
 */
export function TituloTeclado({
  texto,
  className,
  as: Tag = "h1",
}: {
  texto: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  const letras = React.useMemo(() => Array.from(texto), [texto]);
  const total = letras.length * PASSO;

  return (
    <Tag
      className={cn("teclado", className)}
      style={{ "--tecla-fim": `${total}ms` } as React.CSSProperties}
    >
      <span className="sr-so-leitor">{texto}</span>
      <span aria-hidden="true">
        {letras.map((letra, i) => (
          <span
            key={`${letra}-${i}`}
            className="teclado__l"
            style={{ animationDelay: `${i * PASSO}ms` }}
          >
            {letra === " " ? " " : letra}
          </span>
        ))}
        <span
          className="teclado__cursor"
          /* o blink comeca ja, o apagar so no fim: um atraso por animacao */
          style={{ animationDelay: `0ms, ${total}ms` }}
        />
      </span>
    </Tag>
  );
}
