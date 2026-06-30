# Contributing a PDF Template

Templates control how the tailored resume looks as a PDF. They are plain
[`@react-pdf/renderer`](https://react-pdf.org/) components, so contributing one
requires no changes to the core app.

## Anatomy of a template

Each template lives in its own folder under `src/templates/<id>/`:

```
src/templates/
  classic/
    Template.tsx   # default export: a React component (model) => <Document>
    meta.json      # id, name, description, author, tags
  modern/
    Template.tsx
    meta.json
  registry.ts      # the single file you edit to register a template
  types.ts         # TemplateProps / TemplateMeta types
```

### 1. Create the component

`Template.tsx` must `export default` a component of type
`ResumeTemplateComponent`. It receives a `ResumeModel` and returns a
`<Document>`:

```tsx
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { TemplateProps } from "../types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
});

export default function MyTemplate({ model }: TemplateProps) {
  return (
    <Document title={`${model.name} - Resume`}>
      <Page size="A4" style={styles.page}>
        <Text>{model.name}</Text>
        {/* ...render model.summary, model.experiences, etc. */}
      </Page>
    </Document>
  );
}
```

The `ResumeModel` shape (see [`src/lib/resume.ts`](../src/lib/resume.ts)):

| Field            | Type               | Notes                                   |
| ---------------- | ------------------ | --------------------------------------- |
| `name`           | `string`           |                                         |
| `headline`       | `string`           |                                         |
| `contact`        | `{ email?, phone?, location?, links[] }` |                       |
| `summary`        | `string`           |                                         |
| `experiences`    | `ExperienceItem[]` | Already ordered by relevance.           |
| `education`      | `EducationItem[]`  |                                         |
| `skills`         | `string[]`         | Job-matched skills come first.          |
| `highlightTerms` | `string[]`         | Keywords worth emphasizing.             |
| `coverageScore`  | `number`           | 0–1 job-fit score.                      |

### 2. Add `meta.json`

```json
{
  "id": "my-template",
  "name": "My Template",
  "description": "One-line description shown in the picker.",
  "author": "your-handle",
  "tags": ["minimal", "two-column"]
}
```

The `id` must be unique and match the folder name.

### 3. Register it

Add one entry to [`src/templates/registry.ts`](../src/templates/registry.ts):

```ts
import MyTemplate from "./my-template/Template";
import myMeta from "./my-template/meta.json";

export const templates: RegisteredTemplate[] = [
  // ...existing
  { meta: myMeta, Component: MyTemplate },
];
```

That's it — the template automatically appears in the picker.

## Guidelines

- Use only `@react-pdf/renderer` primitives so output stays deterministic.
- Prefer the built-in fonts (`Helvetica`, `Times-Roman`, `Courier`) or register
  fonts inside the template; don't rely on system fonts.
- Keep it ATS-friendly: real text, logical reading order, no text-as-image.
- Test locally with `npm run dev`, generate a PDF, and open it.
- Add a `preview.png` to your folder if you can (helps the picker UI later).
