// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DrugRegistry
 * @dev Smart contract để đăng ký và tra cứu thông tin thuốc đầy đủ
 * @notice Dùng cho hệ thống truy xuất nguồn gốc dược phẩm
 */
contract DrugRegistry {
    // Cấu trúc dữ liệu thuốc đầy đủ
    struct Drug {
        // Thông tin cơ bản
        string name;                    // Tên thuốc
        string drugId;                  // Mã thuốc (unique)
        string registrationNumber;      // Số đăng ký lưu hành (unique)
        string batchNumber;             // Số lô sản xuất
        
        // Thành phần & Quy cách
        string activeIngredient;        // Hoạt chất
        string concentration;           // Hàm lượng (VD: "500mg")
        string dosageForm;              // Dạng bào chế (VD: "Viên nén")
        string packaging;               // Quy cách đóng gói (VD: "Hộp 10 vỉ x 10 viên")
        uint256 quantity;               // Số lượng trong lô
        
        // Nguồn gốc
        string manufacturerName;        // Tên nhà sản xuất
        address manufacturer;           // Địa chỉ ví nhà sản xuất
        string distributorName;         // Tên nhà phân phối
        string originCountry;           // Xuất xứ
        
        // Thời gian
        uint256 manufactureDate;        // Ngày sản xuất
        uint256 expiryDate;             // Hạn sử dụng
        uint256 registeredAt;           // Thời điểm đăng ký lên blockchain
        
        bool exists;                    // Kiểm tra tồn tại
    }

    // Mappings để lưu trữ
    mapping(string => Drug) public drugs;                           // drugId => Drug
    mapping(string => bool) private registrationNumbers;            // Số đăng ký => exists
    mapping(address => mapping(string => bool)) private manufacturerBatches; // manufacturer => batchNumber => exists
    mapping(address => string[]) public manufacturerDrugs;          // Danh sách thuốc của nhà sản xuất
    
    // Tổng số thuốc
    uint256 public totalDrugs;

    // Events
    event DrugRegistered(
        string indexed drugId,
        string indexed registrationNumber,
        string name,
        string manufacturerName,
        address indexed manufacturer,
        uint256 manufactureDate,
        uint256 expiryDate
    );

    /**
     * @dev Đăng ký thuốc mới với đầy đủ thông tin
     * @param _name Tên thuốc
     * @param _drugId Mã thuốc (unique)
     * @param _registrationNumber Số đăng ký lưu hành (unique)
     * @param _batchNumber Số lô
     * @param _activeIngredient Hoạt chất
     * @param _concentration Hàm lượng
     * @param _dosageForm Dạng bào chế
     * @param _packaging Quy cách đóng gói
     * @param _quantity Số lượng
     * @param _manufacturerName Tên nhà sản xuất
     * @param _distributorName Tên nhà phân phối
     * @param _originCountry Xuất xứ
     * @param _manufactureDate Ngày sản xuất (Unix timestamp)
     * @param _expiryDate Hạn sử dụng (Unix timestamp)
     */
    function registerDrug(
        string memory _name,
        string memory _drugId,
        string memory _registrationNumber,
        string memory _batchNumber,
        string memory _activeIngredient,
        string memory _concentration,
        string memory _dosageForm,
        string memory _packaging,
        uint256 _quantity,
        string memory _manufacturerName,
        string memory _distributorName,
        string memory _originCountry,
        uint256 _manufactureDate,
        uint256 _expiryDate
    ) public {
        // Validate required fields
        require(bytes(_name).length > 0, "Ten thuoc khong duoc rong");
        require(bytes(_drugId).length > 0, "Ma thuoc khong duoc rong");
        require(bytes(_registrationNumber).length > 0, "So dang ky khong duoc rong");
        require(bytes(_batchNumber).length > 0, "So lo khong duoc rong");
        require(bytes(_manufacturerName).length > 0, "Ten nha san xuat khong duoc rong");
        
        // Validate unique constraints
        require(!drugs[_drugId].exists, "Ma thuoc da ton tai");
        require(!registrationNumbers[_registrationNumber], "So dang ky da ton tai");
        require(!manufacturerBatches[msg.sender][_batchNumber], "So lo nay da duoc dang ky boi nha san xuat");
        
        // Validate dates
        require(_manufactureDate < _expiryDate, "Ngay san xuat phai truoc han su dung");
        require(_manufactureDate <= block.timestamp, "Ngay san xuat khong the trong tuong lai");
        
        // Validate quantity
        require(_quantity > 0, "So luong phai lon hon 0");

        // Tạo thuốc mới
        drugs[_drugId] = Drug({
            name: _name,
            drugId: _drugId,
            registrationNumber: _registrationNumber,
            batchNumber: _batchNumber,
            activeIngredient: _activeIngredient,
            concentration: _concentration,
            dosageForm: _dosageForm,
            packaging: _packaging,
            quantity: _quantity,
            manufacturerName: _manufacturerName,
            manufacturer: msg.sender,
            distributorName: _distributorName,
            originCountry: _originCountry,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            registeredAt: block.timestamp,
            exists: true
        });

        // Đánh dấu unique fields
        registrationNumbers[_registrationNumber] = true;
        manufacturerBatches[msg.sender][_batchNumber] = true;
        
        // Thêm vào danh sách nhà sản xuất
        manufacturerDrugs[msg.sender].push(_drugId);
        
        // Tăng tổng số thuốc
        totalDrugs++;

        emit DrugRegistered(
            _drugId, 
            _registrationNumber,
            _name, 
            _manufacturerName, 
            msg.sender, 
            _manufactureDate, 
            _expiryDate
        );
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
