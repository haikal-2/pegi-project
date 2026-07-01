import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

import HotelSearchPage from "./pages/HotelSearchPage";
import HotelDetailPage from "./pages/HotelDetailPage";

import DestinationSearchPage from "./pages/DestinationSearchPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";

import TransportSearchPage from "./pages/TransportSearchPage";

import ProfilePage from "./pages/ProfilePage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import WishlistPage from "./pages/WishlistPage";
import GrupList from "./pages/GrupList";
import GrupChat from "./pages/GroupChat";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUserPage from "./pages/AdminUserPage";
import AdminHotelPage from "./pages/AdminHotelPage";
import AdminDestinationPage from "./pages/AdminDestinationPage";
import AdminPromoPage from "./pages/AdminPromoPage";
import AdminTransportPage from "./pages/AdminTransportPage";
import AdminGroupPage from "./pages/AdminGroupPage";
import AdminMonitoringPage from "./pages/AdminMonitoringPage";
import AdminPaymentPage from "./pages/AdminPaymentPage";

import HelpCenterPage from "./pages/HelpCenterPage";
import TravelPartnerPage from "./pages/TravelPartnerPage";
import TransportDetailPage from "./pages/TransportDetailPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import GroupChat from "./pages/GroupChat";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Kalau gak ada token, tendang ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kalau ada batasan role (misal khusus ADMIN)
  if (allowedRoles && (!user || !allowedRoles.includes(user.role?.toUpperCase()))) {
    return <Navigate to="/" replace />; // User biasa nyasar ke admin, tendang ke home
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Rute Utama (Bisa diakses siapa saja) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rute Hotel & Destinasi */}
      <Route path="/hotel-search" element={<HotelSearchPage />} />
      <Route path="/hotel-detail" element={<HotelDetailPage />} />
      <Route path="/destination-search" element={<DestinationSearchPage />} />
      <Route path="/destination-detail" element={<DestinationDetailPage />} />
      <Route path="/travel-partner" element={<TravelPartnerPage />} />
      
      {/* Rute Transportasi & Pembayaran */}
      <Route path="/transport-search" element={<TransportSearchPage />} />
      <Route path="/transport-detail" element={<TransportDetailPage />} />
      <Route path="/payment-page" element={<PaymentPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      
      {/* 🔒 RUTE USER AREA (Wajib Login dulu) */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><BookingHistoryPage /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/grup" element={<ProtectedRoute><GrupList /></ProtectedRoute>} />
      <Route path="/obrolan/:id" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
      <Route path="/grup/chat" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />

      {/* 🔒 RUTE ADMIN (Wajib Login DAN Harus Ber-role ADMIN) */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminUserPage /></ProtectedRoute>} />
      <Route path="/admin/hotels" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminHotelPage /></ProtectedRoute>} />
      <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDestinationPage /></ProtectedRoute>} />
      <Route path="/admin/promos" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPromoPage /></ProtectedRoute>} />
      <Route path="/admin/transport" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminTransportPage /></ProtectedRoute>} />
      <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminGroupPage /></ProtectedRoute>} />
      <Route path="/admin/monitoring" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminMonitoringPage /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPaymentPage /></ProtectedRoute>} />

      {/* Rute Bantuan */}
      <Route path="/help-center" element={<HelpCenterPage />} />

      {/* Rute Default */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;