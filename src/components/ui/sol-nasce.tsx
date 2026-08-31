import { caminho } from "@/lib/caminho";
import { cn } from "@/lib/cn";

/**
 * O SOL DO LOGOTIPO A NASCER: o circulo desenha-se e os raios saltam um a um,
 * num video do Higgsfield passado a WebP animado com alfa pelo
 * `scripts/sol-nasce.py` (o mesmo caminho do `marca-nasce.webp`: alfa por
 * canal, chao 0,07, 8 niveis, ping-pong). Circulo COMPLETO e centrado, por
 * decisao do Tomas; substitui a fita verde nos cabecalhos dos indices.
 *
 * ⚠️ <picture> e nao duas <img>: o movimento reduzido troca para o PNG parado
 * pelo browser, sem depender de CSS (a licao do marca-nasce.tsx).
 */
export function SolNasce({ className }: { className?: string }) {
  return (
    <div className={cn("sol-nasce", className)} aria-hidden="true">
      <picture>
        <source
          media="(prefers-reduced-motion: reduce)"
          srcSet={caminho("/marca/sol-parado.png")}
        />
        <img src={caminho("/marca/sol-nasce.webp")} alt="" decoding="async" />
      </picture>
    </div>
  );
}
