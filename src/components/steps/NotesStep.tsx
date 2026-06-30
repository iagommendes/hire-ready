"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTailorStore } from "@/store/useTailorStore";
import type { DocumentTone } from "@/lib/types";

const TONES: { value: DocumentTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "concise", label: "Concise" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

export function NotesStep() {
  const { notes, setNotes, tone, setTone, setStep, runAnalysis } =
    useTailorStore();
  const speech = useSpeechRecognition("en-US");

  // Append finalized dictation chunks to the notes field.
  useEffect(() => {
    if (speech.transcript) {
      setNotes((notes ? `${notes} ` : "") + speech.transcript.trim());
      speech.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.transcript]);

  function handleContinue() {
    runAnalysis();
    setStep(3);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          3. Add notes & pick a tone
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Optional. Add anything the AI should know (availability, relocation,
          highlights). You can dictate using your microphone.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            Additional notes
          </label>
          {speech.supported && (
            <Button
              type="button"
              variant={speech.listening ? "primary" : "secondary"}
              onClick={speech.listening ? speech.stop : speech.start}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  speech.listening ? "animate-pulse bg-red-400" : "bg-slate-400"
                }`}
              />
              {speech.listening ? "Listening… tap to stop" : "Dictate"}
            </Button>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Open to relocation, available immediately, led a team of 5…"
          className="h-40 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {!speech.supported && (
          <p className="text-xs text-slate-400">
            Voice dictation isn’t supported in this browser — you can still type.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Tone</span>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tone === t.value
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handleContinue}>Generate resume</Button>
      </div>
    </div>
  );
}
