# UC_11: Duyệt địa điểm đề xuất - Implementation Summary

## Tổng quan

Use case UC_11 cho phép Admin duyệt các địa điểm được đề xuất bởi Agent/Customer, tạo bản ghi Location chính thức trong hệ thống.

## Backend Implementation

### 1. Entity Classes

- **LocationSuggestion** (`backend/src/main/java/com/devteria/identityservice/entity/LocationSuggestion.java`)

  - Lưu trữ thông tin địa điểm đề xuất
  - Trạng thái: PENDING, APPROVED, REJECTED
  - Liên kết với User (suggestedBy, reviewedBy)

- **Location** (`backend/src/main/java/com/devteria/identityservice/entity/Location.java`)
  - Lưu trữ địa điểm chính thức sau khi được duyệt
  - Có constraint unique trên trường `name`
  - Liên kết ngược với LocationSuggestion (approvedFromSuggestion)

### 2. Error Codes

Đã được định nghĩa trong `ErrorCode.java`:

```java
LOCATION_SUGGESTION_NOT_FOUND(1013, "Location suggestion not found", HttpStatus.NOT_FOUND)
LOCATION_SUGGESTION_ALREADY_PROCESSED(1014, "Location suggestion has already been processed", HttpStatus.BAD_REQUEST)
LOCATION_NAME_ALREADY_EXISTS(1015, "Location with this name already exists", HttpStatus.BAD_REQUEST)
LOCATION_NOT_FOUND(1016, "Location not found", HttpStatus.NOT_FOUND)
```

### 3. Repository Methods

**LocationRepository:**

```java
boolean existsByName(String name);
```

**LocationSuggestionRepository:**

```java
List<LocationSuggestion> findByStatus(SuggestionStatus status);
```

### 4. Service Layer

**LocationSuggestionService.approveLocationSuggestion()**

Luồng xử lý:

1. Xác thực Admin (PreAuthorize ROLE_ADMIN)
2. Tìm LocationSuggestion theo ID
   - Nếu không tìm thấy → throw `LOCATION_SUGGESTION_NOT_FOUND`
3. Kiểm tra trạng thái là PENDING
   - Nếu không phải PENDING → throw `LOCATION_SUGGESTION_ALREADY_PROCESSED`
4. Kiểm tra tên địa điểm chưa tồn tại
   - Nếu đã tồn tại → throw `LOCATION_NAME_ALREADY_EXISTS`
5. Tạo Location từ LocationSuggestion (sử dụng MapStruct)
6. Lưu Location vào database
7. Cập nhật trạng thái LocationSuggestion thành APPROVED
8. Trả về LocationResponse

### 5. Controller

**LocationController:**

```java
POST /locations/suggestions/{suggestionId}/approve
```

Response format:

```json
{
  "code": 1000,
  "result": {
    "id": 1,
    "name": "Cầu Rồng",
    "address": "...",
    "description": "...",
    "latitude": 16.0638,
    "longitude": 108.2231,
    "createdByUsername": "admin",
    "approvedFromSuggestionId": 5
  }
}
```

### 6. Security

- Endpoint yêu cầu role `ADMIN`
- Sử dụng `@PreAuthorize("hasRole('ADMIN')")`
- Token JWT được validate qua Spring Security

## Frontend Implementation

### Component: LocationManagement.jsx

Path: `frontend/src/components/admin/LocationManagement.jsx`

### Chức năng

1. **Hiển thị danh sách suggestions**

   - Fetch tất cả suggestions từ API: `GET /locations/suggestions`
   - Hiển thị theo dạng card với status badge
   - Hỗ trợ tìm kiếm theo tên, địa chỉ, người đề xuất

2. **Duyệt địa điểm (Approve)**

   - Gọi API: `POST /locations/suggestions/{id}/approve`
   - Confirm trước khi thực hiện
   - Xử lý các lỗi:
     - Tên địa điểm đã tồn tại
     - Đã được xử lý trước đó
     - Không tìm thấy
   - Refresh danh sách sau khi thành công

3. **Từ chối địa điểm (Reject)**
   - Gọi API: `POST /locations/suggestions/{id}/reject?reason=...`
   - Yêu cầu nhập lý do từ chối
   - Refresh danh sách sau khi thành công

### UI/UX Features

- Loading state với spinner
- Error handling với alert message
- Disable buttons khi đang xử lý
- Status badges (PENDING, APPROVED, REJECTED)
- Hiển thị thông tin tọa độ
- Hiển thị lý do từ chối (nếu có)
- Responsive grid layout (1/2/3 columns)

### API Integration

```javascript
import { api } from "../../utils/api";

// Fetch suggestions
const response = await api.get("/locations/suggestions");

// Approve
await api.post(`/locations/suggestions/${suggestionId}/approve`);

// Reject
await api.post(`/locations/suggestions/${suggestionId}/reject`, null, {
  params: { reason: reason.trim() },
});
```

## Testing Scenarios

### 1. Happy Path

1. Admin login
2. Agent tạo location suggestion
3. Admin vào LocationManagement
4. Click "Duyệt" trên suggestion PENDING
5. Confirm
6. ✅ Location được tạo, suggestion chuyển sang APPROVED

### 2. Error Scenarios

**Scenario A: Địa điểm đã tồn tại**

1. Đã có Location với name "Cầu Rồng"
2. Admin duyệt suggestion cũng có name "Cầu Rồng"
3. ❌ Error: "Location with this name already exists"

**Scenario B: Đã được xử lý**

1. Suggestion đã ở trạng thái APPROVED/REJECTED
2. Admin cố duyệt lại
3. ❌ Error: "Location suggestion has already been processed"

**Scenario C: Không tìm thấy**

1. suggestionId không tồn tại
2. ❌ Error: "Location suggestion not found"

## Database Schema Impact

### Bảng `location_suggestion`

- Cột `status` được update thành 'APPROVED'
- Cột `reviewed_by_user_id` được set = admin user id
- Cột `reviewed_at` được set = current timestamp

### Bảng `location`

- Tạo record mới với thông tin copy từ suggestion
- `created_by_user_id` = admin user id
- `approved_from_suggestion_id` = suggestion id
- `created_at` = current timestamp

## API Documentation

### Endpoint

```
POST /locations/suggestions/{suggestionId}/approve
```

### Headers

```
Authorization: Bearer <jwt_token>
```

### Path Parameters

- `suggestionId` (Long): ID của location suggestion

### Response Success (200)

```json
{
  "code": 1000,
  "result": {
    "id": 1,
    "name": "Cầu Rồng",
    "address": "Sông Hàn, Đà Nẵng",
    "description": "Cầu biểu tượng của Đà Nẵng",
    "refId": "vietmap_ref_123",
    "latitude": 16.0638,
    "longitude": 108.2231,
    "cityId": 48,
    "cityName": "Đà Nẵng",
    "createdAt": "2025-11-21T10:30:00",
    "createdByUsername": "admin",
    "approvedFromSuggestionId": 5
  }
}
```

### Response Error Examples

**Not Found (404)**

```json
{
  "code": 1013,
  "message": "Location suggestion not found"
}
```

**Already Processed (400)**

```json
{
  "code": 1014,
  "message": "Location suggestion has already been processed"
}
```

**Duplicate Name (400)**

```json
{
  "code": 1015,
  "message": "Location with this name already exists"
}
```

**Unauthorized (403)**

```json
{
  "code": 1007,
  "message": "You do not have permission"
}
```

## Notes

- Transaction được đảm bảo bởi `@Transactional` - nếu có lỗi, cả Location và LocationSuggestion đều không được lưu
- Logging được thực hiện sau khi approve thành công
- Frontend sử dụng shadcn/ui design pattern với Lucide icons
- Error messages được hiển thị user-friendly bằng tiếng Việt
