#!/usr/bin/env python3
"""Removes the drawing's own labels (unit codes, number discs) via targeted
inpainting while leaving trees, shadows and artwork untouched.
Text test: small dark NEUTRAL glyphs sitting on a BRIGHT local background."""
import cv2, numpy as np

import sys
src = sys.argv[1] if len(sys.argv) > 1 else "assets/masterplan-original.jpg"
img = cv2.imread(src)
H, W = img.shape[:2]

bgr = img.astype(np.int16)
b, g, r = bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2]
V = np.max(bgr, axis=2)

neutral = (np.abs(r - g) < 34) & (np.abs(g - b) < 34) & (np.abs(r - b) < 34)
dark = V < 140
cand = (neutral & dark).astype(np.uint8)

num, lab, stats, cent = cv2.connectedComponentsWithStats(cand, 8)
mask = np.zeros((H, W), np.uint8)

protect = [(0.0, 0.84, 0.42, 1.0), (0.86, 0.30, 1.0, 0.47)]
def protected(cx, cy):
    fx, fy = cx / W, cy / H
    return any(x0 <= fx <= x1 and y0 <= fy <= y1 for x0, y0, x1, y1 in protect)

k3 = np.ones((3, 3), np.uint8)
removed = 0
for i in range(1, num):
    x, y, w, h, area = stats[i]
    cx, cy = cent[i]
    if protected(cx, cy): continue
    comp_is_disc = 240 <= area <= 1100 and 0.7 <= w / max(h, 1) <= 1.4 and area / (w * h) > 0.5 and w <= 42 and h <= 42
    comp_is_glyph = 5 <= area <= 560 and h <= 21 and w <= 72
    if not (comp_is_glyph or comp_is_disc): continue
    # local color / background checks
    pad = 5
    x0, y0 = max(x - pad, 0), max(y - pad, 0)
    x1, y1 = min(x + w + pad, W), min(y + h + pad, H)
    sub = lab[y0:y1, x0:x1] == i
    subV = V[y0:y1, x0:x1]
    subr, subg, subb = r[y0:y1, x0:x1], g[y0:y1, x0:x1], b[y0:y1, x0:x1]
    mg = subg[sub].mean(); mr = subr[sub].mean(); mb = subb[sub].mean()
    if mg - max(mr, mb) > 10: continue          # green vegetation
    if mr - mg > 22: continue                    # red/brown trees
    ring = cv2.dilate(sub.astype(np.uint8), k3, iterations=3).astype(bool) & ~sub
    if not ring.any(): continue
    ringV = subV[ring].mean()
    ringG = subg[ring].mean(); ringR = subr[ring].mean()
    if comp_is_glyph:
        if ringV < 148: continue                 # glyphs live on bright ground
    else:
        # a numbered disc has a BRIGHT numeral hole inside — a solid tree doesn't
        closed = cv2.morphologyEx(sub.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)).astype(bool)
        holes = closed & ~sub
        if holes.sum() < 6 or subV[holes].mean() < 150: continue
    mask[lab == i] = 255
    removed += 1

mask = cv2.dilate(mask, k3, iterations=2)
out = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
cv2.imwrite("assets/masterplan.jpg", out, [cv2.IMWRITE_JPEG_QUALITY, 86])
print("components removed:", removed, "| mask px:", int(mask.sum() / 255))

crops = {"c_center": (0.30, 0.30, 0.62, 0.52), "c_top": (0.30, 0.00, 0.72, 0.18),
         "c_amenity": (0.10, 0.14, 0.42, 0.34), "c_road": (0.35, 0.50, 0.75, 0.68)}
for name, (fx0, fy0, fx1, fy1) in crops.items():
    a = out[int(fy0*H):int(fy1*H), int(fx0*W):int(fx1*W)]
    o = img[int(fy0*H):int(fy1*H), int(fx0*W):int(fx1*W)]
    both = np.hstack([o, np.full((a.shape[0], 6, 3), 255, np.uint8), a])
    cv2.imwrite(f"/tmp/claude-0/-home-claude/f4078d26-cf38-5b7e-8765-eef312745069/scratchpad/{name}.jpg", both, [cv2.IMWRITE_JPEG_QUALITY, 82])
print("previews written")
