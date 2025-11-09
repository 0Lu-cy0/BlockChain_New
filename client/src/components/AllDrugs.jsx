import React, { useState, useEffect } from 'react';
import { getDrugsByManufacturer, getDrug } from '../utils/drugServices';
import './AllDrugs.css';

function AllDrugs({ account }) {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMyDrugs = async () => {
    setLoading(true);
    setError('');

    try {
      // Lấy danh sách Drug IDs của user hiện tại
      const drugIds = await getDrugsByManufacturer(account);

      console.log(`📦 Found ${drugIds.length} drugs for ${account}`);

      if (drugIds.length === 0) {
        setDrugs([]);
        setLoading(false);
        return;
      }

      // Lấy chi tiết từng thuốc
      const drugDetails = await Promise.all(
        drugIds.map(async (drugId) => {
          try {
            const drug = await getDrug(drugId);
            return drug;
          } catch (err) {
            console.error(`Error loading drug ${drugId}:`, err);
            return null;
          }
        })
      );

      // Lọc bỏ null
      const validDrugs = drugDetails.filter(d => d !== null);

      setDrugs(validDrugs);
    } catch (err) {
      console.error('Error loading my drugs:', err);
      setError('Failed to load drugs from blockchain: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadMyDrugs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-GB');
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isExpired = (expiryDate) => {
    const now = Math.floor(Date.now() / 1000);
    return Number(expiryDate) < now;
  };

  return (
    <div className="all-drugs-container">
      <div className="all-drugs-header">
        <h2>📦 Thuốc Của Tôi</h2>
        <button onClick={loadMyDrugs} disabled={loading} className="refresh-btn">
          {loading ? '🔄 Đang tải...' : '🔄 Làm mới'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <p>❌ {error}</p>
        </div>
      )}

      {loading && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Đang tải danh sách thuốc từ blockchain...</p>
        </div>
      )}

      {!loading && drugs.length === 0 && (
        <div className="empty-box">
          <p>📭 Bạn chưa đăng ký thuốc nào</p>
          <p className="hint">Hãy đăng ký thuốc đầu tiên để xem tại đây!</p>
        </div>
      )}

      {!loading && drugs.length > 0 && (
        <div className="drugs-stats">
          <p>Tổng số thuốc của bạn: <strong>{drugs.length}</strong></p>
        </div>
      )}

      <div className="drugs-grid">
        {drugs.map((drug, index) => (
          <div key={drug.drugId || index} className="drug-card">
            <div className="drug-card-header">
              <h3>{drug.name}</h3>
              {isExpired(drug.expiryDate) && (
                <span className="expired-badge">⚠️ EXPIRED</span>
              )}
            </div>

            <div className="drug-card-body">
              <div className="drug-field">
                <span className="label">Mã thuốc:</span>
                <span className="value drug-id">{drug.drugId}</span>
              </div>

              <div className="drug-field">
                <span className="label">Số lô:</span>
                <span className="value">{drug.batchNumber}</span>
              </div>

              <div className="drug-field">
                <span className="label">Nhà sản xuất:</span>
                <span className="value address" title={drug.manufacturer}>
                  {formatAddress(drug.manufacturer)}
                </span>
              </div>

              <div className="drug-field">
                <span className="label">Ngày sản xuất:</span>
                <span className="value">{formatDate(drug.manufactureDate)}</span>
              </div>

              <div className="drug-field">
                <span className="label">Hạn sử dụng:</span>
                <span className="value">{formatDate(drug.expiryDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllDrugs;
