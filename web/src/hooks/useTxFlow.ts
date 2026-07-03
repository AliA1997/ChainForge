"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { Abi, Address, Hex, PublicClient } from "viem";
import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";
import { useToasts } from "@/components/Toasts";
import { explorerTxUrl } from "@/lib/format";

/**
 * The write-side state machine the constitution mandates:
 *   idle → wallet (signature prompt) → pending (tx in mempool)
 *        → confirmed | reverted | rejected | failed
 * Every transition is surfaced via toasts keyed to the tx hash.
 */
export type TxPhase =
  | "idle"
  | "wallet"
  | "pending"
  | "confirmed"
  | "reverted"
  | "rejected"
  | "failed";

export interface TxState {
  phase: TxPhase;
  hash?: Hex;
  error?: string;
}

function decodeError(error: unknown): { phase: TxPhase; message: string } {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return { phase: "rejected", message: "You rejected the request in your wallet." };
    }
    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName ?? reverted.signature ?? "execution reverted";
      return { phase: "reverted", message: `Reverted: ${name}` };
    }
    return { phase: "failed", message: error.shortMessage };
  }
  return { phase: "failed", message: error instanceof Error ? error.message : String(error) };
}

export function useTxFlow() {
  const [state, setState] = useState<TxState>({ phase: "idle" });
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { chain } = useAccount();
  const toasts = useToasts();

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  const sendWrite = useCallback(
    async (
      params: {
        address: Address;
        abi: Abi;
        functionName: string;
        args?: readonly unknown[];
        value?: bigint;
      },
      options?: { label?: string; onConfirmed?: () => void },
    ) => {
      if (!walletClient || !publicClient) {
        toasts.push({ kind: "error", title: "Connect a wallet first" });
        return;
      }
      const label = options?.label ?? params.functionName;

      setState({ phase: "wallet" });
      let hash: Hex;
      try {
        // simulate first: catches reverts BEFORE the user pays gas.
        // Cast to the generic client: the runtime ABIs here are dynamic, and
        // viem's per-chain typed overloads explode on the 6-chain union.
        const { request } = await (publicClient as PublicClient).simulateContract({
          ...params,
          account: walletClient.account,
        });
        hash = await walletClient.writeContract(request);
      } catch (error) {
        const { phase, message } = decodeError(error);
        setState({ phase, error: message });
        toasts.push({ kind: "error", title: `${label} — not sent`, detail: message });
        return;
      }

      setState({ phase: "pending", hash });
      const toastId = toasts.push({
        kind: "pending",
        title: `${label} pending…`,
        detail: hash,
        explorerUrl: explorerTxUrl(chain, hash),
        sticky: true,
      });

      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status === "success") {
          setState({ phase: "confirmed", hash });
          toasts.update(toastId, { kind: "success", title: `${label} confirmed`, sticky: false });
          options?.onConfirmed?.();
        } else {
          setState({ phase: "reverted", hash, error: "Transaction reverted on-chain." });
          toasts.update(toastId, {
            kind: "error",
            title: `${label} reverted`,
            detail: "The transaction was mined but reverted. Gas was still spent.",
            sticky: false,
          });
        }
        return receipt;
      } catch (error) {
        const { message } = decodeError(error);
        setState({ phase: "failed", hash, error: message });
        toasts.update(toastId, { kind: "error", title: `${label} failed`, detail: message, sticky: false });
      }
    },
    [walletClient, publicClient, chain, toasts],
  );

  return { state, sendWrite, reset };
}

/** Same state machine, but for contract creation. Resolves the deployed address. */
export function useDeployFlow() {
  const [state, setState] = useState<TxState & { deployedAddress?: Address }>({ phase: "idle" });
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { chain } = useAccount();
  const toasts = useToasts();

  const deploy = useCallback(
    async (
      params: { abi: Abi; bytecode: Hex; args?: readonly unknown[]; label: string },
      options?: { onDeployed?: (address: Address) => void },
    ) => {
      if (!walletClient || !publicClient) {
        toasts.push({ kind: "error", title: "Connect a wallet first" });
        return;
      }

      setState({ phase: "wallet" });
      let hash: Hex;
      try {
        hash = await walletClient.deployContract({
          abi: params.abi,
          bytecode: params.bytecode,
          args: params.args as never,
          account: walletClient.account,
          chain: walletClient.chain,
        });
      } catch (error) {
        const { phase, message } = decodeError(error);
        setState({ phase, error: message });
        toasts.push({ kind: "error", title: `Deploy ${params.label} — not sent`, detail: message });
        return;
      }

      setState({ phase: "pending", hash });
      const toastId = toasts.push({
        kind: "pending",
        title: `Deploying ${params.label}…`,
        detail: hash,
        explorerUrl: explorerTxUrl(chain, hash),
        sticky: true,
      });

      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status === "success" && receipt.contractAddress) {
          setState({ phase: "confirmed", hash, deployedAddress: receipt.contractAddress });
          toasts.update(toastId, {
            kind: "success",
            title: `${params.label} deployed`,
            detail: receipt.contractAddress,
            sticky: false,
          });
          options?.onDeployed?.(receipt.contractAddress);
          return receipt.contractAddress;
        }
        setState({ phase: "reverted", hash, error: "Deployment reverted." });
        toasts.update(toastId, { kind: "error", title: `Deploy ${params.label} reverted`, sticky: false });
      } catch (error) {
        const { message } = decodeError(error);
        setState({ phase: "failed", hash, error: message });
        toasts.update(toastId, { kind: "error", title: `Deploy ${params.label} failed`, detail: message, sticky: false });
      }
    },
    [walletClient, publicClient, chain, toasts],
  );

  return { state, deploy };
}
