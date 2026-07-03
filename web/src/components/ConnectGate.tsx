"use client";

import { useAccount } from "wagmi";
import { WalletButton } from "./WalletButton";

/**
 * Wraps interactive on-chain features. Renders children only when a wallet is
 * connected; otherwise explains what's needed. Reads still work without a
 * wallet elsewhere — this gate is for flows that need signatures.
 */
export function ConnectGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-lg font-medium text-white">Connect a wallet to continue</p>
        <p className="max-w-md text-sm text-zinc-400">
          Deploying and writing to contracts requires a signature. Install MetaMask (or any
          injected wallet), switch it to a testnet, and grab free funds from a faucet — see the{" "}
          <a href="/testnets" className="text-indigo-400 hover:underline">Testnets</a> page.
        </p>
        <WalletButton />
      </div>
    );
  }

  return <>{children}</>;
}
