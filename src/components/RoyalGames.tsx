"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameName = "aviator" | "dice" | "mines";
type MessageType = "good" | "bad" | "info";
type BetMode = "bet" | "auto";

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
const RED = "#ff334f";
const MIN_BET = 10;
const MAX_BET = 1000;

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function randomDemoMultiplier() {
  const values = [1.12, 1.28, 1.46, 1.73, 2.15, 1.09, 3.24, 1.64, 5.18, 1.37];
  return values[Math.floor(Math.random() * values.length)];
}

export default function RoyalGames() {
  const [game, setGame] = useState<GameName>("aviator");
  const [bet, setBet] = useState(50);
  const [betTwo, setBetTwo] = useState(50);
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
  const [history, setHistory] = useState<number[]>([
    1.42, 3.15, 1.42, 1.95, 7.45, 1.64, 1.25, 1.73,
  ]);
  const [betModeOne, setBetModeOne] = useState<BetMode>("bet");
  const [betModeTwo, setBetModeTwo] = useState<BetMode>("bet");
  const [autoTargetOne, setAutoTargetOne] = useState(2);
  const [autoTargetTwo, setAutoTargetTwo] = useState(2);
  const [secondBetActive, setSecondBetActive] = useState(false);
  const [secondBetCashed, setSecondBetCashed] = useState(false);
  const [secondBetLost, setSecondBetLost] = useState(false);
  const [firstBetCashed, setFirstBetCashed] = useState(false);
  const [firstBetLost, setFirstBetLost] = useState(false);
  const [firstPayout, setFirstPayout] = useState<number | null>(null);
  const [secondPayout, setSecondPayout] = useState<number | null>(null);
  const [autoSubmittedOne, setAutoSubmittedOne] = useState(false);
  const [autoSubmittedTwo, setAutoSubmittedTwo] = useState(false);

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
  const flightAnimationRef = useRef<number | null>(null);
  const flightStartRef = useRef<number | null>(null);
  const currentMultiplierRef = useRef(1);
  const autoCashoutRef = useRef(false);
  const secondAutoCashoutRef = useRef(false);
  const playingRef = useRef(false);

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

  const stopFlightAnimation = useCallback(() => {
    if (flightAnimationRef.current !== null) {
      cancelAnimationFrame(flightAnimationRef.current);
      flightAnimationRef.current = null;
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
      stopFlightAnimation();

      if (diceAnimationRef.current) {
        clearInterval(diceAnimationRef.current);
      }
    };
  }, [stopPolling, stopFlightAnimation]);

  const requestGame = async (
    gameName: GameName,
    action: string,
    amount = bet,
    extra: Record<string, unknown> = {}
  ): Promise<ApiResult> => {
    const response = await fetch(`/api/games/${gameName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, bet: amount, ...extra }),
      cache: "no-store",
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

  const changeBet = (amount: number, panel: 1 | 2 = 1) => {
    const next = Math.round(Math.min(MAX_BET, Math.max(MIN_BET, amount)) * 100) / 100;

    if (panel === 1) setBet(next);
    else setBetTwo(next);
  };

  const appendHistory = (value: number) => {
    setHistory((previous) => [value, ...previous].slice(0, 15));
  };

  const animateFlight = useCallback(() => {
    if (!playingRef.current || flightStartRef.current === null) return;

    const elapsed = Math.max(0, performance.now() - flightStartRef.current);
    const localMultiplier = Math.max(
      1,
      Math.floor(Math.exp(elapsed / 5000) * 100) / 100
    );

    currentMultiplierRef.current = localMultiplier;
    setMultiplier(localMultiplier);

    if (playingRef.current) {
      flightAnimationRef.current = requestAnimationFrame(animateFlight);
    }
  }, []);

  const finishFlight = useCallback(() => {
    playingRef.current = false;
    stopFlightAnimation();
    stopPolling();
    setPlaying(false);
    setFlightStarted(null);
  }, [stopFlightAnimation, stopPolling]);

  // The status endpoint is separate from /api/games/aviator.
  // Do not send { action: "status" } to the main game route.
  const checkAviatorStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/games/aviator/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
        currentMultiplierRef.current = data.multiplier;
        setMultiplier(data.multiplier);

        if (
          betModeOne === "auto" &&
          !autoCashoutRef.current &&
          data.multiplier >= autoTargetOne
        ) {
          autoCashoutRef.current = true;
          void cashOutAviator(1);
        }

        if (
          secondBetActive &&
          betModeTwo === "auto" &&
          !secondAutoCashoutRef.current &&
          data.multiplier >= autoTargetTwo
        ) {
          secondAutoCashoutRef.current = true;
          void cashOutAviator(2);
        }
      }

      if (data.crashed) {
        finishFlight();
        setCrashed(true);
        setCashedOut(false);
        setFlightResult("FLIGHT CRASHED");

        const crashPoint = data.crashAt ?? currentMultiplierRef.current;
        setMultiplier(crashPoint);
        appendHistory(crashPoint);

        if (!firstBetCashed) setFirstBetLost(true);
        if (secondBetActive && !secondBetCashed) setSecondBetLost(true);

        notify(`Flight crashed at ${crashPoint.toFixed(2)}×.`, "bad");
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

      // Avoid silently abandoning the active server-side round.
      return true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoTargetOne,
    autoTargetTwo,
    betModeOne,
    betModeTwo,
    finishFlight,
    firstBetCashed,
    secondBetActive,
    secondBetCashed,
    notify,
  ]);

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
        pollTimerRef.current = setTimeout(poll, 300);
      }
    };

    pollTimerRef.current = setTimeout(poll, 300);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [playing, game, checkAviatorStatus, stopPolling]);

  const startAviator = async (panel: 1 | 2) => {
    if (loadingRef.current || playingRef.current) return;

    const amount = panel === 1 ? bet : betTwo;

    loadingRef.current = true;
    setLoading(true);
    setMessage("");

    setMultiplier(1);
    currentMultiplierRef.current = 1;
    setCrashed(false);
    setCashedOut(false);
    setFlightResult("");
    setFirstBetCashed(false);
    setFirstBetLost(false);
    setSecondBetCashed(false);
    setSecondBetLost(false);
    setFirstPayout(null);
    setSecondPayout(null);
    setSecondBetActive(panel === 2);
    setAutoSubmittedOne(false);
    setAutoSubmittedTwo(false);
    autoCashoutRef.current = false;
    secondAutoCashoutRef.current = false;

    try {
      await requestGame("aviator", "start", amount);

      flightStartRef.current = performance.now();
      playingRef.current = true;

      setFlightStarted(Date.now());
      setPlaying(true);

      stopFlightAnimation();
      flightAnimationRef.current = requestAnimationFrame(animateFlight);

      if (panel === 2) {
        setSecondBetActive(true);
        setAutoSubmittedTwo(true);
      } else {
        setAutoSubmittedOne(true);
        setSecondBetActive(false);
      }

      notify("Flight started. Cash out before the crash!", "good");
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

  const cashOutAviator = async (panel: 1 | 2 = 1) => {
    if (!playingRef.current || loadingRef.current) return;

    // This backend supports one active Aviator round per user.
    // Both visual panels therefore cannot place independent simultaneous
    // server bets without a matching backend change.
    if (panel === 2 && !secondBetActive) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await requestGame("aviator", "cashout", panel === 1 ? bet : betTwo);

      if (data.crashed) {
        finishFlight();
        setCrashed(true);
        setCashedOut(false);
        setFlightResult("FLIGHT CRASHED");

        const crashPoint = data.crashAt ?? currentMultiplierRef.current;
        setMultiplier(crashPoint);
        appendHistory(crashPoint);
        notify(`The flight crashed at ${crashPoint.toFixed(2)}×.`, "bad");
        return;
      }

      const finalMultiplier = data.multiplier ?? currentMultiplierRef.current;
      const payout = data.payout ?? 0;

      if (panel === 1) {
        setFirstBetCashed(true);
        setFirstPayout(payout);
        setCashedOut(true);
        setFlightResult("CASHED OUT!");
      } else {
        setSecondBetCashed(true);
        setSecondPayout(payout);
      }

      setMultiplier(finalMultiplier);
      finishFlight();
      appendHistory(finalMultiplier);

      notify(
        `Cashed out at ${finalMultiplier.toFixed(2)}×. Payout: ${formatMoney(payout)} USDT`,
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
      const data = await requestGame("dice", "roll", bet, {
        target: diceTarget,
      });

      if (diceAnimationRef.current) {
        clearInterval(diceAnimationRef.current);
        diceAnimationRef.current = null;
      }

      setDiceRoll(typeof data.roll === "number" ? data.roll : 0);
      setDiceWon(Boolean(data.won));
      setDicePayout(data.payout ?? 0);

      notify(
        data.won
          ? `You won ${formatMoney(data.payout ?? 0)} USDT!`
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
      await requestGame("mines", "start", bet, { mineCount });
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
    if (!minesStarted || loadingRef.current || revealedTiles.includes(tile)) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await requestGame("mines", "reveal", bet, { tile });

      setRevealedTiles((previous) =>
        previous.includes(tile) ? previous : [...previous, tile]
      );

      if (data.hitMine) {
        setMineTiles(data.mines ?? []);
        setMinesStarted(false);
        notify("Mine hit. Your bet has been lost.", "bad");
      } else {
        if (typeof data.multiplier === "number") {
          setMinesMultiplier(data.multiplier);
        }

        notify(
          `Safe tile! Multiplier: ${(data.multiplier ?? 1).toFixed(2)}×`,
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
      const data = await requestGame("mines", "cashout", bet);
      setMinesStarted(false);
      setMineTiles(data.mines ?? []);

      notify(
        `Winnings secured: ${formatMoney(data.payout ?? 0)} USDT.`,
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

  const chance = Math.max(1, Math.min(98, diceTarget));
  const estimatedMultiplier = Number((99 / chance).toFixed(2));

  const progress = Math.min(
    0.98,
    Math.max(0, Math.log(Math.max(multiplier, 1)) / 2.6)
  );

  const rocketX = 16 + progress * 268;
  const rocketY = 300 - progress * 220;

  const chartPath = `M 10 308 ${Array.from({ length: 44 }, (_, index) => {
    const t = (index + 1) / 44;
    const x = 10 + progress * 268 * t;
    const y = 308 - progress * 220 * t - Math.sin(t * Math.PI) * 12;
    return `L ${x} ${y}`;
  }).join(" ")}`;

  const renderQuickBet = (amount: number, panel: 1 | 2) => (
    <button
      key={amount}
      type="button"
      className="rg-quick"
      disabled={playing || loading}
      onClick={() => changeBet(amount, panel)}
    >
      {amount.toLocaleString("en-US")}
    </button>
  );

  const renderAviatorPanel = (panel: 1 | 2) => {
    const amount = panel === 1 ? bet : betTwo;
    const mode = panel === 1 ? betModeOne : betModeTwo;
    const setMode = panel === 1 ? setBetModeOne : setBetModeTwo;
    const autoTarget = panel === 1 ? autoTargetOne : autoTargetTwo;
    const setAutoTarget = panel === 1 ? setAutoTargetOne : setAutoTargetTwo;
    const hasCashed = panel === 1 ? firstBetCashed : secondBetCashed;
    const hasLost = panel === 1 ? firstBetLost : secondBetLost;
    const payout = panel === 1 ? firstPayout : secondPayout;
    const hasBet = panel === 1 ? autoSubmittedOne : autoSubmittedTwo;

    return (
      <div className="rg-aviator-bet" key={panel}>
        <div className="rg-bet-panel-top">
          <div className="rg-mode-switch" role="group" aria-label={`Panel ${panel} mode`}>
            <button
              type="button"
              className={mode === "bet" ? "selected" : ""}
              disabled={playing || loading}
              onClick={() => setMode("bet")}
            >
              Bet
            </button>
            <button
              type="button"
              className={mode === "auto" ? "selected" : ""}
              disabled={playing || loading}
              onClick={() => setMode("auto")}
            >
              Auto
            </button>
          </div>
          {panel === 2 && <span className="rg-panel-number">02</span>}
        </div>

        {mode === "auto" && (
          <div className="rg-auto-setting">
            <label htmlFor={`auto-target-${panel}`}>Auto cash-out</label>
            <div>
              <input
                id={`auto-target-${panel}`}
                type="number"
                min="1.01"
                max="1000"
                step="0.01"
                value={autoTarget}
                disabled={playing || loading}
                onChange={(event) =>
                  setAutoTarget(
                    Math.max(1.01, Math.min(1000, Number(event.target.value) || 1.01))
                  )
                }
              />
              <span>×</span>
            </div>
          </div>
        )}

        <div className="rg-panel-controls">
          <div className="rg-panel-left">
            <div className="rg-amount-control">
              <button
                type="button"
                aria-label="Decrease bet"
                disabled={playing || loading}
                onClick={() => changeBet(amount - 10, panel)}
              >
                −
              </button>
              <input
                aria-label={`Panel ${panel} bet amount in USDT`}
                type="number"
                min={MIN_BET}
                max={MAX_BET}
                step="1"
                value={amount}
                disabled={playing || loading}
                onChange={(event) =>
                  changeBet(Number(event.target.value) || MIN_BET, panel)
                }
              />
              <button
                type="button"
                aria-label="Increase bet"
                disabled={playing || loading}
                onClick={() => changeBet(amount + 10, panel)}
              >
                +
              </button>
            </div>

            <div className="rg-quick-grid">
              {[100, 200, 500, 1000].map((value) =>
                renderQuickBet(value, panel)
              )}
            </div>
          </div>

          <div className="rg-panel-right">
            {playing && hasBet && !hasCashed && !hasLost ? (
              <button
                type="button"
                className="rg-place-bet rg-cashout"
                disabled={loading}
                onClick={() => cashOutAviator(panel)}
              >
                <span>{loading ? "PROCESSING…" : "CASH OUT"}</span>
                <strong>{formatMoney(amount * multiplier)} USDT</strong>
              </button>
            ) : (
              <button
                type="button"
                className={`rg-place-bet ${hasCashed ? "rg-success" : hasLost ? "rg-lost" : ""}`}
                disabled={loading || playing || (panel === 2 && autoSubmittedOne)}
                onClick={() => startAviator(panel)}
              >
                <span>
                  {loading
                    ? "PLEASE WAIT…"
                    : hasCashed
                      ? "CASHED OUT"
                      : hasLost
                        ? "ROUND LOST"
                        : "BET"}
                </span>
                <strong>{formatMoney(amount)} USDT</strong>
              </button>
            )}
          </div>
        </div>

        {payout !== null && (
          <div className="rg-panel-payout">
            Payout: <strong>{formatMoney(payout)} USDT</strong>
          </div>
        )}

        <div className="rg-panel-foot">
          <span>Bet slip {panel}</span>
          <span>Min {MIN_BET} · Max {MAX_BET} USDT</span>
        </div>
      </div>
    );
  };

  return (
    <section className="royal-games">
      <style>{`
        .royal-games {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          color: #f4f4f4;
          font-family: Inter, Arial, Helvetica, sans-serif;
          font-variant-numeric: tabular-nums;
        }
        .royal-games * { box-sizing: border-box; }
        .rg-tabs {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        .rg-tab {
          min-height: 44px;
          border: 1px solid #2e2e2e;
          border-radius: 12px;
          background: #141414;
          color: #aaa;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          transition: .18s ease;
        }
        .rg-tab.active {
          color: #17120a;
          background: ${GOLD};
          border-color: ${GOLD};
        }
        .rg-tab:disabled { opacity: .5; cursor: not-allowed; }
        .rg-panel {
          overflow: hidden;
          border: 1px solid #292929;
          border-radius: 22px;
          padding: clamp(10px,2.7vw,20px);
          background: linear-gradient(145deg,#171717,#0a0a0a);
          box-shadow: 0 18px 45px #0005;
        }
        .rg-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .rg-heading h2 {
          margin: 0;
          font-size: clamp(17px,4vw,23px);
          font-weight: 950;
          letter-spacing: -.5px;
        }
        .rg-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: ${RED};
          font-size: clamp(19px,5vw,28px);
          font-weight: 1000;
          font-style: italic;
        }
        .rg-brand-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(145deg,#bba2ff,#6538e8);
          color: white;
          font-size: 20px;
          font-style: normal;
        }
        .rg-balance {
          color: #ddd;
          font-size: 12px;
          font-weight: 850;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .rg-history {
          display: flex;
          align-items: center;
          gap: 16px;
          overflow-x: auto;
          padding: 5px 0 12px;
          margin-bottom: 3px;
          scrollbar-width: none;
        }
        .rg-history::-webkit-scrollbar { display: none; }
        .rg-history-item {
          flex: 0 0 auto;
          font-size: 13px;
          font-weight: 850;
        }
        .rg-history-item.low { color: #29b8ff; }
        .rg-history-item.mid { color: #b36aff; }
        .rg-history-item.high { color: #29d17e; }
        .rg-chart {
          position: relative;
          width: 100%;
          aspect-ratio: 1.35 / 1;
          max-height: 430px;
          margin: 0 auto 12px;
          overflow: hidden;
          border: 1px solid #2c2c31;
          border-radius: 22px;
          background:
            radial-gradient(ellipse at 52% 48%,#0d4261 0%,#06151f 33%,transparent 70%),
            #050505;
        }
        .rg-chart::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .5;
          background: repeating-conic-gradient(from 0deg at 0% 100%,#000 0deg 8deg,#111 8deg 16deg);
          mask-image: linear-gradient(45deg,#000 0%,transparent 78%);
          pointer-events: none;
        }
        .rg-multiplier {
          position: absolute;
          z-index: 2;
          top: 42%;
          left: 0;
          width: 100%;
          text-align: center;
          pointer-events: none;
        }
        .rg-multiplier strong {
          display: block;
          font-size: clamp(49px,12vw,92px);
          line-height: 1;
          font-weight: 1000;
          letter-spacing: -4px;
          text-shadow: 0 3px 24px #0008;
        }
        .rg-multiplier span {
          display: block;
          margin-top: 12px;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 2px;
          color: #c4c4c4;
        }
        .rg-chart svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .rg-result {
          position: absolute;
          z-index: 4;
          bottom: 13px;
          left: 10px;
          right: 10px;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.6px;
        }
        .rg-flight-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin: 0 0 12px;
          color: #929292;
          font-size: 10px;
          font-weight: 800;
        }
        .rg-live-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-right: 6px;
          border-radius: 50%;
          background: ${GREEN};
          box-shadow: 0 0 12px ${GREEN};
        }
        .rg-aviator-bet {
          margin-top: 10px;
          padding: clamp(10px,2.5vw,16px);
          border: 1px solid #222;
          border-radius: 20px;
          background: linear-gradient(145deg,#202020,#151515);
        }
        .rg-bet-panel-top {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 12px;
        }
        .rg-mode-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: min(100%,320px);
          padding: 4px;
          border-radius: 99px;
          background: #111;
        }
        .rg-mode-switch button {
          min-height: 36px;
          border: 0;
          border-radius: 99px;
          color: #999;
          background: transparent;
          font-size: 13px;
          cursor: pointer;
        }
        .rg-mode-switch button.selected {
          background: #303033;
          color: white;
        }
        .rg-mode-switch button:disabled { opacity: .55; }
        .rg-panel-number {
          position: absolute;
          right: 0;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #383838;
          color: #aaa;
          font-size: 11px;
        }
        .rg-auto-setting {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 12px;
          color: #aaa;
          font-size: 11px;
        }
        .rg-auto-setting div {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rg-auto-setting input {
          width: 90px;
          min-height: 36px;
          border: 1px solid #333;
          border-radius: 8px;
          background: #0b0b0b;
          color: white;
          padding: 0 8px;
        }
        .rg-panel-controls {
          display: grid;
          grid-template-columns: minmax(0,.78fr) minmax(0,1.22fr);
          gap: 12px;
        }
        .rg-panel-left,.rg-panel-right { min-width: 0; }
        .rg-amount-control {
          display: flex;
          align-items: center;
          min-height: 48px;
          overflow: hidden;
          border-radius: 99px;
          background: #111;
        }
        .rg-amount-control button {
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          margin: 4px;
          border: 0;
          border-radius: 50%;
          background: #303033;
          color: #ddd;
          font-size: 24px;
          cursor: pointer;
        }
        .rg-amount-control input {
          min-width: 0;
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: white;
          text-align: center;
          font-size: clamp(15px,4vw,22px);
          font-weight: 900;
        }
        .rg-amount-control button:disabled { opacity: .45; }
        .rg-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 8px;
        }
        .rg-quick {
          min-width: 0;
          min-height: 37px;
          padding: 4px;
          border: 0;
          border-radius: 99px;
          background: #111;
          color: #999;
          font-size: 13px;
          cursor: pointer;
        }
        .rg-quick:disabled { opacity: .45; }
        .rg-place-bet {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 103px;
          padding: 10px 5px;
          border: 2px solid #a3ff90;
          border-radius: 17px;
          background: #22ae0b;
          color: white;
          cursor: pointer;
          transition: filter .15s ease, transform .15s ease;
        }
        .rg-place-bet span {
          font-size: clamp(23px,6vw,38px);
          line-height: 1.1;
          font-weight: 500;
        }
        .rg-place-bet strong {
          margin-top: 5px;
          font-size: clamp(13px,3.8vw,22px);
          font-weight: 600;
        }
        .rg-place-bet:active:not(:disabled) { transform: scale(.985); }
        .rg-place-bet:hover:not(:disabled) { filter: brightness(1.08); }
        .rg-place-bet:disabled { opacity: .55; cursor: not-allowed; }
        .rg-place-bet.rg-cashout {
          background: ${GOLD};
          border-color: #ffe49a;
          color: #17120a;
        }
        .rg-place-bet.rg-success {
          background: #176a40;
          border-color: #3eaa76;
        }
        .rg-place-bet.rg-lost {
          background: #6b2029;
          border-color: #b94552;
        }
        .rg-panel-payout {
          margin-top: 10px;
          color: #aaa;
          font-size: 12px;
        }
        .rg-panel-payout strong { color: ${GREEN}; }
        .rg-panel-foot {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 12px;
          color: #777;
          font-size: 10px;
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
        .rg-mines-settings select {
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
          grid-template-columns: repeat(5,minmax(0,1fr));
          gap: 8px;
          margin: 16px 0;
        }
        .rg-tile {
          aspect-ratio: 1;
          min-width: 0;
          border: 1px solid #3c483e;
          border-radius: 9px;
          background: linear-gradient(145deg,#233b2a,#142219);
          color: ${GOLD};
          font-size: clamp(17px,5vw,25px);
          font-weight: 900;
          cursor: pointer;
        }
        .rg-tile:disabled { cursor: default; opacity: .95; }
        .rg-dice-card {
          padding: clamp(18px,5vw,32px) 12px;
          margin: 8px 0 16px;
          border: 1px solid #3b3320;
          border-radius: 15px;
          text-align: center;
          background: radial-gradient(ellipse at top,#282315,#11100c 75%);
        }
        .rg-dice-number {
          min-height: 90px;
          display: grid;
          place-items: center;
          font-size: clamp(42px,12vw,70px);
          font-weight: 950;
          letter-spacing: -2px;
          color: ${GOLD};
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
          background: linear-gradient(90deg,${GREEN},${GOLD});
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
          grid-template-columns: 1fr 1fr;
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
        @media (max-width: 420px) {
          .rg-panel { padding: 9px; }
          .rg-aviator-bet { padding: 9px; border-radius: 16px; }
          .rg-panel-controls { gap: 7px; grid-template-columns: minmax(0,.82fr) minmax(0,1.18fr); }
          .rg-amount-control button { flex-basis: 30px; width: 30px; height: 30px; margin: 3px; }
          .rg-amount-control { min-height: 42px; }
          .rg-quick { min-height: 33px; font-size: 12px; }
          .rg-place-bet { min-height: 95px; }
          .rg-panel-foot { font-size: 9px; }
          .rg-history { gap: 13px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .royal-games * { transition: none !important; }
        }
      `}</style>

      <div className="rg-tabs">
        <button
          type="button"
          className={`rg-tab ${game === "aviator" ? "active" : ""}`}
          onClick={() => switchGame("aviator")}
          disabled={playing || loading || minesStarted}
        >
          ✈️ Aviator
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
          {game === "aviator" ? (
            <div className="rg-brand">
              <span className="rg-brand-icon">✈</span>
              <span>Aviator</span>
            </div>
          ) : (
            <h2>{game === "dice" ? "🎲 ROYAL DICE" : "💣 MINES"}</h2>
          )}

          <div className="rg-balance">
            {balance === null
              ? "Balance updates after play"
              : `Balance: ${formatMoney(balance)} USDT`}
          </div>
        </div>

        {game === "aviator" && (
          <>
            <div className="rg-history" aria-label="Recent round multipliers">
              {history.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className={`rg-history-item ${
                    value >= 2 ? (value >= 5 ? "high" : "mid") : "low"
                  }`}
                >
                  {value.toFixed(2)}x
                </span>
              ))}
            </div>

            <div className="rg-chart">
              <div className="rg-multiplier">
                <strong
                  style={{
                    color: crashed ? RED : cashedOut ? GOLD : "#fff",
                  }}
                >
                  {crashed ? `${multiplier.toFixed(2)}×` : `${multiplier.toFixed(2)}×`}
                </strong>
                <span>
                  {crashed
                    ? "FLIGHT CRASHED"
                    : cashedOut
                      ? "CASHED OUT"
                      : playing
                        ? "ROCKET IN FLIGHT"
                        : "READY FOR TAKEOFF"}
                </span>
              </div>

              <svg viewBox="0 0 320 320" preserveAspectRatio="none" aria-label="Aviator flight trajectory">
                <defs>
                  <linearGradient id="royalAviatorFill" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor={RED} stopOpacity=".45" />
                    <stop offset="100%" stopColor={RED} stopOpacity=".01" />
                  </linearGradient>
                  <filter id="royalRocketGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d={`${chartPath} L ${rocketX} 318 L 10 318 Z`}
                  fill="url(#royalAviatorFill)"
                />

                <path
                  d={chartPath}
                  fill="none"
                  stroke={crashed ? RED : cashedOut ? GOLD : RED}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#royalRocketGlow)"
                />

                {!crashed && !cashedOut && (
                  <g transform={`translate(${rocketX},${rocketY}) rotate(-35)`}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="29"
                    >
                      ✈️
                    </text>
                  </g>
                )}

                {crashed && (
                  <g transform={`translate(${rocketX},${rocketY})`}>
                    <circle r="25" fill={RED} fillOpacity=".2" stroke={RED} strokeWidth="2" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="24">💥</text>
                  </g>
                )}

                {cashedOut && (
                  <g transform={`translate(${rocketX},${rocketY})`}>
                    <circle r="22" fill={GOLD} fillOpacity=".2" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="22" fill={GOLD}>✓</text>
                  </g>
                )}
              </svg>

              {(crashed || cashedOut) && (
                <div className="rg-result" style={{ color: crashed ? RED : GOLD }}>
                  {flightResult}
                </div>
              )}
            </div>

            <div className="rg-flight-status">
              <span>
                <span className="rg-live-dot" />
                {playing ? "LIVE ROUND" : "WAITING FOR NEXT ROUND"}
              </span>
              <span>{playing ? "Cash out before the crash" : "Place your bet to start"}</span>
            </div>

            {renderAviatorPanel(1)}
            {renderAviatorPanel(2)}

            <p className="rg-note">
              Minimum bet {MIN_BET} USDT. Maximum bet {MAX_BET} USDT. The
              multiplier and crash outcome are controlled by the server.
              Historical multipliers shown here are illustrative until connected
              to a real round-history endpoint.
            </p>
          </>
        )}

        {game === "dice" && (
          <>
            <div className="rg-dice-card">
              <div
                className="rg-dice-number"
                style={{
                  color: diceWon === null ? GOLD : diceWon ? GREEN : RED,
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
                <div className="rg-dice-fill" style={{ width: `${diceTarget}%` }} />
                <div className="rg-dice-marker" style={{ left: `${diceTarget}%` }} />
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
                  onChange={(event) => setDiceTarget(Number(event.target.value))}
                />
              </div>
            </div>

            <div className="rg-panel-controls">
              <div className="rg-panel-left">
                <div className="rg-amount-control">
                  <button type="button" disabled={loading} onClick={() => changeBet(bet - 10)}>−</button>
                  <input
                    aria-label="Dice bet amount"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    step="1"
                    value={bet}
                    disabled={loading}
                    onChange={(event) => changeBet(Number(event.target.value) || MIN_BET)}
                  />
                  <button type="button" disabled={loading} onClick={() => changeBet(bet + 10)}>+</button>
                </div>
              </div>
              <div className="rg-panel-right">
                <button type="button" className="rg-place-bet" onClick={playDice} disabled={loading}>
                  <span>{loading ? "ROLLING…" : "ROLL DICE"}</span>
                  <strong>{formatMoney(bet)} USDT</strong>
                </button>
              </div>
            </div>

            {dicePayout !== null && (
              <p className="rg-note">Last payout: {formatMoney(dicePayout)} USDT.</p>
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
                {Array.from({ length: 24 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "mine" : "mines"}
                  </option>
                ))}
              </select>
              <strong style={{ color: GOLD }}>{minesMultiplier.toFixed(2)}×</strong>
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

            <div className="rg-panel-controls">
              <div className="rg-panel-left">
                <div className="rg-amount-control">
                  <button type="button" disabled={minesStarted || loading} onClick={() => changeBet(bet - 10)}>−</button>
                  <input
                    aria-label="Mines bet amount"
                    type="number"
                    min={MIN_BET}
                    max={MAX_BET}
                    step="1"
                    value={bet}
                    disabled={minesStarted || loading}
                    onChange={(event) => changeBet(Number(event.target.value) || MIN_BET)}
                  />
                  <button type="button" disabled={minesStarted || loading} onClick={() => changeBet(bet + 10)}>+</button>
                </div>
              </div>
              <div className="rg-panel-right">
                {minesStarted ? (
                  <button
                    type="button"
                    className="rg-place-bet rg-cashout"
                    disabled={loading || revealedTiles.length === 0}
                    onClick={cashOutMines}
                  >
                    <span>{loading ? "PROCESSING…" : "CASH OUT"}</span>
                    <strong>{formatMoney(bet * minesMultiplier)} USDT</strong>
                  </button>
                ) : (
                  <button type="button" className="rg-place-bet" disabled={loading} onClick={startMines}>
                    <span>{loading ? "STARTING…" : "START ROUND"}</span>
                    <strong>{formatMoney(bet)} USDT</strong>
                  </button>
                )}
              </div>
            </div>

            <p className="rg-note">
              Choose your mine count, reveal safe tiles, and cash out before hitting a mine.
            </p>
          </>
        )}

        {message && (
          <div
            className={`rg-message ${
              messageType === "good" ? "rg-good" : messageType === "bad" ? "rg-bad" : "rg-info"
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