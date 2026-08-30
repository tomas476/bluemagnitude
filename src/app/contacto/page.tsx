import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AncorasSuaves } from "@/components/ancoras-suaves";
import { CampoLuz } from "@/components/ui/campo-luz";
import { Reveal } from "@/components/reveal";
import { ContactoForm } from "@/components/contacto-form";
import { CONTACTO, EMPRESA } from "@/content/site";
import { ROTAS } from "@/content/rotas";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Pede uma proposta gratuita à Blue Magnitude. Estrada de Pinheiros 480, Leiria. Instalações em Leiria, Santarém e Lisboa.",
};

const MENSAGEM = encodeURIComponent(
  "Olá, vi o vosso site e queria pedir uma proposta.",
);

/** Cada linha e uma ACCAO com o seu icone: escrever, WhatsApp, ligar, visitar. */
const LINHAS = [
  {
    Icone: Mail,
    rotulo: "Email",
    valor: EMPRESA.email,
    href: `mailto:${EMPRESA.email}`,
    externo: false,
  },
  {
    Icone: MessageCircle,
    rotulo: "WhatsApp",
    valor: "+351 938 719 773",
    href: `https://wa.me/${EMPRESA.whatsapp}?text=${MENSAGEM}`,
    externo: true,
  },
  {
    Icone: Phone,
    rotulo: "Ligar",
    valor: EMPRESA.telefone,
    href: `tel:${EMPRESA.telefone.replace(/\s/g, "")}`,
    externo: false,
  },
  {
    Icone: MapPin,
    rotulo: "Visitar",
    valor: EMPRESA.morada,
    href: EMPRESA.maps,
    externo: true,
  },
];

export default function Contacto() {
  return (
    <>
      <SiteNav pousadaSempre />
      <AncorasSuaves />
      <div className="nav__espaco" />

      <main id="conteudo" tabIndex={-1}>
        <CampoLuz>
          <section className="field-shell section--tight" aria-label="Contacto">
            <div className="shell">
              <nav aria-label="Caminho" className="meta">
                <a href={ROTAS.home}>Início</a> › Contacto
              </nav>

              {/* So o titulo. A frase pequena saiu (CONTACTO.lede fica no
                  site.ts sem consumidor) e o formulario subiu para debaixo
                  dele: quem chega aqui vem para pedir, nao para ler. */}
              <Reveal className="mt-[var(--s-sm)] block">
                <p className="credito">{CONTACTO.credito}</p>
                <h1 className="display mt-[var(--s-xs)] max-w-[18ch]">
                  {CONTACTO.titulo}
                </h1>
              </Reveal>

              {/* ⚠️ A ORDEM DO DOM E A DO TELEMOVEL: formulario primeiro,
                  linhas de contacto depois. Em desktop o `order` volta a
                  poe-las a esquerda e o formulario a direita. */}
              <div className="mt-[var(--s-md)] grid gap-[var(--s-lg)] lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <Reveal className="plate lg:order-2">
                  <ContactoForm />
                </Reveal>

                <div className="lg:order-1">
                  <ul className="grid gap-[var(--s-sm)]">
                    {LINHAS.map((linha, i) => {
                      const Icone = linha.Icone;
                      return (
                        <Reveal as="li" key={linha.rotulo} delay={i * 80}>
                          <a
                            className="contacto__linha"
                            href={linha.href}
                            target={linha.externo ? "_blank" : undefined}
                            rel={linha.externo ? "noopener noreferrer" : undefined}
                          >
                            <span className="contacto__icone" aria-hidden="true">
                              <Icone size={20} strokeWidth={1.75} />
                            </span>
                            <span>
                              <span className="meta block">{linha.rotulo}</span>
                              <span className="contacto__valor">{linha.valor}</span>
                            </span>
                          </a>
                        </Reveal>
                      );
                    })}
                  </ul>

                  <Reveal className="mt-[var(--s-md)]" delay={340}>
                    <p className="meta">{EMPRESA.telefoneNota}</p>
                    <p className="meta">{EMPRESA.horario}</p>
                    <p className="meta">Operações em {EMPRESA.zonas}.</p>
                  </Reveal>
                </div>
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
        </CampoLuz>
      </main>

      <SiteFooter />
    </>
  );
}
