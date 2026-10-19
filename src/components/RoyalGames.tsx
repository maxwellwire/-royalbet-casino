"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plane,
  RotateCcw,
  ShieldCheck,
  Gem,
} from "lucide-react";

type GameType = "aviator" | "slots" | "mines";

type GameResult = {
  error?: string;
  message?: string;
  balance?: number;
  payout?: number;
  net?: number;
  profit?: number;
  multiplier?: number;
  crashAt?: number;
  currentMultiplier?: number;
  reels?: string[];
  symbols?: string[];
  crashed?: boolean;
  hitMine?: boolean;
  tile?: number;
  picks?: number[];
  mines?: number[];
  potentialPayout?: number;
  cashedOut?: boolean;
  roundId?: string;
  bet?: number;
  mineCount?: number;
};

const GAME_NAMES: Record<GameType, string> = {
  aviator: "Royal Aviator",
  slots: "Royal Slots",
  mines: "Royal Mines",
};

const MINIMUM_BALANCE = 10;

export default function RoyalGames({
  game,
}: {
  game: GameType;
}) {
  const [bet, setBet] = useState("10");
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<GameResult | null>(null);

  const [active, setActive] = useState(false);
  const [roundId, setRoundId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

  const [mineCount, setMineCount] = useState("3");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mineState, setMineState] = useState<GameResult | null>(null);

  const [roundEnded, setRoundEnded] = useState(false);

  const requestGame = useCallback(
    async (
      action: string,
      extra: Record<string, unknown> = {}
    ): Promise<GameResult> => {
      const response = await fetch(`/api/games/${game}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          ...extra,
        }),
      });

      const data = (await response.json()) as GameResult;

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "The game request failed."
        );
      }

      if (typeof data.balance === "number") {
        setBalance(data.balance);
      }

      setResult(data);

      return data;
    },
    [game]
  );

  const resetRoundDisplay = () => {
    setMessage("");
    setResult(null);
    setActive(false);
    setRoundId("");
    setMultiplier(1);
    setRevealed([]);
    setMineState(null);
    setRoundEnded(false);
  };

  const getBet = () => {
    const amount = Number(bet);

    if (
      !Number.isFinite(amount) ||
      amount < 1 ||
      amount > 1000 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      setMessage(
        "Enter a bet between 1 and 1,000 USDT, with up to two decimal places."
      );
      return null;
    }

    if (balance !== null && amount > balance) {
      setMessage("Your balance is too low for this bet.");
      return null;
    }

    return amount;
  };

  async function startAviator() {
    const amount = getBet();

    if (amount === null) return;

    setBusy(true);
    setMessage("");
    setResult(null);
    setRoundEnded(false);

    try {
      const data = await requestGame("start", {
        bet: amount,
      });

      setActive(true);
      setRoundId(data.roundId ?? "");
      setMultiplier(1);

      setMessage("Round started. Cash out before the plane crashes.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not start Aviator."
      );
    } finally {
      setBusy(false);
    }
  }

  async function cashoutAviator() {
    if (!active || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("cashout");

      setActive(false);
      setRoundEnded(true);

      if (data.crashed) {
        setMessage(
          `The plane crashed at ${Number(data.crashAt ?? 0).toFixed(2)}x. Your bet was lost.`
        );
      } else {
        setMessage(
          `Cashout successful! Multiplier: ${Number(
            data.multiplier ?? 1
          ).toFixed(2)}x. Payout: ${Number(
            data.payout ?? 0
          ).toFixed(2)} USDT.`
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Cashout failed. Check your account before retrying."
      );
    } finally {
      setBusy(false);
    }
  }

  async function spinSlots() {
    const amount = getBet();

    if (amount === null) return;

    setBusy(true);
    setMessage("");
    setResult(null);

    try {
      const data = await requestGame("spin", {
        bet: amount,
      });

      const reels = Array.isArray(data.reels)
        ? data.reels.join(" ")
        : "Spin completed";

      setMessage(
        `${reels} — Payout: ${Number(data.payout ?? 0).toFixed(
          2
        )} USDT. Net result: ${Number(data.net ?? 0).toFixed(2)} USDT.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not spin the slots."
      );
    } finally {
      setBusy(false);
    }
  }

  async function startMines() {
    const amount = getBet();

    if (amount === null) return;

    setBusy(true);
    setMessage("");
    setResult(null);
    setRevealed([]);
    setMineState(null);
    setRoundEnded(false);

    try {
      const data = await requestGame("start", {
        bet: amount,
        mineCount: Number(mineCount),
      });

      setMineState(data);
      setRoundId(data.roundId ?? "");
      setActive(true);

      setMessage("Choose a tile. Avoid the mines and cash out when ready.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not start Mines."
      );
    } finally {
      setBusy(false);
    }
  }

  async function revealTile(tile: number) {
    if (!active || busy || revealed.includes(tile)) return;

    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("reveal", {
        tile,
      });

      setMineState(data);

      if (data.hitMine) {
        setRevealed((previous) =>
          previous.includes(tile) ? previous : [...previous, tile]
        );

        setActive(false);
        setRoundEnded(true);

        setMessage("You hit a mine! This round has ended.");
        return;
      }

      setRevealed((previous) =>
        previous.includes(tile) ? previous : [...previous, tile]
      );

      setMessage(
        `Safe tile! Multiplier: ${Number(
          data.multiplier ?? 1
        ).toFixed(2)}x. Potential payout: ${Number(
          data.potentialPayout ?? 0
        ).toFixed(2)} USDT.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not reveal that tile."
      );
    } finally {
      setBusy(false);
    }
  }

  async function cashoutMines() {
    if (!active || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const data = await requestGame("cashout");

      setMineState(data);
      setActive(false);
      setRoundEnded(true);

      setMessage(
        `Cashout successful! Payout: ${Number(
          data.payout ?? 0
        ).toFixed(2)} USDT at ${Number(
          data.multiplier ?? 1
        ).toFixed(2)}x.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Cashout failed. Check your account before retrying."
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (game !== "aviator" || !active || busy) return;

    const timer = window.setInterval(() => {
      setMultiplier((previous) =>
        Math.min(previous * Math.exp(100 / 5000), 100)
      );
    }, 100);

    return () => window.clearInterval(timer);
  }, [game, active, busy]);

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    minHeight: 48,
    border: "1px solid #c9a95c",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    fontSize: 15,
    background: "#d7b56d",
    color: "#10110e",
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.65 : 1,
  };

  const outlineStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "transparent",
    color: "#e5c477",
  };

  const panelStyle: React.CSSProperties = {
    background: "#111510",
    border: "1px solid #393321",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 48,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#080a08",
    color: "#fff",
    border: "1px solid #393321",
    fontSize: 16,
  };

  const minimumBalanceMet =
    balance === null || balance >= MINIMUM_BALANCE;

  return (
    <main
      className="page-container"
      style={{
        maxWidth: 860,
        paddingTop: 32,
        paddingBottom: 80,
      }}
    >
      <Link href="/casino" className="button button-outline">
        <ArrowLeft size={16} />
        Back to casino
      </Link>

      <section
        className="account-info-card"
        style={{
          padding: "clamp(20px, 4vw, 36px)",
          marginTop: 20,
        }}
      >
        <div className="eyebrow">
          <ShieldCheck size={16} />
          ROYALBET GAME
        </div>

        <h1
          style={{
            fontSize: "clamp(30px, 6vw, 44px)",
            margin: "18px 0 12px",
          }}
        >
          {GAME_NAMES[game]}
        </h1>

        <p style={{ color: "#a5aaa3", lineHeight: 1.7 }}>
          Play using your account balance. Game results and payouts
          are processed by the server.
        </p>

        <div style={panelStyle}>
          <p style={{ color: "#a5aaa3", marginTop: 0 }}>
            Available balance
          </p>

          <strong style={{ fontSize: 28, color: "#e5c477" }}>
            {balance === null
              ? "Refresh after your first game to check balance"
              : `${balance.toFixed(2)} USDT`}
          </strong>

          <p
            style={{
              color: "#a5aaa3",
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 0,
            }}
          >
            Minimum balance to start: 10 USDT.
          </p>
        </div>

        <div style={panelStyle}>
          <label
            htmlFor="royalbet-bet"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Bet amount (USDT)
          </label>

          <input
            id="royalbet-bet"
            type="number"
            min="1"
            max="1000"
            step="0.01"
            value={bet}
            onChange={(event) => setBet(event.target.value)}
            disabled={busy || active}
            style={inputStyle}
          />

          {game === "aviator" && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  background:
                    "radial-gradient(circle at center, #243426, #080a08 75%)",
                  border: "1px solid #393321",
                  borderRadius: 14,
                  padding: "35px 12px",
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                <Plane
                  size={38}
                  style={{ color: "#e5c477", marginBottom: 10 }}
                />

                <div style={{ color: "#a5aaa3" }}>
                  Display multiplier
                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: 44,
                    color: "#e5c477",
                  }}
                >
                  {multiplier.toFixed(2)}x
                </strong>

                <p style={{ color: "#a5aaa3", fontSize: 12 }}>
                  The server determines the actual crash and payout.
                </p>
              </div>

              {!active ? (
                <button
                  style={buttonStyle}
                  disabled={busy || !minimumBalanceMet}
                  onClick={startAviator}
                >
                  {busy ? "Starting round..." : "Start round"}
                </button>
              ) : (
                <button
                  style={buttonStyle}
                  disabled={busy}
                  onClick={cashoutAviator}
                >
                  {busy ? "Processing..." : "Cash out"}
                </button>
              )}
            </div>
          )}

          {game === "slots" && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: 24,
                  minHeight: 110,
                  fontSize: 40,
                  background: "#080a08",
                  border: "1px solid #393321",
                  borderRadius: 14,
                  marginBottom: 18,
                }}
              >
                {Array.isArray(result?.reels)
                  ? result.reels.map((symbol, index) => (
                      <span key={index}>{symbol}</span>
                    ))
                  : "🎰 🎰 🎰"}
              </div>

              <button
                style={buttonStyle}
                disabled={busy || !minimumBalanceMet}
                onClick={spinSlots}
              >
                {busy ? "Spinning..." : "Spin reels"}
              </button>

              {result && (
                <p style={{ color: "#e5c477", marginTop: 14 }}>
                  Payout: {Number(result.payout ?? 0).toFixed(2)} USDT
                </p>
              )}
            </div>
          )}

          {game === "mines" && (
            <div style={{ marginTop: 20 }}>
              <label
                htmlFor="royalbet-mines"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Number of mines
              </label>

              <select
                id="royalbet-mines"
                value={mineCount}
                onChange={(event) => setMineCount(event.target.value)}
                disabled={busy || active}
                style={{ ...inputStyle, marginBottom: 18 }}
              >
                {[1, 3, 5, 10, 15, 20, 24].map((number) => (
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
                {Array.from({ length: 25 }, (_, index) => {
                  const wasRevealed = revealed.includes(index);
                  const wasMine =
                    mineState?.hitMine === true &&
                    mineState.tile === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Tile ${index + 1}`}
                      disabled={!active || busy || wasRevealed}
                      onClick={() => revealTile(index)}
                      style={{
                        minWidth: 0,
                        aspectRatio: "1 / 1",
                        borderRadius: 10,
                        border: "1px solid #63532d",
                        background: wasRevealed
                          ? wasMine
                            ? "#512523"
                            : "#263526"
                          : "#171c16",
                        color: "#e5c477",
                        fontSize: 21,
                        fontWeight: 700,
                        cursor:
                          active && !busy && !wasRevealed
                            ? "pointer"
                            : "default",
                      }}
                    >
                      {wasRevealed ? (
                        wasMine ? (
                          "💣"
                        ) : (
                          <Gem size={20} />
                        )
                      ) : (
                        "?"
                      )}
                    </button>
                  );
                })}
              </div>

              {!active && !roundEnded ? (
                <button
                  style={buttonStyle}
                  disabled={busy || !minimumBalanceMet}
                  onClick={startMines}
                >
                  {busy ? "Starting game..." : "Start Mines"}
                </button>
              ) : active ? (
                <button
                  style={buttonStyle}
                  disabled={busy || revealed.length === 0}
                  onClick={cashoutMines}
                >
                  {busy ? "Processing..." : "Cash out"}
                </button>
              ) : (
                <button
                  style={buttonStyle}
                  disabled={busy}
                  onClick={resetRoundDisplay}
                >
                  <RotateCcw size={16} />
                  Play another round
                </button>
              )}
            </div>
          )}

          {message && (
            <p
              role="status"
              style={{
                color: "#e5c477",
                lineHeight: 1.7,
                marginTop: 20,
                overflowWrap: "anywhere",
              }}
            >
              {message}
            </p>
          )}

          {roundId && active && (
            <p
              style={{
                color: "#777d74",
                fontSize: 11,
                overflowWrap: "anywhere",
              }}
            >
              Round reference: {roundId}
            </p>
          )}

          <button
            type="button"
            style={{ ...outlineStyle, marginTop: 18 }}
            disabled={busy || active}
            onClick={resetRoundDisplay}
          >
            <RotateCcw size={15} />
            Reset display
          </button>
        </div>
      </section>
    </main>
  );
}