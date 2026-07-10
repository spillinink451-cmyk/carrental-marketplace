import { auth } from "@/auth";
import { getEvidenceUploadUrl, getCarImageUploadUrl } from "@/lib/r2";
import { db } from "@/db";
import { companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType, purpose } = await req.json();
  if (!filename || !contentType || !purpose) return NextResponse.json({ error: "Missing filename/contentType/purpose" }, { status: 400 });

  if (purpose === "car-image") {
    const [link] = await db.select({ companyId: companyUsers.companyId }).from(companyUsers).where(eq(companyUsers.userId, session.user.id));
    if (!link) return NextResponse.json({ error: "Only partner companies can upload car photos" }, { status: 403 });
    const key = `${link.companyId}/${Date.now()}-${sanitizeFilename(filename)}`;
    return NextResponse.json(await getCarImageUploadUrl(key, contentType));
  }

  if (purpose === "evidence") {
  const key = `${session.user.id}/${Date.now()}-${sanitizeFilename(filename)}`;
  return NextResponse.json(await getEvidenceUploadUrl(key, contentType));
}



  return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
}