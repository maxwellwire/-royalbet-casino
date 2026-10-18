import { redirect } from "next/navigation";
import RoyalGames from "@/components/RoyalGames";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SlotsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=%2Fcasino%2Fslots");
  }

  if (
    !Number.isFinite(Number(user.balance)) ||
    Number(user.balance) < 50
  ) {
    redirect("/wallet?type=DEPOSIT&required=50");
  }

  return <RoyalGames game="slots" />;
}