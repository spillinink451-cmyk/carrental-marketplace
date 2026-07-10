import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/");
  }
  return session;
}