import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { verifyMessage } from "viem";
import { parseSiweMessage } from "viem/siwe";
import { consumeNonce, siweStore, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/siwe-store";

/**
 * Step 3 of SIWE: verify the signature SERVER-SIDE and mint a session.
 * The checks, in order — each one defeats a specific attack:
 *   1. nonce is one we issued and unused   → replay protection
 *   2. domain matches this host            → signature phished on another site is useless here
 *   3. message not expired                 → bounded signature lifetime
 *   4. signature recovers to the address   → proof of key control
 * Note: verifyMessage covers EOAs. Smart-account wallets (ERC-1271/6492) need
 * publicClient.verifySiweMessage against the target chain — a great follow-up
 * to know about in interviews.
 */
export async function POST(request: NextRequest) {
  const { message, signature } = (await request.json()) as {
    message?: string;
    signature?: `0x${string}`;
  };
  if (!message || !signature) {
    return NextResponse.json({ error: "message and signature are required" }, { status: 400 });
  }

  const fields = parseSiweMessage(message);
  if (!fields.address || !fields.nonce || !fields.domain || !fields.chainId) {
    return NextResponse.json({ error: "malformed SIWE message" }, { status: 400 });
  }

  if (!consumeNonce(fields.nonce)) {
    return NextResponse.json({ error: "unknown or expired nonce (replay?)" }, { status: 401 });
  }

  const host = request.headers.get("host");
  if (!host || fields.domain !== host) {
    return NextResponse.json(
      { error: `domain mismatch: message is for ${fields.domain}, this is ${host}` },
      { status: 401 },
    );
  }

  if (fields.expirationTime && fields.expirationTime.getTime() < Date.now()) {
    return NextResponse.json({ error: "message expired" }, { status: 401 });
  }

  const valid = await verifyMessage({ address: fields.address, message, signature });
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const token = randomUUID();
  const session = { address: fields.address, chainId: fields.chainId, issuedAt: Date.now() };
  siweStore.sessions.set(token, session);

  // httpOnly: JS can't read it — XSS can't exfiltrate the session.
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });

  return NextResponse.json({ session });
}
