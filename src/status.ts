import type { SentryIssue } from "./sentry";

export type ComponentStatus = "operational" | "degraded" | "outage" | "unknown";

export interface ComponentReport {
  name: string;
  status: ComponentStatus;
  issueCount: number;
  eventCount: number;
}

const RECENT_WINDOW_MS = 60 * 60 * 1000;

const SEVERITY: Record<ComponentStatus, number> = {
  operational: 0,
  unknown: 1,
  degraded: 2,
  outage: 3,
};

export function deriveStatus(
  issues: SentryIssue[],
  now: Date,
): ComponentStatus {
  if (issues.some((issue) => issue.category === "uptime")) {
    return "outage";
  }
  const recentCutoff = now.getTime() - RECENT_WINDOW_MS;
  if (issues.some((issue) => issue.lastSeen.getTime() >= recentCutoff)) {
    return "degraded";
  }
  return "operational";
}

export function buildReport(
  name: string,
  issues: SentryIssue[] | null,
  now: Date,
): ComponentReport {
  if (issues === null) {
    return { name, status: "unknown", issueCount: 0, eventCount: 0 };
  }
  return {
    name,
    status: deriveStatus(issues, now),
    issueCount: issues.length,
    eventCount: issues.reduce((total, issue) => total + issue.count, 0),
  };
}

export function overallStatus(reports: ComponentReport[]): ComponentStatus {
  return reports.reduce<ComponentStatus>(
    (worst, report) =>
      SEVERITY[report.status] > SEVERITY[worst] ? report.status : worst,
    "operational",
  );
}
