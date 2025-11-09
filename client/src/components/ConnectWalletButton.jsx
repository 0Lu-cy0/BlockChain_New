import React from "react";
import { requestAccount } from "../utils/drugServices";
import { toast } from "react-toastify";

const ConnectWalletButton = ({ account, setAccount }) => {
  const handleConnect = async () => {
    try {
      const connectedAccount = await requestAccount();
      setAccount(connectedAccount);
      toast.success("Kết nối ví thành công!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Lỗi kết nối ví!");
    }
  };

  return (
    <div className="connect-wallet">
      {account ? (
        <div className="account-info">
          <span className="account-label">Đã kết nối:</span>
          <span className="account-address">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      ) : (
        <button onClick={handleConnect} className="connect-button">
          🦊 Kết Nối MetaMask
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
