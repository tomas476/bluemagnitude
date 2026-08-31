#!/usr/bin/env python3
"""
Constroi `public/marca/sol-nasce.webp` + `sol-parado.png`: o sol do logotipo
(circulo completo) a nascer, em WebP animado com alfa, a partir do MP4 do
Higgsfield. Mesmo metodo do `marca-nasce.py`, com uma cor so (o verde):
alfa por canal com chao 0,07, 8 niveis de alfa, ping-pong, img2webp -min_size.
O ultimo fotograma vira tambem o PNG parado do prefers-reduced-motion.
"""
import subprocess, sys, tempfile
from pathlib import Path
import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
VERDE = np.array([108, 202, 125], float)
LADO = 480
FPS = 16
NIVEIS = 8
SEGURA_MS = 1400
PAUSA_MS = 700


def sem_branco(rgb: np.ndarray) -> np.ndarray:
    f = rgb.astype(float)
    # o canal com mais contraste contra o verde e o R (255 vs 108)
    alfa = (255 - f[..., 0]) / (255 - VERDE[0])
    alfa = np.clip((alfa - 0.07) / 0.93, 0, 1)
    fora = np.zeros(f.shape[:2] + (4,), np.uint8)
    fora[..., :3] = VERDE.astype(np.uint8)
    fora[..., 3] = (np.round(alfa * NIVEIS) / NIVEIS * 255).astype(np.uint8)
    return fora


def caixa(a):
    ys, xs = np.nonzero(a > 24)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main(mp4: Path, inicio: float) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(inicio), "-i", str(mp4),
                        "-vf", f"fps={FPS},scale={LADO}:{LADO}:flags=lanczos",
                        str(tmp / "f%03d.png")], check=True)
        quadros = [sem_branco(np.array(Image.open(f).convert("RGB")))
                   for f in sorted(tmp.glob("f*.png"))]

    # recorte quadrado com folga a volta do sol completo
    x0, y0, x1, y1 = caixa(quadros[-1][..., 3])
    m = 10
    x0 = max(0, x0 - m); y0 = max(0, y0 - m); x1 = min(LADO, x1 + m); y1 = min(LADO, y1 + m)
    quadros = [q[y0:y1, x0:x1] for q in quadros]

    Image.fromarray(quadros[-1]).save(RAIZ / "public/marca/sol-parado.png")

    passo = 1000 // FPS
    volta = quadros[-2::-1][::2]
    seq = quadros + volta
    tempos = [passo] * len(quadros) + [passo] * len(volta)
    tempos[len(quadros) - 1] = SEGURA_MS
    tempos[-1] = PAUSA_MS

    destino = RAIZ / "public/marca/sol-nasce.webp"
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        args = ["img2webp", "-loop", "0", "-min_size"]
        for i, (q, ms) in enumerate(zip(seq, tempos)):
            f = tmp / f"p{i:04d}.png"
            Image.fromarray(q).save(f)
            args += ["-d", str(ms), str(f)]
        subprocess.run(args + ["-o", str(destino)], check=True, capture_output=True)
    print(f"{destino}  {x1-x0}x{y1-y0}  {len(seq)} fot  {destino.stat().st_size/1024:.0f} KB")


if __name__ == "__main__":
    main(Path(sys.argv[1]), float(sys.argv[2]) if len(sys.argv) > 2 else 0.0)
