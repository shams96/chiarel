"""axe-core WCAG 2.2 AA audit (labels, alt text, names, keyboard access) over scripts/audit/routes.json, both themes, desktop+mobile.
Setup: npm i --no-save axe-core (run from repo root), then: python scripts/audit/axe.py  (AUDIT_BASE defaults to http://localhost:3055; AXE_JS overrides the axe path).
Automated checks cover only part of WCAG: a manual NVDA/VoiceOver pass is still required before claiming conformance."""
import json, sys
from playwright.sync_api import sync_playwright
import os
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("AUDIT_BASE", "http://localhost:3055")
R = json.load(open(os.path.join(HERE, "routes.json")))
R = [r for r in R if r not in ("/cart","/checkout")] + ["/cart","/checkout"]
AX = open(os.environ.get("AXE_JS", "node_modules/axe-core/axe.min.js"), encoding="utf8").read()
VP = {"desktop":{"width":1440,"height":900},"mobile":{"width":390,"height":844}}
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge")
    for theme in ("light","dark"):
        for vn, vp in VP.items():
            ctx = b.new_context(viewport=vp)
            ctx.add_init_script(f"try{{localStorage.setItem('chiarel-theme','{theme}')}}catch(e){{}}")
            pg = ctx.new_page()
            for r in R:
                try:
                    pg.goto(BASE+r, wait_until="load", timeout=60000)
                except Exception as e:
                    out[f"{theme}/{vn}{r}"] = {"error": str(e)[:80]}; continue
                pg.wait_for_timeout(1200)
                h = pg.evaluate("document.documentElement.scrollHeight"); y = 0
                while y < h:
                    pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(120); y += 700
                pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(1500)
                pg.evaluate(AX)
                res = pg.evaluate("""async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
                  return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,help:v.help,ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' | '+(n.html||'').slice(0,110))}))}""")
                out[f"{theme}/{vn}{r}"] = res
            ctx.close()
    b.close()
json.dump(out, open(os.path.join(os.environ.get("AUDIT_OUT", HERE), "axe_results.json"),"w"))
agg = {}
for k, v in out.items():
    if isinstance(v, dict): print("ERR", k, v); continue
    for x in v:
        a = agg.setdefault(x["id"], {"help":x["help"],"impact":x["impact"],"pages":set(),"nodes":0,"ex":x["ex"]})
        a["pages"].add(k.split("/",1)[1].split("/",1)[1] if False else k); a["nodes"] += x["n"]
print("ROUTE-COMBOS:", len(out))
for i, a in sorted(agg.items(), key=lambda t: -t[1]["nodes"]):
    print(f"{i} [{a['impact']}] nodes={a['nodes']} combos={len(a['pages'])} :: {a['help']}\n   e.g. {a['ex'][0] if a['ex'] else ''}")
print("DONE")
