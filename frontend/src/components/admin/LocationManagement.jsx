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
import { useToast } from "../../context/ToastContext";
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
  const [statusFilter, setStatusFilter] = useState("PENDING"); // ALL, PENDING, APPROVED, REJECTED
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useToast();

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
    // Filter suggestions
    let suggResult = suggestions;
    if (statusFilter !== "ALL") {
      suggResult = suggResult.filter(s => s.status === statusFilter);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      suggResult = suggResult.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          (s.suggestedByUsername && s.suggestedByUsername.toLowerCase().includes(query))
      );
    }
    setFilteredSuggestions(suggResult);

    // Filter locations
    let locResult = locations;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      locResult = locResult.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.address.toLowerCase().includes(query) ||
          (l.createdByUsername && l.createdByUsername.toLowerCase().includes(query))
      );
    }
    setFilteredLocations(locResult);
  }, [searchQuery, statusFilter, suggestions, locations]);

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
      showToast({
        type: 'success',
        message: 'Thành công',
        description: 'Địa điểm đã được duyệt thành công!'
      });
      setShowApproveModal(false);
      setSelectedSuggestion(null);
      await fetchData(); // Refresh both suggestions and locations
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      let description = "Không thể duyệt địa điểm: " + (errorMsg || "Lỗi không xác định");
      if (errorMsg?.includes("already exists")) {
        description = "Lỗi: Tên địa điểm này đã tồn tại trong hệ thống.";
      } else if (errorMsg?.includes("already been processed")) {
        description = "Lỗi: Địa điểm này đã được xử lý trước đó.";
      } else if (errorMsg?.includes("not found")) {
        description = "Lỗi: Không tìm thấy địa điểm đề xuất.";
      }
      showToast({
        type: 'error',
        message: 'Lỗi',
        description
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (suggestionId) => {
    if (!rejectReason || rejectReason.trim() === "") {
      showToast({
        type: 'info',
        message: 'Yêu cầu',
        description: 'Vui lòng nhập lý do từ chối'
      });
      return;
    }

    setProcessingId(suggestionId);
    try {
      await api.post(`/locations/suggestions/${suggestionId}/reject`, null, {
        params: { reason: rejectReason.trim() },
      });
      showToast({
        type: 'success',
        message: 'Thành công',
        description: 'Địa điểm đã bị từ chối!'
      });
      setShowRejectModal(false);
      setSelectedSuggestion(null);
      setRejectReason("");
      await fetchSuggestions();
    } catch (err) {
      console.error("Error rejecting suggestion:", err);
      const errorMsg = err.response?.data?.message;
      showToast({
        type: 'error',
        message: 'Lỗi',
        description: "Không thể từ chối địa điểm: " + (errorMsg || "Lỗi không xác định")
      });
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
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Quản lý Địa điểm
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">Kiểm duyệt đề xuất và quản lý danh mục địa điểm toàn hệ thống.</p>
        </div>
        <button
          onClick={() => setShowAddLocationModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Thêm địa điểm</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50/50 backdrop-blur-md border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Navigation and Advanced Filters */}
      <div className="flex flex-col gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex p-2 bg-slate-100/50 backdrop-blur-sm rounded-2xl border border-white/40 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "suggestions"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Đề xuất ({suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "locations"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Hiện có ({locations.length})
            </button>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm, địa chỉ, người đề xuất..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {activeTab === "suggestions" && (
          <div className="flex flex-wrap gap-3">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "PENDING", label: "Chờ duyệt" },
              { id: "APPROVED", label: "Đã duyệt" },
              { id: "REJECTED", label: "Từ chối" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border ${statusFilter === filter.id
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white/50 text-slate-500 border-white/40 hover:bg-white hover:text-slate-900"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && (
        <>
          {filteredSuggestions.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-24 text-center shadow-2xl shadow-black/5">
              <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/40 shadow-inner">
                <MapPin className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-900 font-black text-2xl tracking-tight mb-2">
                {searchQuery
                  ? "Không tìm thấy địa điểm đề xuất nào"
                  : "Chưa có địa điểm đề xuất nào"}
              </p>
              <p className="text-slate-500 font-medium">Thử thay đổi bộ lọc hoặc tiêu chí tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSuggestions.map((loc) => (
                <div
                  key={loc.id}
                  className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5 flex flex-col gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 truncate tracking-tight">
                          {loc.name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(loc.status)}
                    </div>
                  </div>

                  {loc.description && (
                    <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      {loc.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                        {loc.suggestedByUsername?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 tracking-tight">@{loc.suggestedByUsername || "N/A"}</p>
                    </div>
                    {loc.latitude && loc.longitude && (
                      <div className="text-[10px] font-black text-slate-400 font-sans tracking-tight">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>

                  {loc.status === "PENDING" && (
                    <div className="flex gap-3 pt-5 border-t border-white/40 mt-1">
                      <button
                        onClick={() => openApproveModal(loc)}
                        disabled={processingId === loc.id}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-900/10 disabled:opacity-50 transition-all"
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
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-900/10 disabled:opacity-50 transition-all"
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
                    <div className="mt-2 flex items-start gap-2 bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-red-600 leading-relaxed uppercase tracking-tight">
                        Lý do: {loc.rejectionReason}
                      </p>
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
            <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-24 text-center shadow-2xl shadow-black/5">
              <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/40 shadow-inner">
                <MapPin className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-900 font-black text-2xl tracking-tight mb-2">
                {searchQuery
                  ? "Không tìm thấy địa điểm nào"
                  : "Chưa có địa điểm nào"}
              </p>
              <p className="text-slate-500 font-medium">Bạn có thể thêm địa điểm mới bằng nút phía trên</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5 flex flex-col gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 truncate tracking-tight">
                          {loc.name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-100">
                        Đã duyệt
                      </span>
                    </div>
                  </div>

                  {loc.description && (
                    <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      {loc.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                        {loc.createdByUsername?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 tracking-tight">@{loc.createdByUsername || "ADMIN"}</p>
                    </div>
                    {loc.latitude && loc.longitude && (
                      <div className="text-[10px] font-black text-slate-400 font-sans tracking-tight">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
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
