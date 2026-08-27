"""
Separa a ilustracao do arranque do Sobre em duas camadas, para a fita verde
poder ser desenhada em SVG (e animada) por TRAS dos cartoes.

O JPG tem tudo pintado: fundo liso (#eff3fe, desvio 0.6 por canal), fita verde
saturada com sombra propria, e tres cartoes com sombra. Sai daqui:

  · public/sobre/arranque-cartoes.webp  -> so os cartoes, o resto transparente
  · src/content/fita-arranque.json      -> o caminho da fita, a espessura e a cor

A ORDEM IMPORTA e nao e a obvia: mede-se a FITA primeiro e so depois se
recorta o cartao. E o traco ajustado da fita que diz, com geometria e nao com
cor, o que e fita e o que e cartao nas zonas onde os dois se tocam.

Historico dos erros que esta ordem resolve, para nao se repetirem:

  1. Inundacao a partir das bordas para achar o fundo. Com folga larga entrava
     pelo corpo BRANCO do cartao (esta a 29 do fundo) e comia-lhe o miolo; com
     folga apertada as sombras fechavam o caminho e os trocos da fita entre
     cartoes nunca eram alcancados. Morreu.
  2. Silhueta por morfologia, sem mais nada. O fecho que salva o miolo dos
     cartoes engole tambem a fita colada as arestas: ficavam cunhas verdes
     paradas agarradas aos cartoes (viam-se quando a fita recolhia) e buracos
     por onde a fita nova nao passava.
  3. Distinguir a fita da pastilha verde DENTRO do cartao da poupanca por cor,
     por ligacao ou por distancia a aresta. Todas falharam: o preenchimento de
     buracos volta a por opaco o que esta enclausurado pela sombra.

O que funciona: um CORREDOR rasterizado a partir do traco ajustado. Dentro do
corredor nada fica opaco excepto o corpo do cartao; fora dele, o cartao e a
sombra dele ficam intactos. A pastilha verde do cartao esta longe do corredor
e sobrevive sem regra especial nenhuma.

Correr so quando a ilustracao mudar:  python3 scripts/arranque-fita.py
"""
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage, interpolate
from scipy.spatial import ConvexHull

ORIGEM = "public/sobre/arranque.jpg"
CARTOES_WEBP = "public/sobre/arranque-cartoes.webp"
CAMINHO = "src/content/fita-arranque.json"

im = Image.open(ORIGEM).convert("RGB")
a = np.asarray(im).astype(np.int16)
h, w, _ = a.shape

fundo = np.array([239, 243, 254])
dist = np.abs(a - fundo).sum(2)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]

verde = (g > r + 25) & (g > b + 25) & (g > 120)          # o miolo da fita
verde_largo = (g > r + 8) & (g > b + 8) & (g > 110)      # com as bordas
verde_sombrio = (g > r + 6) & (g > b + 6)                # ate ensombrado


# ---------------------------------------------------------------- os cartoes
# ⚠️ FECHAR ANTES DE PREENCHER, e com nucleo grande. O miolo dos cartoes e
# quase da cor do fundo (as pastilhas claras estao a 3 de distancia): so as
# arestas, o texto e a chapa escura passam o teste de contraste. Sem este
# fecho o cartao da poupanca desfazia-se num contorno fino. 41 px chega para
# unir a moldura de cada cartao e nao chega para colar dois cartoes vizinhos.
forte = (dist >= 25) & ~verde_largo
corpo = ndimage.binary_closing(forte, np.ones((41, 41), bool))
corpo = ndimage.binary_fill_holes(corpo)
corpo = ndimage.binary_opening(corpo, np.ones((9, 9), bool))

etiquetas, quantas = ndimage.label(corpo)
areas = ndimage.sum(corpo, etiquetas, range(1, quantas + 1))
grandes = [i + 1 for i, area in enumerate(areas) if area > 20000]
corpo = ndimage.binary_fill_holes(np.isin(etiquetas, grandes))
print("cartoes encontrados:", len(grandes))


# ------------------------------------------------------- a silhueta a serio
#
# ⚠️ A CHAPA DE CADA CARTAO E O CASCO CONVEXO DO QUE NELE E MESMO CHAPA, e
# esta foi a unica formulacao que aguentou. Todas as outras (cor, ligacao,
# distancia a aresta, morfologia) tropecavam no mesmo sitio: junto ao bordo do
# cartao, a fita, a sombra da fita e a sombra do cartao mistura-se e nenhum
# limiar as separa. Mas os cartoes sao QUADRILATEROS, e o casco convexo do
# miolo deles e exactamente o quadrilatero: nao inclui a sombra, nao inclui a
# fita, e nao deixa buracos por onde a fita se veja.
lum = a.mean(2)
lum_fundo = float(np.median(lum[dist < 6]))

# o que e chapa: claro como o corpo do cartao, ou escuro como a chapa azul e o
# texto. A fita fica de fora por ser cinzento-medio (luminancia ~157).
solido = corpo & ((lum >= lum_fundo - 12) | (lum < 120))
solido = ndimage.binary_opening(solido, np.ones((5, 5), bool))

chapa = np.zeros((h, w), bool)
etiquetas, quantas = ndimage.label(solido)
areas = ndimage.sum(solido, etiquetas, range(1, quantas + 1))
for i, area in enumerate(areas):
    if area < 20000:
        continue
    ys_, xs_ = np.where(etiquetas == i + 1)
    casco = ConvexHull(np.column_stack([xs_, ys_]))
    vertices = [(float(xs_[v]), float(ys_[v])) for v in casco.vertices]
    molde = Image.new("L", (w, h), 0)
    ImageDraw.Draw(molde).polygon(vertices, fill=255)
    chapa |= np.asarray(molde) > 0

print("chapas:", int(chapa.sum()))

# ------------------------------------------------------------------- a fita
# A linha central, coluna a coluna, so onde a fita esta a descoberto.
fita = verde & ~chapa
pontos = []
for x in range(0, w, 20):
    col = np.where(fita[:, x])[0]
    if col.size < 8:
        continue
    # a fita pode aparecer partida por um cartao: fica o troco mais comprido
    trocos = np.split(col, np.where(np.diff(col) > 5)[0] + 1)
    maior = max(trocos, key=len)
    if len(maior) < 8:
        continue
    pontos.append((x, float(maior.mean()), int(len(maior))))

xs = np.array([p[0] for p in pontos], float)
ys = np.array([p[1] for p in pontos])

# ⚠️ A FOLGA DA SPLINE E PEQUENA (5 000), e ja foi 6 000 000. Com folga larga
# a curva ficava lisa mas ANDAVA: 56 px de desvio mediano em 1227 de altura,
# ou seja a fita deixava de passar por onde estava pintada. Com 5 000 o desvio
# cai para ~5 px e a curva continua sem tremer. Este numero nao se muda a
# olho: ha uma medida de sobreposicao com o JPG no docs/CONTEXTO.md.
(tck, _u) = interpolate.splprep([xs, ys], s=5_000, k=3)
t = np.linspace(0, 1, 60)
cx, cy = interpolate.splev(t, tck)


def fora_da_moldura(x0, y0, x1, y1, quanto=90.0):
    """prolonga a recta (x0,y0)->(x1,y1) para la do bordo"""
    dx, dy = x1 - x0, y1 - y0
    n = np.hypot(dx, dy)
    return x1 + dx / n * quanto, y1 + dy / n * quanto


px, py = fora_da_moldura(cx[1], cy[1], cx[0], cy[0])
qx, qy = fora_da_moldura(cx[-2], cy[-2], cx[-1], cy[-1])
cx = np.concatenate([[px], cx, [qx]])
cy = np.concatenate([[py], cy, [qy]])

# espessura perpendicular: a corrida vertical vezes o coseno da inclinacao
decl = np.gradient(cy, cx)
espessura = float(
    np.median([p[2] / np.hypot(1, np.interp(p[0], cx, decl)) for p in pontos])
)


# --------------------------------------------------------------- o corredor
# ⚠️ O CORREDOR VEM DO TRACO E NAO DA COR, e e isso que o torna fiavel: e a
# geometria da fita, portanto nao confunde a fita com a pastilha verde que
# vive dentro do cartao da poupanca, por muito verde que ela seja.
mascara = Image.new("L", (w, h), 0)
lapis = ImageDraw.Draw(mascara)
lapis.line(
    [(float(x), float(y)) for x, y in zip(cx, cy)],
    fill=255,
    width=int(espessura) + 26,
    joint="curve",
)
corredor = np.asarray(mascara) > 0


# ⚠️ SEM SOMBRA POR TRAS DOS CARTOES, POR DECISAO. A sombra existe no JPG,
# mas ali ela esta pousada por cima da fita verde: separada do fundo, ficava
# com falhas e com abas com a forma do corte, e sem a fita desenhada por baixo
# aparecia como um borrao cinzento a flutuar. Tentou-se opaca, tentou-se
# semitransparente com a cor desmisturada do fundo, e nas duas o defeito
# sobrevivia num sitio ou noutro. O cartao sem sombra le-se limpo, e a
# ilustracao nao perde nada que se note.
alfa = np.where(chapa, 255, 0).astype(np.uint8)
alfa = np.asarray(Image.fromarray(alfa, "L").filter(ImageFilter.GaussianBlur(0.6)))
rgb = a

Image.fromarray(
    np.dstack([rgb.astype(np.uint8), alfa.astype(np.uint8)]), "RGBA"
).save(
    CARTOES_WEBP, "WEBP", quality=84, method=6
)


# ------------------------------------------------------------------ o ficheiro
# Catmull-Rom convertido em cubicas de Bezier: e o que faz a curva passar
# pelos pontos sem os cantos de uma polilinha
d = f"M {cx[0]:.1f} {cy[0]:.1f}"
for i in range(len(cx) - 1):
    x0, y0 = cx[max(i - 1, 0)], cy[max(i - 1, 0)]
    x1, y1 = cx[i], cy[i]
    x2, y2 = cx[i + 1], cy[i + 1]
    x3, y3 = cx[min(i + 2, len(cx) - 1)], cy[min(i + 2, len(cx) - 1)]
    d += (
        f" C {x1 + (x2 - x0) / 6:.1f} {y1 + (y2 - y0) / 6:.1f},"
        f" {x2 - (x3 - x1) / 6:.1f} {y2 - (y3 - y1) / 6:.1f},"
        f" {x2:.1f} {y2:.1f}"
    )

# a cor sai do miolo da fita, longe das bordas
miolo = ndimage.binary_erosion(verde, np.ones((9, 9), bool))
cor = np.median(a[miolo], axis=0).astype(int)

json.dump(
    {
        "largura": w,
        "altura": h,
        "d": d,
        "espessura": round(espessura, 1),
        "cor": "#%02x%02x%02x" % tuple(cor),
    },
    open(CAMINHO, "w"),
    indent=2,
)
print("amostras da fita:", len(pontos), "espessura:", round(espessura, 1))
