import { NextResponse } from "next/server";
import { generateSiweNonce } from "viem/siwe";
import { issueNonce } from "@/lib/siwe-store";

/**
 * Step 1 of SIWE: the SERVER issues a random, single-use nonce. The client
 * never invents its own — a client-chosen nonce would let attackers replay
 * old signatures.
 */
export async function GET() {
  const nonce = generateSiweNonce();
  issueNonce(nonce);
  return NextResponse.json({ nonce });
}
