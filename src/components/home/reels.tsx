import { Carrossel } from "@/components/ui/carrossel";
import { Reveal } from "@/components/reveal";
import { REELS, REEL_DESTAQUE, ROTULOS_REELS } from "@/content/reels";
import { EMPRESA } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

/**
 * Nao ha seccao sem reels: um leque vazio denuncia abandono.
 *
 * ⚠️ O CARROSSEL FICA FORA DA `.shell`. O palco tem `overflow: hidden` e os
 * cartoes laterais chegam ao bordo: com a margem lateral da coluna de leitura
 * por fora, os das pontas ficavam cortados a meia distancia do bordo do ecra e
 * a leitura de profundidade morria. Aqui o corte acontece no bordo do ecra, que
 * e onde ele nao se le como corte.
 */
export function Reels() {
  if (REELS.length === 0) return null;

  return (
    <section
      id={ANCORAS.reels.slice(1)}
      className="field-deep section"
      aria-labelledby="reels-t"
    >
      <div className="shell">
        <Reveal>
          <p className="credito" style={{ color: "var(--color-accent)" }}>
            Instagram
          </p>
          <h2 id="reels-t" className="title mt-[var(--s-xs)] max-w-[22ch]">
            Acompanha-nos nas redes
          </h2>
        </Reveal>
      </div>

      <Reveal className="mt-[var(--s-lg)]">
        <Carrossel
          cartoes={REELS}
          inicial={REEL_DESTAQUE}
          rotulos={{ ...ROTULOS_REELS, posicoes: [...ROTULOS_REELS.posicoes] }}
        />
      </Reveal>

      <div className="shell">
        <Reveal delay={120} className="mt-[var(--s-md)]">
          <a
            className="btn-quiet"
            href={EMPRESA.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Seguir {EMPRESA.instagramHandle}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
