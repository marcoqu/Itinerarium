import turfBearing from '@turf/bearing';
import { FlyToOptions, LngLat, MapboxOptions } from 'mapbox-gl';
import { CameraFramingData, CameraPosition, coord3 } from './Camera';
import { ExtendedMapGL } from './ExtendedMapGl';
export declare class CameraMap {
    private _mapGL;
    private _mapStyle;
    get mapGL(): ExtendedMapGL;
    constructor(mapOptions: MapboxOptions);
    ready(): Promise<void>;
    setStyle(styleUrl?: string): void;
    getStyle(): string | undefined;
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
