/**
 * Types shared by all PDF templates.
 *
 * A template is just a React component that receives a `ResumeModel` and
 * returns a `@react-pdf/renderer` <Document>. Contributors only need to create
 * a folder with a component + meta.json and register it in `registry.ts`.
 */

import type { ComponentType } from "react";
import type { ResumeModel } from "@/lib/resume";

export interface TemplateProps {
  model: ResumeModel;
}

export type ResumeTemplateComponent = ComponentType<TemplateProps>;

export interface TemplateMeta {
  /** Unique, URL-safe id (matches the folder name). */
  id: string;
  /** Human-friendly name shown in the picker. */
  name: string;
  /** Short description of the look & feel. */
  description: string;
  /** Contributor name / handle. */
  author: string;
  /** Free-form tags, e.g. ["minimal", "one-column"]. */
  tags: string[];
}

export interface RegisteredTemplate {
  meta: TemplateMeta;
  Component: ResumeTemplateComponent;
}
