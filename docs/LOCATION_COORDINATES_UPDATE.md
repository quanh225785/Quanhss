# Cập nhật: Bắt buộc tọa độ khi đề xuất địa điểm

## Tổng quan
Đã triển khai yêu cầu bắt buộc **user phải cung cấp vị trí hiện tại** và **địa điểm được đề xuất phải có tọa độ** từ VietMap API khi tạo location suggestion.

## Các thay đổi chính

### 1. Backend Changes

#### A. Error Codes mới (`ErrorCode.java`)
```java
COORDINATES_REQUIRED(1017, "Latitude and longitude are required for location suggestion", HttpStatus.BAD_REQUEST)
USER_LOCATION_REQUIRED(1018, "User current location is required for searching nearby places", HttpStatus.BAD_REQUEST)
```

#### B. Validation trong `LocationSuggestionRequest.java`
- **Trước**: `latitude` và `longitude` là optional
- **Sau**: Bắt buộc với `@NotNull` annotation
```java
@jakarta.validation.constraints.NotNull(message = "COORDINATES_REQUIRED")
Double latitude;

@jakarta.validation.constraints.NotNull(message = "COORDINATES_REQUIRED")
Double longitude;
```

#### C. LocationSuggestionService
- Thêm validation double-check cho coordinates
- Log coordinates khi tạo suggestion
```java
if (request.getLatitude() == null || request.getLongitude() == null) {
    throw new AppException(ErrorCode.COORDINATES_REQUIRED);
}
```

#### D. VietmapController
- **Trước**: `focus` parameter (user location) là optional
- **Sau**: Bắt buộc `@RequestParam(required = true)`
```java
@GetMapping("/autocomplete")
ApiResponse<List<VietmapAutocompleteResponse>> autocomplete(
    @RequestParam String query, 
    @RequestParam(required = true) String focus
)
```

### 2. Frontend Changes (`AddLocationModal.jsx`)

#### A. User Location Management
- **Tự động yêu cầu** vị trí của user khi mở modal
- Sử dụng browser's Geolocation API
- Hiển thị status: loading, success, error

```javascript
const [userLocation, setUserLocation] = useState(null);
const [locationError, setLocationError] = useState(null);
const [isGettingLocation, setIsGettingLocation] = useState(false);

useEffect(() => {
    getUserLocation();
}, []);
```

#### B. Search với User Location
- Autocomplete API **bắt buộc** phải có user location (focus parameter)
- Disable search nếu chưa có user location
```javascript
if (!userLocation) {
    setError('Đang lấy vị trí của bạn. Vui lòng đợi...');
    return;
}

const focus = `${userLocation.lat},${userLocation.lng}`;
const response = await api.get('/vietmap/autocomplete', {
    params: { query, focus }
});
```

#### C. Validation trước khi Submit
- Kiểm tra coordinates có tồn tại không
```javascript
if (!formData.latitude || !formData.longitude) {
    setError('Vui lòng chọn địa điểm trên bản đồ hoặc tìm kiếm để lấy tọa độ');
    return;
}
```

#### D. UI Updates
1. **User Location Status Section**
   - Loading indicator khi đang lấy vị trí
   - Success message hiển thị coordinates
   - Error message với nút "Thử lại"

2. **Search Input**
   - Disabled khi chưa có user location
   - Placeholder message yêu cầu cho phép truy cập vị trí

## Workflow mới

### Khi user mở modal đề xuất địa điểm:

1. **Browser tự động yêu cầu permission** truy cập vị trí
2. **User cho phép** → Hiển thị user location (lat, lng)
3. **User từ chối** → Hiển thị error message với nút "Thử lại"

### Khi user tìm kiếm địa điểm:

1. Nhập từ khóa (tối thiểu 3 ký tự)
2. Frontend gửi request với `focus={userLat},{userLng}`
3. VietMap API trả về kết quả **gần user location**
4. User chọn địa điểm → Tự động lấy coordinates

### Khi user chọn trên bản đồ:

1. Click vào map
2. Reverse geocoding lấy thông tin địa điểm
3. Tự động điền coordinates

### Khi user submit:

1. **Backend validation**: Kiểm tra `latitude` và `longitude` không null
2. Lưu vào database với đầy đủ coordinates
3. Log coordinates để tracking

## Lợi ích

✅ **Đảm bảo data quality**: Mọi location suggestion đều có tọa độ chính xác từ VietMap
✅ **Tìm kiếm chính xác hơn**: Kết quả search ưu tiên địa điểm gần user
✅ **Trải nghiệm tốt hơn**: User thấy kết quả relevant với vị trí của họ
✅ **Dễ dàng hiển thị trên map**: Có coordinates sẵn để render markers
✅ **Hỗ trợ tính năng tương lai**: Distance calculation, nearby recommendations

## Testing

### Test Cases cần kiểm tra:

1. ✅ **Happy Path**: User cho phép location → Tìm kiếm → Chọn địa điểm → Submit thành công
2. ✅ **User từ chối location**: Hiển thị error, có thể retry
3. ✅ **Submit không có coordinates**: Backend trả về error COORDINATES_REQUIRED
4. ✅ **Search không có user location**: Frontend block với error message
5. ✅ **Chọn trên map**: Reverse geocoding tự động điền coordinates

## API Examples

### Autocomplete với user location:
```http
GET /vietmap/autocomplete?query=chùa một cột&focus=21.028511,105.804817
```

### Submit location suggestion:
```http
POST /locations/suggestions
{
  "name": "Chùa Một Cột",
  "address": "Đường Chùa Một Cột, Ba Đình, Hà Nội",
  "description": "Di tích lịch sử nổi tiếng...",
  "latitude": 21.0352778,
  "longitude": 105.8347222,
  "refId": "vm:POI:XXXXX",
  "cityId": 1,
  "cityName": "Hà Nội",
  ...
}
```

### Error Response nếu thiếu coordinates:
```json
{
  "code": 1017,
  "message": "Latitude and longitude are required for location suggestion"
}
```

## Migration Notes

⚠️ **Breaking Change**: API `/vietmap/autocomplete` bây giờ **bắt buộc** parameter `focus`

Các client cũ cần update để:
1. Request user location permission
2. Truyền `focus` parameter vào autocomplete API
3. Validate coordinates trước khi submit location suggestion

## Files Changed

### Backend:
- `ErrorCode.java` - Thêm 2 error codes mới
- `LocationSuggestionRequest.java` - Thêm @NotNull cho lat/lng
- `LocationSuggestionService.java` - Thêm validation và logging
- `VietmapController.java` - Bắt buộc focus parameter

### Frontend:
- `AddLocationModal.jsx` - User location management + validation

## Next Steps (Optional Enhancements)

1. **Fallback location**: Nếu user từ chối permission, cho phép chọn thành phố mặc định
2. **Location accuracy indicator**: Hiển thị độ chính xác của GPS
3. **Recent locations**: Cache vị trí gần đây để improve UX
4. **Offline support**: Cache coordinates của địa điểm đã search
