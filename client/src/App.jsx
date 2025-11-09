import React, { useState, useEffect } from "react";
import "./App.css";
import ConnectWalletButton from "./components/ConnectWalletButton";
import RegisterDrug from "./components/RegisterDrug";
import VerifyDrug from "./components/VerifyDrug";
import AllDrugs from "./components/AllDrugs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initializeProvider, getTotalDrugs, getManufacturerDrugCount } from "./utils/drugServices";

function App() {
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const [totalDrugs, setTotalDrugs] = useState("0");
  const [myDrugsCount, setMyDrugsCount] = useState("0");

  useEffect(() => {
    // Initialize provider when component mounts
    initializeProvider();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const total = await getTotalDrugs();
        setTotalDrugs(total);

        // Only fetch user's drugs if account is connected and valid
        if (account && account.startsWith("0x")) {
          const myCount = await getManufacturerDrugCount(account);
          setMyDrugsCount(myCount);
        } else {
          setMyDrugsCount("0");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // Only fetch stats if account is connected
    if (account && account.startsWith("0x")) {
      fetchStats();
      // Refresh every 5 seconds
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [account]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>💊 Hệ thống truy xuất nguồn gốc thuốc</h1>
        <ConnectWalletButton account={account} setAccount={setAccount} />
      </header>

      {account && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Tổng số thuốc:</span>
            <span className="stat-value">{totalDrugs}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Thuốc của tôi:</span>
            <span className="stat-value">{myDrugsCount}</span>
          </div>
        </div>
      )}

      <main className="App-main">
        {account ? (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                📝 Đăng Ký Thuốc
              </button>
              <button
                className={`tab ${activeTab === "verify" ? "active" : ""}`}
                onClick={() => setActiveTab("verify")}
              >
                🔍 Tra Cứu
              </button>
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                📦 Thuốc Của Tôi
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "register" && <RegisterDrug />}
              {activeTab === "verify" && <VerifyDrug />}
              {activeTab === "all" && <AllDrugs account={account} />}
            </div>
          </>
        ) : (
          <div className="welcome-box">
            <h2>👋 Chào mừng!</h2>
            <p>Vui lòng kết nối ví MetaMask để sử dụng hệ thống.</p>
            <ul>
              <li>✅ Đăng ký thông tin thuốc lên Blockchain</li>
              <li>✅ Tra cứu nguồn gốc thuốc minh bạch</li>
              <li>✅ Kiểm tra hạn sử dụng tự động</li>
            </ul>
          </div>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
}

export default App;
