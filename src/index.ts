import { parseStatusPages, type StatusPage } from "./config";
import type { Env } from "./env";
import { renderStatusPage } from "./render";
import { fetchUnresolvedIssues } from "./sentry";
import { buildReport, overallStatus } from "./status";

const CACHE_SECONDS = 60;
const ROUTE = /^\/status\/([a-z0-9-]+)(\.json)?$/;

async function buildPage(env: Env, page: StatusPage, now: Date) {
  const reports = await Promise.all(
    page.components.map(async (component) => {
      try {
        const issues = await fetchUnresolvedIssues(env, component.project);
        return buildReport(component.name, issues, now);
      } catch (error) {
        console.error(error);
        return buildReport(component.name, null, now);
      }
    }),
  );
  return { reports, overall: overallStatus(reports) };
}

async function handle(request: Request, env: Env): Promise<Response> {
  const match = ROUTE.exec(new URL(request.url).pathname);
  const page = match?.[1]
    ? parseStatusPages(env.STATUS_PAGES).get(match[1])
    : undefined;
  if (!match || !page) {
    return new Response("Not found", { status: 404 });
  }

  const now = new Date();
  const { reports, overall } = await buildPage(env, page, now);
  const headers = { "Cache-Control": `public, max-age=${CACHE_SECONDS}` };

  if (match[2]) {
    return Response.json(
      {
        title: page.title,
        status: overall,
        components: reports,
        generatedAt: now,
      },
      { headers },
    );
  }
  return new Response(renderStatusPage(page.title, overall, reports, now), {
    headers: {
      ...headers,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const cacheKey = new Request(`${url.origin}${url.pathname}`);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await handle(request, env);
    if (response.ok) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  },
} satisfies ExportedHandler<Env>;
