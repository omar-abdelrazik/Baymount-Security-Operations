#!/usr/bin/env python3
"""Reframes the masterplan onto its operational content and remaps EVERY
coordinate in js/data.js to the new frame, so markers, supervision sectors,
patrol routes and presentation camera stops all stay exactly on target.

Usage:  python3 tools/reframe_plan.py <x0%> <y0%> <x1%> <y1%>
Example: python3 tools/reframe_plan.py 7 1 100 90
"""
import re, sys, cv2

X0, Y0, X1, Y1 = (float(v) for v in (sys.argv[1:5] or [7, 1, 100, 90]))

img = cv2.imread("assets/masterplan.jpg")
H, W = img.shape[:2]
px0, py0 = round(X0 / 100 * W), round(Y0 / 100 * H)
px1, py1 = round(X1 / 100 * W), round(Y1 / 100 * H)
crop = img[py0:py1, px0:px1]
ch, cw = crop.shape[:2]
cv2.imwrite("assets/masterplan.jpg", crop, [cv2.IMWRITE_JPEG_QUALITY, 87])
print(f"cropped {W}x{H} -> {cw}x{ch}   aspect h/w = {ch/cw:.4f}")

sx, sy = (X1 - X0) / 100, (Y1 - Y0) / 100
fx = lambda v: max(0.0, min(100.0, (v - X0) / sx))
fy = lambda v: max(0.0, min(100.0, (v - Y0) / sy))
r1 = lambda v: round(v, 1)

src = open("js/data.js", encoding="utf-8").read()

# 1) every  x: N, y: N  pair (posts, assets, supervisor anchors, camera stops)
def pair(m):
    return f"x: {r1(fx(float(m.group(1))))}, y: {r1(fy(float(m.group(2))))}"
src, n_pairs = re.subn(r"x:\s*([\d.]+),\s*y:\s*([\d.]+)", pair, src)

# 2) polygon / points arrays  [[a,b],[c,d], ...]
def arr(m):
    pts = re.findall(r"\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]", m.group(2))
    body = ",".join(f"[{r1(fx(float(a)))},{r1(fy(float(b)))}]" for a, b in pts)
    return f"{m.group(1)}: [{body}]"
src, n_arrays = re.subn(r"(polygon|points):\s*(\[(?:\s*\[[\d.,\s]*\]\s*,?)+\])", arr, src)

# 3) the stored aspect ratio
src = re.sub(r"planAspect:\s*[\d./ ]+", f"planAspect: {ch} / {cw}", src)

open("js/data.js", "w", encoding="utf-8").write(src)
print(f"remapped {n_pairs} x/y pairs and {n_arrays} polygon/route arrays")
