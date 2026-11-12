"""Manifest-driven text and contrast audit. usage: python scripts/audit/audit.py <dark|light> <desktop|mobile>
Needs: pip install playwright pillow numpy (browser: Microsoft Edge, channel msedge). Env: AUDIT_BASE (default https://www.chiarel.com), ROUTES (comma list override), OVERONLY=1.
The site's bot check clears only after "/" is loaded once and a ~9s wait; run sequentially, one process.
(Theme names: dark = Evening, light = Day.)
Routes = sitemap + app page files + extras. Reports coverage, text contrast (DOM-composited),
text over photos (pixel-measured), UI states (menu, drawer, cart/checkout with items), discovered links."""
import json, sys, os, io, re
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np

THEME, VPN = sys.argv[1], sys.argv[2]
BASE = os.environ.get("AUDIT_BASE", "https://www.chiarel.com")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("AUDIT_OUT") or os.path.join(HERE, "out")
os.makedirs(OUT + "/shots", exist_ok=True)
ROUTES = json.load(open(os.path.join(HERE, "routes.json")))
if os.environ.get("ROUTES"): ROUTES = os.environ["ROUTES"].split(",")
VP = {"desktop": {"width": 1440, "height": 900}, "mobile": {"width": 390, "height": 844}}[VPN]
TAG = f"{THEME}_{VPN}"
OVERONLY = bool(os.environ.get('OVERONLY'))
if OVERONLY:
    prev = json.load(open(f'{OUT}/audit_{TAG}.json'))
    ROUTES = [r for r, x in prev['routes'].items() if x.get('overCount')]
    TAG = TAG + '_over'

JS = r"""
(sel) => {
  const ROOT=(sel&&document.querySelector(sel))||document.body;
  const lin=c=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4};
  const L=([r,g,b])=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
  const parse=s=>{const m=(s||'').match(/[\d.]+/g);return m?m.map(Number):[0,0,0,1]};
  document.querySelectorAll('[data-aud]').forEach(e=>e.removeAttribute('data-aud'));
  const out=[], over=[], seen=new Set();
  const w=document.createTreeWalker(ROOT,NodeFilter.SHOW_TEXT);
  let n;
  while(n=w.nextNode()){
    const t=n.textContent.trim(); if(!t) continue;
    const el=n.parentElement; if(!el||["SCRIPT","STYLE","NOSCRIPT"].includes(el.tagName)) continue;
    const cs=getComputedStyle(el);
    const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) continue;
    let op=1,hidden=false,p=el;
    while(p&&p!==document.documentElement){const c=getComputedStyle(p);op*=parseFloat(c.opacity);if(c.display==="none"||c.visibility==="hidden")hidden=true;p=p.parentElement}
    if(hidden) continue;
    let fg=parse(cs.color), outline=false;
    if(fg.length>3&&fg[3]===0&&parseFloat(cs.webkitTextStrokeWidth)>0){fg=parse(cs.webkitTextStrokeColor);outline=true}
    let layers=[],q=el,hasImg=false;
    while(q){const c=getComputedStyle(q);const b=parse(c.backgroundColor);if(c.backgroundImage&&c.backgroundImage!=="none")hasImg=true;
      if(b.length>3&&b[3]>0||b.length===3)layers.push(b);if(b.length>3&&b[3]===1||b.length===3)break;q=q.parentElement}
    // media under the text box?
    let media=hasImg;
    if(!media){const pts=[[.1,.5],[.5,.5],[.9,.5],[.5,.15],[.5,.85]];
      for(const [fx,fy] of pts){const x=r.left+r.width*fx,y=r.top+r.height*fy;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;
        for(const e of document.elementsFromPoint(x,y)){if(["IMG","VIDEO","CANVAS","PICTURE","SVG"].includes(e.tagName.toUpperCase())&&!e.contains(el)){media=true;break}
          const bi=getComputedStyle(e).backgroundImage;if(bi&&bi!=="none"){media=true;break}}
        if(media)break}}
    let bg=parse(getComputedStyle(document.body).backgroundColor).slice(0,3);
    for(const l of layers.reverse()){const a=l.length>3?l[3]:1;bg=[0,1,2].map(i=>l[i]*a+bg[i]*(1-a))}
    const fa=(fg.length>3?fg[3]:1)*op;
    const fgc=[0,1,2].map(i=>fg[i]*fa+bg[i]*(1-fa));
    const [h,lo]=[L(fgc),L(bg)].sort((a,b)=>b-a);
    const ratio=(h+0.05)/(lo+0.05);
    const size=parseFloat(cs.fontSize), bold=parseInt(cs.fontWeight)>=700;
    const need=(size>=24||(size>=18.66&&bold))?3:4.5;
    const rec={t:t.slice(0,60),ratio:+ratio.toFixed(2),need,op:+op.toFixed(2),media,outline,cls:(el.className||"").toString().slice(0,70),tag:el.tagName,fg:fgc.map(Math.round).join(","),bg:bg.map(Math.round).join(","),rect:[r.left+scrollX,r.top+scrollY,r.width,r.height]};
    if(media){const k=t.slice(0,40);if(!seen.has("o"+k)){seen.add("o"+k);rec.aud=over.length;el.setAttribute('data-aud',String(over.length));over.push(rec)}continue}
    if(ratio<need){const key=t.slice(0,40)+"|"+ratio.toFixed(1);if(seen.has(key))continue;seen.add(key);out.push(rec)}
  }
  return {fail:out,over:over};
}
"""
WORDS = "(()=>{const o=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const t=n.textContent.trim();const e=n.parentElement;if(t&&e&&!['SCRIPT','STYLE','NOSCRIPT'].includes(e.tagName)){const r=e.getBoundingClientRect();if(r.width>1&&getComputedStyle(e).display!=='none')o.add(t.slice(0,80))}}return [...o]})()"
LINKS = "[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h&&h.startsWith('/')&&!h.startsWith('//')).map(h=>h.split('#')[0].split('?')[0]).filter(Boolean))]"
HIDE = "*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important}"

def lum(c):
    c = np.asarray(c, dtype=float) / 255
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]

def over_photo(pg, items, route):
    """pixel-measure text over media: scroll the element into view, hide all text, shoot its viewport box."""
    res = []
    for it in items[:40]:
        try:
            sel = f"[data-aud='{it['aud']}']"
            pg.evaluate("(s)=>document.querySelector(s).scrollIntoView({block:'center'})", sel); pg.wait_for_timeout(600)
            x, y, w, h = pg.evaluate("(s)=>{const b=document.querySelector(s).getBoundingClientRect();return [b.left,b.top,b.width,b.height]}", sel)
            x0, y0 = max(0, x), max(0, y)
            x1, y1 = min(VP['width'], x + w), min(VP['height'], y + h)
            if x1 - x0 < 2 or y1 - y0 < 2:
                res.append({"t": it["t"], "err": "offscreen"}); continue
            pg.add_style_tag(content=HIDE); pg.wait_for_timeout(150)
            png = pg.screenshot(clip={"x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0})
            pg.evaluate("[...document.querySelectorAll('style')].filter(s=>s.textContent.startsWith('*{color:transparent')).forEach(s=>s.remove())")
            a = np.asarray(Image.open(io.BytesIO(png)).convert("RGB"))
            fg = [int(v) for v in it["fg"].split(",")]
            lf = float(lum(np.array(fg)))
            lb = lum(a).ravel()
            worst = None
            for lbv in (np.percentile(lb, 5), np.percentile(lb, 95)):
                hi, lo = max(lf, lbv), min(lf, lbv)
                r = (hi + .05) / (lo + .05)
                worst = r if worst is None else min(worst, r)
            res.append({**{k: it[k] for k in ("t", "need", "cls", "fg")}, "worst": round(float(worst), 2), "fail": bool(worst < it["need"] and not it["outline"])})
        except Exception as e:
            res.append({"t": it["t"], "err": str(e)[:80]})
    return res

def go(pg, path, tries=4):
    for i in range(tries):
        try:
            resp = pg.goto(BASE + path, wait_until="domcontentloaded", timeout=90000)
        except Exception as e:
            print("  goto err", str(e)[:70], flush=True); pg.wait_for_timeout(4000); continue
        pg.wait_for_timeout(600)
        body = pg.evaluate("document.body ? document.body.innerText.slice(0,200) : ''")
        if resp and resp.status == 403 and "heck" in body:
            print("  bot check, waiting", flush=True); pg.wait_for_timeout(9000); continue
        return resp
    return None

def measure(pg, with_over=True, sel=None):
    m = pg.evaluate(JS, sel)
    ov = over_photo(pg, m["over"], None) if with_over else []
    return m["fail"], ov, len(m["over"])

result = {"theme": THEME, "viewport": VPN, "routes": {}, "states": {}, "discovered": []}
disc = set()
with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge")
    ctx = b.new_context(viewport=VP, is_mobile=(VPN == "mobile"), has_touch=(VPN == "mobile"))
    ctx.add_init_script(f"try{{localStorage.setItem('chiarel-theme','{THEME}')}}catch(e){{}}")
    pg = ctx.new_page()
    pg.goto(BASE + "/", wait_until="load"); pg.wait_for_timeout(9000)
    for r in ROUTES:
        rec = {}
        resp = go(pg, r)
        if resp is None:
            rec["status"] = "LOAD_FAIL"; result["routes"][r] = rec; print(r, "LOAD_FAIL", flush=True); continue
        rec["status"] = resp.status
        if not OVERONLY:
            pg.wait_for_timeout(300); rec["early300"] = pg.evaluate(JS)["fail"]
            pg.wait_for_timeout(900); rec["early1200"] = pg.evaluate(JS)["fail"]
        else:
            rec["early300"] = []
        pg.wait_for_timeout(1500)
        h = pg.evaluate("document.documentElement.scrollHeight"); y = 0
        while y < h:
            pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(250); y += 500
            h = pg.evaluate("document.documentElement.scrollHeight")
        pg.wait_for_timeout(2500)
        pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(400)
        rec["theme"] = pg.evaluate("document.documentElement.dataset.theme")
        rec["words"] = pg.evaluate(WORDS)
        disc.update(pg.evaluate(LINKS))
        fail, ov, nover = measure(pg)
        rec["settled"] = fail; rec["overPhoto"] = ov; rec["overCount"] = nover
        try:
            if not OVERONLY: pg.screenshot(path=f"{OUT}/shots/{TAG}_{r.strip('/').replace('/','_') or 'home'}.jpg", full_page=True, type="jpeg", quality=45)
        except Exception as e:
            rec["shotErr"] = str(e)[:60]
        result["routes"][r] = rec
        pf = sum(1 for o in ov if o.get("fail"))
        print(f"{r} [{rec['status']}] {rec['theme']} early300={len(rec['early300'])} settled={len(fail)} overPhoto={nover} overFail={pf}", flush=True)
        for x in fail[:6]: print("   S", x["t"][:40], x["ratio"], "need", x["need"], x["cls"][:40], flush=True)
        for o in ov:
            if o.get("fail"): print("   P", o["t"][:40], o["worst"], "need", o["need"], flush=True)

    if OVERONLY:
        b.close(); json.dump(result, open(f"{OUT}/audit_{TAG}.json", "w")); print("DONE", TAG, flush=True); sys.exit(0)
    # ---- states ----
    def state(name, fn, sel=None):
        try:
            fn(); fail, ov, nover = measure(pg, True, sel)
            result["states"][name] = {"settled": fail, "overPhoto": ov, "overCount": nover}
            print(f"STATE {name}: settled={len(fail)} overPhoto={nover} overFail={sum(1 for o in ov if o.get('fail'))}", flush=True)
            for x in fail[:6]: print("   S", x["t"][:40], x["ratio"], "need", x["need"], x["cls"][:40], flush=True)
            try: pg.screenshot(path=f"{OUT}/shots/{TAG}_STATE_{name}.jpg", type="jpeg", quality=55)
            except Exception: pass
        except Exception as e:
            result["states"][name] = {"error": str(e)[:150]}; print("STATE", name, "ERROR", str(e)[:150], flush=True)

    def menu():
        go(pg, "/"); pg.wait_for_timeout(2500)
        btn = pg.locator("button[aria-label*='enu' i], button[aria-controls*='menu' i], button[aria-expanded]").first
        btn.click(timeout=5000); pg.wait_for_timeout(1200)
    if VPN == "mobile":
        state("menu_open", menu, "#mobile-menu")
    else:
        result["states"]["menu_open"] = {"na": "desktop shows the inline nav (hamburger hidden at this width)"}

    def add_item():
        go(pg, "/shop/clarity-essence"); pg.wait_for_timeout(2500)
        for sel in ["button:has-text('Add to bag')", "button:has-text('Add to cart')", "button:has-text('Add')", "button:has-text('Begin')", "button:has-text('Subscribe')"]:
            loc = pg.locator(sel)
            if loc.count():
                loc.first.scroll_into_view_if_needed(); loc.first.click(timeout=5000); pg.wait_for_timeout(1800)
                result["addButton"] = sel; return
        raise Exception("no add button found")
    try:
        add_item()
    except Exception as e:
        result["addButton"] = "FAILED: " + str(e)[:100]; print("add item failed", e, flush=True)
    def drawer():
        # drawer may auto-open after add; otherwise click the bag button
        if pg.locator("[role=dialog]").count() == 0:
            pg.locator("button[aria-label*='bag' i], button[aria-label*='cart' i], a[aria-label*='bag' i], a[aria-label*='cart' i]").first.click(timeout=5000)
        pg.wait_for_timeout(1500)
    state("cart_drawer", drawer, "[role=dialog][aria-label='Your Ritual Bag']")
    for st, path in (("cart_with_items", "/cart"), ("checkout_with_items", "/checkout")):
        state(st, lambda path=path: (go(pg, path), pg.wait_for_timeout(3500), pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"), pg.wait_for_timeout(1500), pg.evaluate("window.scrollTo(0,0)")))
    b.close()

checked = set(ROUTES)
result["discovered"] = sorted(d for d in disc if d not in checked and not d.startswith(("/admin", "/api", "/_next", "/assets", "/images")) and "." not in d.split("/")[-1])
json.dump(result, open(f"{OUT}/audit_{TAG}.json", "w"))
print("DONE", TAG, "routes", len(result["routes"]), "undiscovered-in-manifest:", result["discovered"], flush=True)
