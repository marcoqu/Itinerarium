import { LngLat } from 'mapbox-gl';
import { D3EasingType } from './EasingTypes';

export type coord2 = [number, number];
export type coord3 = [number, number, number];

export type Padding = {
    top: number | string;
    bottom: number | string;
    left: number | string;
    right: number | string;
};

export type CameraFramingData = {
    bearing: number;
    pitch: number;
    padding?: Padding;
    easing?: D3EasingType;
    center?: coord2;
    radius?: number;
    bounds?: [coord2, coord2];
};

export interface CameraPosition {
    zoom: number;
    bearing: number;
    pitch: number;
    center: LngLat;
}
