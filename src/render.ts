import { escapeHtml } from "./lib/html";
import type { ComponentReport, ComponentStatus } from "./status";

const LABELS: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  unknown: "Unknown",
};

const STYLES = `
:root{--bg:#fafafa;--fg:#18181b;--muted:#71717a;--card:#fff;--line:#e4e4e7;
--operational:#15803d;--degraded:#b45309;--outage:#b91c1c;--unknown:#71717a}
@media (prefers-color-scheme:dark){:root{--bg:#09090b;--fg:#fafafa;--muted:#a1a1aa;
--card:#18181b;--line:#27272a;--operational:#4ade80;--degraded:#fbbf24;--outage:#f87171;--unknown:#a1a1aa}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);
font:16px/1.5 system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:48px 16px}
h1{margin:0 0 8px;font-size:28px}.banner{margin:24px 0;padding:16px;border-radius:8px;
background:var(--card);border:1px solid var(--line);font-weight:600}
ul{list-style:none;margin:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--card)}
li{display:flex;justify-content:space-between;gap:16px;padding:16px;border-top:1px solid var(--line)}
li:first-child{border-top:0}.meta{color:var(--muted);font-size:14px}
.operational{color:var(--operational)}.degraded{color:var(--degraded)}
.outage{color:var(--outage)}.unknown{color:var(--unknown)}footer{margin-top:24px;color:var(--muted);font-size:14px}`;

function renderComponent(report: ComponentReport): string {
  const meta =
    report.status === "unknown"
      ? "No data"
      : `${report.issueCount} open issues, ${report.eventCount} events in 24h`;
  return `<li><div><div>${escapeHtml(report.name)}</div><div class="meta">${meta}</div></div>
<strong class="${report.status}">${LABELS[report.status]}</strong></li>`;
}

export function renderStatusPage(
  title: string,
  overall: ComponentStatus,
  reports: ComponentReport[],
  generatedAt: Date,
): string {
  const safeTitle = escapeHtml(title);
  const banner =
    overall === "operational"
      ? "All systems operational"
      : `Current status: ${LABELS[overall]}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle} status</title>
<style>${STYLES}</style>
</head>
<body>
<main>
<h1>${safeTitle} status</h1>
<div class="banner ${overall}">${banner}</div>
<ul>${reports.map(renderComponent).join("")}</ul>
<footer>Updated ${generatedAt.toISOString()}</footer>
</main>
</body>
</html>`;
}
