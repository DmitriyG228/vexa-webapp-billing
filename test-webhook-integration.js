#!/usr/bin/env node

const crypto = require('crypto');

// Test webhook data simulating a subscription creation
const webhookPayload = {
  id: "evt_test_webhook_integration",
  object: "event",
  api_version: "2020-08-27",
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: "sub_test_integration",
      object: "subscription",
      customer: "cus_test_integration",
      status: "active",
      items: {
        data: [
          {
            id: "si_test_integration", 
            quantity: 5
          }
        ]
      },
      metadata: {
        userId: "116",
        userEmail: "test@integration.com",
        tier: "startup"
      },
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      current_period_start: Math.floor(Date.now() / 1000),
      trial_end: null,
      trial_start: null,
      cancel_at_period_end: false,
      canceled_at: null,
      cancel_at: null
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: "req_test_integration",
    idempotency_key: null
  },
  type: "customer.subscription.created"
};

// Create signature using webhook secret from .env
const webhookSecret = "whsec_WBxQr8k9mhSdVG1aH1Lox8OEW33ZpTkt";
const timestamp = Math.floor(Date.now() / 1000);
const payloadString = JSON.stringify(webhookPayload);

// Create signature like Stripe does
const payload = `${timestamp}.${payloadString}`;
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload, 'utf8')
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('🧪 Testing webhook integration...');
console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));
console.log('🔐 Signature:', stripeSignature);

// Send webhook to billing service
const https = require('http');

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

const req = https.request(options, (res) => {
  console.log(`\n📊 Response Status: ${res.statusCode}`);
  console.log('📋 Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📨 Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook processed successfully!');
      console.log('\n🔍 Now checking if user was updated...');
      
      // Check if user was updated
      const checkOptions = {
        hostname: 'localhost',
        port: 18057,
        path: '/admin/users/116',
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'token'
        }
      };
      
      const checkReq = https.request(checkOptions, (checkRes) => {
        let checkData = '';
        checkRes.on('data', (chunk) => {
          checkData += chunk;
        });
        
        checkRes.on('end', () => {
          console.log('👤 Updated User Data:', JSON.parse(checkData));
          
          if (checkData.includes('"max_concurrent_bots":5')) {
            console.log('🎉 SUCCESS: Bot count was updated to 5!');
          } else {
            console.log('❌ ISSUE: Bot count was not updated');
          }
        });
      });
      
      checkReq.on('error', (err) => {
        console.error('❌ Error checking user:', err.message);
      });
      
      checkReq.end();
    } else {
      console.log('❌ Webhook failed');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

req.write(payloadString);
req.end();
