import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

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

export const getUploadUrl = async (fileName, fileType, isPrivate = false) => {
    const folder = isPrivate ? 'private' : 'public';
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return { url, key };
    } catch (error) {
        console.error('Error generating upload URL:', error);
        throw error;
    }
};

export const getDownloadUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
        return url;
    } catch (error) {
        console.error('Error generating download URL:', error);
        throw error;
    }
};

export const deleteFileFromR2 = async (key) => {
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
    }
};

export const getPublicUrl = (key) => {
    const PUBLIC_DEV_URL = 'https://pub-f5a17edcae7d46f6b374e0a8e6df4bb0.r2.dev';
    return `${PUBLIC_DEV_URL}/${key}`;
};

export { s3Client, R2_BUCKET_NAME, R2_ACCOUNT_ID };
