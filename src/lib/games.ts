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
    description: "Watch the multiplier and cash out before the flight ends.",
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
    description: "Spin the reels and discover royal combinations.",
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
    description: "Reveal hidden gems and avoid the mines.",
    route: "/casino/mines",
    featured: true,
    playable: true,
    symbol: "💎",
    accent: "#5cabc0",
  },
  {
    id: "royal-dice",
    name: "Royal Dice",
    slug: "dice",
    category: "Table Games",
    description: "Roll the dice and test your predictions.",
    route: "/casino/dice",
    featured: false,
    playable: false,
    symbol: "🎲",
    accent: "#8c9b83",
  },
  {
    id: "royal-roulette",
    name: "Royal Roulette",
    slug: "roulette",
    category: "Table Games",
    description: "Pick your numbers on the royal roulette wheel.",
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
    description: "Play your cards and aim for a hand of 21.",
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
    description: "Match symbols in a quick casino challenge.",
    route: "/casino/spin-match",
    featured: false,
    playable: false,
    symbol: "✨",
    accent: "#a58bd4",
  },
];

export const FEATURED_GAMES: CasinoGame[] = CASINO_GAMES.filter(
  (game) => game.featured
);

export const AVAILABLE_GAMES: CasinoGame[] = CASINO_GAMES.filter(
  (game) => game.playable
);

export const COMING_SOON_GAMES: CasinoGame[] = CASINO_GAMES.filter(
  (game) => !game.playable
);

export function getGameBySlug(
  slug: string
): CasinoGame | undefined {
  return CASINO_GAMES.find((game) => game.slug === slug);
}