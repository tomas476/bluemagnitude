import { SERVICOS } from "@/content/site";
import { servicoHref } from "@/content/rotas";

/**
 * Os servicos em fita horizontal, sempre em movimento para a esquerda.
 *
 * A lista e desenhada DUAS vezes e o conjunto anda -50%: quando a primeira
 * copia sai do ecra, a segunda esta exactamente onde a primeira comecou, e o
 * ciclo fecha sem salto. E o marquee que nao precisa de JavaScript nem de medir
 * nada, portanto nao tem custo por frame nem se parte em resize.
 *
 * A copia repetida leva aria-hidden: para quem ouve a pagina os servicos sao
 * seis, nao doze.
 */
export function FitaServicos() {
  const cartoes = (duplicado: boolean) =>
    SERVICOS.map((s) => (
      <li key={`${duplicado ? "b" : "a"}-${s.slug}`} className="fita__item">
        <a href={servicoHref(s.slug)} className="fita__cartao" tabIndex={duplicado ? -1 : undefined}>
          <div className="fita__moldura">
            <img
              src={s.imagem}
              alt={duplicado ? "" : s.imagemAlt}
              width={890}
              height={600}
              loading="lazy"
              decoding="async"
              className="fita__foto"
            />
            <h3 className="fita__titulo">{s.nome}</h3>
          </div>
          <span className="btn-quiet fita__accao">Ver serviço</span>
        </a>
      </li>
    ));

  return (
    <div className="fita">
      <ul className="fita__pista">
        {cartoes(false)}
        <li aria-hidden="true" className="contents">
          <ul className="contents">{cartoes(true)}</ul>
        </li>
      </ul>
    </div>
  );
}
