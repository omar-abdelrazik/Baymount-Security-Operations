#!/usr/bin/env python3
"""Builds the single-file portable version of Baymount Security Operations.
Inlines CSS + JS and embeds all assets (images + fonts) as data URIs.
Output: dist/Baymount-Security-Operations.html
"""
import base64, os, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
data = (ROOT / "js" / "data.js").read_text(encoding="utf-8")
app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")

MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml"}

def datauri(relpath: str) -> str:
    p = ROOT / relpath
    b = p.read_bytes()
    mime = MIME[p.suffix.lower()]
    return f"data:{mime};base64," + base64.b64encode(b).decode()

# ---- inline asset references in CSS (../assets/...) ----
def css_repl(m):
    rel = "assets/" + m.group(1)
    return f'url("{datauri(rel)}")'
css = re.sub(r'url\("\.\./assets/([^"]+)"\)', css_repl, css)

# ---- inline asset references in JS/data (assets/...) ----
for rel in ["assets/masterplan.jpg", "assets/aerial.jpg"]:
    uri = datauri(rel)
    data = data.replace(f'"{rel}"', f'"{uri}"')

# ---- assemble ----
html = html.replace('<link rel="stylesheet" href="css/styles.css">',
                    "<style>\n" + css + "\n</style>")
html = html.replace('<script src="js/data.js"></script>',
                    "<script>\n" + data + "\n</script>")
html = html.replace('<script src="js/app.js"></script>',
                    "<script>\n" + app + "\n</script>")

out = ROOT / "dist" / "Baymount-Security-Operations.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print("built", out, f"{out.stat().st_size/1e6:.2f} MB")
