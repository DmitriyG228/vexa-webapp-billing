// Quick test to debug admin API connection issues
require('dotenv').config();

const ADMIN_API_URL = process.env.ADMIN_API_URL;
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;

console.log('Environment check:');
console.log('ADMIN_API_URL:', ADMIN_API_URL);
console.log('ADMIN_API_TOKEN exists:', !!ADMIN_API_TOKEN);

const testUrl = `${ADMIN_API_URL}/admin/users`;
console.log('Full URL:', testUrl);

const https = require('https');
const url = require('url');

const parsedUrl = url.parse(testUrl);
console.log('Parsed URL:', {
  protocol: parsedUrl.protocol,
  hostname: parsedUrl.hostname,
  port: parsedUrl.port,
  path: parsedUrl.path
});

// Test with Node.js https module
const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 443,
  path: parsedUrl.path,
  method: 'GET',
  headers: {
    'X-Admin-API-Key': ADMIN_API_TOKEN,
    'Content-Type': 'application/json'
  },
  timeout: 10000
};

console.log('HTTPS options:', options);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response length:', data.length);
    if (data.length < 200) {
      console.log('Response:', data);
    } else {
      console.log('Response (first 200 chars):', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  console.error('Error details:', error);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
});

req.end();
