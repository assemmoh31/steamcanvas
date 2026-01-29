const https = require('https');

console.log('Testing connectivity to Steam OpenID...');

const options = {
    hostname: 'steamcommunity.com',
    port: 443,
    path: '/openid',
    method: 'GET',
    timeout: 5000
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301) {
        console.log('✅ SUCCESS: Connected to steamcommunity.com');
    } else {
        console.log('⚠️ WARNING: Unexpected status code');
    }
});

req.on('error', (e) => {
    console.error(`❌ ERROR: Could not connect to Steam. Details: ${e.message}`);
    // Specific hint for common issues
    if (e.code === 'ETIMEDOUT') {
        console.error('Hint: Check your internet connection or firewall/proxy settings.');
    }
});

req.end();
