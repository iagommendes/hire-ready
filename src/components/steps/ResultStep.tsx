"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Highlight } from "@/components/Highlight";
import { TemplatePicker } from "@/components/TemplatePicker";
import { rewriteBullets, toRewriteMap } from "@/lib/ai/client";
import { downloadBlob, downloadText, fileSlug } from "@/lib/export/download";
import { generatePdfBlob } from "@/lib/export/pdfExporter";
import { coverLetterToTxt, resumeToTxt } from "@/lib/export/txtExporter";
import { buildResumeModel } from "@/lib/resume";
import { useTailorStore } from "@/store/useTailorStore";

export function ResultStep() {
  const {
    profile,
    match,
    tone,
    notes,
    templateId,
    rewrittenBullets,
    aiNotice,
    setRewrittenBullets,
    setStep,
  } = useTailorStore();

  const [aiBusy, setAiBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const model = useMemo(() => {
    if (!profile || !match) return null;
    return buildResumeModel({
      profile,
      match,
      options: { tone, notes },
      rewrittenBullets: rewrittenBullets ?? undefined,
    });
  }, [profile, match, tone, notes, rewrittenBullets]);

  if (!profile || !match || !model) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          No analysis yet. Go back and generate your resume.
        </p>
        <Button variant="secondary" onClick={() => setStep(2)}>
          Back
        </Button>
      </div>
    );
  }

  const coveragePct = Math.round(model.coverageScore * 100);

  async function handleRefineWithAi() {
    if (!match) return;
    setAiBusy(true);
    try {
      const allBullets = match.rankedExperiences.flatMap(
        (e) => e.experience.bullets,
      );
      if (allBullets.length === 0) {
        setRewrittenBullets(null, "No bullet points to rewrite.");
        return;
      }
      const res = await rewriteBullets({
        bullets: allBullets,
        jobKeywords: match.matchedKeywords.map((k) => k.display),
        tone,
        notes,
      });
      const map = res.aiUsed ? toRewriteMap(allBullets, res.bullets) : null;
      setRewrittenBullets(map, res.notice ?? null);
    } catch {
      setRewrittenBullets(null, "AI refinement failed. Showing original text.");
    } finally {
      setAiBusy(false);
    }
  }

  function handleDownloadTxt() {
    if (!model) return;
    const slug = fileSlug(model.name);
    downloadText(resumeToTxt(model), `${slug}-resume.txt`);
  }

  function handleDownloadCoverLetter() {
    if (!model) return;
    const slug = fileSlug(model.name);
    downloadText(coverLetterToTxt(model, tone), `${slug}-cover-letter.txt`);
  }

  async function handleDownloadPdf() {
    if (!model) return;
    setPdfBusy(true);
    try {
      const blob = await generatePdfBlob(templateId, model);
      downloadBlob(blob, `${fileSlug(model.name)}-resume.pdf`);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          4. Review & download
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Experiences are reordered by relevance and matched keywords are
          highlighted. Everything below was computed locally.
        </p>
      </div>

      {/* Coverage + keywords */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Job-fit coverage
          </p>
          <p className="mt-1 text-3xl font-bold text-brand-600">
            {coveragePct}%
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-brand-500"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Matched keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.matchedKeywords.slice(0, 18).map((k) => (
              <span
                key={k.term}
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
              >
                {k.display}
              </span>
            ))}
            {match.matchedKeywords.length === 0 && (
              <span className="text-sm text-slate-400">None yet</span>
            )}
          </div>
          {match.missingKeywords.length > 0 && (
            <>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                Missing from your profile
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.missingKeywords.slice(0, 12).map((k) => (
                  <span
                    key={k.term}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                  >
                    {k.display}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Optional AI refinement */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-violet-900">
              Optional: refine wording with AI
            </p>
            <p className="mt-0.5 text-xs text-violet-700">
              This is the only step that leaves your device: your bullet points
              are sent to our serverless proxy and on to Google Gemini. The
              deterministic result above works without it.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleRefineWithAi}
              disabled={aiBusy}
            >
              {aiBusy ? "Refining…" : "Refine with AI"}
            </Button>
            {rewrittenBullets && (
              <Button
                variant="ghost"
                onClick={() => setRewrittenBullets(null, null)}
              >
                Revert
              </Button>
            )}
          </div>
        </div>
        {aiNotice && (
          <p className="mt-2 text-xs font-medium text-violet-800">{aiNotice}</p>
        )}
        {rewrittenBullets && !aiNotice && (
          <p className="mt-2 text-xs font-medium text-violet-800">
            AI-refined wording applied.
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">{model.name}</h3>
          {model.headline && (
            <p className="text-sm text-slate-500">{model.headline}</p>
          )}
        </div>
        {model.summary && (
          <p className="mt-3 text-sm text-slate-600">{model.summary}</p>
        )}
        <div className="mt-4 space-y-4">
          {model.experiences.map((exp, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {exp.title}
                  {exp.company ? ` · ${exp.company}` : ""}
                </p>
                <span className="text-xs text-slate-400">{exp.period}</span>
              </div>
              <ul className="mt-1 space-y-1">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-brand-400">•</span>
                    <span>
                      <Highlight text={bullet} terms={model.highlightTerms} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <TemplatePicker />

      {/* Downloads */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button variant="ghost" onClick={() => setStep(2)}>
          Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleDownloadTxt}>
            Download TXT
          </Button>
          <Button variant="secondary" onClick={handleDownloadCoverLetter}>
            Cover letter (TXT)
          </Button>
          <Button onClick={handleDownloadPdf} disabled={pdfBusy}>
            {pdfBusy ? "Building PDF…" : "Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
