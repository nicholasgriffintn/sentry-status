const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const CONTENT_SECURITY_POLICY =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);
}

export function htmlResponse(html: string, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(html, { ...init, headers });
}
