import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import DrugRegistryABI from "./DrugRegistry_ABI.json";

let provider = null;
let contract = null;

// Initialize provider only (don't require wallet)
export const initializeProvider = () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider initialized");
  } else {
    throw new Error("Please install MetaMask!");
  }
};

// Initialize contract (after user connects wallet)
export const initializeContract = async () => {
  if (!provider) {
    throw new Error("Provider not initialized");
  }

  const signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, DrugRegistryABI, signer);
  console.log("Contract initialized");
};

// Request user to connect wallet
export const requestAccount = async () => {
  if (!provider) {
    initializeProvider();
  }

  const accounts = await provider.send("eth_requestAccounts", []);
  await initializeContract();
  return accounts[0];
};

// Get total drugs registered
export const getTotalDrugs = async () => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const total = await contract.totalDrugs();
  return total.toString();
};

// Register a new drug
export const registerDrug = async (drugData) => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const {
    name,
    drugId,
    registrationNumber,
    batchNumber,
    activeIngredient,
    concentration,
    dosageForm,
    packaging,
    quantity,
    manufacturerName,
    distributorName,
    originCountry,
    manufactureDate,
    expiryDate
  } = drugData;

  // Convert dates to Unix timestamp
  const manufactureTimestamp = Math.floor(new Date(manufactureDate).getTime() / 1000);
  const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);

  // Contract nhận 14 tham số
  const tx = await contract.registerDrug(
    name,
    drugId,
    registrationNumber,
    batchNumber,
    activeIngredient || "",
    concentration || "",
    dosageForm || "",
    packaging || "",
    quantity ? parseInt(quantity) : 0,
    manufacturerName,
    distributorName || "",
    originCountry || "",
    manufactureTimestamp,
    expiryTimestamp
  );

  await tx.wait();
  return tx.hash;
};

// Get drug information by ID
export const getDrug = async (drugId) => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const drug = await contract.getDrug(drugId);

  // Convert struct to object with all new fields
  return {
    name: drug.name,
    drugId: drug.drugId,
    registrationNumber: drug.registrationNumber,
    batchNumber: drug.batchNumber,
    activeIngredient: drug.activeIngredient,
    concentration: drug.concentration,
    dosageForm: drug.dosageForm,
    packaging: drug.packaging,
    quantity: Number(drug.quantity),
    manufacturerName: drug.manufacturerName,
    manufacturer: drug.manufacturer,
    distributorName: drug.distributorName,
    originCountry: drug.originCountry,
    manufactureDate: Number(drug.manufactureDate),
    expiryDate: Number(drug.expiryDate),
    registeredAt: Number(drug.registeredAt),
    exists: drug.exists,
  };
};

// Check if drug exists
export const drugExists = async (drugId) => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  return await contract.drugExists(drugId);
};

// Check if drug is expired
export const isExpired = async (drugId) => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  return await contract.isExpired(drugId);
};

// Get drugs by manufacturer
export const getDrugsByManufacturer = async (manufacturerAddress) => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }
  console.log('drug' + await contract.getDrugsByManufacturer(manufacturerAddress))
  return await contract.getDrugsByManufacturer(manufacturerAddress);
};

// Get manufacturer drug count
export const getManufacturerDrugCount = async (manufacturerAddress) => {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const count = await contract.getManufacturerDrugCount(manufacturerAddress);
  return count.toString();
};
