"use client";

import dynamic from "next/dynamic";
import { SiweSkeleton } from "@/components/Skeleton";

// Wallet signing needs the browser — lazy client-only chunk behind a skeleton.
const SiweAuthPanel = dynamic(() => import("@/components/siwe/SiweAuthPanel"), {
  ssr: false,
  loading: () => <SiweSkeleton />,
});

export default function SiwePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Sign-In with Ethereum</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Prove wallet ownership with a free off-chain signature (EIP-4361), verified{" "}
        <em>server-side</em> by a Next.js Route Handler that issues an httpOnly session cookie.
        No passwords, no OAuth, no gas.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SiweAuthPanel />

        {/* static explainers — render immediately */}
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
