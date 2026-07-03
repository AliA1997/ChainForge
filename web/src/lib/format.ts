import type { Chain } from "viem";

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function explorerTxUrl(chain: Chain | undefined, hash: string): string | undefined {
  const base = chain?.blockExplorers?.default?.url;
  return base ? `${base}/tx/${hash}` : undefined;
}

export function explorerAddressUrl(chain: Chain | undefined, address: string): string | undefined {
  const base = chain?.blockExplorers?.default?.url;
  return base ? `${base}/address/${address}` : undefined;
}

/** JSON.stringify that survives bigints — for rendering arbitrary read results. */
export function stringifyResult(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === "bigint" ? `${v.toString()}n` : v),
    2,
  );
}

export function formatGwei(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  return gwei >= 10 ? gwei.toFixed(1) : gwei.toFixed(3);
}
