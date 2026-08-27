"use client";

/**
 * O CARROSSEL "COVERFLOW" — usado DUAS vezes na página: no portefólio (reels) e
 * nas redes sociais.
 *
 * ⚠️ VEIO DO primeview-site (`~/primeview-site/src/components/ui/carrossel.tsx`
 * na VPS) e NAO foi reescrito. As tres adaptacoes a esta casa estao marcadas
 * com ⚠️ pelo caminho: os caminhos vem prontos do `content/reels.ts` por causa
 * do prefixo do Pages, o video e opcional porque aqui nao ha MP4 nenhum, e a
 * aresta do cartao segue a faixa, que nesta pagina e escura.
 *
 * ===========================================================================
 * PORQUE É UM COMPONENTE COM DUAS VARIANTES E NÃO DOIS COMPONENTES
 * ===========================================================================
 * Pedido explícito: as redes usam "o mesmo componente do dos reels". E é a
 * decisão certa por uma razão que não é economia de linhas — o que este ficheiro
 * tem de difícil não é o card, é o GESTO: decidir se um arrasto é nosso ou da
 * página, não sequestrar o scroll vertical, sobreviver a dois dedos, e ainda
 * responder ao teclado. Duplicar isso para desenhar dois cards diferentes era
 * duplicar a única parte que dá problemas.
 *
 * ⚠️ E PORQUE É QUE AS DUAS VARIANTES VIVEM AQUI DENTRO em vez de entrarem por
 * uma função de render: as secções que montam o carrossel são Server Components,
 * e uma função não atravessa a fronteira servidor/cliente (não é serializável).
 * A escolha era ou tornar as duas secções `"use client"` só para lhes passar um
 * render prop, ou o carrossel conhecer as duas formas de card. A segunda custa
 * um `switch` e não custa bundle.
 *
 * ===========================================================================
 * A GEOMETRIA
 * ===========================================================================
 * Herdada do carrossel do projecto de origem e mantida: o card central grande e
 * nítido, os laterais a 45% de translação, escala −0,15 por degrau, rodados 10° e
 * desfocados, e o resto escondido. A conta é derivada da DISTÂNCIA ao centro e não
 * escrita à mão por caso, o que faz uma terceira camada aparecer sozinha com o
 * ângulo e a escala que lhe competem.
 *
 * DUAS CAMADAS DE CADA LADO EM DESKTOP, UMA EM TELEMÓVEL. A 390 px o palco tem
 * ~350 px úteis e o card central já ocupa 192: a segunda camada aparecia como
 * duas manchas cortadas pelo bordo, e uma mancha cortada não lê como
 * profundidade, lê como erro de recorte. Quem decide isso é o CSS pelo
 * `data-dist` e não este JavaScript — em JS seria preciso `matchMedia` e um
 * estado, e o build teria de adivinhar a largura de um ecrã que não conhece.
 *
 * ⚠️ E O DESFOQUE NÃO CUSTA FRAMES, apesar do que parece: o `<video>` só existe
 * no card CENTRAL. Tudo o que está de lado é o poster `.webp`, estático, e
 * desfocar uma imagem parada é uma rasterização feita uma vez. É a diferença
 * entre isto e desfocar uma camada que se repinta a cada frame.
 */

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

import { movimentoReduzido, prefersLightweight } from "@/lib/lightweight";

/* ---------------------------------------------------------------------------
   O TIPO DE CARTÃO.
   ⚠️ ERAM DOIS ATÉ 17/8/2026 — havia um `CartaoCanal` (o cartão de texto que era
   todo ele um link) que servia a secção das REDES SOCIAIS. Essa secção saiu da
   página por decisão do cliente, e a variante saiu com ela: um ramo de uma união
   discriminada sem um único consumidor é código morto que a próxima pessoa vai
   ler como se fosse uma opção viva.
   O `tipo` FICA, apesar de haver só um valor: é o que faz um cartão novo entrar
   por acrescento e não por alteração do que já lá está — e o TypeScript acusa o
   caso esquecido no render.
   --------------------------------------------------------------------------- */

export type CartaoReel = {
  tipo: "reel";
  id: string;
  /**
   * ⚠️ OS CAMINHOS VEM PRONTOS, e nao se montam aqui a partir do `id` como no
   * projecto de origem. Este site e `output: "export"` servido numa SUBPASTA no
   * GitHub Pages: um `/reels/x.webp` escrito a mao da 404 la. Quem os monta e o
   * `content/reels.ts`, com o `caminho()`.
   */
  poster: string;
  /** O MP4, quando existir. Sem ele o cartao e a capa e o link, e mais nada. */
  video?: string;
  href: string;
  alt: string;
  legenda: string;
  largura: number;
  altura: number;
  /**
   * "Excerto de 16 s", já formatado.
   *
   * ⚠️ AQUI E OPCIONAL, ao contrario do projecto de origem: a Blue Magnitude
   * nao tem os MP4 dos reels (o Instagram exige sessao iniciada, esta
   * documentado em `content/reels.ts`), portanto nao ha excerto nenhum a
   * declarar. Onde houver video, volta a ser obrigatorio pela mesma razao de
   * sempre: um excerto que nao se diz e video truncado a fingir que e a peca.
   */
  excerto?: string;
};

export type Cartao = CartaoReel;

type Rotulos = {
  /** `aria-roledescription` da região. */
  carrossel: string;
  /** Nome da região, antes do nome de quem publica. */
  regiao: string;
  /** Nome do dono, para o rótulo da região. */
  dono: string;
  anterior: string;
  seguinte: string;
  /** Só na variante de reels. */
  reel?: string;
  /**
   * "Reel 3 de 7", JÁ FORMATADO, um por cartão e na ordem deles.
   *
   * ⚠️ NÃO É A FUNÇÃO DO DICIONÁRIO, e a primeira versão deste componente
   * recebia-a — o build parou com *"Functions cannot be passed directly to Client
   * Components"*. É a mesma fronteira que este ficheiro documenta lá em cima para
   * o render prop, e vale para qualquer função: quem monta o carrossel é um Server
   * Component, e uma função não é serializável.
   * Formatar as sete frases do lado do servidor custa sete strings no payload e
   * mantém a regra de pluralização dentro do dicionário, que é onde ela pertence.
   */
  posicoes?: string[];
  ligarSom?: string;
  desligarSom?: string;
  /** Texto VISÍVEL do link para a peça completa. */
  /** Rótulo acessível do mesmo link — diz o destino. */
  verNoInstagram?: string;
};

type Props = {
  cartoes: Cartao[];
  /** Índice onde abre centrado. Vem do conteúdo, não se inventa aqui. */
  inicial: number;
  rotulos: Rotulos;
};

/**
 * Quanto tempo fica cada cartão no centro antes de o automático avançar.
 *
 * 9 s e não 4: em 4 s ninguém vê um reel, vê um relance — o automático servia
 * para mostrar que há mais e acabava a levar o vídeo embora a meio de cada um. E
 * há a fatura: cada troca de centro monta um `<video>` novo e pede um ficheiro
 * novo. Os sete reels somam 40 MB, e a 4 s bastavam ~28 s de secção visível para
 * os descarregar todos.
 *
 * ⚠️ E NÃO SUBIU PARA 16 s com os excertos passarem a ter essa duração, apesar de
 * ser a conta tentadora ("um card, uma peça inteira"). Um cartão parado 16 s num
 * carrossel de sete é mais de dois minutos para ver o portefólio, e quem chega
 * aqui de um reel não fica dois minutos: o automático existe para mostrar que HÁ
 * mais, e quem quer ver uma peça até ao fim arrasta ou abre o Instagram.
 * (Na prática o automático quase nunca corre — ver a nota da WCAG 2.2.2 lá em
 * baixo: sem rato não há mecanismo de pausa, logo não há movimento automático.)
 */
const INTERVALO_MS = 9000;

/**
 * Quanto é preciso mover antes de o carrossel decidir que o gesto é dele.
 * 10 px é a distância em que já se sabe a direcção mas ainda não se perdeu o
 * scroll da página; abaixo disto, um toque a tremer decidia por engano.
 */
const EIXO_PX = 10;

/**
 * Distância mínima para trocar de cartão. 44 px é o mesmo número do alvo de
 * toque, e não por coincidência: é a ordem de grandeza do que um polegar move sem
 * querer.
 */
const LIMIAR_PX = 44;

/** Quantas camadas de cada lado o CSS pode mostrar. */
const CAMADAS = 2;

type Gesto = {
  id: number;
  x0: number;
  y0: number;
  /** Enquanto está "indeciso" ninguém captura nada nem se decide nada. */
  eixo: "indeciso" | "horizontal";
  /** Já trocou de cartão neste arrasto — um gesto muda um cartão, não seis. */
  gasto: boolean;
};

const CSS = `
/* O palco. 'overflow: hidden' e ESTRUTURAL e nao estetico: a 390 px o card
   adjacente chega a ~168 px do centro e o palco so tem ~175 px de meia-largura;
   com o rotateY a empurrar mais um pouco, sem corte aparecia barra horizontal na
   pagina inteira. */
.cf{position:relative}
.cf__palco{
  position:relative;display:flex;align-items:center;justify-content:center;
  width:100%;height:25rem;overflow:hidden;cursor:grab;user-select:none;
  perspective:1000px;
}
.cf__palco:active{cursor:grabbing}
@media (min-width:48rem){
  .cf__palco{height:33rem}
}

/* A curva NAO e 'ease-in-out': o sistema proibe curvas sem massa. A
   '--ease-glide' e a de folha de vidro a deslizar, que e literalmente o gesto
   deste carrossel. */
.cf__cartao{
  position:absolute;display:flex;align-items:center;justify-content:center;
  width:12rem;height:21.375rem;
  transition:transform 500ms var(--ease-glide),opacity 500ms var(--ease-glide);
  opacity:var(--pos-opacidade);
  filter:blur(var(--pos-desfoque));
  visibility:visible;
}
@media (min-width:48rem){
  .cf__cartao{width:16rem;height:28.5rem}
}

/* TRES CARDS E A BASE, cinco e o que o ecra largo acrescenta. Escrito nesta
   ordem de proposito: a base e o telemovel. */
.cf__cartao[data-dist="2"],
.cf__cartao[data-dist="3"],
.cf__cartao[data-dist="4"],
.cf__cartao[data-dist="5"],
.cf__cartao[data-dist="6"]{visibility:hidden;opacity:0}
@media (min-width:64rem){
  .cf__cartao[data-dist="2"]{visibility:visible;opacity:var(--pos-opacidade)}
}

/* A caixa do cartao. Aresta de 1 px: num card que e so imagem, a aresta e a
   unica coisa que diz onde ele acaba, e a WCAG 1.4.11 pede-lhe 3:1.
   ⚠️ SEGUE A FAIXA ('--field-line-strong') e nao a paleta base: aqui a seccao
   dos reels e escura, e a linha da paleta clara desaparecia nela. */
.cf__caixa{
  position:relative;display:block;width:100%;height:100%;overflow:hidden;
  border-radius:var(--radius-reel);
  background-color:var(--color-plate);
  box-shadow:inset 0 0 0 1px var(--field-line-strong,var(--color-line-strong));
}

/* O POSTER ESTA SEMPRE LA, e e a correccao mais importante deste componente.
   O video entra POR CIMA dele e so aparece quando tem imagem: assim o pior caso
   deixa de ser um card VAZIO e passa a ser um card com a fotografia parada — que
   e exactamente o que ele e enquanto o video nao toca. */
.cf__poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}

/* So a opacidade e animada: e propriedade de compositor e nao obriga a repintar
   o card a cada frame. */
.cf__video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 220ms var(--ease-glide);pointer-events:none}
.cf__video[data-tocar="true"]{opacity:1}
@media (prefers-reduced-motion:reduce){
  .cf__video{transition:none}
}

/* ===========================================================================
   O CARD INTEIRO E O LINK — e o pe de texto saiu (17/8/2026)
   ===========================================================================
   O cliente mandou a captura do card e disse: *"tira o titulo e o ver o reel
   completo, fica mais clean sem isso"*. Sairam a legenda, a nota de excerto e a
   capsula do link — e SAIU TAMBEM O VEU do pe, que existia so para dar contraste
   garantido a esse texto sobre video. Sem texto, um veu e um degrau escuro a
   proteger nada.

   ⚠️ MAS O CARD NAO PODIA FICAR SEM SAIDA: o que corre aqui sao os primeiros 16 s
   de uma peca inteira, e tirar o unico caminho
   para o original seria "limpo" e pior. Por isso o CARD INTEIRO passou a ser o
   link: zero cromagem visivel, alvo de toque do tamanho do card, e a informacao
   que saiu do ecra passou para o NOME ACESSIVEL do link (legenda + excerto +
   destino). Quem ve deixa de ter texto por cima do trabalho; quem ouve nao perde
   nada.

   ⚠️ O ANEL DE FOCO E 'inset' E ISSO E OBRIGATORIO AQUI: a '.cf__caixa' tem
   'overflow:hidden', ou seja um contorno desenhado PARA FORA (o
   'outline-offset:3px' da regra global) era cortado pela propria caixa e o card
   ficava sem indicacao nenhuma de foco. -4px desenha-o dentro. */
.cf__link{
  position:absolute;inset:0;z-index:2;display:block;
  border-radius:var(--radius-reel);
  -webkit-tap-highlight-color:transparent;
}
.cf__link:focus-visible{
  outline:2px solid var(--color-accent);
  outline-offset:-4px;
  border-radius:var(--radius-reel);
}

/* O BOTAO DE SOM SUBIU PARA O CANTO SUPERIOR DIREITO do card, e nao e gosto: a
   12rem de largura (192 px a 390) o pe nao aguenta um botao de 44 px ao lado de
   uma capsula de texto sem os dois ficarem abaixo do alvo minimo ou sem o texto
   partir em tres linhas. E o canto superior direito e onde o polegar procura o som
   em qualquer aplicacao de video vertical.
   'z-index' acima do pe para nunca ficar por baixo do veu. */
.cf__som{
  position:absolute;top:.5rem;right:.5rem;z-index:3;
  display:inline-flex;align-items:center;justify-content:center;
  width:2.75rem;height:2.75rem;border:0;padding:0;cursor:pointer;
  border-radius:999px;color:var(--color-ink);
  background-color:color-mix(in srgb,var(--color-shell) 62%,transparent);
  box-shadow:inset 0 0 0 1px var(--color-line-strong);
  transition:background-color 240ms var(--ease-glide);
}
.cf__som:hover{background-color:color-mix(in srgb,var(--color-shell) 82%,transparent)}

/* ---------------- as setas ----------------
   44 px (o 'h-10' de 40 px do componente original ficava 4 px abaixo do minimo,
   e estas setas sao das poucas coisas carregaveis da seccao). Chapa OPACA porque
   a seta assenta em cima do card adjacente desfocado — sem chapa, o icone
   perdia-se nele. */
.cf__seta{
  position:absolute;top:50%;z-index:20;transform:translateY(-50%);
  display:inline-flex;align-items:center;justify-content:center;
  width:2.75rem;height:2.75rem;border:0;cursor:pointer;
  border-radius:999px;color:var(--color-ink);
  background-color:var(--color-plate);
  box-shadow:inset 0 0 0 1px var(--color-line-strong);
  transition:background-color 240ms var(--ease-glide);
}
.cf__seta:hover{background-color:var(--color-plate-2)}
.cf__seta--esq{left:.5rem}
.cf__seta--dir{right:.5rem}
@media (min-width:48rem){
  .cf__seta--esq{left:2rem}
  .cf__seta--dir{right:2rem}
}

@media (prefers-reduced-motion:reduce){
  .cf__cartao,.cf__som,.cf__seta{transition:none}
}
`;

export function Carrossel({ cartoes, inicial, rotulos }: Props) {
  const total = cartoes.length;
  const [indice, setIndice] = React.useState(inicial);

  /* As razões independentes para o carrossel estar parado. Ficam em estados
     separados porque têm origens diferentes (rato, foco, viewport, gesto) e
     juntá-las num só booleano tornava impossível saber quem o pôs a false. */
  const [hover, setHover] = React.useState(false);
  const [focado, setFocado] = React.useState(false);
  const [visivel, setVisivel] = React.useState(false);

  /**
   * Assim que a pessoa navega à mão — dedo, seta ou teclado — o avanço automático
   * morre e NÃO volta. É deliberado: um temporizador que retoma passados uns
   * segundos leva o cartão embora enquanto a pessoa ainda o está a ver, e o gesto
   * seguinte é sempre a lutar contra ele. O automático existe para quem chega e
   * não toca em nada; a partir do primeiro toque, quem manda é o dedo.
   */
  const [autoDesligado, setAutoDesligado] = React.useState(false);

  /**
   * Arranca a `false` de propósito: o primeiro render (build e hidratação) nunca
   * monta um `<video>`. Assim ninguém com `prefers-reduced-motion` chega a ver um
   * frame a mexer antes de o efeito correr, e o MP4 do centro só começa a
   * descarregar depois de o componente estar vivo no browser.
   */
  const [movimentoOk, setMovimentoOk] = React.useState(false);

  /**
   * O SOM. Arranca SEMPRE mudo, e não é timidez: o autoplay com som é recusado
   * por todos os browsers sem um gesto de quem está a ver, e um vídeo que rebenta
   * com som numa página que alguém abriu a partir do Instagram é a forma mais
   * rápida de essa pessoa fechar o separador.
   *
   * O estado vive AQUI e não no `<video>`: o elemento é destruído e recriado a
   * cada mudança de cartão, e se o som vivesse nele voltava a mudo de nove em
   * nove segundos. Assim quem ligou o som uma vez ouve o reel seguinte também.
   */
  const [comSom, setComSom] = React.useState(false);

  /**
   * QUAL O CARTÃO CUJO VÍDEO JÁ TEM IMAGEM? É isto que decide se o vídeo se vê ou
   * se ainda estamos a olhar para o poster por baixo dele.
   *
   * ⚠️ GUARDA O `id` E NÃO UM BOOLEANO, e a diferença não é de gosto. Com um
   * booleano, cada mudança de centro precisava de um efeito a chamar
   * `setATocar(false)` — um `setState` síncrono no corpo de um efeito, que provoca
   * um render em cascata (e que o `react-hooks/set-state-in-effect` recusa, com
   * razão). Guardando o `id`, o reset é IMPLÍCITO: o cartão novo não é o que está
   * guardado, logo `aTocar` é falso sem ninguém ter de o pôr a falso.
   * O defeito que isto evita é visível: sem reset, o `<video>` novo nascia com
   * `data-tocar="true"` do anterior e via-se um lampejo do fundo do card antes de
   * o `onPlaying` corrigir.
   */
  const [tocandoId, setTocandoId] = React.useState<string | null>(null);

  const palcoRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const gestoRef = React.useRef<Gesto | null>(null);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const aplicar = () => {
      /* `prefersLightweight` é a MESMA função que o herói usa, e é por isso que
         vive em `@/lib`: cobre `prefers-reduced-motion`, `saveData` e 2G. Sem
         ela, quem tem a poupança de dados ligada era protegido do vídeo de fundo
         (1,1 MB) e depois apanhava os 23 MB dos reels sem tocar em nada. */
      /* ⚠️ O `prefersLightweight` DESTE projecto nao conta o movimento
         reduzido (o VideoBackdrop resolve isso com o poster). Aqui o
         carrossel precisa das duas razoes juntas. */
      const leve = prefersLightweight() || movimentoReduzido();
      setMovimentoOk(!leve);

      /* Em modo leve o automático também não arranca: mesmo sem `<video>`, um
         carrossel a rodar sozinho é movimento que ninguém pediu. */
      if (leve) setAutoDesligado(true);

      /* WCAG 2.2.2 — O AUTOMÁTICO SÓ ARRANCA ONDE HÁ COMO O PARAR.
         As travagens deste carrossel são três: `hover`, `focado` e o gesto. Num
         telemóvel não existe rato nem foco a passear, e o gesto só trava depois
         de a pessoa já ter lutado com ele. Resultado: quem chegasse a esta secção
         num iPhone e não tocasse em nada ficava com troca de cartão de 9 em 9
         segundos, para sempre, sem controlo — que é exactamente o cenário que a
         norma proíbe.
         A saída é a que a própria norma aceita e que não acrescenta um controlo
         novo ao desenho: onde não há mecanismo de pausa, não há movimento
         automático. Com rato, o `:hover` continua a ser o travão. */
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        setAutoDesligado(true);
      }
    };

    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  /* Fora do ecrã não se avança nem se descodifica nada. Sem isto, o carrossel
     continuava a trocar de cartão — e a descodificar vídeo — enquanto o visitante
     lia o formulário lá em baixo. */
  React.useEffect(() => {
    const node = palcoRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entrada]) => setVisivel(entrada.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const navegar = React.useCallback(
    (passo: 1 | -1) => {
      setAutoDesligado(true);
      setIndice((prev) => (prev + passo + total) % total);
    },
    [total],
  );

  const aCorrer =
    movimentoOk && visivel && !hover && !focado && !autoDesligado;

  /**
   * A armadilha do componente original: `setInterval` com um callback que muda de
   * identidade recria o intervalo a cada render, e num render em que o cleanup não
   * corra ficam dois a disparar — o carrossel salta dois cartões de uma vez.
   *
   * Aqui a única dependência é `aCorrer`: o intervalo nasce quando o carrossel
   * arranca e morre quando ele pára. O índice entra pela forma funcional do
   * `setIndice`, por isso o efeito não precisa de o conhecer.
   */
  React.useEffect(() => {
    if (!aCorrer) return;
    const timer = window.setInterval(
      () => setIndice((prev) => (prev + 1) % total),
      INTERVALO_MS,
    );
    return () => window.clearInterval(timer);
  }, [aCorrer, total]);

  /* Reflecte o som no elemento actual sempre que ele muda de cartão ou o botão é
     carregado. Sem isto, ligar o som só afectava o vídeo que estava no ecrã nesse
     instante. */
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !comSom;
    if (comSom) video.removeAttribute("muted");
    else video.setAttribute("muted", "");
  }, [comSom, indice]);

  /**
   * Quem toca e quem pára.
   *
   * ⚠️ TOCAR NÃO É PEDIR UMA VEZ. O `<video>` é um elemento NOVO a cada mudança
   * de centro: ao arrastar depressa, o `play()` do cartão 3 é chamado num elemento
   * que o React desmonta um instante depois, e o browser rejeita a promessa com
   * `AbortError`. Um `.catch(() => undefined)` engolia-a e ninguém voltava a
   * tentar — o cartão seguinte ficava na fotografia, para sempre, sem nada
   * partido à vista. Quanto mais depressa se arrasta, mais provável é.
   *
   * A correcção é insistir enquanto a condição se mantiver: até seis vezes, uma
   * por frame. Seis porque o caso real (o elemento ainda estar a carregar)
   * resolve-se em dois ou três; a partir daí é recusa de política de autoplay, e
   * essa não se resolve com insistência — resolve-se com o `onCanPlay` do JSX ou
   * com um toque.
   */
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let tentativas = 0;
    const sincronizar = () => {
      const alvo = videoRef.current;
      if (!alvo) return;
      if (visivel && document.visibilityState === "visible") {
        /* ⚠️ O `load()` EXPLÍCITO (18/8/2026). Veio da correcção do visor de
           `/servicos/`, onde a falta dele deixou cinco vídeos em `readyState: 0`
           para sempre (a causa longa ficou no projecto de origem).
           Aqui o defeito nunca chegou a ver-se, porque a insistência de seis
           tentativas lá em baixo acabava por apanhar o carregamento; mas separar
           os bytes da política continua a valer: com `load()` primeiro, o pior
           caso é um vídeo carregado e pausado por cima do poster, e não um
           elemento a zero que nenhuma insistência resolve.
           ⚠️ SÓ QUANDO ESTÁ A ZERO: chamá-lo num vídeo já carregado punha-o
           outra vez no princípio, e o cartão piscava. */
        if (alvo.readyState === 0) alvo.load();
        void alvo.play().catch(() => {
          if (tentativas >= 6) return;
          tentativas += 1;
          requestAnimationFrame(() => {
            if (videoRef.current === alvo) sincronizar();
          });
        });
      } else {
        alvo.pause();
      }
    };

    sincronizar();
    document.addEventListener("visibilitychange", sincronizar);
    return () => {
      document.removeEventListener("visibilitychange", sincronizar);
      video.pause();
    };
  }, [visivel, indice, movimentoOk]);

  function aoTeclar(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navegar(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navegar(1);
    }
  }

  /* ---------------------------------------------------------------------
     O GESTO

     O problema difícil não é ler o arrasto, é NÃO FICAR COM ELE. Se o palco
     agarra todos os movimentos, quem tenta descer a página com o dedo em cima do
     carrossel fica preso a meio da one-page — o pior defeito possível numa página
     que existe para se ler até ao fim.

     Duas peças resolvem-no em conjunto:
       . `touch-action: pan-x pan-y pinch-zoom` no palco (ver o `style` do
         elemento): OS DOIS EIXOS de pan são do browser. Só `pan-y` bastaria para
         o scroll vertical, mas declarar os dois é o que garante que nenhum gesto
         de arrasto fica preso aqui se algum dia existir scroll horizontal por
         cima deste palco. O `pinch-zoom` é explícito porque sem ele a ampliação
         por gesto morria em 400 px de altura — quase metade do ecrã de um iPhone
         — e quem precisa de ampliar (WCAG 1.4.4) ficava sem alternativa nesta
         secção, sem aviso nenhum.
       . a decisão de eixo nos primeiros 10 px: se o movimento é mais vertical que
         horizontal, larga-se o gesto e nunca mais se lhe toca nesse arrasto. O
         browser faz o scroll e envia-nos `pointercancel`.

     A captura só se pede DEPOIS de o eixo estar decidido, para o cartão não ficar
     a receber eventos de um gesto que afinal era da página.
     --------------------------------------------------------------------- */

  /* ⚠️ "ISTO FOI UM ARRASTO E NÃO UM CLIQUE".
     Desde que o card inteiro passou a ser o link para o reel (17/8/2026), um
     swipe horizontal que levante o dedo em cima do card dispara um `click` — e
     abria o Instagram a quem só queria ver o cartão seguinte.
     É um `ref` e não estado: ninguém tem de voltar a desenhar por causa disto, e
     o valor é lido no `onClick` do frame seguinte ao gesto. */
  const arrastouRef = React.useRef(false);

  function aoPressionar(event: React.PointerEvent<HTMLDivElement>) {
    /* Só o botão principal do rato; o direito é para o menu de contexto. */
    if (event.pointerType === "mouse" && event.button !== 0) return;

    /* Um gesto de cada vez. Sem isto, um segundo dedo a pousar durante um swipe
       substituía o registo do primeiro: quando o primeiro levantava, o fecho lia
       o gesto do segundo, não libertava a captura e limpava tudo — o arrasto
       seguinte não fazia nada. */
    if (gestoRef.current) return;

    arrastouRef.current = false;
    gestoRef.current = {
      id: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
      eixo: "indeciso",
      gasto: false,
    };
  }

  function aoArrastar(event: React.PointerEvent<HTMLDivElement>) {
    const gesto = gestoRef.current;
    if (!gesto || gesto.id !== event.pointerId || gesto.gasto) return;

    const dx = event.clientX - gesto.x0;
    const dy = event.clientY - gesto.y0;

    if (gesto.eixo === "indeciso") {
      if (Math.abs(dx) < EIXO_PX && Math.abs(dy) < EIXO_PX) return;

      if (Math.abs(dy) >= Math.abs(dx)) {
        /* Vertical: a página é que manda. Larga-se e não se volta a pegar. */
        gestoRef.current = null;
        return;
      }

      gesto.eixo = "horizontal";
      /* Daqui para a frente este gesto é um arrasto, e o clique que ele venha a
         gerar não abre o link do card. */
      arrastouRef.current = true;
      /* A captura garante que o resto do arrasto chega aqui mesmo que o dedo saia
         do palco — sem ela, um swipe que passa o bordo do card fica a meio e nada
         acontece. */
      event.currentTarget.setPointerCapture(gesto.id);
    }

    if (Math.abs(dx) < LIMIAR_PX) return;

    /* Arrastar para a ESQUERDA traz o cartão seguinte, como numa folha de papel
       empurrada de lado. */
    navegar(dx < 0 ? 1 : -1);
    gesto.gasto = true;
  }

  function largarGesto(event: React.PointerEvent<HTMLDivElement>) {
    const gesto = gestoRef.current;
    /* Só o dedo que abriu o gesto o pode fechar. */
    if (!gesto || gesto.id !== event.pointerId) return;
    if (gesto.eixo === "horizontal") {
      /* `hasPointerCapture` antes de libertar: em `pointercancel` o browser já a
         tirou, e libertar uma captura que não existe atira em alguns Safari. */
      if (event.currentTarget.hasPointerCapture(gesto.id)) {
        event.currentTarget.releasePointerCapture(gesto.id);
      }
    }
    gestoRef.current = null;
  }

  return (
    <div
      className="cf"
      role="region"
      /* Os rótulos deste carrossel são TODOS acessíveis: nenhum deles se vê no
         ecrã, e é precisamente por isso que passariam despercebidos numa revisão
         a olho. */
      aria-roledescription={rotulos.carrossel}
      aria-label={`${rotulos.regiao} ${rotulos.dono}`}
      tabIndex={0}
      onKeyDown={aoTeclar}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocado(true)}
      onBlur={(event) => {
        /* `focus-within` em JS: só se despausa quando o foco sai mesmo do
           carrossel, e não quando salta de uma seta para outra. */
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocado(false);
        }
      }}
    >
      <style
        precedence="medium"
        href="pv-carrossel"
        dangerouslySetInnerHTML={{ __html: CSS }}
      />

      <div
        ref={palcoRef}
        className="cf__palco"
        onPointerDown={aoPressionar}
        onPointerMove={aoArrastar}
        onPointerUp={largarGesto}
        onPointerCancel={largarGesto}
        /* O arrasto nativo de imagem/vídeo do desktop rouba o gesto ao rato: a
           meio do swipe aparece a miniatura fantasma e o `pointermove` seca. */
        onDragStart={(event) => event.preventDefault()}
        style={{ touchAction: "pan-x pan-y pinch-zoom" }}
      >
        {cartoes.map((cartao, i) => {
          const offset = i - indice;
          let pos = (offset + total) % total;
          if (pos > Math.floor(total / 2)) pos = pos - total;

          const dist = Math.abs(pos);
          const centro = pos === 0;
          const escondido = dist > CAMADAS;

          /* 1 · 0,85 · 0,70 — o mesmo degrau de 0,15 do original. */
          const escala = 1 - dist * 0.15;
          /* 1 · 0,4 · 0,16. A terceira camada tem de ser mais fraca do que a
             segunda por uma margem CLARA: a 0,3 lia-se como um card meio
             carregado e não como profundidade. */
          const opacidade = dist === 0 ? 1 : dist === 1 ? 0.4 : 0.16;
          /* 0 · 4 · 7 px. Sobe mais depressa do que a opacidade desce porque é o
             desfoque, e não a transparência, que diz "está atrás". */
          const desfoque = dist === 0 ? 0 : dist === 1 ? 4 : 7;

          return (
            <div
              key={cartao.id}
              className="cf__cartao"
              data-dist={dist}
              /* ⚠️ `inert` NOS CARTÕES QUE NÃO ESTÃO NO CENTRO, e é o que
                 resolve um problema que o componente de origem tinha: os cards
                 laterais estão desfocados a 40% de opacidade, e os links lá
                 dentro continuavam focáveis por teclado — o Tab levava o foco
                 para dentro de um card ilegível, e quem navega a ouvir apanhava
                 sete vezes a mesma lista de acções.
                 `inert` tira-os do Tab E da árvore de acessibilidade de uma vez,
                 sem `tabIndex={-1}` espalhado por cada elemento interactivo. */
              inert={!centro}
              style={{
                transform: `translateX(${pos * 45}%) scale(${escala}) rotateY(${pos * -10}deg)`,
                /* 10 · 9 · 8: o mais próximo do centro fica sempre à frente do
                   que vem atrás dele, seja qual for o número de camadas. */
                zIndex: 10 - dist,
                /* A opacidade, o desfoque e a visibilidade vivem no CSS por
                   `data-dist`: são o que muda com a largura do ecrã. Aqui fica só
                   o que é igual em todas as medidas. */
                ["--pos-opacidade" as string]: escondido ? 0 : opacidade,
                ["--pos-desfoque" as string]: `${desfoque}px`,
              }}
            >
              {/* ⚠️ SEM TERNÁRIO DE VARIANTE: havia aqui um `cartao.tipo ===
                  "reel" ? … : …` porque existia um segundo tipo de cartão (o de
                  canal, da secção das redes sociais, que saiu da página a
                  17/8/2026). Com um tipo só, o ternário era uma condição sempre
                  verdadeira a fingir que havia uma escolha. */}
              <div
                role="group"
                aria-roledescription={rotulos.reel}
                aria-label={`${rotulos.posicoes?.[i] ?? ""}: ${cartao.legenda}. ${cartao.alt}.`}
                className="cf__caixa"
              >
                {/* `loading="eager"` e não `lazy`: são sete `.webp` que somam
                    ~300 KB no total, e um `lazy` dentro de um elemento com
                    `visibility: hidden` pode nunca chegar a ser pedido — o card
                    chegava ao centro com a imagem por descarregar, que é
                    exactamente o buraco visual que o poster existe para tapar.
                    As medidas vão no `width`/`height` para o browser reservar a
                    caixa e a fila não saltar quando as imagens chegam. */}
                {/* ⚠️ `<img>` E NÃO `next/image`, e o aviso do lint está
                    silenciado com razão e não por conveniência: o site é
                    `output: "export"`, onde o optimizador de imagem do Next não
                    existe (`images.unoptimized` está declarado no
                    `next.config.ts`). O `<Image>` limitava-se a acrescentar um
                    wrapper e um `srcSet` de um só tamanho a um ficheiro que já
                    está exactamente na medida em que é desenhado — 480×854, o
                    mesmo do MP4 que entra por cima dele. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="cf__poster"
                  src={cartao.poster}
                  width={cartao.largura}
                  height={cartao.altura}
                  /* `alt=""` de propósito: a descrição da peça já está no
                     `aria-label` do grupo, e repeti-la aqui fazia um leitor de
                     ecrã anunciar a mesma frase duas vezes por card. */
                  alt=""
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* SÓ O CARTÃO CENTRAL MONTA `<video>`, e só ele recebe `src`.
                    Quando o centro muda, este elemento desmonta com o card que
                    deixou de estar à frente e o browser larga o ficheiro em vez
                    de guardar sete buffers abertos.

                    `preload="none"` e não `metadata`: são sete ficheiros de
                    16 s a 720p (4 a 9 MB cada), e sete deles a pedir cabeçalho ao
                    entrar na secção é rede gasta por cartões que talvez ninguém
                    veja. O `play()` do
                    efeito é que dispara o pedido, e com `+faststart` (o `moov` à
                    cabeça, verificado no ficheiro) os primeiros segundos chegam
                    sem esperar pelo resto.

                    Sem `autoPlay` no JSX de propósito: quem toca é o efeito,
                    depois de o `muted` estar aplicado. O atributo declarativo
                    tentava tocar antes disso e queimava a primeira tentativa em
                    iOS. */}
                {centro && movimentoOk && cartao.video ? (
                  <video
                    ref={(node) => {
                      videoRef.current = node;
                      if (!node) return;
                      /* Mudo SEMPRE ao montar, mesmo com o som ligado: é esta a
                         condição que o browser exige para deixar o `play()`
                         arrancar. O som é reposto logo a seguir pelo efeito, já
                         com o vídeo a correr — e aí já não é autoplay com som, é
                         um vídeo a andar que alguém mandou ouvir.
                         O React trata `muted` como PROPRIEDADE e o atributo
                         nunca chega ao DOM; várias engines olham para o ATRIBUTO
                         no momento em que decidem o autoplay. */
                      node.muted = true;
                      node.setAttribute("muted", "");
                      if (comSom) {
                        node.muted = false;
                        node.removeAttribute("muted");
                      }
                    }}
                    className="cf__video"
                    src={cartao.video}
                    poster={cartao.poster}
                    preload="none"
                    muted
                    loop
                    playsInline
                    draggable={false}
                    tabIndex={-1}
                    disablePictureInPicture
                    disableRemotePlayback
                    /* Decorativo para quem ouve: o que ele mostra está no
                       `aria-label` do grupo. */
                    aria-hidden="true"
                    data-tocar={tocandoId === cartao.id ? "true" : "false"}
                    onPlaying={() => setTocandoId(cartao.id)}
                    onEmptied={() => setTocandoId(null)}
                    /* A SEGUNDA REDE. O efeito corre quando o centro muda; isto
                       corre quando o FICHEIRO fica pronto, que com
                       `preload="none"` é sempre depois. Sem ele, um cartão que
                       chegasse ao centro antes de ter dados ficava na fotografia
                       mesmo com o efeito a ter feito o seu trabalho. */
                    onCanPlay={(e) => {
                      const v = e.currentTarget;
                      if (v === videoRef.current) {
                        void v.play().catch(() => undefined);
                      }
                    }}
                    /* E a terceira: um vídeo que estava a tocar e engasgou por
                       rede volta a arrancar sozinho quando houver dados. */
                    onStalled={(e) => {
                      const v = e.currentTarget;
                      if (v === videoRef.current) {
                        void v.play().catch(() => undefined);
                      }
                    }}
                  />
                ) : null}

                {/* O SOM, no canto superior direito. Só no card central — nos
                    laterais é conteúdo desfocado a 40% que ninguém consegue ler
                    nem tocar.
                    O SOM É EXPLÍCITO E FOCÁVEL, e não "mudo para sempre": estes
                    reels têm consultores a falar para a câmara, ou seja o áudio
                    É conteúdo. Um carrossel que o esconde sem alternativa está a
                    mostrar metade do trabalho.
                    `aria-pressed` porque é um alternador de estado e não uma
                    acção — sem ele, um leitor de ecrã anuncia "botão ligar o som"
                    mesmo quando o som já está ligado.
                    `stopPropagation` no ponteiro: o palco inteiro escuta
                    `pointerdown` para o swipe, e sem isto carregar no botão
                    contava como início de arrasto. */}
                {centro && movimentoOk && cartao.video ? (
                  <button
                    type="button"
                    className="cf__som"
                    aria-label={comSom ? rotulos.desligarSom : rotulos.ligarSom}
                    aria-pressed={comSom}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setComSom((v) => !v)}
                  >
                    {comSom ? (
                      <Volume2
                        className="size-[18px]"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <VolumeX
                        className="size-[18px]"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ) : null}

                {/* ==========================================================
                    O CARD INTEIRO É O LINK PARA O REEL. Só no central.

                    ⚠️ AQUI ESTAVA O PÉ DO CARD — legenda, nota de excerto e uma
                    cápsula "Ver o reel completo" — e saiu a 17/8/2026 por decisão
                    do cliente: *"tira o título e o ver o reel completo, fica mais
                    clean sem isso"*. O véu do pé saiu com eles: existia para dar
                    contraste garantido a texto sobre vídeo, e sem texto era um
                    degrau escuro a proteger nada.

                    ⚠️⚠️ O QUE NÃO PODIA SAIR ERA A SAÍDA. O que corre no card são
                    um excerto de uma peça maior, e um excerto sem caminho para o original é trabalho
                    truncado a fingir que é a peça toda. Com o card inteiro a ser o
                    link, a saída fica — e fica sem uma única peça de cromagem.

                    A INFORMAÇÃO QUE SAIU DO ECRÃ ESTÁ NO NOME ACESSÍVEL: legenda,
                    a nota de excerto e o destino, nesta ordem. Quem ouve a página
                    continua a saber o que vai abrir e que o que está a ver é um
                    excerto; a divulgação visível do excerto passou a ser feita no
                    lede da secção, que é onde ela serve as sete peças de uma vez.

                    ⚠️ E NÃO LEVA `stopPropagation` NO PONTEIRO, ao contrário da
                    cápsula que aqui estava: este link cobre o card todo, e travar
                    o `pointerdown` aqui matava o swipe do carrossel inteiro. O que
                    impede um arrasto de acabar em navegação é o `arrastouRef` —
                    ver o gesto, lá em cima.
                    ========================================================== */}
                {centro ? (
                  <a
                    href={cartao.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cf__link"
                    aria-label={[cartao.legenda, cartao.excerto, rotulos.verNoInstagram]
                      .filter(Boolean)
                      .join(", ")}
                    onClick={(e) => {
                      /* Um swipe horizontal que acaba em cima do card dispara um
                         clique. Sem isto, arrastar para ver o cartão seguinte
                         abria o Instagram. */
                      if (arrastouRef.current) {
                        e.preventDefault();
                        arrastouRef.current = false;
                      }
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="cf__seta cf__seta--esq"
        aria-label={rotulos.anterior}
        onClick={() => navegar(-1)}
      >
        <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </button>

      <button
        type="button"
        className="cf__seta cf__seta--dir"
        aria-label={rotulos.seguinte}
        onClick={() => navegar(1)}
      >
        <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
