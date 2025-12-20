import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AdminOverview from "../components/admin/AdminOverview";
import UserManagement from "../components/admin/UserManagement";
import TourManagement from "../components/admin/TourManagement";
import LocationManagement from "../components/admin/LocationManagement";
import BookingManagement from "../components/admin/BookingManagement";
import ContentManagement from "../components/admin/ContentManagement";
import AdminProfile from "../components/admin/AdminProfile";

const AdminDashboard = ({ onLogout }) => {
  const [user] = useState(
    JSON.parse(
      localStorage.getItem("user") ||
      '{"firstName": "Admin", "lastName": "User", "email": "admin@example.com"}'
    )
  );

  return (
    <MainLayout onLogout={onLogout}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminOverview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/tours" element={<TourManagement />} />
          <Route path="/locations" element={<LocationManagement />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/content" element={<ContentManagement />} />
          <Route path="/profile" element={<AdminProfile user={user} />} />
        </Routes>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
