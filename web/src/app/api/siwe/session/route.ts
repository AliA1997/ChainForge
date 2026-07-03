import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/siwe-store";

/**
 * Who is signed in? Decided ONLY by the httpOnly session cookie — never by an
 * address the client claims. A connected wallet is not an authenticated user.
 */
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return NextResponse.json({ session: getSession(token) });
}
