import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../utils/api';

/**
 * ImageUpload component for uploading images to S3
 * @param {string} folder - Folder/prefix in the S3 bucket (e.g., "tours", "tour-points")
 * @param {string} currentImageUrl - Current image URL to display
 * @param {function} onUploadComplete - Callback with the uploaded image URL
 * @param {function} onRemove - Callback when image is removed
 * @param {string} className - Additional CSS classes
 * @param {boolean} compact - Use compact mode for inline image upload
 */
const ImageUpload = ({
    folder = 'images',
    currentImageUrl,
    onUploadComplete,
    onRemove,
    className = '',
    compact = false,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File phải nhỏ hơn 5MB');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to S3
        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.code === 1000) {
                const imageUrl = response.data.result;
                setPreviewUrl(imageUrl);
                onUploadComplete?.(imageUrl);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Không thể upload ảnh');
            setPreviewUrl(currentImageUrl); // Revert to previous
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onRemove?.();
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    if (compact) {
        return (
            <div className={`relative inline-flex items-center gap-2 ${className}`}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {previewUrl ? (
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Uploaded"
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={10} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={triggerFileSelect}
                        disabled={isUploading}
                        className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-zinc-300 rounded-lg text-zinc-400 hover:border-zinc-400 hover:text-zinc-500 transition-colors disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <ImageIcon size={16} />
                        )}
                    </button>
                )}

                {error && (
                    <span className="text-xs text-red-500">{error}</span>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Uploaded"
                        className="w-full h-48 object-cover rounded-lg border border-zinc-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            disabled={isUploading}
                            className="px-3 py-1.5 bg-white text-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
                        >
                            {isUploading ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                'Đổi ảnh'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={triggerFileSelect}
                    className="cursor-pointer border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-400 transition-colors"
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={32} className="animate-spin text-zinc-400" />
                            <span className="text-sm text-zinc-500">Đang upload...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={32} className="text-zinc-400" />
                            <span className="text-sm text-zinc-600 font-medium">
                                Click để chọn ảnh
                            </span>
                            <span className="text-xs text-zinc-400">
                                PNG, JPG, GIF tối đa 5MB
                            </span>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
