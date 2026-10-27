import { formatCount, formatUtcDateTime } from "../lib/format";
import { escapeHtml } from "../lib/html";
import type { ComponentReport, ComponentStatus } from "../status";
import { renderDocument } from "./layout";

const REFRESH_SECONDS = 60;

const LABELS: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  unknown: "Unknown",
};

const HEADLINES: Record<ComponentStatus, string> = {
  operational: "All systems operational",
  degraded: "Some systems are degraded",
  outage: "Outage in progress",
  unknown: "Some systems could not be checked",
};

const STYLES = `
.back{display:inline-block;margin-bottom:28px;font:13px var(--mono);color:var(--muted);text-decoration:none}
.back:hover{color:var(--fg)}
.banner{display:flex;align-items:center;gap:16px;margin-top:28px;padding:20px 22px;
border-color:color-mix(in srgb,var(--tone) 40%,var(--line));
background:linear-gradient(135deg,color-mix(in srgb,var(--tone) 14%,var(--surface)),var(--surface) 70%)}
.banner .dot{width:14px;height:14px}
.banner strong{display:block;font-size:18px;line-height:1.3}
.banner span:not(.dot){color:var(--muted);font-size:14px}
.components{list-style:none;margin:0;padding:0;overflow:hidden}
.components li{display:flex;align-items:center;gap:14px;padding:16px 20px;border-top:1px solid var(--line)}
.components li:first-child{border-top:0}
.components li:hover{background:var(--surface-2)}
.component{flex:1;min-width:0}
.component-name{display:block;font-weight:600}
.component-meta{display:block;color:var(--muted);font:13px/1.5 var(--mono)}
.pill{flex:none;padding:3px 10px;border-radius:999px;font:600 12px/1.6 var(--mono);color:var(--tone);
background:color-mix(in srgb,var(--tone) 14%,transparent);border:1px solid color-mix(in srgb,var(--tone) 35%,transparent)}
.updated{margin:20px 0 0;color:var(--muted);font:13px/1.6 var(--mono)}`;

interface StatusPageOptions {
  slug: string;
  title: string;
  overall: ComponentStatus;
  reports: ComponentReport[];
  generatedAt: Date;
}

function describe(report: ComponentReport): string {
  if (report.status === "unknown") {
    return "Could not reach Sentry";
  }
  return `${formatCount(report.issueCount, "open issue")} · ${formatCount(report.eventCount, "event")} in 24h`;
}

function renderComponent(report: ComponentReport): string {
  return `<li class="tone-${report.status}"><span class="dot" aria-hidden="true"></span>
<div class="component"><span class="component-name">${escapeHtml(report.name)}</span>
<span class="component-meta">${describe(report)}</span></div>
<span class="pill">${LABELS[report.status]}</span></li>`;
}

export function renderStatusPage({
  slug,
  title,
  overall,
  reports,
  generatedAt,
}: StatusPageOptions): string {
  const safeTitle = escapeHtml(title);
  const body = `<a class="back" href="/">← All status pages</a>
<p class="eyebrow">Status</p>
<h1>${safeTitle}</h1>
<div class="panel banner tone-${overall}" role="status"><span class="dot" aria-hidden="true"></span>
<div><strong>${HEADLINES[overall]}</strong><span>${formatCount(reports.length, "component")} monitored</span></div></div>
<h2 class="section-title">Components</h2>
<ul class="panel components">${reports.map(renderComponent).join("")}</ul>
<p class="updated">Updated <time datetime="${generatedAt.toISOString()}">${formatUtcDateTime(generatedAt)}</time>
· refreshes every minute · <a href="/status/${encodeURIComponent(slug)}.json">JSON</a></p>`;

  return renderDocument({
    title: `${title} status`,
    description: `Live status for ${title}: ${HEADLINES[overall].toLowerCase()}.`,
    body,
    styles: STYLES,
    refreshSeconds: REFRESH_SECONDS,
  });
}
