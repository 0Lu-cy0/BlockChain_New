# Testing Guide - Comprehensive Drug Registry System

## Pre-Test Setup ✅

### 1. Start Hardhat Node
```bash
cd contract
npx hardhat node
```
**Keep this terminal running!** You'll see 20 test accounts.

### 2. Start React Frontend
```bash
cd client
npm start
```
Frontend will be available at: **http://localhost:3000**

### 3. Configure MetaMask

#### Add Local Network:
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

#### Import Test Account:
Use **Account #1** from Hardhat node output:
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Why Account #1?** Account #0 is flagged by MetaMask as malicious. Account #1 is safe.

---

## Test Case 1: Basic Drug Registration ✅

### Objective:
Register a drug with **all fields** populated.

### Input Data:
```
📋 Thông tin cơ bản:
✓ Tên Thuốc: Paracetamol
✓ Mã Thuốc: PARA001
✓ Số Đăng Ký: VD-12345-17
✓ Số Lô: LOT2024001

💊 Thành phần & Quy cách:
  Hoạt Chất: Paracetamol
  Hàm Lượng: 500mg
  Dạng Bào Chế: Viên nén
  Quy Cách Đóng Gói: Hộp 10 vỉ x 10 viên
  Số Lượng: 10000

🏭 Nguồn gốc:
✓ Tên Nhà Sản Xuất: Công ty Dược phẩm ABC
  Tên Nhà Phân Phối: Công ty Phân phối XYZ
  Xuất Xứ: Việt Nam

📅 Thời gian:
✓ Ngày Sản Xuất: 2024-01-15
✓ Hạn Sử Dụng: 2027-01-15
```

**Note:** Fields marked with ✓ are **required**.

### Expected Result:
- ✅ MetaMask prompts for transaction approval
- ✅ Transaction succeeds
- ✅ Success toast: "Đăng ký thuốc thành công!"
- ✅ Form resets to empty

### Verify:
1. Go to **"Tra Cứu"** tab
2. Enter: `PARA001`
3. Check all fields are displayed correctly
4. Go to **"Thuốc Của Tôi"** tab
5. See the drug card with all information

---

## Test Case 2: Minimal Drug Registration ✅

### Objective:
Register a drug with **only required fields**.

### Input Data:
```
📋 Thông tin cơ bản:
✓ Tên Thuốc: Aspirin
✓ Mã Thuốc: ASPI001
✓ Số Đăng Ký: VD-54321-18
✓ Số Lô: LOT2024002

💊 Thành phần & Quy cách:
  (Leave all blank)

🏭 Nguồn gốc:
✓ Tên Nhà Sản Xuất: Công ty Dược phẩm XYZ
  (Leave optional fields blank)

📅 Thời gian:
✓ Ngày Sản Xuất: 2024-02-01
✓ Hạn Sử Dụng: 2027-02-01
```

### Expected Result:
- ✅ Registration succeeds
- ✅ Optional fields show "N/A" or are hidden

---

## Test Case 3: Uniqueness - Duplicate Drug ID ❌

### Objective:
Verify **drugId** uniqueness constraint.

### Steps:
1. Try to register another drug with drugId: `PARA001` (already used in Test Case 1)
2. Use different registrationNumber and batchNumber

### Expected Result:
- ❌ Transaction reverts
- ❌ Error message: **"Ma thuoc da ton tai"**

---

## Test Case 4: Uniqueness - Duplicate Registration Number ❌

### Objective:
Verify **registrationNumber** uniqueness constraint.

### Steps:
1. Try to register a drug with:
   - New drugId: `PARA002`
   - Same registrationNumber: `VD-12345-17` (already used)
   - New batchNumber: `LOT2024003`

### Expected Result:
- ❌ Transaction reverts
- ❌ Error message: **"So dang ky da ton tai"**

---

## Test Case 5: Uniqueness - Duplicate Batch Number (Same Manufacturer) ❌

### Objective:
Verify **manufacturer + batchNumber** uniqueness constraint.

### Steps:
1. Try to register a drug with:
   - New drugId: `PARA003`
   - New registrationNumber: `VD-11111-19`
   - Same batchNumber: `LOT2024001` (already used by this manufacturer)

### Expected Result:
- ❌ Transaction reverts
- ❌ Error message: **"So lo nay da duoc dang ky boi nha san xuat"**

---

## Test Case 6: Uniqueness - Same Batch Number (Different Manufacturer) ✅

### Objective:
Verify batch numbers **can be reused** by different manufacturers.

### Steps:
1. **Switch to a different MetaMask account** (Account #2)
   ```
   Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   ```
2. Register a drug with:
   - New drugId: `IBUPROFEN001`
   - New registrationNumber: `VD-99999-20`
   - Same batchNumber: `LOT2024001` ⚡ (reused, but different manufacturer)

### Expected Result:
- ✅ Registration succeeds
- ✅ Batch number is unique **per manufacturer**, not globally

---

## Test Case 7: Validation - Invalid Dates ❌

### Objective:
Test date validation logic.

### Test 7A: Manufacture Date >= Expiry Date
```
Ngày Sản Xuất: 2024-12-01
Hạn Sử Dụng: 2024-11-01
```
**Expected:** ❌ "Ngày sản xuất phải trước hạn sử dụng!"

### Test 7B: Future Manufacture Date
```
Ngày Sản Xuất: 2026-01-01
Hạn Sử Dụng: 2027-01-01
```
**Expected:** ❌ "Ngày sản xuất không thể trong tương lai!"

### Test 7C: Manufacture Date = Expiry Date
```
Ngày Sản Xuất: 2024-06-01
Hạn Sử Dụng: 2024-06-01
```
**Expected:** ❌ "Ngày sản xuất phải trước hạn sử dụng!"

---

## Test Case 8: Validation - Quantity ❌

### Objective:
Test quantity validation.

### Test 8A: Zero Quantity
```
Số Lượng: 0
```
**Expected:** ❌ Client-side validation: "Số lượng phải lớn hơn 0!"

### Test 8B: Negative Quantity
```
Số Lượng: -100
```
**Expected:** ❌ HTML5 validation (input type="number" with min="1")

---

## Test Case 9: Expired Drug Warning ⚠️

### Objective:
Verify expired drug detection.

### Steps:
1. Register a drug with:
   ```
   Ngày Sản Xuất: 2020-01-01
   Hạn Sử Dụng: 2023-01-01
   ```
2. Query the drug in **"Tra Cứu"** tab

### Expected Result:
- ⚠️ Warning box appears: **"CẢNH BÁO: Thuốc này đã hết hạn sử dụng"**
- ⚠️ Status shows: "⚠️ Đã hết hạn"
- ⚠️ In **"Thuốc Của Tôi"**, card shows "⚠️ EXPIRED" badge

---

## Test Case 10: Display - All Fields Populated ✅

### Objective:
Verify all fields display correctly.

### Steps:
1. Register PARA001 with all fields (Test Case 1)
2. Go to **"Tra Cứu"** → Enter `PARA001`

### Expected Display Sections:

#### 📋 Thông tin cơ bản:
- Tên thuốc: Paracetamol
- Mã thuốc: PARA001
- Số đăng ký: VD-12345-17
- Số lô: LOT2024001

#### 💊 Thành phần & Quy cách:
- Hoạt chất: Paracetamol
- Hàm lượng: 500mg
- Dạng bào chế: Viên nén
- Quy cách đóng gói: Hộp 10 vỉ x 10 viên
- Số lượng (đơn vị): 10,000

#### 🏭 Nguồn gốc:
- Tên nhà sản xuất: Công ty Dược phẩm ABC
- Địa chỉ ví nhà sản xuất: 0x7099...79C8
- Nhà phân phối: Công ty Phân phối XYZ
- Xuất xứ: Việt Nam

#### 📅 Thời gian:
- Ngày sản xuất: 15/01/2024
- Hạn sử dụng: 15/01/2027
- Ngày đăng ký blockchain: [current date]
- Trạng thái: ✅ Còn hạn sử dụng

---

## Test Case 11: Display - Minimal Fields ✅

### Objective:
Verify optional fields hide when empty.

### Steps:
1. Register ASPI001 with minimal data (Test Case 2)
2. Go to **"Tra Cứu"** → Enter `ASPI001`

### Expected Result:
- ✅ Required fields display correctly
- ✅ Section **"💊 Thành phần & Quy cách"** is hidden (all fields empty)
- ✅ Optional fields in other sections show "N/A" or are hidden

---

## Test Case 12: Multi-Manufacturer Scenario ✅

### Objective:
Test system with multiple manufacturers.

### Steps:
1. **Account #1** registers 3 drugs (PARA001, ASPI001, IBUP001)
2. **Switch to Account #2**, register 2 drugs (DRUG_B001, DRUG_B002)
3. **Switch to Account #3**, register 1 drug (DRUG_C001)

### Verification:
1. Switch back to **Account #1** → **"Thuốc Của Tôi"** shows only 3 drugs
2. Switch to **Account #2** → **"Thuốc Của Tôi"** shows only 2 drugs
3. Switch to **Account #3** → **"Thuốc Của Tôi"** shows only 1 drug
4. Each can query **ALL drugs** in **"Tra Cứu"** (public read)

---

## Test Case 13: UI/UX - Form Reset ✅

### Objective:
Verify form resets after successful registration.

### Steps:
1. Fill out the registration form completely
2. Submit and wait for transaction to complete

### Expected Result:
- ✅ Success toast appears
- ✅ All form fields reset to empty
- ✅ User can immediately register another drug

---

## Test Case 14: UI/UX - Loading States ✅

### Objective:
Verify loading indicators work correctly.

### Verification Points:
1. **Registration:**
   - Button shows "Đang xử lý..." during transaction
   - Form fields are disabled during submission
   
2. **Tra Cứu:**
   - Button shows "Đang tra cứu..." while fetching
   - Input is disabled during query

3. **Thuốc Của Tôi:**
   - Spinner and "Đang tải danh sách thuốc từ blockchain..." appears
   - Refresh button shows "🔄 Đang tải..." during reload

---

## Test Case 15: Edge Cases 🔬

### Test 15A: Drug Not Found
- Query: `NOTEXIST999`
- Expected: ❌ "Không tìm thấy thuốc với mã này!"

### Test 15B: Empty Drug ID Query
- Query: (empty string)
- Expected: ❌ "Vui lòng nhập mã thuốc!"

### Test 15C: Special Characters in Drug ID
- DrugId: `PARA-001@#$`
- Expected: ✅ Should work (no validation against special chars)

### Test 15D: Very Long Drug Name
- Name: (300 characters)
- Expected: ✅ Should work (no length limit on-chain, but may affect UI)

### Test 15E: Unicode Characters
- Name: `Paracetamol Việt Nam 中文`
- Expected: ✅ Should work (strings support Unicode)

---

## Success Criteria ✅

All test cases should pass with these outcomes:

| Test Case | Expected | Status |
|-----------|----------|--------|
| 1. Basic Registration | ✅ Success | [ ] |
| 2. Minimal Registration | ✅ Success | [ ] |
| 3. Duplicate Drug ID | ❌ Reverts | [ ] |
| 4. Duplicate Registration Number | ❌ Reverts | [ ] |
| 5. Duplicate Batch (Same Mfr) | ❌ Reverts | [ ] |
| 6. Duplicate Batch (Diff Mfr) | ✅ Success | [ ] |
| 7. Invalid Dates | ❌ Client error | [ ] |
| 8. Invalid Quantity | ❌ Client error | [ ] |
| 9. Expired Drug Warning | ⚠️ Warning shown | [ ] |
| 10. All Fields Display | ✅ Correct | [ ] |
| 11. Minimal Fields Display | ✅ Correct | [ ] |
| 12. Multi-Manufacturer | ✅ Isolated | [ ] |
| 13. Form Reset | ✅ Resets | [ ] |
| 14. Loading States | ✅ Shows | [ ] |
| 15. Edge Cases | ✅ Handled | [ ] |

---

## Troubleshooting 🔧

### MetaMask shows "Internal JSON-RPC error"
- **Cause:** Contract address mismatch or Hardhat node restarted
- **Fix:** Restart Hardhat node, redeploy contract, update contract address

### "Drug not found" for drug I just registered
- **Cause:** Wrong account, or transaction not mined
- **Fix:** Check MetaMask account, wait a few seconds, refresh

### Form submission does nothing
- **Cause:** MetaMask not connected
- **Fix:** Click "Connect Wallet" button, approve in MetaMask

### "Nonce too high" error
- **Cause:** Hardhat node restarted but MetaMask cache not cleared
- **Fix:** MetaMask → Settings → Advanced → Clear activity tab data

### Compilation errors
- **Cause:** Node.js version mismatch
- **Fix:** Use Node.js v18 or v20 (Hardhat doesn't fully support v22)

---

## Contract Address Reference 📝

**Current Deployment:**
```
0x71C95911E9a5D330f4D621842EC243EE1343292e
```

**Previous (OLD - DO NOT USE):**
```
0x8464135c8F25Da09e49BC8782676a84730C318bC
```

If contract is redeployed, update `client/src/utils/constants.js`.

---

**Good luck testing! 🚀**
