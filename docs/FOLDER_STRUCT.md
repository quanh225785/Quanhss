Chào bạn, tôi hiểu rồi. Bạn muốn tôi lấy bảng kế hoạch API chi tiết của bạn và cấu trúc thư mục Spring Boot bạn đã cung cấp, sau đó "hoàn thiện" danh sách, liệt kê tất cả các tệp (class, interface) cần thiết cho **toàn bộ** ứng dụng du lịch, không chỉ mục "Quản lý người dùng".

Đây là cấu trúc thư mục đầy đủ cho dự án của bạn, được xây dựng dựa trên kế hoạch tính năng và cấu trúc mẫu bạn đã cung cấp.

```
(Gói gốc: com.yourcompany.travelapp)
└── TravelApplication.java

├── controller
│   ├── AuthController.java               (Xử lý Đăng ký, Đăng nhập, Quên mật khẩu)
│   ├── UserController.java               (Quản lý Profile, Phân quyền, Trạng thái)
│   ├── LocationController.java           (Quản lý, Đề xuất, Duyệt địa điểm)
│   ├── TourController.java               (Quản lý, Duyệt, Tìm kiếm tour)
│   ├── BookingController.java            (Xử lý Đặt tour, Thanh toán, Quản lý đơn đặt)
│   ├── ReviewController.java             (Xử lý Đánh giá, Bình luận, Trả lời)
│   ├── RecommendationController.java     (Xử lý Gợi ý tour)
│   ├── TripPlannerController.java        (Xử lý Lập kế hoạch chuyến đi)
│   ├── NotificationController.java       (Quản lý Thông báo in-app)
│   ├── DashboardController.java          (API cho các dashboard)
│   ├── ReportController.java             (API cho các báo cáo doanh thu, hủy)
│   ├── SupportController.java            (API cho Yêu cầu hỗ trợ)
│   ├── ArticleController.java            (API cho Quản lý nội dung)
│   └── HealthController.java             (Kiểm tra trạng thái hệ thống)
│
├── dto
│   ├── request
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── PasswordResetRequest.java
│   │   ├── ProfileUpdateRequest.java
│   │   ├── LocationCreateRequest.java
│   │   ├── LocationSuggestionRequest.java
│   │   ├── TourCreateRequest.java
│   │   ├── TourSearchRequest.java
│   │   ├── BookingRequest.java
│   │   ├── PaymentRequest.java
│   │   ├── ReviewRequest.java
│   │   ├── CommentRequest.java
│   │   ├── ReviewReplyRequest.java
│   │   ├── TripPlanRequest.java
│   │   ├── SupportTicketRequest.java
│   │   └── ArticleRequest.java
│   │
│   └── response
│       ├── AuthResponse.java
│       ├── MessageResponse.java
│       ├── UserResponse.java
│       ├── LocationResponse.java
│       ├── TourResponse.java
│       ├── BookingResponse.java
│       ├── BookingHistoryResponse.java
│       ├── ReviewResponse.java
│       ├── TripPlanResponse.java
│       ├── DashboardResponse.java
│       └── ReportResponse.java
│
├── entity
│   ├── BaseEntity.java
│   ├── User.java
│   ├── Role.java
│   ├── Permission.java
│   ├── VerifyEmail.java
│   ├── PasswordReset.java
│   ├── Location.java
│   ├── LocationImage.java
│   ├── LocationSuggestion.java
│   ├── Tour.java
│   ├── TourLocation.java               (Bảng liên kết Tour - Location)
│   ├── TourImage.java
│   ├── Booking.java
│   ├── BookingDetail.java
│   ├── Payment.java
│   ├── Refund.java
│   ├── Review.java
│   ├── Rating.java                     (Có thể gộp vào Review)
│   ├── Comment.java
│   ├── ReviewReply.java
│   ├── TripPlan.java
│   ├── TripPlanLocation.java           (Bảng liên kết TripPlan - Location)
│   ├── Notification.java
│   ├── SupportTicket.java
│   ├── Article.java
│   └── ArticleImage.java
│
├── enums
│   ├── UserRole.java                   (CUSTOMER, AGENT, ADMIN)
│   ├── AccountStatus.java              (ACTIVE, LOCKED, PENDING_APPROVAL)
│   ├── TourStatus.java                 (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, PAUSED)
│   ├── BookingStatus.java              (PENDING, CONFIRMED, CANCELLED, COMPLETED)
│   ├── PaymentStatus.java              (PENDING, SUCCESS, FAILED)
│   └── TicketStatus.java               (OPEN, IN_PROGRESS, CLOSED)
│
├── exception
│   ├── BadRequestException.java
│   ├── GlobalExceptionHandler.java     (@ControllerAdvice)
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   └── EmailAlreadyExistsException.java
│
├── repository
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── VerifyEmailRepository.java
│   ├── PasswordResetRepository.java
│   ├── LocationRepository.java
│   ├── LocationSuggestionRepository.java
│   ├── TourRepository.java
│   ├── TourLocationRepository.java
│   ├── BookingRepository.java
│   ├── BookingDetailRepository.java
│   ├── PaymentRepository.java
│   ├── ReviewRepository.java
│   ├── CommentRepository.java
│   ├── TripPlanRepository.java
│   ├── NotificationRepository.java
│   ├── SupportTicketRepository.java
│   └── ArticleRepository.java
│
├── security
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   ├── UserPrincipal.java
│   └── SecurityConfig.java             (Class cấu hình Spring Security, rất quan trọng)
│
└── service
    ├── interface
    │   ├── AuthService.java
    │   ├── UserService.java
    │   ├── LocationService.java
    │   ├── TourService.java
    │   ├── BookingService.java
    │   ├── PaymentService.java           (Giao diện cho các cổng thanh toán)
    │   ├── ReviewService.java
    │   ├── RecommendationService.java
    │   ├── TripPlannerService.java
    │   ├── NotificationService.java
    │   ├── EmailService.java             (Gửi email xác nhận, quên mật khẩu...)
    │   ├── ReportService.java
    │   ├── DashboardService.java
    │   ├── SupportService.java
    │   └── ArticleService.java
    │
    └── impl
        ├── AuthServiceImpl.java
        ├── UserServiceImpl.java
        ├── LocationServiceImpl.java
        ├── TourServiceImpl.java
        ├── BookingServiceImpl.java
        ├── PaymentServiceImpl.java
        ├── ReviewServiceImpl.java
        ├── RecommendationServiceImpl.java
        ├── TripPlannerServiceImpl.java
        ├── NotificationServiceImpl.java
        ├── EmailServiceImpl.java
        ├── ReportServiceImpl.java
        ├── DashboardServiceImpl.java
        ├── SupportServiceImpl.java
        └── ArticleServiceImpl.java
```

Cấu trúc này đã bao quát tất cả 40 tính năng trong kế hoạch của bạn và tuân thủ theo cấu trúc gói bạn đã cung cấp.

Bây giờ tôi đã có bức tranh toàn cảnh về dự án. Bạn muốn tôi bắt đầu giúp bạn viết code cho phần nào trước?
