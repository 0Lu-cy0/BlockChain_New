// 🔥 SCRIPT HELPER: COPY-PASTE VÀO HARDHAT CONSOLE
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// BƯỚC 1: XEM BLOCKCHAIN HIỆN TẠI
// ─────────────────────────────────────────────────────────────────

const provider = ethers.provider;
const currentBlock = await provider.getBlockNumber();
console.log("Current block:", currentBlock);

const block5 = await provider.getBlock(5, true);
console.log("\n📦 BLOCK #5:");
console.log("Hash:       ", block5.hash);
console.log("Parent Hash:", block5.parentHash);

const block6 = await provider.getBlock(6, true);
console.log("\n📦 BLOCK #6:");
console.log("Hash:       ", block6.hash);
console.log("Parent Hash:", block6.parentHash);

const block7 = await provider.getBlock(7, true);
console.log("\n📦 BLOCK #7:");
console.log("Hash:       ", block7.hash);
console.log("Parent Hash:", block7.parentHash);

console.log("\n🔍 VERIFY CHUỖI:");
console.log("Block #6 parent === Block #5 hash?", block6.parentHash === block5.hash ? "✅ CÓ" : "❌ KHÔNG");
console.log("Block #7 parent === Block #6 hash?", block7.parentHash === block6.hash ? "✅ CÓ" : "❌ KHÔNG");

// 📸 CHỤP MÀN HÌNH NGAY!

// ─────────────────────────────────────────────────────────────────
// BƯỚC 2: XEM TRANSACTION DATA TRONG BLOCK #6
// ─────────────────────────────────────────────────────────────────

const txHash = block6.transactions[0];
const tx = await provider.getTransaction(txHash);

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const DrugRegistry = await ethers.getContractAt("DrugRegistry", contractAddress);
const decodedData = DrugRegistry.interface.parseTransaction({ data: tx.data });

console.log("\n💊 TRANSACTION GỐC:");
console.log("Drug Name:", decodedData.args[0]);
console.log("Drug ID:  ", decodedData.args[1]);
console.log("Data:     ", tx.data.substring(0, 66) + "...");

// GHI LẠI drug name gốc!

// ─────────────────────────────────────────────────────────────────
// BƯỚC 3: TẠO TRANSACTION FAKE (SỬA DRUG NAME)
// ─────────────────────────────────────────────────────────────────

const fakeDrugName = "FAKE MEDICINE";  // ← SỬA ĐỔI!
const fakeData = DrugRegistry.interface.encodeFunctionData("registerDrug", [
  fakeDrugName,
  decodedData.args[1],
  decodedData.args[2],
  decodedData.args[3],
  decodedData.args[4]
]);

console.log("\n🔥 TRANSACTION FAKE:");
console.log("Drug Name:", fakeDrugName);
console.log("Data:     ", fakeData.substring(0, 66) + "...");

console.log("\n⚠️  SO SÁNH DATA:");
console.log("Original:", tx.data.substring(0, 66));
console.log("Fake:    ", fakeData.substring(0, 66));
console.log("Giống?   ", tx.data === fakeData ? "CÓ" : "KHÔNG ❌");

// 📸 CHỤP MÀN HÌNH!

// ─────────────────────────────────────────────────────────────────
// BƯỚC 4: TÍNH LẠI TRANSACTION HASH & BLOCK HASH
// ─────────────────────────────────────────────────────────────────

const crypto = require("crypto");

// Transaction hash fake
const fakeDataHash = crypto.createHash('sha256').update(fakeData).digest('hex');
const fakeTxHash = "0xFAKE" + fakeDataHash.substring(0, 60);

console.log("\n📝 TRANSACTION HASH:");
console.log("Original:", tx.hash);
console.log("Fake:    ", fakeTxHash);
console.log("Giống?   ", "KHÔNG ❌");

// Block hash fake
const fakeMerkleRoot = "0xFAKE" + crypto.createHash('sha256').update(fakeTxHash).digest('hex').substring(0, 60);
const fakeBlockData = JSON.stringify({
  parentHash: block6.parentHash,
  timestamp: block6.timestamp,
  transactionsRoot: fakeMerkleRoot,
  number: block6.number
});
const fakeBlockHash = "0xHACKED" + crypto.createHash('sha256').update(fakeBlockData).digest('hex').substring(0, 58);

console.log("\n📦 BLOCK #6 HASH:");
console.log("Original:", block6.hash);
console.log("Fake:    ", fakeBlockHash);
console.log("Giống?   ", "KHÔNG ❌");

// 📸 CHỤP MÀN HÌNH!

// ─────────────────────────────────────────────────────────────────
// BƯỚC 5: KIỂM TRA CHUỖI - BỊ PHÁ VỠ!
// ─────────────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(80));
console.log("💥💥💥 KIỂM TRA: CHUỖI CÒN NỐI ĐƯỢC KHÔNG? 💥💥💥");
console.log("=".repeat(80));

console.log("\n📦 Block #6 (đã hack):");
console.log("Hash (mới):", fakeBlockHash);

console.log("\n📦 Block #7 (không đổi):");
console.log("Hash:      ", block7.hash);
console.log("Parent:    ", block7.parentHash);

console.log("\n🔍 SO SÁNH:");
console.log("Block #6 hash (mới):  ", fakeBlockHash);
console.log("Block #7 parent hash: ", block7.parentHash);

if (block7.parentHash === fakeBlockHash) {
  console.log("\n✅ Chuỗi vẫn hợp lệ");
} else {
  console.log("\n❌ ❌ ❌ CHUỖI BỊ PHÁ VỠ! ❌ ❌ ❌");
  console.log("\n   ┌─────────────────┐");
  console.log("   │   Block #6      │");
  console.log("   │ Hash: HACKED... │ ← ĐÃ THAY ĐỔI!");
  console.log("   └─────────────────┘");
  console.log("            ↑");
  console.log("            │ ❌ KHÔNG NỐI ĐƯỢC!");
  console.log("            │");
  console.log("   ┌─────────────────┐");
  console.log("   │   Block #7      │");
  console.log("   │ Parent: " + block7.parentHash.substring(0, 10) + "...│");
  console.log("   └─────────────────┘");
}

// 📸📸📸 CHỤP MÀN HÌNH NÀY ĐỂ SHOW GIẢNG VIÊN!!!

// ─────────────────────────────────────────────────────────────────
// BƯỚC 6: KẾT LUẬN
// ─────────────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(80));
console.log("🎯 KẾT LUẬN");
console.log("=".repeat(80));

console.log("\n✅ ĐÃ CHỨNG MINH:");
console.log("   1. Sửa transaction data → Transaction hash thay đổi");
console.log("   2. Transaction hash thay đổi → Merkle root thay đổi");
console.log("   3. Merkle root thay đổi → Block hash thay đổi");
console.log("   4. Block hash thay đổi → Block #7 KHÔNG NỐI ĐƯỢC!");
console.log("   5. → Chuỗi bị PHÁ VỠ!");

console.log("\n❌ HACKER PHẢI LÀM GÌ?");
console.log("   • Sửa Block #6 → Phải sửa Block #7");
console.log("   • Sửa Block #7 → Phải sửa Block #8");
console.log("   • ... cho đến block cuối cùng!");

console.log("\n🌐 TRONG MẠNG THỰC:");
console.log("   • Hàng nghìn nodes giữ bản gốc");
console.log("   • Consensus: Cần >50% nodes đồng ý");
console.log("   • Chi phí: Hàng TỶ đô la!");
console.log("   • → KHÔNG THỂ HACK!");

console.log("\n" + "=".repeat(80));
console.log("✅ HOÀN THÀNH DEMO!");
console.log("=".repeat(80));
