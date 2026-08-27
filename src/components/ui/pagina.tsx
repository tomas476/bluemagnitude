import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AncorasSuaves } from "@/components/ancoras-suaves";
import { CampoLuz } from "@/components/ui/campo-luz";
import { Reveal } from "@/components/reveal";
import { TituloTeclado } from "@/components/ui/titulo-teclado";
import { ROTAS } from "@/content/rotas";

type Migalha = { rotulo: string; href?: string };

/** Molde das paginas interiores: navbar ja pousada, cabecalho e campo de luz. */
export function PaginaInterior({
  credito,
  titulo,
  lede,
  migalhas = [],
  tituloTeclado = false,
  gigante = false,
  children,
}: {
  credito: string;
  titulo: string;
  lede?: string;
  migalhas?: ReadonlyArray<Migalha>;
  /** o titulo escreve-se a maquina ao entrar (paginas de servico) */
  tituloTeclado?: boolean;
  /** o titulo em corpo de cartaz, para os indices editoriais */
  gigante?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav pousadaSempre />
      <AncorasSuaves />
      <div className="nav__espaco" />
      <main id="conteudo" tabIndex={-1}>
        <CampoLuz>
          <section className="field-shell section--tight">
            <div className="shell">
              {migalhas.length > 0 ? (
                <nav aria-label="Caminho" className="meta">
                  <a href={ROTAS.home}>Início</a>
                  {migalhas.map((m) => (
                    <span key={m.rotulo}>
                      {" › "}
                      {m.href ? <a href={m.href}>{m.rotulo}</a> : m.rotulo}
                    </span>
                  ))}
                </nav>
              ) : null}

              <Reveal className="mt-[var(--s-sm)]">
                <p className="credito">{credito}</p>
                {tituloTeclado ? (
                  <TituloTeclado
                    texto={titulo}
                    className="display mt-[var(--s-xs)] max-w-[20ch]"
                  />
                ) : (
                  <h1
                    className={
                      gigante
                        ? "display display--gigante mt-[var(--s-xs)]"
                        : "display mt-[var(--s-xs)] max-w-[20ch]"
                    }
                  >
                    {titulo}
                  </h1>
                )}
                {lede ? <p className="lede mt-[var(--s-sm)]">{lede}</p> : null}
              </Reveal>
            </div>
          </section>

          {children}
        </CampoLuz>
      </main>
      <SiteFooter />
    </>
  );
}
