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
      "Aviator gameplay is being prepared for secure server-side settlement.",
    route: "/casino/aviator",
    featured: true,
    playable: false,
    symbol: "✈️",
    accent: "#c95c55",
  },
  {
    id: "royal-slots",
    name: "Royal Slots",
    slug: "slots",
    category: "Slots",
    description:
      "Royal Slots will open when secure gameplay is ready.",
    route: "/casino/slots",
    featured: true,
    playable: false,
    symbol: "🎰",
    accent: "#d6b56d",
  },
  {
    id: "royal-mines",
    name: "Royal Mines",
    slug: "mines",
    category: "Quick Games",
    description:
      "Royal Mines is being prepared for secure gameplay.",
    route: "/casino/mines",
    featured: true,
    playable: false,
    symbol: "💎",
    accent: "#5cabc0",
  },
  {
    id: "royal-roulette",
    name: "Royal Roulette",
    slug: "roulette",
    category: "Table Games",
    description:
      "Royal Roulette is coming soon.",
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
      "Royal Blackjack is coming soon.",
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
      "Spin Match is coming soon.",
    route: "/casino/spin-match",
    featured: false,
    playable: false,
    symbol: "✨",
    accent: "#a58bd4",
  },
];

export const FEATURED_GAMES = CASINO_GAMES.filter(
  (game) => game.featured
);

export const AVAILABLE_GAMES = CASINO_GAMES.filter(
  (game) => game.playable
);

export const COMING_SOON_GAMES = CASINO_GAMES.filter(
  (game) => !game.playable
);

export function getGameBySlug(
  slug: string
): CasinoGame | undefined {
  return CASINO_GAMES.find(
    (game) => game.slug === slug
  );
}