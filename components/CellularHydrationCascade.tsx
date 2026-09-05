// Skin cross-section animation for Cellular Mist™: a humectant surface film
// forms instantly, then a hydration front reveals plumped cells progressively
// deeper (stratum corneum -> epidermis -> dermis), matching Low Molecular
// Weight Hyaluronic Acid's actual mechanism (fast surface absorption, not a
// generic "glow" claim). Pure CSS/SVG, no video/JS dependency. Recolored to
// CHIAREL's own tokens (champagne/ochre/peach/ink) rather than the source
// mockup's unrelated navy/gold palette, and set in the site's actual
// typefaces (Libre Bodoni via font-serif, Jost as the base sans).
export default function CellularHydrationCascade() {
  return (
    <div className="cascade-viz mx-auto max-w-2xl">
      <style>{`
        .cascade-viz svg { width: 100%; height: auto; display: block; overflow: visible; }
        .cascade-viz .layer-tag {
          font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase;
          fill: rgba(248,246,241,0.45);
        }
        .cascade-viz .depth-tag { font-size: 9px; letter-spacing: 0.08em; fill: rgba(248,246,241,0.3); }
        .cascade-viz .zcell { fill: rgba(248,246,241,0.14); stroke: rgba(248,246,241,0.22); stroke-width: 1; }
        .cascade-viz .pcell { fill: url(#chiarelPlumpGrad); }
        .cascade-viz .droplet { fill: url(#chiarelSerumGrad); filter: url(#chiarelSoftGlow); }
        .cascade-viz .channel { fill: none; stroke: rgba(214,197,160,0.18); stroke-width: 2; stroke-dasharray: 2 6; }
        .cascade-viz .pore { fill: rgba(0,0,0,0.08); }

        .cascade-viz #chiarelHydrationMask rect {
          animation: chiarelRevealDown 12s cubic-bezier(.4,0,.2,1) infinite;
        }
        /* Reveal capped at the epidermis (260px), not the full 340px to the
           dermis: matches the actual claim (fast surface absorption), not an
           unsubstantiated dermal-level effect. */
        @keyframes chiarelRevealDown {
          0% { height: 0; } 8% { height: 0; }
          50% { height: 150px; } 90% { height: 260px; } 100% { height: 0; }
        }
        .cascade-viz .hydrTint { fill: url(#chiarelTintGrad); mask: url(#chiarelHydrationMask); opacity: 0.5; }
        .cascade-viz .plumpGroup { mask: url(#chiarelHydrationMask); }

        .cascade-viz .surface-film {
          fill: url(#chiarelFilmGrad); opacity: 0;
          animation: chiarelFilmAppear 12s ease-in-out infinite;
        }
        @keyframes chiarelFilmAppear { 0%{opacity:0;} 6%{opacity:0.85;} 92%{opacity:0.85;} 100%{opacity:0;} }

        .cascade-viz .surface-sheen {
          fill: url(#chiarelSheenGrad); opacity: 0; mix-blend-mode: screen;
          animation: chiarelSheenSweep 12s ease-in-out infinite;
        }
        @keyframes chiarelSheenSweep {
          0%,4% { opacity:0; transform:translateX(-160px); }
          16% { opacity:0.6; } 30% { opacity:0; transform:translateX(160px); } 100% { opacity:0; }
        }

        .cascade-viz .d1,.cascade-viz .d2,.cascade-viz .d3,.cascade-viz .d4,.cascade-viz .d5 {
          animation: chiarelFall 12s ease-in infinite;
        }
        .cascade-viz .d2 { animation-delay: 0.25s; }
        .cascade-viz .d3 { animation-delay: 0.5s; }
        .cascade-viz .d4 { animation-delay: 0.15s; }
        .cascade-viz .d5 { animation-delay: 0.4s; }
        @keyframes chiarelFall {
          0% { transform:translateY(-30px) scale(1); opacity:0; }
          5% { opacity:1; }
          9% { transform:translateY(48px) scale(0.85); opacity:1; }
          10% { opacity:0; } 100% { opacity:0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cascade-viz #chiarelHydrationMask rect { animation: none; height: 260px; }
          .cascade-viz .surface-film { animation: none; opacity: 0.45; }
          .cascade-viz .surface-sheen { animation: none; opacity: 0; }
          .cascade-viz .d1,.cascade-viz .d2,.cascade-viz .d3,.cascade-viz .d4,.cascade-viz .d5 { animation: none; opacity: 0; }
        }

        .cascade-viz .acts {
          display: flex; width: 100%; margin-top: 32px;
          border-top: 1px solid rgba(248,246,241,0.12);
        }
        .cascade-viz .act { flex: 1; padding: 18px 16px 0; text-align: left; }
        .cascade-viz .act + .act { border-left: 1px solid rgba(248,246,241,0.12); }
        .cascade-viz .act .num {
          font-family: var(--font-serif), serif; font-style: italic;
          font-size: 13px; color: #D6C5A0; display: block; margin-bottom: 6px;
        }
        .cascade-viz .act h3 { font-size: 13.5px; margin: 0 0 6px; font-weight: 500; color: #F8F6F1; }
        .cascade-viz .act p { font-size: 12px; line-height: 1.55; color: rgba(248,246,241,0.55); margin: 0; }

        @media (max-width: 640px) {
          .cascade-viz .acts { flex-direction: column; }
          .cascade-viz .act + .act { border-left: none; border-top: 1px solid rgba(248,246,241,0.12); margin-top: 14px; padding-top: 14px; }
        }
      `}</style>

      <div className="stage-wrap">
        <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chiarelSkinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8F6F1" />
              <stop offset="100%" stopColor="#D6C5A0" />
            </linearGradient>
            <linearGradient id="chiarelDermGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B39567" />
              <stop offset="100%" stopColor="#7A5A38" />
            </linearGradient>
            <radialGradient id="chiarelSerumGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFBF2" />
              <stop offset="55%" stopColor="#D6C5A0" />
              <stop offset="100%" stopColor="#9B4722" />
            </radialGradient>
            <radialGradient id="chiarelPlumpGrad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#FFF7F3" />
              <stop offset="55%" stopColor="#FAD6C9" />
              <stop offset="100%" stopColor="#E3A98F" />
            </radialGradient>
            <linearGradient id="chiarelFilmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFDF9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chiarelSheenGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFDF9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chiarelTintGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAD6C9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FAD6C9" stopOpacity="0.12" />
            </linearGradient>
            <filter id="chiarelSoftGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <mask id="chiarelHydrationMask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="400">
              <rect x="0" y="35" width="600" height="0" fill="#fff" />
            </mask>
          </defs>

          <path d="M0,60 C100,50 200,68 300,58 C400,48 500,66 600,56 L600,110 C500,120 400,102 300,112 C200,122 100,104 0,114 Z" fill="url(#chiarelSkinGrad)" opacity="0.92" />
          <rect x="0" y="112" width="600" height="150" fill="#E3D3AE" opacity="0.32" />
          <path d="M0,262 C120,250 250,272 380,258 C460,250 540,268 600,258 L600,400 L0,400 Z" fill="url(#chiarelDermGrad)" opacity="0.92" />

          <g className="pore">
            <circle cx="55" cy="72" r="1.4" /><circle cx="140" cy="65" r="1.2" /><circle cx="260" cy="78" r="1.4" />
            <circle cx="380" cy="66" r="1.2" /><circle cx="500" cy="74" r="1.4" /><circle cx="560" cy="62" r="1.1" />
          </g>

          <text x="16" y="40" className="layer-tag">Stratum corneum</text>
          <text x="16" y="145" className="layer-tag">Epidermis — cell renewal zone</text>
          <text x="16" y="290" className="layer-tag">Dermis</text>
          <text x="560" y="40" textAnchor="end" className="depth-tag">0.02mm</text>
          <text x="560" y="145" textAnchor="end" className="depth-tag">0.1mm</text>
          <text x="560" y="290" textAnchor="end" className="depth-tag">1–2mm</text>

          <path className="channel" d="M90,50 C85,120 95,180 90,340" />
          <path className="channel" d="M220,45 C215,110 225,190 220,340" />
          <path className="channel" d="M350,50 C345,120 355,180 350,340" />
          <path className="channel" d="M480,45 C475,110 485,190 480,340" />

          <rect className="hydrTint" x="0" y="0" width="600" height="400" />

          <g className="zcell"><polygon points="70,140 88,135 92,152 76,160 62,152" /></g>
          <g className="zcell"><polygon points="200,150 218,143 226,163 206,173 190,161" /></g>
          <g className="zcell"><polygon points="330,142 350,137 356,157 336,166 320,154" /></g>
          <g className="zcell"><polygon points="460,150 480,144 488,164 468,174 452,162" /></g>
          <g className="zcell"><polygon points="140,190 158,184 166,202 148,210 132,200" /></g>
          <g className="zcell"><polygon points="390,196 410,190 418,208 398,218 382,206" /></g>
          <g className="zcell"><polygon points="250,220 268,214 276,232 258,240 242,230" /></g>
          <g className="zcell"><polygon points="100,240 118,234 126,252 108,260 92,250" /></g>
          <g className="zcell"><polygon points="80,300 100,294 108,314 88,324 70,312" /></g>
          <g className="zcell"><polygon points="230,310 250,304 258,324 238,334 220,322" /></g>
          <g className="zcell"><polygon points="380,304 400,298 408,318 388,328 370,316" /></g>
          <g className="zcell"><polygon points="500,310 520,304 528,324 508,334 490,322" /></g>

          <g className="plumpGroup">
            <circle className="pcell" cx="80" cy="148" r="16" />
            <circle className="pcell" cx="212" cy="158" r="18" />
            <circle className="pcell" cx="340" cy="150" r="16" />
            <circle className="pcell" cx="470" cy="158" r="17" />
            <circle className="pcell" cx="150" cy="197" r="17" />
            <circle className="pcell" cx="400" cy="203" r="17" />
            <circle className="pcell" cx="260" cy="226" r="16" />
            <circle className="pcell" cx="110" cy="247" r="16" />
            <circle className="pcell" cx="90" cy="307" r="18" />
            <circle className="pcell" cx="240" cy="317" r="18" />
            <circle className="pcell" cx="390" cy="311" r="18" />
            <circle className="pcell" cx="510" cy="317" r="18" />
          </g>

          <path className="surface-film" d="M0,58 C100,46 200,66 300,54 C400,42 500,62 600,52 L600,74 C500,86 400,66 300,78 C200,90 100,70 0,82 Z" />
          <ellipse className="surface-sheen" cx="300" cy="58" rx="120" ry="12" />

          <circle className="droplet d1" cx="90" cy="18" r="6" />
          <circle className="droplet d2" cx="220" cy="18" r="6" />
          <circle className="droplet d3" cx="350" cy="18" r="6" />
          <circle className="droplet d4" cx="480" cy="18" r="6" />
          <circle className="droplet d5" cx="155" cy="18" r="5" />
        </svg>
      </div>

      <div className="acts">
        <div className="act">
          <span className="num">I</span>
          <h3>Surface film</h3>
          <p>Low molecular weight Hyaluronic Acid bonds water instantly at the stratum corneum.</p>
        </div>
        <div className="act">
          <span className="num">II</span>
          <h3>Epidermal renewal</h3>
          <p>Hydration diffuses inward, reaching the epidermis where skin recognises and uses it.</p>
        </div>
        <div className="act">
          <span className="num">III</span>
          <h3>Ready to receive</h3>
          <p>The mist&rsquo;s job ends here — priming skin to absorb the treatment steps that follow.</p>
        </div>
      </div>
    </div>
  );
}
