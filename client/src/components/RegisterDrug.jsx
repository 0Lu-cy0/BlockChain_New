import React, { useState } from "react";
import { registerDrug } from "../utils/drugServices";
import { toast } from "react-toastify";

const RegisterDrug = () => {
  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    name: "",
    drugId: "",
    registrationNumber: "",
    batchNumber: "",

    // Thành phần & Quy cách
    activeIngredient: "",
    concentration: "",
    dosageForm: "",
    packaging: "",
    quantity: "",

    // Nguồn gốc
    manufacturerName: "",
    distributorName: "",
    originCountry: "",

    // Thời gian
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

    // Validation - Required fields
    if (!formData.name || !formData.drugId || !formData.registrationNumber || !formData.batchNumber ||
      !formData.manufacturerName || !formData.manufactureDate || !formData.expiryDate) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    // Validate quantity
    if (formData.quantity && parseInt(formData.quantity) <= 0) {
      toast.error("Số lượng phải lớn hơn 0!");
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
        registrationNumber: "",
        batchNumber: "",
        activeIngredient: "",
        concentration: "",
        dosageForm: "",
        packaging: "",
        quantity: "",
        manufacturerName: "",
        distributorName: "",
        originCountry: "",
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
        {/* THÔNG TIN CƠ BẢN */}
        <fieldset>
          <legend>📋 Thông tin cơ bản</legend>

          <div className="form-group">
            <label>Tên Thuốc: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Paracetamol"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Mã Thuốc (Drug ID): <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="drugId"
              value={formData.drugId}
              onChange={handleChange}
              placeholder="VD: DRUG001 (Phải unique)"
              disabled={loading}
              required
            />
            <small>🔒 Mã này phải unique trong hệ thống</small>
          </div>

          <div className="form-group">
            <label>Số Đăng Ký Lưu Hành: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="VD: VD-12345-17"
              disabled={loading}
              required
            />
            <small>🔒 Số đăng ký phải unique trong hệ thống</small>
          </div>

          <div className="form-group">
            <label>Số Lô Sản Xuất: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="VD: LOT2024001"
              disabled={loading}
              required
            />
            <small>🔒 Số lô phải unique cho mỗi nhà sản xuất</small>
          </div>
        </fieldset>

        {/* THÀNH PHẦN & QUY CÁCH */}
        <fieldset>
          <legend>💊 Thành phần & Quy cách</legend>

          <div className="form-group">
            <label>Hoạt Chất:</label>
            <input
              type="text"
              name="activeIngredient"
              value={formData.activeIngredient}
              onChange={handleChange}
              placeholder="VD: Paracetamol"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Hàm Lượng:</label>
            <input
              type="text"
              name="concentration"
              value={formData.concentration}
              onChange={handleChange}
              placeholder="VD: 500mg"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Dạng Bào Chế:</label>
            <input
              type="text"
              name="dosageForm"
              value={formData.dosageForm}
              onChange={handleChange}
              placeholder="VD: Viên nén, Viên nang, Siro..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Quy Cách Đóng Gói:</label>
            <input
              type="text"
              name="packaging"
              value={formData.packaging}
              onChange={handleChange}
              placeholder="VD: Hộp 10 vỉ x 10 viên"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Số Lượng (Đơn vị):</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="VD: 10000"
              disabled={loading}
              min="1"
            />
          </div>
        </fieldset>

        {/* NGUỒN GỐC */}
        <fieldset>
          <legend>🏭 Nguồn gốc</legend>

          <div className="form-group">
            <label>Tên Nhà Sản Xuất: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleChange}
              placeholder="VD: Công ty Dược phẩm ABC"
              disabled={loading}
              required
            />
            <small>ℹ️ Địa chỉ ví của bạn sẽ tự động được lưu trên blockchain</small>
          </div>

          <div className="form-group">
            <label>Tên Nhà Phân Phối:</label>
            <input
              type="text"
              name="distributorName"
              value={formData.distributorName}
              onChange={handleChange}
              placeholder="VD: Công ty Phân phối XYZ"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Xuất Xứ:</label>
            <input
              type="text"
              name="originCountry"
              value={formData.originCountry}
              onChange={handleChange}
              placeholder="VD: Việt Nam"
              disabled={loading}
            />
          </div>
        </fieldset>

        {/* THỜI GIAN */}
        <fieldset>
          <legend>📅 Thời gian</legend>

          <div className="form-group">
            <label>Ngày Sản Xuất: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="date"
              name="manufactureDate"
              value={formData.manufactureDate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Hạn Sử Dụng: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "🚀 Đăng Ký Thuốc"}
        </button>
      </form>
    </div>
  );
};

export default RegisterDrug;
