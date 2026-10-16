import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Dice5,
  ShieldCheck,
  Sparkles,
  Trophy
} from "lucide-react";

const features = [
  {
    icon: Dice5,
    title: "Casino Games",
    text: "Explore interactive games using virtual credits."
  },
  {
    icon: ShieldCheck,
    title: "Your Account",
    text: "Register and view your account information."
  },
  {
    icon: Trophy,
    title: "Game History",
    text: "Keep track of recorded game results."
  }
];

export default function HomePage() {
  return (
    <div className="page-container">
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={15} />
            THE ROYAL EXPERIENCE
          </div>

          <h1>
            PLAY WITH
            <br />
            <span className="gold-text">CONFIDENCE.</span>
          </h1>

          <p className="hero-description">
            Step into RoyalBet, a premium casino-style
            experience with a bold identity, elegant design,
            and interactive games.
          </p>

          <div className="hero-actions">
            <Link href="/casino" className="button button-gold button-large">
              Explore casino <ArrowRight size={18} />
            </Link>

            <Link
              href="/register"
              className="button button-outline button-large"
            >
              Create account
            </Link>
          </div>

          <div className="hero-trust">
            <span><ShieldCheck size={16} /> Account-based access</span>
            <span><Crown size={16} /> Premium design</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="hero-crown">
            <Crown size={100} strokeWidth={1.2} />
          </div>

          <div className="hero-chip chip-one">ROYAL</div>
          <div className="hero-chip chip-two">BET</div>

          <div className="hero-art-caption">
            <span>EST.</span>
            <strong>ROYALBET CASINO</strong>
            <span>THE GAME STARTS HERE</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>EXPERIENCE</span>
          <strong>Premium</strong>
          <small>Designed for mobile and desktop</small>
        </div>

        <div className="stat-card">
          <span>GAMES</span>
          <strong>Interactive</strong>
          <small>Start with our dice game</small>
        </div>

        <div className="stat-card">
          <span>PLAY MODE</span>
          <strong>Virtual</strong>
          <small>No real-money wagering</small>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">WHY ROYALBET</div>
            <h2>A BETTER WAY TO <span className="gold-text">PLAY.</span></h2>
          </div>

          <Link href="/casino" className="text-link">
            View games <ArrowRight size={16} />
          </Link>
        </div>

        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={26} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="promo-banner">
        <div>
          <div className="eyebrow">YOUR NEXT MOVE</div>
          <h2>READY TO ENTER THE ROYAL ROOM?</h2>
          <p>Create an account and try the virtual-credit games.</p>
        </div>

        <Link href="/register" className="button button-gold">
          Join RoyalBet <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}