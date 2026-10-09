import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const required = [
  "supabase/migrations/20260829000000_carkila_initial_schema.sql",
  "supabase/migrations/20260829000100_storage_buckets.sql",
  "supabase/migrations/20260829000200_enable_realtime.sql",
  "supabase/migrations/20260830010000_listing_rpcs.sql",
  "supabase/migrations/20260830020000_production_hardening.sql",
  "supabase/migrations/20260831020000_secure_profile_update.sql",
  "supabase/migrations/20260831030000_seed_listing_options.sql",
  "src/lib/supabase.ts",
  "src/services/carkila.ts",
  "src/screens/EditListingScreen.tsx",
  "src/screens/EditProfileScreen.tsx",
  "src/screens/ChatScreen.tsx",
];
for (const file of required) assert.ok(existsSync(`${root}/${file}`), `Missing ${file}`);
const schema = readFileSync(`${root}/supabase/migrations/20260829000000_carkila_initial_schema.sql`, "utf8");
for (const table of ["profiles", "vehicles", "listings", "conversations", "messages", "reviews", "listing_credit_transactions"]) {
  assert.match(schema, new RegExp(`create table public\\.${table}\\b`, "i"));
}
assert.match(readFileSync(`${root}/src/services/carkila.ts`, "utf8"), /create_listing/);
const featureSource = ["App.tsx", "src/services/carkila.ts", "src/screens/EditListingScreen.tsx", "src/screens/EditProfileScreen.tsx", "src/screens/ChatScreen.tsx"].map(file => readFileSync(`${root}/${file}`, "utf8")).join("\n");
for (const feature of ["EditListing", "EditProfile", "reorderPhotos", "removePhoto", "message-attachments", "signedAttachmentUrl"]) assert.match(featureSource, new RegExp(feature));
const hardening = readFileSync(`${root}/supabase/migrations/20260830020000_production_hardening.sql`, "utf8");
for (const invariant of ["protect_profile_system_fields", "protect_listing_lifecycle", "protect_conversation_identity", "protect_message_content", "consume_listing_credit", "get_my_profile"]) assert.match(hardening, new RegExp(invariant));
const profileUpdate = readFileSync(`${root}/supabase/migrations/20260831020000_secure_profile_update.sql`, "utf8");
for (const invariant of ["update_my_profile", "auth.uid", "v_invalid_key", "grant execute"]) assert.match(profileUpdate, new RegExp(invariant));
const source = ["App.tsx", "src/screens/LoginScreen.tsx", "src/services/carkila.ts"].map(file => readFileSync(`${root}/${file}`, "utf8")).join("\n");
assert.doesNotMatch(source, /demo@carkila|CarkilaDemo|service_role/i, "Production source contains demo or service-role credentials");
const appConfig = JSON.parse(readFileSync(`${root}/app.json`, "utf8"));
assert.equal(appConfig.expo.ios.bundleIdentifier, "com.carkila.operators");
assert.equal(appConfig.expo.android.package, "com.carkila.operators");
console.log(`Smoke checks passed (${required.length} files, core tables, security invariants, and release identifiers).`);
