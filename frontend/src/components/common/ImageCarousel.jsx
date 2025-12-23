import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * ImageCarousel component for displaying multiple images with navigation
 * @param {string[]} images - Array of image URLs
 * @param {string} alt - Alt text for images
 * @param {string} className - Additional CSS classes
 * @param {boolean} autoSlide - Enable auto sliding (default: false)
 * @param {number} slideInterval - Auto slide interval in ms (default: 5000)
 */
const ImageCarousel = ({
    images = [],
    alt = 'Image',
    className = '',
    autoSlide = false,
    slideInterval = 5000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Filter valid images
    const validImages = images.filter(img => img && img.trim() !== '');

    // Auto slide effect
    useEffect(() => {
        if (!autoSlide || validImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % validImages.length);
        }, slideInterval);

        return () => clearInterval(interval);
    }, [autoSlide, slideInterval, validImages.length]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) =>
            prev === 0 ? validImages.length - 1 : prev - 1
        );
    }, [validImages.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) =>
            (prev + 1) % validImages.length
        );
    }, [validImages.length]);

    const goToIndex = (index) => {
        setCurrentIndex(index);
    };

    // Touch handlers for swipe
    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }
    };

    // Keyboard navigation in modal
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') setIsModalOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, goToPrevious, goToNext]);

    // If no valid images, show placeholder
    if (validImages.length === 0) {
        return (
            <div className={`w-full h-64 bg-zinc-100 rounded-xl flex items-center justify-center ${className}`}>
                <div className="text-center text-zinc-400">
                    <ZoomIn size={48} className="mx-auto mb-2" />
                    <p>Chưa có ảnh</p>
                </div>
            </div>
        );
    }

    // If only one image, show simple image
    if (validImages.length === 1) {
        return (
            <>
                <div
                    className={`w-full overflow-hidden rounded-xl cursor-pointer bg-zinc-100 ${className}`}
                    onClick={() => setIsModalOpen(true)}
                >
                    <img
                        src={validImages[0]}
                        alt={alt}
                        className="w-full h-80 md:h-96 object-contain hover:scale-105 transition-transform duration-300"
                    />
                    {/* Fullscreen hint */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full font-medium flex items-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
                        <ZoomIn size={14} />
                        Click để xem toàn màn hình
                    </div>
                </div>

                {/* Fullscreen Modal for single image */}
                {isModalOpen && createPortal(
                    <div
                        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                        >
                            <X size={24} className="text-white" />
                        </button>
                        <img
                            src={validImages[0]}
                            alt={alt}
                            className="max-w-full max-h-full object-contain p-4"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>,
                    document.body
                )}
            </>
        );
    }

    return (
        <>
            <div className={`relative w-full overflow-hidden rounded-xl bg-zinc-100 ${className}`}>
                {/* Main Image */}
                <div
                    className="relative h-80 md:h-96 cursor-pointer group"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsModalOpen(true)}
                >
                    <img
                        src={validImages[currentIndex]}
                        alt={`${alt} ${currentIndex + 1}`}
                        className="w-full h-full object-contain transition-all duration-300"
                    />

                    {/* Fullscreen hint on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-black/50 text-white rounded-full text-sm flex items-center gap-2">
                            <ZoomIn size={16} />
                            Click để xem toàn màn hình
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                    aria-label="Previous image"
                >
                    <ChevronLeft size={20} className="text-zinc-700" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                    aria-label="Next image"
                >
                    <ChevronRight size={20} className="text-zinc-700" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {validImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50 hover:bg-white/80'
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 text-white text-xs rounded-full font-medium">
                    {currentIndex + 1} / {validImages.length}
                </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {validImages.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => goToIndex(index)}
                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-transparent hover:border-zinc-300'
                            }`}
                    >
                        <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Fullscreen Modal */}
            {isModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                    onClick={() => setIsModalOpen(false)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                    >
                        <X size={24} className="text-white" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium">
                        {currentIndex + 1} / {validImages.length}
                    </div>

                    {/* Main Image */}
                    <img
                        src={validImages[currentIndex]}
                        alt={`${alt} ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Navigation Arrows */}
                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft size={32} className="text-white" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ChevronRight size={32} className="text-white" />
                    </button>

                    {/* Thumbnails at bottom */}
                    <div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] py-2 px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {validImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => goToIndex(index)}
                                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                    ? 'border-white'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default ImageCarousel;
