import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Trophy,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="home">
      <div className="phone-container">
        <header className="header">
          <Link href="/" className="logo">
            <span className="logo-icon">R</span>
            <span className="logo-text">
              ROYAL<span>BET</span>
            </span>
          </Link>

          <Link href="/login" className="header-login">
            Log in
          </Link>
        </header>

        <section className="hero">
          <div className="hero-badge">
            <span className="live-dot" />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <div className="hero-crown">♛</div>

          <h1>
            PLAY WITH
            <br />
            <span>CONFIDENCE.</span>
          </h1>

          <p className="hero-description">
            Welcome to RoyalBet. A modern entertainment experience designed
            around you.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="primary-button">
              Create Account
              <ArrowRight size={19} />
            </Link>

            <Link href="/login" className="secondary-button">
              I already have an account
            </Link>
          </div>

          <div className="hero-visual">
            <div className="visual-glow" />

            <div className="royal-card">
              <div className="card-top">
                <span>ROYALBET</span>
                <Sparkles size={19} />
              </div>

              <div className="card-symbol">♛</div>

              <div className="card-bottom">
                <span>YOUR GAME.</span>
                <span>YOUR CHOICE.</span>
              </div>
            </div>

            <div className="floating-star star-one">✦</div>
            <div className="floating-star star-two">✧</div>
            <div className="floating-star star-three">✦</div>
          </div>
        </section>

        <section className="features">
          <div className="section-heading">
            <span className="eyebrow">THE ROYAL EXPERIENCE</span>
            <h2>Made for you.</h2>
            <p>A simple experience from the moment you arrive.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={23} />
            </div>

            <div className="feature-content">
              <h3>Your account, your space</h3>
              <p>Access your personal account after signing in.</p>
            </div>

            <ChevronRight size={19} className="feature-arrow" />
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={23} />
            </div>

            <div className="feature-content">
              <h3>A clean experience</h3>
              <p>Enjoy a simple interface designed for mobile screens.</p>
            </div>

            <ChevronRight size={19} className="feature-arrow" />
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Trophy size={23} />
            </div>

            <div className="feature-content">
              <h3>Your journey starts here</h3>
              <p>Create an account to get started.</p>
            </div>

            <ChevronRight size={19} className="feature-arrow" />
          </div>
        </section>

        <section className="bottom-cta">
          <div className="cta-decoration">♛</div>

          <span className="eyebrow">WELCOME TO ROYALBET</span>

          <h2>Ready to get started?</h2>

          <p>Create your account to continue.</p>

          <Link href="/register" className="primary-button bottom-button">
            Join RoyalBet
            <ArrowRight size={19} />
          </Link>
        </section>

        <footer className="footer">
          <Link href="/" className="footer-logo">
            ROYAL<span>BET</span>
          </Link>

          <div className="footer-links">
            <Link href="/terms">Terms</Link>
            <span>•</span>
            <Link href="/privacy">Privacy</Link>
          </div>

          <p>© {new Date().getFullYear()} RoyalBet. All rights reserved.</p>

          <p className="responsible-text">
            18+ only. Please play responsibly.
          </p>
        </footer>
      </div>
    </main>
  );
}