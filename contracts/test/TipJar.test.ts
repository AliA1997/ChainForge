import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther } from "viem";
import { expectRevert } from "./helpers.js";

const { viem } = await network.connect();

describe("TipJar", () => {
  async function deploy() {
    const [owner, tipper] = await viem.getWalletClients();
    const tipJar = await viem.deployContract("TipJar", [owner.account.address]);
    const publicClient = await viem.getPublicClient();
    return { tipJar, owner, tipper, publicClient };
  }

  it("accepts tips and tracks totals per tipper", async () => {
    const { tipJar, tipper } = await deploy();

    await tipJar.write.tip(["great tutorial!"], {
      value: parseEther("0.5"),
      account: tipper.account,
    });
    await tipJar.write.tip(["again"], {
      value: parseEther("0.25"),
      account: tipper.account,
    });

    assert.equal(await tipJar.read.totalTippedBy([tipper.account.address]), parseEther("0.75"));
    assert.equal(await tipJar.read.totalReceived(), parseEther("0.75"));
  });

  it("rejects zero-value tips with ZeroTip", async () => {
    const { tipJar } = await deploy();
    await expectRevert(tipJar.write.tip(["free words"], { value: 0n }), "ZeroTip");
  });

  it("counts bare ETH transfers via receive()", async () => {
    const { tipJar, tipper, publicClient } = await deploy();
    const hash = await tipper.sendTransaction({
      to: tipJar.address,
      value: parseEther("0.1"),
    });
    await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(await tipJar.read.totalTippedBy([tipper.account.address]), parseEther("0.1"));
  });

  it("only the owner can withdraw, and the jar empties", async () => {
    const { tipJar, tipper, publicClient } = await deploy();
    await tipJar.write.tip(["for you"], { value: parseEther("1"), account: tipper.account });

    await expectRevert(tipJar.write.withdraw({ account: tipper.account }), "NotOwner");

    await tipJar.write.withdraw();
    assert.equal(await publicClient.getBalance({ address: tipJar.address }), 0n);
    await expectRevert(tipJar.write.withdraw(), "NothingToWithdraw");
  });

  it("emits Tipped and Withdrawn events", async () => {
    const { tipJar, tipper } = await deploy();
    await tipJar.write.tip(["gm"], { value: parseEther("0.01"), account: tipper.account });
    await tipJar.write.withdraw();

    const tipped = await tipJar.getEvents.Tipped({}, { fromBlock: 0n });
    const withdrawn = await tipJar.getEvents.Withdrawn({}, { fromBlock: 0n });
    assert.equal(tipped.length, 1);
    assert.equal(tipped[0].args.message, "gm");
    assert.equal(withdrawn.length, 1);
    assert.equal(withdrawn[0].args.amount, parseEther("0.01"));
  });
});
