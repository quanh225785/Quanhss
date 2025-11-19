import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token xác thực không hợp lệ');
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    const verifyEmail = async (token) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/auth/verify?token=${token}`);
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
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                            <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
                                Xác thực thành công!
                            </h2>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                                {message}
                            </p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                            </p>
                            <Link to="/login" className="btn-submit" style={{ marginTop: '25px', display: 'inline-block' }}>
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-message">
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
                            <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>
                                Xác thực thất bại
                            </h2>
                            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                                {message}
                            </p>
                            <div style={{ marginTop: '30px' }}>
                                <Link to="/login" className="btn-submit" style={{ marginRight: '10px' }}>
                                    Đến trang đăng nhập
                                </Link>
                                <Link to="/register" className="btn-submit" style={{ background: '#6c757d' }}>
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
