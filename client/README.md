# Client - React Frontend cho DApp

Ứng dụng React này cung cấp giao diện người dùng để tương tác với smart contract **Lock** trên blockchain Ethereum. Người dùng có thể kết nối ví MetaMask, xem số dư contract, nạp tiền (deposit) và rút tiền (withdraw).

## 📋 Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Tính Năng](#tính-năng)
- [Chi Tiết Kỹ Thuật](#chi-tiết-kỹ-thuật)
- [Troubleshooting](#troubleshooting)

## 🎯 Giới Thiệu

Client này là một Single Page Application (SPA) được xây dựng bằng React, cho phép người dùng:
- Kết nối ví Ethereum (MetaMask)
- Xem số dư của smart contract Lock
- Nạp ETH vào contract
- Rút ETH từ contract (chỉ owner, sau unlock time)
- Nhận thông báo realtime khi transaction thành công/thất bại

## 🛠️ Công Nghệ Sử Dụng

- **React 18.3.1** - UI library
- **Ethers.js v6.13.0** - Web3 library để tương tác với blockchain
- **React-Toastify 10.0.5** - Toast notifications
- **Create React App** - Project scaffolding
- **MetaMask** - Browser wallet extension (required)

## 📁 Cấu Trúc Dự Án

```
client/
├── public/
│   ├── index.html          # HTML template
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/         # React components
│   │   ├── ConnectWalletButton.jsx    # Nút kết nối ví
│   │   ├── ContractInfo.jsx           # Hiển thị thông tin contract
│   │   └── ContractActions.jsx        # UI deposit/withdraw
│   ├── utils/              # Web3 utilities
│   │   ├── constants.js               # Contract address
│   │   ├── contractServices.js        # Ethers.js wrapper
│   │   └── Lock_ABI.json              # Contract ABI
│   ├── App.jsx             # Root component
│   ├── App.css             # Styles
│   └── index.js            # Entry point
├── package.json
└── README.md
```

## 🔧 Cài Đặt

### 1. Yêu Cầu Hệ Thống

- Node.js >= 14.x
- npm hoặc yarn
- **MetaMask Extension** (bắt buộc)

### 2. Cài Dependencies

```bash
npm install
```

**Dependencies chính:**
```json
{
  "react": "^18.3.1",
  "ethers": "^6.13.0",
  "react-toastify": "^10.0.5"
}
```

## ⚙️ Cấu Hình

### 1. Cập Nhật Contract Address

**File:** `src/utils/constants.js`

```javascript
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

✅ **Đã cấu hình sẵn** với địa chỉ từ deployment hiện tại.

> 💡 Nếu deploy lại contract, cập nhật địa chỉ từ `../contract/ignition/deployments/chain-31337/deployed_addresses.json`

### 2. Cập Nhật ABI (Nếu Contract Thay Đổi)

**File:** `src/utils/Lock_ABI.json`

Nếu bạn sửa smart contract và thêm/xóa functions:

```bash
# Compile contract trước
cd ../contract
npx hardhat compile

# Copy ABI mới
jq '.abi' artifacts/contracts/Lock.sol/Lock.json > ../client/src/utils/Lock_ABI.json
```

✅ **Đã có sẵn** ABI cho contract Lock hiện tại.

### 3. Cấu Hình MetaMask

#### 3a. Cài Đặt MetaMask
- Tải extension: https://metamask.io/download/
- Tạo hoặc import wallet

#### 3b. Thêm Mạng Hardhat Local

1. Mở MetaMask → **Settings** → **Networks** → **Add a network manually**
2. Điền thông tin:

| Field | Value |
|-------|-------|
| **Network Name** | Hardhat Local |
| **RPC URL** | `http://127.0.0.1:8545` |
| **Chain ID** | `31337` |
| **Currency Symbol** | ETH |

3. Click **Save**

#### 3c. Import Tài Khoản Test

**Lưu ý**: Chỉ làm điều này với tài khoản test, KHÔNG BAO GIỜ dùng private key thật!

1. Khởi động Hardhat node:
   ```bash
   cd ../contract
   npx hardhat node
   ```

2. Copy **Private Key** của Account #0 từ terminal output:
   ```
   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

3. MetaMask → Click avatar → **Import Account** → Paste Private Key

4. Chuyển sang mạng **Hardhat Local**

✅ **Sẵn sàng sử dụng!** Tài khoản có 10,000 ETH test.

## 🚀 Chạy Ứng Dụng

### 1. Đảm Bảo Hardhat Node Đang Chạy

Trong terminal riêng:
```bash
cd ../contract
npx hardhat node
```

Để chạy ở background:
```bash
npx hardhat node &
```

### 2. Start React Development Server

```bash
npm start
```

Ứng dụng sẽ mở tại: **http://localhost:3000**

### 3. Build Production

```bash
npm run build
```

Build output trong folder `build/`

## ✨ Tính Năng

### 1. Connect Wallet

**Component:** `ConnectWalletButton.jsx`

- Hiển thị khi chưa kết nối ví
- Click để mở MetaMask popup
- Tự động request permission và lấy account đầu tiên
- Lưu account vào state

**Code:**
```javascript
const connectWallet = async () => {
  const account = await requestAccount();
  setAccount(account);
};
```

### 2. Hiển Thị Thông Tin Contract

**Component:** `ContractInfo.jsx`

- **Contract Balance**: Số dư hiện tại của contract (đơn vị ETH)
- **Connected Account**: Địa chỉ ví đang kết nối

**Cách hoạt động:**
- Gọi `getContractBalanceInETH()` khi component mount
- Lấy balance từ blockchain bằng `provider.getBalance()`
- Format từ Wei sang ETH bằng `formatEther()`

### 3. Deposit Funds

**Component:** `ContractActions.jsx`

**Quy trình:**
1. User nhập số ETH muốn gửi (ví dụ: 0.5)
2. Click "Deposit Funds"
3. Gọi `depositFund(amount)`
4. Parse ETH → Wei bằng `parseEther()`
5. Gọi `contract.deposit({ value })`
6. Đợi transaction confirm (`await tx.wait()`)
7. Hiển thị thông báo thành công/lỗi

**Validation:**
- Contract sẽ revert nếu amount = 0
- MetaMask sẽ ước tính gas và show confirmation

### 4. Withdraw Funds

**Component:** `ContractActions.jsx`

**Quy trình:**
1. Click "Withdraw Funds"
2. Gọi `withdrawFund()`
3. Gọi `contract.withdraw()`
4. Đợi transaction confirm
5. Hiển thị thông báo

**Điều kiện:**
- ⚠️ Chỉ **owner** mới có thể withdraw
- ⚠️ Chỉ withdraw được **sau unlock time**
- ⚠️ Withdraw **toàn bộ** số dư contract

**Lỗi thường gặp:**
- "You can't withdraw yet" → Chưa đến unlock time
- "You aren't the owner" → Account hiện tại không phải owner

### 5. Account Change Listener

**Component:** `App.jsx`

- Lắng nghe event `accountsChanged` từ MetaMask
- Tự động cập nhật UI khi user đổi account
- Reset về "Connect Wallet" nếu user logout

**Code:**
```javascript
useEffect(() => {
  const handleAccountChanged = (newAccounts) =>
    setAccount(newAccounts.length > 0 ? newAccounts[0] : null);
  
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", handleAccountChanged);
  }
  
  return () => {
    window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
  };
}, []);
```

### 6. Toast Notifications

Sử dụng `react-toastify` để hiển thị:
- ✅ Success messages
- ❌ Error messages (với error reason từ contract)

## 🔍 Chi Tiết Kỹ Thuật

### contractServices.js

Module này là wrapper cho ethers.js, cung cấp các functions để tương tác với blockchain.

#### Khởi Tạo

```javascript
let provider;  // BrowserProvider từ window.ethereum
let signer;    // Signer (current user)
let contract;  // Contract instance

const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Lock_ABI, signer);
  }
};

// Auto-initialize khi module load
initialize();
```

#### Functions

**1. requestAccount()**
```javascript
export const requestAccount = async () => {
  if (!provider) {
    throw new Error("Provider not initialized. Please install MetaMask!");
  }
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
};
```

**2. getContractBalanceInETH()**
```javascript
export const getContractBalanceInETH = async () => {
  if (!provider) {
    throw new Error("Provider not initialized. Please install MetaMask!");
  }
  const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
  return formatEther(balanceWei); // Convert Wei → ETH string
};
```

**3. depositFund(depositValue)**
```javascript
export const depositFund = async (depositValue) => {
  if (!contract) {
    throw new Error("Contract not initialized. Please install MetaMask!");
  }
  const ethValue = parseEther(depositValue);
  const deposit = await contract.deposit({ value: ethValue });
  await deposit.wait(); // Đợi transaction được mine
};
```

**4. withdrawFund()**
```javascript
export const withdrawFund = async () => {
  if (!contract) {
    throw new Error("Contract not initialized. Please install MetaMask!");
  }
  const withdrawTx = await contract.withdraw();
  await withdrawTx.wait();
  console.log("Withdrawal successful!");
};
```

### App Flow

```
1. User mở app
   ↓
2. useEffect chạy → requestAccount()
   ↓
3. MetaMask popup → User approve
   ↓
4. setAccount(address) → Re-render
   ↓
5. Hiển thị ContractInfo + ContractActions
   ↓
6. User click "Deposit" với amount
   ↓
7. depositFund(amount)
   ↓
8. MetaMask confirmation
   ↓
9. Transaction sent → wait for mining
   ↓
10. Success → Toast notification
```

## 🐛 Troubleshooting

### Lỗi: "Provider not initialized"

**Nguyên nhân:** MetaMask chưa cài đặt hoặc window.ethereum không tồn tại

**Giải pháp:**
- Cài đặt MetaMask extension
- Refresh trang sau khi cài

### Lỗi: "User rejected the request"

**Nguyên nhân:** User click "Cancel" trong MetaMask popup

**Giải pháp:**
- Click lại button và approve trong MetaMask

### Lỗi: "You can't withdraw yet"

**Nguyên nhân:** Unlock time chưa đến

**Giải pháp:**
- Đợi đến unlock time
- Hoặc deploy lại contract với unlock time ngắn hơn:
  ```javascript
  // Trong ignition/parameters.json
  "unlockTime": Math.floor(Date.now() / 1000) + 60  // 1 phút sau
  ```

### Lỗi: "You aren't the owner"

**Nguyên nhân:** Account hiện tại không phải owner của contract

**Giải pháp:**
- Chuyển sang Account #0 trong MetaMask (account đã deploy contract)
- Kiểm tra owner bằng:
  ```javascript
  // Console browser
  await contract.owner()
  ```

### Transaction Pending Mãi

**Nguyên nhân:**
- Hardhat node không chạy
- Network không đúng

**Giải pháp:**
- Kiểm tra Hardhat node đang chạy: `npx hardhat node`
- Kiểm tra MetaMask đang ở network "Hardhat Local"
- Reset MetaMask account nonce: Settings → Advanced → Reset Account

### Contract Balance Không Cập Nhật

**Nguyên nhân:** React state không refresh sau transaction

**Giải pháp:**
- Refresh trang
- Hoặc thêm callback để refetch balance sau transaction:
  ```javascript
  const handleDeposit = async () => {
    await depositFund(depositValue);
    const newBalance = await getContractBalanceInETH();
    setBalance(newBalance); // Update state
  };
  ```

### Lỗi Network Mismatch

**Nguyên nhân:** Contract deploy ở chain-31337 nhưng MetaMask kết nối chain khác

**Giải pháp:**
- Chuyển MetaMask sang "Hardhat Local" network
- Hoặc deploy lại contract trên network hiện tại

## 🎨 Customization

### Thay Đổi Styles

Edit `App.css`:
```css
.app {
  /* Your styles */
}

button {
  /* Custom button styles */
}
```

### Thêm Loading State

```javascript
const [loading, setLoading] = useState(false);

const handleDeposit = async () => {
  setLoading(true);
  try {
    await depositFund(depositValue);
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={handleDeposit} disabled={loading}>
    {loading ? "Processing..." : "Deposit Funds"}
  </button>
);
```

### Hiển thị Transaction Hash

```javascript
const handleDeposit = async () => {
  const tx = await contract.deposit({ value: parseEther(depositValue) });
  toast.info(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  toast.success("Transaction confirmed!");
};
```

## 📚 Học Thêm

- [React Documentation](https://react.dev/)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Web3 React Patterns](https://www.web3react.dev/)

## 🚀 Deploy Production

### Deploy lên Vercel/Netlify

1. Build production:
   ```bash
   npm run build
   ```

2. Deploy folder `build/`

3. **Lưu ý**: 
   - Cần deploy contract lên testnet/mainnet (không dùng localhost)
   - Cập nhật `CONTRACT_ADDRESS` và network config
   - User cần kết nối MetaMask đúng network

## 🔐 Security Notes

- ⚠️ KHÔNG BAO GIỜ commit private keys vào git
- ⚠️ CONTRACT_ADDRESS trong code là public → OK
- ⚠️ Trên production, validate input từ user
- ⚠️ Handle errors gracefully, không expose sensitive info

## 📄 License

MIT - Free to use for learning and development
