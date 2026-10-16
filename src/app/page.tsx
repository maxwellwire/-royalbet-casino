"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Crown,
  Dice5,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Menu,
  Search,
  ShieldCheck,
  Spade,
  Sparkles,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type CasinoGame = {
  name: string;
  category: string;
  description: string;
  symbol: string;
  colors: string;
  href: string;
  featured?: boolean;
};

const games: CasinoGame[] = [
  {
    name: "Aviator",
    category: "Crash Games",
    description: "Cash out before the flight ends.",
    symbol: "✈",
    colors: "aviator",
    href: "/casino/aviator",
    featured: true,
  },
  {
    name: "Spin Match",
    category: "Popular",
    description: "Spin and match winning symbols.",
    symbol: "🎡",
    colors: "spin-match",
    href: "/casino/spin-match",
    featured: true,
  },
  {
    name: "JetX",
    category: "Crash Games",
    description: "Follow the multiplier.",
    symbol: "JETX",
    colors: "jetx",
    href: "/casino/jetx",
    featured: true,
  },
  {
    name: "Slots",
    category: "Slot Games",
    description: "Spin the reels.",
    symbol: "777",
    colors: "slots",
    href: "/casino/slots",
    featured: true,
  },
  {
    name: "Roulette",
    category: "Casino Games",
    description: "Pick your number or colour.",
    symbol: "🎯",
    colors: "roulette",
    href: "/casino/roulette",
    featured: true,
  },
  {
    name: "Blackjack",
    category: "Casino Games",
    description: "Play your cards carefully.",
    symbol: "♠",
    colors: "blackjack",
    href: "/casino/blackjack",
    featured: true,
  },
  {
    name: "Dice",
    category: "Quick Games",
    description: "Predict the result.",
    symbol: "⚄",
    colors: "dice",
    href: "/casino/dice",
  },
  {
    name: "Mines",
    category: "Quick Games",
    description: "Find the safe tiles.",
    symbol: "💎",
    colors: "mines",
    href: "/casino/mines",
  },
  {
    name: "Coin Flip",
    category: "Quick Games",
    description: "Choose heads or tails.",
    symbol: "₮",
    colors: "coin-flip",
    href: "/casino/coin-flip",
  },
  {
    name: "Plinko",
    category: "Quick Games",
    description: "Drop the ball and watch.",
    symbol: "✣",
    colors: "plinko",
    href: "/casino/plinko",
  },
  {
    name: "Crash",
    category: "Crash Games",
    description: "Watch the multiplier rise.",
    symbol: "↗",
    colors: "crash",
    href: "/casino/crash",
  },
  {
    name: "Fire Strike",
    category: "Slot Games",
    description: "Enter the fiery reels.",
    symbol: "7",
    colors: "fire-strike",
    href: "/casino/fire-strike",
  },
];

const categories = [
  {
    title: "Popular",
    icon: Flame,
    names: ["Aviator", "Spin Match", "JetX", "Slots", "Roulette"],
  },
  {
    title: "Quick Games",
    icon: Zap,
    names: ["Mines", "Coin Flip", "Dice", "Plinko", "Crash"],
  },
  {
    title: "Slot Games",
    icon: Sparkles,
    names: ["Slots", "Fire Strike", "Spin Match"],
  },
  {
    title: "Casino Games",
    icon: Spade,
    names: ["Roulette", "Blackjack", "Dice"],
  },
];

function GameCard({
  game,
  favorite,
  onToggleFavorite,
}: {
  game: CasinoGame;
  favorite: boolean;
  onToggleFavorite: (name: string) => void;
}) {
  return (
    <article className="game-card">
      <Link
        href={game.href}
        className={`game-art ${game.colors}`}
        aria-label={`Open ${game.name}`}
      >
        <span className="art-glow" />
        <span className="game-art-symbol">{game.symbol}</span>
        <span className="game-art-title">{game.name}</span>
        {game.name === "Aviator" && (
          <span className="game-art-subtitle">TAKE YOUR CHANCE</span>
        )}
      </Link>

      <button
        type="button"
        className={`favorite-button ${favorite ? "is-favorite" : ""}`}
        aria-label={
          favorite
            ? `Remove ${game.name} from favourites`
            : `Add ${game.name} to favourites`
        }
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(game.name)}
      >
        <Heart size={23} fill={favorite ? "currentColor" : "none"} />
      </button>

      <div className="game-card-footer">
        <div className="game-card-name">{game.name}</div>
        <Link href={game.href} className="game-open">
          Play <ChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState<string | null>(null);

  function toggleFavorite(name: string) {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  }

  function renderGameSection(
    title: string,
    names: string[],
    Icon: typeof Flame
  ) {
    const matchingGames = games.filter(
      (game) =>
        names.includes(game.name) &&
        game.name.toLowerCase().includes(search.toLowerCase())
    );

    const visibleGames =
      showAll === title ? matchingGames : matchingGames.slice(0, 8);

    if (matchingGames.length === 0) return null;

    return (
      <section className="game-section" key={title}>
        <div className="section-heading">
          <h2>
            <Icon size={21} />
            {title}
          </h2>

          <button
            type="button"
            className="show-all"
            onClick={() =>
              setShowAll(showAll === title ? null : title)
            }
          >
            {showAll === title ? "Show Less" : "Show All"}
            <ChevronRight size={16} />
          </button>
        </div>

        <div className={`game-row ${showAll === title ? "show-all-grid" : ""}`}>
          {visibleGames.map((game) => (
            <GameCard
              key={`${title}-${game.name}`}
              game={game}
              favorite={favorites.includes(game.name)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </section>
    );
  }

  const searchResults = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="royalbet">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #050708;
          color: #f5f5f5;
          font-family: Arial, Helvetica, sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font: inherit;
        }

        .royalbet {
          --gold: #f5c451;
          --gold-light: #ffe7a0;
          --muted: #9da4ad;
          --line: #20262c;
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 72% 0%, #192014 0%, transparent 30%),
            #050708;
          color: #f5f5f5;
          overflow: hidden;
        }

        .topbar {
          height: 72px;
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 0 24px;
          border-bottom: 1px solid var(--line);
          background: #070a0c;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: #e9e9e9;
          cursor: pointer;
          flex-shrink: 0;
        }

        .icon-button:hover {
          background: #15191b;
          border-color: var(--line);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 205px;
          color: var(--gold);
        }

        .brand-crown {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #fff0b4, #d89b27);
          color: #12100a;
          border-radius: 12px;
        }

        .brand-name {
          font-family: Georgia, serif;
          font-size: 24px;
          letter-spacing: 3px;
          line-height: 1;
        }

        .brand-subtitle {
          font-size: 9px;
          text-align: center;
          letter-spacing: 5px;
          margin-top: 5px;
          color: #eee0b8;
        }

        .topbar-spacer {
          flex: 1;
        }

        .balance-pill,
        .profile-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #30363b;
          border-radius: 12px;
          padding: 8px 12px;
          min-height: 46px;
          white-space: nowrap;
        }

        .balance-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #0c503c;
          color: #7df2b4;
          border: 1px solid #2e9b6d;
          font-weight: 800;
        }

        .gold-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 43px;
          padding: 0 18px;
          border: 1px solid #ffe09a;
          border-radius: 11px;
          color: #171106;
          background: linear-gradient(180deg, #ffe08a, #e6a923);
          font-weight: 800;
          cursor: pointer;
          box-shadow: inset 0 1px 0 #fff4c5;
        }

        .gold-button:hover {
          filter: brightness(1.08);
        }

        .profile-pill {
          min-width: 145px;
          color: #e4e4e4;
        }

        .layout {
          display: grid;
          grid-template-columns: 200px minmax(0, 1fr);
          min-height: calc(100vh - 72px);
        }

        .sidebar {
          padding: 18px 13px;
          border-right: 1px solid var(--line);
          background: #080c0f;
        }

        .nav-list {
          display: grid;
          gap: 7px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 46px;
          padding: 0 13px;
          border-radius: 10px;
          color: #c5cbd0;
          font-size: 14px;
        }

        .nav-link:hover,
        .nav-link.active {
          background: linear-gradient(90deg, #312715, #17140e);
          color: var(--gold-light);
        }

        .nav-link.active {
          border-left: 3px solid var(--gold);
        }

        .sidebar-promo {
          margin-top: 28px;
          padding: 23px 13px;
          border: 1px solid #705624;
          border-radius: 13px;
          text-align: center;
          background:
            radial-gradient(circle at 50% 75%, #5c4214, transparent 52%),
            linear-gradient(155deg, #17150d, #070909);
        }

        .sidebar-promo svg {
          color: var(--gold);
        }

        .sidebar-promo h3 {
          color: var(--gold-light);
          font-family: Georgia, serif;
          font-size: 19px;
          line-height: 1.3;
        }

        .sidebar-promo p {
          font-size: 12px;
          color: #bfc0bd;
          line-height: 1.7;
        }

        .main-content {
          min-width: 0;
          padding: 18px 22px 45px;
          max-width: 1700px;
          width: 100%;
          margin: 0 auto;
        }

        .welcome-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 245px;
          gap: 16px;
          margin-bottom: 28px;
        }

        .hero-banner {
          min-height: 275px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          border: 1px solid #34402b;
          border-radius: 18px;
          padding: 32px;
          background:
            radial-gradient(ellipse at 80% 100%, #4b3610 0%, transparent 35%),
            radial-gradient(ellipse at 70% 10%, #17422d 0%, transparent 35%),
            linear-gradient(110deg, #070c0a 12%, #101b12 55%, #050807);
        }

        .hero-banner::before,
        .hero-banner::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 450px;
          top: -90px;
          transform: rotate(36deg);
          border-left: 2px solid #987027;
          border-right: 1px solid #5a461c;
          background: linear-gradient(90deg, transparent, #d4a43b12, transparent);
          pointer-events: none;
        }

        .hero-banner::before {
          right: 20%;
        }

        .hero-banner::after {
          right: 12%;
        }

        .hero-banner-content {
          position: relative;
          z-index: 2;
          max-width: 560px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--gold);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .hero-banner h1 {
          margin: 17px 0 10px;
          font-family: Georgia, serif;
          font-size: clamp(35px, 4vw, 62px);
          line-height: 1;
          letter-spacing: 3px;
          color: var(--gold-light);
          text-shadow: 0 3px 25px #b78321a0;
        }

        .hero-banner h2 {
          font-size: 16px;
          letter-spacing: 8px;
          margin: 0 0 14px;
          font-weight: 500;
        }

        .hero-banner p {
          color: #c4c9c2;
          line-height: 1.6;
          font-size: 13px;
          max-width: 400px;
        }

        .hero-banner-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .hero-roulette {
          position: absolute;
          right: -20px;
          bottom: -115px;
          width: 290px;
          height: 290px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 12px solid #a67a25;
          background: repeating-conic-gradient(
            from 0deg,
            #151716 0deg 12deg,
            #84251c 12deg 24deg,
            #d4a638 24deg 25deg
          );
          box-shadow: 0 0 40px #c6952b30;
          color: #fbe8aa;
          font-size: 75px;
          opacity: 0.8;
        }

        .account-card {
          border: 1px solid #293137;
          border-radius: 16px;
          padding: 19px;
          background: linear-gradient(145deg, #111719, #080b0d);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .account-welcome {
          display: flex;
          gap: 11px;
          align-items: center;
          color: #d7d9d7;
          font-size: 12px;
        }

        .account-crown {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid #99762e;
          border-radius: 50%;
          color: var(--gold);
        }

        .account-card label {
          display: block;
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 8px;
        }

        .account-amount {
          font-size: 27px;
          font-weight: 800;
          margin-bottom: 17px;
        }

        .account-card .gold-button {
          width: 100%;
        }

        .minimum-note {
          color: #aeb4b6;
          font-size: 11px;
          line-height: 1.6;
          padding: 11px;
          border-radius: 9px;
          background: #151a1c;
          margin-top: 15px;
        }

        .game-section {
          margin-top: 29px;
          min-width: 0;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .section-heading h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 19px;
          font-weight: 750;
        }

        .section-heading h2 svg {
          color: var(--gold);
        }

        .show-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 12px;
          border: 1px solid transparent;
          border-radius: 9px;
          color: var(--gold-light);
          background: #171a14;
          cursor: pointer;
          font-size: 12px;
          white-space: nowrap;
        }

        .game-row {
          display: grid;
          grid-auto-columns: minmax(130px, 1fr);
          grid-auto-flow: column;
          gap: 13px;
          overflow-x: auto;
          overscroll-behavior-inline: contain;
          scroll-snap-type: x mandatory;
          padding: 2px 2px 12px;
          scrollbar-width: thin;
          scrollbar-color: #66502a transparent;
        }

        .game-row::-webkit-scrollbar {
          height: 5px;
        }

        .game-row::-webkit-scrollbar-thumb {
          background: #66502a;
          border-radius: 10px;
        }

        .game-row.show-all-grid {
          grid-auto-flow: row;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          grid-auto-columns: unset;
          overflow: visible;
        }

        .game-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          scroll-snap-align: start;
          border: 1px solid #303438;
          border-radius: 15px;
          background: #0d1113;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .game-card:hover {
          transform: translateY(-3px);
          border-color: #a68139;
        }

        .game-art {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          isolation: isolate;
          padding: 9px;
          text-align: center;
          background: #171717;
        }

        .game-art::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.7;
          z-index: -1;
          background:
            radial-gradient(circle at 50% 38%, #ffffff20, transparent 32%),
            linear-gradient(135deg, transparent, #00000090);
        }

        .art-glow {
          position: absolute;
          width: 90%;
          aspect-ratio: 1;
          border-radius: 50%;
          filter: blur(25px);
          opacity: 0.5;
          z-index: -1;
          background: var(--game-glow, #c9982d);
        }

        .game-art-symbol {
          font-family: Georgia, serif;
          font-weight: 900;
          font-size: clamp(38px, 4vw, 64px);
          line-height: 1.1;
          color: #fff0bd;
          text-shadow: 0 3px 15px #000, 0 0 20px var(--game-glow, #b88c28);
          overflow-wrap: anywhere;
        }

        .game-art-title {
          margin-top: 9px;
          font-size: clamp(13px, 1.4vw, 19px);
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 5px #000;
        }

        .game-art-subtitle {
          margin-top: 5px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #ffb0c1;
        }

        .aviator {
          --game-glow: #f31c52;
          background: radial-gradient(ellipse at 45% 30%, #6e102c, #10050d 65%);
        }

        .aviator .game-art-symbol {
          color: #ff315f;
          font-style: italic;
        }

        .spin-match {
          --game-glow: #f5a821;
          background: radial-gradient(ellipse at 50% 35%, #a84c12, #24100a 72%);
        }

        .jetx,
        .crash {
          --game-glow: #d5ac24;
          background: linear-gradient(140deg, #05080c, #42300a, #050607);
        }

        .jetx .game-art-symbol {
          font-family: Arial, sans-serif;
          font-size: clamp(28px, 3vw, 45px);
          font-style: italic;
          color: #f7dc43;
        }

        .slots,
        .fire-strike {
          --game-glow: #ff6a15;
          background: radial-gradient(ellipse at 50% 40%, #a42a0c, #200906 75%);
        }

        .roulette {
          --game-glow: #bf8e23;
          background: radial-gradient(circle, #23492d, #09170e 75%);
        }

        .blackjack {
          --game-glow: #23805b;
          background: radial-gradient(ellipse at 50% 40%, #174d36, #06120e 78%);
        }

        .dice {
          --game-glow: #f23a39;
          background: radial-gradient(ellipse at 50% 30%, #921c1c, #21090b 75%);
        }

        .mines {
          --game-glow: #238eea;
          background: radial-gradient(ellipse at 50% 35%, #164a77, #07121d 75%);
        }

        .coin-flip {
          --game-glow: #e0a62b;
          background: radial-gradient(circle, #705019, #211506 75%);
        }

        .plinko {
          --game-glow: #a647db;
          background: radial-gradient(ellipse at 50% 35%, #49206b, #10071b 75%);
        }

        .favorite-button {
          position: absolute;
          top: 8px;
          right: 8px;
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          padding: 0;
          color: white;
          background: #05060770;
          border: 1px solid #ffffff25;
          border-radius: 50%;
          cursor: pointer;
          z-index: 3;
        }

        .favorite-button.is-favorite {
          color: #ff4f72;
          border-color: #ff4f7270;
        }

        .game-card-footer {
          padding: 10px;
        }

        .game-card-name {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .game-open {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          min-height: 34px;
          border-radius: 8px;
          background: linear-gradient(180deg, #ffe08a, #dba126);
          color: #1a1307;
          font-size: 12px;
          font-weight: 900;
        }

        .game-open:hover {
          filter: brightness(1.1);
        }

        .live-section {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
        }

        .live-card {
          min-width: 0;
          padding: 15px;
          border: 1px solid #36332a;
          border-radius: 13px;
          background: linear-gradient(145deg, #181b15, #090c0c);
        }

        .live-card-icon {
          display: grid;
          place-items: center;
          height: 76px;
          font-size: 35px;
          color: var(--gold);
          border-radius: 10px;
          background: radial-gradient(circle, #4c3b1a, #101311);
        }

        .live-card h3 {
          font-size: 14px;
          margin: 12px 0 10px;
        }

        .live-card p {
          font-size: 11px;
          line-height: 1.5;
          color: var(--muted);
          min-height: 32px;
        }

        .live-card .gold-button {
          width: 100%;
          min-height: 36px;
          padding: 0 8px;
          font-size: 12px;
        }

        .recent-list {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          padding: 12px;
          border: 1px solid #20282d;
          border-radius: 12px;
          background: #0b1012;
        }

        .recent-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 10px;
          color: var(--gold);
          background: #1b2019;
        }

        .recent-item strong {
          display: block;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .recent-item span {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-size: 10px;
          line-height: 1.4;
        }

        .footer {
          margin-top: 42px;
          padding: 22px 0 8px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .footer a {
          color: var(--gold-light);
        }

        .mobile-bottom {
          display: none;
        }

        .mobile-search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 18px;
          padding: 0 12px;
          min-height: 44px;
          border: 1px solid #30363b;
          border-radius: 11px;
          color: var(--muted);
          background: #0c1012;
        }

        .mobile-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          color: white;
          background: transparent;
          font-size: 16px;
        }

        .search-empty {
          padding: 24px 10px;
          color: var(--muted);
          text-align: center;
        }

        @media (min-width: 1500px) {
          .main-content {
            padding-left: 30px;
            padding-right: 30px;
          }

          .game-row {
            grid-auto-columns: minmax(160px, 1fr);
          }
        }

        @media (max-width: 1100px) {
          .layout {
            grid-template-columns: 175px minmax(0, 1fr);
          }

          .main-content {
            padding: 16px;
          }

          .welcome-grid {
            grid-template-columns: minmax(0, 1fr) 215px;
          }

          .hero-banner {
            padding: 24px;
          }

          .hero-roulette {
            width: 210px;
            height: 210px;
            right: -80px;
          }

          .live-section,
          .recent-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .topbar {
            height: 64px;
            padding: 0 12px;
            gap: 8px;
          }

          .brand {
            min-width: 0;
            gap: 7px;
          }

          .brand-crown {
            width: 35px;
            height: 35px;
          }

          .brand-name {
            font-size: 17px;
            letter-spacing: 2px;
          }

          .brand-subtitle {
            font-size: 7px;
            letter-spacing: 3px;
          }

          .topbar > .icon-button:first-child {
            width: 34px;
            height: 40px;
          }

          .topbar .balance-pill {
            margin-left: auto;
            min-height: 38px;
            gap: 6px;
            padding: 4px 7px;
            font-size: 11px;
            border: 0;
          }

          .balance-icon {
            width: 23px;
            height: 23px;
          }

          .topbar .gold-button {
            min-height: 36px;
            padding: 0 10px;
            font-size: 12px;
          }

          .topbar .notification-button,
          .profile-pill,
          .sidebar {
            display: none;
          }

          .layout {
            display: block;
            min-height: auto;
          }

          .main-content {
            padding: 13px 12px 95px;
          }

          .welcome-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 23px;
          }

          .hero-banner {
            min-height: 235px;
            padding: 23px 19px;
            border-radius: 15px;
          }

          .hero-banner h1 {
            font-size: clamp(32px, 9vw, 45px);
            letter-spacing: 1px;
            margin-top: 15px;
          }

          .hero-banner h2 {
            font-size: 12px;
            letter-spacing: 5px;
          }

          .hero-banner p {
            max-width: 260px;
            font-size: 12px;
          }

          .hero-banner .eyebrow {
            font-size: 9px;
            letter-spacing: 1.4px;
          }

          .hero-roulette {
            width: 135px;
            height: 135px;
            border-width: 7px;
            right: -65px;
            bottom: -36px;
            font-size: 40px;
            opacity: 0.42;
          }

          .hero-banner-actions {
            margin-top: 15px;
          }

          .hero-banner-actions .gold-button {
            min-height: 40px;
            font-size: 12px;
          }

          .account-card {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(115px, 0.8fr);
            align-items: center;
            gap: 12px;
            padding: 14px;
          }

          .account-welcome {
            grid-column: 1 / -1;
          }

          .account-amount {
            font-size: 21px;
            margin-bottom: 0;
          }

          .account-card .gold-button {
            min-height: 40px;
            padding: 0 9px;
            font-size: 12px;
          }

          .minimum-note {
            grid-column: 1 / -1;
            margin-top: 0;
            padding: 9px;
          }

          .game-section {
            margin-top: 24px;
          }

          .section-heading {
            margin-bottom: 12px;
          }

          .section-heading h2 {
            font-size: 17px;
          }

          .show-all {
            padding: 7px 9px;
            font-size: 11px;
          }

          .game-row {
            grid-auto-columns: minmax(135px, 42vw);
            gap: 11px;
            margin-right: -12px;
            padding-right: 12px;
          }

          .game-row.show-all-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 11px;
            margin-right: 0;
          }

          .game-art-symbol {
            font-size: 45px;
          }

          .game-art-title {
            font-size: 14px;
          }

          .favorite-button {
            top: 6px;
            right: 6px;
            width: 34px;
            height: 34px;
          }

          .game-card-footer {
            padding: 9px;
          }

          .live-section {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .live-card {
            padding: 11px;
          }

          .live-card-icon {
            height: 60px;
          }

          .live-card h3 {
            font-size: 13px;
          }

          .recent-list {
            display: flex;
            overflow-x: auto;
            margin-right: -12px;
            padding: 0 12px 8px 0;
          }

          .recent-item {
            flex: 0 0 190px;
          }

          .footer {
            font-size: 10px;
            margin-top: 28px;
          }

          .mobile-bottom {
            position: fixed;
            z-index: 40;
            bottom: 0;
            left: 0;
            right: 0;
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            padding: 8px 5px max(8px, env(safe-area-inset-bottom));
            border-top: 1px solid #282d30;
            background: #080c0ff5;
            backdrop-filter: blur(16px);
          }

          .mobile-bottom a {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            min-height: 48px;
            color: #9da5ab;
            font-size: 10px;
          }

          .mobile-bottom a.active {
            color: var(--gold);
          }

          .mobile-bottom svg {
            width: 20px;
            height: 20px;
          }

          .mobile-search {
            margin-bottom: 15px;
          }
        }

        @media (max-width: 360px) {
          .topbar {
            gap: 4px;
            padding: 0 7px;
          }

          .brand-name {
            font-size: 15px;
            letter-spacing: 1px;
          }

          .brand-crown {
            width: 30px;
            height: 30px;
          }

          .topbar .balance-pill {
            gap: 4px;
            padding: 3px;
          }

          .topbar .gold-button {
            padding: 0 7px;
          }

          .main-content {
            padding-left: 9px;
            padding-right: 9px;
          }

          .game-row {
            grid-auto-columns: minmax(125px, 44vw);
            margin-right: -9px;
          }

          .game-row.show-all-grid {
            margin-right: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* TOP NAVIGATION */}
      <header className="topbar">
        <button
          type="button"
          className="icon-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <Link href="/" className="brand" aria-label="RoyalBet home">
          <span className="brand-crown">
            <Crown size={27} />
          </span>
          <span>
            <span className="brand-name">ROYALBET</span>
            <span className="brand-subtitle">CASINO</span>
          </span>
        </Link>

        <div className="topbar-spacer" />

        <div className="balance-pill">
          <span className="balance-icon">₮</span>
          <strong>1.00 USDT</strong>
        </div>

        <a
          className="gold-button"
          href="https://t.me/RoyalBetPayments"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowDownToLine size={16} />
          Deposit
        </a>

        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={21} />
        </button>

        <Link href="/account" className="profile-pill">
          <UserRound size={20} />
          <span>My Account</span>
          <ChevronDown size={15} />
        </Link>
      </header>

      <div className="layout">
        {/* DESKTOP SIDEBAR */}
        <aside className="sidebar">
          <nav className="nav-list" aria-label="Main navigation">
            <Link href="/" className="nav-link active">
              <Home size={20} /> Home
            </Link>
            <Link href="/casino" className="nav-link">
              <Gamepad2 size={20} /> Casino
            </Link>
            <a href="#live-casino" className="nav-link">
              <Spade size={20} /> Live Casino
            </a>
            <a href="#popular" className="nav-link">
              <Sparkles size={20} /> Popular Games
            </a>
            <a
              href="https://t.me/RoyalBetPayments"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <ArrowDownToLine size={20} /> Deposit
            </a>
            <Link href="/account" className="nav-link">
              <UserRound size={20} /> My Account
            </Link>
            <a
              href="https://t.me/RoyalBetPayments"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <ShieldCheck size={20} /> Support
            </a>
          </nav>

          <div className="sidebar-promo">
            <Crown size={40} />
            <h3>THE ROYAL EXPERIENCE</h3>
            <p>
              Discover your next favourite game at RoyalBet.
            </p>
            <a
              className="gold-button"
              href="https://t.me/RoyalBetPayments"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Admin
            </a>
          </div>
        </aside>

        {/* MAIN CASINO LOBBY */}
        <div className="main-content">
          {menuOpen && (
            <nav
              className="nav-list"
              aria-label="Mobile navigation"
              style={{
                padding: 12,
                marginBottom: 14,
                border: "1px solid #30363b",
                borderRadius: 12,
                background: "#0b1012",
              }}
            >
              <Link
                href="/"
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <Home size={19} /> Home
              </Link>
              <Link
                href="/casino"
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <Gamepad2 size={19} /> Casino
              </Link>
              <Link
                href="/account"
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound size={19} /> My Account
              </Link>
              <Link
                href="/login"
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <ShieldCheck size={19} /> Sign In
              </Link>
            </nav>
          )}

          {/* PROMOTIONAL BANNER AND BALANCE */}
          <section className="welcome-grid">
            <div className="hero-banner">
              <div className="hero-banner-content">
                <div className="eyebrow">
                  <Sparkles size={15} />
                  WELCOME TO ROYALBET
                </div>

                <h1>ROYALBET</h1>
                <h2>CASINO</h2>

                <p>
                  Your destination for exciting casino-style games
                  and a premium gaming experience.
                </p>

                <div className="hero-banner-actions">
                  <Link href="/casino" className="gold-button">
                    Start Playing <ArrowRight size={17} />
                  </Link>
                  <Link href="/register" className="gold-button">
                    Join RoyalBet
                  </Link>
                </div>
              </div>

              <div className="hero-roulette" aria-hidden="true">
                ♛
              </div>
            </div>

            <aside className="account-card">
              <div className="account-welcome">
                <span className="account-crown">
                  <Crown size={25} />
                </span>
                <span>
                  <span style={{ display: "block", color: "#929a9e" }}>
                    Welcome to
                  </span>
                  <strong>RoyalBet Casino</strong>
                </span>
              </div>

              <div>
                <label>Your Balance</label>
                <div className="account-amount">1.00 USDT</div>
                <a
                  href="https://t.me/RoyalBetPayments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-button"
                >
                  Deposit
                </a>
              </div>

              <div className="minimum-note">
                Minimum balance to play: <strong>50 USDT</strong>
              </div>
            </aside>
          </section>

          {/* SEARCH */}
          <label className="mobile-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search casino games..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search casino games"
            />
            {search && (
              <button
                type="button"
                className="icon-button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={17} />
              </button>
            )}
          </label>

          {search ? (
            <section className="game-section">
              <div className="section-heading">
                <h2>
                  <Search size={21} /> Search Results
                </h2>
                <span style={{ color: "#9da4ad", fontSize: 12 }}>
                  {searchResults.length} games
                </span>
              </div>

              {searchResults.length > 0 ? (
                <div className="game-row show-all-grid">
                  {searchResults.map((game) => (
                    <GameCard
                      key={game.name}
                      game={game}
                      favorite={favorites.includes(game.name)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="search-empty">
                  No games found. Try another search.
                </div>
              )}
            </section>
          ) : (
            <>
              {/* GAME CATEGORIES */}
              {categories.map((category) =>
                renderGameSection(
                  category.title,
                  category.names,
                  category.icon
                )
              )}

              {/* LIVE CASINO */}
              <section className="game-section" id="live-casino">
                <div className="section-heading">
                  <h2>
                    <Spade size={21} /> Live Casino
                  </h2>
                  <span
                    style={{
                      color: "#a9afb2",
                      fontSize: 12,
                    }}
                  >
                    Explore
                  </span>
                </div>

                <div className="live-section">
                  {[
                    {
                      name: "Live Blackjack",
                      symbol: "♠",
                      description: "Classic card table experience.",
                    },
                    {
                      name: "Live Roulette",
                      symbol: "◎",
                      description: "The classic roulette table.",
                    },
                    {
                      name: "Live Baccarat",
                      symbol: "♛",
                      description: "Discover the card classic.",
                    },
                    {
                      name: "Game Shows",
                      symbol: "★",
                      description: "Explore game-show experiences.",
                    },
                  ].map((game) => (
                    <article className="live-card" key={game.name}>
                      <div className="live-card-icon">{game.symbol}</div>
                      <h3>{game.name}</h3>
                      <p>{game.description}</p>
                      <Link href="/casino" className="gold-button">
                        Explore
                      </Link>
                    </article>
                  ))}
                </div>
              </section>

              {/* FAVOURITES */}
              {favorites.length > 0 && (
                <section className="game-section">
                  <div className="section-heading">
                    <h2>
                      <Heart size={21} /> Your Favourites
                    </h2>
                  </div>

                  <div className="game-row show-all-grid">
                    {games
                      .filter((game) => favorites.includes(game.name))
                      .map((game) => (
                        <GameCard
                          key={game.name}
                          game={game}
                          favorite
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* RECENT ACTIVITY */}
              <section className="game-section">
                <div className="section-heading">
                  <h2>
                    <Trophy size={21} /> Game Centre
                  </h2>
                </div>

                <div className="recent-list">
                  <div className="recent-item">
                    <div className="recent-icon">
                      <Dice5 size={24} />
                    </div>
                    <div>
                      <strong>Dice</strong>
                      <span>Try the available game</span>
                    </div>
                  </div>

                  <div className="recent-item">
                    <div className="recent-icon">
                      <Gamepad2 size={24} />
                    </div>
                    <div>
                      <strong>Game Collection</strong>
                      <span>Explore the casino lobby</span>
                    </div>
                  </div>

                  <div className="recent-item">
                    <div className="recent-icon">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <strong>Your Account</strong>
                      <span>View account details</span>
                    </div>
                  </div>

                  <div className="recent-item">
                    <div className="recent-icon">
                      <Crown size={24} />
                    </div>
                    <div>
                      <strong>RoyalBet</strong>
                      <span>Your gaming destination</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* FOOTER */}
          <footer className="footer">
            <div>
              <strong style={{ color: "#f5c451" }}>ROYALBET CASINO</strong>
              <br />
              Play responsibly. Check the rules before playing.
            </div>

            <div>
              <Link href="/account">Account</Link>
              {" · "}
              <Link href="/casino">Casino</Link>
              {" · "}
              <a
                href="https://t.me/RoyalBetPayments"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support
              </a>
            </div>
          </footer>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom" aria-label="Mobile navigation">
        <Link href="/" className="active">
          <Home />
          Home
        </Link>
        <Link href="/casino">
          <Gamepad2 />
          Casino
        </Link>
        <a href="#live-casino">
          <Spade />
          Live
        </a>
        <a
          href="https://t.me/RoyalBetPayments"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowDownToLine />
          Deposit
        </a>
        <Link href="/account">
          <UserRound />
          Account
        </Link>
      </nav>
    </main>
  );
}