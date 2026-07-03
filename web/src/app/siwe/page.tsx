"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";
import { ConnectGate } from "@/components/ConnectGate";
import { CodeBlock } from "@/components/CodeBlock";
import { shortAddress } from "@/lib/format";

interface Session {
  address: string;
  chainId: number;
  issuedAt: number;
}

export default function SiwePage() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [lastMessage, setLastMessage] = useState<string>();

  const { data: session } = useQuery({
    queryKey: ["siwe-session"],
    queryFn: async (): Promise<Session | null> => {
      const res = await fetch("/api/siwe/session");
      const json = (await res.json()) as { session: Session | null };
      return json.session;
    },
  });

  async function signIn() {
    if (!address || !chainId) return;
    setBusy(true);
    setError(undefined);
    try {
      // 1. server issues a single-use nonce
      const { nonce } = (await (await fetch("/api/siwe/nonce")).json()) as { nonce: string };

      // 2. build the EIP-4361 message — domain + chainId + nonce are the anti-replay trio
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        uri: window.location.origin,
        nonce,
        version: "1",
        statement: "Sign in to ChainForge. This costs no gas and sends no transaction.",
        expirationTime: new Date(Date.now() + 5 * 60 * 1000),
      });
      setLastMessage(message);

      // 3. wallet signs — off-chain, free
      const signature = await signMessageAsync({ message });

      // 4. server verifies and sets an httpOnly session cookie
      const res = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      if (!res.ok) {
        const { error: serverError } = (await res.json()) as { error?: string };
        throw new Error(serverError ?? `verification failed (${res.status})`);
      }
      await queryClient.invalidateQueries({ queryKey: ["siwe-session"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/siwe/logout", { method: "POST" });
    await queryClient.invalidateQueries({ queryKey: ["siwe-session"] });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Sign-In with Ethereum</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Prove wallet ownership with a free off-chain signature (EIP-4361), verified{" "}
        <em>server-side</em> by a Next.js Route Handler that issues an httpOnly session cookie.
        No passwords, no OAuth, no gas.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ConnectGate>
            <div className="card p-6">
              {session ? (
                <>
                  <p className="text-sm text-zinc-400">Authenticated session (from the server):</p>
                  <p className="mt-2 font-mono text-lg text-emerald-400">
                    {shortAddress(session.address)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    chain {session.chainId} · issued {new Date(session.issuedAt).toLocaleTimeString()}
                    · expires in 1h
                  </p>
                  <button className="btn-ghost mt-4" onClick={signOut}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-400">
                    Wallet <span className="font-mono text-zinc-200">{address && shortAddress(address)}</span>{" "}
                    is <span className="text-amber-400">connected but not authenticated</span> —
                    the server has no idea you control this key yet.
                  </p>
                  <button className="btn-primary mt-4" disabled={busy} onClick={signIn}>
                    {busy ? "Check your wallet…" : "Sign-In with Ethereum"}
                  </button>
                  {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                </>
              )}
            </div>
          </ConnectGate>

          {lastMessage && (
            <CodeBlock title="The exact EIP-4361 message you signed" code={lastMessage} />
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-white">The flow, step by step</h2>
            <ol className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400">
              <li>
                <span className="font-mono text-indigo-300">1 · GET /api/siwe/nonce</span> — the
                server mints a random single-use nonce. Client-invented nonces would allow replays.
              </li>
              <li>
                <span className="font-mono text-indigo-300">2 · createSiweMessage()</span> — the
                message binds address + domain + chain id + nonce + expiry. Each field defeats a
                specific attack.
              </li>
              <li>
                <span className="font-mono text-indigo-300">3 · personal_sign</span> — the wallet
                signs off-chain. Free, instant, nothing touches the chain.
              </li>
              <li>
                <span className="font-mono text-indigo-300">4 · POST /api/siwe/verify</span> — the
                server burns the nonce, checks domain and expiry, recovers the signer, and only
                then sets an <span className="font-mono">httpOnly</span> cookie.
              </li>
            </ol>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-white">Interview ammunition</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
              <li>
                A connected wallet is <em>not</em> an authenticated user — any client can claim any
                address. Only the signature over a server nonce proves key control.
              </li>
              <li>
                Verification must be server-side: a client saying &ldquo;trust me, it
                verified&rdquo; is just a curl command away from impersonation.
              </li>
              <li>
                The domain binding stops a phishing site from reusing your signature here; the
                chain id stops cross-chain replay; the nonce stops plain replay.
              </li>
              <li>
                This route verifies EOAs with <span className="font-mono">verifyMessage</span>.
                Smart-account wallets sign via ERC-1271/6492 and need{" "}
                <span className="font-mono">publicClient.verifySiweMessage</span> against the chain.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
