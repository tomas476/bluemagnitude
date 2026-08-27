"use client";

import * as React from "react";
import {
  BatteryCharging,
  Euro,
  Leaf,
  ShieldCheck,
  Sun,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * ⚠️ Os icones vivem AQUI e escolhem-se por nome.
 * Um componente de servidor nao pode passar uma funcao a um componente de
 * cliente, e um icone do lucide e uma funcao. Por isso a pagina manda o nome e
 * o mapa vive deste lado da fronteira.
 */
const ICONES: Record<string, LucideIcon> = {
  sol: Sun,
  euro: Euro,
  bateria: BatteryCharging,
  escudo: ShieldCheck,
  folha: Leaf,
  ar: Wind,
  chave: Wrench,
};

export type NomeIcone = keyof typeof ICONES;

export type ItemPainel = {
  id: string;
  titulo: string;
  descricao?: string;
  /** fotografia de fundo. Sem ela, o painel usa o degradê da marca. */
  imagem?: string;
  href?: string;
  icone?: string;
};

/**
 * Paineis expansiveis.
 *
 * Portado do `interactive-selector` que o Tomas mandou, com a mesma geometria:
 * o painel activo cresce para flex 7 contra 1 dos outros, transicao de 700ms, a
 * imagem de fundo passa de "auto 120%" a "auto 100%" e o rotulo entra a
 * deslizar. O que mudou, e porque:
 *
 * · `react-icons` fora, `lucide-react` dentro. E o que o projecto ja tem.
 * · `styled-jsx` fora: as keyframes vivem no globals.css, como o resto.
 * · A paleta e a nossa. O activo distingue-se por uma aresta de acento, nao por
 *   uma borda branca.
 * · EM ECRA PEQUENO A GEOMETRIA VIRA NA VERTICAL. Uma fila de seis paineis a
 *   390px da tiras de 60px onde nao cabe nada, e este site revê-se no telemovel.
 *   A logica e a mesma, muda o eixo.
 * · Sem numeracao 01/02/03: foi pedido, e numeracao decorativa de seccoes esta
 *   na lista de banidos.
 * · Cada painel e um <button> real, com setas do teclado a trocar de painel.
 */
export function Paineis({
  itens,
  rotuloLista,
  className,
  variante = "foto",
}: {
  itens: ReadonlyArray<ItemPainel>;
  rotuloLista: string;
  className?: string;
  /**
   * "foto" tem fotografia de fundo e o rotulo assenta em baixo, sobre a subida
   * de tinta. "icone" nao tem fotografia, e ai o rotulo fica ao centro: um
   * painel liso com o texto encostado ao fundo e meio ecra de vazio azul.
   */
  variante?: "foto" | "icone";
}) {
  const [activo, setActivo] = React.useState(0);
  const [entrou, setEntrou] = React.useState<number[]>([]);
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  // entrada escalonada. ⚠️ 100ms e nao os 180ms do original: com seis paineis
  // o ultimo entrava a mais de um segundo do primeiro, e a espera lia-se como
  // o site a arrastar-se.
  React.useEffect(() => {
    const relogios = itens.map((_, i) =>
      setTimeout(() => setEntrou((antes) => [...antes, i]), 100 * i),
    );
    return () => relogios.forEach(clearTimeout);
  }, [itens]);

  function aoTeclar(evento: React.KeyboardEvent, i: number) {
    const proximo =
      evento.key === "ArrowRight" || evento.key === "ArrowDown"
        ? (i + 1) % itens.length
        : evento.key === "ArrowLeft" || evento.key === "ArrowUp"
          ? (i - 1 + itens.length) % itens.length
          : null;
    if (proximo === null) return;
    evento.preventDefault();
    setActivo(proximo);
    refs.current[proximo]?.focus();
  }

  return (
    <div className={className}>
      <ul
        className={variante === "icone" ? "paineis paineis--icone" : "paineis"}
        role="tablist"
        aria-label={rotuloLista}
      >
        {itens.map((item, i) => {
          const eActivo = i === activo;
          const Icone = item.icone ? ICONES[item.icone] : undefined;

          return (
            <li
              key={item.id}
              className="paineis__celula"
              data-activo={eActivo ? "true" : "false"}
              data-entrou={entrou.includes(i) ? "true" : "false"}
            >
              <button
                ref={(elemento) => {
                  refs.current[i] = elemento;
                }}
                type="button"
                role="tab"
                aria-selected={eActivo}
                tabIndex={eActivo ? 0 : -1}
                className="paineis__botao"
                style={
                  item.imagem
                    ? ({ backgroundImage: `url("${item.imagem}")` } as React.CSSProperties)
                    : undefined
                }
                onClick={() => setActivo(i)}
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                onKeyDown={(evento) => aoTeclar(evento, i)}
              >
                <span className="paineis__tinta" aria-hidden="true" />

                <span className="paineis__rotulo">
                  {Icone ? (
                    <span className="paineis__icone" aria-hidden="true">
                      <Icone size={20} strokeWidth={1.75} />
                    </span>
                  ) : null}
                  <span className="paineis__texto">
                    <span className="paineis__titulo">{item.titulo}</span>
                    {item.descricao ? (
                      <span className="paineis__sub">{item.descricao}</span>
                    ) : null}
                  </span>
                </span>
              </button>

              {item.href ? (
                <a className="paineis__ligacao" href={item.href}>
                  Ver instalação
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
