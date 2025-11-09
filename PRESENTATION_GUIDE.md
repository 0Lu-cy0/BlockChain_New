# 🎓 HƯỚNG DẪN TRÌNH BÀY DỰ ÁN VỚI GIẢNG VIÊN

## 📋 MỤC LỤC
1. [Giới thiệu dự án](#1-giới-thiệu-dự-án)
2. [Hướng dẫn khởi động hệ thống](#2-hướng-dẫn-khởi-động-hệ-thống)
3. [Demo các tính năng](#3-demo-các-tính-năng)
4. [Giải thích log và kỹ thuật](#4-giải-thích-log-và-kỹ-thuật)
5. [Chứng minh tính bất biến của blockchain](#5-chứng-minh-tính-bất-biến)

---

## 1. GIỚI THIỆU DỰ ÁN

### 📌 Tên dự án
**Drug Traceability System** - Hệ Thống Truy Xuất Nguồn Gốc Dược Phẩm

### 🎯 Mục tiêu
- Sử dụng blockchain để đảm bảo **tính minh bạch và bất biến** trong quản lý thông tin thuốc
- Ngăn chặn việc **làm giả, sửa đổi thông tin** sau khi đã đăng ký
- Cho phép **tra cứu nguồn gốc** thuốc một cách công khai

### 🛠️ Công nghệ sử dụng
- **Blockchain:** Ethereum (Hardhat local development)
- **Smart Contract:** Solidity ^0.8.24
- **Frontend:** React.js + ethers.js v6
- **Wallet:** MetaMask

### ⚡ Điểm nổi bật
✅ **KHÔNG CÓ** hàm `updateDrug()` hoặc `deleteDrug()` → Dữ liệu **KHÔNG THỂ SỬA/XÓA**  
✅ Mỗi giao dịch được **ký điện tử** bởi MetaMask → Chống giả mạo  
✅ Tự động kiểm tra hạn sử dụng của thuốc  
✅ Lưu trữ địa chỉ nhà sản xuất → Truy xuất nguồn gốc

---

## 2. HƯỚNG DẪN KHỞI ĐỘNG HỆ THỐNG

### 📦 Yêu cầu hệ thống
- Node.js v18+ (khuyến nghị v20)
- MetaMask extension
- Terminal (WSL/Git Bash trên Windows)

---

### 🚀 BƯỚC 1: Khởi động Hardhat Node

**Mở Terminal 1:**

```bash
cd contract
npx hardhat node
```

**📊 LOG SẼ HIỆN RA:**

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

[... 18 accounts khác ...]

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.
```

**🎓 GIẢI THÍCH CHO GIẢNG VIÊN:**

| Thông tin | Ý nghĩa |
|-----------|---------|
| `http://127.0.0.1:8545` | Blockchain đang chạy ở localhost port 8545 |
| `Account #0, #1, ...` | 20 tài khoản test với mỗi account có **10,000 ETH** |
| `Private Key` | Khóa riêng để ký giao dịch (CHỈ DÙNG CHO TEST) |
| `WARNING` | Cảnh báo: Đây là khóa công khai, ai cũng biết, **KHÔNG** dùng trên mainnet |

**💡 Lưu ý:**
- Hardhat node chạy **in-memory blockchain** → Khi tắt, dữ liệu bị xóa hết
- Mục đích: Phát triển và test nhanh, không cần đợi mainnet

---

### 🚀 BƯỚC 2: Deploy Smart Contract

**Mở Terminal 2 (giữ Terminal 1 chạy):**

```bash
cd contract
npm run compile
```

**📊 LOG SẼ HIỆN RA:**

```
> contract@1.0.0 compile
> hardhat compile && npm run copy-abi && npm run clean-deploy && npm run deploy

WARNING: You are currently using Node.js v22.16.0, which is not supported by Hardhat. 
This can lead to unexpected behavior. See https://hardhat.org/nodejs-versions

Compiled 1 Solidity file successfully (evm target: paris).
```

**🎓 GIẢI THÍCH:**
- `hardhat compile`: Biên dịch file `DrugRegistry.sol` thành **bytecode**
- `evm target: paris`: Sử dụng phiên bản EVM (Ethereum Virtual Machine) là Paris
- **WARNING Node.js v22**: Chỉ là cảnh báo, vẫn chạy được (khuyến nghị dùng v20)

---

```
> contract@1.0.0 copy-abi
> node -e "const fs = require('fs'); ..."

✅ ABI copied to frontend!
```

**🎓 GIẢI THÍCH:**
- **ABI** (Application Binary Interface): Giao diện để frontend gọi các function trong contract
- Copy từ `contract/artifacts/` sang `client/src/utils/DrugRegistry_ABI.json`

---

```
> contract@1.0.0 clean-deploy
> rm -rf ignition/deployments/chain-31337
```

**🎓 GIẢI THÍCH:**
- Xóa deployment cũ để deploy contract **MỚI** với địa chỉ **MỚI**
- Nếu không xóa, Hardhat Ignition sẽ tái sử dụng contract cũ

---

```
Hardhat Ignition 🚀

Deploying [ DrugRegistryModule ]

Batch #1
  Executed DrugRegistryModule#DrugRegistry

[ DrugRegistryModule ] successfully deployed 🚀

Deployed Addresses

DrugRegistryModule#DrugRegistry - 0x8464135c8F25Da09e49BC8782676a84730C318bC
```

**🎓 GIẢI THÍCH CHI TIẾT:**

| Thông tin | Ý nghĩa |
|-----------|---------|
| `Hardhat Ignition` | Công cụ deploy contract của Hardhat |
| `DrugRegistryModule` | Tên module deploy (định nghĩa trong `ignition/modules/DrugRegistry.ts`) |
| `Batch #1` | Deploy trong 1 lô (có thể có nhiều contract deploy cùng lúc) |
| `Executed DrugRegistryModule#DrugRegistry` | Đã thực thi deploy contract DrugRegistry |
| `0x8464135c...` | **ĐỊA CHỈ CONTRACT** - Quan trọng nhất! |

**🔍 Địa chỉ contract được tính như thế nào?**

```
Contract Address = keccak256(deployer_address, nonce)[12:]

Trong trường hợp này:
- deployer_address = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Account #1)
- nonce = 0 (lần đầu tiên account này gửi transaction)
→ keccak256(0x70997..., 0) = 0x8464135c8F25Da09e49BC8782676a84730C318bC
```

**💡 Tại sao dùng Account #1 thay vì #0?**
- Account #0 deploy contract ở `0x5FbDB...` → Bị MetaMask đánh dấu "Malicious Address"
- Vì quá nhiều người dùng Account #0 để test scam contracts
- Chuyển sang Account #1 để tránh cảnh báo này

---

**📋 KIỂM TRA TRONG TERMINAL 1:**

Sau khi deploy, Terminal 1 sẽ hiện:

```
eth_sendTransaction
  Contract deployment: DrugRegistry
  Contract address:    0x8464135c8f25da09e49bc8782676a84730c318bc
  Transaction:         0x7c4e89fb...
  From:                0x70997970c51812dc3a010c7d01b50e0d17dc79c8
  Value:               0 ETH
  Gas used:            834925 of 834925
  Block #1:            0x1234abcd...
```

**🎓 GIẢI THÍCH:**

| Thông tin | Ý nghĩa |
|-----------|---------|
| `eth_sendTransaction` | Gửi transaction deploy contract |
| `Contract deployment: DrugRegistry` | Đang deploy contract DrugRegistry |
| `Contract address: 0x8464...` | Địa chỉ contract sau khi deploy |
| `Transaction: 0x7c4e...` | Hash của transaction (dùng để tra cứu) |
| `From: 0x70997...` | Account #1 là người deploy (deployer) |
| `Value: 0 ETH` | Không gửi ETH (chỉ deploy code) |
| `Gas used: 834925` | **834,925 gas** đã tiêu thụ để deploy contract |
| `Block #1` | Transaction được đưa vào **block số 1** |

**💡 Tại sao Block #1 chứ không phải #0?**
- Block #0 là **Genesis Block** (khởi tạo blockchain)
- Transaction đầu tiên nằm ở Block #1

---

### 🚀 BƯỚC 3: Cấu hình MetaMask

**3.1. Thêm Hardhat Network:**

- Mở MetaMask → Settings → Networks → Add Network
- Điền thông tin:
  ```
  Network Name: Hardhat Local
  RPC URL: http://127.0.0.1:8545
  Chain ID: 31337
  Currency Symbol: ETH
  ```

**3.2. Import Account:**

- MetaMask → Import Account
- Dán Private Key của Account #1:
  ```
  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  ```
- Kết quả: Account có **10,000 ETH**

**3.3. Cập nhật địa chỉ contract trong code:**

Mở file `client/src/utils/constants.js`:

```javascript
export const CONTRACT_ADDRESS = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
```

👆 **Thay bằng địa chỉ contract vừa deploy!**

---

### 🚀 BƯỚC 4: Khởi động Frontend

**Mở Terminal 3:**

```bash
cd client
npm start
```

**📊 LOG SẼ HIỆN RA:**

```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

webpack compiled with 0 errors
```

**🎓 GIẢI THÍCH:**
- Frontend React đang chạy ở `http://localhost:3000`
- Tự động mở browser
- Hot reload: Mỗi lần sửa code sẽ tự động refresh

---

## 3. DEMO CÁC TÍNH NĂNG

### ✅ 3.1. Kết nối MetaMask

**Thao tác:**
1. Click nút **"Connect Wallet"**
2. MetaMask popup xuất hiện
3. Click **"Next"** → **"Connect"**

**📊 LOG TRONG CONSOLE (F12):**

```javascript
Provider initialized
Contract initialized
Connected account: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
```

**🎓 GIẢI THÍCH:**
- `Provider initialized`: Đã kết nối với blockchain (http://127.0.0.1:8545)
- `Contract initialized`: Đã khởi tạo contract với ABI
- `Connected account`: Địa chỉ wallet đang kết nối

---

### ✅ 3.2. Đăng ký thuốc mới

**Thao tác:**
1. Chọn tab **"📝 Đăng Ký Thuốc"**
2. Điền form:
   ```
   Tên Thuốc: Paracetamol 500mg
   Mã Thuốc: DRUG001
   Số Lô: LOT2024001
   Ngày Sản Xuất: 01/01/2024
   Hạn Sử Dụng: 01/01/2027
   ```
3. Click **"🚀 Đăng Ký Thuốc"**
4. MetaMask popup → Click **"Confirm"**

**📊 LOG TRONG TERMINAL 1 (Hardhat Node):**

```
eth_sendTransaction
  Contract call:       DrugRegistry#registerDrug
  Transaction:         0xabcd1234...
  From:                0x70997970c51812dc3a010c7d01b50e0d17dc79c8
  To:                  0x8464135c8f25da09e49bc8782676a84730c318bc
  Value:               0 ETH
  Gas used:            145678 of 300000
  Block #2:            0x9876fedc...

  console.log:
    Drug registered: DRUG001 by 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
```

**🎓 GIẢI THÍCH CHI TIẾT:**

| Thông tin | Ý nghĩa |
|-----------|---------|
| `Contract call: registerDrug` | Gọi function `registerDrug()` trong contract |
| `Transaction: 0xabcd...` | Hash của transaction (proof of registration) |
| `From: 0x70997...` | Người đăng ký (manufacturer) |
| `To: 0x8464...` | Địa chỉ contract DrugRegistry |
| `Value: 0 ETH` | Không gửi ETH, chỉ lưu data |
| `Gas used: 145678` | Tiêu thụ **145,678 gas** để lưu dữ liệu |
| `Block #2` | Dữ liệu được ghi vào **block số 2** |

**💡 Dữ liệu đã lưu vào blockchain:**

```solidity
drugs["DRUG001"] = Drug({
    name: "Paracetamol 500mg",
    drugId: "DRUG001",
    batchNumber: "LOT2024001",
    manufactureDate: 1704067200,  // Unix timestamp
    expiryDate: 1735689600,
    manufacturer: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8,
    exists: true
});
```

**🔐 Chữ ký điện tử (ECDSA Signature):**

Mỗi transaction có 3 giá trị:
- **v**: Recovery ID (27 hoặc 28)
- **r**: Signature r value (32 bytes)
- **s**: Signature s value (32 bytes)

```
signature = sign(transaction_data, private_key)
signer_address = ecrecover(transaction_data, v, r, s)
```

→ **Chỉ người có private key mới tạo được chữ ký hợp lệ!**

---

### ✅ 3.3. Tra cứu thuốc

**Thao tác:**
1. Chọn tab **"🔍 Tra Cứu"**
2. Nhập: `DRUG001`
3. Click **"🔎 Tra Cứu"**

**📊 LOG TRONG CONSOLE:**

```javascript
Calling contract.getDrug("DRUG001")...
Response: {
  name: "Paracetamol 500mg",
  drugId: "DRUG001",
  batchNumber: "LOT2024001",
  manufactureDate: 1704067200,
  expiryDate: 1735689600,
  manufacturer: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  exists: true
}
Drug is NOT expired ✅
```

**🎓 GIẢI THÍCH:**
- `getDrug()` là **view function** → Không tốn gas
- Không cần MetaMask confirm (chỉ đọc data)
- Frontend tự động kiểm tra `expiryDate` với thời gian hiện tại

---

### ✅ 3.4. Xem danh sách thuốc của tôi

**Thao tác:**
1. Chọn tab **"📦 Thuốc Của Tôi"**

**📊 LOG TRONG CONSOLE:**

```javascript
Fetching drugs for manufacturer: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
Found 1 drug(s)
Loading drug details for: DRUG001
```

**🎓 GIẢI THÍCH:**
- Gọi `getDrugsByManufacturer(address)` → Trả về array `["DRUG001"]`
- Sau đó gọi `getDrug("DRUG001")` để lấy chi tiết
- Hiển thị tất cả thuốc do account hiện tại đăng ký

---

## 4. GIẢI THÍCH LOG VÀ KỸ THUẬT

### 🔍 4.1. Gas là gì?

**Định nghĩa:**
- Gas là **phí tính toán** trên Ethereum
- 1 gas = 1 bước thực thi trong EVM

**Ví dụ phí gas:**
- `SSTORE` (lưu data): **20,000 gas**
- `ADD` (cộng 2 số): **3 gas**
- Deploy contract: **~800,000 gas**

**Trong dự án:**
- Local Hardhat: **Gas miễn phí** (test)
- Mainnet: Phải trả bằng ETH thật

---

### 🔍 4.2. Block là gì?

**Định nghĩa:**
- Block = Nhóm transactions được gộp lại
- Mỗi block có:
  - Block Number (số thứ tự)
  - Block Hash (mã định danh duy nhất)
  - Parent Hash (hash của block trước đó)
  - Timestamp
  - Transactions

**Cấu trúc blockchain:**

```
Block #0 (Genesis)
   └─ Hash: 0xaaa...
       │
Block #1
   ├─ Parent Hash: 0xaaa...
   ├─ Hash: 0xbbb...
   └─ Tx: Deploy DrugRegistry
       │
Block #2
   ├─ Parent Hash: 0xbbb...
   ├─ Hash: 0xccc...
   └─ Tx: Register DRUG001
```

---

### 🔍 4.3. Transaction Hash

**Ví dụ:**
```
0x7c4e89fb8d6f4e2a1b3c5d8e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a
```

**Công dụng:**
- **Proof of Work**: Chứng minh transaction đã được thực thi
- **Tra cứu**: Dùng block explorer để xem chi tiết
- **Bất biến**: Hash thay đổi nếu bất kỳ dữ liệu nào thay đổi

**Công thức:**
```
Transaction Hash = keccak256(nonce, gasPrice, gasLimit, to, value, data, v, r, s)
```

---

## 5. CHỨNG MINH TÍNH BẤT BIẾN

### 🎯 5.1. Chứng minh 1: Smart Contract không có update function

**Kiểm tra code `DrugRegistry.sol`:**

```solidity
// ✅ CÓ hàm này
function registerDrug(...) public { }
function getDrug(string memory _drugId) public view returns (Drug memory) { }

// ❌ KHÔNG CÓ hàm này
// function updateDrug(...) { }
// function deleteDrug(...) { }
```

**🎓 GIẢI THÍCH CHO GIẢNG VIÊN:**
- Một khi thuốc đã đăng ký → **KHÔNG THỂ SỬA/XÓA**
- Đây là sự khác biệt lớn nhất so với SQL database
- Trong SQL: `UPDATE drugs SET name = "Fake" WHERE id = 1` → Có thể sửa!
- Trong Blockchain: **KHÔNG CÓ HÀM SỬA** → Bảo đảm minh bạch!

---

### 🎯 5.2. Chứng minh 2: Chữ ký điện tử (ECDSA)

**Demo:**

1. Mở Hardhat Console:
   ```bash
   npx hardhat console --network localhost
   ```

2. Lấy thông tin transaction:
   ```javascript
   const tx = await ethers.provider.getTransaction("0xabcd1234...");
   console.log("From:", tx.from);
   console.log("Signature v:", tx.v);
   console.log("Signature r:", tx.r);
   console.log("Signature s:", tx.s);
   ```

3. Verify signature:
   ```javascript
   const recoveredAddress = ethers.recoverAddress(
     ethers.keccak256(tx.data),
     { v: tx.v, r: tx.r, s: tx.s }
   );
   console.log("Recovered address:", recoveredAddress);
   console.log("Matches tx.from?", recoveredAddress === tx.from);
   ```

**Kết quả:**
```
Recovered address: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
Matches tx.from? true ✅
```

**🎓 GIẢI THÍCH:**
- Chỉ người có **private key** mới tạo được chữ ký hợp lệ
- Ai cũng có thể **verify** chữ ký (dùng public key)
- **Không thể giả mạo** người đăng ký!

---

### 🎯 5.3. Chứng minh 3: Block Hash Linking

**Demo thay đổi dữ liệu:**

1. Lấy thông tin block:
   ```javascript
   const block2 = await ethers.provider.getBlock(2);
   console.log("Block #2 Hash:", block2.hash);
   console.log("Parent Hash:", block2.parentHash);
   
   const block3 = await ethers.provider.getBlock(3);
   console.log("Block #3 Parent Hash:", block3.parentHash);
   ```

2. Kiểm tra liên kết:
   ```javascript
   console.log("Block #3 parent matches Block #2?", 
     block3.parentHash === block2.hash); // true ✅
   ```

**🎓 GIẢI THÍCH:**
- Block #3 chứa **Parent Hash** = Hash của Block #2
- Nếu sửa dữ liệu ở Block #2 → Hash thay đổi
- Block #3 vẫn chứa **Parent Hash cũ** → **Chuỗi bị vỡ!**

**Minh họa:**

```
TRƯỚC KHI SỬA:
Block #2: Hash = 0xAAA...
   └─ Data: DRUG001

Block #3: Parent Hash = 0xAAA... ✅ MATCH!

SAU KHI SỬA BLOCK #2:
Block #2: Hash = 0xBBB... ← ĐÃ THAY ĐỔI!
   └─ Data: DRUG001_FAKE

Block #3: Parent Hash = 0xAAA... ❌ KHÔNG MATCH!
   └─ Phát hiện dữ liệu đã bị thay đổi!
```

---

## 📝 CHECKLIST TRƯỚC KHI TRÌNH BÀY

- [ ] Hardhat node đang chạy (Terminal 1)
- [ ] Contract đã deploy thành công
- [ ] MetaMask đã kết nối với Hardhat Network
- [ ] MetaMask đã import Account #1
- [ ] `constants.js` đã cập nhật đúng địa chỉ contract
- [ ] Frontend đang chạy (http://localhost:3000)
- [ ] Đã test đăng ký 1 thuốc thử
- [ ] Console (F12) không có lỗi
- [ ] Đã chuẩn bị các slide/diagram giải thích

---

## 🎤 GỢI Ý SCRIPT TRÌNH BÀY

### Phần 1: Giới thiệu (2 phút)

> "Em xin chào thầy/cô. Hôm nay em trình bày đề tài **Hệ Thống Truy Xuất Nguồn Gốc Dược Phẩm** sử dụng công nghệ Blockchain.
>
> Vấn đề em muốn giải quyết là: Làm sao để đảm bảo thông tin về thuốc **không bị sửa đổi** sau khi đã đăng ký? Trong SQL database, ai có quyền admin đều có thể sửa dữ liệu. Nhưng với Blockchain, dữ liệu là **bất biến** - một khi đã ghi vào sẽ không thể thay đổi."

### Phần 2: Demo (5 phút)

> "Em sẽ demo hệ thống. Đầu tiên, em khởi động blockchain local bằng Hardhat..."
>
> *(Chạy `npx hardhat node`, giải thích log)*
>
> "Tiếp theo, em deploy smart contract..."
>
> *(Chạy `npm run compile`, giải thích các bước)*
>
> "Bây giờ em kết nối MetaMask và đăng ký một loại thuốc..."
>
> *(Demo đăng ký DRUG001)*
>
> "Sau khi đăng ký, em có thể tra cứu lại thông tin. Nhưng em **KHÔNG THỂ SỬA** thông tin này!"

### Phần 3: Chứng minh kỹ thuật (3 phút)

> "Em sẽ chứng minh tính bất biến qua 3 điểm:
>
> 1. **Smart contract không có hàm update** - Em mở code cho thầy/cô xem
> 2. **Chữ ký điện tử ECDSA** - Chỉ người có private key mới đăng ký được
> 3. **Block hash linking** - Nếu sửa dữ liệu, chuỗi block sẽ vỡ"

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Nonce too high"

**Nguyên nhân:** MetaMask nhớ nonce cũ, nhưng blockchain đã reset

**Giải pháp:**
```
MetaMask → Settings → Advanced → Clear activity and nonce data
```

---

### ❌ Lỗi: "Contract not initialized"

**Nguyên nhân:** Chưa connect MetaMask

**Giải pháp:**
1. Click "Connect Wallet"
2. Approve trong MetaMask

---

### ❌ Lỗi: "Drug ID already registered"

**Nguyên nhân:** Đăng ký trùng mã thuốc

**Giải pháp:**
- Dùng mã thuốc khác (DRUG002, DRUG003...)

---

## 📚 TÀI LIỆU THAM KHẢO

- Ethereum Yellow Paper: https://ethereum.github.io/yellowpaper/paper.pdf
- Solidity Documentation: https://docs.soliditylang.org/
- Hardhat Documentation: https://hardhat.org/docs
- ethers.js v6: https://docs.ethers.org/v6/

---

**🎓 Chúc bạn trình bày thành công!**
