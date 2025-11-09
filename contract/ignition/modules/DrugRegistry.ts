import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DrugRegistryModule = buildModule("DrugRegistryModule", (m) => {
  const drugRegistry = m.contract("DrugRegistry");

  return { drugRegistry };
});

export default DrugRegistryModule;
