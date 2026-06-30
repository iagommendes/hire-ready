"use client";

import { Button } from "@/components/ui/Button";
import { useTailorStore } from "@/store/useTailorStore";

export function JobStep() {
  const { jobDescription, setJobDescription, setStep } = useTailorStore();
  const charCount = jobDescription.trim().length;
  const ready = charCount >= 40;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          2. Paste the job description
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste the full job posting. We extract the most relevant keywords
          locally to rank your experience.
        </p>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here…"
        className="h-72 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {charCount} characters{ready ? "" : " (paste a bit more to continue)"}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep(0)}>
            Back
          </Button>
          <Button disabled={!ready} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
