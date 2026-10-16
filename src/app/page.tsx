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
        {/* HEADER */}
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

        {/* HERO */}
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

        {/* FEATURES */}
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
              <p>
                Access your personal account after signing in.
              </p>
            </div>

            <ChevronRight size={19} className="feature-arrow" />
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={23} />
            </div>

            <div className="feature-content">
              <h3>A clean experience</h3>
              <p>
                Enjoy a simple interface designed for mobile screens.
              </p>
            </div>

            <ChevronRight size={19} className="feature-arrow" />
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Trophy size={23} />
            </div>

            <div className="feature-content">
              <h3>Your journey starts here</h3>
              <p>
                Create an account to get started.
              </p>
            </div>

            <ChevronRight size={19} className="feature-arrow" />
          </div>
        </section>

        {/* BOTTOM CTA */}
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

        {/* FOOTER */}
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

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #090909;
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          padding: 0;
          background: #090909;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          -webkit-font-smoothing: antialiased;
          -webkit-text-size-adjust: 100%;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .home {
          min-height: 100vh;
          background:
            radial-gradient(
              ellipse at 50% 15%,
              rgba(184, 137, 39, 0.12),
              transparent 45%
            ),
            #090909;
          overflow: hidden;
        }

        .phone-container {
          width: 100%;
          max-width: 480px;
          min-height: 100vh;
          margin: 0 auto;
          padding: 0 20px;
          overflow: hidden;
        }

        /* HEADER */

        .header {
          height: 76px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 37px;
          height: 37px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 11px;
          background: linear-gradient(145deg, #f7d987, #b78626);
          color: #171006;
          font-size: 25px;
          font-weight: 900;
          font-family: Georgia, serif;
          box-shadow: 0 4px 20px rgba(214, 168, 69, 0.15);
        }

        .logo-text {
          font-size: 19px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .logo-text span,
        .footer-logo span {
          color: #d9ad4c;
        }

        .header-login {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 17px;
          border: 1px solid rgba(224, 184, 92, 0.45);
          border-radius: 10px;
          color: #f0d28d;
          font-size: 14px;
          font-weight: 700;
          -webkit-tap-highlight-color: transparent;
        }

        /* HERO */

        .hero {
          position: relative;
          padding-top: 38px;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          max-width: 100%;
          padding: 9px 12px;
          border: 1px solid rgba(216, 176, 80, 0.2);
          border-radius: 30px;
          background: rgba(213, 168, 64, 0.06);
          color: #d9bd7b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #d8b253;
          box-shadow: 0 0 10px rgba(216, 178, 83, 0.7);
        }

        .hero-crown {
          margin-top: 27px;
          color: #e0b956;
          font-family: Georgia, serif;
          font-size: 47px;
          line-height: 1;
          text-shadow: 0 0 35px rgba(218, 173, 69, 0.2);
        }

        .hero h1 {
          margin: 18px 0 0;
          font-size: clamp(36px, 10vw, 49px);
          line-height: 1.02;
          letter-spacing: -1.8px;
          font-weight: 950;
        }

        .hero h1 span {
          color: #e0b956;
        }

        .hero-description {
          max-width: 320px;
          margin: 19px auto 0;
          color: #a5a5a5;
          font-size: 15px;
          line-height: 1.75;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 27px;
        }

        .primary-button {
          width: 100%;
          min-height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          padding: 14px 18px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(110deg, #f0d28a, #c39332);
          color: #171006;
          font-size: 15px;
          font-weight: 900;
          box-shadow: 0 7px 25px rgba(195, 147, 50, 0.14);
          transition: transform 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .primary-button:active {
          transform: scale(0.98);
        }

        .secondary-button {
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
          color: #dedede;
          font-size: 14px;
          font-weight: 700;
          -webkit-tap-highlight-color: transparent;
        }

        /* ROYAL CARD */

        .hero-visual {
          height: 235px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 18px;
        }

        .visual-glow {
          position: absolute;
          width: 240px;
          height: 160px;
          border-radius: 50%;
          background: rgba(191, 144, 43, 0.15);
          filter: blur(65px);
        }

        .royal-card {
          position: relative;
          z-index: 1;
          width: 215px;
          height: 170px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 17px;
          overflow: hidden;
          border: 1px solid rgba(236, 198, 112, 0.55);
          border-radius: 17px;
          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(235, 190, 89, 0.16),
              transparent 55%
            ),
            linear-gradient(145deg, #252016, #100f0c 70%);
          box-shadow:
            0 22px 50px rgba(0, 0, 0, 0.4),
            inset 0 0 25px rgba(235, 190, 89, 0.04);
          transform: rotate(-4deg);
        }

        .card-top,
        .card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-top {
          color: #e4c374;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .card-symbol {
          text-align: center;
          color: #e4bd64;
          font-family: Georgia, serif;
          font-size: 68px;
          line-height: 1;
          text-shadow: 0 0 35px rgba(228, 189, 100, 0.25);
        }

        .card-bottom {
          color: #bba879;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .floating-star {
          position: absolute;
          color: #e6c36f;
          text-shadow: 0 0 20px rgba(230, 195, 111, 0.5);
        }

        .star-one {
          top: 28px;
          left: 13%;
          font-size: 22px;
        }

        .star-two {
          top: 58px;
          right: 11%;
          font-size: 30px;
        }

        .star-three {
          bottom: 24px;
          left: 19%;
          font-size: 17px;
        }

        /* FEATURES */

        .features {
          padding-top: 18px;
        }

        .section-heading {
          margin-bottom: 22px;
        }

        .eyebrow {
          color: #c6a355;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .section-heading h2,
        .bottom-cta h2 {
          margin: 10px 0 0;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.7px;
        }

        .section-heading p,
        .bottom-cta p {
          margin: 10px 0 0;
          color: #929292;
          font-size: 14px;
          line-height: 1.6;
        }

        .feature-card {
          min-height: 88px;
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 11px;
          padding: 15px 13px;
          border: 1px solid rgba(255, 255, 255, 0.075);
          border-radius: 14px;
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.015)
          );
        }

        .feature-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(215, 175, 78, 0.2);
          border-radius: 12px;
          background: rgba(215, 175, 78, 0.08);
          color: #e1bd66;
        }

        .feature-content {
          flex: 1;
          min-width: 0;
        }

        .feature-content h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
        }

        .feature-content p {
          margin: 6px 0 0;
          color: #929292;
          font-size: 11px;
          line-height: 1.6;
        }

        .feature-arrow {
          flex-shrink: 0;
          color: #686868;
        }

        /* BOTTOM CTA */

        .bottom-cta {
          position: relative;
          margin-top: 30px;
          padding: 27px 19px;
          overflow: hidden;
          border: 1px solid rgba(218, 177, 79, 0.22);
          border-radius: 17px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(214, 170, 67, 0.13),
              transparent 48%
            ),
            #12110e;
        }

        .cta-decoration {
          position: absolute;
          top: -15px;
          right: 8px;
          color: rgba(218, 177, 79, 0.08);
          font-family: Georgia, serif;
          font-size: 115px;
          line-height: 1;
          pointer-events: none;
        }

        .bottom-cta h2 {
          position: relative;
          font-size: 25px;
        }

        .bottom-cta p {
          position: relative;
          margin-bottom: 20px;
        }

        .bottom-button {
          position: relative;
        }

        /* FOOTER */

        .footer {
          padding: 32px 0 25px;
          text-align: center;
        }

        .footer-logo {
          font-size: 17px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 13px;
          margin-top: 17px;
          color: #999999;
          font-size: 12px;
        }

        .footer > p {
          margin: 15px 0 0;
          color: #686868;
          font-size: 10px;
          line-height: 1.6;
        }

        .footer .responsible-text {
          margin-top: 7px;
          color: #a18a58;
        }

        /* SMALL ANDROID PHONES */

        @media (max-width: 360px) {
          .phone-container {
            padding-right: 15px;
            padding-left: 15px;
          }

          .hero h1 {
            font-size: 35px;
          }

          .hero-badge {
            font-size: 8px;
            letter-spacing: 0.7px;
          }

          .hero-description {
            font-size: 14px;
          }

          .section-heading h2 {
            font-size: 26px;
          }

          .feature-card {
            gap: 10px;
            padding: 13px 10px;
          }
        }

        /* REDUCE ANIMATION FOR ACCESSIBILITY */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}