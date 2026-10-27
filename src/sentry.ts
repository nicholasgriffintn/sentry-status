import type { Env } from "./env";
import { isRecord } from "./lib/guards";

export interface SentryIssue {
  count: number;
  lastSeen: Date;
  category: string;
}

function parseIssue(value: unknown): SentryIssue | null {
  if (!isRecord(value) || typeof value.lastSeen !== "string") {
    return null;
  }
  const lastSeen = new Date(value.lastSeen);
  if (Number.isNaN(lastSeen.getTime())) {
    return null;
  }
  return {
    count: Number(value.count) || 0,
    lastSeen,
    category:
      typeof value.issueCategory === "string" ? value.issueCategory : "error",
  };
}

export async function fetchUnresolvedIssues(
  env: Env,
  project: string,
): Promise<SentryIssue[]> {
  const url = new URL(
    `/api/0/projects/${encodeURIComponent(env.SENTRY_ORG)}/${encodeURIComponent(project)}/issues/`,
    env.SENTRY_API_BASE,
  );
  url.searchParams.set("query", "is:unresolved");
  url.searchParams.set("statsPeriod", "24h");
  url.searchParams.set("limit", "100");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.SENTRY_AUTH_TOKEN}` },
  });
  if (!response.ok) {
    throw new Error(`Sentry returned ${response.status} for ${project}`);
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error(`Unexpected Sentry response for ${project}`);
  }
  return body.map(parseIssue).filter((issue) => issue !== null);
}
