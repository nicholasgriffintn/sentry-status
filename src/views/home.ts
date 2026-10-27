import type { StatusPage } from "../config";
import { formatCount } from "../lib/format";
import { escapeHtml } from "../lib/html";
import { renderDocument } from "./layout";

const STYLES = `
.hero{padding-block:24px 8px}
.wordmark{margin:0;font:800 clamp(48px,13vw,96px)/1 var(--mono);letter-spacing:-.04em}
.wobble{color:var(--accent);text-shadow:0 0 24px color-mix(in srgb,var(--accent) 45%,transparent)}
.wobble span{display:inline-block;transform-origin:50% 80%;animation:wobble 2.6s ease-in-out infinite;
animation-delay:calc(var(--i) * 110ms)}
@keyframes wobble{0%,60%,100%{transform:none}15%{transform:translateY(-.08em) rotate(-7deg)}
30%{transform:translateY(.03em) rotate(5deg)}45%{transform:rotate(-2deg)}}
.lede{max-width:34rem;margin:20px 0 0;color:var(--muted);font-size:18px}
.lede a{color:var(--fg)}
.cards{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.card{display:flex;flex-direction:column;gap:6px;height:100%;padding:20px;color:var(--fg);text-decoration:none;
transition:border-color .2s,transform .2s,background .2s}
.card:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--line));background:var(--surface-2);transform:translateY(-2px)}
.card-title{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:650;font-size:18px}
.card-title::after{content:"→";color:var(--muted);font-family:var(--mono);transition:transform .2s,color .2s}
.card:hover .card-title::after{color:var(--accent);transform:translateX(3px)}
.card-meta{color:var(--muted);font:13px/1.5 var(--mono)}
.hint{margin:20px 0 0;color:var(--muted);font:13px/1.6 var(--mono)}
.hint code{white-space:nowrap;color:var(--fg);padding:2px 6px;border-radius:6px;background:var(--surface-2);border:1px solid var(--line)}`;

function renderWobble(word: string): string {
  return [...word]
    .map((char, index) => `<span style="--i:${index}">${escapeHtml(char)}</span>`)
    .join("");
}

function renderCard(slug: string, page: StatusPage): string {
  return `<li><a class="panel card" href="/status/${encodeURIComponent(slug)}">
<span class="card-title">${escapeHtml(page.title)}</span>
<span class="card-meta">${formatCount(page.components.length, "component")}</span></a></li>`;
}

export function renderHomePage(pages: Map<string, StatusPage>): string {
  const cards = [...pages].map(([slug, page]) => renderCard(slug, page));
  const body = `<section class="hero">
<p class="eyebrow">Status pages</p>
<h1 class="wordmark">bit<span class="wobble" aria-hidden="true">${renderWobble("wobbly")}</span><span class="visually-hidden">wobbly</span></h1>
<p class="lede">Is it a bit wobbly? Live health for the things <a href="https://nicholasgriffin.dev">Nicholas Griffin</a> builds, read straight from Sentry.</p>
</section>
<h2 class="section-title">Projects</h2>
<ul class="cards">${cards.join("")}</ul>
<p class="hint">Need it machine-readable? <code>GET /status/{page}.json</code></p>`;

  return renderDocument({
    title: "bitwobbly · status",
    description:
      "Live status pages for Nicholas Griffin's projects, powered by Sentry.",
    body,
    styles: STYLES,
  });
}
