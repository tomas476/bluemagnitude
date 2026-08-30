import fita from "@/content/fita-arranque.json";
import { cn } from "@/lib/cn";

/**
 * A LINHA VERDE DO SOBRE, SOLTA: so o traco, sem os cartoes por cima.
 *
 * E o mesmo caminho medido pelo `scripts/arranque-fita.py` e a MESMA animacao
 * (`.arranque__traco`, keyframes `fita-desenha`): desenha-se, fica um momento,
 * recolhe pela ponta. So muda a roupa: aqui a fita atravessa o cabecalho das
 * paginas de indice, atras do titulo, onde o fundo esta vazio.
 *
 * ⚠️ `preserveAspectRatio="none"`: a fita foi medida numa ilustracao 2200x1227
 * e o cabecalho e uma faixa larga e baixa. Esticar de proposito achata a curva
 * numa linha que varre o cabecalho de ponta a ponta, e e por isso que o traco
 * leva `vector-effect: non-scaling-stroke`, senao a espessura esticava junto.
 *
 * ⚠️ A inclinacao e por pagina, para a linha nao ir sempre para o mesmo sitio:
 * `sobe` roda uns graus contra o sentido do relogio, `desce` a favor. A
 * rotacao vive no proprio SVG com uma escala de folga para os cantos nao
 * ficarem em branco ao rodar.
 */
export function FitaSolta({
  inclinacao = "sobe",
  className,
}: {
  inclinacao?: "sobe" | "desce";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fita-solta",
        inclinacao === "desce" && "fita-solta--desce",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${fita.largura} ${fita.altura}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="arranque__traco"
          d={fita.d}
          pathLength={1}
          fill="none"
          stroke={fita.cor}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
