import React, { useState } from "react";
import { getDrug, drugExists, isExpired } from "../utils/drugServices";
import { toast } from "react-toastify";

const VerifyDrug = () => {
  const [drugId, setDrugId] = useState("");
  const [drugInfo, setDrugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!drugId.trim()) {
      toast.error("Vui lòng nhập mã thuốc!");
      return;
    }

    setLoading(true);
    setDrugInfo(null);

    try {
      // Check if drug exists
      const exists = await drugExists(drugId);

      if (!exists) {
        toast.error("Không tìm thấy thuốc với mã này!");
        setLoading(false);
        return;
      }

      // Get drug info
      const drug = await getDrug(drugId);

      // Check if expired
      const expired = await isExpired(drugId);

      setDrugInfo({ ...drug, isExpired: expired });
      toast.success("Tìm thấy thông tin thuốc!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.reason || error.message || "Lỗi khi tra cứu thuốc!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("vi-VN");
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="verify-drug">
      <h2>🔍 Tra Cứu Nguồn Gốc Thuốc</h2>

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Nhập Mã Thuốc (Drug ID):</label>
          <input
            type="text"
            value={drugId}
            onChange={(e) => setDrugId(e.target.value)}
            placeholder="VD: DRUG001"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang tra cứu..." : "🔎 Tra Cứu"}
        </button>
      </form>

      {drugInfo && (
        <div className="drug-info">
          <h3>📦 Thông Tin Thuốc</h3>

          <div className="info-card">
            <div className="info-row">
              <span className="label">Tên thuốc:</span>
              <span className="value">{drugInfo.name}</span>
            </div>

            <div className="info-row">
              <span className="label">Mã thuốc:</span>
              <span className="value drug-id">{drugInfo.drugId}</span>
            </div>

            <div className="info-row">
              <span className="label">Số lô:</span>
              <span className="value">{drugInfo.batchNumber}</span>
            </div>

            <div className="info-row">
              <span className="label">Ngày sản xuất:</span>
              <span className="value">{formatDate(drugInfo.manufactureDate)}</span>
            </div>

            <div className="info-row">
              <span className="label">Hạn sử dụng:</span>
              <span className="value">{formatDate(drugInfo.expiryDate)}</span>
            </div>

            <div className="info-row">
              <span className="label">Nhà sản xuất:</span>
              <span className="value address" title={drugInfo.manufacturer}>
                {formatAddress(drugInfo.manufacturer)}
              </span>
            </div>

            <div className="info-row status">
              <span className="label">Trạng thái:</span>
              <span className={`value ${drugInfo.isExpired ? "expired" : "valid"}`}>
                {drugInfo.isExpired ? "⚠️ Đã hết hạn" : "✅ Còn hạn sử dụng"}
              </span>
            </div>
          </div>

          {drugInfo.isExpired && (
            <div className="warning-box">
              <strong>⚠️ CẢNH BÁO:</strong> Thuốc này đã hết hạn sử dụng. Không nên sử dụng!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyDrug;
