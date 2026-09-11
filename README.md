# BAYMOUNT SECURITY OPERATIONS
## خطة التأمين وتوزيع الخدمات — باي ماونت السخنة

An executive-grade interactive security deployment system for Baymount Sokhna (Maven Developments).

---

## 1 · فتح التطبيق — How to open

**Folder version:** open `index.html` in any modern browser (Chrome / Edge recommended). No internet, server, or install is required — everything (fonts, map images, data) is bundled locally.

**Standalone version:** `dist/Baymount-Security-Operations.html` is a single self-contained file (images and fonts embedded). Copy that one file anywhere — USB, WhatsApp, email — and open it directly. Ideal for the management presentation.

Useful while presenting: **عرض الخطة** runs the 10-step guided journey (keyboard: ← next · → previous · Esc exit). The **نهاري / ليلي** toggle animates the 14 → 10 transition live.

---

## 2 · تعديل مواقع العلامات — How to change map coordinates

All positions live in **one file: `js/data.js`** — nothing is hardcoded in the UI.

Every entry has `x` and `y` as **percentages of the masterplan image** (0,0 = top-left, 100,100 = bottom-right):

```js
{ id: "gate3", nameAr: "مدخل 3", x: 83.0, y: 59.6, ... }
```

Change the numbers, save, refresh. Supervisor sector shapes are the `polygon` arrays (lists of `[x, y]` points) and patrol paths are in `patrolRoutes`.

**Faster: hidden edit mode** — press `Ctrl + Shift + E` (or triple-click the logo). Drag any marker to its correct location, then:
- **نسخ الإحداثيات JSON** — copies just the updated positions to the clipboard;
- **تنزيل data.js** — downloads a complete regenerated `data.js`; replace `js/data.js` with it.

For the standalone file, the same config object sits near the top of its single `<script>` block (search for `BAYMOUNT_CONFIG`).

---

## 3 · تعديل القوة والتجهيزات — How to edit manpower / equipment

Also in `js/data.js`:

- `day` / `night` on each post = number of officers per shift (`0` = the service is off that shift and the UI fades it automatically).
- `equipment` = keys from `equipmentTypes` (`radio`, `flashlight`, `scooter`, `motorcycle`).
- `equipmentInventory` = الحصر الإجمالي المعتمد للتجهيزات (يظهر في لوحة الإدارة): 15 لاسلكي · 5 كشاف · 1 سكوتر · 2 موتوسيكل.
- `supervisors[*].coverage`, `equipment`, `mobility` — supervisor sectors.
- `shiftRules.expected` = the **approved force** (14 / 10 / 24, 4 supervisors per shift).

All totals in the interface are **computed** from the posts and validated against `shiftRules.expected`. If they stop matching, the status bar shows a ⚠ warning with the exact difference instead of the ✓. You can verify from a terminal too: `node tools/audit.js`.

---

## 4 · استبدال صور الخريطة — How to replace map images

Drop the new files into `assets/` keeping the same names:

- `assets/masterplan.jpg` — the 2D operational masterplan (any size; if its proportions change, update `meta.planAspect` in `js/data.js` = image height ÷ width).
- `assets/aerial.jpg` — the cinematic aerial used by the intro and presentation.
- `assets/reference-annotated.jpg` — the annotated field reference (kept for the site team, not shown in the UI).

After replacing the masterplan, walk the markers once in edit mode to re-align them.

---

### Notes
- Map positions are **approximate**, derived from the annotated aerial reference, and intentionally easy to adjust after site review.
- Confidential — prepared for management review. البيانات وفق القوة المعتمدة: 24 فرد أمن حضور يومي (14 نهاري / 10 ليلي) + 8 مشرفين (4 لكل خدمة).
