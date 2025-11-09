// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DrugRegistry
 * @dev Smart contract để đăng ký và tra cứu thông tin thuốc
 * @notice Dùng cho hệ thống truy xuất nguồn gốc dược phẩm
 */
contract DrugRegistry {
    // Cấu trúc dữ liệu thuốc
    struct Drug {
        string name;              // Tên thuốc
        string drugId;            // Mã thuốc (unique identifier)
        string batchNumber;       // Số lô sản xuất
        uint256 manufactureDate;  // Ngày sản xuất (timestamp)
        uint256 expiryDate;       // Hạn sử dụng (timestamp)
        address manufacturer;     // Địa chỉ nhà sản xuất
        bool exists;              // Kiểm tra thuốc có tồn tại không phải
    }

    // Lưu trữ thuốc theo drugId
    mapping(string => Drug) public drugs;
    
    // Lưu danh sách drugId của từng nhà sản xuất
    mapping(address => string[]) public manufacturerDrugs;
    
    // Tổng số thuốc đã đăng ký
    uint256 public totalDrugs;

    // Events
    event DrugRegistered(
        string indexed drugId,
        string name,
        address indexed manufacturer,
        uint256 manufactureDate,
        uint256 expiryDate
    );

    /**
     * @dev Đăng ký thuốc mới
     * @param _name Tên thuốc
     * @param _drugId Mã thuốc (phải unique)
     * @param _batchNumber Số lô
     * @param _manufactureDate Ngày sản xuất (Unix timestamp)
     * @param _expiryDate Hạn sử dụng (Unix timestamp)
     */
    function registerDrug(
        string memory _name,
        string memory _drugId,
        string memory _batchNumber,
        uint256 _manufactureDate,
        uint256 _expiryDate
    ) public {
        // Validate inputs
        require(bytes(_name).length > 0, "Drug name cannot be empty");
        require(bytes(_drugId).length > 0, "Drug ID cannot be empty");
        require(bytes(_batchNumber).length > 0, "Batch number cannot be empty");
        require(!drugs[_drugId].exists, "Drug ID already registered");
        require(_manufactureDate < _expiryDate, "Manufacture date must be before expiry date");
        require(_manufactureDate <= block.timestamp, "Manufacture date cannot be in the future");

        // Tạo thuốc mới
        drugs[_drugId] = Drug({
            name: _name,
            drugId: _drugId,
            batchNumber: _batchNumber,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            manufacturer: msg.sender,
            exists: true
        });

        // Thêm vào danh sách của nhà sản xuất
        manufacturerDrugs[msg.sender].push(_drugId);
        
        // Tăng tổng số thuốc
        totalDrugs++;

        emit DrugRegistered(_drugId, _name, msg.sender, _manufactureDate, _expiryDate);
    }

    /**
     * @dev Lấy thông tin thuốc theo drugId
     * @param _drugId Mã thuốc cần tra cứu
     * @return Drug Thông tin thuốc
     */
    function getDrug(string memory _drugId) public view returns (Drug memory) {
        require(drugs[_drugId].exists, "Drug not found");
        return drugs[_drugId];
    }

    /**
     * @dev Kiểm tra thuốc đã hết hạn chưa
     * @param _drugId Mã thuốc
     * @return bool True nếu đã hết hạn
     */
    function isExpired(string memory _drugId) public view returns (bool) {
        require(drugs[_drugId].exists, "Drug not found");
        return block.timestamp > drugs[_drugId].expiryDate;
    }

    /**
     * @dev Kiểm tra thuốc có tồn tại không
     * @param _drugId Mã thuốc
     * @return bool True nếu tồn tại
     */
    function drugExists(string memory _drugId) public view returns (bool) {
        return drugs[_drugId].exists;
    }

    /**
     * @dev Lấy danh sách thuốc của một nhà sản xuất
     * @param _manufacturer Địa chỉ nhà sản xuất
     * @return string[] Mảng các drugId
     */
    function getDrugsByManufacturer(address _manufacturer) public view returns (string[] memory) {
        return manufacturerDrugs[_manufacturer];
    }

    /**
     * @dev Lấy số lượng thuốc của một nhà sản xuất
     * @param _manufacturer Địa chỉ nhà sản xuất
     * @return uint256 Số lượng thuốc
     */
    function getManufacturerDrugCount(address _manufacturer) public view returns (uint256) {
        return manufacturerDrugs[_manufacturer].length;
    }
}
