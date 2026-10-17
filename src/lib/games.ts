export type CasinoGame = {
  id: string;
  name: string;
  description: string;
  route: string;
  symbol: string;
  accent: string;
};

export const CASINO_GAMES: CasinoGame[] = [
  {
    id: "aviator",
    name: "Aviator",
    description: "Watch the multiplier and decide when to cash out.",
    route: "/casino/aviator",
    symbol: "✈️",
    accent: "#c95c55",
  },
  {
    id: "slots",
    name: "Royal Slots",
    description: "Spin the reels in our royal casino.",
    route: "/casino/slots",
    symbol: "🎰",
    accent: "#d6b56d",
  },
  {
    id: "mines",
    name: "Royal Mines",
    description: "Reveal gems and avoid the hidden mines.",
    route: "/casino/mines",
    symbol: "💎",
    accent: "#5cabc0",
  },
];