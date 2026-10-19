#!/usr/bin/env python3
"""Turn a string into one SVG path using a site font (woff2), so packshot labels
can be re-lettered without having the font installed.

usage: text-to-svg-path.py <font.woff2> <text> [--wght N] [--track UNITS]
prints JSON: {"d": path, "w": advance width, "cap": cap height, "upm": units per em}
Needs: pip install fonttools brotli
"""
import json
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont


def main():
    args = sys.argv[1:]
    font_path, text = args[0], args[1]
    wght = int(args[args.index("--wght") + 1]) if "--wght" in args else None
    track = int(args[args.index("--track") + 1]) if "--track" in args else 0

    font = TTFont(font_path)
    upm = font["head"].unitsPerEm
    glyphs = font.getGlyphSet(location={"wght": wght}) if wght and "fvar" in font else font.getGlyphSet()
    cmap = font.getBestCmap()

    x = 0
    parts = []
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
        parts.append(pen.getCommands())
        x += glyphs[name].width + track
    x -= track
    print(json.dumps({"d": " ".join(p for p in parts if p), "w": x, "cap": font["OS/2"].sCapHeight, "upm": upm}))


if __name__ == "__main__":
    main()
