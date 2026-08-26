import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { PRIVACIDADE } from "@/content/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a Blue Magnitude recolhe, utiliza, armazena e partilha dados pessoais, de acordo com o RGPD.",
  robots: { index: true, follow: true },
};

export default function Privacidade() {
  return (
    <PaginaInterior
      credito="Legal"
      titulo={PRIVACIDADE.titulo}
      lede={PRIVACIDADE.intro}
      migalhas={[{ rotulo: "Política de privacidade" }]}
    >
      <section className="field-shell section" aria-label="Política de privacidade">
        <div className="shell grid gap-[var(--s-md)]">
          {PRIVACIDADE.seccoes.map((seccao, i) => (
            <Reveal key={seccao.titulo} delay={i * 70}>
              <h2 className="h3">{seccao.titulo}</h2>
              <div className="mt-[var(--s-xs)] grid gap-[var(--s-xs)]">
                {seccao.paragrafos.map((p, j) => (
                  <p key={j} className="corpo">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PaginaInterior>
  );
}
