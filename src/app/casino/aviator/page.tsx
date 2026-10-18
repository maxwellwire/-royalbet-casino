import { redirect } from "next/navigation";
import RoyalGames from "@/components/RoyalGames";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AviatorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/casino/aviator");
  }

  return <RoyalGames game="aviator" />;
}