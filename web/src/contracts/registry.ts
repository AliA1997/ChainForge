import type { Abi, Hex } from "viem";
import {
  assemblyLabAbi,
  assemblyLabBytecode,
  counterAbi,
  counterBytecode,
  create2FactoryAbi,
  create2FactoryBytecode,
  delegateDemoAbi,
  delegateDemoBytecode,
  delegateLogicAbi,
  delegateLogicBytecode,
  guestBookAbi,
  guestBookBytecode,
  tipJarAbi,
  tipJarBytecode,
} from "./generated";

export interface ContractMeta {
  slug: string;
  name: string;
  lesson: number;
  tagline: string;
  description: string;
  tutorialSlug: string;
  abi: Abi;
  bytecode: Hex;
  /** Extra guidance shown next to specific constructor inputs. */
  constructorHints?: Record<string, string>;
  /** Functions worth calling first, surfaced as suggestions in the lab. */
  tryFirst?: string[];
}

export const CONTRACTS: ContractMeta[] = [
  {
    slug: "counter",
    name: "Counter",
    lesson: 1,
    tagline: "State, events, custom errors, access control",
    description:
      "The hello-world contract: one storage slot, three mutations, and an event on every change. Deploy it, increment it, then watch the CounterChanged events stream in.",
    tutorialSlug: "your-first-contract",
    abi: counterAbi as Abi,
    bytecode: counterBytecode as Hex,
    constructorHints: { initialOwner: "The only address allowed to call setValue. Defaults to you." },
    tryFirst: ["increment", "value", "decrement (while at 0 — watch it revert)"],
  },
  {
    slug: "guestbook",
    name: "GuestBook",
    lesson: 2,
    tagline: "Structs, dynamic arrays, calldata, pagination",
    description:
      "An on-chain message wall. Post messages, then read them back through the paginated getter — and learn why a contract must never return an unbounded array.",
    tutorialSlug: "storage-structs-and-pagination",
    abi: guestBookAbi as Abi,
    bytecode: guestBookBytecode as Hex,
    tryFirst: ["post", "getMessages with offset 0, limit 10", "totalMessages"],
  },
  {
    slug: "tipjar",
    name: "TipJar",
    lesson: 3,
    tagline: "Payable, withdraw pattern, reentrancy guard",
    description:
      "Send real (testnet) ETH with a message. Demonstrates payable functions, checks-effects-interactions, and a hand-rolled reentrancy lock — the security patterns every interview probes.",
    tutorialSlug: "payable-and-reentrancy",
    abi: tipJarAbi as Abi,
    bytecode: tipJarBytecode as Hex,
    constructorHints: { owner_: "Immutable — only this address can withdraw. Defaults to you." },
    tryFirst: ["tip with a small ETH value", "totalReceived", "withdraw (as owner)"],
  },
  {
    slug: "create2-factory",
    name: "Create2Factory",
    lesson: 4,
    tagline: "CREATE2 and deterministic addresses",
    description:
      "Predict a contract address before it exists, then deploy exactly there. The mechanism behind counterfactual smart-account addresses in ERC-4337.",
    tutorialSlug: "create2-deterministic-deploys",
    abi: create2FactoryAbi as Abi,
    bytecode: create2FactoryBytecode as Hex,
    tryFirst: ["predictAddress with any 32-byte salt", "deployCounter with the same salt", "predictAddress again — same answer"],
  },
  {
    slug: "delegate-logic",
    name: "DelegateLogic",
    lesson: 5,
    tagline: "The implementation half of the proxy lesson",
    description:
      "Deploy this first: it is the code DelegateDemo will run via DELEGATECALL. On its own it's an ordinary contract with number and lastWriter slots.",
    tutorialSlug: "delegatecall-and-proxies",
    abi: delegateLogicAbi as Abi,
    bytecode: delegateLogicBytecode as Hex,
    tryFirst: ["setNumber", "number"],
  },
  {
    slug: "delegate-demo",
    name: "DelegateDemo",
    lesson: 5,
    tagline: "DELEGATECALL — the opcode behind every proxy",
    description:
      "Points at a DelegateLogic and calls it two ways. Via delegatecall, the write lands in DelegateDemo's storage and msg.sender stays you. Via a plain call, it lands in the logic contract and msg.sender becomes the demo. Seeing the difference IS understanding proxies.",
    tutorialSlug: "delegatecall-and-proxies",
    abi: delegateDemoAbi as Abi,
    bytecode: delegateDemoBytecode as Hex,
    constructorHints: { logic_: "Address of a deployed DelegateLogic — deploy that contract first, then paste its address here." },
    tryFirst: ["setNumberViaDelegate", "number (changed here)", "setNumberViaCall — then check the logic contract instead"],
  },
  {
    slug: "assembly-lab",
    name: "AssemblyLab",
    lesson: 6,
    tagline: "SLOAD, EXTCODESIZE, CHAINID, TSTORE — hands on",
    description:
      "Inline-assembly probes into the EVM: read any storage slot (nothing is private), measure a real SLOAD's gas, and prove transient storage clears between transactions.",
    tutorialSlug: "inline-assembly-and-opcodes",
    abi: assemblyLabAbi as Abi,
    bytecode: assemblyLabBytecode as Hex,
    tryFirst: ["readSlot 0 (the 'private' 42)", "codeSizeOf your own address vs the contract's", "transientRoundTrip then readTransient"],
  },
];

export function getContract(slug: string): ContractMeta | undefined {
  return CONTRACTS.find((c) => c.slug === slug);
}
