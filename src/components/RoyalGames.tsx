"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameName = "aviator" | "slots" | "mines";

type ApiResult = {
  success?: boolean;
  error?: string;
  message?: string;
  balance?: number;
  roundId?: string;
  bet?: number;
  crashed?: boolean;
  crashAt?: number;
  multiplier?: number;
  payout?: number;
  net?: number;
  reels?: string[];
  mines?: number[];
  picks?: number[];
  tile?: number;
  hitMine?: boolean;
  potentialPayout?: number;
};

const GOLD = "#f4c65b";
const GREEN = "#25d366";
const RED = "#ff4545";

export default function RoyalGames() {
  const [game, setGame] = useState<GameName>("aviator");
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"good" | "bad" | "info">(
    "info"
  );

  // Aviator state
  const [multiplier, setMultiplier] = useState(1);
  const [flightStarted, setFlightStarted] = useState<number | null>(null);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [flightResult, setFlightResult] = useState("");

  // Slots state
  const [reels, setReels] = useState<string[]>(["🍒", "⭐", "🍋"]);
  const [slotPayout, setSlotPayout] = useState<number | null>(null);

  // Mines state
  const [mineCount, setMineCount] = useState(3);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [mineTiles, setMineTiles] = useState<number[]>([]);
  const [minesStarted, setMinesStarted] = useState(false);
  const [minesMultiplier, setMinesMultiplier] = useState(1);

  const flightStartedRef = useRef<number | null>(null);
  const flightTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notify = (
    text: string,
    type: "good" | "bad" | "info" = "info"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const stopFlightTimer = useCallback(() => {
    if (flightTimerRef.current) {
      clearInterval(flightTimerRef.current);
      flightTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopFlightTimer();
  }, [stopFlightTimer]);

  const requestGame = async (
    gameName: GameName,
    action: string,
    extra: Record<string, unknown> = {}
  ): Promise<ApiResult> => {
    const response = await fetch(`/api/games/${gameName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        bet,
        ...extra,
      }),
    });

    const data = (await response.json()) as ApiResult;

    if (!response.ok) {
      throw new Error(data.error || data.message || "Something went wrong.");
    }

    if (typeof data.balance === "number") {
      setBalance(data.balance);
    }

    return data;
  };

  // AVIATOR
  const startAviator = async () => {
    if (loading || playing) return;

    setLoading(true);
    setMessage("");
    setFlightResult("");
    setMultiplier(1);
    setCrashed(false);
    setCashedOut(false);

    try {
      const data = await requestGame("aviator", "start");

      flightStartedRef.current = Date.now();
      setFlightStarted(Date.now());
      setPlaying(true);

      notify("Rocket launched! Cash out before the crash.", "good");

      stopFlightTimer();
      flightTimerRef.current = setInterval(() => {
        const started = flightStartedRef.current;
        if (!started) return;

        const elapsed = (Date.now() - started) / 1000;

        // Visual multiplier animation only.
        // The server decides whether a cashout succeeds.
        setMultiplier(Number(Math.exp(elapsed * 0.13).toFixed(2)));
      }, 80);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not start the game.",
        "bad"
      );
    } finally {
      setLoading(false);
    }
  };

  const cashOutAviator = async () => {
    if (!playing || loading) return;

    setLoading(true);

    try {
      const data = await requestGame("aviator", "cashout");

      stopFlightTimer();
      setPlaying(false);
      setFlightStarted(null);
      flightStartedRef.current = null;

      if (data.crashed) {
        setCrashed(true);
        setCashedOut(false);
        setFlightResult("CRASHED!");
        if (typeof data.crashAt === "number") {
          setMultiplier(data.crashAt);
        }
        notify("The rocket crashed before your cashout.", "bad");
      } else {
        const finalMultiplier =
          typeof data.multiplier === "number"
            ? data.multiplier
            : multiplier;

        setMultiplier(finalMultiplier);
        setCashedOut(true);
        setFlightResult("CASHED OUT!");
        notify(
          `You cashed out at ${finalMultiplier.toFixed(2)}×. Payout: ${formatMoney(
            data.payout ?? 0
          )}`,
          "good"
        );
      }
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Cashout failed.",
        "bad"
      );
    } finally {
      setLoading(false);
    }
  };

  // SLOTS
  const spinSlots = async () => {
    if (loading || playing) return;

    setLoading(true);
    setSlotPayout(null);
    setMessage("");

    try {
      const data = await requestGame("slots", "spin");

      if (Array.isArray(data.reels)) {
        setReels(data.reels);
      }

      setSlotPayout(data.payout ?? 0);

      notify(
        (data.payout ?? 0) > 0
          ? `You won ${formatMoney(data.payout ?? 0)}!`
          : "No win this time. Try again!",
        (data.payout ?? 0) > 0 ? "good" : "info"
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Spin failed.",
        "bad"
      );
    } finally {
      setLoading(false);
    }
  };

  // MINES
  const startMines = async () => {
    if (loading || minesStarted) return;

    setLoading(true);
    setRevealedTiles([]);
    setMineTiles([]);
    setMinesMultiplier(1);
    setMessage("");

    try {
      const data = await requestGame("mines", "start", {
        minesCount: mineCount,
        mineCount,
      });

      setMinesStarted(true);

      if (Array.isArray(data.mines)) {
        setMineTiles(data.mines);
      }

      notify("Game started. Pick a safe tile!", "good");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not start Mines.",
        "bad"
      );
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (tile: number) => {
    if (!minesStarted || loading || revealedTiles.includes(tile)) return;

    setLoading(true);

    try {
      const data = await requestGame("mines", "reveal", { tile });

      if (data.hitMine) {
        setRevealedTiles((previous) => [...previous, tile]);

        if (Array.isArray(data.mines)) {
          setMineTiles(data.mines);
        }

        setMinesStarted(false);
        notify("💣 You hit a mine! Start a new round to play again.", "bad");
      } else {
        setRevealedTiles((previous) => [...previous, tile]);

        if (typeof data.multiplier === "number") {
          setMinesMultiplier(data.multiplier);
        }

        notify(
          `💎 Safe pick! Current multiplier: ${(
            data.multiplier ?? minesMultiplier
          ).toFixed(2)}×`,
          "good"
        );
      }
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not reveal tile.",
        "bad"
      );
    } finally {
      setLoading(false);
    }
  };

  const cashOutMines = async () => {
    if (!minesStarted || loading) return;

    setLoading(true);

    try {
      const data = await requestGame("mines", "cashout");

      setMinesStarted(false);

      if (Array.isArray(data.mines)) {
        setMineTiles(data.mines);
      }

      notify(
        `Cashed out! Payout: ${formatMoney(data.payout ?? 0)}`,
        "good"
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Cashout failed.",
        "bad"
      );
    } finally {
      setLoading(false);
    }
  };

  const switchGame = (nextGame: GameName) => {
    if (playing || loading) return;

    setGame(nextGame);
    setMessage("");
  };

  const formatMoney = (amount: number) =>
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Generate a rising path for the rocket.
  const progress = Math.min(
    0.96,
    Math.max(0, Math.log(Math.max(multiplier, 1)) / 2.6)
  );

  const rocketX = 18 + progress * 270;
  const rocketY = 238 - progress * 200;

  const chartPath = `M 18 238 ${Array.from({ length: 30 }, (_, index) => {
    const t = (index + 1) / 30;
    const x = 18 + progress * 270 * t;
    const y = 238 - progress * 200 * t - Math.sin(t * Math.PI) * 12;
    return `L ${x} ${y}`;
  }).join(" ")}`;

  return (
    <section className="royal-games">
      <style>{`
        .royal-games {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          color: #f5f5f5;
          font-family: Arial, Helvetica, sans-serif;
        }
        .rg-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }
        .rg-tab {
          min-height: 43px;
          border: 1px solid #343434;
          border-radius: 10px;
          background: #151515;
          color: #bbb;
          font-weight: 800;
          cursor: pointer;
        }
        .rg-tab.active {
          color: #111;
          background: #f4c65b;
          border-color: #f4c65b;
        }
        .rg-panel {
          border: 1px solid #303030;
          border-radius: 16px;
          padding: 12px;
          background: #101010;
        }
        .rg-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }
        .rg-heading h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
        }
        .rg-balance {
          color: #f4c65b;
          font-size: 13px;
          font-weight: 800;
          text-align: right;
        }
        .rg-chart {
          position: relative;
          width: 100%;
          max-width: 470px;
          aspect-ratio: 1 / 1;
          margin: 0 auto 12px;
          overflow: hidden;
          border: 1px solid #303830;
          border-radius: 13px;
          background:
            linear-gradient(rgba(47, 96, 58, .13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47, 96, 58, .13) 1px, transparent 1px),
            radial-gradient(circle at 15% 90%, #173020 0%, #0b120d 48%, #080b09 100%);
          background-size: 25px 25px, 25px 25px, auto;
        }
        .rg-multiplier {
          position: absolute;
          z-index: 2;
          top: 40%;
          left: 0;
          width: 100%;
          transform: translateY(-50%);
          text-align: center;
          pointer-events: none;
        }
        .rg-multiplier strong {
          display: block;
          font-size: clamp(36px, 9vw, 58px);
          line-height: 1;
          letter-spacing: -2px;
          color: #fff;
          text-shadow: 0 2px 18px #000;
        }
        .rg-multiplier span {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #9ba99c;
        }
        .rg-chart svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .rg-result {
          position: absolute;
          z-index: 3;
          bottom: 12px;
          left: 8px;
          right: 8px;
          text-align: center;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .rg-controls {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
        }
        .rg-field label {
          display: block;
          margin-bottom: 6px;
          color: #a5a5a5;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .rg-bet-row {
          display: flex;
          align-items: center;
          min-height: 44px;
          border: 1px solid #383838;
          border-radius: 9px;
          overflow: hidden;
          background: #080808;
        }
        .rg-bet-row button {
          width: 38px;
          align-self: stretch;
          border: 0;
          background: #202020;
          color: #f4c65b;
          font-size: 20px;
          cursor: pointer;
        }
        .rg-bet-row input {
          min-width: 0;
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          text-align: center;
          font-weight: 800;
          font-size: 15px;
        }
        .rg-main-btn {
          width: 100%;
          min-height: 44px;
          border: 0;
          border-radius: 9px;
          background: #25d366;
          color: #06130a;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
        }
        .rg-main-btn.cashout {
          background: #f4c65b;
        }
        .rg-main-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .rg-message {
          margin-top: 10px;
          padding: 10px;
          border-radius: 9px;
          background: #1b1b1b;
          font-size: 13px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }
        .rg-good { color: #25d366; }
        .rg-bad { color: #ff6464; }
        .rg-info { color: #e3e3e3; }
        .rg-note {
          margin: 9px 2px 0;
          color: #888;
          font-size: 10px;
          line-height: 1.5;
        }
        .rg-slot-reels {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 18px 0;
        }
        .rg-slot-reel {
          display: grid;
          place-items: center;
          min-height: 105px;
          border: 1px solid #4c4021;
          border-radius: 12px;
          background: linear-gradient(145deg, #242016, #0a0a0a);
          font-size: clamp(32px, 9vw, 48px);
        }
        .rg-mines-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 7px;
          margin: 16px 0;
        }
        .rg-tile {
          aspect-ratio: 1;
          border: 1px solid #3c483e;
          border-radius: 8px;
          background: #1b2b20;
          color: #f4c65b;
          font-size: clamp(18px, 5vw, 25px);
          font-weight: 900;
          cursor: pointer;
        }
        .rg-tile:disabled {
          cursor: default;
          opacity: .95;
        }
        .rg-mines-settings {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 12px 0;
          color: #bbb;
          font-size: 12px;
        }
        .rg-mines-settings select {
          min-height: 40px;
          border: 1px solid #383838;
          border-radius: 8px;
          background: #080808;
          color: #fff;
          padding: 0 10px;
        }
        @media (max-width: 360px) {
          .rg-panel { padding: 9px; }
          .rg-tab { font-size: 12px; }
          .rg-controls { gap: 7px; }
          .rg-bet-row button { width: 30px; }
        }
      `}</style>

      <div className="rg-tabs">
        <button
          className={`rg-tab ${game === "aviator" ? "active" : ""}`}
          onClick={() => switchGame("aviator")}
          type="button"
        >
          🚀 Aviator
        </button>
        <button
          className={`rg-tab ${game === "slots" ? "active" : ""}`}
          onClick={() => switchGame("slots")}
          type="button"
        >
          🎰 Slots
        </button>
        <button
          className={`rg-tab ${game === "mines" ? "active" : ""}`}
          onClick={() => switchGame("mines")}
          type="button"
        >
          💣 Mines
        </button>
      </div>

      <div className="rg-panel">
        <div className="rg-heading">
          <h2>
            {game === "aviator"
              ? "🚀 AVIATOR"
              : game === "slots"
              ? "🎰 ROYAL SLOTS"
              : "💣 MINES"}
          </h2>
          <div className="rg-balance">
            {balance === null
              ? "Balance updates after play"
              : `Balance: ${formatMoney(balance)}`}
          </div>
        </div>

        {game === "aviator" && (
          <>
            <div className="rg-chart">
              <div className="rg-multiplier">
                <strong
                  style={{
                    color: crashed ? RED : cashedOut ? GOLD : "#fff",
                  }}
                >
                  {crashed
                    ? "CRASH"
                    : cashedOut
                    ? `${multiplier.toFixed(2)}×`
                    : `${multiplier.toFixed(2)}×`}
                </strong>
                <span>
                  {crashed
                    ? "ROUND OVER"
                    : cashedOut
                    ? "CASHED OUT"
                    : playing
                    ? "ROCKET IN FLIGHT"
                    : "READY FOR TAKEOFF"}
                </span>
              </div>

              <svg viewBox="0 0 320 320" preserveAspectRatio="none">
                <defs>
                  <linearGradient
                    id="royalChartGradient"
                    x1="0"
                    y1="1"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#25d366" stopOpacity=".02" />
                    <stop offset="100%" stopColor="#25d366" stopOpacity=".25" />
                  </linearGradient>
                </defs>

                <path
                  d={`${chartPath} L ${rocketX} 270 L 18 270 Z`}
                  fill="url(#royalChartGradient)"
                />

                <path
                  d={chartPath}
                  fill="none"
                  stroke={crashed ? RED : GREEN}
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {!crashed && (
                  <g
                    transform={`translate(${rocketX},${rocketY}) rotate(-35)`}
                  >
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="29"
                    >
                      🚀
                    </text>
                  </g>
                )}

                {crashed && (
                  <g transform={`translate(${rocketX},${rocketY})`}>
                    <circle
                      r="23"
                      fill="#ff4545"
                      fillOpacity=".22"
                      stroke="#ff4545"
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="24"
                    >
                      💥
                    </text>
                  </g>
                )}

                {cashedOut && (
                  <g transform={`translate(${rocketX},${rocketY})`}>
                    <circle r="18" fill="#f4c65b" fillOpacity=".18" />
                  </g>
                )}
              </svg>

              {(crashed || cashedOut) && (
                <div
                  className="rg-result"
                  style={{ color: crashed ? RED : GOLD }}
                >
                  {flightResult}
                </div>
              )}
            </div>

            <div className="rg-controls">
              <div className="rg-field">
                <label htmlFor="aviator-bet">Bet amount</label>
                <div className="rg-bet-row">
                  <button
                    type="button"
                    disabled={playing || loading}
                    onClick={() =>
                      setBet((current) => Math.max(10, current - 10))
                    }
                  >
                    −
                  </button>
                  <input
                    id="aviator-bet"
                    type="number"
                    min="10"
                    step="10"
                    value={bet}
                    disabled={playing || loading}
                    onChange={(event) =>
                      setBet(Math.max(10, Number(event.target.value) || 10))
                    }
                  />
                  <button
                    type="button"
                    disabled={playing || loading}
                    onClick={() => setBet((current) => current + 10)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rg-field">
                <label>{playing ? "Current round" : "Action"}</label>
                {playing ? (
                  <button
                    type="button"
                    className="rg-main-btn cashout"
                    onClick={cashOutAviator}
                    disabled={loading}
                  >
                    {loading ? "PLEASE WAIT…" : "CASH OUT"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rg-main-btn"
                    onClick={startAviator}
                    disabled={loading}
                  >
                    {loading ? "STARTING…" : "🚀 START"}
                  </button>
                )}
              </div>
            </div>

            <p className="rg-note">
              Minimum bet: 10. Watch the multiplier rise and cash out before
              the crash. The server determines the cashout result.
            </p>
          </>
        )}

        {game === "slots" && (
          <>
            <div className="rg-slot-reels">
              {reels.map((symbol, index) => (
                <div className="rg-slot-reel" key={`${index}-${symbol}`}>
                  {symbol}
                </div>
              ))}
            </div>

            <div className="rg-controls">
              <div className="rg-field">
                <label htmlFor="slots-bet">Bet amount</label>
                <div className="rg-bet-row">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setBet((current) => Math.max(10, current - 10))
                    }
                  >
                    −
                  </button>
                  <input
                    id="slots-bet"
                    type="number"
                    min="10"
                    step="10"
                    value={bet}
                    disabled={loading}
                    onChange={(event) =>
                      setBet(Math.max(10, Number(event.target.value) || 10))
                    }
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setBet((current) => current + 10)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="rg-field">
                <label>Spin reels</label>
                <button
                  type="button"
                  className="rg-main-btn"
                  disabled={loading}
                  onClick={spinSlots}
                >
                  {loading ? "SPINNING…" : "SPIN"}
                </button>
              </div>
            </div>

            {slotPayout !== null && (
              <p className="rg-note">
                Last payout: {formatMoney(slotPayout)}
              </p>
            )}
          </>
        )}

        {game === "mines" && (
          <>
            <div className="rg-mines-settings">
              <label htmlFor="mine-count">Number of mines</label>
              <select
                id="mine-count"
                value={mineCount}
                disabled={minesStarted || loading}
                onChange={(event) => setMineCount(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(
                  (count) => (
                    <option key={count} value={count}>
                      {count} mines
                    </option>
                  )
                )}
              </select>
              <strong style={{ color: GOLD }}>
                {minesMultiplier.toFixed(2)}×
              </strong>
            </div>

            <div className="rg-mines-grid">
              {Array.from({ length: 25 }, (_, tile) => {
                const revealed = revealedTiles.includes(tile);
                const isMine = mineTiles.includes(tile);

                return (
                  <button
                    type="button"
                    key={tile}
                    className="rg-tile"
                    disabled={!minesStarted || loading || revealed}
                    onClick={() => revealTile(tile)}
                  >
                    {revealed
                      ? isMine
                        ? "💣"
                        : "💎"
                      : "?"}
                  </button>
                );
              })}
            </div>

            <div className="rg-controls">
              <div className="rg-field">
                <label htmlFor="mines-bet">Bet amount</label>
                <div className="rg-bet-row">
                  <button
                    type="button"
                    disabled={minesStarted || loading}
                    onClick={() =>
                      setBet((current) => Math.max(10, current - 10))
                    }
                  >
                    −
                  </button>
                  <input
                    id="mines-bet"
                    type="number"
                    min="10"
                    step="10"
                    value={bet}
                    disabled={minesStarted || loading}
                    onChange={(event) =>
                      setBet(Math.max(10, Number(event.target.value) || 10))
                    }
                  />
                  <button
                    type="button"
                    disabled={minesStarted || loading}
                    onClick={() => setBet((current) => current + 10)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rg-field">
                <label>{minesStarted ? "Secure winnings" : "Begin round"}</label>
                {minesStarted ? (
                  <button
                    type="button"
                    className="rg-main-btn cashout"
                    disabled={loading || revealedTiles.length === 0}
                    onClick={cashOutMines}
                  >
                    {loading ? "PLEASE WAIT…" : "CASH OUT"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rg-main-btn"
                    disabled={loading}
                    onClick={startMines}
                  >
                    {loading ? "STARTING…" : "START"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {message && (
          <div
            className={`rg-message ${
              messageType === "good"
                ? "rg-good"
                : messageType === "bad"
                ? "rg-bad"
                : "rg-info"
            }`}
            role="status"
          >
            {message}
          </div>
        )}
      </div>
    </section>
  );
}