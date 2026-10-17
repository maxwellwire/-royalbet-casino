"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type GameType = "aviator" | "slots" | "mines";
type Point = { x: number; y: number };

const STARTING_BALANCE = 1000;
const MIN_BET = 1;
const MAX_BET = 500;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function RoyalGames({ game }: { game: GameType }) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState("Place your bet to launch");
  const [loading, setLoading] = useState(false);

  // Aviator
  const [multiplier, setMultiplier] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [crashAt, setCrashAt] = useState(0);
  const [points, setPoints] = useState<Point[]>([{ x: 0, y: 92 }]);
  const [rocket, setRocket] = useState<Point>({ x: 0, y: 92 });

  const roundRef = useRef(false);
  const multiplierRef = useRef(1);
  const crashAtRef = useRef(0);
  const betRef = useRef(10);
  const balanceRef = useRef(STARTING_BALANCE);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slots
  const [slotSymbols, setSlotSymbols] = useState(["🍒", "⭐", "🍋"]);
  const [slotSpinning, setSlotSpinning] = useState(false);

  // Mines
  const [mineCount, setMineCount] = useState(3);
  const [mineTiles, setMineTiles] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [minesOver, setMinesOver] = useState(true);
  const [mineMultiplier, setMineMultiplier] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("royalbet-demo-balance");
      if (saved !== null) {
        const parsed = Number(saved);
        if (Number.isFinite(parsed) && parsed >= 0) {
          balanceRef.current = parsed;
          setBalance(parsed);
        }
      }
    } catch {
      // Continue with the demo balance if storage is unavailable.
    }
  }, []);

  const updateBalance = useCallback((next: number) => {
    const safe = Math.max(0, Math.round(next * 100) / 100);
    balanceRef.current = safe;
    setBalance(safe);

    try {
      localStorage.setItem("royalbet-demo-balance", String(safe));
    } catch {
      // The game still works without local storage.
    }
  }, []);

  const clearRoundTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      roundRef.current = false;
      clearRoundTimer();
    };
  }, [clearRoundTimer]);

  const cashOut = useCallback(() => {
    if (!roundRef.current) return;

    roundRef.current = false;
    clearRoundTimer();

    const currentMultiplier = multiplierRef.current;
    const payout = betRef.current * currentMultiplier;
    updateBalance(balanceRef.current + payout);

    setPlaying(false);
    setCrashed(false);
    setCashedOut(true);
    setMessage(`Cashed out at ${currentMultiplier.toFixed(2)}x`);
  }, [clearRoundTimer, updateBalance]);

  const startAviator = useCallback(() => {
    if (roundRef.current) return;

    const stake = Math.floor(Number(bet));
    if (!Number.isFinite(stake) || stake < MIN_BET || stake > MAX_BET) {
      setMessage(`Bet must be between ${MIN_BET} and ${MAX_BET}`);
      return;
    }

    if (stake > balanceRef.current) {
      setMessage("Insufficient demo balance");
      return;
    }

    clearRoundTimer();

    updateBalance(balanceRef.current - stake);
    betRef.current = stake;
    multiplierRef.current = 1;
    crashAtRef.current = randomInt(120, 800) / 100;
    startTimeRef.current = Date.now();

    setMultiplier(1);
    setCrashAt(crashAtRef.current);
    setPoints([{ x: 0, y: 92 }]);
    setRocket({ x: 0, y: 92 });
    setCrashed(false);
    setCashedOut(false);
    setPlaying(true);
    setMessage("Rocket launched!");

    roundRef.current = true;

    intervalRef.current = setInterval(() => {
      if (!roundRef.current) return;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const nextMultiplier = Math.exp(elapsed * 0.22);

      if (nextMultiplier >= crashAtRef.current) {
        const finalMultiplier = crashAtRef.current;
        const crashX = Math.min(94, elapsed * 10);
        const crashY = Math.max(8, 92 - Math.log(finalMultiplier) * 32);

        roundRef.current = false;
        clearRoundTimer();

        multiplierRef.current = finalMultiplier;
        setMultiplier(finalMultiplier);
        setRocket({ x: crashX, y: crashY });
        setPoints((previous) => [
          ...previous,
          { x: crashX, y: crashY },
        ]);
        setPlaying(false);
        setCrashed(true);
        setCashedOut(false);
        setMessage(`Rocket crashed at ${finalMultiplier.toFixed(2)}x`);
        return;
      }

      multiplierRef.current = nextMultiplier;
      setMultiplier(nextMultiplier);

      const x = Math.min(94, elapsed * 10);
      const y = Math.max(8, 92 - Math.log(nextMultiplier) * 32);
      const nextPoint = { x, y };

      setRocket(nextPoint);
      setPoints((previous) => [...previous, nextPoint]);
    }, 50);
  }, [bet, clearRoundTimer, updateBalance]);

  const startSlots = () => {
    if (slotSpinning || loading) return;

    const stake = Math.floor(Number(bet));
    if (!Number.isFinite(stake) || stake < MIN_BET || stake > MAX_BET) {
      setMessage("Enter a valid bet");
      return;
    }
    if (stake > balanceRef.current) {
      setMessage("Insufficient demo balance");
      return;
    }

    setLoading(true);
    setSlotSpinning(true);
    updateBalance(balanceRef.current - stake);
    setMessage("Spinning...");

    const symbols = ["🍒", "⭐", "🍋", "💎", "7️⃣", "🍀"];
    let spins = 0;

    const timer = setInterval(() => {
      setSlotSymbols([
        symbols[randomInt(0, symbols.length - 1)],
        symbols[randomInt(0, symbols.length - 1)],
        symbols[randomInt(0, symbols.length - 1)],
      ]);

      spins += 1;

      if (spins >= 12) {
        clearInterval(timer);

        const final = [
          symbols[randomInt(0, symbols.length - 1)],
          symbols[randomInt(0, symbols.length - 1)],
          symbols[randomInt(0, symbols.length - 1)],
        ];

        setSlotSymbols(final);

        const multiplier =
          final[0] === final[1] && final[1] === final[2]
            ? 5
            : final[0] === final[1] ||
                final[1] === final[2] ||
                final[0] === final[2]
              ? 1.5
              : 0;

        if (multiplier > 0) {
          const payout = stake * multiplier;
          updateBalance(balanceRef.current + payout);
          setMessage(`You won ${payout.toFixed(2)} demo credits!`);
        } else {
          setMessage("No match. Try again!");
        }

        setSlotSpinning(false);
        setLoading(false);
      }
    }, 100);
  };

  const startMines = () => {
    if (!minesOver) return;

    const stake = Math.floor(Number(bet));
    if (!Number.isFinite(stake) || stake < MIN_BET || stake > MAX_BET) {
      setMessage("Enter a valid bet");
      return;
    }
    if (stake > balanceRef.current) {
      setMessage("Insufficient demo balance");
      return;
    }

    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const position = randomInt(0, 24);
      if (!newMines.includes(position)) newMines.push(position);
    }

    updateBalance(balanceRef.current - stake);
    setMineTiles(newMines);
    setRevealed([]);
    setMineMultiplier(1);
    setMinesOver(false);
    setMessage("Pick a tile. Avoid the mines!");
  };

  const revealMine = (index: number) => {
    if (minesOver || revealed.includes(index)) return;

    if (mineTiles.includes(index)) {
      setRevealed((previous) => [...previous, index]);
      setMinesOver(true);
      setMessage("💥 Mine hit! Your bet was lost.");
      return;
    }

    const nextRevealed = [...revealed, index];
    setRevealed(nextRevealed);

    const nextMultiplier =
      Math.pow((25 - mineCount) / (25 - mineCount - nextRevealed.length + 1), nextRevealed.length) *
      0.97;

    setMineMultiplier(Math.max(1.01, nextMultiplier));
    setMessage("💎 Safe! Cash out when ready.");
  };

  const cashOutMines = () => {
    if (minesOver || revealed.length === 0) return;

    const payout = Math.floor(bet * mineMultiplier * 100) / 100;
    updateBalance(balanceRef.current + payout);
    setMinesOver(true);
    setMessage(`Cashed out for ${payout.toFixed(2)} demo credits.`);
  };

  const resetDemo = () => {
    if (roundRef.current) return;
    updateBalance(STARTING_BALANCE);
    setMessage("Demo balance reset.");
  };

  const isAviator = game === "aviator";
  const isSlots = game === "slots";
  const gameTitle = isAviator
    ? "ROCKET CRASH"
    : isSlots
      ? "ROYAL SLOTS"
      : "ROYAL MINES";

  const chartPath =
    points.length > 1
      ? points
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
          )
          .join(" ")
      : "M 0 92 L 0.1 92";

  const areaPath = `${chartPath} L ${rocket.x} 100 L 0 100 Z`;

  return (
    <main className="rg-page">
      <style jsx>{`
        .rg-page {
          min-height: 100vh;
          background: #080b0a;
          color: #f5f5f5;
          padding: 16px 12px 36px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .rg-wrap {
          max-width: 460px;
          margin: 0 auto;
        }
        .rg-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .rg-brand {
          color: #f3c76a;
          font-weight: 900;
          letter-spacing: 1.5px;
          font-size: 18px;
        }
        .rg-back {
          color: #d5d9d6;
          text-decoration: none;
          font-size: 13px;
          border: 1px solid #29312d;
          border-radius: 8px;
          padding: 9px 12px;
        }
        .rg-card {
          border: 1px solid #25312b;
          background: #0e1411;
          border-radius: 16px;
          overflow: hidden;
        }
        .rg-heading {
          padding: 15px 16px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .rg-heading h1 {
          margin: 0;
          font-size: 16px;
          letter-spacing: 1px;
          font-weight: 900;
        }
        .rg-demo {
          color: #9ba9a0;
          font-size: 10px;
          border: 1px solid #344139;
          border-radius: 6px;
          padding: 5px 7px;
          white-space: nowrap;
        }
        .rg-balance {
          padding: 12px 16px;
          border-top: 1px solid #202a24;
          border-bottom: 1px solid #202a24;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .rg-muted {
          color: #93a198;
          font-size: 12px;
        }
        .rg-amount {
          color: #f4c66a;
          font-size: 18px;
          font-weight: 900;
        }
        .rg-reset {
          color: #b8c3bc;
          background: transparent;
          border: 1px solid #334039;
          border-radius: 7px;
          padding: 7px 9px;
          font-size: 11px;
        }
        .rg-chart {
          margin: 12px auto;
          width: calc(100% - 24px);
          max-width: 400px;
          aspect-ratio: 1.12 / 1;
          position: relative;
          overflow: hidden;
          border: 1px solid #26352d;
          border-radius: 10px;
          background:
            linear-gradient(#17231d 1px, transparent 1px),
            linear-gradient(90deg, #17231d 1px, transparent 1px),
            radial-gradient(ellipse at 70% 100%, #13251a, #080f0c 70%);
          background-size: 25% 25%, 25% 25%, 100% 100%;
        }
        .rg-multiplier {
          position: absolute;
          top: 14px;
          left: 0;
          right: 0;
          z-index: 2;
          text-align: center;
          font-size: clamp(30px, 9vw, 44px);
          font-weight: 900;
          line-height: 1;
          color: #65f2a0;
          text-shadow: 0 0 22px #37f58a30;
          font-variant-numeric: tabular-nums;
        }
        .rg-status {
          position: absolute;
          top: 61px;
          left: 0;
          right: 0;
          z-index: 2;
          text-align: center;
          font-size: 11px;
          letter-spacing: 1.8px;
          color: #9caea3;
          font-weight: 800;
        }
        .rg-status.crash {
          color: #ff6464;
        }
        .rg-status.win {
          color: #68f5a5;
        }
        .rg-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .rg-rocket {
          position: absolute;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          font-size: 28px;
          transform: translate(-50%, -50%) rotate(-35deg);
          filter: drop-shadow(0 0 8px #72f5b0a0);
          z-index: 3;
          pointer-events: none;
          transition: left 50ms linear, top 50ms linear;
        }
        .rg-flame {
          position: absolute;
          font-size: 12px;
          top: 25px;
          left: 5px;
          transform: rotate(35deg);
          animation: rg-flame 0.16s infinite alternate;
        }
        @keyframes rg-flame {
          from { opacity: 0.55; transform: rotate(35deg) scale(0.8); }
          to { opacity: 1; transform: rotate(35deg) scale(1.2); }
        }
        .rg-crashmark {
          position: absolute;
          transform: translate(-50%, -50%);
          color: #ff5d5d;
          font-size: 30px;
          font-weight: 900;
          z-index: 4;
        }
        .rg-control {
          padding: 4px 14px 15px;
        }
        .rg-label {
          display: block;
          margin-bottom: 7px;
          font-size: 11px;
          color: #9ba9a0;
        }
        .rg-input-row {
          display: flex;
          gap: 8px;
          align-items: stretch;
        }
        .rg-bet-input {
          min-width: 0;
          width: 100%;
          background: #080d0a;
          border: 1px solid #344039;
          border-radius: 9px;
          color: #fff;
          padding: 13px 12px;
          font-size: 16px;
          font-weight: 800;
          outline: none;
        }
        .rg-small-btn {
          background: #17231b;
          border: 1px solid #34483a;
          color: #dce7df;
          border-radius: 8px;
          padding: 0 12px;
          font-weight: 800;
        }
        .rg-main-btn {
          width: 100%;
          min-height: 48px;
          border: 0;
          border-radius: 9px;
          margin-top: 10px;
          background: linear-gradient(135deg, #f5d27f, #dba641);
          color: #17120a;
          font-size: 13px;
          letter-spacing: 0.7px;
          font-weight: 900;
        }
        .rg-main-btn.cash {
          background: linear-gradient(135deg, #71f2a5, #25b96d);
          color: #052412;
        }
        .rg-main-btn:disabled {
          opacity: 0.5;
        }
        .rg-message {
          margin: 0;
          padding: 12px 15px;
          min-height: 44px;
          background: #0a100c;
          border-top: 1px solid #202a24;
          text-align: center;
          font-size: 12px;
          color: #c4d0c8;
        }
        .rg-footnote {
          margin-top: 12px;
          text-align: center;
          color: #77847b;
          font-size: 10px;
          line-height: 1.5;
        }
        .rg-slot-reels {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin: 26px 12px;
        }
        .rg-reel {
          display: grid;
          place-items: center;
          width: 78px;
          height: 85px;
          border-radius: 12px;
          border: 1px solid #39453d;
          background: linear-gradient(#1b261f, #0a100c);
          font-size: 38px;
        }
        .rg-mine-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 7px;
          padding: 14px;
        }
        .rg-tile {
          aspect-ratio: 1;
          min-width: 0;
          border-radius: 8px;
          border: 1px solid #35463a;
          background: #1a2920;
          color: #fff;
          font-size: clamp(17px, 5vw, 25px);
        }
        .rg-tile.safe {
          background: #163e2b;
          border-color: #2b9d62;
        }
        .rg-tile.mine {
          background: #4b1c1c;
          border-color: #b84242;
        }
        .rg-mine-tools {
          padding: 0 14px 14px;
        }
        .rg-select {
          width: 100%;
          background: #080d0a;
          color: #fff;
          border: 1px solid #344039;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
        }
        @media (max-width: 360px) {
          .rg-page { padding-left: 8px; padding-right: 8px; }
          .rg-heading { padding-left: 12px; padding-right: 12px; }
          .rg-chart { width: calc(100% - 16px); }
        }
      `}</style>

      <div className="rg-wrap">
        <header className="rg-top">
          <div className="rg-brand">ROYALBET</div>
          <Link className="rg-back" href="/casino">
            ← All games
          </Link>
        </header>

        <section className="rg-card">
          <div className="rg-heading">
            <h1>{gameTitle}</h1>
            <span className="rg-demo">DEMO CREDITS</span>
          </div>

          <div className="rg-balance">
            <div>
              <div className="rg-muted">Available balance</div>
              <div className="rg-amount">{balance.toFixed(2)}</div>
            </div>
            <button
              type="button"
              className="rg-reset"
              onClick={resetDemo}
              disabled={playing}
            >
              Reset demo
            </button>
          </div>

          {isAviator && (
            <>
              <div className="rg-chart">
                <div className="rg-multiplier">
                  {multiplier.toFixed(2)}x
                </div>
                <div
                  className={`rg-status ${crashed ? "crash" : cashedOut ? "win" : ""}`}
                >
                  {crashed
                    ? "ROCKET CRASHED"
                    : cashedOut
                      ? "CASHED OUT"
                      : playing
                        ? "ROCKET IN FLIGHT"
                        : "READY FOR LAUNCH"}
                </div>

                <svg
                  className="rg-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Live rocket multiplier chart"
                >
                  <defs>
                    <linearGradient id="rgArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#35e989" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#35e989" stopOpacity="0" />
                    </linearGradient>
                    <filter id="rgGlow">
                      <feGaussianBlur stdDeviation="1.2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {!crashed && (
                    <path d={areaPath} fill="url(#rgArea)" />
                  )}

                  <path
                    d={chartPath}
                    fill="none"
                    stroke={crashed ? "#ff5d5d" : "#55f59c"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#rgGlow)"
                  />

                  {playing && (
                    <circle
                      cx={rocket.x}
                      cy={rocket.y}
                      r="2"
                      fill="#b5ffd0"
                    />
                  )}

                  {cashedOut && (
                    <circle
                      cx={rocket.x}
                      cy={rocket.y}
                      r="2.4"
                      fill="#f4c66a"
                    />
                  )}
                </svg>

                {playing && (
                  <div
                    className="rg-rocket"
                    style={{
                      left: `${rocket.x}%`,
                      top: `${rocket.y}%`,
                    }}
                    aria-label="Rocket in flight"
                  >
                    🚀
                    <span className="rg-flame">🔥</span>
                  </div>
                )}

                {crashed && (
                  <div
                    className="rg-crashmark"
                    style={{
                      left: `${rocket.x}%`,
                      top: `${rocket.y}%`,
                    }}
                  >
                    ✹
                  </div>
                )}
              </div>

              <div className="rg-control">
                <label className="rg-label" htmlFor="rg-aviator-bet">
                  BET AMOUNT
                </label>
                <div className="rg-input-row">
                  <input
                    id="rg-aviator-bet"
                    className="rg-bet-input"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    step="1"
                    value={bet}
                    disabled={playing}
                    onChange={(event) => setBet(Number(event.target.value))}
                  />
                  <button
                    type="button"
                    className="rg-small-btn"
                    disabled={playing}
                    onClick={() =>
                      setBet((current) =>
                        Math.min(MAX_BET, Math.max(MIN_BET, current * 2)),
                      )
                    }
                  >
                    2×
                  </button>
                  <button
                    type="button"
                    className="rg-small-btn"
                    disabled={playing}
                    onClick={() => setBet(10)}
                  >
                    MAX
                  </button>
                </div>

                {playing ? (
                  <button
                    type="button"
                    className="rg-main-btn cash"
                    onClick={cashOut}
                  >
                    CASH OUT · {(bet * multiplier).toFixed(2)}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rg-main-btn"
                    onClick={startAviator}
                  >
                    🚀 LAUNCH ROCKET
                  </button>
                )}

                {crashed && (
                  <div className="rg-muted" style={{ textAlign: "center", marginTop: 9 }}>
                    Crash point: {crashAt.toFixed(2)}x
                  </div>
                )}
              </div>
            </>
          )}

          {isSlots && (
            <>
              <div className="rg-slot-reels">
                {slotSymbols.map((symbol, index) => (
                  <div className="rg-reel" key={`${index}-${symbol}`}>
                    {symbol}
                  </div>
                ))}
              </div>
              <div className="rg-control">
                <label className="rg-label" htmlFor="rg-slots-bet">
                  BET AMOUNT
                </label>
                <div className="rg-input-row">
                  <input
                    id="rg-slots-bet"
                    className="rg-bet-input"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    value={bet}
                    disabled={slotSpinning}
                    onChange={(event) => setBet(Number(event.target.value))}
                  />
                  <button
                    className="rg-small-btn"
                    disabled={slotSpinning}
                    onClick={() => setBet(10)}
                    type="button"
                  >
                    RESET
                  </button>
                </div>
                <button
                  className="rg-main-btn"
                  onClick={startSlots}
                  disabled={slotSpinning}
                  type="button"
                >
                  {slotSpinning ? "SPINNING..." : "SPIN REELS"}
                </button>
              </div>
            </>
          )}

          {!isAviator && !isSlots && (
            <>
              <div className="rg-mine-grid">
                {Array.from({ length: 25 }, (_, index) => {
                  const isRevealed = revealed.includes(index);
                  const isMine = mineTiles.includes(index);
                  const showMine = minesOver && isMine;
                  const showSafe = isRevealed && !isMine;

                  return (
                    <button
                      type="button"
                      key={index}
                      className={`rg-tile ${showMine ? "mine" : ""} ${showSafe ? "safe" : ""}`}
                      disabled={minesOver || isRevealed}
                      onClick={() => revealMine(index)}
                    >
                      {showMine ? "💣" : showSafe ? "💎" : ""}
                    </button>
                  );
                })}
              </div>

              <div className="rg-mine-tools">
                <label className="rg-label" htmlFor="rg-mine-count">
                  NUMBER OF MINES
                </label>
                <select
                  id="rg-mine-count"
                  className="rg-select"
                  value={mineCount}
                  disabled={!minesOver}
                  onChange={(event) => setMineCount(Number(event.target.value))}
                >
                  {[3, 5, 7, 10].map((count) => (
                    <option key={count} value={count}>
                      {count} mines
                    </option>
                  ))}
                </select>

                <label className="rg-label" htmlFor="rg-mines-bet" style={{ marginTop: 12 }}>
                  BET AMOUNT
                </label>
                <input
                  id="rg-mines-bet"
                  className="rg-bet-input"
                  type="number"
                  min={MIN_BET}
                  max={MAX_BET}
                  value={bet}
                  disabled={!minesOver}
                  onChange={(event) => setBet(Number(event.target.value))}
                />

                {minesOver ? (
                  <button
                    type="button"
                    className="rg-main-btn"
                    onClick={startMines}
                  >
                    START MINES
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rg-main-btn cash"
                    disabled={revealed.length === 0}
                    onClick={cashOutMines}
                  >
                    CASH OUT · {(bet * mineMultiplier).toFixed(2)}
                  </button>
                )}
              </div>
            </>
          )}

          <p className="rg-message" aria-live="polite">
            {message}
          </p>
        </section>

        <p className="rg-footnote">
          Demo game only. Credits have no cash value. Results and balances are
          stored locally in this browser and are not secure for real-money play.
        </p>
      </div>
    </main>
  );
}