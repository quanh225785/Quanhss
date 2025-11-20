import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './Auth.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        dob: '',
        password: '',
        confirmPassword: '',
        role: 'USER' // Mặc định là USER
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validate password
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);

        try {
            // Backend expects user creation at POST /api/users
            await api.post('/users', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                // backend expects LocalDate: use YYYY-MM-DD string from input[type=date]
                dob: formData.dob || null,
                password: formData.password,
                role: formData.role // Gửi role đã chọn
            });

            // Show success message
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <Link to="/" className="back-link">← Quay lại trang chủ</Link>
                    <h1>Đăng ký</h1>
                    <p>Tạo tài khoản mới để bắt đầu hành trình của bạn</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && (
                    <div className="success-message">
                        <h3>Đăng ký thành công!</h3>
                        <p>Chúng tôi đã gửi email xác thực đến <strong>{formData.email}</strong></p>
                        <p>Vui lòng kiểm tra hộp thư và nhấp vào link xác thực để kích hoạt tài khoản.</p>
                        <p style={{ fontSize: '14px', marginTop: '15px' }}>Nếu không thấy email, hãy kiểm tra thư mục spam.</p>
                        <Link to="/login" className="btn-submit" style={{ marginTop: '20px', display: 'inline-block' }}>Đến trang đăng nhập</Link>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="firstName">Họ</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Nhập họ"
                                required
                            />

                            <label htmlFor="lastName">Tên</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Nhập tên"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Chọn tên người dùng"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email của bạn"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Loại tài khoản</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}
                                required
                            >
                                <option value="USER">👤 Người dùng (USER)</option>
                                <option value="AGENT">🏢 Đại lý (AGENT)</option>
                            </select>
                            <small style={{ color: '#666', fontSize: '14px', marginTop: '5px', display: 'block' }}>
                                {formData.role === 'USER'
                                    ? 'Tài khoản người dùng thông thường - có thể đặt tour, xem địa điểm'
                                    : 'Tài khoản đại lý - có thể quản lý địa điểm, tour du lịch'}
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dob">Ngày sinh</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
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
                                placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
