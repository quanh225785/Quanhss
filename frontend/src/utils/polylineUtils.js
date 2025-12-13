/**
 * Decode a Google Polyline (precision 5) into an array of [lng, lat] coordinates
 * Vietmap uses Google Polyline 5 format for encoding route geometry
 * 
 * @param {string} encoded - The encoded polyline string
 * @returns {Array<[number, number]>} Array of [longitude, latitude] pairs (for MapLibre)
 */
export function decodePolyline(encoded) {
    if (!encoded || encoded.length === 0) {
        return [];
    }

    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        // Decode latitude
        let shift = 0;
        let result = 0;
        let byte;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        // Decode longitude
        shift = 0;
        result = 0;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        // Polyline precision is 1e5
        // MapLibre expects [lng, lat] format
        coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
}

/**
 * Calculate bounds from coordinates array
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat] pairs
 * @returns {[[number, number], [number, number]]} Bounds as [[minLng, minLat], [maxLng, maxLat]]
 */
export function getBoundsFromCoordinates(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return null;
    }

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const [lng, lat] of coordinates) {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
    }

    return [[minLng, minLat], [maxLng, maxLat]];
}

/**
 * Format distance in meters to human readable string
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(meters) {
    if (!meters && meters !== 0) return '-';
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
}

/**
 * Format time in milliseconds to human readable string
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time (e.g., "1 giờ 30 phút" or "45 phút")
 */
export function formatDuration(ms) {
    if (!ms && ms !== 0) return '-';

    const totalMinutes = Math.round(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
}
