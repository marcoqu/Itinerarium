import turfBbox from '@turf/bbox';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfCircle from '@turf/circle';
import turfTransformRotate from '@turf/transform-rotate';
import turfBearing from '@turf/bearing';
import turfDistance from '@turf/distance';
import { LngLat, LngLatBounds, MercatorCoordinate, } from 'mapbox-gl';
export function getCameraFromBoxAndBearing(map, bounds, bearing, padding, maxZoom) {
    const cameraOptions = map.cameraForBounds(bounds, { bearing, padding, maxZoom });
    if (!cameraOptions)
        throw new Error('No valid camera found');
    return _freeCameraOptionsFromCameraOptions(map, cameraOptions);
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
    return _freeCameraOptionsFromCameraOptions(map, {
        center: cameraLngLat,
        zoom: _altitudeToZoom(map, cameraLngLat[0], cameraAltitude),
        pitch,
        bearing,
        padding,
    });
}
export function coordsFromFreeCameraOptions(opts) {
    if (!opts.position)
        throw new Error('position not defined');
    const lngLat = opts.position?.toLngLat();
    return [lngLat.lat, lngLat.lng, opts.position?.toAltitude()];
}
export function coordsFromCameraOptions(map, opts) {
    return coordsFromFreeCameraOptions(_freeCameraOptionsFromCameraOptions(map, opts));
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
function _freeCameraOptionsFromCameraOptions(map, opts) {
    const tr = map.transform.clone();
    tr.center = opts.center;
    tr.zoom = opts.zoom;
    tr.bearing = opts.bearing ?? 0;
    tr.pitch = opts.pitch ?? 0;
    return tr.getFreeCameraOptions();
}
// https://github.com/mapbox/mapbox-gl-js/issues/10190
// function _cameraOptionsFromFreeCameraOptions(map: Map, opts: FreeCameraOptions): CameraOptions {
//     const tr = (map as ExtendedMapGL).transform.clone();
//     tr.setFreeCameraOptions(opts);
//     return {
//         center: tr.center,
//         zoom: tr.zoom,
//         bearing: tr.bearing,
//         pitch: tr.pitch,
//         padding: tr.padding,
//     };
// }
function _boundsFromCenterRadiusAndBearing(center, radius, bearing) {
    const circle = turfCircle(center, radius, { units: 'kilometers' });
    const bbox = turfBbox(circle);
    const bboxPolygon = turfBboxPolygon(bbox);
    const rotatedPolygon = turfTransformRotate(bboxPolygon, bearing);
    const vertices = rotatedPolygon.geometry.coordinates[0].slice(0, 4);
    return new LngLatBounds([vertices[0], vertices[2]]);
}
function _pitchFromCoords(cameraCoords, cameraAltitude, targetCoords, targetAltitude = 0) {
    const groundDistance = turfDistance(cameraCoords, targetCoords);
    const rad = Math.atan2(cameraAltitude - targetAltitude, groundDistance);
    const deg = rad / (Math.PI / 180);
    return (90 - deg) % 360;
}
// function _zoomToAltitude(lat: number, zoom: number): number {
//     const merc = MercatorCoordinate.fromLngLat([0, lat]);
//     merc.z = _mapGL.transform._mercatorZfromZoom(zoom);
//     return merc.toAltitude();
// }
function _altitudeToZoom(map, lat, altitude) {
    const merc = MercatorCoordinate.fromLngLat([0, lat], altitude);
    return map.transform._zoomFromMercatorZ(merc.z);
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
// ===================================
// export function async ready(): Promise<void> {
//     if (_mapGL.loaded()) return;
//     if (_mapGL.isStyleLoaded()) return;
//     return new Promise((resolve, reject) => {
//         const onDataEvent = async () => {
//             await ready();
//             resolve();
//         };
//         const onError = () => {
//             console.error('Map Loading error');
//             reject();
//         };
//         _mapGL.once('styledata', onDataEvent);
//         _mapGL.once('load', onDataEvent);
//         _mapGL.once('error', onError);
//     });
// }
// export function setInteractive(interactive: boolean): void {
//     const action = interactive ? 'enable' : 'disable';
//     _mapGL.scrollZoom[action]();
//     _mapGL.boxZoom[action]();
//     _mapGL.dragRotate[action]();
//     _mapGL.dragPan[action]();
//     _mapGL.keyboard[action]();
//     _mapGL.doubleClickZoom[action]();
//     _mapGL.touchZoomRotate[action]();
// }
// export function update3D(): void {
//     // if (!_mapGL || !_mapGL.loaded()) throw new Error('Map not initialized yet');
//     _mapGL.triggerRepaint();
// }
// export function async flyTo(options: FlyToOptions): Promise<void> {
//     return new Promise((resolve) => {
//         if (!_mapGL) throw new Error('Map not initialized yet');
//         const onMoveEnd = (): void => {
//             if (!_mapGL) throw new Error('Map not initialized yet');
//             resolve();
//             _mapGL.off('moveend', onMoveEnd);
//         };
//         _mapGL.on('moveend', onMoveEnd);
//         _mapGL.flyTo(options);
//     });
// }
//# sourceMappingURL=cameraHelpers.js.map