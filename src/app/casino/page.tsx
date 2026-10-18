"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Crown,
  Gamepad2,
  Search,
  Wallet,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

import {
  CASINO_GAMES,
  GAME_CATEGORIES,
  type GameCategory,
} from "@/lib/games";

import "./games.css";

type User = {
  username?: string | null;
  balance: number;
};

export default function CasinoPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<GameCategory>("All Games");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) =>
        response.ok ? response.json() : null
      )
      .then((data) => {
        if (active) setUser(data?.user || null);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return CASINO_GAMES.filter(
      (game) =>
        (category === "All Games" || game.category === category) &&
        (!query ||
          game.name.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query))
    );
  }, [search, category]);

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <div className="explore-hero-content">
          <span className="explore-eyebrow">
            <Sparkles size={15} /> THE ROYALBET COLLECTION
          </span>

          <h1>
            Welcome to <span>RoyalBet.</span>
          </h1>

          <p>
            Explore the RoyalBet game collection, check your recorded USDT
            balance, or manage deposit and withdrawal requests.
          </p>

          <div className="explore-stats">
            <div>
              <strong>{CASINO_GAMES.length}</strong>
              <span>GAMES LISTED</span>
            </div>

            <div className="explore-stat-divider" />

            <div>
              <strong>{CASINO_GAMES.filter((game) => game.playable).length}</strong>
              <span>AVAILABLE NOW</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
            <Link href="/wallet" className="button button-gold">
              <Wallet size={17} /> Deposit / Withdraw
            </Link>

            <Link href="/account" className="button button-outline">
              My Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="explore-hero-art" aria-hidden="true">
          <div className="explore-orbit explore-orbit-one" />
          <div className="explore-orbit explore-orbit-two" />
          <div className="explore-art-card">
            <span>♛</span>
            <strong>ROYALBET</strong>
            <small>PLAY YOUR WAY</small>
          </div>
          <span className="floating-game floating-dice">🎲</span>
          <span className="floating-game floating-diamond">💎</span>
          <span className="floating-game floating-cards">🂡</span>
        </div>
      </section>

      <section className="explore-library">
        <div className="explore-library-heading">
          <div>
            <span className="section-kicker">YOUR ROYAL LOBBY</span>
            <h2>Explore the collection</h2>
            <p>
              Giveaway rewards are admin-managed. Only games configured as
              available appear with active Play buttons.
            </p>
          </div>

          <div className="explore-game-count">{filtered.length} GAMES</div>
        </div>

        <div className="explore-toolbar">
          <label className="explore-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search games..."
              aria-label="Search games"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div className="explore-categories" aria-label="Filter games">
            {GAME_CATEGORIES.map((item) => (
              <button
                type="button"
                key={item}
                className={`category-chip ${category === item ? "active" : ""}`}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="explore-game-grid">
          {filtered.map((game) => {
            const content = (
              <>
                <div
                  className="game-artwork"
                  style={{ "--game-accent": game.accent } as CSSProperties}
                >
                  <div className="game-artwork-glow" />
                  <span className="game-symbol" aria-hidden="true">
                    {game.symbol}
                  </span>
                  <span className="game-category-label">{game.category}</span>

                  {game.playable ? (
                    <span className="game-status available">
                      <span /> AVAILABLE
                    </span>
                  ) : (
                    <span className="game-status upcoming">
                      <LockKeyhole size={11} /> COMING SOON
                    </span>
                  )}

                  {game.featured && (
                    <span className="game-featured-label">FEATURED</span>
                  )}
                </div>

                <div className="game-card-info">
                  <div>
                    <h3>{game.name}</h3>
                    <p>{game.description}</p>
                  </div>

                  <span className="game-card-arrow">
                    {game.playable ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <LockKeyhole size={16} />
                    )}
                  </span>
                </div>

                <div className="game-card-action">
                  {game.playable ? (
                    <span className="game-action-available">
                      Play Now <ArrowUpRight size={15} />
                    </span>
                  ) : (
                    <span className="game-action-upcoming">
                      Coming Soon <LockKeyhole size={13} />
                    </span>
                  )}
                </div>
              </>
            );

            return game.playable ? (
              <Link
                href={game.route}
                key={game.id}
                className="explore-game-card playable-card"
                aria-label={`Play ${game.name}`}
              >
                {content}
              </Link>
            ) : (
              <article key={game.id} className="explore-game-card upcoming-card">
                {content}
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="explore-empty">
            <Gamepad2 size={28} />
            <h3>No games found</h3>
            <p>Try a different search or category.</p>
            <button
              className="explore-reset"
              onClick={() => {
                setSearch("");
                setCategory("All Games");
              }}
            >
              Show all games
            </button>
          </div>
        )}
      </section>

      <section className="explore-bottom-cta">
        <div>
          <span className="section-kicker">ROYALBET WALLET</span>
          <h2>{user ? `Welcome back, ${user.username || "Player"}.` : "Manage your USDT wallet."}</h2>
          <p>
            {user
              ? `Your recorded balance is ${Number(user.balance).toFixed(2)} USDT. Giveaway rewards are issued by an administrator.`
              : "Log in to view your balance and transaction requests."}
          </p>
        </div>

        <div className="explore-available-actions">
          <Link href="/wallet" className="explore-play-button">
            <Wallet size={17} /> Open Wallet <ArrowUpRight size={17} />
          </Link>

          {CASINO_GAMES.filter((game) => game.playable).map((game) => (
            <Link key={game.id} href={game.route} className="explore-play-button">
              <Gamepad2 size={17} />
              {game.name}
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}