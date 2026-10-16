import { redirect } from "next/navigation";
import Link from "next/link";

import DiceGame from "@/components/DiceGame";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DicePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="page-container">
      <section className="page-heading">
        <div className="eyebrow">ROYALBET ORIGINAL</div>

        <h1>
          ROYAL <span className="gold-text">DICE</span>
        </h1>

        <p>
          Welcome, {user.username}. Your virtual balance is{" "}
          <strong>{user.demoCredits.toLocaleString()}</strong> credits.
        </p>

        <p>
          <Link href="/account" className="text-link">
            Back to account →
          </Link>
        </p>
      </section>

      <DiceGame />
    </div>
  );
}