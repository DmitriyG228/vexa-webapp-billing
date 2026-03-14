const Stripe = require('stripe');
if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  console.log('=== STRIPE LIVE AUDIT ===');
  console.log('Date:', new Date().toISOString());
  console.log('Mode: READ-ONLY\n');

  // 1. Fetch all subscriptions (active, trialing, past_due, canceled but not yet ended)
  const statuses = ['active', 'trialing', 'past_due'];
  let allSubs = [];

  for (const status of statuses) {
    let hasMore = true;
    let startingAfter = undefined;
    while (hasMore) {
      const params = { status, limit: 100, expand: ['data.customer', 'data.items.data.price'] };
      if (startingAfter) params.starting_after = startingAfter;
      const batch = await stripe.subscriptions.list(params);
      allSubs = allSubs.concat(batch.data);
      hasMore = batch.has_more;
      if (batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id;
    }
  }

  // Collect unique product IDs and fetch them
  const productIds = new Set();
  for (const sub of allSubs) {
    for (const item of sub.items.data) {
      const pid = typeof item.price.product === 'string' ? item.price.product : item.price.product.id;
      productIds.add(pid);
    }
  }
  const productCache = {};
  for (const pid of productIds) {
    productCache[pid] = await stripe.products.retrieve(pid);
  }

  // Also get canceled subs that have cancel_at_period_end (still technically active but scheduled)
  // These would show up as active with cancel_at_period_end=true, already captured above.

  console.log(`Total subscriptions found: ${allSubs.length}\n`);

  // 2. Build per-customer report
  const rows = [];
  const priceMap = {};
  const productMap = {};
  const customersWithBalance = [];
  const customersSeen = new Set();

  for (const sub of allSubs) {
    const cust = typeof sub.customer === 'object' ? sub.customer : { id: sub.customer, email: '(not expanded)' };

    for (const item of sub.items.data) {
      const price = item.price;
      const prodId = typeof price.product === 'string' ? price.product : price.product.id;
      const product = productCache[prodId] || { id: prodId, name: '(unknown)' };

      rows.push({
        email: cust.email || '(none)',
        customer_id: cust.id,
        sub_id: sub.id,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
        price_id: price.id,
        price_nickname: price.nickname || '(none)',
        unit_amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring ? price.recurring.interval : 'one-time',
        product_id: product.id,
        product_name: product.name || '(none)',
      });

      priceMap[price.id] = {
        id: price.id,
        nickname: price.nickname || '(none)',
        unit_amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring ? price.recurring.interval : 'one-time',
        product_id: product.id,
        product_name: product.name || '(none)',
        active: price.active,
      };

      productMap[product.id] = {
        id: product.id,
        name: product.name || '(none)',
        active: product.active,
      };
    }

    if (!customersSeen.has(cust.id)) {
      customersSeen.add(cust.id);
      if (cust.balance && cust.balance < 0) {
        customersWithBalance.push({
          email: cust.email,
          customer_id: cust.id,
          balance: cust.balance,
          currency: cust.currency,
        });
      }
    }
  }

  // Print all subscription rows
  console.log('=== ALL SUBSCRIPTIONS ===\n');
  for (const r of rows) {
    console.log(`  Customer: ${r.email} (${r.customer_id})`);
    console.log(`    Sub: ${r.sub_id}  Status: ${r.status}  Cancel@End: ${r.cancel_at_period_end}${r.cancel_at ? '  CancelAt: ' + r.cancel_at : ''}`);
    console.log(`    Price: ${r.price_id} "${r.price_nickname}"  ${r.unit_amount} ${r.currency}/${r.interval}`);
    console.log(`    Product: ${r.product_id} "${r.product_name}"`);
    console.log('');
  }

  // 3. Unique prices
  console.log('=== UNIQUE PRICES ===\n');
  for (const p of Object.values(priceMap)) {
    console.log(`  ${p.id}  "${p.nickname}"  ${p.unit_amount} ${p.currency}/${p.interval}  product=${p.product_id} "${p.product_name}"  active=${p.active}`);
  }
  console.log('');

  // 4. Unique products
  console.log('=== UNIQUE PRODUCTS ===\n');
  for (const p of Object.values(productMap)) {
    console.log(`  ${p.id}  "${p.name}"  active=${p.active}`);
  }
  console.log('');

  // 5. Customers with credit balance
  console.log('=== CUSTOMERS WITH CREDIT BALANCE (balance < 0) ===\n');
  if (customersWithBalance.length === 0) {
    console.log('  (none)');
  } else {
    for (const c of customersWithBalance) {
      console.log(`  ${c.email} (${c.customer_id})  balance=${c.balance} ${c.currency}`);
    }
  }
  console.log('');

  // 6. Summary counts
  const statusCounts = {};
  const priceCounts = {};
  for (const r of rows) {
    const sKey = r.cancel_at_period_end ? `${r.status} (cancel@end)` : r.status;
    statusCounts[sKey] = (statusCounts[sKey] || 0) + 1;
    const pKey = `${r.price_id} "${r.price_nickname}" (${r.unit_amount} ${r.currency}/${r.interval})`;
    priceCounts[pKey] = (priceCounts[pKey] || 0) + 1;
  }

  console.log('=== SUMMARY BY STATUS ===\n');
  for (const [k, v] of Object.entries(statusCounts)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('');

  console.log('=== SUMMARY BY PRICE ===\n');
  for (const [k, v] of Object.entries(priceCounts)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('');

  console.log('=== AUDIT COMPLETE ===');
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
