import { auth } from "@/auth";
import { db } from "@/db";
import { leaseAgreements, companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLeaseDocumentReadUrl } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, id));
  if (!lease || !lease.pdfUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let authorized = lease.lesseeUserId === session.user.id;
  if (!authorized) {
    const [link] = await db.select().from(companyUsers).where(eq(companyUsers.userId, session.user.id));
    if (link && link.companyId === lease.companyId) authorized = true;
  }
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const signedUrl = await getLeaseDocumentReadUrl(lease.pdfUrl);
  return NextResponse.redirect(signedUrl);
}