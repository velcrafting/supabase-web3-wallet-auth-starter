import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard/transactions?tab=onramp");
}