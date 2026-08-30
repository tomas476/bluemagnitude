#!/usr/bin/env python3
"""
Constroi `public/marca/marca-nasce-sol.webp`: a marca a nascer, em WebP animado com
alfa, a partir do MP4 do Higgsfield.

Uso: python3 scripts/marca-nasce.py <video.mp4> [inicio_em_segundos]

Porque nao vai o video directamente para a pagina: o fundo por baixo e um
degrade (`campo-luz__luz`), portanto e preciso alfa a serio; e o heroi ja
mostrou o que custa por um <video> a tocar sozinho em iOS. Um WebP animado toca
dentro de um <img>, faz o laco sozinho e nao pede autoplay a ninguem.

Quatro decisoes que sao o motivo de isto caber num ficheiro pequeno e limpo:

⚠️ 1. O BRANCO TIRA-SE POR CANAL, NAO POR LIMIAR. Cada pixel e a mistura
`p = a*C + (1-a)*255` entre uma das duas cores da marca e o branco. Classifica-se
o pixel (azul ou verde), resolve-se o alfa pelo canal de maior contraste, e
escreve-se a COR EXACTA da marca com esse alfa. As arestas ficam vector e nao
JPEG.

⚠️ 2. O CHAO DO ALFA E 0,07 E NAO ZERO. O MP4 vem de H.264 e o "branco" dele
anda nos 250 a 253, o que deixava um alfa residual de ~2% em todo o fundo: um
rectangulo cinzento por cima do degrade. Cortar em baixo e reesticar deixa o
vazio mesmo vazio.

⚠️ 3. O ALFA GUARDA-SE EM 8 NIVEIS. E aqui que esta o ficheiro: com o alfa
completo os mesmos fotogramas davam 741 KB, com 8 niveis dao ~220 KB, sem
perdas na cor. A imagem mostra-se a menos de um terco desta medida, por isso os
degraus nao chegam ao ecra.
NAO tentar `mix-blend-mode: multiply` para fugir ao alfa: `.campo-luz__conteudo`
tem `z-index: 1` e a lavagem fica FORA desse contexto, por isso o multiply nao
teria nada por baixo com que misturar e ficava uma chapa branca. Ja se tentou.

⚠️ 4. O ESTADO DE REPOUSO E O LOGOTIPO DELE. Os ultimos fotogramas desvanecem
para o `icone.png` verdadeiro, e o recorte e calculado para dar exactamente o
mesmo enquadramento que esse ficheiro tem. Assim o WebP e o PNG parado (o de
`prefers-reduced-motion`) assentam um sobre o outro ao pixel.

O ciclo e PING-PONG: nasce, segura, desfaz-se pela ordem inversa ao dobro da
velocidade. O laco fecha exactamente e nao ha salto no reinicio.
"""
import subprocess, sys, tempfile
from pathlib import Path
import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ICONE = RAIZ / "public/marca/icone.png"
DESTINO = RAIZ / "public/marca/marca-nasce-sol.webp"

AZUL = np.array([36, 63, 173], float)
VERDE = np.array([108, 202, 125], float)
LADO = 480           # lado do fotograma antes do recorte
FPS = 16
NIVEIS_ALFA = 8
SEGURA_MS = 1200     # o logotipo inteiro fica parado
PAUSA_MS = 700       # respiro antes de voltar a nascer
CAUDA = 6            # fotogramas a desvanecer para o icone verdadeiro


def sem_branco(rgb: np.ndarray) -> np.ndarray:
    """RGB uint8 -> RGBA uint8, branco fora e cores presas as da marca."""
    f = rgb.astype(float)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    e_azul = (b - r) > (g - r)
    alfa = np.where(e_azul, (255 - r) / (255 - AZUL[0]), (255 - r) / (255 - VERDE[0]))
    alfa = np.clip((alfa - 0.07) / 0.93, 0, 1)
    saida = np.zeros(f.shape[:2] + (4,), np.uint8)
    saida[..., :3] = np.where(e_azul[..., None], AZUL, VERDE).astype(np.uint8)
    saida[..., 3] = (np.round(alfa * NIVEIS_ALFA) / NIVEIS_ALFA * 255).astype(np.uint8)
    return saida


def prende_alfa(rgba: np.ndarray) -> np.ndarray:
    """⚠️ Depois de qualquer mistura o alfa volta aos 8 niveis. A cauda que
    desvanece para o icone reintroduzia 256 niveis em 6 fotogramas e so isso
    fazia o ficheiro passar de 220 para 420 KB."""
    fora = rgba.copy()
    a = fora[..., 3].astype(float) / 255
    fora[..., 3] = (np.round(a * NIVEIS_ALFA) / NIVEIS_ALFA * 255).astype(np.uint8)
    return fora


def caixa(alfa: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(alfa > 24)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main(mp4: Path, inicio: float) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-ss", str(inicio), "-i", str(mp4),
             "-vf", f"fps={FPS},scale={LADO}:{LADO}:flags=lanczos", str(tmp / "f%03d.png")],
            check=True,
        )
        quadros = [sem_branco(np.array(Image.open(f).convert("RGB")))
                   for f in sorted(tmp.glob("f*.png"))]

    icone = Image.open(ICONE).convert("RGBA")
    ic = np.array(icone)
    ix0, iy0, ix1, iy1 = caixa(ic[..., 3])
    x0, y0, x1, y1 = caixa(quadros[-1][..., 3])

    # o icone verdadeiro, escalado e posto onde o modelo o deixou
    escala = (x1 - x0) / (ix1 - ix0)
    alvo = Image.new("RGBA", (LADO, LADO), (0, 0, 0, 0))
    alvo.paste(icone.crop((ix0, iy0, ix1, iy1)).resize((x1 - x0, y1 - y0), Image.LANCZOS),
               (x0, y0))
    alvo_np = prende_alfa(np.array(alvo))
    for i in range(CAUDA):
        k = (i + 1) / CAUDA
        j = len(quadros) - CAUDA + i
        misto = (quadros[j] * (1 - k) + alvo_np * k).round().astype(np.uint8)
        quadros[j] = prende_alfa(misto)
    quadros[-1] = alvo_np

    # recorte com o ENQUADRAMENTO DO ICONE: a mesma folga a volta que o
    # icone.png tem, para o PNG parado poder assentar por cima ao pixel
    cx0 = round(x0 - ix0 * escala)
    cy0 = round(y0 - iy0 * escala)
    cx1 = cx0 + round(icone.width * escala)
    cy1 = cy0 + round(icone.height * escala)
    largura, altura = cx1 - cx0, cy1 - cy0
    quadros = [np.pad(q, ((max(0, -cy0), max(0, cy1 - LADO)),
                          (max(0, -cx0), max(0, cx1 - LADO)), (0, 0)))
               [max(0, cy0):max(0, cy0) + altura, max(0, cx0):max(0, cx0) + largura]
               for q in quadros]

    # ping-pong: nasce, segura, desfaz ao dobro da velocidade, respira
    passo = 1000 // FPS
    volta = quadros[-2::-1][::2]
    seq = quadros + volta
    tempos = [passo] * len(quadros) + [passo] * len(volta)
    tempos[len(quadros) - 1] = SEGURA_MS
    tempos[-1] = PAUSA_MS

    # ⚠️ Codifica o `img2webp` e nao o Pillow: o Pillow com `method=6` leva
    # minutos nestes fotogramas. `-min_size` procura o melhor rectangulo por
    # fotograma, que e o que faz o ficheiro caber.
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        args = ["img2webp", "-loop", "0", "-min_size"]
        for i, (q, ms) in enumerate(zip(seq, tempos)):
            f = tmp / f"p{i:04d}.png"
            Image.fromarray(q).save(f)
            args += ["-d", str(ms), str(f)]
        subprocess.run(args + ["-o", str(DESTINO)], check=True, capture_output=True)

    print(f"{DESTINO}  {largura}x{altura}  {len(seq)} fotogramas  "
          f"{DESTINO.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main(Path(sys.argv[1]), float(sys.argv[2]) if len(sys.argv) > 2 else 2.0)
