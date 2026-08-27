import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { FitaServicos } from "@/components/ui/fita-servicos";
import { Reveal } from "@/components/reveal";
import { ANCORAS, ROTAS } from "@/content/rotas";

export function Servicos() {
  return (
    <section
      id={ANCORAS.servicos.slice(1)}
      className="field-shell section"
      aria-labelledby="servicos-t"
    >
      <div className="shell">
        <CabecalhoSeccao
          credito="Serviços"
          titulo="Do painel ao ar condicionado, tratamos do sistema todo"
          tituloId="servicos-t"
          lede="Instalamos, legalizamos e mantemos. A mesma equipa do princípio ao fim."
        />
      </div>

      {/* a fita fica FORA da shell: com a margem de leitura por fora, os
          cartoes das pontas ficavam cortados a meio do ecra e a fita deixava
          de se ler como continua */}
      <Reveal className="mt-[var(--s-lg)]">
        <FitaServicos />
      </Reveal>

      <div className="shell">
        <Reveal className="mt-[var(--s-md)]" delay={120}>
          <a className="btn-quiet" href={ROTAS.servicos}>
            Ver todos os serviços
          </a>
        </Reveal>
      </div>
    </section>
  );
}
