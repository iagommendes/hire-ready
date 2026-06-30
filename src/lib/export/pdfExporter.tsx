/**
 * Builds a PDF Blob from a chosen template + resume model using
 * @react-pdf/renderer's `pdf()` renderer. Runs entirely in the browser.
 */

import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
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
  const element = createElement(Component, { model });
  return pdf(element).toBlob();
}
