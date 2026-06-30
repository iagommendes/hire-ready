/**
 * Central registry of available PDF templates.
 *
 * To contribute a new template:
 *   1. Create `src/templates/<your-id>/Template.tsx` exporting a default
 *      component of type `ResumeTemplateComponent`.
 *   2. Add a `src/templates/<your-id>/meta.json` (see existing templates).
 *   3. Register it in the `templates` array below.
 *
 * No core code needs to change beyond this file.
 */

import type { RegisteredTemplate } from "./types";
import ClassicTemplate from "./classic/Template";
import classicMeta from "./classic/meta.json";
import ModernTemplate from "./modern/Template";
import modernMeta from "./modern/meta.json";

export const templates: RegisteredTemplate[] = [
  { meta: classicMeta, Component: ClassicTemplate },
  { meta: modernMeta, Component: ModernTemplate },
];

export const DEFAULT_TEMPLATE_ID = "classic";

export function getTemplate(id: string): RegisteredTemplate {
  return (
    templates.find((t) => t.meta.id === id) ??
    templates.find((t) => t.meta.id === DEFAULT_TEMPLATE_ID) ??
    templates[0]
  );
}

export function listTemplates(): RegisteredTemplate[] {
  return templates;
}
