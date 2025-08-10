#!/usr/bin/env node

const crypto = require('crypto');
const http = require('http');

// Test with a simple webhook to see exact error details
const testPayload = {
  id: "evt_debug_test",
  type: "customer.subscription.updated", 
  data: { object: { id: "sub_test", customer: "cus_test" } }
};

const webhookSecret = "whsec_WBxQr8k9mhSdVG1aH1Lox8OEW33ZpTkt";
const timestamp = Math.floor(Date.now() / 1000);
const payloadString = JSON.stringify(testPayload);
const payload = `${timestamp}.${payloadString}`;
const signature = crypto.createHmac('sha256', webhookSecret).update(payload, 'utf8').digest('hex');
const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('🔍 Debugging webhook signature validation...');
console.log('🕐 Timestamp:', timestamp);
console.log('📝 Payload:', payloadString);
console.log('🔐 Signature:', stripeSignature);

const options = {
  hostname: 'localhost',
  port: 19000,
  path: '/v1/stripe/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
    'Content-Length': Buffer.byteLength(payloadString)
  }
};

const req = http.request(options, (res) => {
  console.log(`\n📊 Status: ${res.statusCode}`);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('📨 Response:', data);
    
    if (res.statusCode === 400) {
      console.log('\n❌ 400 Error Details:');
      try {
        const error = JSON.parse(data);
        console.log('   Detail:', error.detail || error.message || error);
      } catch (e) {
        console.log('   Raw:', data);
      }
    } else {
      console.log('✅ Success!');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

req.write(payloadString);
req.end();
