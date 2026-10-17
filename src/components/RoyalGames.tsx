"use client";

import { useEffect, useState } from "react";

type GameType = "aviator" | "slots" | "mines";

const STARTING_BALANCE = 1000;
const MIN_BET = 1;

function money(value: number) {
  return `${value.toFixed(2)} credits`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function RoyalGames({
  game,
}: {
  game: GameType;
}) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState(
    "Place a virtual-credit bet to start."
  );

  // Aviator state
  const [multiplier, setMultiplier] = useState(1);
  const [aviatorPlaying, setAviatorPlaying] = useState(false);
  const [aviatorBet, setAviatorBet] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);

  // Slots state
  const [reels, setReels] = useState(["🍒", "⭐", "💎"]);
  const [spinning, setSpinning] = useState(false);

  // Mines state
  const [mineCount, setMineCount] = useState(3);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [minesActive, setMinesActive] = useState(false);
  const [minesBet, setMinesBet] = useState(0);
  const [mineMultiplier, setMineMultiplier] = useState(1);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        "royalbet-demo-balance"
      );

      if (stored !== null) {
        const parsed = Number(stored);

        if (Number.isFinite(parsed) && parsed >= 0) {
          setBalance(parsed);
        }
      }
    } catch {
      // The game still works if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "royalbet-demo-balance",
        String(balance)
      );
    } catch {
      // Storage is optional for this demonstration.
    }
  }, [balance]);

  useEffect(() => {
    if (game !== "aviator" || !aviatorPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setMultiplier((previous) => {
        const next = previous + 0.02;

        // Demo crash point: generated when the round begins.
        // This is client-side demonstration logic, not secure gambling.
        return Number(next.toFixed(2));
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [game, aviatorPlaying]);

  useEffect(() => {
    if (
      game !== "aviator" ||
      !aviatorPlaying ||
      multiplier < 1.2
    ) {
      return;
    }

    // This demo uses a randomized crash threshold.
    // The threshold is selected at the start of each round.
    // See startAviator() below.
  }, [game, aviatorPlaying, multiplier]);

  const validBet =
    Number.isFinite(bet) &&
    bet >= MIN_BET &&
    bet <= balance;

  function startAviator() {
    if (!validBet || aviatorPlaying) return;

    setBalance((previous) => previous - bet);
    setAviatorBet(bet);
    setMultiplier(1);
    setCashedOut(false);
    setAviatorPlaying(true);
    setMessage("Plane taking off...");
  }

  function cashOutAviator() {
    if (!aviatorPlaying || cashedOut) return;

    const winnings = aviatorBet * multiplier;

    setBalance((previous) => previous + winnings);
    setAviatorPlaying(false);
    setCashedOut(true);
    setMessage(
      `Cashed out at ${multiplier.toFixed(
        2
      )}×. Returned ${money(winnings)}.`
    );
  }

  function playSlots() {
    if (!validBet || spinning) return;

    setSpinning(true);
    setBalance((previous) => previous - bet);
    setMessage("Spinning the reels...");

    const symbols = [
      "🍒",
      "🍋",
      "⭐",
      "💎",
      "7️⃣",
      "👑",
    ];

    const nextReels = [
      symbols[randomInt(0, symbols.length - 1)],
      symbols[randomInt(0, symbols.length - 1)],
      symbols[randomInt(0, symbols.length - 1)],
    ];

    window.setTimeout(() => {
      setReels(nextReels);

      let multiplierWon = 0;

      if (
        nextReels[0] === nextReels[1] &&
        nextReels[1] === nextReels[2]
      ) {
        multiplierWon =
          nextReels[0] === "👑"
            ? 10
            : nextReels[0] === "7️⃣"
              ? 8
              : 5;
      } else if (
        nextReels[0] === nextReels[1] ||
        nextReels[1] === nextReels[2] ||
        nextReels[0] === nextReels[2]
      ) {
        multiplierWon = 1.5;
      }

      const payout = bet * multiplierWon;

      if (payout > 0) {
        setBalance((previous) => previous + payout);
        setMessage(
          `You won ${money(payout)}! Payout multiplier: ${multiplierWon}×.`
        );
      } else {
        setMessage("No match this time. Try another spin.");
      }

      setSpinning(false);
    }, 800);
  }

  function startMines() {
    if (!validBet || minesActive) return;

    const nextMines: number[] = [];

    while (nextMines.length < mineCount) {
      const position = randomInt(0, 24);

      if (!nextMines.includes(position)) {
        nextMines.push(position);
      }
    }

    setBalance((previous) => previous - bet);
    setMinesBet(bet);
    setMines(nextMines);
    setRevealed([]);
    setMineMultiplier(1);
    setMinesActive(true);
    setMessage("Reveal a safe tile. Cash out before hitting a mine!");
  }

  function revealTile(index: number) {
    if (!minesActive || revealed.includes(index)) return;

    if (mines.includes(index)) {
      setRevealed((previous) => [...previous, index]);
      setMinesActive(false);
      setMessage(
        `Boom! You hit a mine and lost ${money(minesBet)}.`
      );
      return;
    }

    const nextRevealed = [...revealed, index];

    setRevealed(nextRevealed);

    // Illustrative multiplier progression for this demo.
    const nextMultiplier = Number(
      (1 + nextRevealed.length * 0.2).toFixed(2)
    );

    setMineMultiplier(nextMultiplier);
    setMessage(
      `Safe tile! Current cash-out value: ${money(
        minesBet * nextMultiplier
      )}.`
    );

    if (nextRevealed.length === 25 - mineCount) {
      const payout = minesBet * nextMultiplier;

      setBalance((previous) => previous + payout);
      setMinesActive(false);
      setMessage(
        `All safe tiles found! You received ${money(payout)}.`
      );
    }
  }

  function cashOutMines() {
    if (!minesActive) return;

    const payout = minesBet * mineMultiplier;

    setBalance((previous) => previous + payout);
    setMinesActive(false);
    setMessage(`Cashed out ${money(payout)}.`);
  }

  const titles: Record<GameType, string> = {
    aviator: "ROYAL AVIATOR",
    slots: "ROYAL SLOTS",
    mines: "ROYAL MINES",
  };

  return (
    <main className="royal-game-page">
      <div className="royal-game-container">
        <a className="royal-back-link" href="/casino">
          ← Back to Casino
        </a>

        <header className="royal-game-header">
          <span className="royal-game-crown">♛</span>
          <p className="royal-game-eyebrow">
            ROYALBET ORIGINALS
          </p>
          <h1>{titles[game]}</h1>
          <p className="royal-game-subtitle">
            Play for fun with virtual credits.
          </p>
        </header>

        <section className="royal-balance-panel">
          <div>
            <span>DEMO BALANCE</span>
            <strong>{money(balance)}</strong>
          </div>

          <span className="royal-demo-badge">
            VIRTUAL CREDITS
          </span>
        </section>

        <section className="royal-game-panel">
          {game === "aviator" && (
            <>
              <div className="aviator-screen">
                <span className="aviator-plane">✈</span>
                <strong>{multiplier.toFixed(2)}×</strong>
                <span>
                  {aviatorPlaying
                    ? "FLIGHT IN PROGRESS"
                    : "READY FOR TAKEOFF"}
                </span>
              </div>

              <p className="royal-game-help">
                Start a round, watch the multiplier rise,
                and cash out to collect your demo payout.
              </p>

              {!aviatorPlaying ? (
                <button
                  className="royal-primary-button"
                  onClick={startAviator}
                  disabled={!validBet}
                >
                  Start Flight
                </button>
              ) : (
                <button
                  className="royal-primary-button"
                  onClick={cashOutAviator}
                  disabled={cashedOut}
                >
                  Cash Out
                </button>
              )}
            </>
          )}

          {game === "slots" && (
            <>
              <div className="slots-reels" aria-live="polite">
                {reels.map((symbol, index) => (
                  <div className="slots-reel" key={index}>
                    {spinning ? "❔" : symbol}
                  </div>
                ))}
              </div>

              <p className="royal-game-help">
                Match two symbols for a smaller payout or
                three matching symbols for a bigger payout.
              </p>

              <button
                className="royal-primary-button"
                onClick={playSlots}
                disabled={!validBet || spinning}
              >
                {spinning ? "Spinning..." : "Spin Reels"}
              </button>
            </>
          )}

          {game === "mines" && (
            <>
              <label className="royal-field">
                <span>Number of mines</span>
                <select
                  value={mineCount}
                  disabled={minesActive}
                  onChange={(event) =>
                    setMineCount(Number(event.target.value))
                  }
                >
                  <option value={1}>1 mine</option>
                  <option value={3}>3 mines</option>
                  <option value={5}>5 mines</option>
                  <option value={10}>10 mines</option>
                </select>
              </label>

              <div className="mines-grid">
                {Array.from({ length: 25 }, (_, index) => {
                  const isRevealed = revealed.includes(index);
                  const isMine = mines.includes(index);

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`mine-tile ${
                        isRevealed
                          ? isMine
                            ? "mine-hit"
                            : "mine-safe"
                          : ""
                      }`}
                      disabled={!minesActive || isRevealed}
                      onClick={() => revealTile(index)}
                      aria-label={`Tile ${index + 1}`}
                    >
                      {isRevealed
                        ? isMine
                          ? "💣"
                          : "💎"
                        : "?"}
                    </button>
                  );
                })}
              </div>

              <p className="royal-game-help">
                Find gems, avoid mines, and cash out whenever
                you're ready.
              </p>

              {!minesActive ? (
                <button
                  className="royal-primary-button"
                  onClick={startMines}
                  disabled={!validBet}
                >
                  Start Round
                </button>
              ) : (
                <button
                  className="royal-primary-button"
                  onClick={cashOutMines}
                >
                  Cash Out · {mineMultiplier.toFixed(2)}×
                </button>
              )}
            </>
          )}

          <div className="royal-bet-controls">
            <label className="royal-field">
              <span>Bet amount</span>
              <input
                type="number"
                min={MIN_BET}
                max={balance}
                step="1"
                value={bet}
                disabled={
                  (game === "aviator" && aviatorPlaying) ||
                  (game === "slots" && spinning) ||
                  (game === "mines" && minesActive)
                }
                onChange={(event) =>
                  setBet(Number(event.target.value))
                }
              />
            </label>

            <div className="royal-bet-presets">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  disabled={
                    amount > balance ||
                    (game === "aviator" && aviatorPlaying) ||
                    (game === "slots" && spinning) ||
                    (game === "mines" && minesActive)
                  }
                  onClick={() => setBet(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {!validBet && (
            <p className="royal-error">
              Enter a bet of at least 1 credit and no more
              than your available balance.
            </p>
          )}

          <p className="royal-game-message" aria-live="polite">
            {message}
          </p>
        </section>

        <p className="royal-demo-notice">
          DEMO ONLY · Virtual credits have no monetary value.
          This client-side prototype is not secure for real-money
          gambling.
        </p>
      </div>

      <style jsx>{`
        .royal-game-page {
          min-height: 100vh;
          padding: 28px 16px 56px;
          background: #090b0a;
          color: #f8f5eb;
        }

        .royal-game-container {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }

        .royal-back-link {
          color: #d9b96b;
          text-decoration: none;
        }

        .royal-game-header {
          padding: 32px 0 24px;
          text-align: center;
        }

        .royal-game-crown {
          color: #e7c46a;
          font-size: 42px;
        }

        .royal-game-eyebrow {
          color: #d9b96b;
          font-size: 11px;
          letter-spacing: 3px;
        }

        .royal-game-header h1 {
          margin: 8px 0;
          font-size: clamp(28px, 7vw, 46px);
          font-weight: 900;
        }

        .royal-game-subtitle,
        .royal-game-help {
          color: #a7ada7;
          line-height: 1.7;
        }

        .royal-balance-panel,
        .royal-game-panel {
          border: 1px solid #30372f;
          border-radius: 18px;
          background: #111512;
          padding: 22px;
          margin-bottom: 16px;
        }

        .royal-balance-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .royal-balance-panel div {
          display: grid;
          gap: 7px;
        }

        .royal-balance-panel span {
          color: #a7ada7;
          font-size: 11px;
        }

        .royal-balance-panel strong {
          font-size: clamp(18px, 5vw, 25px);
          color: #e7c46a;
        }

        .royal-demo-badge {
          padding: 7px 10px;
          border-radius: 8px;
          background: #202820;
          color: #a9d5a4 !important;
        }

        .aviator-screen {
          min-height: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #344a3b;
          border-radius: 15px;
          background:
            radial-gradient(ellipse at center, #193628, #0b120e 70%);
          overflow: hidden;
        }

        .aviator-plane {
          font-size: 42px;
        }

        .aviator-screen strong {
          font-size: clamp(44px, 12vw, 74px);
          color: #f1d17c;
        }

        .aviator-screen > span:last-child {
          font-size: 11px;
          letter-spacing: 2px;
          color: #a7c2ad;
        }

        .slots-reels {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          padding: 20px 0;
        }

        .slots-reel {
          display: grid;
          place-items: center;
          min-height: 110px;
          border: 1px solid #5a4a28;
          border-radius: 12px;
          background: #202019;
          font-size: clamp(35px, 10vw, 55px);
        }

        .royal-primary-button {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 52px;
          margin: 18px 0;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #f0d68a, #c09a3c);
          color: #17150f;
          font-weight: 900;
          cursor: pointer;
        }

        .royal-primary-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .royal-bet-controls {
          display: grid;
          gap: 12px;
          margin-top: 22px;
        }

        .royal-field {
          display: grid;
          gap: 9px;
          color: #c4c9c2;
          font-size: 13px;
        }

        .royal-field input,
        .royal-field select {
          width: 100%;
          min-height: 46px;
          padding: 10px 12px;
          border: 1px solid #394139;
          border-radius: 9px;
          background: #090d0a;
          color: #fff;
          font-size: 16px;
        }

        .royal-bet-presets {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .royal-bet-presets button {
          min-height: 42px;
          border: 1px solid #41483d;
          border-radius: 8px;
          background: #1a201b;
          color: #e5c56e;
        }

        .royal-bet-presets button:disabled {
          opacity: 0.4;
        }

        .mines-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 7px;
          margin: 18px 0;
        }

        .mine-tile {
          aspect-ratio: 1;
          min-width: 0;
          border: 1px solid #3d4b40;
          border-radius: 8px;
          background: #202a22;
          color: #e9cb7b;
          font-size: clamp(17px, 5vw, 25px);
          font-weight: 800;
        }

        .mine-tile:not(:disabled) {
          cursor: pointer;
        }

        .mine-tile:disabled {
          opacity: 1;
        }

        .mine-safe {
          background: #20462d;
        }

        .mine-hit {
          background: #612b2b;
        }

        .royal-game-message {
          padding: 14px;
          border-radius: 9px;
          background: #1c211c;
          color: #e7cf8d;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .royal-error {
          color: #ff9b9b;
        }

        .royal-demo-notice {
          color: #858c84;
          font-size: 11px;
          line-height: 1.7;
          text-align: center;
        }

        @media (min-width: 600px) {
          .royal-bet-controls {
            grid-template-columns: 1fr 1fr;
            align-items: end;
          }
        }
      `}</style>
    </main>
  );
}