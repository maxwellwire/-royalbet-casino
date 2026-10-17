"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Gamepad2,
  ArrowUpRight,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

import {
  CASINO_GAMES,
  GAME_CATEGORIES,
  type GameCategory,
} from "@/lib/games";

import "./games.css";

export default function CasinoPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<GameCategory>("All Games");

  const filteredGames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return CASINO_GAMES.filter((game) => {
      const matchesCategory =
        category === "All Games" ||
        game.category === category;

      const matchesSearch =
        !normalizedSearch ||
        game.name.toLowerCase().includes(normalizedSearch) ||
        game.description.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const playableCount = CASINO_GAMES.filter(
    (game) => game.playable
  ).length;

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <div className="explore-hero-content">
          <span className="explore-eyebrow">
            <Sparkles size={15} />
            THE ROYALBET COLLECTION
          </span>

          <h1>
            Explore <span>Games.</span>
          </h1>

          <p>
            Find your next favourite game in the RoyalBet
            collection. Discover new experiences and play
            available games using virtual credits.
          </p>

          <div className="explore-stats">
            <div>
              <strong>{CASINO_GAMES.length}</strong>
              <span>GAMES LISTED</span>
            </div>

            <div className="explore-stat-divider" />

            <div>
              <strong>{playableCount}</strong>
              <span>AVAILABLE NOW</span>
            </div>
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
            <span className="section-kicker">FIND YOUR GAME</span>
            <h2>Explore the collection</h2>
            <p>
              Browse the library and see which games are
              available to play.
            </p>
          </div>

          <div className="explore-game-count">
            {filteredGames.length}{" "}
            {filteredGames.length === 1 ? "GAME" : "GAMES"}
          </div>
        </div>

        <div className="explore-toolbar">
          <label className="explore-search">
            <Search size={19} aria-hidden="true" />

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

          <div
            className="explore-categories"
            aria-label="Filter games by category"
          >
            {GAME_CATEGORIES.map((item) => (
              <button
                type="button"
                key={item}
                className={`category-chip ${
                  category === item ? "active" : ""
                }`}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredGames.length > 0 ? (
          <div className="explore-game-grid">
            {filteredGames.map((game) => {
              const CardContent = (
                <>
                  <div
                    className="game-artwork"
                    style={
                      {
                        "--game-accent": game.accent,
                      } as React.CSSProperties
                    }
                  >
                    <div className="game-artwork-glow" />

                    <span
                      className="game-symbol"
                      aria-hidden="true"
                    >
                      {game.symbol}
                    </span>

                    <span className="game-category-label">
                      {game.category}
                    </span>

                    {game.playable ? (
                      <span className="game-status available">
                        <span />
                        AVAILABLE
                      </span>
                    ) : (
                      <span className="game-status upcoming">
                        <LockKeyhole size={11} />
                        COMING SOON
                      </span>
                    )}

                    {game.featured && (
                      <span className="game-featured-label">
                        FEATURED
                      </span>
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
                </>
              );

              return game.playable ? (
                <Link
                  href={game.route}
                  key={game.id}
                  className="explore-game-card playable-card"
                  aria-label={`Play ${game.name}`}
                >
                  {CardContent}
                </Link>
              ) : (
                <article
                  key={game.id}
                  className="explore-game-card upcoming-card"
                  aria-label={`${game.name}, coming soon`}
                >
                  {CardContent}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="explore-empty">
            <span>
              <Gamepad2 size={28} />
            </span>

            <h3>No games found</h3>

            <p>
              Try another search or select a different category.
            </p>

            <button
              type="button"
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
          <span className="section-kicker">YOUR NEXT GAME AWAITS</span>
          <h2>Ready to play?</h2>
          <p>
            Start with Royal Dice, our currently available
            virtual-credit game.
          </p>
        </div>

        <Link href="/casino/dice" className="explore-play-button">
          <Gamepad2 size={18} />
          Play Royal Dice
          <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}