#!/bin/bash

# Script để chạy DApp với các checks cơ bản

echo "🚀 Starting DApp Setup..."
echo ""

# Check if we're in the right directory
if [ ! -d "contract" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

echo "📋 Pre-flight Checks:"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if MetaMask is mentioned (we can't check browser extensions from CLI)
echo "⚠️  MetaMask: Please ensure MetaMask extension is installed in your browser"

# Check if Hardhat node is running
if check_port 8545; then
    echo "✅ Hardhat Node: Running on port 8545"
    HARDHAT_RUNNING=true
else
    echo "⚠️  Hardhat Node: Not running"
    echo "   Start it with: cd contract && npx hardhat node"
    HARDHAT_RUNNING=false
fi

# Check if React dev server is running
if check_port 3000; then
    echo "⚠️  React App: Already running on port 3000"
    echo "   You may need to stop it first"
    REACT_RUNNING=true
else
    echo "✅ Port 3000: Available for React app"
    REACT_RUNNING=false
fi

echo ""
echo "📦 Checking Dependencies:"
echo ""

# Check contract dependencies
if [ -d "contract/node_modules" ]; then
    echo "✅ Contract dependencies installed"
else
    echo "⚠️  Contract dependencies not found"
    echo "   Installing now..."
    cd contract && npm install && cd ..
fi

# Check client dependencies
if [ -d "client/node_modules" ]; then
    echo "✅ Client dependencies installed"
else
    echo "⚠️  Client dependencies not found"
    echo "   Installing now..."
    cd client && npm install && cd ..
fi

echo ""
echo "🔧 Configuration Check:"
echo ""

# Check contract address
CONTRACT_ADDR=$(grep -oP 'CONTRACT_ADDRESS = "\K[^"]+' client/src/utils/constants.js 2>/dev/null)
if [ -n "$CONTRACT_ADDR" ] && [ "$CONTRACT_ADDR" != "your-smart-contract-deployed-address" ]; then
    echo "✅ Contract Address: $CONTRACT_ADDR"
else
    echo "⚠️  Contract Address: Not configured or using placeholder"
    echo "   Update client/src/utils/constants.js with deployed address"
fi

# Check if ABI exists
if [ -f "client/src/utils/Lock_ABI.json" ]; then
    echo "✅ Contract ABI: Found"
else
    echo "❌ Contract ABI: Not found"
    echo "   Copy from contract/artifacts/contracts/Lock.sol/Lock.json"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Provide next steps
if [ "$HARDHAT_RUNNING" = false ]; then
    echo "📝 Next Steps:"
    echo ""
    echo "1. Start Hardhat Node (Terminal 1):"
    echo "   cd contract"
    echo "   npx hardhat node"
    echo ""
fi

if [ "$REACT_RUNNING" = false ]; then
    echo "2. Start React App (Terminal 2):"
    echo "   cd client"
    echo "   npm start"
    echo ""
fi

echo "3. Configure MetaMask:"
echo "   - Network: Hardhat Local"
echo "   - RPC URL: http://127.0.0.1:8545"
echo "   - Chain ID: 31337"
echo "   - Import Account #0 from Hardhat node output"
echo ""

echo "4. Open Browser:"
echo "   - Navigate to: http://localhost:3000"
echo "   - Connect wallet when prompted"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""

# Ask if user wants to start services
read -p "🚀 Do you want to start the React app now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ "$HARDHAT_RUNNING" = false ]; then
        echo "⚠️  Warning: Hardhat node is not running."
        echo "Please start it in another terminal first."
        echo ""
    fi
    
    echo "Starting React development server..."
    cd client
    npm start
fi
