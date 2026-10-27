import { renderDocument } from "./layout";

const STYLES = `
.not-found{padding-block:48px}
.code{margin:0 0 8px;font:800 clamp(64px,16vw,120px)/1 var(--mono);color:var(--accent);letter-spacing:-.04em;
text-shadow:0 0 24px color-mix(in srgb,var(--accent) 45%,transparent)}
.not-found p:last-child{margin:16px 0 0;color:var(--muted)}`;

export function renderNotFoundPage(): string {
  return renderDocument({
    title: "Not found · bitwobbly",
    description: "This page does not exist.",
    body: `<section class="not-found">
<p class="code">404</p>
<h1>This page wobbled off</h1>
<p>Nothing lives here. Head back to <a href="/">all status pages</a>.</p>
</section>`,
    styles: STYLES,
  });
}
