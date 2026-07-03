import { notFound } from "next/navigation";
import { CONTRACTS, getContract } from "@/contracts/registry";
import { ContractLab } from "@/components/lab/ContractLab";

export function generateStaticParams() {
  return CONTRACTS.map((c) => ({ contract: c.slug }));
}

export default async function ContractLabPage({
  params,
}: {
  params: Promise<{ contract: string }>;
}) {
  const { contract } = await params;
  if (!getContract(contract)) notFound();
  return <ContractLab slug={contract} />;
}
