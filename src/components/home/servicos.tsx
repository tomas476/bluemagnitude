import { Reveal } from "@/components/reveal";
import { CabecalhoSeccao } from "@/components/ui/cabecalho-seccao";
import { SERVICOS } from "@/content/site";
import { ANCORAS, servicoHref } from "@/content/rotas";

/**
 * Bento de celulas desiguais: o primeiro servico ocupa duas colunas e leva
 * fotografia, o ultimo atravessa a grelha inteira em linha. As quatro do meio
 * sao iguais entre si de proposito, para as duas pontas se lerem primeiro.
 */
const LARGURA = [
  "sm:col-span-2",
  "",
  "",
  "",
  "",
  "sm:col-span-2 lg:col-span-3",
];

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

        <div className="mt-[var(--s-lg)] grid gap-[var(--s-sm)] sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s, i) => {
            const primeiro = i === 0;
            const ultimo = i === SERVICOS.length - 1;

            return (
              <Reveal
                as="article"
                key={s.slug}
                delay={i * 90}
                className={LARGURA[i]}
              >
                <a
                  href={servicoHref(s.slug)}
                  className={
                    ultimo
                      ? "plate flex h-full flex-col gap-[var(--s-sm)] sm:flex-row sm:items-center sm:justify-between"
                      : "plate flex h-full flex-col justify-between gap-[var(--s-md)]"
                  }
                >
                  {primeiro ? (
                    <img
                      src={s.imagem}
                      alt={s.imagemAlt}
                      width={890}
                      height={500}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-[var(--radius-field)] object-cover"
                      style={{ aspectRatio: "16 / 7" }}
                    />
                  ) : null}

                  <div className={ultimo ? "sm:max-w-[52ch]" : undefined}>
                    <h3 className="h3">{s.nome}</h3>
                    <p className="corpo mt-[var(--s-xs)]">{s.resumo}</p>
                  </div>

                  <span className="btn-quiet flex-none">Ver o serviço</span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
