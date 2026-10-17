import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CASINO_GAMES } from "@/lib/games";

export default function GameCards() {
  return (
    <section className="game-section">
      <div className="game-section-heading">
        <div>
          <span className="game-eyebrow">THE ROYAL COLLECTION</span>
          <h2>Explore Games</h2>
          <p>Choose your game and enjoy the experience.</p>
        </div>

        <span className="game-count">03 GAMES</span>
      </div>

      <div className="game-card-grid">
        {CASINO_GAMES.map((game) => (
          <Link
            key={game.id}
            href={game.route}
            className="royal-game-card"
            style={{ "--game-accent": game.accent } as React.CSSProperties}
          >
            <div className="game-card-top">
              <span className="game-live-dot" />
              <span className="game-card-label">ROYALBET</span>
              <ArrowUpRight size={18} />
            </div>

            <div className="game-art">
              <span className="game-symbol">{game.symbol}</span>
            </div>

            <div className="game-card-bottom">
              <div>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
              </div>

              <span className="game-play-button">Play</span>
            </div>
          </Link>
        ))}
      </div>

      <a
        className="royal-bonus-banner"
        href="https://t.me/RoyalBetPayments"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="bonus-icon">♛</span>

        <span className="bonus-copy">
          <strong>200% DEPOSIT BONUS</strong>
          <small>Contact our support team for bonus terms and eligibility.</small>
        </span>

        <span className="bonus-claim">CLAIM BONUS ↗</span>
      </a>
    </section>
  );
}