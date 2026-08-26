import { Marca } from "@/components/marca";
import { EMPRESA, SERVICOS } from "@/content/site";
import { ROTAS, servicoHref } from "@/content/rotas";

const ANO = 2026;

function Social({
  href,
  rotulo,
  children,
}: {
  href: string;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={rotulo}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full"
      style={{ boxShadow: "inset 0 0 0 1px var(--field-line-strong)" }}
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="field-deep">
      <div className="shell section--tight">
        <div className="grid gap-[var(--s-lg)] sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Marca variante="branco" className="h-12 w-auto" />
            <p className="corpo mt-[var(--s-sm)] max-w-[44ch]">
              {EMPRESA.promessa}. Instalação de sistemas fotovoltaicos,
              manutenção, monitorização e consultoria em {EMPRESA.zonas}.
            </p>
            <div className="mt-[var(--s-md)] flex gap-[var(--s-xs)]">
              <Social href={EMPRESA.instagram} rotulo="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </Social>
              <Social href={EMPRESA.facebook} rotulo="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M14 8.5V7c0-.8.5-1 1-1h1.5V3H14c-2.2 0-3.5 1.3-3.5 3.5v2H8V12h2.5v9H14v-9h2.3l.4-3.5H14z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </Social>
            </div>
          </div>

          <nav aria-label="Rodapé">
            <p className="label">Site</p>
            <ul className="mt-[var(--s-sm)] grid gap-[var(--s-xs)]">
              <li>
                <a className="corpo" href={ROTAS.sobre}>
                  Sobre nós
                </a>
              </li>
              {SERVICOS.map((s) => (
                <li key={s.slug}>
                  <a className="corpo" href={servicoHref(s.slug)}>
                    {s.nome}
                  </a>
                </li>
              ))}
              <li>
                <a className="corpo" href={ROTAS.projetos}>
                  Projetos
                </a>
              </li>
              <li>
                <a className="corpo" href={ROTAS.contacto}>
                  Contactos
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="label">Falar connosco</p>
            <ul className="mt-[var(--s-sm)] grid gap-[var(--s-sm)]">
              <li>
                <a
                  className="corpo"
                  href={EMPRESA.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {EMPRESA.morada}
                </a>
              </li>
              <li>
                <a className="corpo" href={`mailto:${EMPRESA.email}`}>
                  {EMPRESA.email}
                </a>
              </li>
              <li>
                <a className="corpo" href={`tel:${EMPRESA.telefone.replace(/\s/g, "")}`}>
                  {EMPRESA.telefone}
                </a>
                <span className="meta block">{EMPRESA.telefoneNota}</span>
              </li>
              <li>
                <span className="corpo">{EMPRESA.horario}</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-[var(--s-lg)] flex flex-wrap items-center justify-between gap-[var(--s-sm)] pt-[var(--s-md)]"
          style={{ borderTop: "1px solid var(--field-line)" }}
        >
          <p className="meta">
            © {ANO} {EMPRESA.nome}. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap gap-[var(--s-md)]">
            <a className="meta" href={ROTAS.privacidade}>
              Política de privacidade
            </a>
            <a
              className="meta"
              href="https://www.livroreclamacoes.pt/inicio"
              target="_blank"
              rel="noopener noreferrer"
            >
              Livro de reclamações
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
