import { Map, LngLatLike, CameraOptions, AnimationOptions, CameraForBoundsOptions } from 'mapbox-gl';
export interface ExtendedMapGL extends Map {
    transform: {
        width: number;
        height: number;
    };
    _cameraForBoxAndBearing(p1: LngLatLike, p2: LngLatLike, bearing: number, options?: CameraForBoundsOptions): undefined | (CameraOptions & AnimationOptions);
}
