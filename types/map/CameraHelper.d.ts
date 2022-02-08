import { Map as MapGL, LngLatLike, LngLatBoundsLike, CameraOptions, FreeCameraOptions, PaddingOptions } from 'mapbox-gl';
declare type coord3 = [number, number, number];
export declare class CameraHelper {
    private _mapGL;
    get mapGL(): MapGL;
    constructor(map: MapGL);
    getCameraFromBoxAndBearing(bounds: LngLatBoundsLike, bearing: number, padding?: PaddingOptions, maxZoom?: number): FreeCameraOptions;
    getCameraFromCircleAndBearing(center: LngLatLike, radius: number, bearing: number, padding?: PaddingOptions, maxZoom?: number): FreeCameraOptions;
    getCameraFromPositionAndTarget(cameraLngLat: LngLatLike, cameraAltitude: number, targetLngLat?: LngLatLike, padding?: PaddingOptions): FreeCameraOptions;
    coordsFromFreeCameraOptions(opts: FreeCameraOptions): coord3;
    coordsFromCameraOptions(opts: CameraOptions): coord3;
    private _freeCameraOptionsFromCameraOptions;
    private _boundsFromCenterRadiusAndBearing;
    private _pitchFromCoords;
    private _altitudeToZoom;
}
export {};
