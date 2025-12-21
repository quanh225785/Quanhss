import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Map, LogOut } from 'lucide-react';

import MainLayout from '../components/layout/MainLayout';
import DashboardOverview from '../components/agent/DashboardOverview';
import MyTours from '../components/agent/MyTours';
import AgentTourDetail from '../components/agent/AgentTourDetail';
import TripManagementPage from '../components/agent/TripManagementPage';
import LocationProposals from '../components/agent/LocationProposals';
import Reviews from '../components/agent/Reviews';
import AgentProfile from '../components/agent/AgentProfile';
import AgentChatList from '../components/agent/AgentChatList';
import NavItem from '../components/shared/NavItem';
import { agentNavItems } from '../utils/navConfig';

const AgentDashboard = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{"firstName": "Agent", "email": "agent@example.com"}'));

    return (
        <MainLayout onLogout={onLogout}>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/" element={<Navigate to="/agent/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardOverview />} />
                    <Route path="/tours" element={<MyTours />} />
                    <Route path="/tours/:id" element={<AgentTourDetail />} />
                    <Route path="/tours/:id/trips" element={<TripManagementPage />} />
                    <Route path="/locations" element={<LocationProposals />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/chat" element={<AgentChatList />} />
                    <Route path="/profile" element={<AgentProfile user={user} />} />
                </Routes>
            </div>
        </MainLayout>
    );
};

export default AgentDashboard;
