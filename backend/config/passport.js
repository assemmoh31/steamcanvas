const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
// const { PrismaClient } = require('@prisma/client'); // Removed
require('dotenv').config();

const { prisma } = require('./db');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:3000/api/auth/steam/return',
    realm: process.env.STEAM_REALM || 'http://localhost:3000/',
    apiKey: process.env.STEAM_API_KEY,
    stateless: true
},
    async (identifier, profile, done) => {
        try {
            // Profile.id is the steam64id
            const steamId = profile.id;
            const displayName = profile.displayName;
            const avatarUrl = profile.photos?.[2]?.value || profile.photos?.[0]?.value; // Large or small avatar

            // Upsert user: Update if exists, Create if new
            const user = await prisma.user.upsert({
                where: { steamId },
                update: {
                    displayName,
                    avatarUrl
                },
                create: {
                    steamId,
                    displayName,
                    avatarUrl,
                    walletBalance: 0.0,
                    artistLevel: 1
                }
            });

            return done(null, user);
        } catch (error) {
            console.error('Error in Steam Strategy:', error);
            return done(error, null);
        }
    }
));

module.exports = passport;
