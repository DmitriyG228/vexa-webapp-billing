const Stripe = require('/home/dima/dev/vexa-webapp-billing/apps/webapp/node_modules/stripe');
if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  // Product 1: Bot subscription
  console.log('=== Creating Product 1: Bot subscription ===');
  const prod1 = await stripe.products.create({ name: 'Bot subscription' });
  console.log(`Created product: ${prod1.id}`);

  // Price for Product 1: Startup - tiered graduated recurring monthly
  const price1 = await stripe.prices.create({
    product: prod1.id,
    nickname: 'Startup',
    currency: 'usd',
    recurring: { interval: 'month', usage_type: 'licensed' },
    billing_scheme: 'tiered',
    tiers_mode: 'graduated',
    tiers: [
      { up_to: 1, unit_amount: 1200 },
      { up_to: 2, unit_amount: 3600 },
      { up_to: 5, unit_amount: 2400 },
      { up_to: 50, unit_amount: 2000 },
      { up_to: 200, unit_amount: 1500 },
      { up_to: 'inf', unit_amount: 1000 },
    ],
  });
  console.log(`Created price: ${price1.id} (${price1.nickname})`);

  // Set default price
  await stripe.products.update(prod1.id, { default_price: price1.id });
  console.log(`Set default price on product`);

  // Product 2: Transcription Minutes
  console.log('\n=== Creating Product 2: Transcription Minutes ===');
  const prod2 = await stripe.products.create({ name: 'Transcription Minutes (Pay-as-you-go)' });
  console.log(`Created product: ${prod2.id}`);

  const price2 = await stripe.prices.create({
    product: prod2.id,
    currency: 'usd',
    unit_amount: 500,
    metadata: {
      minimum_purchase: 'true',
      minutes: '3333',
      price_per_minute: '0.0015',
    },
  });
  console.log(`Created price: ${price2.id}`);

  // Set default price
  await stripe.products.update(prod2.id, { default_price: price2.id });

  // Verify
  console.log('\n=== Verification ===');
  const retrievedPrice1 = await stripe.prices.retrieve(price1.id, { expand: ['tiers'] });
  console.log('Startup price tiers:');
  for (const t of retrievedPrice1.tiers) {
    console.log(`  up_to=${t.up_to === null ? 'inf' : t.up_to}, unit_amount=${t.unit_amount}`);
  }
  console.log(`\nTranscription price: unit_amount=${price2.unit_amount}, metadata=${JSON.stringify(price2.metadata)}`);

  // Output IDs for next step
  console.log(`\n=== IDs for Step 3 ===`);
  console.log(`STARTUP_PRICE_ID=${price1.id}`);
  console.log(`PROD1_ID=${prod1.id}`);
  console.log(`PROD2_ID=${prod2.id}`);
  console.log(`PRICE2_ID=${price2.id}`);
}

main().catch(e => { console.error(e); process.exit(1); });
