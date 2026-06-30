/**
 * Builds a fully static export of the app for hosts that only serve static
 * files (e.g. GitHub Pages).
 *
 * The optional AI proxy at `app/api/rewrite/route.ts` is a POST Route Handler,
 * which Next.js cannot include in a static export. Since GitHub Pages can't run
 * serverless functions anyway, we temporarily move the `app/api` folder out of
 * the way, run `next build` with STATIC_EXPORT=true (producing `out/`), then
 * restore it. The client degrades gracefully when the endpoint is absent.
 */

import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = resolve(root, "app/api");
const stashedApiDir = resolve(root, ".api-stashed");

async function withApiStashed(run) {
  const hadApi = existsSync(apiDir);
  if (hadApi) await rename(apiDir, stashedApiDir);
  try {
    return run();
  } finally {
    if (hadApi && existsSync(stashedApiDir)) {
      await rename(stashedApiDir, apiDir);
    }
  }
}

async function main() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/hire-ready";

  const exitCode = await withApiStashed(() => {
    const result = spawnSync("next", ["build"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        STATIC_EXPORT: "true",
        NEXT_PUBLIC_BASE_PATH: basePath,
      },
    });
    return result.status ?? 1;
  });

  if (exitCode !== 0) {
    console.error("[build-static] next build failed");
    process.exit(exitCode);
  }
  console.log(
    `[build-static] Static export ready in ./out (basePath: "${basePath}")`,
  );
}

main().catch((err) => {
  console.error("[build-static] Failed:", err);
  process.exit(1);
});
