import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, Dice5, History } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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
    <div className="page-container">
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
        <article className="balance-card">
          <span>USDT BALANCE</span>

          <strong>
            {Number(user.balance).toFixed(2)} USDT
          </strong>

          <small>Account balance</small>
        </article>

        <article className="account-info-card">
          <Dice5 size={25} />

          <h3>Explore games</h3>

          <p>Explore Royal Dice.</p>

          <Link href="/casino/dice" className="text-link">
            Play now →
          </Link>
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
            <Dice5 size={36} />

            <h3>No games played yet</h3>

            <p>
              Your completed games will appear here.
            </p>

            <Link
              href="/casino/dice"
              className="button button-gold"
            >
              Try Royal Dice
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
                      {game.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}