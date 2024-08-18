import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export type BadgeTier = {
  tierName: string;
  tierImageUri: string;
  requiredProgress: BN;
};

export type GameStructs = {
  gameId: string;
};

export type UserGameAcct = {
  accountId: string;
};

export type Users = {
  emailAddress: string;
  walletAddress: PublicKey;
  games: GameStructs[];
  createdAt: BN;
  updateAt: BN;
};

export type Assets = {
  assetAddress: PublicKey;
  assetName: string;
};

export type LeaderboardEntry = {
  user: PublicKey;
  score: BN;
};

export type Alert = {
  alertId: PublicKey;
  alertType: string;
  alertMessage: string;
  triggerCondition: string;
  gameId: PublicKey;
};

export type Badge = {
  badgeId: PublicKey;
  badgeName: string;
  badgeDescription: string;
  badgeImageUri: string;
  gameId: PublicKey;
  tiers: BadgeTier[];
  criteria: string;
};

export type UserBadgeProgress = {
  user: PublicKey;
  badgeId: PublicKey;
  currentTier: number;
  progress: BN;
};

export type UserBadge = {
  userGameAccount: PublicKey;
  badgeId: PublicKey;
  awardedAt: BN;
};

export type UserGameAccount = {
  image: string;
  gameId: string;
  accountId: string;
  level: BN;
  score: BN;
  status: string;
  assets: Assets[];
  createdAt: BN;
  updateAt: BN;
  owner: PublicKey;
  badges: PublicKey[];
  customData: string;
};

export type UserGameAccount2 = {
  image: string;
  gameId: string;
  accountId: string;
  level: number;
  score: number;
  status: string;
  assets: Assets[];
  createdAt: BN;
  updateAt: BN;
  owner: PublicKey;
  badges: PublicKey[];
  customData: string;
};

export type GamePass = {
  bump: number;
  totalUsers: BN;
  totalGames: BN;
  userGameAccount: UserGameAcct[];
  games: GameStructs[];
  users: Users[];
  owner: PublicKey;
};

export type GameAccts = {
  image: string;
  uniqueId: BN;
  gameId: string;
  gameName: string;
  gameStatus: string;
  createdAt: BN;
  updatedAt: BN;
  owner: PublicKey;
};

export type GameAccts2 = {
  image: string;
  uniqueId: number;
  gameId: string;
  gameName: string;
  gameStatus: string;
  createdAt: BN;
  updatedAt: BN;
  owner: PublicKey;
};

export type BadgeCreationResult= {
  transactionSignature: string;
}

export type UpdateBadgeProgressResult= {
  transactionSignature: string;
}


export type Tier ={
  tierName: string;
  tierImageUri: string;
  requiredProgress: number; 
}


export type createTieredBadgeResult= {
  transactionSignature: string;
}

export type UpdateLeaderboardResult= {
  transactionSignature: string;
}

export type AssignBadgeResult= {
  transactionSignature: string;
}

export type InitializeGameResult= {
  transactionSignature: string;
}



export type IntializeGamePassResult= {
  transactionSignature: string;
}


export type UpdateUserLevelResult= {
  transactionSignature: string;
}


export type UpdateUserScoreResult= {
  transactionSignature: string;
}

export type GetSerializedInitializeGameTransactionResult= {
  serializedTransaction: string;
  uniqueId: Number;
}

export type GetSerializedInitializeUserGameAccountTransactionResult= {
  serializedTransaction: string;
}


export type GetSerializedUpdateUserAvatarTransactionResult= {
  serializedTransaction: string;
}

export type Leaderboard = {
  gameId: PublicKey;
  topPlayers: LeaderboardEntry[];
  lastUpdated: BN;
};

export type UserStreak = {
  userGameAccount: PublicKey;
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: BN;
};