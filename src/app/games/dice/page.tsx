"use client";

import { useState } from "react";
import Link from "next/link";

export default function DiceGamePage() {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(5);
  const [diceNumber, setDiceNumber] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("Pick a number from 1 to 6");
  const [lastBet, setLastBet] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<"win" | "lose" | null>(null);
  const [demoBalance, setDemoBalance] = useState(100);
  const [history, setHistory] = useState<
    { number: number; bet: number; result: "win" | "lose"; payout: number }[]
  >([]);

  const multiplier = 5.4;

  function rollDice() {
    if (selectedNumber === null) {
      setMessage("Please select a number first.");
      return;
    }

    if (betAmount < 5 || betAmount > 100) {
      setMessage("Your bet must be between 5 and 100 USDT.");
      return;
    }

    if (betAmount > demoBalance) {
      setMessage("Insufficient demo balance.");
      return;
    }

    if (rolling) return;

    setRolling(true);
    setMessage("Rolling the dice...");
    setLastResult(null);
    setDemoBalance((balance) => balance - betAmount);

    let ticks = 0;

    const animation = setInterval(() => {
      setDiceNumber(Math.floor(Math.random() * 6) + 1);
      ticks++;

      if (ticks >= 12) {
        clearInterval(animation);

        const result = Math.floor(Math.random() * 6) + 1;
        const won = result === selectedNumber;
        const payout = won ? betAmount * multiplier : 0;

        setDiceNumber(result);
        setLastBet(betAmount);
        setLastResult(won ? "win" : "lose");
        setDemoBalance((balance) => balance + payout);

        setMessage(
          won
            ? `🎉 You won ${payout.toFixed(2)} USDT!`
            : `You lost. The dice landed on ${result}.`,
        );

        setHistory((previous) => [
          {
            number: result,
            bet: betAmount,
            result: won ? "win" : "lose",
            payout,
          },
          ...previous,
        ].slice(0, 10));

        setRolling(false);
      }
    }, 100);
  }

  return (
    <main className="page-container">
      <div style={{ padding: "25px 0" }}>
        <Link href="/games" className="text-link">
          ← Back to Games
        </Link>
      </div>

      <section
        style={{
          maxWidth: 850,
          margin: "0 auto 60px",
          padding: 24,
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "var(--surface)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            ROYALBET CASINO
          </span>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(30px, 6vw, 45px)",
              margin: "14px 0",
            }}
          >
            Dice <span className="gold-text">Roll</span>
          </h1>

          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Pick your lucky number. Match the dice to win.
          </p>
        </div>

        <div
          style={{
            padding: 20,
            background: "#0b0e0b",
            border: "1px solid var(--border)",
            borderRadius: 12,
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          <span
            style={{
              color: "var(--muted)",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            DEMO BALANCE
          </span>

          <h2 style={{ color: "var(--gold)", fontSize: 30, margin: "10px 0" }}>
            {demoBalance.toFixed(2)} USDT
          </h2>

          <small style={{ color: "var(--muted)" }}>
            Demo credits only — no real money is used.
          </small>
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 140,
              height: 140,
              margin: "0 auto 20px",
              display: "grid",
              placeItems: "center",
              fontSize: 85,
              color: "var(--gold-light)",
              background: "radial-gradient(circle, #214b35, #0b0e0b)",
              border: "2px solid var(--gold)",
              borderRadius: 22,
              boxShadow: "0 0 30px rgba(215,180,106,0.12)",
            }}
          >
            {diceNumber ?? "🎲"}
          </div>

          <p
            style={{
              color:
                lastResult === "win"
                  ? "var(--success)"
                  : lastResult === "lose"
                    ? "var(--danger)"
                    : "var(--text)",
              fontWeight: 700,
              minHeight: 24,
            }}
          >
            {message}
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ textAlign: "center", marginBottom: 15 }}>
            1. Pick Your Number
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <button
                key={number}
                onClick={() => setSelectedNumber(number)}
                disabled={rolling}
                style={{
                  minHeight: 52,
                  borderRadius: 9,
                  border:
                    selectedNumber === number
                      ? "2px solid var(--gold-light)"
                      : "1px solid var(--border)",
                  background:
                    selectedNumber === number
                      ? "var(--green)"
                      : "#0b0e0b",
                  color: "var(--text)",
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {number}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 25 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <h3>2. Choose Your Bet</h3>
            <strong style={{ color: "var(--gold)" }}>
              {betAmount} USDT
            </strong>
          </div>

          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={betAmount}
            disabled={rolling}
            onChange={(event) => setBetAmount(Number(event.target.value))}
            style={{ width: "100%", accentColor: "var(--gold)" }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--muted)",
              fontSize: 11,
              marginTop: 8,
            }}
          >
            <span>Minimum: 5 USDT</span>
            <span>Maximum: 100 USDT</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 8,
              marginTop: 15,
            }}
          >
            {[5, 10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={rolling}
                className="button button-outline"
                style={{
                  padding: "10px 5px",
                  borderColor:
                    betAmount === amount ? "var(--gold)" : undefined,
                  color:
                    betAmount === amount
                      ? "var(--gold-light)"
                      : undefined,
                }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 16,
            background: "#0b0e0b",
            borderRadius: 9,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <small style={{ color: "var(--muted)" }}>Potential payout</small>
            <h3 style={{ color: "var(--success)", margin: "8px 0 0" }}>
              {(betAmount * multiplier).toFixed(2)} USDT
            </h3>
          </div>

          <div style={{ textAlign: "right" }}>
            <small style={{ color: "var(--muted)" }}>Win multiplier</small>
            <h3 style={{ margin: "8px 0 0" }}>5.4×</h3>
          </div>
        </div>

        <button
          onClick={rollDice}
          disabled={rolling || selectedNumber === null || betAmount > demoBalance}
          className="button button-gold"
          style={{
            width: "100%",
            minHeight: 54,
            fontSize: 15,
            opacity:
              rolling || selectedNumber === null || betAmount > demoBalance
                ? 0.6
                : 1,
          }}
        >
          {rolling ? "Rolling..." : `ROLL DICE — ${betAmount} USDT`}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 10,
            lineHeight: 1.8,
            marginTop: 18,
          }}
        >
          Demo game only. The balance is simulated and has no cash value.
          Real-money betting requires secure server-side game logic, verified
          balances, and applicable licensing.
        </p>

        {history.length > 0 && (
          <div style={{ marginTop: 35 }}>
            <h3 style={{ marginBottom: 15 }}>Recent Rolls</h3>

            <div className="table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Dice</th>
                    <th>Bet</th>
                    <th>Result</th>
                    <th>Payout</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item, index) => (
                    <tr key={`${item.number}-${index}`}>
                      <td>{item.number}</td>
                      <td>{item.bet} USDT</td>
                      <td
                        className={
                          item.result === "win" ? "positive" : "negative"
                        }
                      >
                        {item.result === "win" ? "WIN" : "LOSS"}
                      </td>
                      <td>{item.payout.toFixed(2)} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}