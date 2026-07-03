import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, toHex, getAddress } from "viem";
import { expectRevert } from "./helpers.js";

const { viem } = await network.connect();

describe("Create2Factory", () => {
  it("predicts the address before deploying, then deploys exactly there", async () => {
    const factory = await viem.deployContract("Create2Factory");
    const [owner] = await viem.getWalletClients();
    const salt = keccak256(toHex("my-first-salt"));

    const predicted = await factory.read.predictAddress([salt, owner.account.address]);
    await factory.write.deployCounter([salt, owner.account.address]);

    const events = await factory.getEvents.CounterDeployed();
    assert.equal(getAddress(events[0].args.at!), getAddress(predicted));

    // the deployed Counter is real and owned by `owner`
    const counter = await viem.getContractAt("Counter", predicted);
    assert.equal(getAddress(await counter.read.owner()), getAddress(owner.account.address));
  });

  it("refuses to deploy the same salt twice", async () => {
    const factory = await viem.deployContract("Create2Factory");
    const [owner] = await viem.getWalletClients();
    const salt = keccak256(toHex("reused-salt"));

    await factory.write.deployCounter([salt, owner.account.address]);
    await expectRevert(
      factory.write.deployCounter([salt, owner.account.address]),
      "AlreadyDeployed",
    );
  });

  it("different salts produce different addresses", async () => {
    const factory = await viem.deployContract("Create2Factory");
    const [owner] = await viem.getWalletClients();
    const a = await factory.read.predictAddress([keccak256(toHex("a")), owner.account.address]);
    const b = await factory.read.predictAddress([keccak256(toHex("b")), owner.account.address]);
    assert.notEqual(a, b);
  });
});

describe("DelegateDemo", () => {
  async function deploy() {
    const logic = await viem.deployContract("DelegateLogic");
    const demo = await viem.deployContract("DelegateDemo", [logic.address]);
    const [caller] = await viem.getWalletClients();
    return { logic, demo, caller };
  }

  it("delegatecall writes into the CALLER's storage and preserves msg.sender", async () => {
    const { logic, demo, caller } = await deploy();

    await demo.write.setNumberViaDelegate([7n]);

    assert.equal(await demo.read.number(), 7n);
    assert.equal(getAddress(await demo.read.lastWriter()), getAddress(caller.account.address));
    // the logic contract's own storage is untouched
    assert.equal(await logic.read.number(), 0n);
  });

  it("a plain call writes into the LOGIC contract and msg.sender becomes the demo", async () => {
    const { logic, demo } = await deploy();

    await demo.write.setNumberViaCall([9n]);

    assert.equal(await logic.read.number(), 9n);
    assert.equal(getAddress(await logic.read.lastWriter()), getAddress(demo.address));
    assert.equal(await demo.read.number(), 0n);
  });
});

describe("AssemblyLab", () => {
  it("readSlot exposes 'private-looking' storage", async () => {
    const lab = await viem.deployContract("AssemblyLab");
    const slot0 = await lab.read.readSlot([0n]);
    assert.equal(BigInt(slot0), 42n);
  });

  it("extcodesize distinguishes contracts from EOAs", async () => {
    const lab = await viem.deployContract("AssemblyLab");
    const [wallet] = await viem.getWalletClients();
    assert.ok((await lab.read.codeSizeOf([lab.address])) > 0n);
    assert.equal(await lab.read.codeSizeOf([wallet.account.address]), 0n);
  });

  it("reports the chain id via the CHAINID opcode", async () => {
    const lab = await viem.deployContract("AssemblyLab");
    const publicClient = await viem.getPublicClient();
    assert.equal(await lab.read.currentChainId(), BigInt(publicClient.chain.id));
  });

  it("measures a real SLOAD cost", async () => {
    const lab = await viem.deployContract("AssemblyLab");
    const gasUsed = await lab.read.measureSloadGas();
    assert.ok(gasUsed > 0n && gasUsed < 3000n, `unexpected SLOAD cost: ${gasUsed}`);
  });

  it("transient storage round-trips within a tx and clears after it", async () => {
    const lab = await viem.deployContract("AssemblyLab");

    const { result } = await lab.simulate.transientRoundTrip([123n]);
    assert.equal(result, 123n);

    await lab.write.transientRoundTrip([123n]);
    // a LATER transaction sees zero — transient storage did not persist
    assert.equal(await lab.read.readTransient(), 0n);
  });
});
