import { Map, LngLatLike, LngLatBoundsLike, CameraOptions, FreeCameraOptions, PaddingOptions } from 'mapbox-gl';
export declare type coord2 = [number, number];
export declare type coord3 = [number, number, number];
export declare type ExtendedPaddingOptions = {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
};
export declare function getCameraFromBoxAndBearing(map: Map, bounds: LngLatBoundsLike, bearing: number, padding?: PaddingOptions, maxZoom?: number): FreeCameraOptions;
export declare function getCameraFromCircleAndBearing(map: Map, center: LngLatLike, radius: number, bearing: number, padding?: PaddingOptions, maxZoom?: number): FreeCameraOptions;
export declare function getCameraFromPositionAndTarget(map: Map, cameraLngLat: LngLatLike, cameraAltitude: number, targetLngLat?: LngLatLike, padding?: PaddingOptions): FreeCameraOptions;
export declare function coordsFromFreeCameraOptions(opts: FreeCameraOptions): coord3;
export declare function coordsFromCameraOptions(map: Map, opts: CameraOptions): coord3;
export declare function resolvePadding(map: Map, padding?: ExtendedPaddingOptions): PaddingOptions;
