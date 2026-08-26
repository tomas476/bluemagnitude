import { PaginaInterior } from "@/components/ui/pagina";
import { ROTAS } from "@/content/rotas";

export default function NaoEncontrado() {
  return (
    <PaginaInterior
      credito="Página não encontrada"
      titulo="Esta página não existe"
      lede="O endereço pode ter mudado. A partir daqui chegas ao resto do site."
    >
      <section className="field-shell section" aria-label="Ligações úteis">
        <div className="shell flex flex-wrap gap-[var(--s-sm)]">
          <a className="btn" href={ROTAS.home}>
            Voltar ao início
          </a>
          <a className="btn btn--contorno" href={ROTAS.contacto}>
            Falar connosco
          </a>
        </div>
      </section>
    </PaginaInterior>
  );
}
