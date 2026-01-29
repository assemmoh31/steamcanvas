
const { getDownloadUrl, s3Client } = require('./config/r2');
require('dotenv').config();

async function test() {
    console.log("Testing R2 Download URL Generation...");
    console.log("Bucket:", process.env.R2_BUCKET_NAME ? "Set" : "MISSING");
    console.log("Account:", process.env.R2_ACCOUNT_ID ? "Set" : "MISSING");
    console.log("Access Key:", process.env.R2_ACCESS_KEY_ID ? "Set" : "MISSING");
    console.log("Secret Key:", process.env.R2_SECRET_ACCESS_KEY ? "Set" : "MISSING");

    const testKey = 'private/1769602028645-steamcanvas---premium-steam-customization.zip';

    try {
        const url = await getDownloadUrl(testKey);
        console.log("SUCCESS! Generated URL:");
        console.log(url);
    } catch (err) {
        console.error("FAILED to generate URL:", err);
    }
}

test();
