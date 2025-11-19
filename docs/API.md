# Bảng Kế Hoạch Tính Năng Web Du Lịch (Theo Timeline)

| STT | Feature Group | Feature | Actor | Description | Related Screen | Related DB Tables | API |
|-----|---------------|---------|-------|-------------|----------------|-------------------|-----|
| 1 | Quản lý người dùng | Đăng ký tài khoản | Customer, Agent | Tạo tài khoản mới để sử dụng trang web | Register | User, VerifyEmail | /api/users/signup |
| 2 | Quản lý người dùng | Đăng nhập | Customer, Agent, Admin | Xác thực người dùng vào hệ thống | Login | User, Session | /api/users/login |
| 3 | Quản lý người dùng | Quên/đổi mật khẩu | Customer, Agent | Khôi phục hoặc thay đổi mật khẩu | ForgotPassword, ResetPassword | User, PasswordReset | /api/users/forgot-password |
| 4 | Quản lý người dùng | Quản lý tài khoản cá nhân | Customer, Agent | Xem và cập nhật thông tin tài khoản | Profile | User, Profile | /api/users/profile |
| 5 | Quản lý người dùng | Phân quyền tài khoản | Admin | Phân quyền theo vai trò (Admin, Agent, Customer) | UserManagement | User, Role, Permission | /api/users/roles |
| 6 | Quản lý người dùng | Duyệt/khóa/mở tài khoản | Admin | Quản lý trạng thái tài khoản Agent và Customer | UserManagement | User | /api/users/{id}/status |
| 7 | Quản lý địa điểm | Thêm địa điểm | Admin | Tạo mới địa điểm du lịch | LocationManagement | Location, LocationImage | /api/locations |
| 8 | Quản lý địa điểm | Sửa địa điểm | Admin | Cập nhật thông tin địa điểm | LocationManagement | Location, LocationImage | /api/locations/{id} |
| 9 | Quản lý địa điểm | Xóa địa điểm | Admin | Xóa địa điểm khỏi hệ thống | LocationManagement | Location | /api/locations/{id} |
| 10 | Quản lý địa điểm | Đề xuất địa điểm | Customer, Agent | Gửi đề xuất địa điểm mới | LocationSuggestion | LocationSuggestion | /api/locations/suggestions |
| 11 | Quản lý địa điểm | Duyệt địa điểm đề xuất | Admin | Phê duyệt địa điểm do Customer/Agent đề xuất | LocationApproval | LocationSuggestion, Location | /api/locations/suggestions/{id}/approve |
| 12 | Quản lý tour | Tạo tour | Agent | Tạo tour du lịch mới | TourCreation | Tour, TourLocation, TourImage | /api/tours |
| 13 | Quản lý tour | Sửa tour | Agent, Admin | Cập nhật thông tin tour | TourEdit | Tour, TourLocation, TourImage | /api/tours/{id} |
| 14 | Quản lý tour | Liên kết địa điểm với tour | Agent | Thêm địa điểm vào lịch trình tour | TourLocationManagement | TourLocation | /api/tours/{id}/locations |
| 15 | Quản lý tour | Gửi yêu cầu duyệt tour | Agent | Gửi tour để Admin phê duyệt | TourSubmission | Tour | /api/tours/{id}/submit |
| 16 | Quản lý tour | Duyệt tour | Admin | Phê duyệt tour từ Agent | TourApproval | Tour | /api/tours/{id}/approve |
| 17 | Quản lý tour | Quản lý trạng thái tour | Admin | Điều chỉnh trạng thái hiển thị/ẩn, tạm dừng tour | TourManagement | Tour | /api/tours/{id}/status |
| 18 | Tìm kiếm | Tìm kiếm tour | Customer | Tìm kiếm tour theo điều kiện | SearchTours | Tour, Location | /api/tours/search |
| 19 | Tìm kiếm | Tìm kiếm địa điểm | Customer | Tìm kiếm địa điểm du lịch | SearchLocations | Location | /api/locations/search |
| 20 | Đặt tour | Đặt tour trực tuyến | Customer | Đặt tour với lịch khởi hành và số lượng người | BookingForm | Booking, BookingDetail | /api/bookings |
| 21 | Đặt tour | Thanh toán trực tuyến | Customer | Thanh toán cho tour đã đặt | Payment | Payment, Booking | /api/payments |
| 22 | Quản lý đơn đặt | Xem lịch sử đặt tour | Customer | Xem các tour đã đặt | BookingHistory | Booking, BookingDetail | /api/bookings/history |
| 23 | Quản lý đơn đặt | Quản lý đơn đặt | Admin | Xem, lọc, xác nhận/hủy đơn | BookingManagement | Booking, BookingDetail, Payment | /api/bookings/manage |
| 24 | Quản lý đơn đặt | Xử lý đổi lịch | Admin | Xử lý yêu cầu thay đổi lịch của khách | BookingReschedule | Booking, BookingChange | /api/bookings/{id}/reschedule |
| 25 | Quản lý đơn đặt | Xử lý hoàn tiền | Admin | Xử lý hoàn tiền khi hủy tour | RefundManagement | Refund, Payment | /api/bookings/{id}/refund |
| 26 | Tương tác | Đánh giá tour | Customer | Đánh giá tour sau khi hoàn thành | ReviewForm | Review, Rating | /api/reviews |
| 27 | Tương tác | Bình luận tour | Customer | Bình luận về tour | CommentSection | Comment | /api/comments |
| 28 | Tương tác | Trả lời đánh giá | Agent | Phản hồi đánh giá của khách hàng | ReviewResponse | ReviewReply | /api/reviews/{id}/reply |
| 29 | Gợi ý | Gợi ý tour theo lịch sử | Customer | Hiển thị tour gợi ý dựa trên lịch sử đặt | Recommendations | UserBehavior, Booking | /api/recommendations/history |
| 30 | Gợi ý | Gợi ý tour theo vị trí | Customer | Gợi ý tour gần vị trí hiện tại | LocationBasedRecommendations | Location, Tour | /api/recommendations/location |
| 31 | Lập kế hoạch | Lập kế hoạch chuyến đi | Customer | Tạo kế hoạch tham quan cá nhân hóa | TripPlanner | TripPlan, TripPlanLocation | /api/trip-planner |
| 32 | Lập kế hoạch | Gợi ý thứ tự tham quan | Customer | Tối ưu thứ tự các điểm tham quan | RouteOptimization | TripPlan, Location | /api/trip-planner/optimize |
| 33 | Thông báo | Thông báo email đặt tour | Customer | Gửi email xác nhận khi đặt tour | EmailNotification | EmailTemplate, Booking | /api/notifications/email |
| 34 | Thông báo | Thông báo in-app | Customer | Thông báo trong ứng dụng | InAppNotification | Notification | /api/notifications |
| 35 | Báo cáo | Dashboard Admin | Admin | Thống kê tổng quan hệ thống | AdminDashboard | Booking, Tour, User | /api/admin/dashboard |
| 36 | Báo cáo | Dashboard Agent | Agent | Thống kê tour và doanh thu của Agent | AgentDashboard | Booking, Tour | /api/agent/dashboard |
| 37 | Báo cáo | Báo cáo doanh thu | Admin, Agent | Báo cáo chi tiết về doanh thu | RevenueReport | Payment, Booking | /api/reports/revenue |
| 38 | Báo cáo | Báo cáo tỉ lệ hủy | Admin, Agent | Thống kê tỉ lệ hủy tour | CancellationReport | Booking | /api/reports/cancellation |
| 39 | Hỗ trợ | Gửi yêu cầu hỗ trợ | Customer | Gửi yêu cầu hỗ trợ về tour | SupportRequest | SupportTicket | /api/support/tickets |
| 40 | Quản lý nội dung | Thêm/sửa bài viết | Admin | Quản lý nội dung trang web | ContentManagement | Article, ArticleImage | /api/articles |

