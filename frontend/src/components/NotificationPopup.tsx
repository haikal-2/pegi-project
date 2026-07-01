import React from 'react';
import { FaTimes, FaMoneyBillWave, FaChevronRight } from 'react-icons/fa';
import './NotificationPopup.css'; 

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  // Fungsi untuk menutup popup lalu pindah ke halaman pembayaran
  const handleNavigateToPayment = () => {
    onClose();
    window.location.href = '/admin/payments';
  };

  return (
    <div className="modal-overlay">
      <div className="notif-modal-content">
        <div className="notif-header">
          <h3>Pembayaran Menunggu</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="notif-list">
          {notifications.length === 0 ? (
            <p className="no-data">Tidak ada pembayaran baru yang menunggu.</p>
          ) : (
            notifications.map((tx) => (
              <div key={tx.id} className="notif-item">
                <div className="notif-info">
                  <FaMoneyBillWave className="icon-money" />
                  <div>
                    <strong>{tx.customerName}</strong>
                    <p>{tx.serviceName} - <span className="text-bold">{tx.amount}</span></p>
                  </div>
                </div>
                
                {/* Tombol diubah menjadi navigasi */}
                <button 
                  className="btn-cek-detail" 
                  onClick={handleNavigateToPayment}
                >
                  Cek Detail <FaChevronRight />
                </button>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;