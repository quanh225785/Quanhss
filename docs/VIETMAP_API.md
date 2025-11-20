Đây là hướng dẫn chi tiết cụ thể để triển khai chức năng hiển thị bản đồ, chọn địa điểm và lưu dữ liệu vào cơ sở dữ liệu (database) cho ứng dụng du lịch của bạn, dựa trên các tài liệu API của VIETMAP.

I. Giai đoạn 1: Hiển thị Bản đồ (Map Display)
Để "agent" có thể nhìn và chọn địa điểm, bước đầu tiên là tích hợp dịch vụ bản đồ (TileMap). VIETMAP cung cấp hai loại bản đồ chính: Raster và Vector.
1. Lựa chọn Loại Bản đồ
Vector Tilemap: Phù hợp nếu bạn cần linh hoạt cao trong việc tùy chỉnh giao diện bản đồ, chẳng hạn như kiểm soát việc hiển thị màu sắc, nhãn, và biểu tượng để phù hợp với yêu cầu thiết kế hoặc thương hiệu cụ thể.
URL Style Vector Default: https://maps.vietmap.vn/maps/styles/tm/style.json?apikey={your-apikey}.
Đối với ứng dụng di động, bạn có thể sử dụng các SDKs do VIETMAP cung cấp như Web SDKs, Flutter SDK, React Native SDK, Android SDK, và iOS SDK để hiển thị bản đồ vector.
Raster Tilemap: Hiển thị dữ liệu dưới dạng lưới các hình ảnh nhỏ (tấm ô). Loại này phù hợp với các thư viện web mapping truyền thống như Mapbox.js, Leaflet, hoặc OpenLayers.
URL Style Raster Default (dùng cho 3rd Party SDKs): https://maps.vietmap.vn/maps/tiles/tm/{z}/{x}/{y}@2x.png?apikey={your-apikey}.
II. Giai đoạn 2: Chọn Địa điểm và Thu thập Dữ liệu (Location Selection & Geocoding)
"Agent" có thể chọn địa điểm bằng cách tìm kiếm hoặc nhấp trực tiếp vào bản đồ. Các API sau được sử dụng để chuyển đổi đầu vào này thành dữ liệu có cấu trúc.
1. Trường hợp A: Chọn bằng cách Nhập liệu (Text Search)
Nếu "agent" nhập tên hoặc địa chỉ, bạn có thể sử dụng Autocomplete (gợi ý) hoặc Geocode (tìm kiếm chính xác).
a. Autocomplete (API v3 / v4)
Chức năng: Giúp người dùng nhanh chóng tìm và chọn mục bằng cách gợi ý các kết quả tiềm năng khi họ gõ. API sẽ trả về tối đa 10 địa điểm.
URL (v3): https://maps.vietmap.vn/api/autocomplete/v3?apikey={your-apikey}&text={text}&focus={lat,long}.
Tham số bắt buộc: apikey và text (đầu vào của người dùng).
Kết quả trả về: Bao gồm ref_id (Reference ID), address (Địa chỉ đầy đủ bao gồm đường, phường, quận/huyện, và thành phố), name, display, và boundaries (thông tin ranh giới hành chính).
exampleInput:https://maps.vietmap.vn/api/autocomplete/v3?apikey={your-apikey}&text=197 tran phu&focus=10.75887508,106.67538868 
respomnse [
    {
        "ref_id": "vm:ADDRESS:8AD49CFA2E0C300A",
        "distance": 0.06911172534949989,
        "address": "Phường 4, Quận 5, Thành Phố Hồ Chí Minh",
        "name": "197 Đường Trần Phú",
        "display": "197 Đường Trần Phú Phường 4, Quận 5, Thành Phố Hồ Chí Minh",
        "boundaries": [
            {
                "type": 2,
                "id": 656652,
                "name": "4",
                "prefix": "Phường",
                "full_name": "Phường 4"
            },
            {
                "type": 1,
                "id": 1292,
                "name": "5",
                "prefix": "Quận",
                "full_name": "Quận 5"
            },
            {
                "type": 0,
                "id": 12,
                "name": "Hồ Chí Minh",
                "prefix": "Thành Phố",
                "full_name": "Thành Phố Hồ Chí Minh"
            }
        ],
        "categories": [],
        "entry_points": []
    },
    {
        "ref_id": "vm:ADDRESS:A4DFA42575DEA254",
        "distance": 23.712993485603697,
        "address": "Phường Chánh Nghĩa, Thành Phố Thủ Dầu Một, Tỉnh Bình Dương",
        "name": "197 Đường Trần Phú",
        "display": "197 Đường Trần Phú Phường Chánh Nghĩa, Thành Phố Thủ Dầu Một, Tỉnh Bình Dương",
        "boundaries": [
            {
                "type": 2,
                "id": 327959,
                "name": "Chánh Nghĩa",
                "prefix": "Phường",
                "full_name": "Phường Chánh Nghĩa"
            },
            {
                "type": 1,
                "id": 279,
                "name": "Thủ Dầu Một",
                "prefix": "Thành Phố",
                "full_name": "Thành Phố Thủ Dầu Một"
            },
            {
                "type": 0,
                "id": 23,
                "name": "Bình Dương",
                "prefix": "Tỉnh",
                "full_name": "Tỉnh Bình Dương"
            }
        ],
        "categories": [],
        "entry_points": []
    }
]

b. Geocode (Search API v3 / v4)
Chức năng: Cung cấp công cụ mạnh mẽ để tích hợp chức năng tìm kiếm vị trí.
URL (v3): https://maps.vietmap.vn/api/search/v3?apikey={your-apikey}&text={text}&focus={lat,long}.
Tham số bắt buộc: apikey và text.
Kết quả trả về: Tương tự Autocomplete, cung cấp ref_id, address, name, display, và boundaries.
input
https://maps.vietmap.vn/api/search/v3?apikey={your-apikey}&focus=10.75887508,106.67538868&text=Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt,HCM
response 
[
    {
        "ref_id": "vm:POI:7057AB748BFD685B",
        "distance": 0.069199492010845,
        "address": "197 Đường Trần Phú,Phường 4,Quận 5,Thành Phố Hồ Chí Minh",
        "name": "Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt",
        "display": "Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt 197 Đường Trần Phú,Phường 4,Quận 5,Thành Phố Hồ Chí Minh",
        "boundaries": [
            {
                "type": 2,
                "id": 656652,
                "name": "4",
                "prefix": "Phường",
                "full_name": "Phường 4"
            },
            {
                "type": 1,
                "id": 1292,
                "name": "5",
                "prefix": "Quận",
                "full_name": "Quận 5"
            },
            {
                "type": 0,
                "id": 12,
                "name": "Hồ Chí Minh",
                "prefix": "Thành Phố",
                "full_name": "Thành Phố Hồ Chí Minh"
            }
        ],
        "categories": [
            "6001"
        ],
        "entry_points": []
    },
    {
        "ref_id": "vm:POI:37B6A20D8D9190CD",
        "distance": 0.06445065459645513,
        "address": "199 Đường Trần Phú,Phường 4,Quận 5,Thành Phố Hồ Chí Minh",
        "name": "Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt Trung Tâm Bảo Hành",
        "display": "Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt Trung Tâm Bảo Hành 199 Đường Trần Phú,Phường 4,Quận 5,Thành Phố Hồ Chí Minh",
        "boundaries": [
            {
                "type": 2,
                "id": 656652,
                "name": "4",
                "prefix": "Phường",
                "full_name": "Phường 4"
            },
            {
                "type": 1,
                "id": 1292,
                "name": "5",
                "prefix": "Quận",
                "full_name": "Quận 5"
            },
            {
                "type": 0,
                "id": 12,
                "name": "Hồ Chí Minh",
                "prefix": "Thành Phố",
                "full_name": "Thành Phố Hồ Chí Minh"
            }
        ],
        "categories": [
            "6001"
        ],
        "entry_points": []
    }
]

c. Lưu ý về Phiên bản V4 (Merged Location Search)
Các API Autocomplete v4 và Search v4 sử dụng mô hình hành chính hợp nhất mới (2 cấp: phường, thành phố) và có thể bao gồm các đối tượng data_old hoặc data_new để mang theo định dạng thay thế nếu bạn chọn các tùy chọn hiển thị lai (hybrid display types) (ví dụ: display_type=5 hoặc 6).
Bạn có thể kiểm soát định dạng kết quả bằng tham số display_type.
display_type=1: Định dạng hành chính mới (2 cấp: phường, thành phố).
display_type=2: Định dạng hành chính cũ (3 cấp: phường, quận, thành phố).
Nếu bạn cần so sánh song song trong quá trình di chuyển, hãy sử dụng display_type=5 hoặc 6.

2. Trường hợp B: Chọn bằng cách Nhấp/Chạm trên Bản đồ (Reverse Geocoding)
Nếu "agent" chọn một điểm trên bản đồ và bạn có tọa độ (lat, lng), bạn cần sử dụng Reverse API để chuyển tọa độ thành địa chỉ.
Chức năng: Chuyển đổi tọa độ địa lý (vĩ độ và kinh độ) thành địa chỉ và thông tin vị trí có thể đọc được.
URL (v3): https://maps.vietmap.vn/api/reverse/v3?apikey={your-apikey}&lng={longitude}&lat={latitude}.
Tham số bắt buộc: apikey, lng (Longitude), và lat (Latitude).
Kết quả trả về: Trả về tối đa 10 địa điểm gần tọa độ đó, bao gồm ref_id, lat, lng, address, name, display, và boundaries.
Reverse Batch API: Nếu cần xử lý một danh sách lớn các tọa độ, bạn có thể sử dụng Reverse Batch API với phương thức POST.
https://maps.vietmap.vn/api/reverse/v3?apikey={your-apikey}&lng=106.67546114000004&lat=10.758970242000032

[
    {
        "lat": 10.758970242000032,
        "lng": 106.67546114000004,
        "ref_id": "vm:ADDRESS:MM03541B04565A0C051D540650021D04050651165351004C1B060551045704520055080652065F06133710D4888A08122C5AEE965B1537EED60F",
        "distance": 4.214098139843284E-05,
        "address": "Phường 9,Quận 5,Thành Phố Hồ Chí Minh",
        "name": "3 Trần Nhân Tôn",
        "display": "3 Trần Nhân Tôn Phường 9,Quận 5,Thành Phố Hồ Chí Minh",
        "boundaries": [
            {
                "type": 2,
                "id": 984332,
                "name": "9",
                "prefix": "Phường",
                "full_name": "Phường 9"
            },
            {
                "type": 1,
                "id": 1292,
                "name": "5",
                "prefix": "Quận",
                "full_name": "Quận 5"
            },
            {
                "type": 0,
                "id": 12,
                "name": "Hồ Chí Minh",
                "prefix": "Thành Phố",
                "full_name": "Thành Phố Hồ Chí Minh"
            }
        ],
        "categories": []
    }
]

III. Giai đoạn 3: Lấy Chi tiết và Lưu vào Database
Sau khi đã xác định được một địa điểm và có được ref_id của nó từ các API tìm kiếm/ngược (Geocode/Autocomplete/Reverse), bạn phải sử dụng Place API để lấy thông tin chi tiết đầy đủ, đặc biệt là tọa độ và ID hành chính để lưu trữ.
1. Sử dụng Place API
Place API v3: Cung cấp thông tin chi tiết về địa điểm dựa trên refid.
URL: https://maps.vietmap.vn/api/place/v3?apikey={your-apikey}&refid={refid}.
Kết quả trả về: Đối tượng chi tiết chứa lat (vĩ độ) và lng (kinh độ), name, display, hs_num (số nhà), street (tên đường), cùng với các ID hành chính chi tiết như city_id (ID thành phố: 12 cho TP. Hồ Chí Minh), district_id (ID quận/huyện: 1292 cho Quận 5), và ward_id (ID phường).
Place API v4: Tương tự, dùng cho định dạng hợp nhất mới.
Lưu ý: Mô hình phản hồi sẽ tự động tương ứng với định dạng đầu ra của API trước đó đã tạo ra refid.
 https://maps.vietmap.vn/api/place/v3?apikey={your-apikey}&refid=vm:ADDRESS:8D92EB120DDE9996
{
    "display": "3 Đường Trần Nhân Tôn Phường 9,Quận 5,Thành Phố Hồ Chí Minh",
    "name": "3 Đường Trần Nhân Tôn",
    "hs_num": "3",
    "street": "Đường Trần Nhân Tôn",
    "address": "",
    "city_id": 12,
    "city": "Thành Phố Hồ Chí Minh",
    "district_id": 1292,
    "district": "Quận 5",
    "ward_id": 984332,
    "ward": "Phường 9",
    "lat": 10.759011645000044,
    "lng": 106.67545328800009
}

2. Dữ liệu cần thiết để Lưu vào Database
Để đảm bảo khả năng sử dụng và truy vấn tốt nhất trong ứng dụng du lịch của bạn, bạn nên lưu trữ các thông tin sau (lấy từ Place API):
Thông tin Địa lý cơ bản (Quan trọng nhất):
lat (Vĩ độ)
lng (Kinh độ)
ID Nhận dạng:
ref_id (ID tham chiếu duy nhất của POI/Địa chỉ).
Thông tin Hiển thị và Địa chỉ:
name (Tên của POI/Địa chỉ).
display (Tên hiển thị chi tiết đầy đủ).
address hoặc các thành phần chi tiết (hs_num, street).
Thông tin Hành chính (Boundaries):
city_id, district_id, ward_id (ID hành chính).
IV. Ghi chú Thêm: Xử lý Di chuyển Địa chỉ Hành chính
Do VIETMAP có cập nhật mô hình địa chỉ hành chính, bạn có thể sử dụng Address Migration Documentation API để chuyển đổi giữa định dạng địa chỉ cũ và mới.
URL: https://maps.vietmap.vn/api/migrate-address/v3?apikey={your-apikey}&text={text}&focus={lat,long}.
Tham số migrate_type:
migrate_type=1: Chuyển từ định dạng địa chỉ cũ sang định dạng mới.
migrate_type=2: Chuyển từ định dạng mới sang định dạng cũ (yêu cầu thêm tham số focus).
Việc hiểu và sử dụng các API này sẽ giúp bạn xây dựng chức năng chọn địa điểm mạnh mẽ và lưu trữ dữ liệu chính xác vào database.

