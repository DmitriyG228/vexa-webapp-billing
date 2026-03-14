const Stripe = require('/home/dima/dev/vexa-webapp-billing/apps/webapp/node_modules/stripe');
if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY env var'); process.exit(1); }
const test = new Stripe(process.env.STRIPE_SECRET_KEY);

// Expected balances from live
const expectedBalances = {
  'spadjv@gmail.com': -22800,
  '2280905@gmail.com': -964271,
  'dany@vividstudio.me': -6400,
  'hireninjasite@gmail.com': -1600,
  'alvarezneibel.23@gmail.com': -206,
};

async function main() {
  for (const [email, expectedBalance] of Object.entries(expectedBalances)) {
    const custs = await test.customers.list({ email, limit: 1 });
    if (custs.data.length === 0) {
      console.log(`NOT FOUND: ${email}`);
      continue;
    }
    const cust = custs.data[0];
    if (cust.balance !== expectedBalance) {
      await test.customers.update(cust.id, { balance: expectedBalance });
      console.log(`Fixed ${email}: ${cust.balance} -> ${expectedBalance}`);
    } else {
      console.log(`OK: ${email} = ${expectedBalance}`);
    }
  }

  // Verify all balances
  console.log('\n=== Balance verification ===');
  for await (const cust of test.customers.list({ limit: 100 })) {
    if (cust.balance !== 0) {
      const expected = expectedBalances[cust.email];
      const match = cust.balance === expected ? 'OK' : `MISMATCH (want ${expected})`;
      console.log(`  ${cust.email}: ${cust.balance} ${match}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
