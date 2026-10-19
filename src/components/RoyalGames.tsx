"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck } from "lucide-react";

type GameType = "aviator" | "slots" | "mines";

type GameResult = {
  error?: string;
  message?: string;
  balance?: number;
  payout?: number;
  profit?: number;
  multiplier?: number;
  crashAt?: number;
  currentMultiplier?: number;
  symbols?: string[];
  winnings?: number;
  [key: string]: unknown;
};

const GAME_NAMES: Record<GameType, string> = {
  aviator: "Royal Aviator",
  slots: "Royal Slots",
  mines: "Royal Mines",
};

export default function RoyalGames({ game }: { game: GameType }) {
  const [bet, setBet] = useState("10");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<GameResult | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [active, setActive] = useState(false);
  const [mineCount, setMineCount] = useState("3");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mineState, setMineState] = useState<Record<string, unknown> | null>(null);

  const requestGame = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const response = await fetch(`/api/games/${game}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });

      const data = (await response.json()) as GameResult;

      if (!response.ok) {
        throw new Error(data.error || data.message || "Game request failed.");
      }

      if (typeof data.balance === "number") {
        setBalance(data.balance);
      }

      setResult(data);
      return data;
    },
    [game]
  );

  async function play(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setMessage("");

    try {
      await requestGame(action, extra);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function startAviator() {
    const amount = Number(bet);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid bet amount.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("start", { bet: amount });
      setActive(true);
      setMultiplier(1);

      if (typeof data.currentMultiplier === "number") {
        setMultiplier(data.currentMultiplier);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start game.");
    } finally {
      setBusy(false);
    }
  }

  async function cashout() {
    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("cashout");
      setActive(false);
      setMessage(
        `Cashout complete. Payout: ${Number(data.payout ?? 0).toFixed(2)} USDT`
      );
    } catch (error) {
      setActive(false);
      setMessage(error instanceof Error ? error.message : "Cashout failed.");
    } finally {
      setBusy(false);
    }
  }

  async function spinSlots() {
    const amount = Number(bet);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid bet amount.");
      return;
    }

    await play("spin", { bet: amount });
  }

  async function startMines() {
    const amount = Number(bet);
    const mines = Number(mineCount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid bet amount.");
      return;
    }

    setRevealed([]);
    setMineState(null);

    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("start", {
        bet: amount,
        mineCount: mines,
      });

      setMineState(data);
      setActive(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start Mines.");
    } finally {
      setBusy(false);
    }
  }

  async function revealMineTile(index: number) {
    if (!active || busy || revealed.includes(index)) return;

    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("reveal", { index });
      setMineState(data);
      setRevealed((old) => [...old, index]);

      if (data.won === false || data.gameOver === true) {
        setActive(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reveal tile.");
    } finally {
      setBusy(false);
    }
  }

  async function cashoutMines() {
    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("cashout");
      setMineState(data);
      setActive(false);
      setMessage(
        `Cashout complete. Payout: ${Number(data.payout ?? 0).toFixed(2)} USDT`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cashout failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (game !== "aviator" || !active || busy) return;

    const timer = window.setInterval(() => {
      setMultiplier((old) => Math.min(old + 0.05, 100));
    }, 100);

    return () => window.clearInterval(timer);
  }, [game, active, busy]);

  const buttonStyle: React.CSSProperties = {
    border: "1px solid #c9a95c",
    borderRadius: 12,
    padding: "13px 18px",
    fontWeight: 700,
    background: "#d7b56d",
    color: "#10110e",
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.6 : 1,
  };

  const outlineStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "transparent",
    color: "#e5c477",
  };

  const cardStyle: React.CSSProperties = {
    background: "#111510",
    border: "1px solid #393321",
    borderRadius: 18,
    padding: 22,
    marginTop: 20,
  };

  return (
    <main
      className="page-container"
      style={{ maxWidth: 860, paddingTop: 32, paddingBottom: 80 }}
    >
      <Link href="/casino" className="button button-outline">
        <ArrowLeft size={16} /> Back to casino
      </Link>

      <section className="account-info-card" style={{ padding: 24, marginTop: 20 }}>
        <div className="eyebrow">
          <ShieldCheck size={16} /> ROYALBET GAME
        </div>

        <h1 style={{ fontSize: "clamp(30px, 6vw, 44px)", margin: "16px 0" }}>
          {GAME_NAMES[game]}
        </h1>

        <p style={{ color: "#a5aaa3" }}>
          Balance: {balance === null ? "Loading from account" : `${balance.toFixed(2)} USDT`}
        </p>

        <div style={cardStyle}>
          <label htmlFor="bet-amount" style={{ display: "block", marginBottom: 8 }}>
            Bet amount (USDT)
          </label>

          <input
            id="bet-amount"
            type="number"
            min="1"
            max="100"
            step="0.01"
            value={bet}
            onChange={(event) => setBet(event.target.value)}
            disabled={busy || active}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              background: "#080a08",
              color: "#fff",
              border: "1px solid #393321",
              fontSize: 16,
              marginBottom: 18,
            }}
          />

          {game === "aviator" && (
            <div>
              <div
                style={{
                  background: "#080a08",
                  border: "1px solid #393321",
                  borderRadius: 14,
                  padding: "32px 12px",
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                <div style={{ color: "#a5aaa3" }}>Multiplier</div>
                <strong style={{ fontSize: 44, color: "#e5c477" }}>
                  {multiplier.toFixed(2)}x
                </strong>
              </div>

              {!active ? (
                <button
                  style={buttonStyle}
                  disabled={busy}
                  onClick={startAviator}
                >
                  {busy ? "Starting..." : "Start round"}
                </button>
              ) : (
                <button
                  style={buttonStyle}
                  disabled={busy}
                  onClick={cashout}
                >
                  {busy ? "Processing..." : "Cash out"}
                </button>
              )}
            </div>
          )}

          {game === "slots" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  padding: 24,
                  fontSize: 42,
                  background: "#080a08",
                  borderRadius: 14,
                  marginBottom: 18,
                }}
              >
                {Array.isArray(result?.symbols)
                  ? result.symbols.map((symbol, index) => (
                      <span key={index}>{symbol}</span>
                    ))
                  : "🎰 🎰 🎰"}
              </div>

              <button
                style={buttonStyle}
                disabled={busy}
                onClick={spinSlots}
              >
                {busy ? "Spinning..." : "Spin"}
              </button>
            </div>
          )}

          {game === "mines" && (
            <div>
              <label htmlFor="mine-count">Number of mines</label>
              <select
                id="mine-count"
                value={mineCount}
                onChange={(event) => setMineCount(event.target.value)}
                disabled={busy || active}
                style={{
                  display: "block",
                  width: "100%",
                  padding: 12,
                  margin: "8px 0 18px",
                  background: "#080a08",
                  color: "#fff",
                  borderRadius: 10,
                }}
              >
                {[3, 5, 10, 15, 20].map((number) => (
                  <option key={number} value={number}>
                    {number} mines
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 8,
                  marginBottom: 18,
                }}
              >
                {Array.from({ length: 25 }, (_, index) => (
                  <button
                    key={index}
                    style={{
                      ...outlineStyle,
                      minWidth: 0,
                      padding: "12px 0",
                      background: revealed.includes(index) ? "#263526" : "#171c16",
                    }}
                    disabled={!active || busy || revealed.includes(index)}
                    onClick={() => revealMineTile(index)}
                    aria-label={`Tile ${index + 1}`}
                  >
                    {revealed.includes(index) ? "💎" : "?"}
                  </button>
                ))}
              </div>

              {!active ? (
                <button
                  style={buttonStyle}
                  disabled={busy}
                  onClick={startMines}
                >
                  {busy ? "Starting..." : "Start game"}
                </button>
              ) : (
                <button
                  style={buttonStyle}
                  disabled={busy}
                  onClick={cashoutMines}
                >
                  {busy ? "Processing..." : "Cash out"}
                </button>
              )}
            </div>
          )}

          {message && (
            <p role="status" style={{ color: "#e5c477", marginTop: 18 }}>
              {message}
            </p>
          )}

          {result && game === "slots" && (
            <p style={{ marginTop: 18 }}>
              Payout: {Number(result.payout ?? 0).toFixed(2)} USDT
            </p>
          )}

          {game === "mines" && mineState && (
            <p style={{ color: "#a5aaa3", marginTop: 14 }}>
              {String(mineState.message ?? "Choose a tile. Cash out before hitting a mine.")}
            </p>
          )}

          <button
            type="button"
            style={{ ...outlineStyle, marginTop: 18 }}
            disabled={busy}
            onClick={() => {
              setResult(null);
              setMessage("");
              setRevealed([]);
              setMineState(null);
              setActive(false);
              setMultiplier(1);
            }}
          >
            <RotateCcw size={15} style={{ verticalAlign: "middle" }} /> Reset display
          </button>
        </div>
      </section>
    </main>
  );
}