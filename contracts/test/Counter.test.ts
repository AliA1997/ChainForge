import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { expectRevert } from "./helpers.js";

const { viem } = await network.connect();

describe("Counter", () => {
  async function deploy() {
    const [owner, other] = await viem.getWalletClients();
    const counter = await viem.deployContract("Counter", [owner.account.address]);
    return { counter, owner, other };
  }

  it("starts at zero and increments", async () => {
    const { counter } = await deploy();
    assert.equal(await counter.read.value(), 0n);
    await counter.write.increment();
    assert.equal(await counter.read.value(), 1n);
  });

  it("emits CounterChanged with previous and new value", async () => {
    const { counter, owner } = await deploy();
    await counter.write.increment();
    const events = await counter.getEvents.CounterChanged();
    assert.equal(events.length, 1);
    assert.equal(events[0].args.previousValue, 0n);
    assert.equal(events[0].args.newValue, 1n);
    assert.equal(events[0].args.by?.toLowerCase(), owner.account.address.toLowerCase());
  });

  it("reverts decrement below zero with CannotGoNegative", async () => {
    const { counter } = await deploy();
    await expectRevert(counter.write.decrement(), "CannotGoNegative");
  });

  it("only the owner can setValue", async () => {
    const { counter, other } = await deploy();
    await expectRevert(
      counter.write.setValue([100n], { account: other.account }),
      "NotOwner",
    );
    await counter.write.setValue([100n]);
    assert.equal(await counter.read.value(), 100n);
  });
});
