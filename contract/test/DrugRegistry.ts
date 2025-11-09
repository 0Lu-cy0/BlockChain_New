import { expect } from "chai";
import { ethers } from "hardhat";
import { DrugRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DrugRegistry", function () {
  let drugRegistry: DrugRegistry;
  let manufacturer: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  // Test data
  const DRUG_NAME = "Paracetamol 500mg";
  const DRUG_ID = "DRUG001";
  const BATCH_NUMBER = "LOT2024001";

  beforeEach(async function () {
    // Get signers
    [manufacturer, otherAccount] = await ethers.getSigners();

    // Deploy contract
    const DrugRegistryFactory = await ethers.getContractFactory("DrugRegistry");
    drugRegistry = await DrugRegistryFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should initialize with zero total drugs", async function () {
      expect(await drugRegistry.totalDrugs()).to.equal(0);
    });
  });

  describe("Register Drug", function () {
    it("Should register a new drug successfully", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400; // 1 day ago
      const expiryDate = now + 365 * 86400; // 1 year from now

      await expect(
        drugRegistry.registerDrug(
          DRUG_NAME,
          DRUG_ID,
          BATCH_NUMBER,
          manufactureDate,
          expiryDate
        )
      )
        .to.emit(drugRegistry, "DrugRegistered")
        .withArgs(DRUG_ID, DRUG_NAME, manufacturer.address, manufactureDate, expiryDate);

      expect(await drugRegistry.totalDrugs()).to.equal(1);
    });

    it("Should fail if drug name is empty", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      await expect(
        drugRegistry.registerDrug("", DRUG_ID, BATCH_NUMBER, manufactureDate, expiryDate)
      ).to.be.revertedWith("Drug name cannot be empty");
    });

    it("Should fail if drug ID is empty", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      await expect(
        drugRegistry.registerDrug(DRUG_NAME, "", BATCH_NUMBER, manufactureDate, expiryDate)
      ).to.be.revertedWith("Drug ID cannot be empty");
    });

    it("Should fail if batch number is empty", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      await expect(
        drugRegistry.registerDrug(DRUG_NAME, DRUG_ID, "", manufactureDate, expiryDate)
      ).to.be.revertedWith("Batch number cannot be empty");
    });

    it("Should fail if drug ID already exists", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      // Register first time
      await drugRegistry.registerDrug(
        DRUG_NAME,
        DRUG_ID,
        BATCH_NUMBER,
        manufactureDate,
        expiryDate
      );

      // Try to register again with same ID
      await expect(
        drugRegistry.registerDrug(
          "Another Drug",
          DRUG_ID,
          "LOT999",
          manufactureDate,
          expiryDate
        )
      ).to.be.revertedWith("Drug ID already registered");
    });

    it("Should fail if manufacture date is after expiry date", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now + 365 * 86400; // 1 year in future
      const expiryDate = now - 86400; // 1 day ago

      await expect(
        drugRegistry.registerDrug(DRUG_NAME, DRUG_ID, BATCH_NUMBER, manufactureDate, expiryDate)
      ).to.be.revertedWith("Manufacture date must be before expiry date");
    });

    it("Should fail if manufacture date is in the future", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now + 86400; // 1 day in future
      const expiryDate = now + 365 * 86400;

      await expect(
        drugRegistry.registerDrug(DRUG_NAME, DRUG_ID, BATCH_NUMBER, manufactureDate, expiryDate)
      ).to.be.revertedWith("Manufacture date cannot be in the future");
    });
  });

  describe("Get Drug", function () {
    it("Should retrieve drug information correctly", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      await drugRegistry.registerDrug(
        DRUG_NAME,
        DRUG_ID,
        BATCH_NUMBER,
        manufactureDate,
        expiryDate
      );

      const drug = await drugRegistry.getDrug(DRUG_ID);

      expect(drug.name).to.equal(DRUG_NAME);
      expect(drug.drugId).to.equal(DRUG_ID);
      expect(drug.batchNumber).to.equal(BATCH_NUMBER);
      expect(drug.manufactureDate).to.equal(manufactureDate);
      expect(drug.expiryDate).to.equal(expiryDate);
      expect(drug.manufacturer).to.equal(manufacturer.address);
      expect(drug.exists).to.be.true;
    });

    it("Should fail when getting non-existent drug", async function () {
      await expect(drugRegistry.getDrug("NONEXISTENT")).to.be.revertedWith("Drug not found");
    });
  });

  describe("Drug Expiry Check", function () {
    it("Should return false for non-expired drug", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400; // 1 year from now

      await drugRegistry.registerDrug(
        DRUG_NAME,
        DRUG_ID,
        BATCH_NUMBER,
        manufactureDate,
        expiryDate
      );

      expect(await drugRegistry.isExpired(DRUG_ID)).to.be.false;
    });

    it("Should return true for expired drug", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 365 * 86400; // 1 year ago
      const expiryDate = now - 86400; // 1 day ago (expired)

      await drugRegistry.registerDrug(
        DRUG_NAME,
        DRUG_ID,
        BATCH_NUMBER,
        manufactureDate,
        expiryDate
      );

      expect(await drugRegistry.isExpired(DRUG_ID)).to.be.true;
    });

    it("Should fail when checking expiry of non-existent drug", async function () {
      await expect(drugRegistry.isExpired("NONEXISTENT")).to.be.revertedWith("Drug not found");
    });
  });

  describe("Drug Existence Check", function () {
    it("Should return true for existing drug", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      await drugRegistry.registerDrug(
        DRUG_NAME,
        DRUG_ID,
        BATCH_NUMBER,
        manufactureDate,
        expiryDate
      );

      expect(await drugRegistry.drugExists(DRUG_ID)).to.be.true;
    });

    it("Should return false for non-existent drug", async function () {
      expect(await drugRegistry.drugExists("NONEXISTENT")).to.be.false;
    });
  });

  describe("Manufacturer Drug List", function () {
    it("Should return drugs by manufacturer", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      // Register 2 drugs from same manufacturer
      await drugRegistry.registerDrug(
        "Drug 1",
        "DRUG001",
        "LOT001",
        manufactureDate,
        expiryDate
      );
      await drugRegistry.registerDrug(
        "Drug 2",
        "DRUG002",
        "LOT002",
        manufactureDate,
        expiryDate
      );

      const drugs = await drugRegistry.getDrugsByManufacturer(manufacturer.address);
      expect(drugs.length).to.equal(2);
      expect(drugs[0]).to.equal("DRUG001");
      expect(drugs[1]).to.equal("DRUG002");
    });

    it("Should return correct drug count for manufacturer", async function () {
      const now = Math.floor(Date.now() / 1000);
      const manufactureDate = now - 86400;
      const expiryDate = now + 365 * 86400;

      await drugRegistry.registerDrug(
        DRUG_NAME,
        DRUG_ID,
        BATCH_NUMBER,
        manufactureDate,
        expiryDate
      );

      expect(await drugRegistry.getManufacturerDrugCount(manufacturer.address)).to.equal(1);
    });

    it("Should return empty array for manufacturer with no drugs", async function () {
      const drugs = await drugRegistry.getDrugsByManufacturer(otherAccount.address);
      expect(drugs.length).to.equal(0);
    });
  });
});
