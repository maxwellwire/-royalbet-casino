"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Crown,
  Sparkles,
  ShieldCheck,
  UserRound,
  LockKeyhole,
} from "lucide-react";

type CurrentUser = {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string;
  balance?: number;
};

const MINIMUM_GAME_BALANCE = 50;

const games = [
  {
    name: "Aviator",
    category: "CRASH GAME",
    icon: "🚀",
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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) setUser(null);
          return;
        }

        const data = await response.json();

        if (active) {
          setUser(data.user ?? null);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    checkSession();

    // Refresh account status when the visitor returns to this tab.
    function handleFocus() {
      checkSession();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const isLoggedIn = Boolean(user);
  const balance = Number(user?.balance ?? 0);
  const hasMinimumBalance =
    isLoggedIn &&
    Number.isFinite(balance) &&
    balance >= MINIMUM_GAME_BALANCE;

  function gameDestination(href: string) {
    if (!isLoggedIn) {
      return `/login?next=${encodeURIComponent(href)}`;
    }

    if (!hasMinimumBalance) {
      return "/account";
    }

    return href;
  }

  return (
    <main className="royal-home">
      <div className="royal-home-content">
        {/* HERO */}
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

            {authLoading ? (
              <span className="royal-gold-button">
                Checking account...
              </span>
            ) : !isLoggedIn ? (
              <Link
                href="/login?next=%2Fcasino"
                className="royal-gold-button"
              >
                Log In to Play <LockKeyhole size={16} />
              </Link>
            ) : !hasMinimumBalance ? (
              <Link
                href="/account"
                className="royal-gold-button"
              >
                Fund Your Account <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/casino"
                className="royal-gold-button"
              >
                Start Playing <ArrowRight size={16} />
              </Link>
            )}
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

        {/* PROMOTION */}
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

          <a
            href="https://t.me/RoyalBetPayments"
            target="_blank"
            rel="noopener noreferrer"
            className="royal-promo-button"
          >
            Claim Offer <ArrowRight size={15} />
          </a>
        </section>

        {/* FEATURED GAMES */}
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
              href={
                !isLoggedIn
                  ? "/login?next=%2Fcasino"
                  : !hasMinimumBalance
                    ? "/account"
                    : "/casino"
              }
              className="royal-view-all"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div className="royal-games-grid">
            {games.map((game) => {
              const destination = gameDestination(game.href);

              const actionLabel = authLoading
                ? "Checking..."
                : !isLoggedIn
                  ? "Log In to Play"
                  : !hasMinimumBalance
                    ? "Fund Account"
                    : "Play Now";

              return (
                <article
                  className={`royal-game-card royal-game-${game.style}`}
                  key={game.name}
                >
                  <Link
                    href={
                      authLoading
                        ? "/login"
                        : destination
                    }
                    className="royal-game-link"
                    aria-label={
                      authLoading
                        ? "Check account before playing"
                        : `${actionLabel}: ${game.name}`
                    }
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
                        {actionLabel} <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {!authLoading && !isLoggedIn && (
            <div className="royal-home-login">
              You must log in before playing any game.{" "}
              <Link href="/login?next=%2Fcasino">
                Log in now
              </Link>
            </div>
          )}

          {!authLoading &&
            isLoggedIn &&
            !hasMinimumBalance && (
              <div className="royal-home-login">
                Your current balance is{" "}
                <strong>
                  {Number.isFinite(balance)
                    ? balance.toFixed(2)
                    : "0.00"}{" "}
                  USDT
                </strong>
                . A minimum balance of 50 USDT is required
                to access games.{" "}
                <Link href="/account">
                  View funding options
                </Link>
              </div>
            )}
        </section>

        {/* BOTTOM ACCOUNT CTA */}
        <section className="royal-bottom-cta">
          <div className="royal-bottom-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <strong>
              {authLoading
                ? "Welcome to RoyalBet."
                : isLoggedIn
                  ? `Welcome back, ${
                      user?.username ||
                      user?.name ||
                      "Player"
                    }.`
                  : "Your Royal experience starts here."}
            </strong>

            <p>
              {authLoading
                ? "Checking your account..."
                : !isLoggedIn
                  ? "Log in or create an account to continue."
                  : !hasMinimumBalance
                    ? "Contact our support team to fund your account and unlock games."
                    : "Your account is ready. Choose an available game."}
            </p>
          </div>

          {!authLoading &&
            (isLoggedIn ? (
              <div className="royal-home-account-actions">
                <Link
                  href="/account"
                  className="royal-bottom-link"
                >
                  <UserRound size={15} />
                  My Account
                </Link>

                {hasMinimumBalance && (
                  <Link
                    href="/casino"
                    className="royal-bottom-link"
                  >
                    Play Now
                  </Link>
                )}
              </div>
            ) : (
              <div className="royal-home-account-actions">
                <Link
                  href="/login"
                  className="royal-bottom-link"
                >
                  Log In
                </Link>

                <Link
                  href="/register"
                  className="royal-bottom-link"
                >
                  Create Account
                </Link>
              </div>
            ))}
        </section>

        {!authLoading && !isLoggedIn && (
          <div className="royal-home-login">
            New to RoyalBet?{" "}
            <Link href="/register">Create an account</Link>
          </div>
        )}
      </div>
    </main>
  );
}