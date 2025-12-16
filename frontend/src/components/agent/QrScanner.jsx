import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react';

const QrScanner = ({ isOpen, onClose, onScanSuccess, onScanError }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        if (isOpen && !scanning) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = async () => {
        try {
            setError(null);
            setScanning(true);

            html5QrCodeRef.current = new Html5Qrcode('qr-reader');

            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                onScanSuccessHandler,
                onScanFailureHandler
            );
        } catch (err) {
            console.error('Error starting scanner:', err);
            setError('Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current?.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setScanning(false);
    };

    const onScanSuccessHandler = (decodedText, decodedResult) => {
        stopScanner();
        onScanSuccess?.(decodedText);
    };

    const onScanFailureHandler = (error) => {
        // Ignore scan failures (they happen frequently during scanning)
    };

    const handleClose = async () => {
        await stopScanner();
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                    <h2 className="text-lg font-semibold">Quét mã QR</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="p-4">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={startScanner}
                                className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <>
                            <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
                            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700">
                                    Đưa mã QR vào khung hình để quét. Hệ thống sẽ tự động nhận diện.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QrScanner;
