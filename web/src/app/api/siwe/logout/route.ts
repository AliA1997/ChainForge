import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { siweStore, SESSION_COOKIE } from "@/lib/siwe-store";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) siweStore.sessions.delete(token);
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
