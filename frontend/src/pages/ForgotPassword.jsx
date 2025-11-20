import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // minimal validation
        if (!email || !email.includes('@')) {
            setError('Vui lòng nhập email hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <Link to="/" className="back-link">← Quay lại trang chủ</Link>
                    <h1>Quên mật khẩu</h1>
                    <p>Nhập email để nhận liên kết đặt lại mật khẩu</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {success ? (
                    <div className="success-message">
                        <h3>Đã gửi email</h3>
                        <p>Vui lòng kiểm tra hộp thư của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
                        <Link to="/login" className="btn-submit">Đến trang đăng nhập</Link>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button className="btn-submit" type="submit" disabled={loading}>
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Bạn nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
