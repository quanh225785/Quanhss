import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ onLogout }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage
        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined') {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="container">
                    <div className="nav-content">
                        <div className="logo">Quanh.</div>
                        <button onClick={handleLogout} className="btn-logout">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="container">
                    <div className="welcome-section">
                        <h1>Chào mừng trở lại{user?.name ? `, ${user.name}` : ''}! 🎉</h1>
                        <p>Sẵn sàng cho chuyến du lịch tiếp theo của bạn chưa?</p>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <div className="card-icon">🗺️</div>
                            <h3>Khám phá điểm đến</h3>
                            <p>Tìm kiếm những địa điểm du lịch tuyệt vời trên toàn thế giới</p>
                            <button className="card-btn">Khám phá ngay</button>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-icon">📅</div>
                            <h3>Lịch trình của tôi</h3>
                            <p>Quản lý và theo dõi các chuyến đi sắp tới của bạn</p>
                            <button className="card-btn">Xem lịch trình</button>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-icon">❤️</div>
                            <h3>Danh sách yêu thích</h3>
                            <p>Các địa điểm bạn đã lưu để tham khảo sau</p>
                            <button className="card-btn">Xem danh sách</button>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-icon">📸</div>
                            <h3>Kỷ niệm</h3>
                            <p>Lưu giữ những khoảnh khắc đáng nhớ trong các chuyến đi</p>
                            <button className="card-btn">Xem ảnh</button>
                        </div>
                    </div>

                    {user && (
                        <div className="user-info-section">
                            <h2>Thông tin tài khoản</h2>
                            <div className="user-info-card">
                                <div className="info-row">
                                    <span className="info-label">Họ và tên:</span>
                                    <span className="info-value">{user.name || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tên người dùng:</span>
                                    <span className="info-value">{user.username || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{user.email || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Vai trò:</span>
                                    <span className="info-value badge">{user.role || 'USER'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
