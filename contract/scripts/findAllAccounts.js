const { ethers } = require("hardhat");

/**
 * Script để tìm TẤT CẢ accounts đã tương tác với DrugRegistry
 * và xem drugs của từng account
 */
async function findAllAccounts() {
  console.log("\n🔍 FINDING ALL ACCOUNTS...\n");

  // Contract address (update nếu cần)
  const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get contract instance
  const DrugRegistry = await ethers.getContractAt("DrugRegistry", CONTRACT_ADDRESS);

  // Lấy tổng số drugs
  const totalDrugs = await DrugRegistry.totalDrugs();
  console.log(`📊 Total drugs registered: ${totalDrugs}\n`);

  // Lấy tất cả events DrugRegistered
  const filter = DrugRegistry.filters.DrugRegistered();
  const events = await DrugRegistry.queryFilter(filter, 0, "latest");

  console.log(`📝 Found ${events.length} DrugRegistered events\n`);

  // Group drugs by manufacturer
  const drugsByManufacturer = {};

  for (const event of events) {
    const drugId = event.args.drugId;
    const name = event.args.name;
    const manufacturer = event.args.manufacturer;
    const blockNumber = event.blockNumber;
    const txHash = event.transactionHash;

    if (!drugsByManufacturer[manufacturer]) {
      drugsByManufacturer[manufacturer] = [];
    }

    drugsByManufacturer[manufacturer].push({
      drugId,
      name,
      blockNumber,
      txHash
    });
  }

  // Display results
  console.log("═".repeat(80));
  console.log("📋 DRUGS BY MANUFACTURER ADDRESS");
  console.log("═".repeat(80));

  let accountNumber = 1;
  for (const [manufacturer, drugs] of Object.entries(drugsByManufacturer)) {
    console.log(`\n👤 Account #${accountNumber}: ${manufacturer}`);
    console.log(`   Drugs registered: ${drugs.length}`);
    console.log("   ─".repeat(40));

    drugs.forEach((drug, index) => {
      console.log(`   ${index + 1}. 💊 ${drug.name}`);
      console.log(`      Drug ID: ${drug.drugId}`);
      console.log(`      Block: #${drug.blockNumber}`);
      console.log(`      Tx Hash: ${drug.txHash}`);
      console.log("");
    });

    accountNumber++;
  }

  console.log("═".repeat(80));
  console.log("\n🔍 CÁCH TÌM ACCOUNT ĐÃ ĐĂNG KÝ DRUG:");
  console.log("   1️⃣  Xem events DrugRegistered từ contract");
  console.log("   2️⃣  Mỗi event chứa manufacturer address");
  console.log("   3️⃣  Group drugs theo manufacturer");
  console.log("   4️⃣  Bạn thấy được drug nào thuộc account nào!");
  console.log("\n💡 TIP: Trên frontend, component AllDrugsAllAccounts làm chính xác việc này!");
  console.log("═".repeat(80));

  // Lấy thông tin chi tiết block #7 (block bạn đang hỏi)
  console.log("\n📦 DETAILED INFO FOR BLOCK #7:");
  console.log("─".repeat(80));

  try {
    const block = await ethers.provider.getBlock(7);

    if (block) {
      console.log(`Block Number: ${block.number}`);
      console.log(`Block Hash: ${block.hash}`);
      console.log(`Parent Hash: ${block.parentHash}`);
      console.log(`Timestamp: ${new Date(block.timestamp * 1000).toLocaleString()}`);
      console.log(`Transactions in block: ${block.transactions.length}`);
      console.log("");

      // Kiểm tra từng transaction trong block
      for (let i = 0; i < block.transactions.length; i++) {
        const txHash = block.transactions[i];
        const tx = await ethers.provider.getTransaction(txHash);
        const receipt = await ethers.provider.getTransactionReceipt(txHash);

        console.log(`   Transaction #${i + 1}:`);
        console.log(`   ├─ Hash: ${txHash}`);
        console.log(`   ├─ From: ${tx.from}`);
        console.log(`   ├─ To: ${tx.to}`);
        console.log(`   └─ Status: ${receipt.status === 1 ? "✅ Success" : "❌ Failed"}`);
        console.log("");

        // Nếu transaction gọi đến contract của chúng ta
        if (tx.to && tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
          // Decode input để xem drug nào được đăng ký
          try {
            const decodedData = DrugRegistry.interface.parseTransaction({ data: tx.data });
            if (decodedData.name === "registerDrug") {
              console.log(`   🎯 This is a registerDrug transaction!`);
              console.log(`   ├─ Drug Name: ${decodedData.args[0]}`);
              console.log(`   ├─ Drug ID: ${decodedData.args[1]}`);
              console.log(`   └─ Registered by: ${tx.from}`);
              console.log("");
            }
          } catch (e) {
            // Skip if can't decode
          }
        }
      }
    } else {
      console.log("Block #7 not found. Maybe your blockchain doesn't have 7 blocks yet?");
    }
  } catch (error) {
    console.log("Error fetching block #7:", error.message);
  }

  console.log("═".repeat(80));
}

// Run the script
findAllAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
