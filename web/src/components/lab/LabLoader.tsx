"use client";

import dynamic from "next/dynamic";
import { LabSkeleton } from "@/components/Skeleton";

// The lab pulls in the full wagmi/viem interaction stack — lazy-load it
// client-side behind a layout-matching skeleton so the (server-rendered)
// lesson header paints immediately.
const ContractLab = dynamic(
  () => import("./ContractLab").then((mod) => ({ default: mod.ContractLab })),
  { ssr: false, loading: () => <LabSkeleton /> },
);

export function LabLoader({ slug }: { slug: string }) {
  return <ContractLab slug={slug} />;
}
