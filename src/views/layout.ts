import { escapeHtml } from "../lib/html";

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6' fill='%237dd3fc'/%3E%3C/svg%3E";

const STYLES = `
:root{color-scheme:dark;--bg:#0d0f17;--surface:#171923;--surface-2:#1d2030;--line:#272b3d;
--fg:#e7e9f3;--muted:#8a91a8;--accent:#7dd3fc;--operational:#4ade80;--degraded:#fbbf24;
--outage:#f87171;--unknown:#94a3b8;--radius:14px;
--mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
--sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
@media (prefers-color-scheme:light){:root{color-scheme:light;--bg:#f5f7fb;--surface:#fff;
--surface-2:#eef1f8;--line:#dfe3ee;--fg:#121522;--muted:#5b6278;--accent:#0369a1;
--operational:#15803d;--degraded:#b45309;--outage:#b91c1c;--unknown:#64748b}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:var(--bg);
color:var(--fg);font:16px/1.6 var(--sans);-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
background:radial-gradient(48rem 24rem at 50% -6rem,color-mix(in srgb,var(--accent) 16%,transparent),transparent 70%),
linear-gradient(color-mix(in srgb,var(--line) 55%,transparent) 1px,transparent 1px) 0 0/32px 32px,
linear-gradient(90deg,color-mix(in srgb,var(--line) 55%,transparent) 1px,transparent 1px) 0 0/32px 32px;
-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0,#000 30%,transparent 100%);
mask-image:radial-gradient(ellipse 80% 60% at 50% 0,#000 30%,transparent 100%)}
a{color:var(--accent);text-underline-offset:.2em}
a:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
.topbar{height:3px;background:linear-gradient(90deg,#093054,var(--accent) 50%,#061e35)}
.shell{width:100%;max-width:760px;margin:0 auto;padding-inline:16px}
.site-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:20px}
.brand{font:700 15px/1 var(--mono);color:var(--fg);text-decoration:none;letter-spacing:-.01em}
.brand span{color:var(--accent)}
.brand::after{content:"_";color:var(--accent);animation:blink 1.1s steps(1) infinite}
.site-header nav a{font:13px var(--mono);color:var(--muted);text-decoration:none}
.site-header nav a:hover{color:var(--fg)}
main{flex:1;padding-block:40px 64px}
.eyebrow{margin:0 0 12px;font:600 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
h1{margin:0;font-size:clamp(32px,6vw,44px);line-height:1.1;letter-spacing:-.02em}
.section-title{margin:48px 0 14px;font:600 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.panel{background:color-mix(in srgb,var(--surface) 88%,transparent);border:1px solid var(--line);
border-radius:var(--radius);backdrop-filter:blur(6px)}
.site-footer{padding-block:24px 40px;border-top:1px solid var(--line);color:var(--muted);font:13px/1.6 var(--mono)}
.site-footer p{margin:0}
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.tone-operational{--tone:var(--operational)}.tone-degraded{--tone:var(--degraded)}
.tone-outage{--tone:var(--outage)}.tone-unknown{--tone:var(--unknown)}
.dot{position:relative;flex:none;width:10px;height:10px;border-radius:50%;background:var(--tone,var(--accent));
box-shadow:0 0 12px color-mix(in srgb,var(--tone,var(--accent)) 70%,transparent)}
.dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:inherit;animation:ping 2.4s ease-out infinite}
@keyframes ping{0%{transform:scale(1);opacity:.6}80%,100%{transform:scale(2.6);opacity:0}}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`;

interface DocumentOptions {
  title: string;
  description: string;
  body: string;
  styles?: string;
  refreshSeconds?: number;
}

export function renderDocument({
  title,
  description,
  body,
  styles = "",
  refreshSeconds,
}: DocumentOptions): string {
  const refresh =
    refreshSeconds === undefined
      ? ""
      : `<meta http-equiv="refresh" content="${refreshSeconds}">`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#0d0f17">
${refresh}
<title>${escapeHtml(title)}</title>
<link rel="icon" href="${FAVICON}">
<style>${STYLES}${styles}</style>
</head>
<body>
<div class="topbar"></div>
<header class="shell site-header">
<a class="brand" href="/" aria-label="bitwobbly home">bit<span>wobbly</span></a>
<nav><a href="https://nicholasgriffin.dev">nicholasgriffin.dev</a></nav>
</header>
<main class="shell">${body}</main>
<footer class="shell site-footer"><p>Built by <a href="https://nicholasgriffin.dev">Nicholas Griffin</a> · health data from Sentry</p></footer>
</body>
</html>`;
}
