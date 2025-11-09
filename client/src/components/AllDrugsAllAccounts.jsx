import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../utils/constants';
import DrugRegistry_ABI from '../utils/DrugRegistry_ABI.json';

/**
 * Component hiển thị TẤT CẢ drugs từ TẤT CẢ accounts
 * Giúp tìm được ai đã đăng ký drug nào
 */
function AllDrugsAllAccounts() {
  const [allDrugs, setAllDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDrugs, setTotalDrugs] = useState(0);

  useEffect(() => {
    fetchAllDrugs();
  }, []);

  const fetchAllDrugs = async () => {
    try {
      setLoading(true);

      // Connect to contract (read-only, không cần MetaMask)
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DrugRegistry_ABI, provider);

      // Lấy tổng số drugs
      const total = await contract.totalDrugs();
      setTotalDrugs(Number(total));

      // 🔍 Phương pháp: Lấy events để tìm tất cả drugs đã đăng ký
      // Event DrugRegistered chứa drugId và manufacturer
      const filter = contract.filters.DrugRegistered();
      const events = await contract.queryFilter(filter, 0, 'latest');

      console.log(`📊 Found ${events.length} DrugRegistered events`);

      // Lấy thông tin chi tiết của từng drug
      const drugsData = await Promise.all(
        events.map(async (event) => {
          // ⚠️ event.args.drugId là indexed nên trả về hash, không phải string
          // Phải decode transaction data để lấy drugId gốc
          const blockNumber = event.blockNumber;

          // Lấy thông tin block
          const block = await provider.getBlock(blockNumber);

          // Decode transaction data để lấy drugId gốc
          const tx = await provider.getTransaction(event.transactionHash);
          const decodedData = contract.interface.parseTransaction({ data: tx.data });
          const drugId = decodedData.args[1]; // drugId là argument thứ 2 (index 1)

          // Lấy thông tin drug từ contract
          const drug = await contract.getDrug(drugId);

          return {
            drugId: drug.drugId,
            name: drug.name,
            batchNumber: drug.batchNumber,
            manufactureDate: new Date(Number(drug.manufactureDate) * 1000).toLocaleDateString(),
            expiryDate: new Date(Number(drug.expiryDate) * 1000).toLocaleDateString(),
            manufacturer: drug.manufacturer,
            blockNumber: blockNumber,
            blockHash: block.hash,
            blockTime: new Date(block.timestamp * 1000).toLocaleString(),
            transactionHash: event.transactionHash
          };
        })
      );

      setAllDrugs(drugsData);
      console.log('✅ All drugs:', drugsData);

    } catch (error) {
      console.error('❌ Error fetching all drugs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group drugs by manufacturer
  const drugsByManufacturer = allDrugs.reduce((acc, drug) => {
    if (!acc[drug.manufacturer]) {
      acc[drug.manufacturer] = [];
    }
    acc[drug.manufacturer].push(drug);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>🔍 All Drugs from All Accounts</h2>
      <p>Total drugs registered: <strong>{totalDrugs}</strong></p>

      {loading && <p>⏳ Loading all drugs...</p>}

      {!loading && Object.keys(drugsByManufacturer).length === 0 && (
        <p>No drugs found</p>
      )}

      {!loading && Object.keys(drugsByManufacturer).map((manufacturerAddress) => (
        <div key={manufacturerAddress} style={{
          marginBottom: '30px',
          border: '2px solid #3498db',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#ecf0f1'
        }}>
          <h3 style={{ color: '#2c3e50' }}>
            👤 Manufacturer: <code>{manufacturerAddress}</code>
          </h3>
          <p>Drugs registered: <strong>{drugsByManufacturer[manufacturerAddress].length}</strong></p>

          {drugsByManufacturer[manufacturerAddress].map((drug, index) => (
            <div key={index} style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: 'white',
              borderLeft: '4px solid #27ae60',
              borderRadius: '4px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>
                💊 {drug.name}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '8px', fontSize: '14px' }}>
                <strong>Drug ID:</strong>
                <code>{drug.drugId}</code>

                <strong>Batch Number:</strong>
                <span>{drug.batchNumber}</span>

                <strong>Manufacture Date:</strong>
                <span>{drug.manufactureDate}</span>

                <strong>Expiry Date:</strong>
                <span>{drug.expiryDate}</span>

                <strong>Manufacturer:</strong>
                <code style={{ fontSize: '12px' }}>{drug.manufacturer}</code>

                <strong>📦 Block Number:</strong>
                <span>#{drug.blockNumber}</span>

                <strong>🔗 Block Hash:</strong>
                <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{drug.blockHash}</code>

                <strong>⏰ Block Time:</strong>
                <span>{drug.blockTime}</span>

                <strong>📝 Transaction Hash:</strong>
                <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{drug.transactionHash}</code>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>💡 Giải thích:</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>Block #7</strong> là block số 7 trên blockchain</li>
          <li>Mỗi drug được đăng ký tạo ra 1 transaction trong 1 block</li>
          <li><strong>Manufacturer address</strong> cho biết ví nào đã đăng ký drug đó</li>
          <li>Component này dùng <code>DrugRegistered</code> events để tìm tất cả drugs</li>
          <li>Bạn có thể thấy được drug nào thuộc về account nào</li>
        </ul>
      </div>
    </div>
  );
}

export default AllDrugsAllAccounts;
