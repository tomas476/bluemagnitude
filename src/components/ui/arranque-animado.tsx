import fita from "@/content/fita-arranque.json";
import { caminho } from "@/lib/caminho";
import { cn } from "@/lib/cn";

/**
 * A ILUSTRACAO DO ARRANQUE DO SOBRE, EM DUAS CAMADAS, PARA A FITA SE DESENHAR.
 *
 * A ilustracao veio do Higgsfield como um JPG unico, com o fundo, a fita verde
 * e os tres cartoes ja pintados, e sem ficheiro fonte. Para a fita poder ser
 * animada, o `scripts/arranque-fita.py` separa-a em duas: um PNG/WEBP so com
 * os cartoes (o resto transparente) e o caminho da fita em SVG, medido a
 * partir dos pixeis verdes. Aqui a fita e desenhada POR BAIXO dos cartoes,
 * exactamente onde estava pintada.
 *
 * ⚠️ A GEOMETRIA DAS DUAS CAMADAS TEM DE SER A MESMA, SENAO A FITA SAI DE
 * BAIXO DOS CARTOES. A imagem e `object-fit: cover` com `object-position:
 * right bottom` (regras do .arranque no globals.css); o equivalente exacto
 * num SVG e `preserveAspectRatio="xMaxYMax slice"`. Quando a caixa tem a
 * mesma proporcao do viewBox, como acontece em telemovel, os dois coincidem
 * de qualquer forma.
 *
 * ⚠️ `pathLength={1}` normaliza o comprimento do traco: o dasharray e o
 * dashoffset passam a contar de 0 a 1 e a keyframe nao precisa de saber
 * quantos pixeis tem a curva. Se o caminho mudar, a animacao continua certa.
 */
export function ArranqueAnimado({ className }: { className?: string }) {
  return (
    <div className={cn("arranque__ilustra", className)} aria-hidden="true">
      <svg
        className="arranque__fita"
        viewBox={`0 0 ${fita.largura} ${fita.altura}`}
        preserveAspectRatio="xMaxYMax slice"
        focusable="false"
      >
        <path
          className="arranque__traco"
          d={fita.d}
          pathLength={1}
          fill="none"
          stroke={fita.cor}
          strokeWidth={fita.espessura}
          strokeLinecap="round"
        />
      </svg>

      <img
        className="arranque__cartoes"
        src={caminho("/sobre/arranque-cartoes.webp")}
        alt=""
        width={fita.largura}
        height={fita.altura}
        decoding="async"
      />
    </div>
  );
}
