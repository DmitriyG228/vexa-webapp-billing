/**
 * Rollback Migration
 *
 * Reverses price swaps done by migrate-subscriptions.js.
 * Reads the migration log (migrate-log.json) and swaps each subscription
 * back to its original price.
 *
 * Usage:
 *   DRY_RUN=1 node product/rollback-migration.js    # preview
 *   DRY_RUN=0 node product/rollback-migration.js    # execute
 *
 * Requires: migrate-log.json in same directory (created by migrate-subscriptions.js)
 */

var Stripe = require("stripe");
var fs = require("fs");
var path = require("path");

var DRY_RUN = process.env.DRY_RUN !== "0";

var logPath = process.env.MIGRATION_LOG || path.join(__dirname, "migrate-log.json");

if (!fs.existsSync(logPath)) {
  console.error("No migration log found at " + logPath);
  console.error("Run migrate-subscriptions.js first (with DRY_RUN=0).");
  process.exit(1);
}

var log = JSON.parse(fs.readFileSync(logPath, "utf8"));

if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

var results = { rolled_back: 0, skipped: 0, errors: 0 };

async function main() {
  console.log("=== ROLLBACK MIGRATION " + (DRY_RUN ? "(DRY RUN)" : "(LIVE)") + " ===");
  console.log("Log: " + logPath);
  console.log("Entries: " + log.length);
  console.log("");

  for (var entry of log) {
    console.log(entry.email + " | " + entry.subscription_id + " | " + entry.action);

    if (entry.action === "metadata") {
      var restoreTier = entry.old_tier || "";
      console.log("  ROLLBACK METADATA: subscription_tier → " + (restoreTier || "(remove)"));
      if (!DRY_RUN) {
        try {
          await stripe.subscriptions.update(entry.subscription_id, {
            metadata: { subscription_tier: restoreTier },
          });
          results.rolled_back++;
        } catch (err) {
          console.log("  ERROR: " + err.message);
          results.errors++;
        }
      } else {
        results.rolled_back++;
      }
    } else if (entry.action === "cancel_to_payg" || entry.action === "recreated") {
      console.log("  ROLLBACK: cancel new sub " + entry.new_subscription_id + " → recreate old on " + entry.old_price_id);
      if (!DRY_RUN) {
        try {
          // Cancel the new sub
          await stripe.subscriptions.cancel(entry.new_subscription_id, { prorate: false });
          // Recreate on old price
          await stripe.subscriptions.create({
            customer: entry.customer_id,
            items: [{ price: entry.old_price_id }],
            metadata: { rolled_back_from: entry.new_subscription_id },
          });
          results.rolled_back++;
        } catch (err) {
          console.log("  ERROR: " + err.message);
          results.errors++;
        }
      } else {
        results.rolled_back++;
      }
    } else {
      console.log("  SKIP: unknown action " + entry.action);
      results.skipped++;
    }
  }

  console.log("\n=== RESULTS ===");
  console.log("Rolled back: " + results.rolled_back);
  console.log("Skipped:     " + results.skipped);
  console.log("Errors:      " + results.errors);

  if (DRY_RUN) {
    console.log("\nThis was a DRY RUN. Set DRY_RUN=0 to execute.");
  }
}

main().catch(console.error);
