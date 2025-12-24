import React, { useState } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from "../components/layout/MainLayout";
import UserOverview from "../components/user/UserOverview";
import MyBookings from "../components/user/MyBookings";
import MyFavorites from "../components/user/MyFavorites";
import MyLocationProposals from "../components/user/MyLocationProposals";
import TripPlanner from "../components/user/TripPlanner";
import UserProfile from "../components/user/UserProfile";
import UserChat from "../components/user/UserChat";

const UserDashboard = ({ onLogout }) => {
  const [user] = useState(
    JSON.parse(
      localStorage.getItem("user") ||
      '{"firstName": "Khách", "lastName": "hàng", "email": "user@example.com"}'
    )
  );

  return (
    <MainLayout onLogout={onLogout}>
      <div className="p-4 md:p-8 h-full">
        <div className="max-w-6xl mx-auto h-full rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <Routes>
            <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/dashboard" element={<UserOverview />} />
            <Route path="/favorites" element={<MyFavorites />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/locations" element={<MyLocationProposals />} />
            <Route path="/planner" element={<TripPlanner />} />
            <Route path="/profile" element={<UserProfile user={user} onLogout={onLogout} />} />
            <Route path="/chat" element={<UserChat />} />
          </Routes>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
