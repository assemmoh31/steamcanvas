const express = require('express');
const { PrismaClient } = require('@prisma/client'); // Removed
const { prisma, connectWithRetry } = require('./config/db');
const session = require('express-session');
const cors = require('cors');
const passport = require('./config/passport');
const { getUploadUrl, getDownloadUrl, deleteFileFromR2, getPublicUrl } = require('./config/r2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path'); // Added for static assets
require('dotenv').config();

// --- STEAM OPENID FIX: Monkeypatch HTTPS to include User-Agent ---
// Steam's WAF (Web Application Firewall) now requires a User-Agent for OpenID verification.
// The 'openid' library used by 'passport-steam' does not send one by default.
const https = require('https');
const originalRequest = https.request;
https.request = function (options, callback) {
    // Ensure options is an object or convert url to options
    if (typeof options === 'string') {
        const url = new URL(options);
        options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {}
        };
    }

    // Ensure headers object exists
    if (!options.headers) {
        options.headers = {};
    }

    // Inject User-Agent if missing
    if (!options.headers['User-Agent']) {
        console.log("MONKEYPATCH: Adding User-Agent to request for host:", options.hostname || options.host);
        // Use a standard browser User-Agent to avoid Steam WAF blocking
        options.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    return originalRequest.call(this, options, callback);
};
// -----------------------------------------------------------------

// Stripe Setup
if (!process.env.STRIPE_SECRET_KEY) throw new Error("CRITICAL: STRIPE_SECRET_KEY is missing!");

let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    } else {
        console.warn('STRIPE_SECRET_KEY missing in .env');
    }
} catch (e) {
    console.error('Failed to initialize Stripe:', e);
}

const STRIPE_CREDIT_PACK_PRICE_ID = 'price_1SrdFnB6E1YpG6WgdLPRnidC';

console.log("SERVER BOOTING UP...");
console.log("SERVER_ID: " + Math.random().toString(36).substring(7));

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    next();
});
// Database Connection
connectWithRetry();

// Global Error Handling
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    // Keep running if possible, or exit cleanly
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            FRONTEND_URL,
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];

        // Also allow local network IPs for testing on other devices
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// CSP Adjustment: Security Headers
// CSP Adjustment: Relaxed for Development & Steam
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "connect-src 'self' http://localhost:* ws://localhost:* https://steamcommunity.com https://*.r2.cloudflarestorage.com; " +
        "img-src 'self' http://localhost:* https://*.r2.cloudflarestorage.com https://steamcdn-a.akamaihd.net https://avatars.steamstatic.com data: blob:; " +
        "media-src 'self' http://localhost:* https://*.r2.cloudflarestorage.com data: blob:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://steamcommunity.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:;"
    );
    next();
});

// DevTools Noise Reduction
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.sendStatus(404); // Or 200 with empty json, 404 is fine to stop it
});

// Use JSON parser for all routes except Stripe Webhook
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key',
    resave: false,
    saveUninitialized: true, // Required for Passport to work correctly with Steam OpenID
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true if https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes

// 1. Health Check
app.get('/', (req, res) => {
    res.send('SteamCanvas API is running');
});



// 2. Auth Routes
// 2. Auth Routes
// Error Handling: Wrap Steam Auth to catch Discovery/Network errors
app.get('/api/auth/steam', (req, res, next) => {
    passport.authenticate('steam', (err, user, info) => {
        if (err) {
            console.error('Steam Auth Error:', err);
            return res.status(500).json({
                error: 'Steam Authentication Failed',
                details: 'Could not connect to Steam. Please try again later.'
            });
        }
        if (!user) {
            return res.redirect('/');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/api/auth/steam/return',
    (req, res, next) => {
        console.log('DEBUG: Steam Return Hit');
        console.log('Query:', req.query);
        console.log('Body:', req.body); // Should be populated if urlencoded works
        next();
    },
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to frontend.
        res.redirect(`${FRONTEND_URL}/dashboard`);
    }
);

app.get('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(FRONTEND_URL);
    });
});

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.warn("Auth Check Failed. SessionID:", req.sessionID, "User:", req.user);
    res.status(401).json({ error: 'Please log in to continue' });
}

// 3. User Route
app.get('/api/me', ensureAuthenticated, async (req, res) => {
    // req.user already contains the full user object from the database due to deserializeUser
    // However, deserializeUser might not include relations depending on how it's implemented in passport.js
    // Let's re-fetch to be safe and include purchases

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                purchases: {
                    select: { artworkId: true }
                }
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const { id, steamId, displayName, avatarUrl, walletBalance, artistLevel, purchases } = user;

        res.header('Cache-Control', 'no-store'); // Force fresh data
        res.json({
            id,
            steamId,
            displayName,
            avatarUrl,
            walletBalance,
            artistLevel,
            purchases: purchases.map(p => p.artworkId) // Return simple array of IDs
        });
    } catch (e) {
        console.error("Me Route Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3.5 Vault Route
app.get('/api/user/vault', ensureAuthenticated, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                purchases: {
                    include: {
                        artwork: {
                            include: {
                                artist: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        // Transform data for frontend
        const vaultItems = user.purchases.map(p => ({
            ...p.artwork,
            artist: p.artwork.artist.displayName,
            artistAvatar: p.artwork.artist.avatarUrl,
            purchasedAt: p.purchasedAt
        }));

        res.json({ vault: vaultItems });
    } catch (error) {
        console.error("Vault Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3.6 Profile Route
app.get('/api/user/profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                purchases: {
                    include: {
                        artwork: {
                            include: {
                                artist: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        // Transform data
        const collection = user.purchases.map(p => ({
            ...p.artwork,
            artist: p.artwork.artist.displayName,
            artistAvatar: p.artwork.artist.avatarUrl,
            purchasedAt: p.purchasedAt,
            likes: 0 // Mock for now
        }));

        res.json({
            user: {
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                artistLevel: user.artistLevel,
                walletBalance: user.walletBalance
            },
            collection
        });
    } catch (error) {
        console.error("Profile Data Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. R2 Upload Route
// 4. R2 Upload Route
app.get('/api/upload/url', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { fileName, fileType, usePrivate } = req.query;

    if (!fileName || !fileType) {
        return res.status(400).json({ error: 'Missing fileName or fileType' });
    }

    try {
        const isPrivate = usePrivate === 'true';
        const { url, key } = await getUploadUrl(fileName, fileType, isPrivate);
        res.json({ url, key });
    } catch (error) {
        console.error('Upload URL Error:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

// 5. Artwork Routes

// Publish GIF Artwork
// Publish GIF Artwork
app.post('/api/artworks/publish', ensureAuthenticated, async (req, res) => {
    const { r2Key, title, description, price, fileSize, zipKey } = req.body;

    const isGif = r2Key.endsWith('.gif');
    const isWebP = r2Key.endsWith('.webp');
    const isWebM = r2Key.endsWith('.webm');

    if (!isGif && !isWebP && !isWebM) {
        return res.status(400).json({ error: 'Invalid file format. Must be .gif, .webp, or .webm' });
    }

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const user = req.user;
        // Elite Logic: Artist Level 3+ gets auto-verified
        const isVerified = user.artistLevel >= 3;

        // Use the centralized getPublicUrl logic to generate the accessible URL using the Cloudflare public dev domain
        const imageUrl = getPublicUrl(r2Key);

        const artwork = await prisma.artwork.create({
            data: {
                title,
                description,
                r2Key,
                imageUrl, // Storing constructed URL
                fileType: 'image/gif',
                fileSize: fileSize ? parseInt(fileSize) : 0,
                price: parseFloat(price) || 0,
                isVerified: isVerified,
                artistId: user.id,
                downloadPath: zipKey || null // Store the private key in downloadPath
            }
        });

        res.json(artwork);
    } catch (error) {
        console.error('Publish Error:', error);
        res.status(500).json({ error: 'Failed to publish artwork' });
    }
});

// Gallery Feedback API
app.get('/api/artworks', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    try {
        const [rawArtworks, total] = await prisma.$transaction([
            prisma.artwork.findMany({
                where: { status: 'APPROVED' },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    artist: {
                        select: {
                            displayName: true,
                            avatarUrl: true,
                            artistLevel: true
                        }
                    }
                }
            }),
            prisma.artwork.count({
                where: { status: 'APPROVED' }
            })
        ]);

        // Logic Stabilization: Safe Mapping & WebM Handling
        const artworks = rawArtworks.map(art => {
            try {
                let imageUrl = art.imageUrl;
                let previewUrl = art.imageUrl; // Default preview to image
                let webmUrl = null;

                // 1. Null/Fallback Check
                if (!imageUrl) {
                    console.warn(`Artwork ${art.id} missing imageUrl, using placeholder.`);
                    imageUrl = '/assets/placeholder.png';
                    previewUrl = '/assets/placeholder.png';
                }

                // 2. WebM/GIF Logic
                // If it's a GIF, try to provide a WebM alternative if conventions are followed
                if (art.r2Key && (art.r2Key.endsWith('.gif') || art.fileType === 'image/gif')) {
                    // Construct WebM key assuming same path but different extension
                    // This is a "soft" check; we don't verify existence here to save latency,
                    // but the frontend should handle 404s on the video tag gracefully.
                    const webmKey = art.r2Key.replace(/\.gif$/i, '.webm');
                    webmUrl = getPublicUrl(webmKey);
                }

                return {
                    ...art,
                    imageUrl,
                    previewUrl,
                    webmUrl,
                    // Ensure numeric values are safe
                    price: Number(art.price) || 0,
                };
            } catch (innerError) {
                console.error(`Failed to map artwork ${art.id}:`, innerError);
                // Return safe fallback object
                return {
                    ...art,
                    imageUrl: '/assets/placeholder.png',
                    previewUrl: '/assets/placeholder.png',
                    error: true
                };
            }
        });

        res.json({
            artworks,
            pagination: {
                page,
                limit,
                total,
                hasMore: (skip + artworks.length) < total
            }
        });
    } catch (error) {
        console.error('Gallery Error:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// 8. Payment Routes (Stripe)

const CREDIT_TIERS = {
    'starter': { price: 500, credits: 500, name: 'Starter Pack (500 Coins)' }, // $5.00
    'pro': { price: 1000, credits: 1200, name: 'Pro Pack (1,200 Coins)' },      // $10.00
    'elite': { price: 2000, credits: 3000, name: 'Elite Pack (3,000 Coins)' }   // $20.00
};

app.post('/api/payments/create-checkout-session', ensureAuthenticated, async (req, res) => {
    // DIAGNOSTIC LOGGING
    console.log("------------------------------------------");
    console.log("PAYMENT INITIATED");
    console.log("User in Request:", req.user ? `${req.user.displayName} (${req.user.id})` : "UNDEFINED / NULL");
    console.log("Session ID:", req.sessionID);
    console.log("Request Body:", req.body);
    console.log("------------------------------------------");

    if (!req.user) {
        console.error("CRITICAL: Payment attempted without authenticated user.");
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const { tierId } = req.body; // Expecting 'starter', 'pro', or 'elite'

    const tier = CREDIT_TIERS[tierId];
    if (!tier) {
        console.error(`Invalid Tier ID: ${tierId}`);
        return res.status(400).json({ error: 'Invalid tier selected' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: tier.name,
                            description: `Add ${tier.credits} coins to your wallet`,
                        },
                        unit_amount: tier.price, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/dashboard?payment=success`,
            cancel_url: `${FRONTEND_URL}/shop?payment=cancelled`, // Redirect back to shop
            metadata: {
                userId: req.user.id,
                tierId: tierId,
                credits: tier.credits.toString()
            },
        });

        console.log("Stripe Session Created URL:", session.url);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});

// Stripe Webhook
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log("WEBHOOK RECEIVED AT " + new Date().toISOString());

    if (!stripe) {
        console.error('Stripe not configured - webhook ignored');
        return res.status(500).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log("Processing session for ID:", session.id);
        console.log("Metadata:", session.metadata);

        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits);

        if (userId && credits) {
            try {
                // Find User
                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (user) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { walletBalance: { increment: credits } }
                    });

                    // Record Deposit Transaction
                    await prisma.transaction.create({
                        data: {
                            amount: session.amount_total / 100, // Convert cents to dollars
                            type: 'DEPOSIT',
                            status: 'COMPLETED',
                            buyerId: userId,
                        }
                    });

                    console.log(`SUCCESS: Added ${credits} credits to user ${userId}`);
                } else {
                    console.error(`User not found for ID: ${userId}`);
                }
            } catch (error) {
                console.error('Error fulfilling webhook:', error);
            }
        } else {
            console.error("Missing userId or credits in metadata");
        }
    }

    res.json({ received: true });
});
console.log("SUCCESS: Webhook route initialized at /api/payments/webhook");

// -----------------------------------------------------------------
// CLOUDFLARE WORKER ADAPTER
// Express doesn't natively support the Worker 'fetch' export.
// We are exporting a default object that satisfies the Worker runtime.
// Note: You might need a specific adapter library to fully proxy Express requests.
// -----------------------------------------------------------------

export default {
    async fetch(request, env, ctx) {
        // Simple fallback response to verify the worker is running.
        // To fully run Express here, we'd need to convert 'request' (Web Standard)
        // to 'req' (Node stream) and vice-versa for the response.
        return new Response("SteamCanvas Backend is Running on Cloudflare Workers!", {
            headers: { "content-type": "text/plain" }
        });
    }
};

// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// 6. Admin Middleware & Routes

const ADMIN_STEAM_ID = process.env.ADMIN_STEAM_ID;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: Double-Lock Security Identity
function verifyAdminIdentity(req, res, next) {
    // 1. First Lock: Steam Identity Check
    if (!req.isAuthenticated() || req.user.steamId !== ADMIN_STEAM_ID) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    // 2. Second Lock: Session Token Check (Cookie)
    const token = req.cookies.admin_session;
    if (!token) {
        return res.status(401).json({ error: 'Security Challenge Required' });
    }

    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Session Invalid' });
    }
}

// Route: Security Gate Challenge
app.post('/api/admin/verify-gate', ensureAuthenticated, async (req, res) => {
    // Identity Check again just to be safe
    if (req.user.steamId !== ADMIN_STEAM_ID) return res.status(403).send();

    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (match) {
        const token = jwt.sign({ steamId: req.user.steamId, role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });

        res.cookie('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours
        });

        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid Credentials' });
    }
});

// Route: Security Gate Logout (Clear Admin Session)
app.post('/api/admin/logout-gate', ensureAuthenticated, (req, res) => {
    res.clearCookie('admin_session');
    res.json({ success: true });
});

// Admin: Get Review Queue
app.get('/api/admin/queue', verifyAdminIdentity, async (req, res) => {
    try {
        const queue = await prisma.artwork.findMany({
            where: { status: 'PENDING' },
            include: {
                artist: {
                    select: { displayName: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ queue });
    } catch (error) {
        console.error('Queue Error:', error);
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
});

// Admin: Verify Artwork
app.patch('/api/admin/verify/:artworkId', verifyAdminIdentity, async (req, res) => {
    const { artworkId } = req.params;
    try {
        const artwork = await prisma.artwork.update({
            where: { id: artworkId },
            data: {
                isVerified: true,
                status: 'APPROVED'
            }
        });
        res.json({ message: 'Artwork approved', artwork });
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ error: 'Failed to verify artwork' });
    }
});

// { deleteFileFromR2 } already imported at top

// Admin: Reject Artwork
app.delete('/api/admin/reject/:artworkId', verifyAdminIdentity, async (req, res) => {
    const { artworkId } = req.params;
    try {
        const artwork = await prisma.artwork.findUnique({ where: { id: artworkId } });
        if (!artwork) return res.status(404).json({ error: 'Artwork not found' });

        // Delete from R2
        if (artwork.r2Key) {
            await deleteFileFromR2(artwork.r2Key);
        }
        if (artwork.downloadPath) {
            await deleteFileFromR2(artwork.downloadPath);
        }

        await prisma.artwork.delete({ where: { id: artworkId } });
        res.json({ message: 'Artwork rejected and files deleted' });
    } catch (error) {
        console.error('Reject Error:', error);
        res.status(500).json({ error: 'Failed to reject artwork' });
    }
});

// Admin: Grant Credits (The Vault - Admin Mode)
app.post('/api/admin/grant-credits', verifyAdminIdentity, async (req, res) => {
    const { steamId, amount } = req.body;

    if (!steamId || !amount) {
        return res.status(400).json({ error: 'Missing steamId or amount' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { steamId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { steamId },
            data: { walletBalance: { increment: parseFloat(amount) } }
        });

        // Record Transaction
        await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type: 'ADMIN_GRANT',
                buyerId: user.id, // In this case, buyer is the receiver of the grant
            }
        });

        res.json({ message: 'Credits granted', balance: updatedUser.walletBalance });
    } catch (error) {
        console.error('Grant Credits Error:', error);
        res.status(500).json({ error: 'Failed to grant credits' });
    }
});

// 7. Economy Routes (The Vault)

// 7. Economy Routes (The Vault)

// Secure Download Route
app.get('/api/items/download/:itemId', ensureAuthenticated, async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Verify Ownership
        const purchase = await prisma.purchase.findFirst({
            where: {
                userId: userId,
                artworkId: itemId
            },
            include: {
                artwork: true
            }
        });

        if (!purchase) {
            return res.status(403).json({ error: 'Access Denied: You do not own this item.' });
        }

        const artwork = purchase.artwork;

        // Use downloadPath as the R2 Key for the private file
        if (!artwork.downloadPath) {
            console.error(`Download Error: Artwork ${itemId} has no downloadPath`);
            return res.status(404).json({ error: 'Asset not found or not available for download.' });
        }

        console.log(`Generating presigned URL for key: ${artwork.downloadPath}`);

        // 2. Generate Presigned Download URL
        const downloadUrl = await getDownloadUrl(artwork.downloadPath);

        // 3. Return Presigned URL
        res.status(200).json({ url: downloadUrl });

    } catch (error) {
        console.error("Download Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Purchase Artwork
app.post('/api/items/purchase/:itemId', ensureAuthenticated, async (req, res) => {
    const { itemId } = req.params;
    const buyer = req.user;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Get Artwork & Check Price
            const artwork = await prisma.artwork.findUnique({
                where: { id: itemId }
            });

            if (!artwork) {
                throw new Error('Artwork/Item not found');
            }

            // Check if already purchased (optional but good practice)
            const existingPurchase = await prisma.purchase.findFirst({
                where: {
                    userId: buyer.id,
                    artworkId: artwork.id
                }
            });

            if (existingPurchase) {
                throw new Error('You already own this item');
            }

            // Check funds
            if (buyer.walletBalance < artwork.price) {
                throw new Error('Insufficient balance');
            }

            // 2. Deduct from Buyer
            const updatedBuyer = await prisma.user.update({
                where: { id: buyer.id },
                data: { walletBalance: { decrement: artwork.price } }
            });

            // 3. Create Purchase Record (Unlock Item)
            const purchase = await prisma.purchase.create({
                data: {
                    userId: buyer.id,
                    artworkId: artwork.id,
                    pricePaid: artwork.price
                }
            });

            // 4. Record Transaction
            const transaction = await prisma.transaction.create({
                data: {
                    amount: artwork.price,
                    type: 'PURCHASE',
                    status: 'COMPLETED',
                    buyerId: buyer.id,
                    artworkId: artwork.id,
                    // If you want to pay the artist, you'd calculate share here and update artist balance
                    // For now, we just record the purchase
                    artistId: artwork.artistId
                }
            });

            // Optional: Pay Artist (e.g. 90%)
            // const artistShare = artwork.price * 0.90;
            // await prisma.user.update({ where: { id: artwork.artistId }, data: { walletBalance: { increment: artistShare } } });

            return { purchase, transaction, newBalance: updatedBuyer.walletBalance };
        });

        res.json(result);

    } catch (error) {
        console.error('Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
});

