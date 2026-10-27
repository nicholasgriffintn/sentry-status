import { parseStatusPages, type StatusPage } from "./config";
import type { Env } from "./env";
import { htmlResponse } from "./lib/html";
import { fetchUnresolvedIssues } from "./sentry";
import { buildReport, overallStatus } from "./status";
import { renderHomePage } from "./views/home";
import { renderNotFoundPage } from "./views/not-found";
import { renderStatusPage } from "./views/status-page";

const CACHE_HEADERS = { "Cache-Control": "public, max-age=60" };
const STATUS_ROUTE = /^\/status\/([a-z0-9-]+)(\.json)?$/;

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
  const { pathname } = new URL(request.url);
  const pages = parseStatusPages(env.STATUS_PAGES);
  if (pathname === "/") {
    return htmlResponse(renderHomePage(pages), { headers: CACHE_HEADERS });
  }

  const match = STATUS_ROUTE.exec(pathname);
  const slug = match?.[1];
  const page = slug ? pages.get(slug) : undefined;
  if (!match || !slug || !page) {
    return htmlResponse(renderNotFoundPage(), { status: 404 });
  }

  const now = new Date();
  const { reports, overall } = await buildPage(env, page, now);

  if (match[2]) {
    return Response.json(
      {
        title: page.title,
        status: overall,
        components: reports,
        generatedAt: now,
      },
      { headers: CACHE_HEADERS },
    );
  }
  return htmlResponse(
    renderStatusPage({
      slug,
      title: page.title,
      overall,
      reports,
      generatedAt: now,
    }),
    { headers: CACHE_HEADERS },
  );
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
