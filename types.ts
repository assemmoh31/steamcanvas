
export type Category = 'Workshop' | 'Artwork' | 'Featured';

export interface ArtistRank {
  level: number;
  name: string;
  milestone: number;
  color: string;
  perk: string;
  visualTheme: string;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistSales?: number; // Lifetime credits sold by this artist
  price: number;
  category: Category;
  imageUrl: string;
  showcaseUrl?: string; // High-fidelity full profile preview
  isAnimated: boolean;
  likes: number;
  artistAvatar: string;
  description: string;
  status?: 'approved' | 'pending' | 'rejected';
  tags?: string[];
  submittedAt?: number;
}

export interface Collection {
  id: string;
  title: string;
  curator: string;
  curatorSales: number;
  likes: number;
  artworks: Artwork[];
  backgroundUrl: string;
  description: string;
}

export interface AppNotification {
  id: string;
  type: 'upload' | 'rank_up' | 'admin_alert' | 'referral_bonus';
  artistName: string;
  artistAvatar: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  linkId?: string;
}

export interface AnalyticsData {
  dailyRevenue: number[];
  escrowTotal: number;
  platformFees: number;
  activeUsers: number;
  toolUsage: {
    splitter: number;
    optimizer: number;
    transcoder: number;
  };
}

export interface SteamBackground {
  id: string;
  name: string;
  game: string;
  imageUrl: string;
  marketUrl: string;
  color: 'cyan' | 'purple' | 'crimson' | 'gold' | 'emerald' | 'sunset' | 'rose' | 'cobalt' | 'default';
  tags: string[];
}

export interface SaleRecord {
  id: string;
  artworkTitle: string;
  buyer: string;
  grossPrice: number;
  netProfit: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'deposit' | 'referral_bonus';
  amount: number;
  timestamp: number;
  itemName?: string;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
}

export interface PricingTier {
  id: string;
  name: string;
  credits: number;
  price: string;
  color: string;
  glowColor: string;
  benefits: string[];
}

export interface User {
  id: string;
  steamId: string;
  displayName: string;
  avatarUrl: string;
  walletBalance: number;
  artistLevel: number;
  purchases?: string[]; // Array of Artwork IDs owned by the user
  isAdmin?: boolean;
  isBanned?: boolean;
}

export interface ReferralRecord {
  id: string;
  username: string;
  status: 'pending' | 'active' | 'bonus_paid';
  joinDate: number;
  revenueGenerated: number;
}
