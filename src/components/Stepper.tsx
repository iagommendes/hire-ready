"use client";

import type { WizardStep } from "@/store/useTailorStore";

const STEPS = [
  { label: "Profile", hint: "Upload LinkedIn PDF" },
  { label: "Job", hint: "Paste description" },
  { label: "Notes", hint: "Dictate or type" },
  { label: "Result", hint: "Review & download" },
];

interface StepperProps {
  current: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  maxReached: WizardStep;
}

export function Stepper({ current, onStepClick, maxReached }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const state =
          i === current ? "active" : i < current ? "done" : "todo";
        const reachable = i <= maxReached;
        return (
          <li key={step.label} className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onStepClick?.(i as WizardStep)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-left transition-colors ${
                state === "active"
                  ? "bg-brand-600 text-white"
                  : state === "done"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-100 text-slate-400"
              } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  state === "active"
                    ? "bg-white text-brand-600"
                    : state === "done"
                      ? "bg-brand-600 text-white"
                      : "bg-slate-300 text-white"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden text-sm font-medium sm:block">
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="h-px w-4 bg-slate-300 sm:w-8" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
