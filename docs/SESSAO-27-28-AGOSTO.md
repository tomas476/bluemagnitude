# Caderno de obra: 27 e 28 de agosto de 2026

O que se passou na sessão que vai da ronda 4 à ronda 10, com as decisões, as
armadilhas e como se verifica cada coisa. Para o Tomás reler e para a próxima
sessão pegar sem repetir investigação.

**Links**: código em `~/Desktop/bluemagnitude-site` · repositório
https://github.com/tomas476/bluemagnitude · público em
https://tomas476.github.io/bluemagnitude/ · VPS `filipe@167.86.123.215`,
container `bluemagnitude_site`, porta interna `127.0.0.1:3362`.

**Publicar**: `git push origin main` republica o Pages sozinho. Para a VPS,
`rsync -az --delete --exclude node_modules --exclude .next --exclude out
--exclude .git -e "ssh -i ~/.ssh/id_ed25519" ./
filipe@167.86.123.215:~/bluemagnitude-site/` e depois `cd ~/sites && docker
compose up -d --build bluemagnitude_site`. Nunca `--remove-orphans` nesse stack.

---

## As rondas

### Ronda 4
- Herói sem o parágrafo por baixo do título, e o bloco desceu.
- "Quem somos" sem o rótulo e sem os parágrafos: a lista da gota de luz subiu
  para o lugar deles e o logótipo passou a alinhar com o título.
- Reels: saiu o `CarrosselReels` do painel da imogrow e entrou o **carrossel
  coverflow do primeview**. A pasta `src/components/painel/` e a ponte de
  tokens dela saíram com ele.
- Índices de serviços e projetos: as folhas já tinham `Reveal`, faltava o fade
  (ver armadilha 2).
- Painéis dos projetos: os fechados subiram de 3,5rem para 4,75rem.
- Processo: em telemóvel o passo 1 ficou sem linha e as três restantes
  desenham-se por ordem, esperam, e recolhem ao contrário, em ciclo.

### Ronda 5
- Herói: a lavagem opaca desceu de 64% para 46% e de 85% para 72%, e o título
  passou a duas linhas em desktop. **A camada verde não se toca**: está atada
  ao `campo-luz`.
- Fita dos serviços: o `transform` passou a ser escrito no próprio
  `pointermove` e passaram a ler-se os eventos coalescidos.
- **Reels a tocar**: sacados com `yt-dlp --cookies-from-browser chrome`, com a
  sessão do Tomás. Vão os primeiros 20 s de cada, 720x1280, ~19 MB os cinco.
  Masters completos em `~/Downloads/bm-reels-master`.
- Fichas de projeto com o layout das de serviço: a capa saiu para
  `ui/capa-foto.tsx`, o resumo passou a uma frase com realce
  (`ui/texto-realcado.tsx`), a ficha técnica saiu do card e ganhou CTA.
- Sobre: a fita verde foi separada do JPG, três números em vez de quatro, a
  fotografia colada à faixa, os quatro blocos passaram aos passos com ícone, e
  o título passou a escrever-se à máquina ao entrar no ecrã.
- Rodapé mais curto em telemóvel.

### Ronda 6
- A fita saiu do sítio e passou por cima dos cartões: duas causas, a caixa sem
  altura (armadilha 3) e a spline demasiado alisada (armadilha 8).
- A fotografia do Sobre passou a desvanecer no fim, com o título por cima.
- Saiu o parágrafo do Sobre; equipa e sustentabilidade ficaram a uma linha.
- Rodapé: ícones à direita do logótipo e três colunas em ecrã grande.

### Ronda 7
- Fora o CTA repetido no fim das páginas de serviço e de projeto.
- As entradas ao scroll passaram de 800 ms a 420 ms e abrem da escala.
- A fita dos serviços passou a **scroll nativo** com três cópias da lista
  (armadilha 4).
- Seta desenhada à mão no fim do lede do "Como trabalhamos", copiada do site da
  imogrow.
- A ilustração do Sobre foi refeita com casco convexo (armadilha 7) e os
  cartões ficaram sem sombra, por decisão do Tomás.

### Ronda 8
- O CTA do WhatsApp saiu da chapa escura para uma faixa com a cor de cima.
- O rodapé trocou a lista de contactos por um botão.
- Painéis dos projetos: as fotos apareciam triplicadas em telemóvel
  (armadilha 5).
- Contactos: logótipo maior, com a oval a girar.

### Ronda 9
- A oval a girar ficava torta: passou a **elipse direita e parada, com o
  tracejado a correr** (`pathLength` 1000, traços 20/20, deslocamento 40).
- O formulário de contacto passou a **três passos com barra de progresso**,
  validação por passo com foco no campo que falta, pré-visualização do que vai
  para o WhatsApp e ecrã de sucesso com link de recurso.

### Ronda 10
- O CTA por cima do rodapé passou a "Pedir proposta" e leva a `/contacto/`.
- O formulário ganhou título.
- O contorno do logótipo passou de elipse a rectângulo.
- O botão "Contactos" foi para a direita das redes, na mesma linha.
- Os cartões da ilustração do Sobre crescem 12% em telemóvel.
- E, no fim, saiu o CTA repetido no fim da página Sobre.

---

## As armadilhas

1. **Ordem da cascata.** Uma regra base escrita DEPOIS de uma media query
   ganha-lhe, com a mesma especificidade. Mordeu três vezes:
   `.numeros__valor`, `.arranque__ilustra` (atirou a ilustração para dentro do
   fluxo em desktop) e os painéis.
2. **O `transition` em atalho apaga o que estava.** A `.editorial__folha`
   declarava `transition: transform, box-shadow` e, sendo mais tardia,
   substituía a da `.reveal`: a opacidade deixava de animar e a folha saltava.
3. **Referência circular de altura.** Uma `<img height: 100%>` dentro de uma
   caixa sem altura definida: o Chrome resolve como `auto`, o Safari do iPhone
   resolve de outra maneira. Foi isto que pôs a fita verde fora do sítio E por
   cima dos cartões ao mesmo tempo. Resolve-se com `aspect-ratio` na caixa.
4. **Em iOS, ler `pointermove` e escrever `transform` nunca cola ao dedo.** Com
   `touch-action: pan-y` o browser retém os eventos enquanto decide de quem é o
   gesto e pode mandar `pointercancel` a meio. A solução é scroll nativo.
5. **`background-size: auto 120%` repete a imagem.** Num painel largo e baixo a
   largura calculada pela altura fica menor do que o painel e o browser repete.
   Com `<img>` e `object-fit: cover` amplia e corta, nunca estica.
6. **O Instagram exige sessão iniciada** para o `yt-dlp`. Sem ela recusa, com
   ou sem cookies do Chrome.
7. **Separar a fita dos cartões só resultou por forma.** Cor, ligação,
   distância à aresta e morfologia falhavam todas junto ao bordo, onde a fita,
   a sombra da fita e a sombra do cartão se misturam. Os cartões são
   quadriláteros: o **casco convexo** do que neles é chapa é exactamente o
   quadrilátero.
8. **Alisar uma curva desloca-a.** A spline com folga de 6 000 000 ficava lisa
   mas 56 px ao lado da fita pintada. Com 5 000, o desvio cai para ~5 px.
9. **Um ternário com JSX dentro de um `<svg>`** fez o parser do TypeScript
   tratar o bloco como objecto literal ("An object member cannot be declared
   optional"). Resolve-se calculando o elemento numa constante antes do
   `return`.
10. **Cortar o `site.ts` por `index()` de uma string que existe em dois
    blocos** apaga tudo o que está pelo meio. O `QUEM_SOMOS.paragrafos` começa
    igual ao do `SOBRE`, e isso levou metade do ficheiro.
11. **`prefers-reduced-motion` zera as durações**, e uma animação infinita sem
    `fill-mode` fica no estado base, que costuma ser o invisível. Todas as
    animações em ciclo levam uma regra própria a repor o estado final.
12. **Um ficheiro gerado por script não se edita à mão.** A cor da fita foi
    escrita à mão no JSON, o script reescreveu-o sem ela, e o build da VPS
    parou. Passou a ser medida pelo script.
13. **Uma prévia com base64 embebido não reflecte o ficheiro regenerado.**
    Verifiquei uma versão antiga e conclui mal.

---

## Como se verifica

- **O visor**: um `out/_visor.html` temporário com um `<iframe>` do tamanho
  pedido e os parâmetros `?u=&w=&h=&y=&shown=1&sel=&t=`. O `shown` marca todos
  os `.reveal` como revelados, e o `t` pausa as animações de um seletor num
  instante exacto, o que permite fotografar um frame determinado de um ciclo.
  Vive no `out/`, que está no `.gitignore`, e apaga-se no fim (cada build
  limpa-o de qualquer forma).
- **A fita**: renderizar só o SVG a 2200x1227 e comparar a máscara verde com a
  do JPG original. Abaixo de ~80% de sobreposição, ou acima de ~10 px de desvio
  vertical mediano, a fita saiu do lugar e nota-se.
- **O arrasto**: eventos sintéticos de ponteiro, a confirmar que o
  deslocamento do dedo e o da fita são o mesmo número no mesmo evento.

---

## Ficheiros novos desta sessão

| Ficheiro | O que faz |
|---|---|
| `src/components/ui/carrossel.tsx` | o coverflow dos reels, vindo do primeview |
| `src/components/ui/capa-foto.tsx` | a capa fotográfica das páginas interiores |
| `src/components/ui/passos.tsx` | os passos com a linha que se desenha |
| `src/components/ui/arranque-animado.tsx` | as duas camadas da ilustração do Sobre |
| `src/components/ui/seta-mao.tsx` | a seta desenhada à mão |
| `src/components/ui/texto-realcado.tsx` | o realce por `**marcas**` no conteúdo |
| `scripts/arranque-fita.py` | separa a ilustração em cartões e fita |
| `src/content/fita-arranque.json` | o caminho, a espessura e a cor da fita |

---

## Estado e pendentes

Tudo o que foi pedido nesta sessão está feito, verificado a 390 e 1440 px, no
git, no GitHub Pages e na VPS com o container saudável.

1. **Registo A** de `bluemagnitude.imogrow.pt` para `167.86.123.215` na Amen, e
   depois o vhost no Caddy da VPS. **DNS primeiro, vhost depois**, senão queima
   o rate limit do Let's Encrypt do `imogrow.pt`.
2. **Convite ao Fábio** (`fabiocabaceira`) para o repositório: enviado, à espera
   de aceitação em https://github.com/tomas476/bluemagnitude/invitations
3. **Perguntas ao cliente** em `docs/PERGUNTAS-AO-CLIENTE.md`: NIF, nome legal,
   ano de fundação, equipa, números totais, testemunhos, certificações.
