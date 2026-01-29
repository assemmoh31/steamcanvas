
import { Artwork, PricingTier, Category, SteamBackground, ArtistRank, Collection } from './types';

export const ARTIST_RANKS: ArtistRank[] = [
  { level: 1, name: 'Novice', milestone: 10000, color: '#FF8C42', perk: 'Bronze Glow Badge', visualTheme: 'Bronze Matte' },
  { level: 2, name: 'Rising', milestone: 25000, color: '#A0A0A0', perk: 'Silver Badge + Verification', visualTheme: 'Silver Mirror' },
  { level: 3, name: 'Professional', milestone: 50000, color: '#FFD700', perk: 'Gold Badge + "Verified" Status', visualTheme: 'Gold Radiant' },
  { level: 4, name: 'Master', milestone: 100000, color: '#E5E4E2', perk: 'Platinum Badge + Priority Listing', visualTheme: 'Platinum Chrome' },
  { level: 5, name: 'Elite', milestone: 250000, color: '#00f2ff', perk: 'Diamond Pulse + Elite Partner Status', visualTheme: 'Diamond Prismatic' },
];

export const ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: 'Neon Ronin',
    artist: 'CyberSage',
    artistSales: 112000,
    price: 450,
    category: 'Featured',
    imageUrl: 'https://picsum.photos/seed/ronin/800/1000',
    showcaseUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZ2Y5Znd6bnR6Znd6bnR6Znd6bnR6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/v9G3NGafEtxDe/giphy.gif',
    isAnimated: true,
    likes: 1204,
    artistAvatar: 'https://picsum.photos/seed/sage/100/100',
    description: 'A high-definition animated showcase featuring a wandering ronin in a cyberpunk cityscape.',
    status: 'approved',
    tags: ['Cyberpunk', 'Neon', 'Warrior']
  },
  {
    id: 'p1',
    title: 'Ghost Shell',
    artist: 'TechLord',
    artistSales: 15000,
    price: 350,
    category: 'Artwork',
    imageUrl: 'https://picsum.photos/seed/ghost/800/1000',
    showcaseUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZ2Y5Znd6bnR6Znd6bnR6Znd6bnR6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxP5f73F8pW/giphy.gif',
    isAnimated: true,
    likes: 0,
    artistAvatar: 'https://picsum.photos/seed/tech/100/100',
    description: 'A minimalist futuristic frame designed for dark profiles.',
    status: 'pending',
    submittedAt: Date.now() - 3600000,
    tags: ['Minimal', 'White', 'Futurism']
  },
  {
    id: 'p2',
    title: 'Cyber Deck',
    artist: 'RetroVibes',
    artistSales: 42000,
    price: 500,
    category: 'Workshop',
    imageUrl: 'https://picsum.photos/seed/deck/800/1000',
    showcaseUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZ2Y5Znd6bnR6Znd6bnR6Znd6bnR6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxm5514fC7K/giphy.gif',
    isAnimated: true,
    likes: 0,
    artistAvatar: 'https://picsum.photos/seed/retro/100/100',
    description: 'A comprehensive workshop layout with neon accents.',
    status: 'pending',
    submittedAt: Date.now() - 7200000,
    tags: ['Retro', 'Blue', 'Workshop']
  }
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    title: 'Cyberpunk Mastery',
    curator: 'CyberSage',
    curatorSales: 280000,
    likes: 245,
    artworks: [ARTWORKS[0]],
    backgroundUrl: 'https://picsum.photos/seed/skyline/1920/1080',
    description: 'A curated selection of the finest neon and high-tech profile components.'
  }
];

export const STEAM_BACKGROUNDS: SteamBackground[] = [
  { id: 'b1', name: 'Cyberpunk Skyline', game: 'Neon City', imageUrl: 'https://picsum.photos/seed/skyline/1920/1080', marketUrl: 'https://steamcommunity.com/market/', color: 'cyan', tags: ['Cyberpunk', 'City', 'Neon'] },
];

export const CATEGORIES: Category[] = ['Workshop', 'Artwork', 'Featured'];

export const TIERS: PricingTier[] = [
  { id: 'squire', name: 'Squire', credits: 500, price: '$4.99', color: '#CD7F32', glowColor: 'rgba(205, 127, 50, 0.4)', benefits: ['500 Canvas Credits', 'Standard Support', 'Profile Badge (Bronze)'] },
  { id: 'knight', name: 'Knight', credits: 1200, price: '$9.99', color: '#C0C0C0', glowColor: 'rgba(192, 192, 192, 0.4)', benefits: ['1,200 Canvas Credits', 'Priority Support', 'Exclusive Knight Badge', '10% Artist Referral Bonus'] },
  { id: 'king', name: 'King', credits: 3000, price: '$19.99', color: '#FFD700', glowColor: 'rgba(255, 215, 0, 0.4)', benefits: ['3,000 Canvas Credits', '24/7 VIP Support', 'Animated Gold Badge', 'Early Access to New Drops', 'Feature on Home Page'] }
];
