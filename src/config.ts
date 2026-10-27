import { isRecord, isNonEmptyString } from "./lib/guards";

export interface StatusComponent {
  name: string;
  project: string;
}

export interface StatusPage {
  title: string;
  components: StatusComponent[];
}

const PROJECT_SLUG = /^[a-z0-9][a-z0-9_-]*$/;

function parseComponent(value: unknown, page: string): StatusComponent {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.project) ||
    !PROJECT_SLUG.test(value.project)
  ) {
    throw new Error(`Invalid component on status page "${page}"`);
  }
  return { name: value.name, project: value.project };
}

export function parseStatusPages(raw: unknown): Map<string, StatusPage> {
  if (!isRecord(raw)) {
    throw new Error("STATUS_PAGES must be an object");
  }

  const pages = new Map<string, StatusPage>();
  for (const [slug, value] of Object.entries(raw)) {
    if (
      !isRecord(value) ||
      !isNonEmptyString(value.title) ||
      !Array.isArray(value.components) ||
      value.components.length === 0
    ) {
      throw new Error(`Invalid status page "${slug}"`);
    }
    pages.set(slug, {
      title: value.title,
      components: value.components.map((c) => parseComponent(c, slug)),
    });
  }
  return pages;
}
