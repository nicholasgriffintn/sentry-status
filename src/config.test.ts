import { describe, expect, it } from "vitest";

import { parseStatusPages } from "./config";
import { renderStatusPage } from "./views/status-page";

describe("parseStatusPages", () => {
  it("parses valid pages", () => {
    const pages = parseStatusPages({
      app: { title: "App", components: [{ name: "Web", project: "app-web" }] },
    });
    expect(pages.get("app")?.components[0]?.project).toBe("app-web");
  });

  it("rejects project slugs that could change the Sentry API path", () => {
    expect(() =>
      parseStatusPages({
        app: {
          title: "App",
          components: [{ name: "Web", project: "../../orgs" }],
        },
      }),
    ).toThrow(/Invalid component/);
  });

  it("rejects page slugs the status route cannot serve", () => {
    expect(() =>
      parseStatusPages({
        "My App": { title: "App", components: [{ name: "Web", project: "app" }] },
      }),
    ).toThrow(/Invalid status page/);
  });

  it("rejects pages without components", () => {
    expect(() =>
      parseStatusPages({ app: { title: "App", components: [] } }),
    ).toThrow();
  });
});

describe("renderStatusPage", () => {
  it("escapes configured names", () => {
    const html = renderStatusPage({
      slug: "app",
      title: "<script>x</script>",
      overall: "operational",
      reports: [
        {
          name: "<img src=x>",
          status: "operational",
          issueCount: 0,
          eventCount: 0,
        },
      ],
      generatedAt: new Date(0),
    });
    expect(html).not.toContain("<script>x");
    expect(html).not.toContain("<img");
  });
});
