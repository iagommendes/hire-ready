"use client";

import { listTemplates } from "@/templates/registry";
import { useTailorStore } from "@/store/useTailorStore";

export function TemplatePicker() {
  const { templateId, setTemplateId } = useTailorStore();
  const templates = listTemplates();

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">PDF template</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map(({ meta }) => (
          <button
            key={meta.id}
            type="button"
            onClick={() => setTemplateId(meta.id)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              templateId === meta.id
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="block text-sm font-semibold text-slate-800">
              {meta.name}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              {meta.description}
            </span>
            <span className="mt-2 flex flex-wrap gap-1">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
