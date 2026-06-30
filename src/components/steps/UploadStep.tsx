"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { extractPdfFromFile } from "@/lib/parsing/pdfExtractor";
import { parseLinkedInProfile } from "@/lib/parsing/linkedinParser";
import { useTailorStore } from "@/store/useTailorStore";

export function UploadStep() {
  const { profile, fileName, setProfile, setStep, setError, error } =
    useTailorStore();
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file exported from LinkedIn.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const doc = await extractPdfFromFile(file);
      const parsed = parseLinkedInProfile(doc);
      if (!parsed.name && parsed.experiences.length === 0) {
        setError(
          "We couldn't read this PDF. Make sure it's the LinkedIn 'Save to PDF' export.",
        );
        return;
      }
      setProfile(parsed, file.name);
    } catch (err) {
      console.error(err);
      setError("Failed to read the PDF locally. Please try another file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          1. Upload your LinkedIn profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Open your LinkedIn profile → <em>More</em> → <em>Save to PDF</em>, then
          drop the file here. The PDF is read entirely in your browser and never
          leaves your device.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-slate-300 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <p className="text-sm text-slate-600">
          {busy
            ? "Reading PDF locally…"
            : "Drag & drop your LinkedIn PDF here"}
        </p>
        <p className="my-2 text-xs text-slate-400">or</p>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {profile && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            Parsed “{fileName}”
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            {profile.name || "Unnamed"} — {profile.experiences.length}{" "}
            experience(s), {profile.skills.length} skill(s) detected.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button disabled={!profile} onClick={() => setStep(1)}>
          Continue
        </Button>
      </div>
    </div>
  );
}
