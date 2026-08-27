# CONTEXTO COMPLETO: site da Blue Magnitude

Cola isto inteiro na primeira mensagem da conversa nova. É o resumo de tudo o que foi feito, decidido e aprendido em 26 e 27 de agosto de 2026, para o Claude novo pegar exatamente onde este ficou. Lê também as memórias locais em `~/.claude/projects/-Users-tomasferreira/memory/` (há `project_bluemagnitude_site.md`) e o `docs/CONTEXTO.md` do próprio repositório.

---

## 1. Quem, o quê e porquê

**Cliente**: Blue Magnitude, instalações fotovoltaicas em Leiria (bluemagnitude.pt, WordPress com o tema comprado Energyland). Serviços: autoconsumo, autoconsumo com baterias, off-grid, AVAC e climatização, manutenção, consultoria. Operam em Leiria, Santarém e Lisboa. Claim do logótipo: "Fazemos circular energia". **O cliente é que chamou a imogrow e quer reunião**: o site é a prova do que valemos, tem de ficar impecável.

**Nós**: Tomás, da imogrow (ver memória `user_tomas_imogrow.md`). Trabalha com o Fábio (`fabiocabaceira` no GitHub, ainda não autenticado no `gh` deste Mac).

**O que se fez**: site novo de raiz, no sistema visual do primeview-site (VPS, `~/primeview-site`) adaptado a claro e à marca deles. Três rondas de revisão no iPhone do Tomás, cada uma com listas longas de alterações, todas aplicadas.

## 2. Onde vive tudo

| Coisa | Onde |
|---|---|
| Código (fonte de verdade) | `~/Desktop/bluemagnitude-site` no Mac, git, branch `main` |
| GitHub | https://github.com/tomas476/bluemagnitude (público, conta tomas476) |
| **Link público para mostrar** | **https://tomas476.github.io/bluemagnitude/** (GitHub Pages, republica sozinho a cada push para `main` via `.github/workflows/pages.yml`) |
| VPS | `filipe@167.86.123.215` (chave `~/.ssh/id_ed25519`), pasta `~/bluemagnitude-site`, container `bluemagnitude_site` no stack `~/sites/docker-compose.yml`, rede `imogrow_net`, porta interna `127.0.0.1:3362`, Caddyfile em `~/sites/bluemagnitude.Caddyfile` |
| Vhost público na VPS | **AINDA NÃO EXISTE.** `bluemagnitude.imogrow.pt` não tem registo A na Amen. Pôr o vhost antes do DNS queima o rate limit do Let's Encrypt do `imogrow.pt` e arrasta o fred, o diogosilva, o tomasmarques e o primeview. **DNS primeiro, vhost depois.** |
| Servidor local para o telemóvel | `cd ~/Desktop/bluemagnitude-site/out && python3 -m http.server 4321`, e no iPhone `http://192.168.1.242:4321` (mesma wifi) |
| Auditoria do site antigo | `~/Downloads/auditoriabluemagnitude.md` (752 linhas, a fonte de todo o conteúdo) |
| Vídeo master do hero | `~/Downloads/hf_20260826_220221_7945ba99-b01a-4d84-99c3-77f6aba2c959.mp4` (Higgsfield, HEVC 10 bits, não serve para web) |

**Deploy para a VPS** (receita que funciona):
```
cd ~/Desktop/bluemagnitude-site
rsync -az --delete --exclude node_modules --exclude .next --exclude out --exclude .git -e "ssh -i $HOME/.ssh/id_ed25519" ./ filipe@167.86.123.215:~/bluemagnitude-site/
ssh -i ~/.ssh/id_ed25519 filipe@167.86.123.215 'cd ~/sites && docker compose up -d --build bluemagnitude_site'
```
Nunca `--remove-orphans` nesse stack.

**Deploy para o GitHub Pages**: `git push origin main`. O workflow corre `npm run build:pages` (que define `BASE_PATH=/bluemagnitude` e `NEXT_PUBLIC_BASE_PATH=/bluemagnitude`).

**Build local normal** (para VPS e telemóvel): `npx next build` sem variáveis. **Atenção**: depois de um `npm run build:pages` a pasta `out/` fica com o prefixo; correr `npx next build` outra vez antes de servir localmente ou fazer rsync.

## 3. Stack e regras técnicas que custaram bugs

Next 16.2 + React 19 + Tailwind 4, `output: "export"`, `trailingSlash: true`, `images.unoptimized`. **Zero framer-motion, zero GSAP, zero shadcn.** Dependências: `lucide-react`, `clsx`, `tailwind-merge` (as duas últimas só por causa do componente do painel).

- **Tailwind 4**: um token `--color-x` em `@theme` existe como `var(--color-x)` e como utilitário, **nunca** como `var(--x)`.
- **Prefixo do Pages**: o Pages serve em subpasta. Tudo o que é caminho passa por `caminho()` em `src/lib/caminho.ts` (usa `NEXT_PUBLIC_BASE_PATH`, inlined em build). `ROTAS`, `servicoHref`, `projetoHref`, as imagens em `src/content/site.ts`, as capas em `src/content/reels.ts`, os `src` da página Sobre, e as imagens inline dos painéis. Há também `scripts/prefixar.mjs` que reescreve `href`/`src` no HTML exportado, mas **só isso não chega**: a hidratação repõe os `href` do payload, e foi isso que deu 404 em todos os links do Pages até se prefixar na origem. **Qualquer caminho novo escrito à mão tem de passar por `caminho()`.**
- **`Reveal`** (`src/components/reveal.tsx`): dois `requestAnimationFrame` encadeados antes do `setShown`, `threshold: 0`, **zero `rootMargin` negativo**. Aceita `as`, `delay`, `nome` e `aberto` (estes dois para `<details>`).
- **Blend do herói**: a camada 2b do `video-backdrop.tsx` espelha, ancorado em `50% 100%`, o gradiente que `.campo-luz__luz` pinta no topo, com **a mesma percentagem de verde (10%)**. Se um mudar sem o outro, aparece uma risca horizontal na fronteira. O mesmo sistema está copiado nas capas das páginas de serviço.
- **`.field-shell` não pinta fundo**; se pintar, tapa a lavagem do `CampoLuz`.
- **Vídeo do herói no iOS**: o `<video>` fica `opacity: 0` até `onPlaying`; um vídeo pausado no iOS desenha o botão de play do sistema, invisível não desenha nada. Se `play()` for recusado 3 vezes, desmonta e fica o poster a respirar. Tenta outra vez no primeiro toque e no `visibilitychange`. `prefersLightweight()` não conta `prefers-reduced-motion` como razão para não haver vídeo.
- **Keyframes CSS**: propriedades em longhand, nunca o shorthand `animation` (repõe `animation-delay: 0s`). Quando se editam keyframes com regex, cuidado: o `}` interior dos frames faz o regex parar cedo e deixa caudas órfãs que partem o build (aconteceu).
- **Componentes cliente**: uma função (um ícone do lucide, por exemplo) não atravessa a fronteira servidor/cliente. Os painéis recebem o ícone **por nome** (`icone: "sol"`).
- Sem `backdrop-filter` na navbar. Sem `tel:` em CTA de navegação (só em botões que digam "ligar").

## 4. Sistema visual

**Paleta** (tirada do logótipo, não do tema antigo): `--color-brand #2A3FA7` (azul, faz o trabalho: botões, links, títulos), `--color-accent #84C885` (verde, é luz: lavagens, aresta acesa, gota), `--color-accent-ink #3E7A48` (o verde quando tem de ser texto, porque `#84C885` sobre claro dá 1,9:1). Fundo `--color-shell #F2F5FC` (nunca branco puro), `--color-plate #FFF`, `--color-plate-2 #E8EDF9`, `--color-deep #0B1437`. `--color-ink-faint` é `#586386` (foi escurecido de `#64709A` por contraste medido). Verde só vira texto na variante escura.

**Tipografia**: Manrope, uma família só, via `next/font/google`. Escala fluida em `clamp()` sem breakpoints (`--t-display`, `--t-title`, `--t-h3`, `--t-lede`, `--t-body`, `--t-label`). `* { text-transform: none }`.

**Espaçamento**: `--s-xs` a `--s-xl` em `clamp()`, `.shell` a 78rem, `.section { padding-block: var(--s-xl) }`, `.section--tight`.

**Campos**: `.field-shell`, `.field-plate`, `.field-plate-2`, `.field-deep` declaram a superfície; os componentes lá dentro nunca pensam em cor.

**Raios**: `--radius-plate 12px`, `--radius-field 10px`, `--radius-reel 16px`, pílulas em `999px`.

**Regras da casa** (memórias `reference_banned_components`, `feedback_sem_traco_no_meio_da_frase`, `feedback_mobile_first`, `feedback_deploy_sempre`): nada de traço `-`/`–`/`—` a meio de frase em texto nenhum; nada de cápsula de prova social, numeração decorativa 01/02/03 em secções, par de botões primário+fantasma, glassmorphism, vocabulário de template; mobile a 390px primeiro; publicar é parte de acabar, não se pergunta; zero factos inventados (NIF, ano de fundação, equipa, números totais estão em `docs/PERGUNTAS-AO-CLIENTE.md`, nunca no ecrã).

## 5. Mapa do site e componentes

**Rotas** (`src/content/rotas.ts`): `/`, `/sobre/`, `/servicos/`, `/servicos/[slug]/` (6), `/projetos/`, `/projetos/[slug]/` (5), `/contacto/`, `/privacidade/`, 404, `robots.txt`, `sitemap.xml`. Conteúdo todo em `src/content/site.ts` (EMPRESA, HERO, QUEM_SOMOS, SERVICOS, PROJETOS, PROCESSO, PERGUNTAS, CONTACTO, PRIVACIDADE, SOBRE, ARRANQUE) e `src/content/reels.ts`.

**Homepage** (`src/app/page.tsx`), por ordem: Hero (vídeo) → Quem somos (logótipo animado + título + parágrafos + `ListaLuz` dos pilares + foto real só em desktop) → Reels → Serviços (`FitaServicos`) → Projetos (`Paineis`) → Processo → Perguntas (acordeão exclusivo) → Rodapé curto com CTA de WhatsApp. **Não há secção de formulário na homepage**, o formulário vive em `/contacto/`.

**Componentes** em `src/components/`:
- `hero/hero.tsx` + `hero/video-backdrop.tsx`: vídeo em `public/video/hero-lg.mp4` (5,3 MB) e `hero-vert.mp4` (1,9 MB, recorte que inclui o logótipo da fachada), posters webp. Laço cosido com `xfade` de 0,8s, não ping-pong.
- `ui/marca-animada.tsx`: o gesto da marca. PNG do logótipo do cliente (`public/marca/logo-cor.png`, 1305x469) com SVG por cima no mesmo viewBox: sublinha "Blue", sublinha "Magnitude", oval à volta que não fecha, respira, desfaz pela ordem inversa. Ciclo 6,5s, easing com peso. Tamanhos `grande`, `media`, `pequena`. Está no Quem somos, no Sobre (pequena) e nos Contactos (media, centrada e deslocada `-translate-x-12` em desktop). **O logótipo é do cliente e não se redesenha; só o traço é nosso.**
- `ui/lista-luz.tsx`: timeline vertical com **gota de luz** que acumula num tópico e cai para o seguinte (queda 3x mais rápida que a acumulação). Keyframes gerados no servidor por número de itens (`<style precedence>` desduplicado). Variante `icone` põe ícones do lucide em círculos, e **ao pousar a gota acende o círculo inteiro**. Altura fixa por tópico. **Não são cards.** Usada nos pilares do Quem somos, no "O que ganhas" das páginas de serviço e na qualidade do Sobre.
- `ui/fita-servicos.tsx`: marquee dos 6 serviços com fotografia e título sobre tinta, movimento contínuo para a esquerda por rAF, **arrastável nos dois sentidos** com dedo ou rato por cima do automático, arrasto >6px engole o clique, pausa com rato em cima.
- `ui/paineis.tsx`: adaptação do `interactive-selector` que o Tomás mandou (flex 7 vs 1, 700ms, rótulo a deslizar). Vertical em ecrã pequeno, horizontal a partir de 48rem. Sem numeração. Variante `foto` e `icone`. Usado nos projetos da homepage e nas "Outras instalações" da ficha de projeto.
- `ui/lista-editorial.tsx`: os índices `/servicos/` e `/projetos/`, à referência que o Tomás mandou: **folhas brancas empilhadas de ponta a ponta do ecrã** (a folha seguinte tapa o pé da anterior, `margin-top: -5.5rem`), indice + nome grande + coluna verde de tópicos + fotografia colada ao bordo direito a ocupar a altura toda; a folha sob o rato levanta-se. **Sem descrição.** Em telemóvel (<60rem) vira outra coisa: fotografia 4:3 de ponta a ponta com o título branco sobre subida de tinta forte.
- `ui/titulo-teclado.tsx`: título escrito à máquina, texto completo sempre no DOM, **quebra por palavra** (spans `nowrap` por palavra). Só nas páginas de serviço.
- `ui/acordeao.tsx`: `<details>` com estado controlado, **uma pergunta aberta de cada vez**.
- `ui/pagina.tsx`: molde das páginas interiores (navbar pousada, cabeçalho, `CampoLuz`). Props `tituloTeclado` e `gigante`.
- `site-nav.tsx`: fixa, transparente sobre o herói e "pousa" por sentinela de 1px (IntersectionObserver, zero listeners de scroll). Submenu de serviços em desktop. Folha mobile com foco preso, **serviços recolhidos atrás de uma seta**, e o logótipo da folha leva à home.
- `site-footer.tsx`: curto, CTA "Falar por WhatsApp", contactos, redes, privacidade, livro de reclamações.
- `contacto-form.tsx`: sem backend, abre `wa.me/351938719773` com a mensagem preenchida; `mailto:` como alternativa.
- `painel/`: o **CarrosselReels do painel da imogrow** (`~/imogrow-realtor-kit/componentes/react/ui/CarrosselReels.tsx` na VPS), **não reescrito**. Mudanças de integração anotadas: `"use client"`, tipos `RefObject<... | null>` do React 19, `type JSX` importado, `lib/motion.tsx` local com só o `useReducedMotionSafe` para não arrastar framer-motion, tokens da casa dele (`brass`, `bone`, `ink-deep`, `surface`, ...) mapeados no fim do `globals.css`, fallback `/marca/icone.png`.

**Reels** (`src/content/reels.ts`): os 5 shortcodes do Tomás na ordem dele, `DR5QkzNAKF5` (destaque), `DUptUr5FK9a`, `DV01xOrCuTX`, `DZZkpDjtM1g`, `DZ95xrKQdvg`. **Capas reais** em `public/reels/<id>.webp` (sacadas do endpoint `instagram.com/p/<id>/media/?size=l`). **Vídeos não**: o Instagram exige sessão iniciada e todos os métodos falharam (yt-dlp com cookies Safari bloqueado por TCC, Chrome sem sessão, embed é shell de login). Por isso a ação de cada cartão é `link` para o reel real. Quando o cliente exportar os `.mp4` (1080x1920, H.264, <8 MB), põem-se em `public/reels/<id>.mp4` e a ação passa a `{ tipo: "video", src }`. Título da secção: "Acompanha-nos nas redes".

**Página Sobre** (`src/app/sobre/page.tsx`): arranque à referência do Miros que o Tomás mandou, reproduzida pelo Higgsfield com `nano_banana_pro` + a referência como `image_references`: fita verde, cartão "Produção mensal" (painéis, bateria), cartão escuro "Energia limpa para a tua empresa" com "Fatura da luz" a descer em euros, cartão "Poupança 61 €". Ficheiro `public/sobre/arranque.jpg` (2200 px de largura). Em desktop é fundo absoluto e o título "Fazemos circular energia" vive no canto superior esquerdo que a imagem deixa livre, **sem parágrafo nenhum**; em telemóvel a ilustração entra no fluxo por baixo do título (`order: 2`). Depois: faixa escura "A Blue Magnitude em números" (05 instalações documentadas, 12 100 W o maior sistema, 3 distritos, 6 serviços; só números verificáveis, com legenda honesta), história com foto real deles, blocos missão/visão/equipa/sustentabilidade, qualidade com `ListaLuz` de ícones.

**Páginas de serviço** (`src/app/servicos/[slug]/page.tsx`): a fotografia do serviço é a **capa**, com o mesmo blend do herói e navbar transparente a pousar; título teclado; intro; "O que ganhas" em `ListaLuz` de ícones; bloco extra em lista numerada de passos; CTA escuro com WhatsApp + formulário.

**Contactos** (`src/app/contacto/page.tsx`): título à esquerda, logótipo animado à direita (media, centrado, `-translate-x-12`), por cima; depois linhas de contacto **com ícone** (email, WhatsApp, ligar, visitar) à esquerda e formulário em chapa à direita; mapa a toda a largura por baixo. Em mobile: título, frase, logótipo, formulário, linhas.

## 6. Higgsfield

Conta Plus. Fluxo obrigatório (memória `reference_higgsfield_mcp`): `balance`, custo com `get_cost: true`, dizer o custo, `use_unlim: false`, `jobs_wait`, `show_generation_by_ids`. Modelo `nano_banana_pro` a 2 créditos por imagem 2K, aceita referência com `role: "image_references"` (não "reference"). Upload local: `media_upload` → `curl -X PUT` → `media_confirm`. Nesta sessão gastaram-se 10 créditos (5 imagens; 2 foram descartadas por serem fotos inventadas, o Tomás quer só a reprodução de referências ou fotos reais do cliente). Saldo aprox. 64.

## 6b. Ronda 4 (27 de agosto, tarde)

Seis afinacoes pedidas pelo Tomas depois de rever no iPhone, todas aplicadas e verificadas a 390 e 1440 px:

1. **Heroi** sem o paragrafo por baixo do titulo (`HERO.lede` fica em `site.ts`, sem consumidor) e com o bloco mais em baixo (`paddingBottom` de `calc(--s-lg + --s-md + safe)` para `calc(--s-md + safe)`).
2. **Quem somos** sem o rotulo e sem os dois paragrafos. A `ListaLuz` subiu para o lugar deles (`mt-[var(--s-md)]`), o `credito` do `CabecalhoSeccao` passou a opcional, e o logotipo leva `marca-animada--esquerda` para alinhar com o titulo.
3. **Reels**: fora o `CarrosselReels` do painel da imogrow, dentro o **carrossel coverflow do primeview** (`~/primeview-site/src/components/ui/carrossel.tsx` na VPS), copiado com os comentarios. Tres adaptacoes, marcadas com ⚠️ no ficheiro: caminhos ja prefixados por `caminho()` (o Pages serve em subpasta), `video` opcional porque nao ha MP4 nenhum, e a aresta do cartao a seguir `--field-line-strong` porque a faixa e escura. **A pasta `src/components/painel/` desapareceu**, e com ela o bloco "PONTE PARA O PAINEL DE COMPONENTES" do `globals.css`: nada mais lhes tocava.
4. **Indices de servicos e projetos**: as folhas ja tinham `Reveal`, o que faltava era o fade. A `.editorial__folha` declarava um `transition` so com `transform` e `box-shadow` e, sendo regra mais tardia, substituia o da `.reveal` por inteiro. As tres transicoes passaram a viver juntas, o atraso do stagger foi para `[data-shown="true"]` (e a zero no hover), o percurso subiu para 2.5rem e o stagger para 110ms.
5. **Paineis dos projetos**: em coluna os fechados sobem de `3.5rem` para `4.75rem` e o contentor de `clamp(22rem,56svh,30rem)` para `clamp(27rem,66svh,35rem)`. Em desktop nada muda (la o `flex-grow` distribui largura).
6. **Processo**: em telemovel (`max-width: 39.99rem`) o passo 1 fica sem linha e as tres restantes sao `<span>` com `scaleX`, desenhadas por ordem, com pausa, e a recolher pela ordem INVERSA, em ciclo de 5,08s. As keyframes sao geradas no servidor em `home/processo.tsx` (uma por posicao, porque um `animation-delay` unico nao sabe inverter a ordem no regresso), no mesmo padrao da `ListaLuz`. Em desktop mantem-se o `border-top` nos quatro. Ha uma regra propria de `prefers-reduced-motion` a por as linhas a `scaleX(1)`, senao ficavam invisiveis.

**Como se verificou** (util para a proxima vez): o Chrome headless nao chega, porque o heroi e `100svh` e as ancoras nao param onde e preciso. O truque foi um `out/_visor.html` temporario com um `<iframe>` do tamanho pedido (`?u=&w=&h=&y=`), mais dois parametros de diagnostico: `shown=1` marca todos os `.reveal` como revelados, e `t=` pausa as animacoes de um seletor num instante exacto, o que permite fotografar um frame determinado do ciclo das linhas. O ficheiro **nao ficou no repositorio** (vive em `out/`, que esta no `.gitignore`).

## 6c. Ronda 5 (27 de agosto, noite)

1. **Heroi**: a lavagem opaca do `video-backdrop` (camada 2) desceu de `h-[64%]`/`via-shell/85` para `h-[46%]`/`via-shell/72`, e o titulo ganhou `lg:max-w-[24ch]` (duas linhas em vez de tres) com menos `paddingBottom`. **A camada 2b nao se toca**: continua atada ao `campo-luz__luz`.
2. **Fita dos servicos**: o arrasto ja era 1:1, o que faltava era pintar. O `transform` passou a ser escrito dentro do proprio `pointermove` (nao no rAF seguinte) e leem-se os `getCoalescedEvents()`. Verificado com eventos sinteticos: dedo 20/60/120/180 px, fita 20/60/120/180 px, no mesmo evento.
3. **Reels a tocar**: sacados com `yt-dlp --cookies-from-browser chrome` (o Tomas iniciou sessao no Instagram no Chrome deste Mac; sem sessao o Instagram recusa). Masters completos em `~/Downloads/bm-reels-master`. No site vao os **primeiros 20 s** de cada, 720x1280, H.264 CRF 26, AAC 96k, `+faststart` (~19 MB os cinco). O carrossel do primeview ja monta `<video>` e botao de som quando o cartao tem `video`. A seccao passou a dizer que sao excertos.
4. **Fichas de projeto** com o layout das de servico: a capa fotografica saiu da pagina de servico para `ui/capa-foto.tsx` (as seis camadas + migalhas + titulo teclado) e serve as duas. A ficha tecnica deixou o card `.plate` e passou a regua cortada (`border-top` de 2px, `sm:2 / lg:3` colunas). Ganhou CTA escuro. Os `resumo` passaram de tres paragrafos de ~1000 caracteres a **uma frase** com realce por `**marcas**`, desenhado por `ui/texto-realcado.tsx`. Corrigido o `caminho()` duplicado nos "Outras instalacoes".
5. **A fita verde do Sobre anima-se.** A ilustracao era um JPG com tudo pintado. O `scripts/arranque-fita.py` (PIL + scipy) separa-a: morfologia (abertura, tres manchas grandes, fecho de buracos) da a silhueta dos cartoes -> `arranque-cartoes.webp` com alfa; a mascara verde da a linha central, alisada por spline, -> `src/content/fita-arranque.json`. O `ui/arranque-animado.tsx` desenha a fita em SVG **por baixo** da imagem dos cartoes, com `pathLength={1}` e `stroke-dashoffset` de 1 a 0 e de volta, em ciclo de 7,6 s. **Nao usar inundacao a partir das bordas** para recortar: ja falhou duas vezes, esta explicado no cabecalho do script.
6. **Sobre**: a faixa de numeros perdeu o "05 instalacoes documentadas" e ficou em fila de tres tambem no telemovel; a fotografia seguinte cola-se a faixa, vai de ponta a ponta e passa a 16:9 em telemovel; os quatro blocos (missao, visao, equipa, sustentabilidade) deixaram de ser `.plate` e passaram ao componente novo `ui/passos.tsx` (o dos "Passo 1..4", agora parametrizado, com icone por passo); o `h2` escreve-se a maquina ao entrar no ecra (`TituloTeclado aoEntrar`, pausado ate o `Reveal` dizer `data-shown`); os tres paragrafos passaram a um.
7. **Rodape** mais curto em telemovel: menos `padding-block`, sai a linha que repetia o botao, o horario passa a `.meta` e os contactos ganham alvo de toque de 44px.

⚠️ **Duas armadilhas que morderam nesta ronda, ambas de cascata**: uma regra base escrita DEPOIS de uma media query ganha-lhe (aconteceu com `.numeros__valor` e com `.arranque__ilustra`, que atirou a ilustracao para dentro do fluxo em desktop). E cortar `site.ts` por `index()` de uma string que existe em dois blocos apaga o que esta pelo meio (o `QUEM_SOMOS.paragrafos` comeca igual ao do `SOBRE`).

## 6d. Ronda 6 (27 de agosto, noite)

1. **A fita verde estava fora do sitio e por cima dos cartoes**, e eram dois defeitos com causas diferentes:
   - **A caixa.** A `.arranque__ilustra` nao tinha altura: vinha da `<img>`, que pedia `height: 100%` a caixa. Referencia circular. O Chrome resolvia-a como `auto` e ficava bem; o Safari do iPhone resolvia-a de outra maneira e a caixa do SVG deixava de ser a caixa da imagem, o que desalinha a fita E a poe por cima dos cartoes ao mesmo tempo. Agora a caixa tem `aspect-ratio: 2200 / 1227`, as duas camadas sao absolutas com `inset: 0`, e a ordem e por `z-index` e nao pela ordem do DOM. Medido no browser: as duas caixas dao exactamente o mesmo rectangulo.
   - **O traco.** A spline de alisamento estava com folga de 6 000 000 e a curva, lisa, tinha **56 px de desvio mediano** face a fita pintada. Passou para 5 000: desvio mediano **5,5 px** e sobreposicao com a fita original de **85,7%** (era 21,8%). ⚠️ **Este numero mede-se, nao se ve**: ha um bloco no fim desta nota com o metodo.
2. **A fotografia do Sobre** desvanece no fim (`mask-image` linear ate transparente) e o bloco de texto sobe (`margin-top` negativo) para o rotulo e o titulo assentarem nela, como no heroi. So em telemovel.
3. **Fora o paragrafo** por baixo de "Fazemos circular energia positiva" (`SOBRE.paragrafos` saiu do `site.ts`), e os blocos "A nossa equipa" e "Sustentabilidade" passaram a uma linha cada. Missao e Visao ficaram como estavam.
4. **Rodape**: os icones do Instagram e do Facebook passaram para a direita do logotipo, na mesma linha, nas duas medidas. Em ecra grande a informacao divide-se em tres colunas (marca | morada e email | telefone e horario). Em telemovel o ar apertou e os alvos de toque passaram de 2,75rem para 2,5rem.

**Como se mede se a fita esta no sitio** (para nao voltar a discutir a olho):
```
# renderiza so o SVG a 2200x1227 num HTML minimo e compara as mascaras verdes
IoU = (verde_original & verde_novo & ~cartao) / (verde_original | verde_novo & ~cartao)
```
Abaixo de ~80% de sobreposicao, ou acima de ~10 px de desvio vertical mediano, a fita saiu do lugar e nota-se.

## 7. Estado atual e o que falta

**Tudo o que o Tomás pediu nas três rondas está feito, verificado com captura CDP a 390 e 1440 px, no git, na VPS (container saudável) e no GitHub Pages (links a funcionar depois do fix do prefixo).**

Pendentes que não dependem de mim:
1. **Registo A** de `bluemagnitude.imogrow.pt` → `167.86.123.215` na Amen. Depois, acrescentar o vhost no `~/infra/caddy/Caddyfile` da VPS a apontar para `bluemagnitude_site:80` (seguir o bloco do `primeview.imogrow.pt` como molde), e o site fica no domínio próprio.
2. **Vídeos dos reels** exportados pelo cliente.
3. **Conta do Fábio no GitHub**: se o Tomás quiser o repositório lá, ou transferir nas settings ou `! gh auth login` com a conta dele.
4. **Perguntas ao cliente** em `docs/PERGUNTAS-AO-CLIENTE.md`: NIF, nome legal, ano de fundação, equipa, números totais, testemunhos, certificações/DGEG, termos e condições, horário confirmado.

## 8. Como o Tomás trabalha (para não repetir erros)

- Manda referências visuais (fotos, componentes de 21st.dev/v0) e quer **exatamente aquilo**, "mesmo parecido", recolorido para a paleta. Não interpretar: reproduzir. Quando mandou o `interactive-selector`, queria-o usado tal e qual; quando mandou o Miros, queria o Higgsfield a copiar o layout, não fotos novas.
- Revê no **iPhone** e manda capturas. Mobile a 390px é o que conta primeiro.
- Irrita-se quando algo genérico substitui o que pediu, ou quando a mesma coisa é pedida duas vezes. Fazer bem à primeira, verificar com captura real antes de dizer que está feito.
- Português de Portugal, tom direto, tu.
- "Puxa agentes" quando a tarefa é grande: ele quer paralelismo e execução, não perguntas.
