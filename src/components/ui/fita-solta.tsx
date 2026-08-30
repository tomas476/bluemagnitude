import type * as React from "react";
import fita from "@/content/fita-arranque.json";
import { cn } from "@/lib/cn";

/**
 * A LINHA VERDE DO SOBRE, SOLTA: so o traco, sem os cartoes por cima.
 *
 * A animacao e a de sempre (desenha-se, fica um momento, recolhe pela ponta),
 * mas com keyframes proprias: aqui o AVANCO e mais lento do que o recuo,
 * porque em cima do titulo o gesto pede calma (ver .fita-solta no globals).
 *
 * Dois desenhos:
 * · `desce` / `sobe`: o caminho medido da ilustracao do Sobre
 *   (`fita-arranque.json`), esticado a atravessar o cabecalho e rodado uns
 *   graus por pagina.
 * · `diagonal` (projetos): um caminho proprio, desenhado a mao num viewBox
 *   0..100: entra pelo CANTO INFERIOR ESQUERDO da caixa, faz duas ondas no
 *   meio e sai na parede direita quase no topo. Pedido do Tomas depois de a
 *   curva do Sobre esticada ler quase horizontal em desktop.
 *
 * ⚠️ `preserveAspectRatio="none"` em todos: o cabecalho e uma faixa larga e
 * baixa e a curva estica de proposito. Por isso o traco leva `vector-effect:
 * non-scaling-stroke`, senao a espessura esticava junto.
 */
/* ⚠️ SEM `pathLength`, COM O COMPRIMENTO REAL. O atalho de normalizar o
   comprimento a 1 com `pathLength` parte a linha em pedacos quando o traco
   leva `non-scaling-stroke`: o browser escala mal o tracejado da animacao.
   O comprimento verdadeiro de cada caminho (medido por amostragem das
   cubicas) entra como `--traco`, no mesmo padrao da marca-animada. */
const DESENHOS = {
  sobe: { viewBox: `0 0 ${fita.largura} ${fita.altura}`, d: fita.d, comprimento: 2936 },
  desce: { viewBox: `0 0 ${fita.largura} ${fita.altura}`, d: fita.d, comprimento: 2936 },
  /* ⚠️ COORDENADAS GRANDES DE PROPOSITO (0..3000 e nao 0..100): quando o
     viewBox e AMPLIADO para o ecra, o Chrome escala mal o tracejado com
     non-scaling-stroke e a linha parte em pedacos; reduzido, porta-se bem.
     E o mesmo desenho, multiplicado por 30. */
  diagonal: {
    viewBox: "0 0 3000 3000",
    d: "M -180 3240 C 360 2880, 780 2970, 1020 2520 C 1260 2070, 990 1830, 1290 1470 C 1590 1110, 1980 1860, 2310 1380 C 2580 990, 2700 570, 3210 180",
    comprimento: 5193,
  },
} as const;

export function FitaSolta({
  inclinacao = "sobe",
  className,
}: {
  inclinacao?: keyof typeof DESENHOS;
  className?: string;
}) {
  const desenho = DESENHOS[inclinacao];
  return (
    <div
      className={cn(
        "fita-solta",
        inclinacao === "desce" && "fita-solta--desce",
        inclinacao === "diagonal" && "fita-solta--diagonal",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox={desenho.viewBox} preserveAspectRatio="none" focusable="false">
        <path
          className="fita-solta__traco"
          d={desenho.d}
          style={{ "--traco": desenho.comprimento } as React.CSSProperties}
          fill="none"
          stroke={fita.cor}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
