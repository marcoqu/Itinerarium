import { Map, LngLatLike, LngLatBoundsLike, CameraOptions, FreeCameraOptions, PaddingOptions, MercatorCoordinate } from 'mapbox-gl';
export declare type CameraPosition = Required<CameraOptions>;
export declare type FreeCameraPosition = FreeCameraOptions & {
    position: MercatorCoordinate;
    orientation: [number, number, number, number];
};
export declare type coord2 = [number, number];
export declare type coord3 = [number, number, number];
export declare type ExtendedPaddingOptions = {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
};
export declare function getCameraFromBoxAndBearing(map: Map, bounds: LngLatBoundsLike, bearing: number, padding?: PaddingOptions, maxZoom?: number): FreeCameraPosition;
export declare function getCameraFromCircleAndBearing(map: Map, center: LngLatLike, radius: number, bearing: number, padding?: PaddingOptions, maxZoom?: number): FreeCameraPosition;
export declare function getCameraFromPositionAndTarget(map: Map, cameraLngLat: LngLatLike, cameraAltitude: number, targetLngLat?: LngLatLike, padding?: PaddingOptions): FreeCameraPosition;
export declare function coordsFromFreeCameraOptions(opts: FreeCameraOptions): coord3;
export declare function coordsFromCameraOptions(map: Map, opts: CameraOptions): coord3;
export declare function resolvePadding(map: Map, padding?: ExtendedPaddingOptions): PaddingOptions;
export declare function freeCameraOptionsFromCameraOptions(map: Map, opts: CameraOptions): FreeCameraPosition;
export declare function cameraOptionsFromFreeCameraOptions(map: Map, opts: FreeCameraOptions): CameraPosition;
export declare function zoomToAltitude(map: Map, lat: number, zoom: number): number;
export declare function altitudeToZoom(map: Map, lat: number, altitude: number): number;
