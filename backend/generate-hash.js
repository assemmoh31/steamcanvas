const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
    console.error("Usage: node generate-hash.js <YOUR_PASSWORD>");
    console.error("Example: node generate-hash.js MySecretPass123");
    process.exit(1);
}

const saltRounds = 10;
console.log("Generating hash. Please wait...");
const hash = bcrypt.hashSync(password, saltRounds);

console.log("\nSUCCESS! Here is your secure hash:\n");
console.log(hash);
console.log("\n---------------------------");
console.log("INSTRUCTIONS:");
console.log("1. Copy the long bracketed text above (starts with $2b$).");
console.log("2. Open 'backend/.env'.");
console.log("3. Create or update the line: ADMIN_PASSWORD_HASH='<PASTE_HERE>'");
console.log("4. Restart the backend server.");
