import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Crown,
  History,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TELEGRAM_URL = "https://t.me/RoyalBetPayments";

const DEPOSIT_URL =
  `${TELEGRAM_URL}?text=${encodeURIComponent(
    "Hi\nI want to deposit and claim the 200% bonus"
  )}`;

const WITHDRAW_URL =
  `${TELEGRAM_URL}?text=${encodeURIComponent(
    "Hi\nI want to withdraw my funds"
  )}`;

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const history = await prisma.gameHistory.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <main className="page-container">
      <section className="account-welcome">
        <div>
          <div className="eyebrow">
            <Crown size={15} />
            YOUR ROYAL ACCOUNT
          </div>

          <h1>
            WELCOME,{" "}
            <span className="gold-text">
              {user.username}
            </span>
          </h1>
        </div>
      </section>

      <section className="account-grid">
        {/* KEEP THESE TWO BUTTONS ON THE ACCOUNT PAGE */}
        <article className="balance-card">
          <span>USDT BALANCE</span>

          <strong>
            {Number(user.balance).toFixed(2)} USDT
          </strong>

          <small>Account balance</small>

          <div className="account-balance-actions">
            <a
              href={DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-gold"
            >
              <ArrowDownToLine size={17} />
              Deposit
            </a>

            <a
              href={WITHDRAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              <ArrowUpFromLine size={17} />
              Withdraw
            </a>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <History size={15} />
              YOUR ACTIVITY
            </div>

            <h2>RECENT GAME HISTORY</h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <History size={36} />

            <h3>No games played yet</h3>

            <p>
              Your completed games will appear here.
            </p>

            <Link
              href="/casino"
              className="button button-gold"
            >
              Explore available games
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Bet (USDT)</th>
                  <th>Result</th>
                  <th>Payout (USDT)</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {history.map((game) => (
                  <tr key={game.id}>
                    <td>{game.game}</td>

                    <td>
                      {Number(game.betAmount).toFixed(2)}
                    </td>

                    <td>{game.result}</td>

                    <td>
                      {Number(game.payout).toFixed(2)}
                    </td>

                    <td>
                      {new Date(
                        game.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}