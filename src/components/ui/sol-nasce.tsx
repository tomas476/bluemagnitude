import fita from "@/content/fita-arranque.json";
import { cn } from "@/lib/cn";

/**
 * O SOL DO LOGOTIPO A NASCER, EM CSS PURO: uma linha desenha o arco em
 * circulo e depois nascem as pontas, os sete raios, um a um, como no icone
 * deles. Vive no cabecalho dos indices, ao lado da fita verde e na mesma
 * tinta dela. No fim do ciclo o conjunto desvanece e recomeca.
 *
 * ⚠️ O ARCO NAO FECHA (300 graus), como no logotipo, onde os paineis lhe
 * passam por cima. A abertura fica em baixo.
 *
 * ⚠️ Cada raio tem as SUAS keyframes (sol-raio-1..7): um `animation-delay`
 * unico nao sabe escalonar dentro de um ciclo infinito partilhado, ja mordeu
 * no Processo (ver CONTEXTO 6b.6). Sao sete blocos estaticos no globals.css.
 *
 * ⚠️ Comprimentos REAIS no dasharray (408 no arco, 24 nos raios), nada de
 * `pathLength`: normalizado com non-scaling-stroke o Chrome parte o traco
 * em pedacos (a fita solta ja pagou para saber).
 */
const RAIOS = [
  "M 47.6 168.1 L 23.9 172.2",
  "M 55.7 106.0 L 34.0 95.9",
  "M 94.9 61.8 L 82.2 41.4",
  "M 150.0 46.0 L 150.0 22.0",
  "M 205.1 61.8 L 217.8 41.4",
  "M 244.3 106.0 L 266.0 95.9",
  "M 252.4 168.1 L 276.1 172.2",
];

export function SolNasce({ className }: { className?: string }) {
  return (
    <div className={cn("sol-nasce", className)} aria-hidden="true">
      <svg viewBox="0 0 300 300" focusable="false">
        {/* o arco: comeca em baixo a esquerda e da a volta ate baixo a
            direita, 300 graus medidos com uma folga de 30 de cada lado */}
        <path
          className="sol-nasce__arco"
          d="M 111 219 A 78 78 0 1 1 189 219"
          fill="none"
          stroke={fita.cor}
          strokeWidth="24"
          strokeLinecap="round"
        />
        {RAIOS.map((d, i) => (
          <path
            key={d}
            className={`sol-nasce__raio sol-nasce__raio--${i + 1}`}
            d={d}
            fill="none"
            stroke={fita.cor}
            strokeWidth="17"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
