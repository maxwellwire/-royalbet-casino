import { redirect } from "next/navigation";
import RoyalGames from "@/components/RoyalGames";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SlotsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/casino/slots");
  }

  return <RoyalGames game="slots" />;
}