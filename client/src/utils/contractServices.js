import Lock_ABI from "./Lock_ABI.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";

// Module-level variables to store provider, signer, and contract
let provider;
let signer;
let contract;

// Function to initialize the provider only (without requesting accounts)
const initializeProvider = () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
  } else {
    console.error("Please install MetaMask!");
  }
};

// Function to initialize signer and contract (called after user connects)
const initializeContract = async () => {
  if (!provider) {
    initializeProvider();
  }
  if (provider && !signer) {
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Lock_ABI, signer);
  }
};

// Initialize provider only when the module is loaded
initializeProvider();

// Function to request single account
export const requestAccount = async () => {
  if (!provider) {
    throw new Error("Provider not initialized. Please install MetaMask!");
  }
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    // Initialize contract after user approves
    await initializeContract();
    return accounts[0]; // Return the first account
  } catch (error) {
    console.error("Error requesting account:", error.message);
    return null;
  }
};
// Function to get contract balance in ETH
export const getContractBalanceInETH = async () => {
  if (!provider) {
    throw new Error("Provider not initialized. Please install MetaMask!");
  }
  const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
  const balanceEth = formatEther(balanceWei); // Convert Wei to ETH string
  return balanceEth; // Convert ETH string to number
};

// Function to deposit funds to the contract
export const depositFund = async (depositValue) => {
  if (!contract) {
    // Try to initialize if not already done
    await initializeContract();
  }
  if (!contract) {
    throw new Error("Contract not initialized. Please connect your wallet first!");
  }
  const ethValue = parseEther(depositValue);
  const deposit = await contract.deposit({ value: ethValue });
  await deposit.wait();
};

// Function to withdraw funds from the contract
export const withdrawFund = async () => {
  if (!contract) {
    // Try to initialize if not already done
    await initializeContract();
  }
  if (!contract) {
    throw new Error("Contract not initialized. Please connect your wallet first!");
  }
  const withdrawTx = await contract.withdraw();
  await withdrawTx.wait();
  console.log("Withdrawal successful!");
};
