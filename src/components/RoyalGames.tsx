"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameName = "aviator" | "dice" | "mines";
type MessageType = "good" | "bad" | "info";

type ApiResult = {
  error?: string;
  balance?: number;
  roundId?: string;
  crashed?: boolean;
  crashAt?: number;
  active?: boolean;
  multiplier?: number;
  payout?: number;
  net?: number;
  mines?: number[];
  picks?: number[];
  tile?: number;
  hitMine?: boolean;
  potentialPayout?: number;
  roll?: number;
  target?: number;
  won?: boolean;
  chance?: number;
};

const GOLD = "#f4c65b";
const GREEN = "#25d366";
const RED = "#ff4545";
const MIN_BET = 10;
const MAX_BET = 1000;

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RoyalGames() {
  const [game, setGame] = useState<GameName>("aviator");
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("info");

  // Aviator
  const [multiplier, setMultiplier] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [flightResult, setFlightResult] = useState("");
  const [flightStarted, setFlightStarted] = useState<number | null>(null);

  // Dice
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [diceWon, setDiceWon] = useState<boolean | null>(null);
  const [dicePayout, setDicePayout] = useState<number | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);

  // Mines
  const [mineCount, setMineCount] = useState(3);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [mineTiles, setMineTiles] = useState<number[]>([]);
  const [minesStarted, setMinesStarted] = useState(false);
  const [minesMultiplier, setMinesMultiplier] = useState(1);

  const loadingRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diceAnimationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notify = useCallback(
    (text: string, type: MessageType = "info") => {
      setMessage(text);
      setMessageType(type);
    },
    []
  );

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const stopDiceAnimation = useCallback(() => {
    if (diceAnimationRef.current) {
      clearInterval(diceAnimationRef.current);
      diceAnimationRef.current = null;
    }
    setDiceRolling(false);
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      if (diceAnimationRef.current) {
        clearInterval(diceAnimationRef.current);
      }
    };
  }, [stopPolling]);

  const requestGame = async (
    gameName: GameName,
    action: string,
    extra: Record<string, unknown> = {}
  ): Promise<ApiResult> => {
    const response = await fetch(`/api/games/${gameName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, bet, ...extra }),
    });

    const data = (await response.json()) as ApiResult;

    if (!response.ok) {
      throw new Error(data.error || "Could not process the game action.");
    }

    if (typeof data.balance === "number") {
      setBalance(data.balance);
    }

    return data;
  };

  const changeBet = (amount: number) => {
    setBet(Math.min(MAX_BET, Math.max(MIN_BET, amount)));
  };

  // AVIATOR — the server must report crashes through its status action.
  const checkAviatorStatus = async () => {
    try {
      const response = await fetch("/api/games/aviator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
        cache: "no-store",
      });

      const data = (await response.json()) as ApiResult;

      if (!response.ok) {
        throw new Error(data.error || "Unable to check the flight.");
      }

      if (typeof data.balance === "number") {
        setBalance(data.balance);
      }

      if (data.active && typeof data.multiplier === "number") {
        setMultiplier(data.multiplier);
      }

      if (data.crashed) {
        stopPolling();
        setPlaying(false);
        setCrashed(true);
        setCashedOut(false);
        setFlightStarted(null);
        setFlightResult("FLIGHT CRASHED");

        if (typeof data.crashAt === "number") {
          setMultiplier(data.crashAt);
        }

        notify(
          `💥 The rocket crashed at ${(data.crashAt ?? multiplier).toFixed(2)}×.`,
          "bad"
        );

        return false;
      }

      return Boolean(data.active);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not check the Aviator round.",
        "bad"
      );

      return true;
    }
  };

  useEffect(() => {
    if (!playing || game !== "aviator") {
      stopPolling();
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      const shouldContinue = await checkAviatorStatus();

      if (!cancelled && shouldContinue) {
        // Recursive timeout avoids overlapping requests.
        pollTimerRef.current = setTimeout(poll, 300);
      }
    };

    pollTimerRef.current = setTimeout(poll, 300);

    return () => {
      cancelled = true;
      stopPolling();
    };
    // checkAviatorStatus intentionally reads current React setters/state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, game, stopPolling]);

  const startAviator = async () => {
    if (loadingRef.current || playing) return;

    loadingRef.current = true;
    setLoading(true);
    setMessage("");
    setMultiplier(1);
    setCrashed(false);
    setCashedOut(false);
    setFlightResult("");

    try {
      await requestGame("aviator", "start");

      setFlightStarted(Date.now());
      setPlaying(true);
      notify("🚀 Flight started. Cash out before the crash!", "good");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not start Aviator.",
        "bad"
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const cashOutAviator = async () => {
    if (!playing || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await requestGame("aviator", "cashout");

      stopPolling();
      setPlaying(false);
      setFlightStarted(null);

      if (data.crashed) {
        setCrashed(true);
        setCashedOut(false);
        setFlightResult("FLIGHT CRASHED");

        if (typeof data.crashAt === "number") {
          setMultiplier(data.crashAt);
        }

        notify("The rocket crashed before your cashout completed.", "bad");
      } else {
        const finalMultiplier = data.multiplier ?? multiplier;

        setMultiplier(finalMultiplier);
        setCashedOut(true);
        setCrashed(false);
        setFlightResult("CASHED OUT!");

        notify(
          `Cashed out at ${finalMultiplier.toFixed(2)}×. Payout: ${formatMoney(
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
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // DICE
  const playDice = async () => {
    if (loadingRef.current || diceRolling) return;

    loadingRef.current = true;
    setLoading(true);
    setDiceRolling(true);
    setDiceWon(null);
    setDicePayout(null);
    setDiceRoll(null);
    setMessage("");

    let ticks = 0;

    diceAnimationRef.current = setInterval(() => {
      setDiceRoll(Number((Math.random() * 99.99).toFixed(2)));
      ticks += 1;

      if (ticks >= 12 && diceAnimationRef.current) {
        clearInterval(diceAnimationRef.current);
        diceAnimationRef.current = null;
      }
    }, 70);

    try {
      // The server determines the actual result and payout.
      const data = await requestGame("dice", "roll", {
        target: diceTarget,
      });

      if (diceAnimationRef.current) {
        clearInterval(diceAnimationRef.current);
        diceAnimationRef.current = null;
      }

      setDiceRoll(
        typeof data.roll === "number" ? data.roll : 0
      );
      setDiceWon(Boolean(data.won));
      setDicePayout(data.payout ?? 0);

      notify(
        data.won
          ? `🎉 You won ${formatMoney(data.payout ?? 0)}!`
          : `No win this round. Roll: ${(data.roll ?? 0).toFixed(2)}.`,
        data.won ? "good" : "info"
      );
    } catch (error) {
      if (diceAnimationRef.current) {
        clearInterval(diceAnimationRef.current);
        diceAnimationRef.current = null;
      }

      notify(
        error instanceof Error ? error.message : "Dice roll failed.",
        "bad"
      );
    } finally {
      setDiceRolling(false);
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // MINES
  const startMines = async () => {
    if (loadingRef.current || minesStarted) return;

    loadingRef.current = true;
    setLoading(true);
    setRevealedTiles([]);
    setMineTiles([]);
    setMinesMultiplier(1);
    setMessage("");

    try {
      await requestGame("mines", "start", { mineCount });
      setMinesStarted(true);
      notify("Round started. Choose a safe tile.", "good");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not start Mines.",
        "bad"
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const revealTile = async (tile: number) => {
    if (
      !minesStarted ||
      loadingRef.current ||
      revealedTiles.includes(tile)
    ) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await requestGame("mines", "reveal", { tile });

      setRevealedTiles((previous) =>
        previous.includes(tile) ? previous : [...previous, tile]
      );

      if (data.hitMine) {
        setMineTiles(data.mines ?? []);
        setMinesStarted(false);
        notify("💣 Mine hit. Your bet has been lost.", "bad");
      } else {
        if (typeof data.multiplier === "number") {
          setMinesMultiplier(data.multiplier);
        }

        notify(
          `💎 Safe tile! Multiplier: ${(data.multiplier ?? 1).toFixed(2)}×`,
          "good"
        );
      }
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not reveal tile.",
        "bad"
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const cashOutMines = async () => {
    if (!minesStarted || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await requestGame("mines", "cashout");

      setMinesStarted(false);
      setMineTiles(data.mines ?? []);

      notify(
        `Winnings secured: ${formatMoney(data.payout ?? 0)}.`,
        "good"
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Cashout failed.",
        "bad"
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const switchGame = (nextGame: GameName) => {
    if (playing || loading || minesStarted) return;

    setGame(nextGame);
    setMessage("");
  };

  const progress = Math.min(
    0.96,
    Math.max(0, Math.log(Math.max(multiplier, 1)) / 2.6)
  );

  const rocketX = 18 + progress * 270;
  const rocketY = 258 - progress * 210;

  const chartPath = `M 18 258 ${Array.from({ length: 36 }, (_, index) => {
    const t = (index + 1) / 36;
    const x = 18 + progress * 270 * t;
    const y = 258 - progress * 210 * t - Math.sin(t * Math.PI) * 13;
    return `L ${x} ${y}`;
  }).join(" ")}`;

  const chance = Math.max(1, Math.min(98, diceTarget));
  const estimatedMultiplier = Number((99 / chance).toFixed(2));

  return (
    <section className="royal-games">
      <style>{`
        .royal-games {
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
          color: #f5f5f5;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }
        .rg-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        .rg-tab {
          min-height: 46px;
          border: 1px solid #303030;
          border-radius: 11px;
          background: #151515;
          color: #aaa;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          transition: background .18s ease, color .18s ease, transform .18s ease;
        }
        .rg-tab:active { transform: scale(.98); }
        .rg-tab.active {
          color: #15110a;
          background: ${GOLD};
          border-color: ${GOLD};
        }
        .rg-panel {
          border: 1px solid #2d2d2d;
          border-radius: 18px;
          padding: clamp(12px, 3vw, 20px);
          background: linear-gradient(145deg, #151515, #0b0b0b);
          box-shadow: 0 14px 40px rgba(0,0,0,.22);
        }
        .rg-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 16px;
        }
        .rg-heading h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: .4px;
        }
        .rg-balance {
          color: ${GOLD};
          font-size: 12px;
          font-weight: 800;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .rg-chart {
          position: relative;
          width: 100%;
          max-width: 520px;
          aspect-ratio: 1 / .82;
          margin: 0 auto 16px;
          overflow: hidden;
          border: 1px solid #263a2c;
          border-radius: 15px;
          background:
            linear-gradient(rgba(47,96,58,.13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,96,58,.13) 1px, transparent 1px),
            radial-gradient(ellipse at 12% 95%, #183622 0%, #0b120d 48%, #080b09 100%);
          background-size: 25px 25px, 25px 25px, auto;
        }
        .rg-multiplier {
          position: absolute;
          z-index: 2;
          top: 39%;
          left: 0;
          width: 100%;
          transform: translateY(-50%);
          text-align: center;
          pointer-events: none;
        }
        .rg-multiplier strong {
          display: block;
          font-size: clamp(38px, 10vw, 64px);
          line-height: 1;
          letter-spacing: -2px;
          text-shadow: 0 2px 20px #000;
        }
        .rg-multiplier span {
          display: block;
          margin-top: 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2.5px;
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
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.5px;
        }
        .rg-controls {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
        }
        .rg-field { min-width: 0; }
        .rg-field label {
          display: block;
          margin-bottom: 7px;
          color: #a5a5a5;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .8px;
          text-transform: uppercase;
        }
        .rg-bet-row {
          display: flex;
          align-items: center;
          min-height: 46px;
          border: 1px solid #373737;
          border-radius: 10px;
          overflow: hidden;
          background: #090909;
        }
        .rg-bet-row button {
          width: 40px;
          flex-shrink: 0;
          align-self: stretch;
          border: 0;
          background: #202020;
          color: ${GOLD};
          font-size: 21px;
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
          font-weight: 850;
          font-size: 15px;
        }
        .rg-main-btn {
          width: 100%;
          min-height: 46px;
          padding: 8px 10px;
          border: 0;
          border-radius: 10px;
          background: ${GREEN};
          color: #06130a;
          font-weight: 950;
          font-size: 13px;
          cursor: pointer;
          transition: filter .15s ease, transform .15s ease;
        }
        .rg-main-btn:active:not(:disabled) { transform: scale(.985); }
        .rg-main-btn:hover:not(:disabled) { filter: brightness(1.06); }
        .rg-main-btn.cashout { background: ${GOLD}; }
        .rg-main-btn:disabled, .rg-bet-row button:disabled {
          opacity: .48;
          cursor: not-allowed;
        }
        .rg-message {
          margin-top: 14px;
          padding: 12px;
          border: 1px solid #292929;
          border-radius: 10px;
          background: #1b1b1b;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .rg-good { color: ${GREEN}; }
        .rg-bad { color: #ff6464; }
        .rg-info { color: #e3e3e3; }
        .rg-note {
          margin: 12px 2px 0;
          color: #858585;
          font-size: 10px;
          line-height: 1.6;
        }
        .rg-mines-settings {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin: 10px 0 14px;
          color: #bbb;
          font-size: 12px;
        }
        .rg-mines-settings select, .rg-select {
          min-height: 42px;
          max-width: 100%;
          border: 1px solid #383838;
          border-radius: 9px;
          background: #080808;
          color: #fff;
          padding: 0 10px;
        }
        .rg-mines-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin: 16px 0;
        }
        .rg-tile {
          aspect-ratio: 1;
          min-width: 0;
          border: 1px solid #3c483e;
          border-radius: 9px;
          background: linear-gradient(145deg, #233b2a, #142219);
          color: ${GOLD};
          font-size: clamp(17px, 5vw, 25px);
          font-weight: 900;
          cursor: pointer;
          transition: transform .15s ease, filter .15s ease;
        }
        .rg-tile:active:not(:disabled) { transform: scale(.95); }
        .rg-tile:disabled { cursor: default; opacity: .95; }
        .rg-dice-card {
          padding: clamp(18px, 5vw, 32px) 12px;
          margin: 8px 0 16px;
          border: 1px solid #3b3320;
          border-radius: 15px;
          text-align: center;
          background: radial-gradient(ellipse at top, #282315, #11100c 75%);
        }
        .rg-dice-number {
          min-height: 90px;
          display: grid;
          place-items: center;
          font-size: clamp(42px, 12vw, 70px);
          font-weight: 950;
          letter-spacing: -2px;
          color: ${GOLD};
          font-variant-numeric: tabular-nums;
        }
        .rg-dice-status {
          color: #999;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 2px;
        }
        .rg-dice-track {
          position: relative;
          height: 9px;
          margin: 22px 4px 8px;
          border-radius: 99px;
          background: #303030;
        }
        .rg-dice-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, ${GREEN}, ${GOLD});
          transition: width .25s ease;
        }
        .rg-dice-marker {
          position: absolute;
          top: -5px;
          width: 3px;
          height: 19px;
          border-radius: 3px;
          background: white;
          transform: translateX(-50%);
        }
        .rg-dice-settings {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }
        .rg-dice-settings input[type="range"] {
          width: 100%;
          accent-color: ${GOLD};
        }
        .rg-stat {
          border: 1px solid #303030;
          border-radius: 10px;
          padding: 10px;
          background: #0a0a0a;
        }
        .rg-stat span {
          display: block;
          color: #888;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .rg-stat strong {
          display: block;
          margin-top: 5px;
          color: ${GOLD};
          font-size: 17px;
        }
        @media (max-width: 380px) {
          .rg-panel { padding: 10px; }
          .rg-tab { font-size: 11px; }
          .rg-controls { gap: 8px; }
          .rg-bet-row button { width: 32px; }
          .rg-mines-grid { gap: 5px; }
        }
      `}</style>

      <div className="rg-tabs">
        <button
          type="button"
          className={`rg-tab ${game === "aviator" ? "active" : ""}`}
          onClick={() => switchGame("aviator")}
          disabled={playing || loading || minesStarted}
        >
          🚀 Aviator
        </button>
        <button
          type="button"
          className={`rg-tab ${game === "dice" ? "active" : ""}`}
          onClick={() => switchGame("dice")}
          disabled={playing || loading || minesStarted}
        >
          🎲 Dice
        </button>
        <button
          type="button"
          className={`rg-tab ${game === "mines" ? "active" : ""}`}
          onClick={() => switchGame("mines")}
          disabled={playing || loading || minesStarted}
        >
          💣 Mines
        </button>
      </div>

      <div className="rg-panel">
        <div className="rg-heading">
          <h2>
            {game === "aviator"
              ? "🚀 AVIATOR"
              : game === "dice"
                ? "🎲 ROYAL DICE"
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
                  {crashed ? "CRASHED" : `${multiplier.toFixed(2)}×`}
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
                    id="royalAviatorFill"
                    x1="0"
                    y1="1"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={GREEN} stopOpacity=".02" />
                    <stop offset="100%" stopColor={GREEN} stopOpacity=".28" />
                  </linearGradient>
                </defs>

                <path
                  d={`${chartPath} L ${rocketX} 282 L 18 282 Z`}
                  fill="url(#royalAviatorFill)"
                />

                <path
                  d={chartPath}
                  fill="none"
                  stroke={crashed ? RED : cashedOut ? GOLD : GREEN}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {!crashed && !cashedOut && (
                  <g transform={`translate(${rocketX},${rocketY}) rotate(-35)`}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="28"
                    >
                      🚀
                    </text>
                  </g>
                )}

                {crashed && (
                  <g transform={`translate(${rocketX},${rocketY})`}>
                    <circle
                      r="24"
                      fill={RED}
                      fillOpacity=".18"
                      stroke={RED}
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
                    <circle r="21" fill={GOLD} fillOpacity=".2" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="22"
                    >
                      ✓
                    </text>
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
                    onClick={() => changeBet(bet - 10)}
                  >
                    −
                  </button>
                  <input
                    id="aviator-bet"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    step="1"
                    value={bet}
                    disabled={playing || loading}
                    onChange={(event) =>
                      changeBet(Number(event.target.value) || MIN_BET)
                    }
                  />
                  <button
                    type="button"
                    disabled={playing || loading}
                    onClick={() => changeBet(bet + 10)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rg-field">
                <label>{playing ? "Live round" : "Action"}</label>
                {playing ? (
                  <button
                    type="button"
                    className="rg-main-btn cashout"
                    onClick={cashOutAviator}
                    disabled={loading}
                  >
                    {loading ? "PROCESSING…" : "CASH OUT"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rg-main-btn"
                    onClick={startAviator}
                    disabled={loading}
                  >
                    {loading ? "STARTING…" : "🚀 START FLIGHT"}
                  </button>
                )}
              </div>
            </div>

            <p className="rg-note">
              Minimum bet {MIN_BET}. Maximum bet {MAX_BET}. The multiplier
              rises during the flight. Cash out before the server-determined
              crash point. A displayed multiplier does not guarantee a payout.
            </p>
          </>
        )}

        {game === "dice" && (
          <>
            <div className="rg-dice-card">
              <div
                className="rg-dice-number"
                style={{
                  color:
                    diceWon === null
                      ? GOLD
                      : diceWon
                        ? GREEN
                        : RED,
                }}
              >
                {diceRoll === null ? "— —. — —" : diceRoll.toFixed(2)}
              </div>

              <div className="rg-dice-status">
                {diceRolling
                  ? "ROLLING DICE…"
                  : diceWon === null
                    ? `WIN IF ROLL IS UNDER ${diceTarget.toFixed(0)}`
                    : diceWon
                      ? "YOU WIN"
                      : "NO WIN THIS ROUND"}
              </div>

              <div className="rg-dice-track">
                <div
                  className="rg-dice-fill"
                  style={{ width: `${diceTarget}%` }}
                />
                <div
                  className="rg-dice-marker"
                  style={{ left: `${diceTarget}%` }}
                />
              </div>
            </div>

            <div className="rg-dice-settings">
              <div className="rg-stat">
                <span>Win chance</span>
                <strong>{chance.toFixed(0)}%</strong>
              </div>
              <div className="rg-stat">
                <span>Indicative multiplier</span>
                <strong>{estimatedMultiplier.toFixed(2)}×</strong>
              </div>
              <div className="rg-field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="dice-target">
                  Win if roll is below {diceTarget.toFixed(0)}
                </label>
                <input
                  id="dice-target"
                  type="range"
                  min="2"
                  max="98"
                  step="1"
                  value={diceTarget}
                  disabled={loading}
                  onChange={(event) =>
                    setDiceTarget(Number(event.target.value))
                  }
                />
              </div>
            </div>

            <div className="rg-controls">
              <div className="rg-field">
                <label htmlFor="dice-bet">Bet amount</label>
                <div className="rg-bet-row">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => changeBet(bet - 10)}
                  >
                    −
                  </button>
                  <input
                    id="dice-bet"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    step="1"
                    value={bet}
                    disabled={loading}
                    onChange={(event) =>
                      changeBet(Number(event.target.value) || MIN_BET)
                    }
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => changeBet(bet + 10)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="rg-field">
                <label>Place your roll</label>
                <button
                  type="button"
                  className="rg-main-btn"
                  onClick={playDice}
                  disabled={loading}
                >
                  {loading ? "ROLLING…" : "🎲 ROLL DICE"}
                </button>
              </div>
            </div>

            {dicePayout !== null && (
              <p className="rg-note">
                Last payout: {formatMoney(dicePayout)}. The server must
                determine the actual roll and payout.
              </p>
            )}

            <p className="rg-note">
              Minimum bet {MIN_BET}. Maximum bet {MAX_BET}. The displayed
              multiplier is indicative; the server must apply its configured
              payout rules.
            </p>
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
                {Array.from({ length: 24 }, (_, index) => index + 1).map(
                  (count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "mine" : "mines"}
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
                    aria-label={`Tile ${tile + 1}`}
                  >
                    {revealed ? (isMine ? "💣" : "💎") : "?"}
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
                    onClick={() => changeBet(bet - 10)}
                  >
                    −
                  </button>
                  <input
                    id="mines-bet"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    step="1"
                    value={bet}
                    disabled={minesStarted || loading}
                    onChange={(event) =>
                      changeBet(Number(event.target.value) || MIN_BET)
                    }
                  />
                  <button
                    type="button"
                    disabled={minesStarted || loading}
                    onClick={() => changeBet(bet + 10)}
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
                    {loading ? "PROCESSING…" : "CASH OUT"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rg-main-btn"
                    disabled={loading}
                    onClick={startMines}
                  >
                    {loading ? "STARTING…" : "START ROUND"}
                  </button>
                )}
              </div>
            </div>

            <p className="rg-note">
              Choose your mine count, reveal safe tiles, and cash out before
              hitting a mine.
            </p>
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
            aria-live="polite"
          >
            {message}
          </div>
        )}
      </div>
    </section>
  );
}