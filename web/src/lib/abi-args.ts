import { isAddress } from "viem";
import type { AbiFunction, AbiParameter } from "viem";

/**
 * Parse a raw text-field value into the JS value viem expects for a given
 * Solidity type. Throws with a human-readable message on bad input.
 */
export function parseAbiValue(type: string, raw: string): unknown {
  const trimmed = raw.trim();

  if (type.endsWith("[]")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`${type}: enter a JSON array, e.g. ["a","b"]`);
    }
    if (!Array.isArray(parsed)) throw new Error(`${type}: expected a JSON array`);
    return parsed.map((item) => parseAbiValue(type.slice(0, -2), String(item)));
  }

  if (type.startsWith("uint") || type.startsWith("int")) {
    if (trimmed === "") throw new Error(`${type}: enter a whole number`);
    try {
      return BigInt(trimmed);
    } catch {
      throw new Error(`${type}: "${trimmed}" is not a whole number`);
    }
  }

  if (type === "bool") {
    if (trimmed !== "true" && trimmed !== "false") throw new Error(`bool: enter true or false`);
    return trimmed === "true";
  }

  if (type === "address") {
    if (!isAddress(trimmed)) throw new Error(`address: "${trimmed}" is not a valid address`);
    return trimmed;
  }

  if (type.startsWith("bytes")) {
    if (!/^0x[0-9a-fA-F]*$/.test(trimmed)) throw new Error(`${type}: enter 0x-prefixed hex`);
    const fixed = type.match(/^bytes(\d+)$/);
    if (fixed && trimmed.length !== 2 + Number(fixed[1]) * 2) {
      throw new Error(`${type}: needs exactly ${fixed[1]} bytes (${2 + Number(fixed[1]) * 2} hex chars incl. 0x)`);
    }
    return trimmed;
  }

  // string and anything else: pass through
  return trimmed;
}

export function parseArgs(inputs: readonly AbiParameter[], raws: string[]): unknown[] {
  return inputs.map((input, i) => parseAbiValue(input.type, raws[i] ?? ""));
}

export function placeholderFor(type: string): string {
  if (type.startsWith("uint") || type.startsWith("int")) return "0";
  if (type === "bool") return "true | false";
  if (type === "address") return "0x…";
  if (type === "bytes32") return "0x + 64 hex chars";
  if (type.startsWith("bytes")) return "0x…";
  if (type.endsWith("[]")) return '["…", "…"]';
  return "text";
}

export function isReadFunction(fn: AbiFunction): boolean {
  return fn.stateMutability === "view" || fn.stateMutability === "pure";
}

export function signatureOf(fn: AbiFunction): string {
  return `${fn.name}(${fn.inputs.map((i) => i.type).join(",")})`;
}
