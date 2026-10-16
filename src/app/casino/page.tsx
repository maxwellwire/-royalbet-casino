import Link from "next/link";
import { ArrowUpRight, Dice5, Sparkles } from "lucide-react";

export default function CasinoPage() {
  return (
    <div className="page-container">
      <section className="page-heading">
        <div className="eyebrow">
          <Sparkles size={15} />
          THE ROYAL GAME ROOM
        </div>

        <h1>
          CASINO <span className="gold-text">LOBBY</span>
        </h1>

        <p>
          Choose a game and experience the RoyalBet interface.
          Games currently use virtual credits only.
        </p>
      </section>

      <div className="game-grid">
        <article className="game-card">
          <div className="game-art dice-art">
            <Dice5 size={80} strokeWidth={1.2} />
            <span className="game-label">LIVE GAME LOGIC</span>
          </div>

          <div className="game-card-content">
            <div>
              <h2>Royal Dice</h2>
              <p>Choose a target and test your luck.</p>
            </div>

            <Link
              href="/casino/dice"
              className="icon-button"
              aria-label="Open Royal Dice"
            >
              <ArrowUpRight size={22} />
            </Link>
          </div>
        </article>

        <article className="game-card game-card-locked">
          <div className="game-art roulette-art">
            <div className="roulette-circle">R</div>
            <span className="game-label">COMING LATER</span>
          </div>

          <div className="game-card-content">
            <div>
              <h2>Royal Roulette</h2>
              <p>Reserved for a future game implementation.</p>
            </div>

            <span className="coming-soon">COMING SOON</span>
          </div>
        </article>

        <article className="game-card game-card-locked">
          <div className="game-art cards-art">
            <div className="playing-card">A<span>♠</span></div>
            <div className="playing-card red-card">K<span>♥</span></div>
            <span className="game-label">COMING LATER</span>
          </div>

          <div className="game-card-content">
            <div>
              <h2>Royal Cards</h2>
              <p>A future game concept, not yet playable.</p>
            </div>

            <span className="coming-soon">COMING SOON</span>
          </div>
        </article>
      </div>
    </div>
  );
}