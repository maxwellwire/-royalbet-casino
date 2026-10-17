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
    id: "royal-dice",
    name: "Royal Dice",
    slug: "dice",
    category: "Quick Games",
    description: "Roll the dice and test your luck.",
    route: "/casino/dice",
    featured: true,
    playable: true,
    symbol: "🎲",
    accent: "#d6b56d",
  },
  {
    id: "aviator",
    name: "Aviator",
    slug: "aviator",
    category: "Crash Games",
    description: "A high-speed crash game experience.",
    route: "/casino/aviator",
    featured: true,
    playable: false,
    symbol: "✈️",
    accent: "#c65c55",
  },
  {
    id: "royal-slots",
    name: "Royal Slots",
    slug: "slots",
    category: "Slots",
    description: "Discover the RoyalBet slot experience.",
    route: "/casino/slots",
    featured: true,
    playable: false,
    symbol: "🎰",
    accent: "#c49a50",
  },
  {
    id: "royal-mines",
    name: "Royal Mines",
    slug: "mines",
    category: "Quick Games",
    description: "Navigate the grid and avoid hidden mines.",
    route: "/casino/mines",
    featured: true,
    playable: false,
    symbol: "💎",
    accent: "#5c9cbb",
  },
  {
    id: "royal-roulette",
    name: "Royal Roulette",
    slug: "roulette",
    category: "Table Games",
    description: "A classic roulette table experience.",
    route: "/casino/roulette",
    featured: true,
    playable: false,
    symbol: "🎡",
    accent: "#65a47c",
  },
  {
    id: "royal-blackjack",
    name: "Royal Blackjack",
    slug: "blackjack",
    category: "Card Games",
    description: "A classic card game against the dealer.",
    route: "/casino/blackjack",
    featured: false,
    playable: false,
    symbol: "🂡",
    accent: "#b8a1d8",
  },
  {
    id: "spin-match",
    name: "Spin Match",
    slug: "spin-match",
    category: "Slots",
    description: "A matching game concept for the casino.",
    route: "/casino/spin-match",
    featured: false,
    playable: false,
    symbol: "✨",
    accent: "#d18db0",
  },
];

export const FEATURED_GAMES = CASINO_GAMES.filter(
  (game) => game.featured
);

export function getGameBySlug(slug: string) {
  return CASINO_GAMES.find((game) => game.slug === slug);
}