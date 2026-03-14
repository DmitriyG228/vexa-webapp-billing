const Stripe = require('/home/dima/dev/vexa-webapp-billing/apps/webapp/node_modules/stripe');
if (!process.env.LIVE_KEY || !process.env.TEST_KEY) { console.error('Set LIVE_KEY and TEST_KEY env vars'); process.exit(1); }
const live = new Stripe(process.env.LIVE_KEY);
const test = new Stripe(process.env.TEST_KEY);

const TEST_PRICE_ID = 'price_1TAp8sFKEqzvZq6xORqoKlxP';

// Special cases
const DUPLICATE_EMAIL = '2280905@gmail.com';
const TRIALING_EMAILS = ['dev@arehsoft.com', 'camerontarget@gmail.com'];
const PAST_DUE_EMAILS = ['gtracer5642@gmail.com'];

async function main() {
  // Read ALL live subscriptions
  console.log('=== Reading live subscriptions ===');
  const liveSubs = [];
  for await (const sub of live.subscriptions.list({ limit: 100, status: 'all', expand: ['data.customer'] })) {
    if (sub.status === 'canceled') continue; // skip canceled
    const cust = sub.customer;
    const qty = sub.items.data[0]?.quantity || 1;
    liveSubs.push({
      email: cust.email,
      balance: cust.balance,
      customerId: cust.id,
      quantity: qty,
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
    });
    console.log(`  ${cust.email} | qty=${qty} | status=${sub.status} | cancel_at_end=${sub.cancel_at_period_end} | balance=${cust.balance} | cust=${cust.id}`);
  }
  console.log(`\nTotal live subs: ${liveSubs.length}`);

  // Deduplicate 2280905@gmail.com - keep the one with balance=-964271
  const deduped = [];
  let seenDuplicate = false;
  for (const s of liveSubs) {
    if (s.email === DUPLICATE_EMAIL) {
      if (seenDuplicate) {
        console.log(`\nSkipping duplicate ${s.email} (cust=${s.customerId}, balance=${s.balance})`);
        continue;
      }
      // Find the right one (balance=-964271, qty=2)
      const allDupes = liveSubs.filter(x => x.email === DUPLICATE_EMAIL);
      const correct = allDupes.find(x => x.balance === -964271) || allDupes[0];
      if (s === correct) {
        seenDuplicate = true;
        deduped.push({ ...s, balance: -964271, quantity: 2 }); // force correct values
      } else {
        console.log(`\nSkipping duplicate ${s.email} (cust=${s.customerId}, balance=${s.balance})`);
        seenDuplicate = true;
        // Push the correct one
        deduped.push({ ...correct, balance: -964271, quantity: 2 });
      }
    } else {
      deduped.push(s);
    }
  }

  console.log(`\nAfter dedup: ${deduped.length} customers to create`);

  // Create in test
  console.log('\n=== Creating test customers and subscriptions ===');
  const results = [];
  for (const s of deduped) {
    try {
      // Create customer
      const cust = await test.customers.create({ email: s.email });

      // Create and attach payment method
      const pm = await test.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } });
      await test.paymentMethods.attach(pm.id, { customer: cust.id });
      await test.customers.update(cust.id, {
        invoice_settings: { default_payment_method: pm.id },
      });

      // Set balance if non-zero
      if (s.balance !== 0) {
        await test.customers.update(cust.id, { balance: s.balance });
      }

      // Create subscription
      const subParams = {
        customer: cust.id,
        items: [{ price: TEST_PRICE_ID, quantity: s.quantity }],
        default_payment_method: pm.id,
      };

      // Trialing
      if (TRIALING_EMAILS.includes(s.email)) {
        subParams.trial_period_days = 30;
      }

      const sub = await test.subscriptions.create(subParams);

      // cancel_at_period_end
      if (s.cancel_at_period_end) {
        await test.subscriptions.update(sub.id, { cancel_at_period_end: true });
      }

      const finalSub = await test.subscriptions.retrieve(sub.id);
      results.push({
        email: s.email,
        testCustId: cust.id,
        testSubId: sub.id,
        quantity: s.quantity,
        status: finalSub.status,
        cancel_at_period_end: finalSub.cancel_at_period_end,
        balance: s.balance,
      });
      console.log(`  OK: ${s.email} | qty=${s.quantity} | cancel_end=${s.cancel_at_period_end} | balance=${s.balance} | status=${finalSub.status}`);
    } catch (e) {
      console.log(`  FAIL: ${s.email} — ${e.message}`);
    }
  }

  console.log(`\n=== Created ${results.length} customers/subscriptions ===`);

  // Output summary
  console.log('\n=== RESULTS SUMMARY ===');
  console.log(`Total: ${results.length}`);
  console.log(`Cancel at period end: ${results.filter(r => r.cancel_at_period_end).length}`);
  console.log(`With credit balance: ${results.filter(r => r.balance < 0).length}`);
  console.log(`Trialing: ${results.filter(r => r.status === 'trialing').length}`);
  console.log('\nAll entries:');
  for (const r of results) {
    console.log(`  ${r.email} | qty=${r.quantity} | status=${r.status} | cancel_end=${r.cancel_at_period_end} | balance=${r.balance}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
