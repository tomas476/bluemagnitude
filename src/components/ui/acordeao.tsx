import { Reveal } from "@/components/reveal";

type Item = { q: string; r: string };

export function Acordeoes({
  itens,
  passo = 70,
}: {
  itens: ReadonlyArray<Item>;
  passo?: number;
}) {
  return (
    <div className="acordeoes">
      {itens.map((item, i) => (
        <Reveal as="details" key={item.q} className="acordeao" delay={i * passo}>
          <summary className="acordeao__b">
            <span className="h3">{item.q}</span>
            <span className="acordeao__sinal" aria-hidden="true" />
          </summary>
          <div className="acordeao__r">{item.r}</div>
        </Reveal>
      ))}
    </div>
  );
}
