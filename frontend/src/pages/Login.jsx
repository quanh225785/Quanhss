import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Backend expects username + password at POST /api/auth/token and
            // returns ApiResponse<AuthenticationResponse> with token in result.token
            const response = await axios.post('http://localhost:8080/api/auth/token', {
                username: formData.username,
                password: formData.password
            });

            // Save JWT token from result
            const authResult = response.data?.result;
            const token = authResult?.token;
            const authenticated = authResult?.authenticated;
            if (!token || !authenticated) {
                throw new Error('Đăng nhập không thành công');
            }
            if (!token) {
                throw new Error('Không nhận được token từ server');
            }
            localStorage.setItem('token', token);

            // Fetch user info from backend using token
            try {
                const userRes = await axios.get('http://localhost:8080/api/users/my-info', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.setItem('user', JSON.stringify(userRes.data?.result || {}));
            } catch (err) {
                // If user info cannot be fetched, don't block login — continue
                console.warn('Không lấy được thông tin người dùng:', err);
            }

            // Gọi callback để cập nhật trạng thái đăng nhập
            onLogin();

            // Chuyển hướng đến dashboard
            navigate('/dashboard');
        } catch (err) {
            const errorCode = err.response?.data?.code;
            const errorMessage = err.response?.data?.message;

            if (errorCode === 1009 || errorMessage?.includes('not verified') || errorMessage?.includes('Email not verified')) {
                setError('Email của bạn chưa được xác thực. Vui lòng kiểm tra email hoặc gửi lại email xác thực.');
                setShowResendVerification(true);
            } else {
                setError(errorMessage || 'Đăng nhập thất bại. Vui lòng thử lại.');
                setShowResendVerification(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!userEmail) {
            setError('Vui lòng nhập email để gửi lại xác thực');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/auth/resend-verify?email=${userEmail}`);
            setError('');
            alert('Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.');
            setShowResendVerification(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi lại email thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <Link to="/" className="back-link">← Quay lại trang chủ</Link>
                    <h1>Đăng nhập</h1>
                    <p>Chào mừng bạn trở lại!</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {showResendVerification && (
                    <div className="info-message" style={{
                        background: '#fff3cd',
                        border: '1px solid #ffc107',
                        padding: '15px',
                        borderRadius: '5px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: '0 0 10px 0' }}>📧 Nhập email để gửi lại link xác thực:</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                            />
                            <button
                                onClick={handleResendVerification}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Gửi lại
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập hoặc Email</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nhập tên đăng nhập hoặc email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
