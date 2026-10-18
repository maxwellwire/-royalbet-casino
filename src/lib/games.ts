export type GameCategory =
  | "All Games"
  | "Crash Games"
  | "Slots"
  | "Table Games"
  | "Card Games"
  | "Quick Games";

export type CasinoGame = {
  id: string;
  name: string;
  slug: string;
  category: Exclude<GameCategory, "All Games">;
  description: string;
  route: string;
  featured: boolean;
  playable: boolean;
  symbol: string;
  accent: string;
};

export const GAME_CATEGORIES: GameCategory[] = [
  "All Games",
  "Crash Games",
  "Slots",
  "Table Games",
  "Card Games",
  "Quick Games",
];

export const CASINO_GAMES: CasinoGame[] = [
  {
    id: "aviator",
    name: "Royal Aviator",
    slug: "aviator",
    category: "Crash Games",
    description:
      "Take off with Royal Aviator. Watch the multiplier rise and cash out before the flight ends.",
    route: "/casino/aviator",
    featured: true,
    playable: true,
    symbol: "✈️",
    accent: "#c95c55",
  },
  {
    id: "royal-slots",
    name: "Royal Slots",
    slug: "slots",
    category: "Slots",
    description:
      "Spin the reels, match symbols, and discover your luck in Royal Slots.",
    route: "/casino/slots",
    featured: true,
    playable: true,
    symbol: "🎰",
    accent: "#d6b56d",
  },
  {
    id: "royal-mines",
    name: "Royal Mines",
    slug: "mines",
    category: "Quick Games",
    description:
      "Find hidden gems, avoid the mines, and cash out your winnings before hitting a mine.",
    route: "/casino/mines",
    featured: true,
    playable: true,
    symbol: "💎",
    accent: "#5cabc0",
  },
  {
    id: "royal-roulette",
    name: "Royal Roulette",
    slug: "roulette",
    category: "Table Games",
    description:
      "Royal Roulette is coming soon. Get ready to try your luck at the wheel.",
    route: "/casino/roulette",
    featured: false,
    playable: false,
    symbol: "🎯",
    accent: "#b64d4d",
  },
  {
    id: "royal-blackjack",
    name: "Royal Blackjack",
    slug: "blackjack",
    category: "Card Games",
    description:
      "Royal Blackjack is coming soon. A classic card-table experience is on the way.",
    route: "/casino/blackjack",
    featured: false,
    playable: false,
    symbol: "🃏",
    accent: "#79a88b",
  },
  {
    id: "spin-match",
    name: "Spin Match",
    slug: "spin-match",
    category: "Quick Games",
    description:
      "Spin Match is coming soon. Stay tuned for another quick game from RoyalBet.",
    route: "/casino/spin-match",
    featured: false,
    playable: false,
    symbol: "✨",
    accent: "#a58bd4",
  },
];

export const FEATURED_GAMES: CasinoGame[] =
  CASINO_GAMES.filter((game) => game.featured);

export const AVAILABLE_GAMES: CasinoGame[] =
  CASINO_GAMES.filter((game) => game.playable);

export const COMING_SOON_GAMES: CasinoGame[] =
  CASINO_GAMES.filter((game) => !game.playable);

export function getGameBySlug(
  slug: string
): CasinoGame | undefined {
  return CASINO_GAMES.find(
    (game) => game.slug === slug
  );
}

export function getGamesByCategory(
  category: GameCategory
): CasinoGame[] {
  if (category === "All Games") {
    return CASINO_GAMES;
  }

  return CASINO_GAMES.filter(
    (game) => game.category === category
  );
}

export function getPlayableGames(): CasinoGame[] {
  return AVAILABLE_GAMES;
}

export function getFeaturedGames(): CasinoGame[] {
  return FEATURED_GAMES;
}

export function isGamePlayable(
  slug: string
): boolean {
  const game = getGameBySlug(slug);
  return game?.playable ?? false;
}