const Stripe = require('/home/dima/dev/vexa-webapp-billing/apps/webapp/node_modules/stripe');
if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  // 1. Cancel ALL subscriptions
  console.log('=== Canceling all subscriptions ===');
  let subCount = 0;
  for await (const sub of stripe.subscriptions.list({ limit: 100, status: 'all' })) {
    if (sub.status !== 'canceled') {
      await stripe.subscriptions.cancel(sub.id);
      subCount++;
      console.log(`  Canceled ${sub.id} (${sub.status})`);
    }
  }
  console.log(`Canceled ${subCount} subscriptions`);

  // 2. Delete ALL customers
  console.log('\n=== Deleting all customers ===');
  let custCount = 0;
  for await (const cust of stripe.customers.list({ limit: 100 })) {
    await stripe.customers.del(cust.id);
    custCount++;
    console.log(`  Deleted ${cust.id} (${cust.email})`);
  }
  console.log(`Deleted ${custCount} customers`);

  // 3. Archive ALL active prices
  console.log('\n=== Archiving all active prices ===');
  let priceCount = 0;
  for await (const price of stripe.prices.list({ limit: 100, active: true })) {
    await stripe.prices.update(price.id, { active: false });
    priceCount++;
    console.log(`  Archived price ${price.id}`);
  }
  console.log(`Archived ${priceCount} prices`);

  // 4. Archive ALL active products
  console.log('\n=== Archiving all active products ===');
  let prodCount = 0;
  for await (const prod of stripe.products.list({ limit: 100, active: true })) {
    await stripe.products.update(prod.id, { active: false });
    prodCount++;
    console.log(`  Archived product ${prod.id}`);
  }
  console.log(`Archived ${prodCount} products`);

  // 5. Verify
  console.log('\n=== Verification ===');
  const custs = await stripe.customers.list({ limit: 1 });
  const activePrices = await stripe.prices.list({ limit: 1, active: true });
  const activeProds = await stripe.products.list({ limit: 1, active: true });

  let activeSubs = 0;
  for await (const s of stripe.subscriptions.list({ limit: 100, status: 'all' })) {
    if (s.status !== 'canceled') activeSubs++;
  }

  console.log(`Customers: ${custs.data.length === 0 ? '0 OK' : 'STILL HAVE CUSTOMERS'}`);
  console.log(`Active subs: ${activeSubs === 0 ? '0 OK' : 'STILL HAVE SUBS'}`);
  console.log(`Active prices: ${activePrices.data.length === 0 ? '0 OK' : 'STILL HAVE PRICES'}`);
  console.log(`Active products: ${activeProds.data.length === 0 ? '0 OK' : 'STILL HAVE PRODUCTS'}`);
}

main().catch(e => { console.error(e); process.exit(1); });
