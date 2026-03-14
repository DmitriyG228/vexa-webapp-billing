const Stripe = require('/home/dima/dev/vexa-webapp-billing/apps/webapp/node_modules/stripe');
if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
const test = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  // Products and prices
  console.log('=== PRODUCTS & PRICES ===');
  for await (const prod of test.products.list({ limit: 10, active: true })) {
    console.log(`Product: ${prod.name} (${prod.id})`);
    for await (const price of test.prices.list({ product: prod.id, active: true, limit: 10, expand: ['data.tiers'] })) {
      console.log(`  Price: ${price.id} | nickname=${price.nickname} | type=${price.type} | billing=${price.billing_scheme}`);
      if (price.tiers) {
        for (const t of price.tiers) {
          console.log(`    tier: up_to=${t.up_to === null ? 'inf' : t.up_to}, unit_amount=${t.unit_amount}`);
        }
      }
      if (price.unit_amount) console.log(`    unit_amount=${price.unit_amount}`);
      if (Object.keys(price.metadata || {}).length) console.log(`    metadata=${JSON.stringify(price.metadata)}`);
    }
  }

  // Customers and subs
  console.log('\n=== CUSTOMERS & SUBSCRIPTIONS ===');
  const rows = [];
  for await (const cust of test.customers.list({ limit: 100 })) {
    for await (const sub of test.subscriptions.list({ customer: cust.id, status: 'all', limit: 10 })) {
      if (sub.status === 'canceled') continue;
      const qty = sub.items.data[0]?.quantity || 1;
      rows.push({
        email: cust.email,
        qty,
        status: sub.status,
        cancel_end: sub.cancel_at_period_end,
        balance: cust.balance,
      });
    }
  }

  // Sort by email for readability
  rows.sort((a, b) => a.email.localeCompare(b.email));
  for (const r of rows) {
    const flags = [];
    if (r.cancel_end) flags.push('CANCEL_END');
    if (r.balance < 0) flags.push(`balance=${r.balance}`);
    if (r.status !== 'active') flags.push(`status=${r.status}`);
    console.log(`  ${r.email.padEnd(42)} qty=${r.qty}${flags.length ? '  ' + flags.join(', ') : ''}`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total customers: ${new Set(rows.map(r => r.email)).size}`);
  console.log(`Total subs: ${rows.length}`);
  console.log(`cancel_at_period_end=true: ${rows.filter(r => r.cancel_end).length}`);
  console.log(`trialing: ${rows.filter(r => r.status === 'trialing').length}`);
  console.log(`Credit balances: ${rows.filter(r => r.balance < 0).length}`);
  console.log(`\nQuantity distribution:`);
  const qtys = {};
  for (const r of rows) { qtys[r.qty] = (qtys[r.qty] || 0) + 1; }
  for (const [q, count] of Object.entries(qtys).sort((a,b) => +a[0] - +b[0])) {
    console.log(`  qty=${q}: ${count} subs`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
