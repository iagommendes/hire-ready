/**
 * Vercel Serverless Function: secure proxy to Gemini 1.5 Flash.
 *
 * Responsibilities:
 *  - Mask the API key (read only from server env, never sent to the client).
 *  - Validate and bound the payload to protect the free tier.
 *  - Rate-limit per IP.
 *  - Degrade gracefully: on any error or when no key is configured, return the
 *    original bullets so the deterministic flow keeps working.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SYSTEM_INSTRUCTION,
  buildRewritePrompt,
  parseRewriteOutput,
} from "@/lib/ai/promptBuilder";
import { rateLimit } from "@/lib/ai/rateLimit";
import type { RewriteRequest, RewriteResponse } from "@/lib/ai/types";

export const runtime = "nodejs";

const MAX_BULLETS = 40;
const MAX_BULLET_LENGTH = 600;
const MAX_TOTAL_CHARS = 12_000;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function validate(body: unknown): RewriteRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.bullets)) return null;
  if (!b.bullets.every((x) => typeof x === "string")) return null;
  if (b.bullets.length === 0 || b.bullets.length > MAX_BULLETS) return null;
  if (b.bullets.some((x: string) => x.length > MAX_BULLET_LENGTH)) return null;
  const total = b.bullets.reduce((n: number, x: string) => n + x.length, 0);
  if (total > MAX_TOTAL_CHARS) return null;

  const tone =
    b.tone === "concise" || b.tone === "enthusiastic"
      ? b.tone
      : "professional";

  return {
    bullets: b.bullets as string[],
    jobKeywords: Array.isArray(b.jobKeywords)
      ? (b.jobKeywords as unknown[]).filter((x) => typeof x === "string").slice(0, 30) as string[]
      : [],
    tone,
    notes: typeof b.notes === "string" ? b.notes.slice(0, 2000) : undefined,
  };
}

export async function POST(req: Request) {
  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const request = validate(parsedBody);
  if (!request) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const passthrough = (notice: string, status = 200): NextResponse => {
    const payload: RewriteResponse = {
      bullets: request.bullets,
      aiUsed: false,
      notice,
    };
    return NextResponse.json(payload, { status });
  };

  // Rate limit per IP.
  const limit = rateLimit(clientIp(req));
  if (!limit.allowed) {
    return passthrough("Rate limit reached. Showing original text.", 429);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return passthrough(
      "AI is not configured on this deployment. Showing original text.",
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = buildRewritePrompt(request);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const bullets = parseRewriteOutput(text, request.bullets.length);

    const payload: RewriteResponse = { bullets, aiUsed: true };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Gemini rewrite failed:", err);
    return passthrough("AI request failed. Showing original text.");
  }
}
