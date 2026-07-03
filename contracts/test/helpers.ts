import assert from "node:assert/strict";

/// Assert a contract call reverts with the given custom error name.
/// viem surfaces decoded custom errors in the thrown error's message chain.
export async function expectRevert(promise: Promise<unknown>, errorName: string) {
  try {
    await promise;
  } catch (error) {
    const message = error instanceof Error ? `${error.message}\n${String(error.cause ?? "")}` : String(error);
    assert.ok(
      message.includes(errorName),
      `expected revert with "${errorName}", got:\n${message.slice(0, 500)}`,
    );
    return;
  }
  assert.fail(`expected revert with "${errorName}", but the call succeeded`);
}
