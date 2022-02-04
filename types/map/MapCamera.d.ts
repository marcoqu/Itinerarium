import turfBearing from '@turf/bearing';
import { FlyToOptions, Map as MapGL, LngLat } from 'mapbox-gl';
import { CameraFramingData, CameraPosition, coord3 } from './Camera';
import { ExtendedMapGL } from './ExtendedMapGl';
export declare class MapCamera {
    private _mapGL;
    get mapGL(): ExtendedMapGL;
    constructor(map: MapGL);
    ready(): Promise<void>;
    setInteractive(interactive: boolean): void;
    update3D(): void;
    flyTo(options: FlyToOptions): Promise<void>;
    getCameraFromFraming(framing: CameraFramingData): CameraPosition;
    zoomCenterFromCoords(coords: coord3): {
        center: LngLat;
        zoom: number;
    };
    cameraFromTarget(eye: coord3, target: coord3): CameraPosition;
    coordsFromCamera(pos: CameraPosition): coord3;
    cameraToCenterDistance(): number;
    zoomToAltitude(lat: number, zoom: number): number;
    altitudeToZoom(lat: number, height: number): number;
}
export declare const bearingFromCoords: typeof turfBearing;
export declare function pitchFromCoords(eye: coord3, target: coord3): number;
