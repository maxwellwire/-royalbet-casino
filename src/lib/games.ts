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
    name: "Aviator",
    slug: "aviator",
    category: "Crash Games",
    description: "Watch the multiplier and decide when to cash out.",
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
    description: "Spin the reels in our royal casino.",
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
    description: "Reveal gems and avoid the hidden mines.",
    route: "/casino/mines",
    featured: true,
    playable: false,
    symbol: "💎",
    accent: "#5cabc0",
  },
];

export const FEATURED_GAMES = CASINO_GAMES.filter(
  (game) => game.featured
);

export function getGameBySlug(slug: string) {
  return CASINO_GAMES.find((game) => game.slug === slug);
}