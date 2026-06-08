// One-off: create Composio "managed auth" configs for the core toolkits so the
// app's Connect buttons work without manual dashboard setup.
// Run: node --env-file=.env.local scripts/composio-setup.mjs
import { Composio } from "@composio/core";

const apiKey = process.env.COMPOSIO_API_KEY;
if (!apiKey) {
  console.error("No COMPOSIO_API_KEY in env. Add it to .env.local.");
  process.exit(1);
}

const TOOLKITS = ["gmail", "googlecalendar", "slack", "notion", "googlesheets"];

const composio = new Composio({ apiKey });

async function existingFor(slug) {
  // Try a few list shapes; return the first auth config matching the toolkit.
  for (const args of [{ toolkitSlug: slug }, { toolkit: slug }, {}]) {
    try {
      const res = await composio.authConfigs.list(args);
      const items = res?.items ?? res?.data ?? res ?? [];
      const arr = Array.isArray(items) ? items : [];
      const hit = arr.find(
        (a) =>
          (a.toolkit?.slug ?? a.toolkit ?? a.toolkitSlug ?? "")
            .toString()
            .toLowerCase() === slug,
      );
      if (hit) return hit;
      if (arr.length) return null; // list worked but no match
    } catch {
      /* try next shape */
    }
  }
  return null;
}

async function createManaged(slug) {
  const attempts = [
    [slug, { name: `${slug} (intelbase)`, type: "use_composio_managed_auth" }],
    [slug, { type: "use_composio_managed_auth" }],
    [{ toolkit: slug, name: `${slug} (intelbase)`, type: "use_composio_managed_auth" }],
    [slug, { isComposioManaged: true, name: `${slug} (intelbase)` }],
  ];
  let lastErr;
  for (const args of attempts) {
    try {
      const res = await composio.authConfigs.create(...(Array.isArray(args[0]) ? args : args));
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

console.log("Composio setup starting for:", TOOLKITS.join(", "));
for (const slug of TOOLKITS) {
  try {
    const existing = await existingFor(slug);
    if (existing) {
      console.log(`  [skip] ${slug}: auth config already exists (id ${existing.id ?? "?"})`);
      continue;
    }
    const created = await createManaged(slug);
    const id = created?.id ?? created?.authConfig?.id ?? JSON.stringify(created).slice(0, 80);
    console.log(`  [ok]   ${slug}: created managed auth config (id ${id})`);
  } catch (e) {
    console.log(`  [fail] ${slug}: ${e?.message ?? e}`);
  }
}
console.log("Done.");
