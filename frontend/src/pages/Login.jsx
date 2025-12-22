import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from '../utils/api';
import { useToast } from '../context/ToastContext';
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
    const { showToast } = useToast();
    // apiBaseUrl and preconfigured axios instance are available from `src/utils/api.js`

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
            // Backend expects usernameOrEmail + password at POST /api/auth/token
            const response = await api.post('/auth/token', {
                usernameOrEmail: formData.username,
                password: formData.password
            });

            const authResult = response.data?.result;
            const token = authResult?.token;
            const authenticated = authResult?.authenticated;

            if (!token || !authenticated) {
                throw new Error('Đăng nhập không thành công');
            }

            // persist token and set for future api calls
            localStorage.setItem('token', token);
            setAuthToken(token);

            // try to fetch user info using secured endpoint; non-blocking
            try {
                const userRes = await api.get('/users/my-info');
                localStorage.setItem('user', JSON.stringify(userRes.data?.result || {}));
            } catch (err) {
                console.warn('Không lấy được thông tin người dùng:', err);
            }

            // notify parent and navigate
            onLogin();
            navigate('/dashboard');

        } catch (err) {
            const errorCode = err.response?.data?.code;
            const errorMessage = err.response?.data?.message;

            if (errorCode === 1009 || errorMessage?.includes('not verified') || errorMessage?.includes('Email not verified')) {
                setError('Email của bạn chưa được xác thực. Vui lòng kiểm tra email hoặc gửi lại email xác thực.');
                setShowResendVerification(true);
                // Prefill email from entered username if it looks like an email
                if (formData.username && formData.username.includes('@')) {
                    setUserEmail(formData.username);
                }
            } else if (errorCode === 1029) {
                // Account locked error
                setError(errorMessage || 'Tài khoản đã bị khóa.');
                setShowResendVerification(false);
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
            await api.post(`/auth/resend-verify?email=${userEmail}`);
            setError('');
            showToast({
                type: 'success',
                message: 'Đã gửi lại email xác thực!',
                description: 'Vui lòng kiểm tra hộp thư của bạn.'
            });
            setShowResendVerification(false);
            setUserEmail('');
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
                    <p style={{ marginTop: '8px' }}>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
