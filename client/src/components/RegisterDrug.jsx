import React, { useState } from "react";
import { registerDrug } from "../utils/drugServices";
import { toast } from "react-toastify";

const RegisterDrug = () => {
  const [formData, setFormData] = useState({
    name: "",
    drugId: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.drugId || !formData.batchNumber || !formData.manufactureDate || !formData.expiryDate) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Check dates
    const mfgDate = new Date(formData.manufactureDate);
    const expDate = new Date(formData.expiryDate);

    if (mfgDate >= expDate) {
      toast.error("Ngày sản xuất phải trước hạn sử dụng!");
      return;
    }

    if (mfgDate > new Date()) {
      toast.error("Ngày sản xuất không thể trong tương lai!");
      return;
    }

    setLoading(true);

    try {
      const txHash = await registerDrug(formData);
      toast.success(`Đăng ký thuốc thành công! TX: ${txHash.slice(0, 10)}...`);

      // Reset form
      setFormData({
        name: "",
        drugId: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.reason || error.message || "Đăng ký thuốc thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-drug">
      <h2>📝 Đăng Ký Thuốc Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên Thuốc:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="VD: Paracetamol 500mg"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Mã Thuốc (Drug ID):</label>
          <input
            type="text"
            name="drugId"
            value={formData.drugId}
            onChange={handleChange}
            placeholder="VD: DRUG001"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Số Lô (Batch):</label>
          <input
            type="text"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            placeholder="VD: LOT2024001"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Ngày Sản Xuất:</label>
          <input
            type="date"
            name="manufactureDate"
            value={formData.manufactureDate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Hạn Sử Dụng:</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "🚀 Đăng Ký Thuốc"}
        </button>
      </form>
    </div>
  );
};

export default RegisterDrug;
