import { Reveal } from "@/components/reveal";
import { ContactoForm } from "@/components/contacto-form";
import { CONTACTO, EMPRESA } from "@/content/site";
import { ANCORAS } from "@/content/rotas";

export function Falar() {
  return (
    <section
      id={ANCORAS.contacto.slice(1)}
      className="field-deep section"
      aria-labelledby="falar-t"
    >
      <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <Reveal>
            <p className="credito" style={{ color: "var(--color-accent)" }}>
              {CONTACTO.credito}
            </p>
            <h2 id="falar-t" className="title mt-[var(--s-xs)] max-w-[20ch]">
              {CONTACTO.titulo}
            </h2>
            <p className="lede mt-[var(--s-sm)]">{CONTACTO.lede}</p>
          </Reveal>

          <Reveal className="mt-[var(--s-md)]" delay={140}>
            <ul className="grid gap-[var(--s-xs)]">
              {CONTACTO.garantias.map((g) => (
                <li key={g} className="flex items-start gap-[var(--s-xs)]">
                  <svg
                    className="mt-1 flex-none"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 8.5l3.5 3.5 7.5-8"
                      stroke="var(--color-accent)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="corpo">{g}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-[var(--s-md)]" delay={200}>
            <div className="meta grid gap-[var(--s-xs)]">
              <span>{EMPRESA.morada}</span>
              <span>{EMPRESA.horario}</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="plate" delay={90}>
          <ContactoForm />
        </Reveal>
      </div>
    </section>
  );
}
