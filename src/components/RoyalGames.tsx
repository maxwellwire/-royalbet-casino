import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Wallet,
} from "lucide-react";

type GameType = "aviator" | "slots" | "mines";

const GAME_NAMES: Record<GameType, string> = {
  aviator: "Royal Aviator",
  slots: "Royal Slots",
  mines: "Royal Mines",
};

export default function RoyalGames({
  game,
}: {
  game: GameType;
}) {
  return (
    <main
      className="page-container"
      style={{
        maxWidth: 860,
        paddingTop: 48,
        paddingBottom: 80,
      }}
    >
      <section
        className="account-info-card"
        style={{
          padding: "clamp(24px, 5vw, 48px)",
          textAlign: "center",
        }}
      >
        <div
          className="eyebrow"
          style={{ justifyContent: "center" }}
        >
          <ShieldCheck size={16} />
          ROYALBET GAME SECURITY
        </div>

        <h1
          style={{
            margin: "18px 0 12px",
            fontSize: "clamp(30px, 5vw, 44px)",
          }}
        >
          {GAME_NAMES[game]}
        </h1>

        <p
          style={{
            color: "#a5aaa3",
            lineHeight: 1.7,
            maxWidth: 580,
            margin: "0 auto 24px",
          }}
        >
          This game is temporarily unavailable while
          secure server-side gameplay and account
          settlement are being completed. No simulated
          balance or pretend winnings are used.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Link
            href="/casino"
            className="button button-outline"
          >
            <ArrowLeft size={16} />
            Back to casino
          </Link>

          <Link
            href="/wallet?type=DEPOSIT"
            className="button button-gold"
          >
            <Wallet size={16} />
            Open wallet
          </Link>
        </div>
      </section>
    </main>
  );
}