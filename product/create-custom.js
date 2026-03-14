/**
 * Create Custom Subscription
 *
 * Set up a customer with custom plan parameters: price, bots, credit, interval.
 * Used for enterprise deals or any non-standard setup.
 *
 * Usage:
 *   node product/create-custom.js \
 *     --email alex@topline.com \
 *     --plan enterprise \
 *     --price 20000 \
 *     --bots 9 \
 *     --interval month
 *
 *   node product/create-custom.js \
 *     --email vip@company.com \
 *     --plan bot_service \
 *     --bots 20 \
 *     --credit 10000
 *
 * Options:
 *   --email       Customer email (required)
 *   --plan        Plan: individual, bot_service, enterprise (required)
 *   --price       Custom price in cents (e.g. 20000 = $200). Omit to use catalog price
 *   --bots        max_concurrent_bots (default: plan default)
 *   --credit      Credit grant in cents (e.g. 10000 = $100). Omit for no credit
 *   --interval    Billing interval: month or year (default: month)
 *   --dry-run     Preview only, don't create anything (default: true)
 *
 * Requires: STRIPE_SECRET_KEY env var
 */

var Stripe = require("stripe");
var fs = require("fs");
var path = require("path");

// ── Parse args ──────────────────────────────────────────────────────────────

var args = {};
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg.startsWith("--")) {
    var key = arg.slice(2);
    var val = process.argv[i + 1];
    if (val && !val.startsWith("--")) {
      args[key] = val;
      i++;
    } else {
      args[key] = "true";
    }
  }
}

var email = args.email;
var plan = args.plan;
var customPriceCents = args.price ? parseInt(args.price, 10) : null;
var maxBots = args.bots ? parseInt(args.bots, 10) : null;
var creditCents = args.credit ? parseInt(args.credit, 10) : null;
var interval = args.interval || "month";
var DRY_RUN = args["dry-run"] !== "false";
var METADATA_ONLY = args["metadata-only"] === "true";

if (!email || !plan) {
  console.log("Usage: node product/create-custom.js --email <email> --plan <plan> [options]");
  console.log("");
  console.log("Required:");
  console.log("  --email       Customer email");
  console.log("  --plan        individual | bot_service | enterprise");
  console.log("");
  console.log("Optional:");
  console.log("  --price       Custom price in cents (e.g. 20000 = $200)");
  console.log("  --bots        max_concurrent_bots");
  console.log("  --credit      Credit grant in cents (e.g. 10000 = $100)");
  console.log("  --interval    month | year (default: month)");
  console.log("  --dry-run     false to execute (default: true = preview)");
  console.log("  --metadata-only  true to only update subscription metadata (no new sub/price)");
  console.log("");
  console.log("Examples:");
  console.log("  node product/create-custom.js --email alex@topline.com --plan enterprise --bots 9 --metadata-only true --dry-run false");
  console.log("  node product/create-custom.js --email client@co.com --plan enterprise --price 20000 --bots 9 --dry-run false");
  console.log("  node product/create-custom.js --email vip@co.com --plan bot_service --bots 20 --credit 10000 --dry-run false");
  process.exit(1);
}

// ── Setup ───────────────────────────────────────────────────────────────────

var idsPath = process.env.STRIPE_IDS_PATH ||
  path.join(__dirname, process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_live")
    ? "stripe_ids.live.json"
    : "stripe_ids.test.json");

var stripeIds = JSON.parse(fs.readFileSync(idsPath, "utf8"));

if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan defaults
var PLAN_DEFAULTS = {
  individual: { product: stripeIds.individual.product_id, price: stripeIds.individual.price_id, bots: 1, tier: "individual" },
  bot_service: { product: stripeIds.bot_service.product_id, price: stripeIds.bot_service.price_id, bots: 5, tier: "bot_service" },
  enterprise: { product: stripeIds.enterprise ? stripeIds.enterprise.product_id : null, price: null, bots: 10, tier: "enterprise" },
};

async function main() {
  var planDef = PLAN_DEFAULTS[plan];
  if (!planDef) {
    console.error("Unknown plan: " + plan + ". Use: individual, bot_service, enterprise");
    process.exit(1);
  }

  var bots = maxBots || planDef.bots;
  var tier = planDef.tier;

  console.log("=== CREATE CUSTOM SUBSCRIPTION " + (DRY_RUN ? "(DRY RUN)" : "(LIVE)") + " ===");
  console.log("Email:    " + email);
  console.log("Plan:     " + plan);
  console.log("Product:  " + planDef.product);
  console.log("Price:    " + (customPriceCents ? "$" + (customPriceCents / 100).toFixed(2) + "/mo (custom)" : "catalog default"));
  console.log("Bots:     " + bots);
  console.log("Credit:   " + (creditCents ? "$" + (creditCents / 100).toFixed(2) : "none"));
  console.log("Interval: " + interval);
  console.log("");

  if (!planDef.product) {
    console.error("No product_id for plan " + plan + " in " + idsPath);
    process.exit(1);
  }

  // 1. Find or error on customer
  var custs = await stripe.customers.list({ email: email, limit: 5 });
  var customer = custs.data.find(function(c) { return c.email === email; });

  if (!customer) {
    console.error("Customer not found in Stripe: " + email);
    console.log("Create the customer first (via auto-provision or Stripe dashboard).");
    process.exit(1);
  }
  console.log("Customer: " + customer.id + " (" + customer.email + ")");

  // 2. Check for existing subscriptions (active or incomplete)
  var existingSubs = await stripe.subscriptions.list({ customer: customer.id, limit: 10 });
  if (existingSubs.data.length > 0) {
    console.log("\nWARNING: Customer has " + existingSubs.data.length + " active subscription(s):");
    for (var s of existingSubs.data) {
      var priceNames = s.items.data.map(function(item) { return item.price.nickname || item.price.id; });
      console.log("  " + s.id + " | " + priceNames.join(", "));
    }
    console.log("\nThe new subscription will be ADDED alongside existing ones.");
    console.log("Cancel old subs first if needed: stripe.subscriptions.cancel(sub_id)");
    console.log("");
  }

  // Metadata-only mode: update existing subscription metadata, no new sub/price
  if (METADATA_ONLY) {
    if (existingSubs.data.length === 0) {
      console.error("No active subscription to update. Remove --metadata-only to create one.");
      process.exit(1);
    }
    var targetSub = existingSubs.data[0];
    console.log("METADATA-ONLY: updating " + targetSub.id);
    console.log("  subscription_tier: " + tier);
    console.log("  max_concurrent_bots: " + bots);

    if (!DRY_RUN) {
      await stripe.subscriptions.update(targetSub.id, {
        metadata: {
          subscription_tier: tier,
          max_concurrent_bots: String(bots),
        },
      });
      console.log("  Updated.");
    } else {
      console.log("\nDRY RUN. Set --dry-run false to execute.");
    }

    if (creditCents) {
      console.log("  Credit grant: $" + (creditCents / 100).toFixed(2));
      if (!DRY_RUN) {
        var grant = await stripe.billing.creditGrants.create({
          customer: customer.id,
          name: "Custom credit for " + email,
          amount: { type: "monetary", monetary: { value: creditCents, currency: "usd" } },
          applicability_config: { scope: { price_type: "metered" } },
          category: "promotional",
        });
        console.log("  Credit grant created: " + grant.id);
      }
    }

    console.log("\n=== DONE ===");
    console.log("Existing sub preserved: " + targetSub.id);
    console.log("Payment method: unchanged");
    console.log("Billing cycle: unchanged");
    return;
  }

  if (DRY_RUN) {
    console.log("DRY RUN — would create:");
    if (customPriceCents) {
      console.log("  1. Custom price: $" + (customPriceCents / 100).toFixed(2) + "/" + interval + " on " + planDef.product);
    }
    console.log("  2. Subscription with metadata: { subscription_tier: " + tier + ", max_concurrent_bots: " + bots + " }");
    if (creditCents) {
      console.log("  3. Credit grant: $" + (creditCents / 100).toFixed(2));
    }
    console.log("\nSet --dry-run false to execute.");
    return;
  }

  // 3. Determine price ID
  var priceId = planDef.price;

  if (customPriceCents) {
    console.log("Creating custom price...");
    var newPrice = await stripe.prices.create({
      product: planDef.product,
      currency: "usd",
      unit_amount: customPriceCents,
      recurring: { interval: interval },
      nickname: plan + " custom (" + email + ")",
      metadata: { vexa_product_id: plan, customer: email },
    });
    priceId = newPrice.id;
    console.log("  Price created: " + priceId + " ($" + (customPriceCents / 100).toFixed(2) + "/" + interval + ")");
  }

  if (!priceId) {
    console.error("No price_id available. Enterprise plans require --price.");
    process.exit(1);
  }

  // 4. Create subscription
  console.log("Creating subscription...");
  var sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    metadata: {
      subscription_tier: tier,
      max_concurrent_bots: String(bots),
    },
  });
  console.log("  Subscription created: " + sub.id);

  // 5. Credit grant (optional)
  if (creditCents) {
    console.log("Creating credit grant...");
    var grant = await stripe.billing.creditGrants.create({
      customer: customer.id,
      name: "Custom credit for " + email,
      amount: { type: "monetary", monetary: { value: creditCents, currency: "usd" } },
      applicability_config: { scope: { price_type: "metered" } },
      category: "promotional",
    });
    console.log("  Credit grant created: " + grant.id + " ($" + (creditCents / 100).toFixed(2) + ")");
  }

  console.log("\n=== DONE ===");
  console.log("Customer: " + email);
  console.log("Plan:     " + tier);
  console.log("Sub:      " + sub.id);
  console.log("Price:    " + priceId + " ($" + ((customPriceCents || "catalog") + "/" + interval) + ")");
  console.log("Bots:     " + bots);
  if (creditCents) console.log("Credit:   $" + (creditCents / 100).toFixed(2));
}

main().catch(console.error);
