const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

/**
 * Generate a presigned URL for uploading a file to R2
 * @param {string} fileName - The name of the file to upload
 * @param {string} fileType - The content type of the file
 * @param {boolean} isPrivate - Whether the file should be in the private folder
 * @returns {Promise<{url: string, key: string}>}
 */
const getUploadUrl = async (fileName, fileType, isPrivate = false) => {
    const folder = isPrivate ? 'private' : 'public';
    // Clean filename to avoid issues
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        // ACL: isPrivate ? 'private' : 'public-read' // R2 doesn't always strictly enforce S3 ACLs the same way, but good practice
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return { url, key };
    } catch (error) {
        console.error('Error generating upload URL:', error);
        throw error;
    }
};

/**
 * Generate a presigned URL for downloading a private file from R2
 * @param {string} key - The R2 key of the file
 * @returns {Promise<string>}
 */
const getDownloadUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
        return url;
    } catch (error) {
        console.error('Error generating download URL:', error);
        throw error;
    }
};

/**
 * Delete a file from R2
 * @param {string} key - The R2 key of the file to delete
 */
const deleteFileFromR2 = async (key) => {
    if (!key) return;
    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key
    });
    try {
        await s3Client.send(command);
        console.log(`Deleted file from R2: ${key}`);
    } catch (error) {
        console.error(`Error deleting file ${key} from R2:`, error);
        // Don't throw, just log. We still want to delete the DB record.
    }
};

/**
 * Get the public URL for a file in R2
 * @param {string} key - The R2 key of the file
 * @returns {string}
 */
const getPublicUrl = (key) => {
    const PUBLIC_DEV_URL = 'https://pub-f5a17edcae7d46f6b374e0a8e6df4bb0.r2.dev';
    return `${PUBLIC_DEV_URL}/${key}`;
};

module.exports = { getUploadUrl, getDownloadUrl, deleteFileFromR2, getPublicUrl, s3Client, R2_BUCKET_NAME, R2_ACCOUNT_ID };
