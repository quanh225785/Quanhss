import { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import { getTileCacheStats, clearTileCache, isServiceWorkerActive } from '../../utils/serviceWorker';

/**
 * Vietmap Cache Monitor Component
 * Displays cache statistics and allows cache management
 */
const VietmapCacheMonitor = () => {
    const [cacheStats, setCacheStats] = useState(null);
    const [isClearing, setIsClearing] = useState(false);
    const [swActive, setSwActive] = useState(false);

    const loadCacheStats = async () => {
        const stats = await getTileCacheStats();
        setCacheStats(stats);
    };

    useEffect(() => {
        setSwActive(isServiceWorkerActive());
        if (isServiceWorkerActive()) {
            loadCacheStats();
        }
    }, []);

    const handleClearCache = async () => {
        setIsClearing(true);
        const success = await clearTileCache();
        if (success) {
            await loadCacheStats();
        }
        setIsClearing(false);
    };

    if (!swActive) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                <div className="flex items-center gap-2 text-amber-700">
                    <Database size={14} />
                    <span>Tile caching đang khởi động...</span>
                </div>
            </div>
        );
    }

    if (!cacheStats) {
        return null;
    }

    const cachePercentage = (cacheStats.cacheSize / cacheStats.maxSize) * 100;

    return (
        <div className="bg-white border border-zinc-200 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-zinc-700 font-medium">
                    <Database size={14} />
                    <span>Map Tile Cache</span>
                </div>
                <button
                    onClick={handleClearCache}
                    disabled={isClearing || cacheStats.cacheSize === 0}
                    className="flex items-center gap-1 text-zinc-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Clear cache"
                >
                    {isClearing ? (
                        <RefreshCw size={12} className="animate-spin" />
                    ) : (
                        <Trash2 size={12} />
                    )}
                </button>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-zinc-600">
                    <span>Tiles cached:</span>
                    <span className="font-medium text-zinc-900">
                        {cacheStats.cacheSize} / {cacheStats.maxSize}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 rounded-full h-1.5">
                    <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(cachePercentage, 100)}%` }}
                    />
                </div>

                <div className="text-zinc-500 text-[10px] mt-1">
                    {cachePercentage < 50 ? (
                        <span className="text-emerald-600">Cache đang hoạt động tốt</span>
                    ) : cachePercentage < 90 ? (
                        <span className="text-amber-600">Cache đang đầy dần</span>
                    ) : (
                        <span className="text-red-600">Cache gần đầy, sẽ tự động xóa tiles cũ</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VietmapCacheMonitor;
