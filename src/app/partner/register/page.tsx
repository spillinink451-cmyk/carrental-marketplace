import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCountries } from "@/db/queries";
import PartnerRegisterForm from "@/components/PartnerRegisterForm";

export default async function PartnerRegisterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/partner/register");

  const [existingLink] = await db.select().from(companyUsers).where(eq(companyUsers.userId, session.user.id));
  if (existingLink) redirect("/partner");

  const countryList = await getCountries();

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16 bg-canvas">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-[20px] shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">List your rental company</h1>
        <p className="text-slate-500 text-sm mb-8">
          Register your company to start listing cars. An admin will review and approve your account before it goes live.
        </p>
        <PartnerRegisterForm countries={countryList} defaultEmail={session.user.email ?? ""} />
      </div>
    </main>
  );
}