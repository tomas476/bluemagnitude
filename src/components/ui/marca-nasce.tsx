import { EMPRESA } from "@/content/site";
import { caminho } from "@/lib/caminho";
import { cn } from "@/lib/cn";

/**
 * A marca a nascer: os dois paineis ficam postos e o sol nasce atras deles,
 * primeiro o arco e depois os raios, um a um. Substitui o gesto antigo, que
 * sublinhava "Blue" e "Magnitude" e corria um contorno a volta do logotipo
 * inteiro.
 *
 * ⚠️ E SO O ICONE, sem o nome. O logotipo continua a ser do cliente e nao se
 * redesenha: os fotogramas nascem do `public/marca/icone.png` dele, e o
 * ultimo fotograma E esse ficheiro (ver `scripts/marca-nasce.py`).
 *
 * ⚠️ WEBP ANIMADO E NAO <video>: toca dentro de um <img>, faz o laco sozinho,
 * tem alfa a serio e escapa a guerra do autoplay em iOS que ja custou o heroi
 * (ver `hero/video-backdrop.tsx`). O ciclo e ping-pong e fecha sem salto.
 *
 * ⚠️ UM <picture> E NAO DUAS <img>. O movimento reduzido tem de mostrar o
 * icone parado, e um <img> nao sabe parar um WebP animado. A primeira versao
 * punha as duas imagens no DOM e escondia uma por CSS; bastou o browser servir
 * CSS em cache para aparecerem as duas sobrepostas. Com <picture> so existe um
 * elemento e a escolha e do browser, sem depender de folha de estilos nenhuma.
 */
export function MarcaNasce({
  className,
  tamanho = "grande",
}: {
  className?: string;
  tamanho?: "grande" | "media" | "pequena";
}) {
  return (
    <picture
      className={cn(
        "marca-nasce",
        tamanho === "media" && "marca-nasce--media",
        tamanho === "pequena" && "marca-nasce--pequena",
        className,
      )}
    >
      <source
        media="(prefers-reduced-motion: reduce)"
        srcSet={caminho("/marca/icone.png")}
      />
      <img
        src={caminho("/marca/marca-nasce.webp")}
        alt={`${EMPRESA.nome}, ${EMPRESA.claim}`}
        width={444}
        height={482}
        decoding="async"
      />
    </picture>
  );
}
