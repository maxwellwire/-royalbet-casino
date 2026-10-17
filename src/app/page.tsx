import Link from "next/link";
import {
  ArrowRight,
  Crown,
  LogIn,
} from "lucide-react";

const games = [
  {
    name: "Aviator",
    category: "CRASH GAME",
    style: "aviator",
    href: "/casino/aviator",
  },
  {
    name: "Slots",
    category: "SLOT MACHINE",
    style: "slots",
    href: "/casino/slots",
  },
  {
    name: "Mines",
    category: "STRATEGY GAME",
    style: "mines",
    href: "/casino/mines",
  },
  {
    name: "Roulette",
    category: "TABLE GAME",
    style: "roulette",
    href: "/casino/roulette",
  },
];

export default function HomePage() {
  return (
    <main className="royal-home royal-home-compact">
      <header className="royal-header">
        <Link
          href="/"
          className="royal-brand"
          aria-label="RoyalBet home"
        >
          <span className="royal-brand-crown">
            <Crown size={26} strokeWidth={1.7} />
          </span>

          <span className="royal-brand-name">
            ROYAL<span>BET</span>
            <small>CASINO</small>
          </span>
        </Link>

        <div className="royal-header-actions">
          <Link href="/login" className="royal-login">
            <LogIn size={16} />
            Log in
          </Link>

          <Link href="/register" className="royal-register">
            Join now
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="royal-games-section">
        <div className="royal-section-heading">
          <div>
            <span className="royal-section-kicker">
              THE ROYAL COLLECTION
            </span>

            <h1>
              Choose your <span>game</span>
            </h1>

            <p className="royal-games-subtitle">
              Four games. One destination.
            </p>
          </div>
        </div>

        <div className="royal-games-grid">
          {games.map((game) => (
            <article
              className={`royal-game-card royal-game-${game.style}`}
              key={game.name}
            >
              <div className="royal-game-art">
                <span
                  className="royal-game-orbit"
                  aria-hidden="true"
                />

                {game.style === "aviator" && (
                  <div
                    className="royal-art-aviator"
                    aria-hidden="true"
                  >
                    <span className="aviator-trail" />
                    <span className="aviator-plane">✈</span>
                    <span className="aviator-multiplier">
                      2.45×
                    </span>
                  </div>
                )}

                {game.style === "slots" && (
                  <div
                    className="royal-art-slots"
                    aria-hidden="true"
                  >
                    <div className="slot-reel">7</div>
                    <div className="slot-reel">★</div>
                    <div className="slot-reel">7</div>
                  </div>
                )}

                {game.style === "mines" && (
                  <div
                    className="royal-art-mines"
                    aria-hidden="true"
                  >
                    {[
                      "💎",
                      "·",
                      "💎",
                      "·",
                      "✹",
                      "💎",
                      "·",
                      "💎",
                      "·",
                    ].map((item, index) => (
                      <span key={index}>{item}</span>
                    ))}
                  </div>
                )}

                {game.style === "roulette" && (
                  <div
                    className="royal-art-roulette"
                    aria-hidden="true"
                  >
                    <div className="roulette-wheel">
                      <span>0</span>
                      <span>32</span>
                      <span>15</span>
                      <span>19</span>
                      <span>4</span>
                      <span>21</span>
                      <div className="roulette-hub">♛</div>
                    </div>
                  </div>
                )}

                <span className="royal-game-category">
                  {game.category}
                </span>
              </div>

              <div className="royal-game-info">
                <div className="royal-game-title">
                  <h2>{game.name}</h2>
                  <span className="royal-game-status">
                    PLAY
                  </span>
                </div>

                <Link
                  href={game.href}
                  className="royal-play-button"
                  aria-label={`Play ${game.name}`}
                >
                  Play Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="royal-home-bottom">
        <Crown size={17} />
        <span>ROYALBET CASINO</span>
        <span className="royal-bottom-separator">•</span>
        <Link href="https://t.me/RoyalBetPayments">
          Support
        </Link>
      </div>
    </main>
  );
}