# Location Suggestion Feature - Agent Frontend

## Tổng quan
Tính năng cho phép Agent đề xuất địa điểm mới vào hệ thống. Admin sẽ duyệt các đề xuất này trước khi địa điểm được thêm vào cơ sở dữ liệu chính thức.

## Các tính năng đã triển khai

### 1. **LocationProposals Component** 
Hiển thị danh sách tất cả các đề xuất địa điểm của Agent.

**Chức năng:**
- Xem danh sách đề xuất của mình
- Lọc theo trạng thái: Tất cả, Chờ duyệt, Đã duyệt, Từ chối
- Hiển thị thông tin chi tiết: tên, địa chỉ, mô tả, ngày gửi, trạng thái
- Xem lý do từ chối (nếu có)
- Mở modal để thêm đề xuất mới

### 2. **AddLocationModal Component**
Modal để thêm đề xuất địa điểm mới với tích hợp Vietmap API.

**Chức năng:**
- **Tìm kiếm địa điểm trên bản đồ**: Sử dụng Vietmap Autocomplete API v3
  - Gõ tên địa điểm hoặc địa chỉ (tối thiểu 3 ký tự)
  - Debounced search (300ms) để tối ưu hiệu suất
  - Hiển thị danh sách gợi ý từ Vietmap
  - Tự động điền thông tin chi tiết khi chọn một địa điểm
  
- **Nhập thủ công**: Nếu không tìm thấy trên bản đồ
  - Tên địa điểm (bắt buộc)
  - Địa chỉ (bắt buộc)
  - Mô tả (bắt buộc)
  
- **Dữ liệu từ Vietmap**:
  - Tọa độ (latitude, longitude)
  - Thông tin hành chính (cityId, districtId, wardId)
  - Tên đường, số nhà
  - Reference ID (refId) để lưu trữ

## Cấu hình

### 1. Backend Configuration (application.yaml)
Thêm Vietmap API key vào file `backend/src/main/resources/application.yaml`:

```yaml
vietmap:
  api:
    key: your_vietmap_api_key_here
    base-url: https://maps.vietmap.vn/api
```

### 2. Frontend Configuration (.env)
File `.env` trong thư mục `frontend/` chỉ cần:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Lấy Vietmap API Key
1. Truy cập https://maps.vietmap.vn
2. Đăng ký tài khoản
3. Tạo API key mới
4. Copy API key và dán vào `application.yaml` ở backend

**Lưu ý bảo mật:**
- API key được lưu trữ an toàn ở backend
- Frontend không bao giờ thấy hoặc gọi trực tiếp Vietmap API
- Tất cả requests đều đi qua backend proxy

## API Endpoints sử dụng

### Frontend gọi Backend APIs:

1. **Lấy danh sách đề xuất của tôi**
   - `GET /locations/suggestions/my`
   - Response: Array of LocationSuggestionResponse

2. **Tạo đề xuất mới**
   - `POST /locations/suggestions`
   - Body: LocationSuggestionRequest
   - Response: LocationSuggestionResponse

3. **Vietmap Autocomplete (Proxy)**
   - `GET /vietmap/autocomplete?query={text}`
   - Response: Array of VietmapAutocompleteResponse
   - **Backend proxy** - API key được bảo mật ở backend

4. **Vietmap Place Details (Proxy)**
   - `GET /vietmap/place/{refId}`
   - Response: VietmapPlaceResponse
   - **Backend proxy** - API key được bảo mật ở backend

### Backend gọi Vietmap APIs (internal - không expose):

1. **Autocomplete Search**
   - `GET https://maps.vietmap.vn/api/autocomplete/v3`
   - Backend service gọi với API key

2. **Place Details**
   - `GET https://maps.vietmap.vn/api/place/v3`
   - Backend service gọi với API key

## Luồng sử dụng

### Agent đề xuất địa điểm (UC_10):

1. Agent đăng nhập và vào trang "Đề xuất địa điểm"
2. Nhấn nút "Đề xuất địa điểm"
3. **Tùy chọn A: Tìm kiếm trên bản đồ**
   - Gõ tên địa điểm vào ô tìm kiếm
   - Frontend gọi `/vietmap/autocomplete` (backend proxy)
   - Backend gọi Vietmap API với API key (bảo mật)
   - Chọn từ danh sách gợi ý
   - Hệ thống tự động điền thông tin (gọi `/vietmap/place/{refId}`)
   - Thêm mô tả (bắt buộc)
   - Nhấn "Gửi đề xuất"
   
4. **Tùy chọn B: Nhập thủ công**
   - Bỏ qua tìm kiếm
   - Nhập tên, địa chỉ, mô tả
   - Nhấn "Gửi đề xuất"
   
5. Hệ thống lưu với trạng thái "PENDING"
6. Agent có thể theo dõi trạng thái đề xuất

## Cấu trúc dữ liệu

### LocationSuggestionRequest
```javascript
{
  name: string,           // Bắt buộc
  address: string,        // Bắt buộc
  description: string,    // Bắt buộc
  refId?: string,        // Optional từ Vietmap
  latitude?: number,
  longitude?: number,
  cityId?: number,
  cityName?: string,
  districtId?: number,
  districtName?: string,
  wardId?: number,
  wardName?: string,
  houseNumber?: string,
  streetName?: string
}
```

### LocationSuggestionResponse
```javascript
{
  id: number,
  name: string,
  address: string,
  description: string,
  refId?: string,
  latitude?: number,
  longitude?: number,
  // ... administrative info
  status: "PENDING" | "APPROVED" | "REJECTED",
  suggestedByUsername: string,
  createdAt: string,
  reviewedAt?: string,
  reviewedByUsername?: string,
  rejectionReason?: string
}
```

## Styling
Tuân thủ shadcn/ui design principles:
- Clean, monochrome (Zinc/Slate palette)
- Minimal borders, no gradients
- High whitespace
- Solid black/white buttons
- Simple inputs with focus rings
- Rounded corners (radius: 0.5rem)
- Font: Inter

## Xử lý lỗi

1. **Network errors**: Hiển thị thông báo lỗi màu đỏ
2. **Validation errors**: Hiển thị inline validation
3. **API errors**: Hiển thị message từ backend
4. **Vietmap API errors**: Fallback to manual input

## Testing

### Test Cases:

1. **Tìm kiếm địa điểm**
   - Gõ "Chùa Một Cột" → Hiển thị kết quả
   - Chọn một địa điểm → Tự động điền form
   
2. **Nhập thủ công**
   - Bỏ qua tìm kiếm
   - Điền thông tin → Submit thành công
   
3. **Validation**
   - Submit form trống → Hiển thị lỗi
   - Nhập mô tả < 3 ký tự → Hiển thị lỗi
   
4. **Xem danh sách**
   - Lọc theo trạng thái → Hiển thị đúng
   - Hiển thị lý do từ chối nếu status = REJECTED

## Lưu ý

1. **API Key bảo mật**: 
   - API key được lưu trữ an toàn trong `application.yaml` ở backend
   - Frontend **KHÔNG BAO GIỜ** thấy hoặc sử dụng API key
   - Tất cả requests đến Vietmap đều đi qua backend proxy
   - Không commit file `application.yaml` có API key thực vào git
   
2. **Backend Proxy Architecture**:
   - `VietmapController` nhận requests từ frontend
   - `VietmapService` gọi Vietmap API với API key
   - Trả kết quả về frontend qua `ApiResponse<T>`
   
3. **Rate limiting**: 
   - Vietmap API có giới hạn requests
   - Debounce search (300ms) ở frontend để tối ưu
   - Có thể implement caching ở backend sau này
   
4. **Fallback**: 
   - Nếu Vietmap không hoạt động, vẫn có thể nhập thủ công

## Các bước tiếp theo (cho Admin)

Để hoàn thiện hệ thống, cần triển khai:
1. **Admin Dashboard** để duyệt đề xuất (UC_11)
2. Xem danh sách pending suggestions
3. Approve hoặc Reject với lý do
4. Xem lịch sử tất cả suggestions
