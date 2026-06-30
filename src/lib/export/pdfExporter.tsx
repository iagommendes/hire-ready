/**
 * Builds a PDF Blob from a chosen template + resume model using
 * @react-pdf/renderer's `pdf()` renderer. Runs entirely in the browser.
 */

import { createElement, type ReactElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ResumeModel } from "../resume";
import { getTemplate } from "@/templates/registry";

/**
 * Render the resume to a PDF Blob using the given template id.
 */
export async function generatePdfBlob(
  templateId: string,
  model: ResumeModel,
): Promise<Blob> {
  const { Component } = getTemplate(templateId);
  // Templates render a <Document>, but TS sees the component's own props type.
  const element = createElement(Component, { model }) as ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}
