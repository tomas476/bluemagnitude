import type { Metadata } from "next";
import { PaginaInterior } from "@/components/ui/pagina";
import { Reveal } from "@/components/reveal";
import { ContactoForm } from "@/components/contacto-form";
import { MarcaAnimada } from "@/components/ui/marca-animada";
import { CONTACTO, EMPRESA } from "@/content/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Pede uma proposta gratuita à Blue Magnitude. Estrada de Pinheiros 480, Leiria. Instalações em Leiria, Santarém e Lisboa.",
};

const MENSAGEM = encodeURIComponent(
  "Olá, vi o vosso site e queria pedir uma proposta.",
);

/** Cada linha de contacto e uma ACCAO, nao texto morto. */
const LINHAS = [
  {
    rotulo: "Escrever",
    valor: EMPRESA.email,
    href: `mailto:${EMPRESA.email}`,
    nota: "Resposta por email",
    externo: false,
  },
  {
    rotulo: "WhatsApp",
    valor: "+351 938 719 773",
    href: `https://wa.me/${EMPRESA.whatsapp}?text=${MENSAGEM}`,
    nota: "Conversa já preenchida",
    externo: true,
  },
  {
    rotulo: "Ligar",
    valor: EMPRESA.telefone,
    href: `tel:${EMPRESA.telefone.replace(/\s/g, "")}`,
    nota: EMPRESA.telefoneNota,
    externo: false,
  },
  {
    rotulo: "Visitar",
    valor: EMPRESA.morada,
    href: EMPRESA.maps,
    nota: EMPRESA.horario,
    externo: true,
  },
];

export default function Contacto() {
  return (
    <PaginaInterior
      credito={CONTACTO.credito}
      titulo={CONTACTO.titulo}
      lede={CONTACTO.lede}
      migalhas={[{ rotulo: "Contacto" }]}
    >
      <section className="field-shell section" aria-label="Formulário e contactos">
        <div className="shell grid gap-[var(--s-lg)] lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {/* o formulario vem primeiro no DOM: em telemovel e a razao de a
              pessoa estar nesta pagina, e o logotipo animado nao pode empurrar
              o campo do nome para fora do ecra */}
          <Reveal className="plate lg:order-2">
            <ContactoForm />
          </Reveal>

          <div className="lg:order-1">
            <Reveal className="hidden lg:block">
              <MarcaAnimada />
            </Reveal>

            <ul className="mt-[var(--s-md)] grid gap-[var(--s-xs)]">
              {LINHAS.map((linha, i) => (
                <Reveal as="li" key={linha.rotulo} delay={i * 80}>
                  <a
                    className="contacto__linha"
                    href={linha.href}
                    target={linha.externo ? "_blank" : undefined}
                    rel={linha.externo ? "noopener noreferrer" : undefined}
                  >
                    <span className="contacto__rotulo">{linha.rotulo}</span>
                    <span className="contacto__valor">
                      {linha.valor}
                      <span className="meta block">{linha.nota}</span>
                    </span>
                    <svg
                      className="contacto__seta"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 12L12 2M12 2H4.5M12 2v7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </Reveal>
              ))}
            </ul>

            <Reveal className="mt-[var(--s-md)] lg:hidden" delay={320}>
              <MarcaAnimada tamanho="pequena" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="field-shell section--tight" aria-label="Onde estamos">
        <div className="shell">
          <Reveal>
            <iframe
              title="Mapa com a localização da Blue Magnitude"
              src="https://www.google.com/maps?q=Estrada+de+Pinheiros+480,+2415-776+Leiria&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full rounded-[var(--radius-plate)]"
              style={{
                aspectRatio: "21 / 9",
                minHeight: "18rem",
                border: 0,
                boxShadow: "inset 0 0 0 1px var(--color-line)",
              }}
            />
          </Reveal>
        </div>
      </section>
    </PaginaInterior>
  );
}
