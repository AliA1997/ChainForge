import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { expectRevert } from "./helpers.js";

const { viem } = await network.connect();

describe("GuestBook", () => {
  it("posts a message and reads it back", async () => {
    const guestBook = await viem.deployContract("GuestBook");
    const [wallet] = await viem.getWalletClients();

    await guestBook.write.post(["gm, chain"]);
    assert.equal(await guestBook.read.totalMessages(), 1n);

    const [message] = await guestBook.read.getMessages([0n, 10n]);
    assert.equal(message.text, "gm, chain");
    assert.equal(message.author.toLowerCase(), wallet.account.address.toLowerCase());
    assert.ok(message.timestamp > 0n);
  });

  it("rejects empty and oversized messages", async () => {
    const guestBook = await viem.deployContract("GuestBook");
    await expectRevert(guestBook.write.post([""]), "EmptyMessage");
    await expectRevert(guestBook.write.post(["x".repeat(281)]), "MessageTooLong");
  });

  it("paginates correctly at the boundaries", async () => {
    const guestBook = await viem.deployContract("GuestBook");
    for (let i = 0; i < 5; i++) {
      await guestBook.write.post([`message ${i}`]);
    }

    const middle = await guestBook.read.getMessages([1n, 2n]);
    assert.deepEqual(middle.map((m) => m.text), ["message 1", "message 2"]);

    const overflowing = await guestBook.read.getMessages([3n, 100n]);
    assert.deepEqual(overflowing.map((m) => m.text), ["message 3", "message 4"]);

    const pastEnd = await guestBook.read.getMessages([99n, 10n]);
    assert.equal(pastEnd.length, 0);
  });

  it("emits MessagePosted with the running index", async () => {
    const guestBook = await viem.deployContract("GuestBook");
    await guestBook.write.post(["first"]);
    await guestBook.write.post(["second"]);
    const events = await guestBook.getEvents.MessagePosted(
      {},
      { fromBlock: 0n },
    );
    assert.equal(events.length, 2);
    assert.equal(events[1].args.index, 1n);
  });
});
