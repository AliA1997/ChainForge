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

/** The interactive half of the SIWE page — lazy-loaded client-only. */
export default function SiweAuthPanel() {
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
                Wallet{" "}
                <span className="font-mono text-zinc-200">{address && shortAddress(address)}</span>{" "}
                is <span className="text-amber-400">connected but not authenticated</span> — the
                server has no idea you control this key yet.
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
  );
}
