import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      // Use Account #1 instead of #0 to avoid MetaMask's "malicious address" warning
      // Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      accounts: [
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" // Account #1 private key
      ]
    },
    hardhat: {
      chainId: 31337
    }
  }
};

export default config;
