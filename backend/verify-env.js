const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('--- ENV CHECK ---');
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.log('✅ SUCCESS: STRIPE_SECRET_KEY is loaded correctly.');
    console.log('Key starts with:', process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...');
} else {
    console.log('❌ ERROR: STRIPE_SECRET_KEY is MISSING or incorrect.');
}
console.log('-----------------');
