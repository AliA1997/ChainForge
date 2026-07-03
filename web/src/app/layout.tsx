import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "@/lib/wagmi";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainForge — learn web3 by deploying it",
  description:
    "Deploy real smart contracts to testnets while learning the EVM, gas, opcodes, SIWE, and the frontend patterns senior web3 interviews expect.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Rehydrate wagmi's connection state from the request cookie so the wallet
  // button renders correctly on first paint (no connect-button flash).
  const initialState = cookieToInitialState(getConfig(), (await headers()).get("cookie"));

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers initialState={initialState}>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">{children}</main>
          <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600">
            ChainForge — testnets only. Never use a key that has held real funds.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
