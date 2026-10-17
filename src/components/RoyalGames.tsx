"use client";

import { useEffect, useRef, useState } from "react";

type GameType = "aviator" | "slots" | "mines";

const STARTING_BALANCE = 1000;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function money(value: number) {
  return `${value.toFixed(2)} credits`;
}

export default function RoyalGames({
  game,
}: {
  game: GameType;
}) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState(
    "Choose your bet to begin."
  );

  // Aviator
  const [multiplier, setMultiplier] = useState(1);
  const [aviatorPlaying, setAviatorPlaying] = useState(false);
  const [aviatorBet, setAviatorBet] = useState(0);
  const [crashPoint, setCrashPoint] = useState(2);
  const [crashed, setCrashed] = useState(false);

  const aviatorRoundRef = useRef(false);
  const multiplierRef = useRef(1);
  const crashPointRef = useRef(2);
  const aviatorBetRef = useRef(0);

  // Slots
  const [reels, setReels] = useState(["🍒", "⭐", "💎"]);
  const [spinning, setSpinning] = useState(false);

  // Mines
  const [mineCount, setMineCount] = useState(3);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [minesActive, setMinesActive] = useState(false);
  const [minesBet, setMinesBet] = useState(0);
  const [mineMultiplier, setMineMultiplier] = useState(1);

  const validBet =
    Number.isFinite(bet) &&
    bet >= 1 &&
    bet <= balance;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("royalbet-demo-balance");

      if (saved !== null) {
        const value = Number(saved);

        if (Number.isFinite(value) && value >= 0) {
          setBalance(value);
        }
      }
    } catch {
      // Continue with the initial demo balance.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "royalbet-demo-balance",
        String(balance)
      );
    } catch {
      // Browser storage is optional.
    }
  }, [balance]);

  // Aviator crash engine.
  // The multiplier advances on a timer and the round ends at crashPoint.
  useEffect(() => {
    if (game !== "aviator" || !aviatorPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!aviatorRoundRef.current) {
        return;
      }

      const next = Number(
        (multiplierRef.current + 0.02).toFixed(2)
      );

      if (next >= crashPointRef.current) {
        multiplierRef.current = crashPointRef.current;

        setMultiplier(crashPointRef.current);
        setAviatorPlaying(false);
        setCrashed(true);

        aviatorRoundRef.current = false;

        setMessage(
          `CRASH at ${crashPointRef.current.toFixed(2)}×! ` +
            `You lost ${money(aviatorBetRef.current)}.`
        );

        return;
      }

      multiplierRef.current = next;
      setMultiplier(next);
    }, 100);

    return () => window.clearInterval(timer);
  }, [game, aviatorPlaying]);

  function startAviator() {
    if (!validBet || aviatorPlaying) return;

    // Demo crash point: 1.20× to 8.00×.
    // This is client-side demonstration logic, not secure gambling.
    const nextCrash = randomInt(120, 800) / 100;

    multiplierRef.current = 1;
    crashPointRef.current = nextCrash;
    aviatorBetRef.current = bet;

    setCrashPoint(nextCrash);
    setMultiplier(1);
    setAviatorBet(bet);
    setCrashed(false);
    setBalance((previous) => previous - bet);

    aviatorRoundRef.current = true;

    setMessage("Plane taking off. Cash out before the crash!");
    setAviatorPlaying(true);
  }

  function cashOutAviator() {
    if (!aviatorPlaying || !aviatorRoundRef.current) return;

    const currentMultiplier = multiplierRef.current;
    const payout = Number(
      (aviatorBetRef.current * currentMultiplier).toFixed(2)
    );

    // Stop the round immediately so cash-out cannot be repeated.
    aviatorRoundRef.current = false;

    setBalance((previous) => previous + payout);
    setAviatorPlaying(false);
    setCrashed(false);

    setMessage(
      `Cashed out at ${currentMultiplier.toFixed(2)}×. ` +
        `Payout: ${money(payout)}.`
    );
  }

  function playSlots() {
    if (!validBet || spinning) return;

    setBalance((previous) => previous - bet);
    setSpinning(true);
    setMessage("Spinning...");

    const symbols = ["🍒", "🍋", "⭐", "💎", "7️⃣", "👑"];

    const nextReels = [
      symbols[randomInt(0, symbols.length - 1)],
      symbols[randomInt(0, symbols.length - 1)],
      symbols[randomInt(0, symbols.length - 1)],
    ];

    window.setTimeout(() => {
      setReels(nextReels);

      let winMultiplier = 0;

      if (
        nextReels[0] === nextReels[1] &&
        nextReels[1] === nextReels[2]
      ) {
        winMultiplier =
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
        winMultiplier = 1.5;
      }

      const payout = Number((bet * winMultiplier).toFixed(2));

      if (payout > 0) {
        setBalance((previous) => previous + payout);
        setMessage(`You won ${money(payout)} at ${winMultiplier}×!`);
      } else {
        setMessage("No match. Try another spin.");
      }

      setSpinning(false);
    }, 700);
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
    setMessage("Find gems and avoid the mines.");
  }

  function revealTile(index: number) {
    if (!minesActive || revealed.includes(index)) return;

    if (mines.includes(index)) {
      setRevealed((previous) => [...previous, index]);
      setMinesActive(false);
      setMessage(`Mine hit! You lost ${money(minesBet)}.`);
      return;
    }

    const nextRevealed = [...revealed, index];
    const nextMultiplier = Number(
      (1 + nextRevealed.length * 0.2).toFixed(2)
    );

    setRevealed(nextRevealed);
    setMineMultiplier(nextMultiplier);

    setMessage(
      `Safe! Cash-out value: ${money(
        minesBet * nextMultiplier
      )}.`
    );

    if (nextRevealed.length === 25 - mineCount) {
      const payout = Number(
        (minesBet * nextMultiplier).toFixed(2)
      );

      setBalance((previous) => previous + payout);
      setMinesActive(false);
      setMessage(`All safe tiles found! Payout: ${money(payout)}.`);
    }
  }

  function cashOutMines() {
    if (!minesActive) return;

    const payout = Number(
      (minesBet * mineMultiplier).toFixed(2)
    );

    setBalance((previous) => previous + payout);
    setMinesActive(false);
    setMessage(`Cashed out: ${money(payout)}.`);
  }

  const titles: Record<GameType, string> = {
    aviator: "ROYAL AVIATOR",
    slots: "ROYAL SLOTS",
    mines: "ROYAL MINES",
  };

  return (
    <main className="rb-mini-page">
      <div className="rb-mini-container">
        <a className="rb-mini-back" href="/casino">
          ← Casino
        </a>

        <header className="rb-mini-header">
          <span className="rb-mini-crown">♛</span>
          <h1>{titles[game]}</h1>
          <p>Virtual-credit demo</p>
        </header>

        <section className="rb-mini-balance">
          <span>YOUR BALANCE</span>
          <strong>{money(balance)}</strong>
        </section>

        <section className="rb-mini-card">
          {game === "aviator" && (
            <>
              <div
                className={`rb-aviator-square ${
                  crashed ? "rb-crashed" : ""
                }`}
              >
                <div className="rb-aviator-sky">
                  {!crashed && (
                    <span
                      className="rb-aviator-plane"
                      style={{
                        left: `${Math.min(
                          12 + (multiplier - 1) * 10,
                          78
                        )}%`,
                        bottom: `${Math.min(
                          14 + (multiplier - 1) * 8,
                          70
                        )}%`,
                      }}
                    >
                      ✈
                    </span>
                  )}

                  {crashed && (
                    <span className="rb-crash-icon">💥</span>
                  )}

                  <strong
                    className={crashed ? "rb-crash-text" : ""}
                  >
                    {crashed
                      ? "CRASHED"
                      : `${multiplier.toFixed(2)}×`}
                  </strong>

                  <small>
                    {aviatorPlaying
                      ? "CASH OUT NOW"
                      : crashed
                        ? `CRASH ${crashPoint.toFixed(2)}×`
                        : "READY"}
                  </small>
                </div>
              </div>

              <p className="rb-mini-help">
                Cash out before the multiplier crashes.
              </p>

              {!aviatorPlaying ? (
                <button
                  className="rb-mini-primary"
                  onClick={startAviator}
                  disabled={!validBet}
                >
                  Start Flight
                </button>
              ) : (
                <button
                  className="rb-mini-primary rb-cashout"
                  onClick={cashOutAviator}
                >
                  Cash Out · {multiplier.toFixed(2)}×
                </button>
              )}
            </>
          )}

          {game === "slots" && (
            <>
              <div className="rb-slots-square">
                {reels.map((symbol, index) => (
                  <div className="rb-reel" key={index}>
                    {spinning ? "❔" : symbol}
                  </div>
                ))}
              </div>

              <p className="rb-mini-help">
                Match symbols to win virtual credits.
              </p>

              <button
                className="rb-mini-primary"
                onClick={playSlots}
                disabled={!validBet || spinning}
              >
                {spinning ? "Spinning..." : "Spin"}
              </button>
            </>
          )}

          {game === "mines" && (
            <>
              <label className="rb-mini-label">
                Mines
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

              <div className="rb-mines-square">
                {Array.from({ length: 25 }, (_, index) => {
                  const shown = revealed.includes(index);
                  const isMine = mines.includes(index);

                  return (
                    <button
                      type="button"
                      key={index}
                      className={`rb-mine-tile ${
                        shown
                          ? isMine
                            ? "rb-mine-hit"
                            : "rb-mine-safe"
                          : ""
                      }`}
                      disabled={!minesActive || shown}
                      onClick={() => revealTile(index)}
                    >
                      {shown ? (isMine ? "💣" : "💎") : "·"}
                    </button>
                  );
                })}
              </div>

              <p className="rb-mini-help">
                Find gems, avoid mines, and cash out.
              </p>

              {!minesActive ? (
                <button
                  className="rb-mini-primary"
                  onClick={startMines}
                  disabled={!validBet}
                >
                  Start Round
                </button>
              ) : (
                <button
                  className="rb-mini-primary rb-cashout"
                  onClick={cashOutMines}
                >
                  Cash Out · {mineMultiplier.toFixed(2)}×
                </button>
              )}
            </>
          )}

          <div className="rb-mini-bet">
            <label className="rb-mini-label">
              Bet amount
              <input
                type="number"
                min="1"
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

            <div className="rb-mini-presets">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  type="button"
                  key={amount}
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
            <p className="rb-mini-error">
              Enter a valid bet within your available balance.
            </p>
          )}

          <p className="rb-mini-message" aria-live="polite">
            {message}
          </p>
        </section>

        <p className="rb-mini-notice">
          Demo only. Credits have no cash value.
        </p>
      </div>

      <style jsx>{`
        .rb-mini-page {
          min-height: 100vh;
          padding: 18px 12px 35px;
          background: #090b09;
          color: #f8f4e8;
        }

        .rb-mini-container {
          width: 100%;
          max-width: 390px;
          margin: 0 auto;
        }

        .rb-mini-back {
          color: #dfc477;
          text-decoration: none;
          font-size: 13px;
        }

        .rb-mini-header {
          text-align: center;
          padding: 17px 0;
        }

        .rb-mini-crown {
          color: #e5c66e;
          font-size: 27px;
        }

        .rb-mini-header h1 {
          margin: 5px 0;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .rb-mini-header p {
          margin: 4px 0;
          color: #9ca49b;
          font-size: 12px;
        }

        .rb-mini-balance {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 13px;
          margin-bottom: 12px;
          border: 1px solid #343a30;
          border-radius: 11px;
          background: #121612;
        }

        .rb-mini-balance span {
          color: #9ca49b;
          font-size: 10px;
        }

        .rb-mini-balance strong {
          color: #e5c66e;
          font-size: 14px;
        }

        .rb-mini-card {
          padding: 13px;
          border: 1px solid #343a30;
          border-radius: 13px;
          background: #111411;
        }

        /* All game boards stay compact and square. */
        .rb-aviator-square,
        .rb-slots-square,
        .rb-mines-square {
          width: 100%;
          max-width: 290px;
          aspect-ratio: 1 / 1;
          margin: 0 auto 12px;
          border-radius: 10px;
          overflow: hidden;
        }

        .rb-aviator-square {
          background: #10241b;
          border: 1px solid #31513e;
        }

        .rb-aviator-sky {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background:
            radial-gradient(circle at 50% 65%, #244b35, #102018 75%);
          overflow: hidden;
        }

        .rb-aviator-sky::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 18%;
          background: #172c20;
          border-top: 1px solid #35513b;
        }

        .rb-aviator-sky strong {
          z-index: 1;
          font-size: clamp(36px, 11vw, 54px);
          color: #e9cd7b;
        }

        .rb-aviator-sky small {
          z-index: 1;
          color: #b7c8b8;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .rb-aviator-plane {
          position: absolute;
          z-index: 2;
          font-size: 27px;
          transition: left 100ms linear, bottom 100ms linear;
          transform: rotate(-12deg);
        }

        .rb-crashed .rb-aviator-sky {
          background: radial-gradient(circle, #542b26, #1c1010 80%);
        }

        .rb-crashed .rb-aviator-sky strong {
          color: #ff9c85;
          font-size: 29px;
        }

        .rb-crash-icon {
          z-index: 2;
          font-size: 32px;
        }

        .rb-crash-text {
          color: #ff9c85 !important;
        }

        .rb-slots-square {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: center;
          gap: 7px;
          padding: 12px;
          border: 1px solid #5d4a27;
          background: radial-gradient(circle, #302619, #17140f);
        }

        .rb-reel {
          min-width: 0;
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          border-radius: 9px;
          border: 1px solid #6c5a32;
          background: #171714;
          font-size: clamp(28px, 9vw, 43px);
        }

        .rb-mines-square {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 5px;
        }

        .rb-mine-tile {
          min-width: 0;
          padding: 0;
          border: 1px solid #3c4b3e;
          border-radius: 6px;
          background: #202b22;
          color: #e7c76f;
          font-size: 22px;
          font-weight: 800;
        }

        .rb-mine-tile:disabled {
          opacity: 1;
        }

        .rb-mine-safe {
          background: #245133;
        }

        .rb-mine-hit {
          background: #682d2d;
        }

        .rb-mini-help {
          color: #a6ada4;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
          margin: 9px 0;
        }

        .rb-mini-primary {
          width: 100%;
          min-height: 44px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #f0d991, #c4a04b);
          color: #17140c;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
        }

        .rb-mini-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .rb-cashout {
          background: linear-gradient(135deg, #9ce7ac, #46a96a);
        }

        .rb-mini-bet {
          display: grid;
          gap: 9px;
          margin-top: 15px;
        }

        .rb-mini-label {
          display: grid;
          gap: 6px;
          color: #c6cbc2;
          font-size: 12px;
        }

        .rb-mini-label input,
        .rb-mini-label select {
          width: 100%;
          min-height: 41px;
          padding: 8px 10px;
          border: 1px solid #394139;
          border-radius: 7px;
          background: #090d0a;
          color: #fff;
          font-size: 16px;
        }

        .rb-mini-presets {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
        }

        .rb-mini-presets button {
          min-height: 35px;
          border: 1px solid #41483d;
          border-radius: 6px;
          background: #1a201b;
          color: #e5c56e;
        }

        .rb-mini-presets button:disabled {
          opacity: 0.4;
        }

        .rb-mini-message {
          margin: 12px 0 0;
          padding: 10px;
          border-radius: 7px;
          background: #1b211b;
          color: #e6cf8c;
          font-size: 12px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .rb-mini-error {
          color: #ff9b9b;
          font-size: 12px;
        }

        .rb-mini-notice {
          color: #858d83;
          font-size: 10px;
          line-height: 1.5;
          text-align: center;
        }
      `}</style>
    </main>
  );
}