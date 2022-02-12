import turfBbox from '@turf/bbox';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfCircle from '@turf/circle';
import turfTransformRotate from '@turf/transform-rotate';
import turfBearing from '@turf/bearing';
import turfDistance from '@turf/distance';
import { LngLat, LngLatBounds, MercatorCoordinate, } from 'mapbox-gl';
export function getCameraFromBoxAndBearing(map, bounds, bearing, padding, maxZoom) {
    const opts = {
        bearing,
        ...(padding && { padding }),
        ...(maxZoom && { maxZoom }),
    };
    const cameraOptions = map.cameraForBounds(bounds, opts);
    if (!cameraOptions)
        throw new Error('No valid camera found');
    return freeCameraOptionsFromCameraOptions(map, cameraOptions);
}
export function getCameraFromCircleAndBearing(map, center, radius, bearing, padding, maxZoom) {
    const lngLat = LngLat.convert(center).toArray();
    const box = _boundsFromCenterRadiusAndBearing(lngLat, radius, bearing);
    return getCameraFromBoxAndBearing(map, box, bearing, padding, maxZoom);
}
export function getCameraFromPositionAndTarget(map, cameraLngLat, cameraAltitude, targetLngLat, padding) {
    cameraLngLat = LngLat.convert(cameraLngLat).toArray();
    targetLngLat = LngLat.convert(targetLngLat ?? cameraLngLat).toArray();
    const bearing = turfBearing(cameraLngLat, targetLngLat);
    const pitch = _pitchFromCoords(cameraLngLat, cameraAltitude, targetLngLat);
    return freeCameraOptionsFromCameraOptions(map, {
        center: cameraLngLat,
        zoom: altitudeToZoom(map, cameraLngLat[1], cameraAltitude, pitch),
        pitch,
        bearing,
        padding,
    });
}
export function coordsFromFreeCameraOptions(opts) {
    if (!opts.position)
        throw new Error('position not defined');
    const lngLat = opts.position?.toLngLat();
    return [lngLat.lng, lngLat.lat, opts.position?.toAltitude()];
}
export function coordsFromCameraOptions(map, opts) {
    return coordsFromFreeCameraOptions(freeCameraOptionsFromCameraOptions(map, opts));
}
export function resolvePadding(map, padding = {}) {
    const tr = map.transform;
    return {
        top: _resolvePercent(padding?.top, tr.height),
        bottom: _resolvePercent(padding?.bottom, tr.height),
        left: _resolvePercent(padding?.left, tr.width),
        right: _resolvePercent(padding?.right, tr.width),
    };
}
// Check if solved:
// https://github.com/mapbox/mapbox-gl-js/issues/10190
export function freeCameraOptionsFromCameraOptions(map, opts) {
    const tr = map.transform.clone();
    tr.center = LngLat.convert(opts.center);
    tr.zoom = opts.zoom;
    tr.bearing = opts.bearing ?? 0;
    tr.pitch = opts.pitch ?? 0;
    return tr.getFreeCameraOptions();
}
// Check if solved:
// https://github.com/mapbox/mapbox-gl-js/issues/10190
export function cameraOptionsFromFreeCameraOptions(map, opts) {
    const tr = map.transform.clone();
    tr.setFreeCameraOptions(opts);
    return {
        center: tr.center,
        zoom: tr.zoom,
        bearing: tr.bearing,
        pitch: tr.pitch,
        padding: tr.padding,
        around: tr.center,
    };
}
function _boundsFromCenterRadiusAndBearing(center, radius, bearing) {
    const circle = turfCircle(center, radius, { units: 'kilometers' });
    const bbox = turfBbox(circle);
    const bboxPolygon = turfBboxPolygon(bbox);
    const rotatedPolygon = turfTransformRotate(bboxPolygon, bearing);
    const vertices = rotatedPolygon.geometry.coordinates[0].slice(0, 4);
    return new LngLatBounds([vertices[0], vertices[2]]);
}
function _pitchFromCoords(cameraCoords, cameraAltitude, targetCoords, targetAltitude = 0) {
    const groundDistance = turfDistance(cameraCoords, targetCoords) * 1000;
    const rad = Math.atan2(cameraAltitude - targetAltitude, groundDistance);
    const deg = rad / (Math.PI / 180);
    return (90 - deg) % 360;
}
export function zoomToAltitude(map, lat, zoom, pitch) {
    const merc = MercatorCoordinate.fromLngLat([0, lat]);
    const z = map.transform._mercatorZfromZoom(zoom);
    merc.z = z * Math.cos(pitch * (Math.PI / 180));
    return merc.toAltitude();
}
export function altitudeToZoom(map, lat, altitude, pitch = 0) {
    const merc = MercatorCoordinate.fromLngLat([0, lat], altitude);
    const z = merc.z / Math.cos(pitch * (Math.PI / 180));
    return map.transform._zoomFromMercatorZ(z);
}
function _resolvePercent(value, full) {
    if (!value)
        return 0;
    if (typeof value === 'number')
        return value;
    if (!value.trim().endsWith('%'))
        throw new Error(`Not a percentage: ${value}`);
    const result = full * (parseFloat(value) / 100);
    if (Number.isNaN(result))
        throw new Error(`Invalid value: ${value}`);
    return result;
}
//# sourceMappingURL=cameraHelpers.js.map