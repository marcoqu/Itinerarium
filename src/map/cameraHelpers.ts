import turfBbox from '@turf/bbox';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfCircle from '@turf/circle';
import turfTransformRotate from '@turf/transform-rotate';
import turfBearing from '@turf/bearing';
import turfDistance from '@turf/distance';

import {
    Map,
    LngLat,
    LngLatLike,
    LngLatBounds,
    LngLatBoundsLike,
    CameraOptions,
    FreeCameraOptions,
    PaddingOptions,
    MercatorCoordinate,
} from 'mapbox-gl';

export type CameraPosition = Required<CameraOptions>;
export type FreeCameraPosition = FreeCameraOptions & {
    position: MercatorCoordinate;
    orientation: [number, number, number, number];
};

export type coord2 = [number, number];
export type coord3 = [number, number, number];

export type ExtendedPaddingOptions = {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
};

type Transform = {
    width: number;
    height: number;
    center: LngLatLike;
    zoom: number;
    bearing: number;
    pitch: number;
    cameraToCenterDistance: number;
    padding: PaddingOptions;
    _mercatorZfromZoom(zoom: number): number;
    _zoomFromMercatorZ(z: number): number;
    clone(): Transform;
    getFreeCameraOptions(): FreeCameraPosition;
    setFreeCameraOptions(options: FreeCameraOptions): void;
};

interface ExtendedMapGL extends Map {
    transform: Transform;
}

export function getCameraFromBoxAndBearing(
    map: Map,
    bounds: LngLatBoundsLike,
    bearing: number,
    padding?: PaddingOptions,
    maxZoom?: number,
): FreeCameraPosition {
    const opts = {
        bearing,
        ...(padding && { padding }),
        ...(maxZoom && { maxZoom }),
    };
    const cameraOptions = map.cameraForBounds(bounds, opts);
    if (!cameraOptions) throw new Error('No valid camera found');
    return freeCameraOptionsFromCameraOptions(map, cameraOptions);
}

export function getCameraFromCircleAndBearing(
    map: Map,
    center: LngLatLike,
    radius: number,
    bearing: number,
    padding?: PaddingOptions,
    maxZoom?: number,
): FreeCameraPosition {
    const lngLat = LngLat.convert(center).toArray() as coord2;
    const box = _boundsFromCenterRadiusAndBearing(lngLat, radius, bearing);
    return getCameraFromBoxAndBearing(map, box, bearing, padding, maxZoom);
}

export function getCameraFromPositionAndTarget(
    map: Map,
    cameraLngLat: LngLatLike,
    cameraAltitude: number,
    targetLngLat?: LngLatLike,
    padding?: PaddingOptions,
): FreeCameraPosition {
    cameraLngLat = LngLat.convert(cameraLngLat).toArray() as coord2;
    targetLngLat = LngLat.convert(targetLngLat ?? cameraLngLat).toArray() as coord2;
    const bearing = turfBearing(cameraLngLat, targetLngLat);
    const pitch = _pitchFromCoords(cameraLngLat, cameraAltitude, targetLngLat);
    return freeCameraOptionsFromCameraOptions(map, {
        center: cameraLngLat,
        zoom: _altitudeToZoom(map, cameraLngLat[0], cameraAltitude),
        pitch,
        bearing,
        padding,
    });
}

export function coordsFromFreeCameraOptions(opts: FreeCameraOptions): coord3 {
    if (!opts.position) throw new Error('position not defined');
    const lngLat = opts.position?.toLngLat();
    return [lngLat.lng, lngLat.lat, opts.position?.toAltitude()];
}

export function coordsFromCameraOptions(map: Map, opts: CameraOptions): coord3 {
    return coordsFromFreeCameraOptions(freeCameraOptionsFromCameraOptions(map, opts));
}

export function resolvePadding(map: Map, padding: ExtendedPaddingOptions = {}): PaddingOptions {
    const tr = (map as ExtendedMapGL).transform;
    return {
        top: _resolvePercent(padding?.top, tr.height),
        bottom: _resolvePercent(padding?.bottom, tr.height),
        left: _resolvePercent(padding?.left, tr.width),
        right: _resolvePercent(padding?.right, tr.width),
    };
}

// Check if solved:
// https://github.com/mapbox/mapbox-gl-js/issues/10190
export function freeCameraOptionsFromCameraOptions(map: Map, opts: CameraOptions): FreeCameraPosition {
    const tr = (map as ExtendedMapGL).transform.clone();
    tr.center = opts.center as LngLatLike;
    tr.zoom = opts.zoom as number;
    tr.bearing = opts.bearing ?? 0;
    tr.pitch = opts.pitch ?? 0;
    return tr.getFreeCameraOptions();
}

// Check if solved:
// https://github.com/mapbox/mapbox-gl-js/issues/10190
export function cameraOptionsFromFreeCameraOptions(map: Map, opts: FreeCameraOptions): CameraPosition {
    const tr = (map as ExtendedMapGL).transform.clone();
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

function _boundsFromCenterRadiusAndBearing(center: coord2, radius: number, bearing: number): LngLatBounds {
    const circle = turfCircle(center, radius, { units: 'kilometers' });
    const bbox = turfBbox(circle);
    const bboxPolygon = turfBboxPolygon(bbox);
    const rotatedPolygon = turfTransformRotate(bboxPolygon, bearing);
    const vertices = rotatedPolygon.geometry.coordinates[0].slice(0, 4) as coord2[];
    return new LngLatBounds([vertices[0], vertices[2]]);
}

function _pitchFromCoords(
    cameraCoords: coord2,
    cameraAltitude: number,
    targetCoords: coord2,
    targetAltitude = 0,
): number {
    const groundDistance = turfDistance(cameraCoords, targetCoords);
    const rad = Math.atan2(cameraAltitude - targetAltitude, groundDistance);
    const deg = rad / (Math.PI / 180);
    return (90 - deg) % 360;
}

function _zoomToAltitude(map: Map, lat: number, zoom: number): number {
    const merc = MercatorCoordinate.fromLngLat([0, lat]);
    merc.z = (map as ExtendedMapGL).transform._mercatorZfromZoom(zoom);
    return merc.toAltitude();
}

function _altitudeToZoom(map: Map, lat: number, altitude: number): number {
    const merc = MercatorCoordinate.fromLngLat([0, lat], altitude) as Required<MercatorCoordinate>;
    return (map as ExtendedMapGL).transform._zoomFromMercatorZ(merc.z);
}

function _resolvePercent(value: string | number | undefined, full: number): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (!value.trim().endsWith('%')) throw new Error(`Not a percentage: ${value}`);
    const result = full * (parseFloat(value) / 100);
    if (Number.isNaN(result)) throw new Error(`Invalid value: ${value}`);
    return result;
}