import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import { apiBaseUrl } from '../../utils/api';

const DEFAULT_CENTER = [105.8342, 21.0278]; // Hanoi
const DEFAULT_ZOOM = 12;

const MapPicker = ({ onLocationSelect, selectedLocation }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (map.current) return; // Initialize map only once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'raster-tiles': {
                        type: 'raster',
                        tiles: [`${apiBaseUrl}/vietmap/tiles/{z}/{x}/{y}.png`],
                        tileSize: 256,
                    },
                },
                layers: [
                    {
                        id: 'simple-tiles',
                        type: 'raster',
                        source: 'raster-tiles',
                        minzoom: 0,
                        maxzoom: 22,
                    },
                ],
            },
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Create a draggable marker
        marker.current = new maplibregl.Marker({
            draggable: true,
            color: '#0f172a',
        });

        // Handle map click to place marker
        map.current.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            marker.current.setLngLat([lng, lat]).addTo(map.current);
            if (onLocationSelect) {
                onLocationSelect({ lat, lng });
            }
        });

        // Handle marker drag to update location
        marker.current.on('dragend', () => {
            const lngLat = marker.current.getLngLat();
            if (onLocationSelect) {
                onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
            }
        });

        map.current.on('load', () => {
            setIsLoading(false);
        });

        // Cleanup
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update marker position when selectedLocation changes
    useEffect(() => {
        if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude && marker.current) {
            const lng = selectedLocation.longitude;
            const lat = selectedLocation.latitude;
            marker.current.setLngLat([lng, lat]).addTo(map.current);
            map.current.flyTo({ center: [lng, lat], zoom: 15 });
        }
    }, [selectedLocation]);

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 z-10 rounded-lg">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-zinc-400 mx-auto mb-2" size={32} />
                        <p className="text-sm text-zinc-600">Đang tải bản đồ...</p>
                    </div>
                </div>
            )}
            <div ref={mapContainer} className="w-full h-[400px] rounded-lg border border-zinc-300" />
            <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2">
                <MapPin size={14} className="text-zinc-400" />
                Click trên bản đồ hoặc kéo marker để chọn vị trí
            </div>
        </div>
    );
};

export default MapPicker;
