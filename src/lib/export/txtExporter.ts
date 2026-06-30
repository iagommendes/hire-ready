/**
 * Plain-text (.txt) exporter. Produces an ATS-friendly, dependency-free resume
 * and a simple cover letter. Pure functions => unit testable.
 */

import type { ResumeModel } from "../resume";
import type { DocumentTone } from "../types";

function divider(): string {
  return "=".repeat(60);
}

export function resumeToTxt(model: ResumeModel): string {
  const lines: string[] = [];

  lines.push(model.name || "Resume");
  if (model.headline) lines.push(model.headline);

  const contactParts = [
    model.contact.email,
    model.contact.phone,
    model.contact.location,
    ...model.contact.links,
  ].filter(Boolean);
  if (contactParts.length) lines.push(contactParts.join(" | "));

  if (model.summary) {
    lines.push("", divider(), "SUMMARY", divider(), model.summary);
  }

  if (model.experiences.length) {
    lines.push("", divider(), "EXPERIENCE", divider());
    for (const exp of model.experiences) {
      const header = [exp.title, exp.company].filter(Boolean).join(" — ");
      lines.push("", header);
      if (exp.period) lines.push(exp.period);
      for (const bullet of exp.bullets) {
        lines.push(`  - ${bullet}`);
      }
    }
  }

  if (model.education.length) {
    lines.push("", divider(), "EDUCATION", divider());
    for (const edu of model.education) {
      const header = [edu.school, edu.degree].filter(Boolean).join(" — ");
      lines.push("", header);
      if (edu.period) lines.push(edu.period);
    }
  }

  if (model.skills.length) {
    lines.push("", divider(), "SKILLS", divider(), model.skills.join(", "));
  }

  return lines.join("\n");
}

const TONE_OPENERS: Record<DocumentTone, string> = {
  professional:
    "I am writing to express my interest in this opportunity.",
  concise: "I'd like to apply for this role.",
  enthusiastic:
    "I'm thrilled at the opportunity to bring my experience to your team!",
};

export function coverLetterToTxt(model: ResumeModel, tone: DocumentTone): string {
  const top = model.experiences[0];
  const strengths = model.highlightTerms.slice(0, 6).join(", ");

  const paragraphs: string[] = [];
  paragraphs.push(`Dear Hiring Manager,`);
  paragraphs.push(TONE_OPENERS[tone]);

  if (top) {
    paragraphs.push(
      `As ${top.title}${top.company ? ` at ${top.company}` : ""}, ` +
        `I delivered results that map directly to what you're looking for.`,
    );
  }

  if (strengths) {
    paragraphs.push(
      `My background covers ${strengths}, which align closely with the role.`,
    );
  }

  if (model.notes.trim()) {
    paragraphs.push(model.notes.trim());
  }

  paragraphs.push(
    "I would welcome the chance to discuss how I can contribute. Thank you for your consideration.",
  );
  paragraphs.push(`Sincerely,\n${model.name}`);

  return paragraphs.join("\n\n");
}
