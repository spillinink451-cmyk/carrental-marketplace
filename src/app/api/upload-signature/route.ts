import { auth } from "@/auth";
import { uploadSignature } from "@/lib/r2";
import { NextResponse } from "next/server";

function dataUrlToBuffer(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid data URL");
  }

  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  return { buffer, contentType };
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { dataUrl } = await req.json();

    if (!dataUrl) {
      return NextResponse.json(
        { error: "Missing dataUrl" },
        { status: 400 }
      );
    }

    const { buffer, contentType } = dataUrlToBuffer(dataUrl);

    const key = `${session.user.id}/${Date.now()}-signature.png`;

const signatureKey = await uploadSignature(
  key,
  buffer,
  contentType
);

return NextResponse.json({
  signatureKey,
});
  } catch (err) {
    console.error("Signature upload failed:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}