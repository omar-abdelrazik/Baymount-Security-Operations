#!/usr/bin/env python3
"""Pass 3 — hunt the numbered amenity discs (dark circle + bright numeral)
that survive connected-component filtering by touching paths/leader lines."""
import cv2, numpy as np
img = cv2.imread("assets/masterplan.jpg")
H, W = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.medianBlur(gray, 3)
circles = cv2.HoughCircles(blur, cv2.HOUGH_GRADIENT, dp=1, minDist=16,
                           param1=80, param2=13, minRadius=6, maxRadius=19)
mask = np.zeros((H, W), np.uint8)
protect = [(0.0, 0.84, 0.42, 1.0), (0.86, 0.30, 1.0, 0.47)]
n = 0
if circles is not None:
    for x, y, rr in np.round(circles[0]).astype(int):
        fx, fy = x / W, y / H
        if any(x0 <= fx <= x1 and y0 <= fy <= y1 for x0, y0, x1, y1 in protect): continue
        if x - rr < 0 or y - rr < 0 or x + rr >= W or y + rr >= H: continue
        yy, xx = np.ogrid[-rr:rr + 1, -rr:rr + 1]
        d = np.sqrt(xx * xx + yy * yy)
        patch = gray[y - rr:y + rr + 1, x - rr:x + rr + 1]
        ann = (d <= rr) & (d >= rr * 0.62)
        inner = d <= rr * 0.6
        if patch[ann].mean() > 128: continue          # ring must be dark
        bright = (patch[inner] > 165).sum()
        if not (3 <= bright <= inner.sum() * 0.9): continue  # numeral inside
        # color-neutral ring (skip vivid green/red trees)
        bp = img[y - rr:y + rr + 1, x - rr:x + rr + 1].astype(int)
        rm = bp[:, :, 2][ann].mean(); gm = bp[:, :, 1][ann].mean(); bm = bp[:, :, 0][ann].mean()
        if gm - max(rm, bm) > 26 or rm - gm > 34: continue
        cv2.circle(mask, (x, y), rr + 4, 255, -1)
        n += 1
if n:
    img = cv2.inpaint(img, mask, 4, cv2.INPAINT_TELEA)
    cv2.imwrite("assets/masterplan.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 86])
print("discs removed:", n)
H2, W2 = img.shape[:2]
crop = img[int(0.14*H2):int(0.34*H2), int(0.10*W2):int(0.42*W2)]
cv2.imwrite("/tmp/claude-0/-home-claude/f4078d26-cf38-5b7e-8765-eef312745069/scratchpad/c_discs.jpg", crop, [cv2.IMWRITE_JPEG_QUALITY, 82])
