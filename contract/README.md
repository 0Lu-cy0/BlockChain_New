# Smart Contract - Lock (Hardhat)

Thư mục này chứa smart contract **Lock.sol** và toàn bộ cấu hình Hardhat để phát triển, kiểm thử và triển khai hợp đồng thông minh trên Ethereum.

## 📋 Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
- [Cài Đặt](#cài-đặt)
- [Smart Contract Lock.sol](#smart-contract-locksol)
- [Các Lệnh Hardhat](#các-lệnh-hardhat)
- [Unit Testing](#unit-testing)
- [Deployment](#deployment)
- [Cập Nhật Client](#cập-nhật-client)

## 🎯 Giới Thiệu

Smart contract **Lock** là một hợp đồng khóa tiền (time-locked wallet) đơn giản với các tính năng:
- Nhận ETH khi deploy (qua constructor)
- Cho phép nạp thêm ETH (deposit function)
- Chỉ owner mới có thể rút tiền sau thời gian unlock

## 📁 Cấu Trúc Thư Mục

```
contract/
├── contracts/                 # Mã nguồn Solidity
│   └── Lock.sol              # Smart contract chính
├── test/                      # Unit tests
│   └── Lock.ts               # 9 test cases
├── ignition/                  # Deployment configuration
│   ├── modules/
│   │   └── Lock.ts           # Deployment module
│   ├── parameters.json        # Deploy parameters (unlockTime, amount)
│   └── deployments/           # Deploy history
│       └── chain-31337/       # Local network deployments
│           ├── deployed_addresses.json
│           └── artifacts/
├── artifacts/                 # Compiled contracts
│   └── contracts/
│       └── Lock.sol/
│           └── Lock.json     # ABI và bytecode
├── cache/                     # Hardhat cache
├── typechain-types/           # TypeScript types (auto-generated)
├── hardhat.config.ts          # Hardhat configuration
├── tsconfig.json              # TypeScript config
└── package.json
```

## 🔧 Cài Đặt

### 1. Cài Dependencies

```bash
npm install
```

**Dependencies chính:**
- `hardhat`: Framework Ethereum development
- `@nomicfoundation/hardhat-toolbox`: Tổng hợp các plugin
- `ethers`: Library tương tác với Ethereum
- `chai`: Testing assertion library

### 2. Kiểm Tra Cài Đặt

```bash
npx hardhat --version
```

## 📜 Smart Contract Lock.sol

### Tổng Quan

```solidity
contract Lock {
    uint public unlockTime;           // Thời gian mở khóa (Unix timestamp)
    address payable public owner;     // Chủ sở hữu contract

    event Withdrawal(uint amount, uint when);
    event Deposit(address indexed from, uint amount, uint when);

    constructor(uint _unlockTime) payable { ... }
    function deposit() public payable { ... }
    function withdraw() public { ... }
}
```

### Constructor

```solidity
constructor(uint _unlockTime) payable
```

- **Input**: `_unlockTime` - Unix timestamp cho thời gian mở khóa
- **Payable**: Có thể gửi ETH khi deploy
- **Validation**: `unlockTime` phải ở tương lai

**Ví dụ**: Deploy với unlock time = 1 năm sau và gửi 5 ETH

### Deposit Function

```solidity
function deposit() public payable
```

- Cho phép bất kỳ ai nạp ETH vào contract
- Phát event `Deposit` với thông tin người gửi, số tiền, thời gian
- **Validation**: Số tiền phải > 0

### Withdraw Function

```solidity
function withdraw() public
```

- Chỉ **owner** mới có quyền gọi
- Chỉ rút được **sau unlock time**
- Rút **toàn bộ** số dư của contract
- Phát event `Withdrawal`

**Validations:**
1. `require(block.timestamp >= unlockTime, "You can't withdraw yet")`
2. `require(msg.sender == owner, "You aren't the owner")`

## 🛠️ Các Lệnh Hardhat

### Biên Dịch Contract

```bash
npx hardhat compile
```

**Kết quả:**
- Tạo file `artifacts/contracts/Lock.sol/Lock.json` (chứa ABI và bytecode)
- Tạo TypeScript types trong `typechain-types/`

### Chạy Unit Tests

```bash
# Chạy tất cả tests
npx hardhat test

# Chạy test cụ thể
npx hardhat test test/Lock.ts

# Xem gas report
REPORT_GAS=true npx hardhat test
```

### Kiểm Tra Test Coverage

```bash
npx hardhat coverage
```

**Kết quả hiện tại:**
- Statements: 71.43%
- Branches: 75%
- Functions: 66.67%
- Lines: 77.78%

> 💡 **Lưu ý**: Coverage không đạt 100% vì chưa có test cho `deposit()` function. Có thể thêm test để đạt 100%.

### Clean Cache và Artifacts

```bash
npx hardhat clean
```

## ✅ Unit Testing

### Test Structure (9 Test Cases)

File: `test/Lock.ts`

**1. Deployment Tests (4 tests)**
- ✅ Should set the right unlockTime
- ✅ Should set the right owner
- ✅ Should receive and store the funds to lock
- ✅ Should fail if the unlockTime is not in the future

**2. Withdrawals - Validations (3 tests)**
- ✅ Should revert if called too soon
- ✅ Should revert if called from another account
- ✅ Shouldn't fail if unlockTime arrived and owner calls it

**3. Withdrawals - Events (1 test)**
- ✅ Should emit an event on withdrawals

**4. Withdrawals - Transfers (1 test)**
- ✅ Should transfer the funds to the owner

### Test Fixtures

Sử dụng `loadFixture` để tạo snapshot của blockchain state:

```typescript
async function deployOneYearLockFixture() {
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const lockedAmount = 1_000_000_000; // 1 GWEI
  const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
  
  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  
  return { lock, unlockTime, lockedAmount, owner, otherAccount };
}
```

### Test Utilities

- `time.latest()`: Lấy timestamp hiện tại
- `time.increaseTo(timestamp)`: Tăng thời gian blockchain
- `expect(...).to.be.revertedWith(message)`: Kiểm tra revert với message cụ thể
- `expect(...).to.emit(contract, eventName)`: Kiểm tra event emission
- `expect(...).to.changeEtherBalances([...], [...])`: Kiểm tra thay đổi balance

## 🚀 Deployment

### 1. Cấu Hình Parameters

Edit `ignition/parameters.json`:

```json
{
  "LockModule": {
    "unlockTime": "1718646300",           // Unix timestamp
    "lockedAmount": "5000000000000000000n" // 5 ETH (in Wei + BigInt)
  }
}
```

**Tính toán unlockTime:**
```javascript
// 1 năm sau
Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)

// Hoặc ngày cụ thể
new Date('2025-12-31').getTime() / 1000
```

### 2. Khởi Động Hardhat Node (Terminal 1)

```bash
npx hardhat node
```

**Output:**
- Started HTTP and WebSocket JSON-RPC server at `http://127.0.0.1:8545`
- 20 accounts với mỗi account có 10,000 ETH
- Hiển thị Private Keys để import vào MetaMask

### 3. Deploy Contract (Terminal 2)

```bash
# Deploy với parameters từ file
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost --parameters ./ignition/parameters.json

# Hoặc deploy không dùng parameters file (dùng default)
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```

**Kết quả:**
- Contract được deploy tại địa chỉ (ví dụ): `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Địa chỉ được lưu trong `ignition/deployments/chain-31337/deployed_addresses.json`

### 4. Verify Deployment

```bash
# Kiểm tra deployed address
cat ignition/deployments/chain-31337/deployed_addresses.json
```

## 🔄 Cập Nhật Client

Sau khi deploy, cần cập nhật 2 thứ cho React client:

### 1. Copy ABI

**Từ:** `artifacts/contracts/Lock.sol/Lock.json`  
**Đến:** `../client/src/utils/Lock_ABI.json`

```bash
# Chỉ copy phần "abi" array
jq '.abi' artifacts/contracts/Lock.sol/Lock.json > ../client/src/utils/Lock_ABI.json
```

Hoặc copy thủ công phần `"abi": [...]` từ Lock.json

### 2. Cập Nhật Contract Address

**File:** `../client/src/utils/constants.js`

```javascript
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

Thay địa chỉ bằng địa chỉ từ `deployed_addresses.json`

> ✅ **Đã hoàn thành tự động**: Địa chỉ contract đã được cập nhật trong dự án này!

## 🔍 Tương Tác Với Contract (Console)

```bash
npx hardhat console --network localhost
```

```javascript
// Lấy contract instance
const Lock = await ethers.getContractFactory("Lock");
const lock = await Lock.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Đọc dữ liệu
await lock.unlockTime();
await lock.owner();
await ethers.provider.getBalance(lock.target);

// Gọi deposit
const [signer] = await ethers.getSigners();
await lock.deposit({ value: ethers.parseEther("1.0") });

// Gọi withdraw (phải là owner và sau unlockTime)
await lock.withdraw();
```

## 📊 Network Configuration

File: `hardhat.config.ts`

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  // Thêm networks nếu muốn deploy lên testnet
  // networks: {
  //   sepolia: {
  //     url: process.env.SEPOLIA_URL,
  //     accounts: [process.env.PRIVATE_KEY]
  //   }
  // }
};
```

## 🐛 Debug & Troubleshooting

### Error: "Nothing to compile"
- Contract đã được compile rồi
- Chạy `npx hardhat clean` và compile lại nếu cần

### Error: "HH108: Cannot connect to the network"
- Đảm bảo Hardhat node đang chạy (`npx hardhat node`)
- Kiểm tra port 8545 không bị chiếm

### Error: "Invalid unlockTime"
- UnlockTime phải ở tương lai
- Cập nhật lại timestamp trong `parameters.json`

### Tests Failing
- Chạy `npx hardhat clean` rồi compile lại
- Đảm bảo không có contract cũ đang chạy

## 📚 Tham Khảo

- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started)
- [Hardhat Network Helpers](https://hardhat.org/hardhat-network-helpers/docs/overview)
- [Chai Matchers for Ethereum](https://hardhat.org/hardhat-chai-matchers/docs/overview)

## 🎓 Học Tiếp

- [ ] Thêm test cases cho `deposit()` function
- [ ] Deploy lên Sepolia testnet
- [ ] Thêm chức năng partial withdraw
- [ ] Implement access control với OpenZeppelin
- [ ] Thêm upgrade patterns với proxy contracts

