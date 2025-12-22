import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Plus, GripVertical } from 'lucide-react';
import { api } from '../../utils/api';

/**
 * MultipleImageUpload component for uploading multiple images to S3
 * @param {string} folder - Folder/prefix in the S3 bucket (e.g., "tours")
 * @param {string[]} imageUrls - Current image URLs array
 * @param {function} onImagesChange - Callback with the updated image URLs array
 * @param {number} maxImages - Maximum number of images allowed (default: 10)
 * @param {string} className - Additional CSS classes
 */
const MultipleImageUpload = ({
    folder = 'images',
    imageUrls = [],
    onImagesChange,
    maxImages = 10,
    className = '',
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        await uploadFiles(files);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;
        await uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        // Filter only image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }

        // Check max images limit
        const remainingSlots = maxImages - imageUrls.length;
        if (remainingSlots <= 0) {
            setError(`Tối đa ${maxImages} ảnh`);
            return;
        }

        const filesToUpload = imageFiles.slice(0, remainingSlots);

        // Validate file sizes (max 5MB each)
        const oversizedFiles = filesToUpload.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setError('Mỗi file phải nhỏ hơn 5MB');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const uploadedUrls = [...imageUrls];

        try {
            for (let i = 0; i < filesToUpload.length; i++) {
                const file = filesToUpload[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);

                const response = await api.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.code === 1000) {
                    uploadedUrls.push(response.data.result);
                    setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
                }
            }

            onImagesChange?.(uploadedUrls);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Không thể upload ảnh');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        onImagesChange?.(newUrls);
    };

    const handleMoveImage = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= imageUrls.length) return;
        const newUrls = [...imageUrls];
        const [movedItem] = newUrls.splice(fromIndex, 1);
        newUrls.splice(toIndex, 0, movedItem);
        onImagesChange?.(newUrls);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Image Grid */}
            {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {imageUrls.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50"
                        >
                            <img
                                src={url}
                                alt={`Ảnh ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {/* Move buttons */}
                                <div className="flex flex-col gap-1">
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleMoveImage(index, index - 1)}
                                            className="p-1 bg-white/90 rounded text-zinc-700 hover:bg-white text-xs"
                                            title="Di chuyển lên"
                                        >
                                            ←
                                        </button>
                                    )}
                                    {index < imageUrls.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleMoveImage(index, index + 1)}
                                            className="p-1 bg-white/90 rounded text-zinc-700 hover:bg-white text-xs"
                                            title="Di chuyển xuống"
                                        >
                                            →
                                        </button>
                                    )}
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    title="Xóa ảnh"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Primary indicator */}
                            {index === 0 && (
                                <div className="absolute top-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                                    Ảnh bìa
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {imageUrls.length < maxImages && (
                <div
                    onClick={triggerFileSelect}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragOver
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-zinc-300 hover:border-zinc-400'
                        }`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                            <div className="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <span className="text-sm text-zinc-500">
                                Đang upload... {uploadProgress}%
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                                <Plus size={24} className="text-zinc-400" />
                            </div>
                            <div>
                                <span className="text-sm text-zinc-600 font-medium">
                                    Click hoặc kéo thả ảnh vào đây
                                </span>
                                <p className="text-xs text-zinc-400 mt-1">
                                    PNG, JPG, GIF • Tối đa 5MB/ảnh • Còn {maxImages - imageUrls.length} vị trí
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <X size={14} />
                    {error}
                </p>
            )}
        </div>
    );
};

export default MultipleImageUpload;
