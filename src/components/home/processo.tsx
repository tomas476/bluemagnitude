import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { PROCESSO } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

/**
 * O PERCURSO, E A LINHA QUE SE DESENHA ENTRE OS PASSOS.
 *
 * ⚠️ EM TELEMOVEL NAO HA LINHA POR CIMA DO PASSO 1. Os quatro passos empilham,
 * e uma linha a abrir o primeiro lia-se como o fim da seccao anterior. As tres
 * que sobram sao ligacoes: passo 1 para 2, 2 para 3, 3 para 4.
 *
 * ⚠️ A LINHA E UM <span> COM scaleX E NAO UM border a crescer. Um border
 * animado obriga a repintar a caixa toda a cada frame; um scaleX corre no
 * compositor. E, mais importante, um <span> de 2px esticado e uma linha RECTA
 * por construcao: nao ha maneira de sair torta.
 *
 * ⚠️ AS KEYFRAMES SAO GERADAS AQUI, no servidor, uma por posicao. Nao chega uma
 * keyframe partilhada com um animation-delay por linha: no regresso a ordem
 * INVERTE-SE (a ultima a ser desenhada e a primeira a recolher), e um delay
 * unico por elemento nao sabe inverter. E o mesmo padrao da ListaLuz: um
 * <style precedence> com href, que o React desduplica.
 *
 * Em ecra grande os quatro passos ficam lado a lado e a regua cortada em quatro
 * e o desenho: la o <span> desaparece e volta o border-top nos quatro.
 */

/** Quanto demora uma linha a ser desenhada. */
const DESENHO = 520;
/** Distancia entre arranques. Maior do que o desenho seria uma fila de pausas. */
const PASSO = 560;
/** Quanto tempo as tres ficam desenhadas antes de comecarem a voltar. */
const ESPERA = 900;
/** E quanto tempo o ecra fica limpo antes de recomecar. */
const DESCANSO = 900;

/** Quando a ultima acaba de ser desenhada, a recolha comeca. */
const REGRESSO = 2 * PASSO + DESENHO + ESPERA;
const CICLO = REGRESSO + 2 * PASSO + DESENHO + DESCANSO;

function keyframes(quantas: number) {
  const pct = (ms: number) => ((ms / CICLO) * 100).toFixed(2);
  const blocos: string[] = [];

  for (let j = 0; j < quantas; j += 1) {
    const abre = j * PASSO;
    const fecha = REGRESSO + (quantas - 1 - j) * PASSO;

    blocos.push(`@keyframes passo-linha-${j} {
0% { transform: scaleX(0) }
${pct(abre)}% { transform: scaleX(0) }
${pct(abre + DESENHO)}% { transform: scaleX(1) }
${pct(fecha)}% { transform: scaleX(1) }
${pct(fecha + DESENHO)}% { transform: scaleX(0) }
100% { transform: scaleX(0) }
}`);
  }

  return blocos.join("\n");
}

export function Processo() {
  const linhas = PROCESSO.passos.length - 1;

  return (
    <section
      id={ANCORAS.processo.slice(1)}
      className="field-plate-2 section"
      aria-labelledby="processo-t"
    >
      <style precedence="medium" href={`passo-linha-${linhas}`}>
        {keyframes(linhas)}
      </style>

      <div className="shell">
        <CabecalhoSeccao
          credito={PROCESSO.credito}
          titulo={PROCESSO.titulo}
          tituloId="processo-t"
          lede={PROCESSO.lede}
        />

        <ol className="mt-[calc(var(--s-lg)+var(--s-sm))] grid gap-[var(--s-md)] sm:grid-cols-2 lg:grid-cols-4">
          {PROCESSO.passos.map((passo, i) => (
            <Reveal as="li" key={passo.titulo} className="passo" delay={i * 90}>
              {i > 0 ? (
                <span
                  className="passo__linha"
                  aria-hidden="true"
                  style={{
                    animationName: `passo-linha-${i - 1}`,
                    animationDuration: `${CICLO}ms`,
                    animationIterationCount: "infinite",
                    animationTimingFunction: "var(--ease-glide)",
                  }}
                />
              ) : null}

              <div className="passo__corpo">
                <span className="figure" style={{ fontSize: "var(--t-label)" }}>
                  Passo {i + 1}
                </span>
                <h3 className="h3 mt-[var(--s-xs)]">{passo.titulo}</h3>
                <p className="corpo mt-[var(--s-xs)]">{passo.texto}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
