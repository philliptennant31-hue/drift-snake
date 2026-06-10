"""Generate drift's PNG assets (icons + social card) with no dependencies.

Run from the repo root:  python tools/gen_assets.py
"""
import struct
import zlib
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


class Img:
    def __init__(self, w, h, bg=(0, 0, 0, 0)):
        self.w, self.h = w, h
        self.px = bytearray(w * h * 4)
        if bg[3]:
            for i in range(w * h):
                self.px[i * 4:i * 4 + 4] = bytes(bg)

    def set(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 4
            self.px[i:i + 4] = bytes((*c[:3], 255))

    def rect(self, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1)):
            for x in range(int(x0), int(x1)):
                self.set(x, y, c)

    def circle(self, cx, cy, r, c):
        r2 = r * r
        for y in range(int(cy - r), int(cy + r) + 1):
            for x in range(int(cx - r), int(cx + r) + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
                    self.set(x, y, c)

    def round_rect(self, x0, y0, x1, y1, rad, c):
        self.rect(x0 + rad, y0, x1 - rad, y1, c)
        self.rect(x0, y0 + rad, x1, y1 - rad, c)
        for cx, cy in ((x0 + rad, y0 + rad), (x1 - rad, y0 + rad),
                       (x0 + rad, y1 - rad), (x1 - rad, y1 - rad)):
            self.circle(cx, cy, rad, c)

    def path(self, pts, width, c):
        # thick polyline drawn as stamped circles
        r = width / 2
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            steps = max(2, int(max(abs(x1 - x0), abs(y1 - y0))))
            for s in range(steps + 1):
                t = s / steps
                self.circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, c)

    def save(self, name):
        raw = b""
        for y in range(self.h):
            raw += b"\x00" + bytes(self.px[y * self.w * 4:(y + 1) * self.w * 4])

        def chunk(tag, data):
            return (struct.pack(">I", len(data)) + tag + data +
                    struct.pack(">I", zlib.crc32(tag + data)))

        png = (b"\x89PNG\r\n\x1a\n" +
               chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 6, 0, 0, 0)) +
               chunk(b"IDAT", zlib.compress(raw, 9)) +
               chunk(b"IEND", b""))
        path = os.path.join(ROOT, name)
        with open(path, "wb") as f:
            f.write(png)
        print(f"wrote {name} ({len(png)} bytes)")


def bezier(p0, p1, p2, n=40):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1])
            for t in (i / n for i in range(n + 1))]


CREAM = hex_rgb("f4efe7")
LAVENDER = hex_rgb("b3a7e6")
PERIWINKLE = hex_rgb("7b90d6")
INK = hex_rgb("6f665b")
EYE = hex_rgb("4d4a63")
CORAL = hex_rgb("ef9486")
LEAF = hex_rgb("88b884")
SAGE_A = hex_rgb("dcead8")
SAGE_B = hex_rgb("d2e3cd")
WHITE = (255, 255, 255)


def icon(size):
    s = size / 64
    im = Img(size, size)
    im.round_rect(0, 0, size, size, 14 * s, CREAM)
    body = bezier((14 * s, 40 * s), (14 * s, 24 * s), (30 * s, 24 * s)) + [(40 * s, 24 * s)]
    im.path(body, 13 * s, LAVENDER)
    im.circle(42 * s, 24 * s, 9.5 * s, PERIWINKLE)
    im.circle(45 * s, 20.5 * s, 3.2 * s, WHITE)
    im.circle(45 * s, 27.5 * s, 3.2 * s, WHITE)
    im.circle(46 * s, 20.5 * s, 1.7 * s, EYE)
    im.circle(46 * s, 27.5 * s, 1.7 * s, EYE)
    im.circle(20 * s, 46 * s, 5.5 * s, CORAL)
    im.circle(22.5 * s, 39.5 * s, 2.2 * s, LEAF)
    return im


# 5x7 bitmap glyphs for the card title
GLYPHS = {
    "d": ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####"],
    "r": [".....", ".....", "#.###", "##...", "#....", "#....", "#...."],
    "i": ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."],
    "f": ["..##.", ".#...", "####.", ".#...", ".#...", ".#...", ".#..."],
    "t": [".#...", ".#...", "####.", ".#...", ".#...", ".#..#", "..##."],
}


def text(im, msg, cx, cy, scale, c):
    w = len(msg) * 6 * scale
    x0 = cx - w / 2
    for i, ch in enumerate(msg):
        g = GLYPHS.get(ch)
        if not g:
            continue
        for r, row in enumerate(g):
            for col, bit in enumerate(row):
                if bit == "#":
                    x = x0 + (i * 6 + col) * scale
                    y = cy + r * scale
                    im.rect(x, y, x + scale, y + scale, c)


def card():
    W, H = 1200, 630
    im = Img(W, H, (*CREAM, 255))
    cs, bx, by = 50, 100, 80
    for r in range(7):
        for q in range(20):
            im.rect(bx + q * cs, by + r * cs, bx + (q + 1) * cs, by + (r + 1) * cs,
                    SAGE_B if (q + r) % 2 else SAGE_A)
    snake = ([(200, 285)] + bezier((200, 285), (330, 285), (380, 235)) +
             bezier((380, 235), (430, 185), (560, 185)) + [(700, 185)])
    im.path(snake, 38, LAVENDER)
    im.circle(710, 185, 24, PERIWINKLE)
    im.circle(718, 176, 7.5, WHITE)
    im.circle(718, 194, 7.5, WHITE)
    im.circle(720, 176, 4, EYE)
    im.circle(720, 194, 4, EYE)
    im.circle(840, 185, 16, CORAL)
    im.circle(848, 166, 7, LEAF)
    text(im, "drift", W / 2, 480, 14, INK)
    return im


icon(192).save("icon-192.png")
icon(512).save("icon-512.png")
card().save("social-card.png")
