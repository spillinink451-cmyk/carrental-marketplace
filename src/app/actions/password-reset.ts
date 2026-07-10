"use server";

import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return { success: true }; // don't leak which emails exist

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(verificationTokens).values({ identifier: email, token, expires });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;

  // TODO: swap for a real Resend email once notifications are wired up (still on the roadmap).
  console.log(`Password reset link for ${email}: ${resetUrl}`);

  return { success: true };
}

export async function resetPassword(input: { email: string; token: string; newPassword: string }) {
  if (input.newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, input.email), eq(verificationTokens.token, input.token)));

  if (!record || record.expires < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.email, input.email));
  await db.delete(verificationTokens)
    .where(and(eq(verificationTokens.identifier, input.email), eq(verificationTokens.token, input.token)));

  return { success: true };
}