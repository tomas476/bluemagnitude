import { CarrosselReels } from "@/components/painel/ui/CarrosselReels";
import { Reveal } from "@/components/reveal";
import { REELS, ROTULOS_REELS } from "@/content/reels";
import { EMPRESA } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

/** Nao ha seccao sem reels: um leque vazio denuncia abandono. */
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

      <div className="mt-[var(--s-lg)]">
        <CarrosselReels
          itens={REELS}
          rotulos={ROTULOS_REELS}
          painel={
            <a
              className="btn"
              href={EMPRESA.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Seguir {EMPRESA.instagramHandle}
            </a>
          }
        />
      </div>
    </section>
  );
}
