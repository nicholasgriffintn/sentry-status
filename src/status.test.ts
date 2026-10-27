import { describe, expect, it } from "vitest";

import type { SentryIssue } from "./sentry";
import { buildReport, deriveStatus, overallStatus } from "./status";

const now = new Date("2026-10-27T12:00:00Z");

function issue(overrides: Partial<SentryIssue> = {}): SentryIssue {
  return {
    count: 1,
    lastSeen: new Date("2026-10-27T06:00:00Z"),
    category: "error",
    ...overrides,
  };
}

describe("deriveStatus", () => {
  it("is operational when errors have gone quiet for an hour", () => {
    expect(deriveStatus([], now)).toBe("operational");
    expect(deriveStatus([issue()], now)).toBe("operational");
  });

  it("is degraded when an error was seen in the last hour", () => {
    const recent = issue({ lastSeen: new Date("2026-10-27T11:30:00Z") });
    expect(deriveStatus([issue(), recent], now)).toBe("degraded");
  });

  it("is an outage when an uptime monitor issue is open", () => {
    expect(deriveStatus([issue({ category: "uptime" })], now)).toBe("outage");
  });
});

describe("buildReport", () => {
  it("reports unknown when Sentry could not be read", () => {
    expect(buildReport("App", null, now).status).toBe("unknown");
  });

  it("sums event counts across issues", () => {
    const report = buildReport(
      "App",
      [issue({ count: 3 }), issue({ count: 4 })],
      now,
    );
    expect(report).toMatchObject({ issueCount: 2, eventCount: 7 });
  });
});

describe("overallStatus", () => {
  it("takes the worst component status", () => {
    const reports = [
      buildReport("A", [], now),
      buildReport("B", null, now),
      buildReport("C", [issue({ category: "uptime" })], now),
    ];
    expect(overallStatus(reports)).toBe("outage");
    expect(overallStatus(reports.slice(0, 2))).toBe("unknown");
  });
});
