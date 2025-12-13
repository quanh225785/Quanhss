import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader2 } from 'lucide-react';
import { apiBaseUrl } from '../../utils/api';
import { decodePolyline, getBoundsFromCoordinates, formatDistance, formatDuration } from '../../utils/polylineUtils';

const DEFAULT_CENTER = [105.8342, 21.0278]; // Hanoi
const DEFAULT_ZOOM = 12;

const TourMap = ({
    points = [],           // Array of { latitude, longitude, name, orderIndex }
    routePolyline = null,  // Encoded polyline string
    totalDistance = null,  // In meters
    totalTime = null,      // In milliseconds
    isLoading = false
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (map.current) return;

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

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update markers when points change
    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add markers for each point
        points.forEach((point, index) => {
            if (point.latitude && point.longitude) {
                // Create custom marker element
                const el = document.createElement('div');
                el.className = 'tour-marker';
                el.innerHTML = `
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: ${index === 0 ? '#10b981' : index === points.length - 1 ? '#ef4444' : '#3b82f6'};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">${point.orderIndex !== undefined ? point.orderIndex + 1 : index + 1}</div>
                `;

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([point.longitude, point.latitude])
                    .setPopup(new maplibregl.Popup({ offset: 25 })
                        .setHTML(`<div style="font-weight: 600;">${point.name || `Điểm ${index + 1}`}</div>`))
                    .addTo(map.current);

                markersRef.current.push(marker);
            }
        });

        // Fit bounds to show all markers
        if (points.length > 0) {
            const coordinates = points
                .filter(p => p.latitude && p.longitude)
                .map(p => [p.longitude, p.latitude]);

            if (coordinates.length > 0) {
                const bounds = getBoundsFromCoordinates(coordinates);
                if (bounds) {
                    map.current.fitBounds(bounds, { padding: 60 });
                }
            }
        }
    }, [points]);

    // Update route polyline
    useEffect(() => {
        if (!map.current) return;

        const mapInstance = map.current;

        const updateRoute = () => {
            // Remove existing route layer and source
            if (mapInstance.getLayer('route')) {
                mapInstance.removeLayer('route');
            }
            if (mapInstance.getSource('route')) {
                mapInstance.removeSource('route');
            }

            if (routePolyline) {
                const coordinates = decodePolyline(routePolyline);

                if (coordinates.length > 0) {
                    mapInstance.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: coordinates
                            }
                        }
                    });

                    mapInstance.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': '#3b82f6',
                            'line-width': 5,
                            'line-opacity': 0.8
                        }
                    });

                    // Fit bounds to route
                    const bounds = getBoundsFromCoordinates(coordinates);
                    if (bounds) {
                        mapInstance.fitBounds(bounds, { padding: 60 });
                    }
                }
            }
        };

        if (mapInstance.isStyleLoaded()) {
            updateRoute();
        } else {
            mapInstance.on('load', updateRoute);
        }
    }, [routePolyline]);

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/80 z-10 rounded-lg">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-zinc-400 mx-auto mb-2" size={32} />
                        <p className="text-sm text-zinc-600">Đang tải tuyến đường...</p>
                    </div>
                </div>
            )}

            <div ref={mapContainer} className="w-full h-[400px] rounded-lg border border-zinc-300" />

            {/* Route info overlay */}
            {(totalDistance || totalTime) && (
                <div className="absolute bottom-4 left-4 bg-white px-4 py-3 rounded-lg shadow-md border border-zinc-200">
                    <div className="flex items-center gap-4 text-sm">
                        {totalDistance && (
                            <div>
                                <span className="text-zinc-500">Khoảng cách:</span>{' '}
                                <span className="font-semibold text-zinc-900">{formatDistance(totalDistance)}</span>
                            </div>
                        )}
                        {totalTime && (
                            <div>
                                <span className="text-zinc-500">Thời gian:</span>{' '}
                                <span className="font-semibold text-zinc-900">{formatDuration(totalTime)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourMap;
