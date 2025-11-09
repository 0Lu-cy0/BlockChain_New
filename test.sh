#!/bin/bash

# Script test automation cho DApp
# Kiểm tra các điều kiện cần thiết trước khi user test thủ công

echo "🧪 DApp Testing Automation"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        print_success "$2"
        return 0
    else
        print_error "$2"
        return 1
    fi
}

echo "📋 Pre-Test Checks"
echo "------------------"
echo ""

# Check 1: Hardhat node running
print_info "Checking Hardhat node..."
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    run_test 0 "Hardhat node is running on port 8545"
else
    run_test 1 "Hardhat node is NOT running. Start with: cd contract && npx hardhat node"
fi

# Check 2: React app running
print_info "Checking React development server..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    run_test 0 "React app is running on port 3000"
else
    run_test 1 "React app is NOT running. Start with: cd client && npm start"
fi

# Check 3: Contract deployed
print_info "Checking contract deployment..."
if [ -f "contract/ignition/deployments/chain-31337/deployed_addresses.json" ]; then
    CONTRACT_ADDR=$(jq -r '.["LockModule#Lock"]' contract/ignition/deployments/chain-31337/deployed_addresses.json 2>/dev/null)
    if [ -n "$CONTRACT_ADDR" ] && [ "$CONTRACT_ADDR" != "null" ]; then
        run_test 0 "Contract deployed at: $CONTRACT_ADDR"
    else
        run_test 1 "Contract deployment file exists but address not found"
    fi
else
    run_test 1 "No deployment found. Deploy with: cd contract && npx hardhat ignition deploy ..."
fi

# Check 4: Contract address in constants.js
print_info "Checking contract address configuration..."
CLIENT_ADDR=$(grep -oP 'CONTRACT_ADDRESS = "\K[^"]+' client/src/utils/constants.js 2>/dev/null)
if [ -n "$CLIENT_ADDR" ] && [ "$CLIENT_ADDR" != "your-smart-contract-deployed-address" ]; then
    if [ "$CLIENT_ADDR" == "$CONTRACT_ADDR" ]; then
        run_test 0 "Contract address matches in client: $CLIENT_ADDR"
    else
        run_test 1 "Contract address mismatch! Client: $CLIENT_ADDR, Deployed: $CONTRACT_ADDR"
    fi
else
    run_test 1 "Contract address not configured in client/src/utils/constants.js"
fi

# Check 5: ABI file exists
print_info "Checking ABI file..."
if [ -f "client/src/utils/Lock_ABI.json" ]; then
    run_test 0 "ABI file exists"
else
    run_test 1 "ABI file not found. Copy from contract/artifacts/contracts/Lock.sol/Lock.json"
fi

echo ""
echo "🔍 Contract Information"
echo "----------------------"
echo ""

# Get contract info using hardhat console
if [ -n "$CONTRACT_ADDR" ]; then
    echo "Contract Address: $CONTRACT_ADDR"
    
    # Try to get contract info (requires hardhat node running)
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_info "Fetching contract details..."
        
        # Create temp script to get contract info
        cat > /tmp/contract_info.js << 'EOF'
const hre = require("hardhat");

async function main() {
    const contractAddress = process.env.CONTRACT_ADDR;
    const Lock = await hre.ethers.getContractFactory("Lock");
    const lock = Lock.attach(contractAddress);
    
    const unlockTime = await lock.unlockTime();
    const owner = await lock.owner();
    const balance = await hre.ethers.provider.getBalance(contractAddress);
    
    console.log(JSON.stringify({
        unlockTime: unlockTime.toString(),
        unlockDate: new Date(Number(unlockTime) * 1000).toISOString(),
        owner: owner,
        balance: hre.ethers.formatEther(balance)
    }));
}

main().catch(console.error);
EOF
        
        cd contract
        CONTRACT_INFO=$(CONTRACT_ADDR=$CONTRACT_ADDR npx hardhat run /tmp/contract_info.js --network localhost 2>/dev/null | tail -1)
        cd ..
        
        if [ -n "$CONTRACT_INFO" ]; then
            OWNER=$(echo $CONTRACT_INFO | jq -r '.owner')
            BALANCE=$(echo $CONTRACT_INFO | jq -r '.balance')
            UNLOCK_DATE=$(echo $CONTRACT_INFO | jq -r '.unlockDate')
            
            echo "Owner: $OWNER"
            echo "Balance: $BALANCE ETH"
            echo "Unlock Time: $UNLOCK_DATE"
            
            # Check if unlock time has passed
            UNLOCK_TIMESTAMP=$(echo $CONTRACT_INFO | jq -r '.unlockTime')
            CURRENT_TIMESTAMP=$(date +%s)
            
            if [ $CURRENT_TIMESTAMP -ge $UNLOCK_TIMESTAMP ]; then
                print_success "Contract is UNLOCKED - Withdraw is available"
            else
                SECONDS_LEFT=$((UNLOCK_TIMESTAMP - CURRENT_TIMESTAMP))
                DAYS_LEFT=$((SECONDS_LEFT / 86400))
                print_warning "Contract is LOCKED - Unlocks in $DAYS_LEFT days"
            fi
        fi
    fi
fi

echo ""
echo "📝 Test Accounts"
echo "----------------"
echo ""

echo "Account #0 (Owner - use this for withdraw):"
echo "  Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "Account #1 (Non-owner - use to test access control):"
echo "  Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo "  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
echo ""

echo "🎯 Manual Test Checklist"
echo "------------------------"
echo ""
echo "Open http://localhost:3000 and test:"
echo ""
echo "[ ] 1. Connect Wallet (MetaMask popup → approve)"
echo "[ ] 2. View contract balance (should match above)"
echo "[ ] 3. Deposit 0.5 ETH (confirm in MetaMask)"
echo "[ ] 4. Check balance increased by 0.5 ETH"
echo "[ ] 5. Try deposit 0 ETH (should show error)"
echo "[ ] 6. Withdraw funds (only if unlocked and owner)"
echo "[ ] 7. Switch to Account #1 in MetaMask"
echo "[ ] 8. Try withdraw (should fail: not owner)"
echo "[ ] 9. Switch back to Account #0"
echo "[ ] 10. Disconnect wallet in MetaMask"
echo ""

echo "═══════════════════════════════════════════════════"
echo ""
echo "📊 Test Results: $PASSED_TESTS/$TOTAL_TESTS checks passed"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    print_success "All automated checks passed! ✨"
    echo ""
    print_info "You can now proceed with manual testing."
    print_info "See TESTING_GUIDE.md for detailed test cases."
else
    print_error "Some checks failed. Please fix them before testing."
fi

echo ""
echo "═══════════════════════════════════════════════════"

# Cleanup
rm -f /tmp/contract_info.js
