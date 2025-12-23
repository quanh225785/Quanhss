import React, { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Search,
  Loader2,
  Check,
  AlertCircle,
  Map,
} from "lucide-react";
import { api } from "../../utils/api";
import MapPicker from "../agent/MapPicker";

const AddLocationModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    refId: "",
    latitude: null,
    longitude: null,
    cityId: null,
    cityName: "",
    districtId: null,
    districtName: "",
    wardId: null,
    wardName: "",
    houseNumber: "",
    streetName: "",
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Request user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting user location:", error);
        setLocationError(
          "Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí hoặc thử lại."
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Autocomplete search via backend proxy
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    if (!userLocation) {
      setError("Đang lấy vị trí của bạn. Vui lòng đợi...");
      return;
    }

    setIsSearching(true);
    try {
      // Call backend proxy with user location as focus
      const focus = `${userLocation.lat},${userLocation.lng}`;
      const response = await api.get("/vietmap/autocomplete", {
        params: { query, focus },
      });

      if (response.data.code === 1000) {
        setSearchResults(response.data.result || []);
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error("Error searching locations:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Get place details via backend proxy
  const getPlaceDetails = async (refId) => {
    try {
      // Call backend proxy instead of Vietmap directly
      const response = await api.get(`/vietmap/place/${refId}`);

      if (response.data.code === 1000) {
        return response.data.result;
      }
      return null;
    } catch (err) {
      console.error("Error getting place details:", err);
      return null;
    }
  };

  // Helper to extract the reference id from Vietmap result (supports both snake_case and camelCase)
  const extractRefId = (obj) => {
    if (!obj) return null;
    return obj.refId ?? obj.ref_id ?? obj.refid ?? obj.ref ?? null;
  };

  // Reverse geocoding when map location is selected
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await api.get("/vietmap/reverse", {
        params: { lat, lng },
      });

      if (
        response.data.code === 1000 &&
        response.data.result &&
        response.data.result.length > 0
      ) {
        const location = response.data.result[0];

        // Get full details
        const ref = extractRefId(location);
        console.log("Reverse-geocode found refId=", ref);
        const details = ref ? await getPlaceDetails(ref) : null;

        if (details) {
          setFormData((prev) => ({
            ...prev,
            name: location.name || location.display || prev.name,
            address: location.display || location.address || prev.address,
            refId: location.refId || "",
            latitude: lat,
            longitude: lng,
            cityId: details.cityId || null,
            cityName: details.city || "",
            districtId: details.districtId || null,
            districtName: details.district || "",
            wardId: details.wardId || null,
            wardName: details.ward || "",
            houseNumber: details.hsNum || "",
            streetName: details.street || "",
          }));
          setSearchQuery(location.display || location.name);
        }
      }
    } catch (err) {
      console.error("Error reverse geocoding:", err);
      // Still update coordinates even if reverse geocoding fails
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    }
  };

  const handleMapLocationSelect = ({ lat, lng }) => {
    console.log(
      "Map selection: lat=%s, lng=%s — starting reverse geocode",
      lat,
      lng
    );
    reverseGeocode(lat, lng);
  };

  const handleSelectLocation = async (location) => {
    setSelectedLocation(location);
    setShowSearchResults(false);

    console.log("Search selection: ", {
      name: location.name || location.display,
      address: location.address || location.display,
      refId: location.refId,
      raw: location,
    });

    // Get detailed information
    const ref = extractRefId(location);
    console.log("Extracted ref id for search selection:", ref);
    const details = ref ? await getPlaceDetails(ref) : null;

    if (details) {
      console.log("Place details fetched:", {
        lat: details.lat,
        lng: details.lng,
        hsNum: details.hsNum,
        city: details.city,
        district: details.district,
      });
      setFormData({
        name: location.name || location.display || "",
        address: location.display || location.address || "",
        description: formData.description,
        refId: extractRefId(location) || "",
        latitude: details.lat || null,
        longitude: details.lng || null,
        cityId: details.cityId || null,
        cityName: details.city || "",
        districtId: details.districtId || null,
        districtName: details.district || "",
        wardId: details.wardId || null,
        wardName: details.ward || "",
        houseNumber: details.hsNum || "",
        streetName: details.street || "",
      });
      setSearchQuery(location.display || location.name);
    }
  };

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[AddLocationModal] Submit started");
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.address || !formData.description) {
      console.log(
        "[AddLocationModal] Validation failed: missing required fields"
      );
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      setIsSubmitting(false);
      return;
    }

    // Validate coordinates (required)
    if (!formData.latitude || !formData.longitude) {
      console.log("[AddLocationModal] Validation failed: missing coordinates");
      setError(
        "Vui lòng chọn địa điểm trên bản đồ hoặc tìm kiếm để lấy tọa độ"
      );
      setIsSubmitting(false);
      return;
    }

    console.log(
      "[AddLocationModal] Validation passed, sending request:",
      formData
    );

    try {
      // Admin creates location directly (auto-approved) via POST /locations
      const response = await api.post("/locations", formData);
      console.log("[AddLocationModal] Response received:", response.data);

      if (response.data.code === 1000) {
        console.log(
          "[AddLocationModal] Success! Location created:",
          response.data.result
        );
        setSuccess(true);
        setTimeout(() => {

          onSuccess();
        }, 1500);
      } else {
        console.log(
          "[AddLocationModal] Unexpected response code:",
          response.data.code
        );
      }
    } catch (err) {
      console.error("[AddLocationModal] Error creating location:", err);
      console.error("[AddLocationModal] Error response:", err.response?.data);
      console.error("[AddLocationModal] Error status:", err.response?.status);
      setError(
        err.response?.data?.message ||
        "Không thể tạo địa điểm. Vui lòng thử lại."
      );
    } finally {
      console.log("[AddLocationModal] Submit finished, isSubmitting = false");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              Thêm địa điểm mới
            </h2>
            <p className="text-sm text-zinc-500">
              Địa điểm sẽ được tự động duyệt và thêm vào hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Location Status */}
          {locationError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-sm text-amber-800">{locationError}</p>
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="mt-2 text-sm font-medium text-amber-900 underline hover:no-underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {isGettingLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="text-blue-600 animate-spin" size={20} />
              <p className="text-sm text-blue-800">
                Đang lấy vị trí của bạn...
              </p>
            </div>
          )}

          {userLocation && !locationError && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
              <Check
                className="text-emerald-600 flex-shrink-0 mt-0.5"
                size={16}
              />
              <p className="text-sm text-emerald-800">
                Vị trí hiện tại: {userLocation.lat.toFixed(6)},{" "}
                {userLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Toggle View Buttons */}
          <div className="flex gap-2 border-b border-zinc-200 pb-4">
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showMap
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
            >
              <Search size={16} />
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showMap
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
            >
              <Map size={16} />
              Bản đồ
            </button>
          </div>

          {/* Search Section */}
          {!showMap && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900">
                Tìm kiếm địa điểm
              </label>
              {!userLocation ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-zinc-600">
                    Vui lòng cho phép truy cập vị trí để tìm kiếm địa điểm gần
                    bạn
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nhập tên địa điểm hoặc địa chỉ..."
                      className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      disabled={!userLocation}
                    />
                    {isSearching && (
                      <Loader2
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin"
                        size={18}
                      />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectLocation(result)}
                          className="w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin
                              className="text-zinc-400 flex-shrink-0 mt-1"
                              size={16}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-900 truncate">
                                {result.name || result.display}
                              </p>
                              <p className="text-xs text-zinc-500 truncate">
                                {result.address}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                      <Check
                        className="text-emerald-600 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p className="text-sm text-emerald-800">
                        Đã chọn:{" "}
                        <span className="font-medium">
                          {selectedLocation.display}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Map Section */}
          {showMap && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900">
                Chọn vị trí trên bản đồ
              </label>
              <MapPicker
                onLocationSelect={handleMapLocationSelect}
                selectedLocation={formData}
              />
            </div>
          )}

          <div className="border-t border-zinc-200 pt-6">
            <p className="text-sm font-medium text-zinc-700 mb-4">
              Nhập thông tin địa điểm
            </p>

            {/* Name */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-zinc-900">
                Tên địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleManualInput}
                placeholder="VD: Chùa Một Cột, Bảo tàng Hồ Chí Minh..."
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-zinc-900">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleManualInput}
                placeholder="VD: Chùa Một Cột, Ba Đình, Hà Nội"
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-zinc-900">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleManualInput}
                placeholder="Mô tả về địa điểm, điểm nổi bật..."
                rows={4}
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
              />
            </div>

            {/* Coordinates Display (if available) */}
            {formData.latitude && formData.longitude && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                <p className="text-xs font-medium text-zinc-700 mb-1">Tọa độ</p>
                <p className="text-xs text-zinc-600">
                  Vĩ độ: {formData.latitude} | Kinh độ: {formData.longitude}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="text-emerald-600 flex-shrink-0" size={20} />
              <p className="text-sm text-emerald-800">
                Địa điểm đã được thêm thành công và tự động duyệt!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Đang tạo...
                </>
              ) : (
                "Thêm địa điểm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationModal;
