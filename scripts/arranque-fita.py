"""
Separa a ilustracao do arranque do Sobre em duas camadas, para a fita verde
poder ser desenhada em SVG (e animada) por TRAS dos cartoes.

O JPG tem tudo pintado: fundo liso (#eff3fe, desvio 0.6 por canal), fita verde
saturada, e tres cartoes com sombra. A separacao faz-se assim:

  1. o que NAO e fundo e NAO e verde e candidato a cartao;
  2. uma abertura morfologica come as lascas finas (as bordas da fita, que sao
     mistura de verde com fundo e nao passam nem num teste nem no outro);
  3. ficam as tres manchas grandes -> sao os cartoes, e os buracos delas
     fecham-se, porque dentro de um cartao manda o cartao;
  4. a mascara verde fora dos cartoes da a linha central da fita -> caminho SVG.

⚠️ NAO SE USA INUNDACAO A PARTIR DAS BORDAS, e ja se tentou duas vezes: com
folga larga a inundacao entra pelo corpo BRANCO do cartao (esta a 29 do fundo)
e come-lhe o miolo; com folga apertada as sombras fecham o caminho e os trocos
da fita entre cartoes nunca sao alcancados. A morfologia nao depende de haver
caminho nenhum.

Correr so quando a ilustracao mudar:  python3 scripts/arranque-fita.py
"""
import json

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ORIGEM = "public/sobre/arranque.jpg"
CARTOES_WEBP = "public/sobre/arranque-cartoes.webp"
CAMINHO = "src/content/fita-arranque.json"

im = Image.open(ORIGEM).convert("RGB")
a = np.asarray(im).astype(np.int16)
h, w, _ = a.shape

fundo = np.array([239, 243, 254])
dist = np.abs(a - fundo).sum(2)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
verde = (g > r + 25) & (g > b + 25) & (g > 120)

# 1 e 2: candidato a cartao, sem as lascas da fronteira da fita
bruto = (dist >= 10) & ~verde
limpo = ndimage.binary_opening(bruto, np.ones((7, 7), bool))

# 3: as manchas grandes sao os cartoes; o resto e ruido de compressao
etiquetas, quantas = ndimage.label(limpo)
areas = ndimage.sum(limpo, etiquetas, range(1, quantas + 1))
grandes = [i + 1 for i, area in enumerate(areas) if area > 20000]
cartao = np.isin(etiquetas, grandes)
cartao = ndimage.binary_closing(cartao, np.ones((9, 9), bool))
cartao = ndimage.binary_fill_holes(cartao)
# a abertura encolheu a silhueta em ~3px; devolve-se o que ela comeu
cartao = ndimage.binary_dilation(cartao, np.ones((5, 5), bool))

print("cartoes encontrados:", len(grandes), "area", int(cartao.sum()))

# ⚠️ AS LASCAS DA FITA COLADAS A BORDA DO CARTAO TEM DE SAIR. A silhueta e
# dilatada para nao comer a aresta do cartao, e nessa orla entra verde da fita
# original: sem isto ficavam fiapos verdes agarrados aos cartoes, parados,
# enquanto a fita nova se desenhava atras deles. So na ORLA, porque a pastilha
# verde DENTRO do cartao da poupanca e cartao e fica.
orla = cartao & ~ndimage.binary_erosion(cartao, np.ones((13, 13), bool))

# ⚠️ ALFA BINARIO, com um desfoque de 0.6px so para tirar o degrau de serra.
# Um alfa proporcional a distancia ao fundo tornava translucido o branco e as
# pastilhas claras do cartao, e a fita via-se atraves deles.
# na orla o teste de verde e mais frouxo do que o da fita: ali ha verde
# esbatido pela sombra do cartao, que nao passa no teste apertado e ficava
# como um dente na aresta
verde_fraco = (g > r + 8) & (g > b + 8)
alfa = np.where(cartao & ~(orla & verde_fraco), 255, 0).astype(np.uint8)
alfa = np.asarray(Image.fromarray(alfa, "L").filter(ImageFilter.GaussianBlur(0.6)))

saida = np.dstack([a.astype(np.uint8), alfa])
Image.fromarray(saida, "RGBA").save(CARTOES_WEBP, "WEBP", quality=84, method=6)

# 4: a linha central da fita, coluna a coluna, so onde ela esta a descoberto
fita = verde & ~cartao
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

# onde a fita passa por tras de um cartao nao ha amostras: interpola-se em x
# regular, para a curva nao dar um salto de linha recta no vazio
# ⚠️ A CURVA E UMA SPLINE DE ALISAMENTO, nao a media movel da amostra.
# A fita e quase vertical em dois trocos, e ai a linha central medida coluna a
# coluna salta: o resultado era uma borda a tremer, que o olho apanha logo
# mesmo quando a curva esta no sitio certo. A spline com folga larga passa
# ENTRE as amostras e devolve o gesto que a ilustracao tem.
# E o caminho sai da moldura nas duas pontas, para os topos redondos do traco
# ficarem fora do que se ve.
from scipy import interpolate

(tck, _u) = interpolate.splprep([xs, ys], s=6_000_000, k=3)
t = np.linspace(0, 1, 26)
cx, cy = interpolate.splev(t, tck)

# prolongamento recto para fora da moldura, na direccao de cada ponta
def fora_da_moldura(x0, y0, x1, y1, quanto=90.0):
    dx, dy = x1 - x0, y1 - y0
    n = np.hypot(dx, dy)
    return x1 + dx / n * quanto, y1 + dy / n * quanto

px, py = fora_da_moldura(cx[1], cy[1], cx[0], cy[0])
qx, qy = fora_da_moldura(cx[-2], cy[-2], cx[-1], cy[-1])
cx = np.concatenate([[px], cx, [qx]])
cy = np.concatenate([[py], cy, [qy]])

# espessura perpendicular: a corrida vertical vezes o coseno da inclinacao
decl = np.gradient(cy, cx)
esp = np.median([
    p[2] / np.hypot(1, np.interp(p[0], cx, decl)) for p in pontos
])

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

# a cor sai do miolo da fita, longe das bordas, para nao apanhar a mistura com
# o fundo. O token --color-accent da casa e parecido mas nao e o mesmo, e aqui
# o que conta e coincidir com a ilustracao
miolo = ndimage.binary_erosion(verde, np.ones((9, 9), bool))
cor = np.median(a[miolo], axis=0).astype(int)

json.dump(
    {
        "largura": w,
        "altura": h,
        "d": d,
        "espessura": round(float(esp), 1),
        "cor": "#%02x%02x%02x" % tuple(cor),
    },
    open(CAMINHO, "w"),
    indent=2,
)
print("amostras da fita:", len(pontos), "espessura:", round(float(esp), 1))
