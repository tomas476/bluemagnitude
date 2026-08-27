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
 * os sublinhados nao sao rectos e a oval nem fecha no ponto onde comecou.
 */
export function MarcaAnimada({
  className,
  tamanho = "grande",
}: {
  className?: string;
  tamanho?: "grande" | "pequena";
}) {
  return (
    <div
      className={cn(
        "marca-animada",
        tamanho === "pequena" && "marca-animada--pequena",
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
          d="M452 272 C 520 282, 640 284, 796 264"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* sublinhado de "Magnitude": mais longo e menos direito */}
        <path
          className="ma__risco ma__risco--dois"
          d="M474 427 C 646 437, 1024 439, 1304 419"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* a oval: comeca em cima a esquerda, da a volta e PASSA do ponto de
            partida sem fechar. E isso que a impede de parecer uma elipse */}
        <path
          className="ma__risco ma__risco--oval"
          d="M300 -46 C 30 -34, -108 140, -52 320 C -4 484, 580 566, 1050 540 C 1382 522, 1478 310, 1408 150 C 1342 4, 820 -62, 344 -24"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
