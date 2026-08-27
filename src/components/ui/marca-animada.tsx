import { EMPRESA } from "@/content/site";
import { caminho } from "@/lib/caminho";
import { cn } from "@/lib/cn";

/**
 * O gesto da marca: o logotipo deles com traco desenhado a mao por cima.
 *
 * Ciclo: sublinha "Blue", sublinha "Magnitude", circunda tudo com uma oval de
 * uma penada, respira, e desfaz pela ordem inversa.
 *
 * ⚠️ O logotipo e do cliente e NAO se redesenha. O que aqui se desenha e o
 * traco, uma camada por cima do PNG original dele.
 *
 * Tudo em CSS: tres <path> com stroke-dashoffset e keyframes. A imperfeicao e
 * de proposito, o traco tem de ler-se como mao e nao como forma geometrica:
 * o traco e LIMPO, uma penada fluida como um motion graphic, so com a oval a
 * nao fechar exactamente no ponto de partida para ainda se ler como gesto.
 */
export function MarcaAnimada({
  className,
  tamanho = "grande",
}: {
  className?: string;
  tamanho?: "grande" | "media" | "pequena";
}) {
  return (
    <div
      className={cn(
        "marca-animada",
        tamanho === "pequena" && "marca-animada--pequena",
        tamanho === "media" && "marca-animada--media",
        className,
      )}
    >
      <img
        src={caminho("/marca/logo-cor.png")}
        alt={`${EMPRESA.nome}, ${EMPRESA.claim}`}
        width={1305}
        height={469}
        className="marca-animada__logo"
        decoding="async"
      />

      {/* O viewBox e o TAMANHO REAL do PNG do logotipo (1305x469) e o SVG assenta
          exactamente por cima dele, com overflow visivel para a oval poder sair
          fora. As coordenadas foram medidas no proprio ficheiro: "Blue" ocupa
          x 449 a 791 e assenta em y 250; "Magnitude" vai de x 470 a 1300 e
          assenta em y 412, com a assinatura a comecar em y 436. */}
      <svg
        className="marca-animada__traco"
        viewBox="0 0 1305 469"
        fill="none"
        aria-hidden="true"
      >
        {/* sublinhado de "Blue": nao e recto, sobe um nada no fim */}
        <path
          className="ma__risco ma__risco--um"
          d="M452 268 C 560 277, 690 277, 796 266"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* sublinhado de "Magnitude": mais longo e menos direito */}
        <path
          className="ma__risco ma__risco--dois"
          d="M472 428 C 700 439, 1080 439, 1302 425"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* a oval: comeca em cima a esquerda, da a volta e PASSA do ponto de
            partida sem fechar. E isso que a impede de parecer uma elipse */}
        <path
          className="ma__risco ma__risco--oval"
          d="M900 -30 C 480 -66, -40 30, -40 234 C -40 428, 430 505, 780 494 C 1180 482, 1372 372, 1372 214 C 1372 70, 1120 -14, 880 -26"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
