"use client";

import { Stepper } from "@/components/Stepper";
import { JobStep } from "@/components/steps/JobStep";
import { NotesStep } from "@/components/steps/NotesStep";
import { ResultStep } from "@/components/steps/ResultStep";
import { UploadStep } from "@/components/steps/UploadStep";
import { useTailorStore, type WizardStep } from "@/store/useTailorStore";

function maxReachableStep(args: {
  hasProfile: boolean;
  hasJob: boolean;
  hasMatch: boolean;
}): WizardStep {
  if (args.hasMatch) return 3;
  if (args.hasJob) return 2;
  if (args.hasProfile) return 1;
  return 0;
}

export default function Home() {
  const { step, setStep, profile, jobDescription, match } = useTailorStore();

  const maxReached = maxReachableStep({
    hasProfile: Boolean(profile),
    hasJob: jobDescription.trim().length >= 40,
    hasMatch: Boolean(match),
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          hire-ready
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tailor your resume to any job — private, local, and free. Your data
          stays in your browser unless you opt into AI refinement.
        </p>
      </header>

      <div className="mb-8 flex justify-center">
        <Stepper current={step} maxReached={maxReached} onStepClick={setStep} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 0 && <UploadStep />}
        {step === 1 && <JobStep />}
        {step === 2 && <NotesStep />}
        {step === 3 && <ResultStep />}
      </section>

      <footer className="mt-8 text-center text-xs text-slate-400">
        Open source · MIT · Runs locally in your browser
      </footer>
    </main>
  );
}
