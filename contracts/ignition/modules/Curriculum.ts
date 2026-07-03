import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/// Deploys the full curriculum to a testnet in dependency order.
/// Run: npx hardhat ignition deploy ignition/modules/Curriculum.ts --network sepolia
export default buildModule("Curriculum", (m) => {
  const deployer = m.getAccount(0);

  const counter = m.contract("Counter", [deployer]);
  const guestBook = m.contract("GuestBook");
  const tipJar = m.contract("TipJar", [deployer]);
  const create2Factory = m.contract("Create2Factory");
  const delegateLogic = m.contract("DelegateLogic");
  const delegateDemo = m.contract("DelegateDemo", [delegateLogic]);
  const assemblyLab = m.contract("AssemblyLab");

  return { counter, guestBook, tipJar, create2Factory, delegateLogic, delegateDemo, assemblyLab };
});
