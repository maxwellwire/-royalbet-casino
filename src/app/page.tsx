import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const games = [
  {
    name: "Aviator",
    category: "CRASH GAME",
    icon: "✈",
    style: "aviator",
    href: "/casino/aviator",
  },
  {
    name: "Slots",
    category: "SLOT GAME",
    icon: "🎰",
    style: "slots",
    href: "/casino/slots",
  },
  {
    name: "Roulette",
    category: "TABLE GAME",
    icon: "🎡",
    style: "roulette",
    href: "/casino/roulette",
  },
  {
    name: "Blackjack",
    category: "CARD GAME",
    icon: "♠",
    style: "blackjack",
    href: "/casino/blackjack",
  },
  {
    name: "Spin Match",
    category: "QUICK GAME",
    icon: "🎯",
    style: "spin-match",
    href: "/casino/spin-match",
  },
];

export default function HomePage() {
  return (
    <main className="royal-home">
      <div className="royal-home-content">
        <section className="royal-hero">
          <div className="royal-hero-glow" />

          <div className="royal-hero-copy">
            <div className="royal-kicker">
              <Sparkles size={13} />
              WELCOME TO ROYALBET
            </div>

            <h1>
              ROYALBET
              <span>CASINO</span>
            </h1>

            <div className="royal-hero-divider" />

            <p>
              PLAY <i>•</i> WIN <i>•</i> REPEAT
            </p>

            <Link href="/register" className="royal-gold-button">
              Start Playing <ArrowRight size={16} />
            </Link>
          </div>

          <div className="royal-hero-art" aria-hidden="true">
            <div className="royal-hero-ring royal-ring-one" />
            <div className="royal-hero-ring royal-ring-two" />

            <div className="royal-playing-cards">
              <div className="royal-playing-card">
                A<span>♠</span>
              </div>

              <div className="royal-playing-card royal-card-second">
                K<span>♦</span>
              </div>
            </div>

            <div className="royal-roulette">
              <div className="royal-roulette-center">♛</div>
            </div>

            <div className="royal-hero-chip">♛</div>
          </div>
        </section>

        <section
          className="royal-promo"
          aria-label="Deposit promotion"
        >
          <div className="royal-promo-icon">
            <Crown size={27} />
          </div>

          <div className="royal-promo-copy">
            <span>ROYALBET WELCOME OFFER</span>

            <h2>
              <strong>200%</strong> DEPOSIT BONUS
            </h2>

            <p>Get more from your eligible deposit.</p>
          </div>

          <Link
            href="/register"
            className="royal-promo-button"
          >
            Claim Offer <ArrowRight size={15} />
          </Link>
        </section>

        <section className="royal-games-section">
          <div className="royal-section-heading">
            <div>
              <span className="royal-section-kicker">
                YOUR NEXT MOVE
              </span>

              <h2>
                Featured <span>Games</span>
              </h2>
            </div>

            <Link
              href="/casino"
              className="royal-view-all"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div className="royal-games-grid">
            {games.map((game) => (
              <article
                className={`royal-game-card royal-game-${game.style}`}
                key={game.name}
              >
                <Link
                  href={game.href}
                  className="royal-game-link"
                  aria-label={`Open ${game.name}`}
                >
                  <div
                    className="royal-game-art"
                    aria-hidden="true"
                  >
                    <span className="royal-game-orbit" />

                    <span className="royal-game-symbol">
                      {game.icon}
                    </span>

                    <span className="royal-game-category">
                      {game.category}
                    </span>
                  </div>

                  <div className="royal-game-info">
                    <h3>{game.name}</h3>

                    <span className="royal-play-button">
                      Play Now <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="royal-bottom-cta">
          <div className="royal-bottom-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <strong>
              Your Royal experience starts here.
            </strong>

            <p>
              Create an account to access your player dashboard.
            </p>
          </div>

          <Link
            href="/register"
            className="royal-bottom-link"
          >
            Create Account
          </Link>
        </section>
      </div>
    </main>
  );
}