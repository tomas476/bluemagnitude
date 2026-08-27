import { cn } from "@/lib/cn";

/**
 * A SETA DESENHADA À MÃO, vinda do site da imogrow (`imogrow-static/
 * paginas.css`, onde aponta da legenda para a pré-visualização do link).
 * Mesmo desenho, mesma cadência: desenha-se, fica, apaga e recomeça.
 *
 * ⚠️ `pathLength={100}` NOS DOIS TRACOS. A curva e a ponta têm comprimentos
 * reais muito diferentes; normalizados, partilham o mesmo `stroke-dasharray`
 * e a ponta pode arrancar por atraso, quando a curva já lá chegou.
 */
export function SetaMao({ className }: { className?: string }) {
  return (
    <span className={cn("seta-mao", className)} aria-hidden="true">
      <svg viewBox="0 0 84 64" fill="none" focusable="false">
        <path
          pathLength={100}
          d="M6 8 C34 10, 58 26, 70 50"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          pathLength={100}
          d="M70.8 37.0 L70 50 L59.2 42.8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
