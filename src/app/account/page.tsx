import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, Dice5, History, ShieldCheck } from "lucide-react";
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
            WELCOME, <span className="gold-text">{user.username}</span>
          </h1>
          <p>{user.email}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="button button-outline" type="submit">
            Log out
          </button>
        </form>
      </section>
      <section className="account-grid">
        <article className="balance-card">
          <span>VIRTUAL BALANCE</span>
          <strong>{Number(user.demoCredits).toLocaleString()}</strong>
          <small>Demo credits · No cash value</small>
        </article>
        <article className="account-info-card">
          <ShieldCheck size={25} />
          <h3>Account status</h3>
          <p>Signed in</p>
          <small>Role: {user.role}</small>
        </article>
        <article className="account-info-card">
          <Dice5 size={25} />
          <h3>Explore games</h3>
          <p>Try Royal Dice using virtual credits.</p>
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
            <p>Your completed games will appear here.</p>
            <Link href="/casino/dice" className="button button-gold">
              Try Royal Dice
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Bet</th>
                  <th>Result</th>
                  <th>Profit</th>
                  <th>Virtual balance</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((game) => {
                  const betAmount = Number(game.betAmount);
                  const profit = Number(game.profit);
                  const balanceAfter = Number(game.balanceAfter);
                  return (
                    <tr key={game.id}>
                      <td>{game.game}</td>
                      <td>{betAmount.toFixed(2)}</td>
                      <td>{game.result}</td>
                      <td
                        className={
                          profit >= 0 ? "positive" : "negative"
                        }
                      >
                        {profit > 0 ? "+" : ""}
                        {profit.toFixed(2)}
                      </td>
                      <td>{balanceAfter.toLocaleString()}</td>
                      <td>{game.createdAt.toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}