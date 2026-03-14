/**
 * Customer Migration Script
 *
 * Production migration plan:
 *   1. standard active (21 users) → Individual ($12/mo, 1 bot)
 *   2. alex@topline.com → Enterprise ($200/mo, 9 bots, no credit) — via create-custom.js
 *   3. non-active (scheduled_to_cancel, trialing, past_due) → PAYG with $5 welcome credit
 *
 * For test mode: also handles old dev prices (Bot Service Hourly v1/v2, etc.)
 *
 * Usage:
 *   DRY_RUN=1 node product/migrate-subscriptions.js          # preview only
 *   DRY_RUN=0 node product/migrate-subscriptions.js          # execute
 *
 * Requires: STRIPE_SECRET_KEY env var
 */

var Stripe = require("stripe");
var fs = require("fs");
var path = require("path");

var DRY_RUN = process.env.DRY_RUN !== "0";

// Load stripe_ids from whichever env we're in
var idsPath = process.env.STRIPE_IDS_PATH ||
  path.join(__dirname, process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_live")
    ? "stripe_ids.live.json"
    : "stripe_ids.test.json");

var stripeIds = JSON.parse(fs.readFileSync(idsPath, "utf8"));

if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Target price IDs (from stripe_ids.json)
var NEW_PRICES = {
  individual: stripeIds.individual.price_id,
  bot_service: stripeIds.bot_service.price_id,
};

// Enterprise product — handled separately via create-custom.js
var ENTERPRISE_PRODUCT_ID = stripeIds.enterprise ? stripeIds.enterprise.product_id : null;

// Map: old_price_id → { target, note, recreate? }
// Every old price must be explicitly listed. Unknown prices are flagged for manual review.
// Set recreate:true for prices on dead/wrong products (cancel old + create new).
var PRICE_MIGRATION_MAP = {
  // ── Test mode prices ──
  "price_1T8JvBFKEqzvZq6xpahyRizk": { target: "bot_service", note: "Bot Hourly v2 → current" },
  "price_1T6oObFKEqzvZq6xBipgXQDA": { target: "individual", note: "old Individual → current" },
  "price_1T6oOcFKEqzvZq6xsiLNIpU4": { target: "bot_service", note: "Bot Hourly v1 → current" },
  "price_1T8KlRFKEqzvZq6xgoaeqX97": { target: "bot_service", note: "myproduct → bot_service", recreate: true },
  "price_1T3ezCFKEqzvZq6xqREqazQG": { target: "bot_service", note: "old Startup → bot_service", recreate: true },

  // ── Live mode prices ──
  // Old "Startup" tiered price — used by ALL live customers
  "price_1S04ycFKEqzvZq6xnIBH4NCI": { target: "individual", note: "live Startup → individual" },
  // Cloned "Startup" in test mode (same structure)
  "price_1TAp8sFKEqzvZq6xORqoKlxP": { target: "individual", note: "test clone Startup → individual" },
};

var results = { migrated: 0, skipped: 0, errors: 0 };
var migrationLog = [];

async function getAllSubscriptions() {
  var all = [];
  var hasMore = true;
  var startingAfter = undefined;
  while (hasMore) {
    var params = { limit: 100, expand: ["data.customer"] };
    if (startingAfter) params.starting_after = startingAfter;
    var batch = await stripe.subscriptions.list(params);
    all = all.concat(batch.data);
    hasMore = batch.has_more;
    if (batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id;
  }
  return all;
}

function isNewPrice(priceId) {
  return Object.values(NEW_PRICES).indexOf(priceId) !== -1;
}

async function migrateSubscription(sub) {
  var email = sub.customer.email || "no-email";
  var items = sub.items.data;

  // Skip if already on new prices
  if (items.every(function(item) { return isNewPrice(item.price.id); })) {
    return { action: "skip", reason: "already on new prices" };
  }

  // Skip enterprise product — handled via create-custom.js
  if (ENTERPRISE_PRODUCT_ID && items.some(function(item) {
    var prod = item.price.product;
    var prodId = typeof prod === "string" ? prod : prod.id;
    return prodId === ENTERPRISE_PRODUCT_ID;
  })) {
    return { action: "skip", reason: "enterprise product — use create-custom.js" };
  }

  if (items.length !== 1) {
    return { action: "skip", reason: "multi-item sub (" + items.length + " items) — manual review" };
  }

  var item = items[0];
  var oldPriceId = item.price.id;

  // Look up migration target from explicit price mapping
  var mapping = PRICE_MIGRATION_MAP[oldPriceId];
  if (!mapping) {
    return { action: "skip", reason: "unknown price " + oldPriceId + " (" + (item.price.nickname || "unnamed") + ") — add to PRICE_MIGRATION_MAP" };
  }

  var target = mapping.target;
  var note = mapping.note;
  var newPriceId = NEW_PRICES[target];

  // Scheduled to cancel → cancel now with proration, create PAYG
  if (sub.cancel_at_period_end) {
    var paygPriceId = NEW_PRICES["bot_service"];
    console.log("  CANCEL→PAYG: cancel " + sub.id + " with proration → new PAYG sub (" + note + ")");
    if (!DRY_RUN) {
      // Cancel immediately — Stripe credits unused portion to customer.balance
      await stripe.subscriptions.cancel(sub.id, { prorate: true });
      // Create PAYG sub
      var newSub = await stripe.subscriptions.create({
        customer: sub.customer.id,
        items: [{ price: paygPriceId }],
        metadata: { migrated_from: sub.id, migration_note: "scheduled_to_cancel → PAYG with proration" },
      });
      migrationLog.push({
        action: "cancel_to_payg",
        email: email,
        customer_id: sub.customer.id,
        subscription_id: sub.id,
        new_subscription_id: newSub.id,
        old_price_id: oldPriceId,
        new_price_id: paygPriceId,
        target: "bot_service",
        timestamp: new Date().toISOString(),
      });
      await grantWelcomeCredit(sub.customer.id, email);
    }
    return { action: "cancel_to_payg", target: "bot_service" };
  }

  // Cancel + recreate for prices on dead/wrong products
  if (mapping.recreate) {
    console.log("  RECREATE: cancel " + sub.id + " → new sub on " + target + " (" + note + ")");
    if (!DRY_RUN) {
      await stripe.subscriptions.cancel(sub.id, { prorate: false });
      var newSub = await stripe.subscriptions.create({
        customer: sub.customer.id,
        items: [{ price: newPriceId }],
        metadata: { migrated_from: sub.id },
      });
      migrationLog.push({
        action: "recreated",
        email: email,
        customer_id: sub.customer.id,
        subscription_id: sub.id,
        new_subscription_id: newSub.id,
        old_price_id: oldPriceId,
        new_price_id: newPriceId,
        target: target,
        timestamp: new Date().toISOString(),
      });
      if (target === "bot_service") {
        await grantWelcomeCredit(sub.customer.id, email);
      }
    }
    return { action: "recreated", target: target };
  }

  // Metadata-only update — no price change, no billing impact
  console.log("  METADATA: " + sub.id + " → subscription_tier=" + target + " (" + note + ")");
  if (!DRY_RUN) {
    await stripe.subscriptions.update(sub.id, {
      metadata: { subscription_tier: target },
    });
    migrationLog.push({
      action: "metadata",
      email: email,
      customer_id: sub.customer.id,
      subscription_id: sub.id,
      old_tier: sub.metadata.subscription_tier || null,
      new_tier: target,
      timestamp: new Date().toISOString(),
    });
  }
  return { action: "metadata", target: target };
}

async function grantWelcomeCredit(customerId, email) {
  // Check idempotency — don't double-grant
  var customer = await stripe.customers.retrieve(customerId);
  if (customer.metadata && customer.metadata.bot_welcome_credit_granted) {
    console.log("  Welcome credit already granted for " + email + " — skip");
    return;
  }

  await stripe.billing.creditGrants.create({
    customer: customerId,
    name: "Welcome credit ($5)",
    amount: { type: "monetary", monetary: { value: 500, currency: "usd" } },
    applicability_config: { scope: { price_type: "metered" } },
    category: "promotional",
  });
  await stripe.customers.update(customerId, {
    metadata: { bot_welcome_credit_granted: "true" },
  });
  console.log("  Granted $5 welcome credit to " + email);
}

async function main() {
  console.log("=== CUSTOMER MIGRATION " + (DRY_RUN ? "(DRY RUN)" : "(LIVE)") + " ===");
  console.log("Using stripe_ids from: " + idsPath);
  console.log("Target prices: individual=" + NEW_PRICES.individual + " bot_service=" + NEW_PRICES.bot_service);
  console.log("");

  var subs = await getAllSubscriptions();
  console.log("Total subscriptions: " + subs.length + "\n");

  for (var sub of subs) {
    var email = sub.customer.email || "no-email";
    var status = sub.status;

    // Skip incomplete_expired — junk
    if (status === "incomplete_expired") {
      results.skipped++;
      continue;
    }

    console.log(email + " | " + sub.id + " | " + status);
    try {
      var result = await migrateSubscription(sub);
      if (result.action === "metadata" || result.action === "recreated" || result.action === "cancel_to_payg") {
        results.migrated++;
      } else {
        console.log("  " + result.action + ": " + result.reason);
        results.skipped++;
      }
    } catch (err) {
      console.log("  ERROR: " + err.message);
      results.errors++;
    }
  }

  console.log("\n=== RESULTS ===");
  console.log("Migrated: " + results.migrated);
  console.log("Skipped:  " + results.skipped);
  console.log("Errors:   " + results.errors);

  if (DRY_RUN) {
    console.log("\nThis was a DRY RUN. Set DRY_RUN=0 to execute.");
    console.log("Next: run create-custom.js for enterprise (alex@topline.com)");
  } else if (migrationLog.length > 0) {
    var logPath = path.join(__dirname, "migrate-log.json");
    fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));
    console.log("\nMigration log saved to " + logPath + " (" + migrationLog.length + " entries)");
    console.log("Rollback: DRY_RUN=1 node product/rollback-migration.js");
  }
}

main().catch(console.error);
