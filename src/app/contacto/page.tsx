import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { ContactoForm } from "@/components/contacto-form";
import { CONTACTO, EMPRESA } from "@/content/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Pede uma proposta gratuita à Blue Magnitude. Estrada de Pinheiros 480, Leiria. Instalações em Leiria, Santarém e Lisboa.",
};

export default function Contacto() {
  return (
    <PaginaInterior
      credito={CONTACTO.credito}
      titulo={CONTACTO.titulo}
      lede={CONTACTO.lede}
      migalhas={[{ rotulo: "Contacto" }]}
    >
      <section className="field-shell section" aria-label="Formulário e contactos">
        <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal className="plate">
            <ContactoForm />
          </Reveal>

          <div className="grid gap-[var(--s-md)]">
            <Reveal delay={90}>
              <dl className="grid gap-[var(--s-sm)]">
                <div>
                  <dt className="meta">Morada</dt>
                  <dd className="corpo">
                    <a
                      href={EMPRESA.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {EMPRESA.morada}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="meta">Email</dt>
                  <dd className="corpo">
                    <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className="meta">Telefone</dt>
                  <dd className="corpo">
                    <a href={`tel:${EMPRESA.telefone.replace(/\s/g, "")}`}>
                      {EMPRESA.telefone}
                    </a>
                    <span className="meta block">{EMPRESA.telefoneNota}</span>
                  </dd>
                </div>
                <div>
                  <dt className="meta">Horário</dt>
                  <dd className="corpo">{EMPRESA.horario}</dd>
                </div>
                <div>
                  <dt className="meta">Zonas</dt>
                  <dd className="corpo">{EMPRESA.zonas}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={140}>
              <iframe
                title="Mapa com a localização da Blue Magnitude"
                src="https://www.google.com/maps?q=Estrada+de+Pinheiros+480,+2415-776+Leiria&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full rounded-[var(--radius-plate)]"
                style={{ aspectRatio: "4 / 3", border: 0 }}
              />
            </Reveal>
          </div>
        </div>
      </section>
    </PaginaInterior>
  );
}
