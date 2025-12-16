import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Check,
  X,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { api } from "../../utils/api";
import ConfirmModal from "../shared/ConfirmModal";
import Modal from "../shared/Modal";
import AddLocationModal from "./AddLocationModal";

const LocationManagement = () => {
  const [activeTab, setActiveTab] = useState("suggestions"); // "suggestions" or "locations"
  const [suggestions, setSuggestions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSuggestions(suggestions);
      setFilteredLocations(locations);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSuggestions(
        suggestions.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.address.toLowerCase().includes(query) ||
            s.suggestedByUsername.toLowerCase().includes(query)
        )
      );
      setFilteredLocations(
        locations.filter(
          (l) =>
            l.name.toLowerCase().includes(query) ||
            l.address.toLowerCase().includes(query) ||
            (l.createdByUsername &&
              l.createdByUsername.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, suggestions, locations]);

  const fetchData = async () => {
    await Promise.all([fetchSuggestions(), fetchLocations()]);
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/locations/suggestions");
      setSuggestions(response.data.result || []);
    } catch (err) {
      console.error("[LocationManagement] Error fetching suggestions:", err);
      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách địa điểm đề xuất"
      );
    } finally {
      setLoading(false);

    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/locations");
      setLocations(response.data.result || []);
    } catch (err) {
      console.error("[LocationManagement] Error fetching locations:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách địa điểm"
      );
    } finally {
      setLoading(false);

    }
  };

  const handleApprove = async (suggestionId) => {
    setProcessingId(suggestionId);
    try {
      await api.post(`/locations/suggestions/${suggestionId}/approve`);
      alert("Địa điểm đã được duyệt thành công!");
      setShowApproveModal(false);
      setSelectedSuggestion(null);
      await fetchData(); // Refresh both suggestions and locations
    } catch (err) {
      console.error("Error approving suggestion:", err);
      const errorMsg = err.response?.data?.message;
      if (errorMsg?.includes("already exists")) {
        alert("Lỗi: Tên địa điểm này đã tồn tại trong hệ thống.");
      } else if (errorMsg?.includes("already been processed")) {
        alert("Lỗi: Địa điểm này đã được xử lý trước đó.");
      } else if (errorMsg?.includes("not found")) {
        alert("Lỗi: Không tìm thấy địa điểm đề xuất.");
      } else {
        alert(
          "Không thể duyệt địa điểm: " + (errorMsg || "Lỗi không xác định")
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (suggestionId) => {
    if (!rejectReason || rejectReason.trim() === "") {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessingId(suggestionId);
    try {
      await api.post(`/locations/suggestions/${suggestionId}/reject`, null, {
        params: { reason: rejectReason.trim() },
      });
      alert("Địa điểm đã bị từ chối!");
      setShowRejectModal(false);
      setSelectedSuggestion(null);
      setRejectReason("");
      await fetchSuggestions();
    } catch (err) {
      console.error("Error rejecting suggestion:", err);
      const errorMsg = err.response?.data?.message;
      alert(
        "Không thể từ chối địa điểm: " + (errorMsg || "Lỗi không xác định")
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openApproveModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowApproveModal(true);
  };

  const openRejectModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleAddLocationSuccess = () => {
    setShowAddLocationModal(false);
    fetchData(); // Refresh both suggestions and locations
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
      APPROVED: {
        label: "Đã duyệt",
        className: "bg-emerald-100 text-emerald-700",
      },
      REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-700" },
    };
    const config = statusMap[status] || statusMap.PENDING;
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý Địa điểm
          </h2>
          <p className="text-zinc-500">
            Duyệt địa điểm đề xuất và quản lý danh sách địa điểm.
          </p>
        </div>
        <button
          onClick={() => {

            setShowAddLocationModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus size={18} />
          Thêm địa điểm
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "suggestions"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
          >
            Địa điểm đề xuất ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "locations"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
          >
            Địa điểm hiện có ({locations.length})
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-zinc-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && (
        <>
          {filteredSuggestions.length === 0 ? (
            <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
              <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">
                {searchQuery
                  ? "Không tìm thấy địa điểm đề xuất nào"
                  : "Chưa có địa điểm đề xuất nào"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-2 bg-zinc-100 rounded-lg flex-shrink-0">
                        <MapPin className="w-5 h-5 text-zinc-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-zinc-900 truncate">
                          {loc.name}
                        </h3>
                        <p className="text-xs text-zinc-500 truncate">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(loc.status)}
                  </div>

                  {loc.description && (
                    <p className="text-sm text-zinc-600 line-clamp-2">
                      {loc.description}
                    </p>
                  )}

                  <div className="text-sm text-zinc-600">
                    Đề xuất bởi:{" "}
                    <span className="font-medium">
                      {loc.suggestedByUsername || "N/A"}
                    </span>
                  </div>

                  {loc.latitude && loc.longitude && (
                    <div className="text-xs text-zinc-500">
                      Tọa độ: {loc.latitude.toFixed(6)},{" "}
                      {loc.longitude.toFixed(6)}
                    </div>
                  )}

                  {loc.status === "PENDING" && (
                    <div className="flex gap-2 mt-auto pt-2 border-t border-zinc-100">
                      <button
                        onClick={() => openApproveModal(loc)}
                        disabled={processingId === loc.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingId === loc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Duyệt
                      </button>
                      <button
                        onClick={() => openRejectModal(loc)}
                        disabled={processingId === loc.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingId === loc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Từ chối
                      </button>
                    </div>
                  )}

                  {loc.status === "REJECTED" && loc.rejectionReason && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Lý do: {loc.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <>
          {filteredLocations.length === 0 ? (
            <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
              <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">
                {searchQuery
                  ? "Không tìm thấy địa điểm nào"
                  : "Chưa có địa điểm nào"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-zinc-900 truncate">
                          {loc.name}
                        </h3>
                        <p className="text-xs text-zinc-500 truncate">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Đã duyệt
                    </span>
                  </div>

                  {loc.description && (
                    <p className="text-sm text-zinc-600 line-clamp-2">
                      {loc.description}
                    </p>
                  )}

                  {loc.createdByUsername && (
                    <div className="text-sm text-zinc-600">
                      Tạo bởi:{" "}
                      <span className="font-medium">
                        {loc.createdByUsername}
                      </span>
                    </div>
                  )}

                  {loc.latitude && loc.longitude && (
                    <div className="text-xs text-zinc-500">
                      Tọa độ: {loc.latitude.toFixed(6)},{" "}
                      {loc.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedSuggestion(null);
        }}
        onConfirm={() =>
          selectedSuggestion && handleApprove(selectedSuggestion.id)
        }
        title="Xác nhận duyệt địa điểm"
        message={
          selectedSuggestion
            ? `Bạn có chắc chắn muốn duyệt địa điểm "${selectedSuggestion.name}"? Địa điểm sẽ được thêm vào hệ thống và có thể được sử dụng trong các tour.`
            : ""
        }
        confirmText="Duyệt"
        cancelText="Hủy"
        variant="success"
        isLoading={processingId === selectedSuggestion?.id}
      />

      {/* Reject Modal with Reason Input */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedSuggestion(null);
          setRejectReason("");
        }}
        title="Từ chối địa điểm đề xuất"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedSuggestion(null);
                setRejectReason("");
              }}
              disabled={processingId === selectedSuggestion?.id}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() =>
                selectedSuggestion && handleReject(selectedSuggestion.id)
              }
              disabled={
                processingId === selectedSuggestion?.id || !rejectReason.trim()
              }
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processingId === selectedSuggestion?.id
                ? "Đang xử lý..."
                : "Từ chối"}
            </button>
          </>
        }
      >
        {selectedSuggestion && (
          <div className="space-y-4">
            <div className="bg-zinc-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-zinc-900">
                {selectedSuggestion.name}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {selectedSuggestion.address}
              </p>
            </div>
            <div>
              <label
                htmlFor="rejectReason"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Lý do từ chối <span className="text-red-600">*</span>
              </label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối địa điểm này..."
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                rows="4"
                disabled={processingId === selectedSuggestion?.id}
              />
              {!rejectReason.trim() && (
                <p className="text-xs text-zinc-500 mt-1">
                  Vui lòng nhập lý do để từ chối địa điểm
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Location Modal (Admin) */}
      {showAddLocationModal && (
        <AddLocationModal
          onClose={() => setShowAddLocationModal(false)}
          onSuccess={handleAddLocationSuccess}
        />
      )}
    </div>
  );
};

export default LocationManagement;
