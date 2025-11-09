#!/bin/bash

# 🔄 SCRIPT TỰ ĐỘNG: RESTART HARDHAT NODE & REDEPLOY

echo ""
echo "🔄 ══════════════════════════════════════════════════════"
echo "   RESTART HARDHAT NODE & REDEPLOY CONTRACT"
echo "══════════════════════════════════════════════════════"
echo ""

# Bước 1: Kill Hardhat node cũ (nếu đang chạy)
echo "1️⃣  Stopping old Hardhat node..."
pkill -f "hardhat node" 2>/dev/null || echo "   No running node found"
sleep 2

# Bước 2: Khởi động Hardhat node trong terminal mới
echo ""
echo "2️⃣  Starting new Hardhat node in a new terminal..."
cd /mnt/d/Nam4/BlockChain/code/contract

# Mở terminal mới và chạy node
gnome-terminal -- bash -c "npx hardhat node; exec bash" &

# Lấy PID của tiến trình Hardhat node
sleep 2
NODE_PID=$(pgrep -f "hardhat node" | head -1)
echo "   Node started with PID: $NODE_PID"
echo "   Node logs are visible in the new terminal window."
sleep 5

# Bước 3: Deploy contract
echo ""
echo "3️⃣  Deploying DrugRegistry contract..."
DEPLOY_OUTPUT=$(npx hardhat ignition deploy ignition/modules/DrugRegistry.ts --network localhost 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "0x[a-fA-F0-9]\{40\}" | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo ""
  echo "❌ ERROR: Could not extract contract address!"
  echo "   Please deploy manually and update constants.js"
  exit 1
fi

echo ""
echo "✅ Contract deployed at: $CONTRACT_ADDRESS"

# Bước 4: Cập nhật constants.js
echo ""
echo "4️⃣  Updating constants.js..."

CONSTANTS_FILE="/mnt/d/Nam4/BlockChain/code/client/src/utils/constants.js"

cat > "$CONSTANTS_FILE" << EOF
// DrugRegistry Contract (auto-updated: $(date))
export const CONTRACT_ADDRESS = "$CONTRACT_ADDRESS";
EOF

echo "   ✅ Updated: $CONSTANTS_FILE"

# Bước 5: Copy ABI
echo ""
echo "5️⃣  Copying ABI to frontend..."
npm run copy-abi
echo "   ✅ ABI copied"

# Kết thúc
echo ""
echo "══════════════════════════════════════════════════════"
echo "✅ DONE! Next steps:"
echo "══════════════════════════════════════════════════════"
echo ""
echo "1. Reset MetaMask:"
echo "   → Settings → Advanced → Reset Account"
echo ""
echo "2. Refresh frontend (F5)"
echo ""
echo "3. Start registering drugs!"
echo ""
echo "📝 Contract Address: $CONTRACT_ADDRESS"
echo "📝 Node PID: $NODE_PID (use 'kill $NODE_PID' to stop)"
echo ""
echo "══════════════════════════════════════════════════════"
echo ""
