import { Marca } from "@/components/marca";
import { EMPRESA } from "@/content/site";
import { ROTAS } from "@/content/rotas";

const ANO = 2026;

const MENSAGEM = encodeURIComponent(
  "Olá, vi o vosso site e queria pedir uma proposta.",
);

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
      <div className="shell rodape">
        {/* o CTA substitui a seccao de formulario que saiu da homepage: uma
            accao so, e o canal que estes clientes usam mesmo */}
        <div className="flex flex-col gap-[var(--s-sm)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="title" style={{ fontSize: "var(--t-h3)" }}>
              {EMPRESA.promessa}
            </p>
            {/* a promessa em telemovel fica so no botao: a linha repetia
                o que ele ja diz e empurrava tudo para baixo */}
            <p className="meta mt-[2px] rodape__so-largo">
              Proposta gratuita e sem compromisso.
            </p>
          </div>
          <a
            className="btn"
            href={`https://wa.me/${EMPRESA.whatsapp}?text=${MENSAGEM}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar por WhatsApp
          </a>
        </div>

        {/* ⚠️ TRES COLUNAS EM ECRA GRANDE: a marca, a morada com o email, e o
            telefone com o horario. Antes eram duas e a coluna da direita era
            uma lista de quatro linhas que empurrava o rodape para baixo. */}
        <div
          className="rodape__base"
          style={{ borderTop: "1px solid var(--field-line)" }}
        >
          {/* os icones ficam a DIREITA do logotipo, na mesma linha */}
          <div className="rodape__marca">
            <Marca variante="branco" className="h-10 w-auto" />
            <div className="flex gap-[var(--s-xs)]">
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

          <ul className="rodape__coluna">
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
          </ul>

          <ul className="rodape__coluna">
            <li className="corpo">
              <a href={`tel:${EMPRESA.telefone.replace(/\s/g, "")}`}>
                {EMPRESA.telefone}
              </a>
              {/* a nota do custo da chamada e obrigatoria, fica em qualquer
                  medida */}
              <span className="meta block">{EMPRESA.telefoneNota}</span>
            </li>
            <li className="meta">{EMPRESA.horario}</li>
          </ul>
        </div>

        <div
          className="rodape__legal"
          style={{ borderTop: "1px solid var(--field-line)" }}
        >
          <p className="meta">
            © {ANO} {EMPRESA.nome}
          </p>
          <div className="flex flex-wrap gap-[var(--s-sm)]">
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
