"use client";

import { useState } from "react";
import { Dice5, Sparkles } from "lucide-react";

type GameResult = {
  result: number;
  won: boolean;
  bet: number;
  multiplier: number;
  profit: number;
  demoCredits: number;
};

export default function DiceGame() {
  const [bet, setBet] = useState(10);
  const [target, setTarget] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GameResult | null>(null);

  async function play() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/games/dice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bet, target })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to play.");
        return;
      }

      setResult(data);
    } catch {
      setError("Connection problem. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dice-layout">
      <section className="dice-board">
        <div className="dice-brand">
          <Dice5 size={26} />
          <span>ROYAL DICE</span>
        </div>

        <div className="dice-display">
          <div className="dice-number">
            {result ? result.result : "—"}
          </div>

          <p>
            {result
              ? result.won
                ? "YOU WIN"
                : "NOT THIS TIME"
              : "READY TO ROLL?"}
          </p>
        </div>

        {result && (
          <div className={`result-banner ${result.won ? "win" : "loss"}`}>
            <strong>
              {result.won ? "WIN" : "LOSS"}
            </strong>

            <span>
              {result.profit > 0 ? "+" : ""}
              {result.profit} virtual credits
            </span>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <p className="dice-disclaimer">
          This game uses virtual credits only. Results do not
          represent real-money gambling.
        </p>
      </section>

      <section className="dice-controls">
        <div className="eyebrow">
          <Sparkles size={15} />
          GAME CONTROLS
        </div>

        <h2>PLACE YOUR BET</h2>

        <label htmlFor="bet">Bet amount</label>

        <input
          id="bet"
          type="number"
          min={1}
          max={100}
          step={1}
          value={bet}
          onChange={(event) => {
            setBet(Number(event.target.value));
          }}
        />

        <div className="quick-bets">
          {[5, 10, 25, 50, 100].map((amount) => (
            <button
              key={amount}
              type="button"
              className={`quick-bet ${bet === amount ? "selected" : ""}`}
              onClick={() => setBet(amount)}
            >
              {amount}
            </button>
          ))}
        </div>

        <label htmlFor="target">
          Target: {target}
        </label>

        <input
          id="target"
          type="range"
          min={2}
          max={95}
          value={target}
          onChange={(event) => {
            setTarget(Number(event.target.value));
          }}
        />

        <div className="range-labels">
          <span>2 — Harder</span>
          <span>95 — Easier</span>
        </div>

        <div className="potential-card">
          <span>Illustrative payout multiplier</span>
          <strong>{(95 / target).toFixed(2)}×</strong>
          <small>Before rounding to whole virtual credits</small>
        </div>

        <button
          type="button"
          className="button button-gold button-full"
          onClick={play}
          disabled={loading || !Number.isInteger(bet) || bet < 1 || bet > 100}
        >
          {loading ? "Rolling..." : "ROLL DICE"}
        </button>
      </section>
    </div>
  );
}