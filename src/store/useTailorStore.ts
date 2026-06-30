/**
 * Central client-side state for the tailoring wizard. Everything lives in the
 * browser; nothing is persisted or sent anywhere unless the user opts into AI.
 */

"use client";

import { create } from "zustand";
import { analyze } from "@/lib/match";
import type { DocumentTone, MatchResult, Profile } from "@/lib/types";
import { DEFAULT_TEMPLATE_ID } from "@/templates/registry";

export type WizardStep = 0 | 1 | 2 | 3;

interface TailorState {
  step: WizardStep;
  profile: Profile | null;
  fileName: string | null;
  jobDescription: string;
  notes: string;
  tone: DocumentTone;
  templateId: string;
  match: MatchResult | null;
  rewrittenBullets: Record<string, string> | null;
  aiNotice: string | null;
  error: string | null;

  setStep: (step: WizardStep) => void;
  setProfile: (profile: Profile, fileName: string) => void;
  setJobDescription: (text: string) => void;
  setNotes: (text: string) => void;
  setTone: (tone: DocumentTone) => void;
  setTemplateId: (id: string) => void;
  setRewrittenBullets: (
    map: Record<string, string> | null,
    notice?: string | null,
  ) => void;
  setError: (message: string | null) => void;
  runAnalysis: () => void;
  reset: () => void;
}

const initialState = {
  step: 0 as WizardStep,
  profile: null,
  fileName: null,
  jobDescription: "",
  notes: "",
  tone: "professional" as DocumentTone,
  templateId: DEFAULT_TEMPLATE_ID,
  match: null,
  rewrittenBullets: null,
  aiNotice: null,
  error: null,
};

export const useTailorStore = create<TailorState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setProfile: (profile, fileName) =>
    set({ profile, fileName, error: null }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setNotes: (notes) => set({ notes }),
  setTone: (tone) => set({ tone }),
  setTemplateId: (templateId) => set({ templateId }),
  setRewrittenBullets: (rewrittenBullets, aiNotice = null) =>
    set({ rewrittenBullets, aiNotice }),
  setError: (error) => set({ error }),

  runAnalysis: () => {
    const { profile, jobDescription } = get();
    if (!profile || !jobDescription.trim()) {
      set({ error: "Upload a profile and paste a job description first." });
      return;
    }
    const match = analyze(profile, jobDescription, { limit: 30 });
    // A fresh analysis invalidates any previous AI rewrite.
    set({ match, rewrittenBullets: null, aiNotice: null, error: null });
  },

  reset: () => set({ ...initialState }),
}));
