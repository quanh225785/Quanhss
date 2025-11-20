import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './Auth.css';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false); // Đảm bảo chỉ verify một lần

    useEffect(() => {
        // Nếu đã verify rồi thì không làm gì nữa
        if (hasVerified.current) return;

        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token xác thực không hợp lệ');
            return;
        }

        hasVerified.current = true; // Đánh dấu đã verify
        verifyEmail(token);
    }, [searchParams]);

    const verifyEmail = async (token) => {
        try {
            const response = await api.get(`/api/auth/verify?token=${token}`);
            setStatus('success');
            setMessage(response.data?.result || 'Email đã được xác thực thành công!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(
                err.response?.data?.message ||
                'Xác thực thất bại. Token có thể đã hết hạn hoặc không hợp lệ.'
            );
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <Link to="/" className="back-link">← Quay lại trang chủ</Link>
                    <h1>Xác thực Email</h1>
                </div>

                <div style={{ padding: '40px 30px', textAlign: 'center' }}>
                    {status === 'verifying' && (
                        <div>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '20px', fontSize: '16px' }}>
                                Đang xác thực email của bạn...
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="success-message">
                            <h2 style={{ color: '#166534', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
                                Xác thực thành công
                            </h2>
                            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#166534' }}>
                                {message}
                            </p>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>
                                Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                            </p>
                            <Link to="/login" className="btn-submit" style={{ marginTop: '16px', width: '100%' }}>
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-message">
                            <h2 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
                                Xác thực thất bại
                            </h2>
                            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#ef4444' }}>
                                {message}
                            </p>
                            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                <Link to="/login" className="btn-submit" style={{ flex: 1 }}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-submit" style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }}>
                                    Đăng ký lại
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
