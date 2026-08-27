import { Reveal } from "@/components/reveal";

export type LinhaEditorial = {
  id: string;
  indice: string;
  nome: string;
  /** a coluna pequena de acento, duas ou tres linhas curtas */
  mini: ReadonlyArray<string>;
  imagem: string;
  imagemAlt: string;
  href: string;
};

/**
 * O indice da referencia: folhas brancas empilhadas, cada linha e uma folha
 * que se sobrepoe a anterior. Dentro de cada folha: o indice pequeno, o nome
 * em tipo display, a coluna curta de acento, a descricao, e a fotografia
 * encostada ao bordo direito da folha.
 *
 * As fotografias sao MAIORES do que na referencia, por pedido expresso: numa
 * empresa de instalacoes a fotografia e a prova.
 */
export function ListaEditorial({
  linhas,
  accao,
}: {
  linhas: ReadonlyArray<LinhaEditorial>;
  accao: string;
}) {
  return (
    <ul className="editorial">
      {linhas.map((linha, i) => (
        <Reveal as="li" key={linha.id} className="editorial__folha" delay={i * 80}>
          <a href={linha.href} className="editorial__link" aria-label={`${linha.nome}: ${accao}`}>
            <span className="editorial__indice">{linha.indice}</span>

            <h2 className="editorial__nome">{linha.nome}</h2>

            <span className="editorial__mini">
              {linha.mini.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </span>

            <span className="editorial__foto">
              <span className="editorial__scrim" aria-hidden="true" />
              <img
                src={linha.imagem}
                alt={linha.imagemAlt}
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </span>
          </a>
        </Reveal>
      ))}
    </ul>
  );
}
