import turfBbox from '@turf/bbox';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfCircle from '@turf/circle';
import turfTransformRotate from '@turf/transform-rotate';
import turfBearing from '@turf/bearing';
import turfDistance from '@turf/distance';
import { CAMERA_FOV, Projection } from 'threebox';

import { FlyToOptions, Map as MapGL, LngLat, MapboxOptions } from 'mapbox-gl';
import { CameraFramingData, CameraPosition, coord2, coord3 } from './Camera';
import { ExtendedMapGL } from './ExtendedMapGl';
import { clamp, toDegrees, wrap } from '../utils/math';

export class CameraMap {
    private _mapGL: ExtendedMapGL;
    private _mapStyle: string | undefined;

    public get mapGL(): ExtendedMapGL {
        return this._mapGL;
    }

    public constructor(mapOptions: MapboxOptions) {
        this._mapGL = new MapGL(mapOptions) as ExtendedMapGL;
    }

    public async ready(): Promise<void> {
        if (this._mapGL.loaded()) return;
        if (this._mapGL.isStyleLoaded()) return;
        return new Promise((resolve, reject) => {
            const onDataEvent = async () => {
                await this.ready();
                resolve();
            };
            const onError = () => {
                console.error('Map Loading error');
                reject();
            };
            this._mapGL.once('styledata', onDataEvent);
            this._mapGL.once('load', onDataEvent);
            this._mapGL.once('error', onError);
        });
    }

    public setStyle(styleUrl?: string): void {
        this._mapStyle = styleUrl;
        if (!this._mapStyle) return;
        this._mapGL.setStyle(this._mapStyle);
    }

    public getStyle(): string | undefined {
        return this._mapStyle;
    }

    public setInteractive(interactive: boolean): void {
        const action = interactive ? 'enable' : 'disable';
        this._mapGL.scrollZoom[action]();
        this._mapGL.boxZoom[action]();
        this._mapGL.dragRotate[action]();
        this._mapGL.dragPan[action]();
        this._mapGL.keyboard[action]();
        this._mapGL.doubleClickZoom[action]();
        this._mapGL.touchZoomRotate[action]();
    }

    public update3D(): void {
        // if (!this._mapGL || !this._mapGL.loaded()) throw new Error('Map not initialized yet');
        this._mapGL.triggerRepaint();
    }

    public async flyTo(options: FlyToOptions): Promise<void> {
        return new Promise((resolve) => {
            if (!this._mapGL) throw new Error('Map not initialized yet');
            const onMoveEnd = (): void => {
                if (!this._mapGL) throw new Error('Map not initialized yet');
                resolve();
                this._mapGL.off('moveend', onMoveEnd);
            };
            this._mapGL.on('moveend', onMoveEnd);
            this._mapGL.flyTo(options);
        });
    }

    public getCameraFromFraming(framing: CameraFramingData): CameraPosition {
        const fr = { ...framing };

        if (fr.center && fr.radius) {
            const bbox = rectFromCenterRadiusAndAngle(fr.center, fr.radius, fr.bearing);
            fr.bounds = [bbox[0], bbox[2]];
        } else if (!fr.bounds || !fr.bounds.length) {
            throw new Error('Framing data needs either bounds or center and radius');
        }

        const cameraOptions = this._mapGL._cameraForBoxAndBearing(fr.bounds[0], fr.bounds[1], fr.bearing, {
            padding: {
                top: resolvePercent(fr.padding?.top, this._mapGL.transform.height),
                bottom: resolvePercent(fr.padding?.bottom, this._mapGL.transform.height),
                left: resolvePercent(fr.padding?.left, this._mapGL.transform.width),
                right: resolvePercent(fr.padding?.right, this._mapGL.transform.width),
            },
        });

        if (!cameraOptions) throw new Error('No valid camera found');

        return {
            zoom: cameraOptions.zoom as number,
            bearing: cameraOptions.bearing as number,
            pitch: framing.pitch as number,
            center: LngLat.convert(cameraOptions.center as [number, number]),
        };
    }

    public zoomCenterFromCoords(coords: coord3): { center: LngLat; zoom: number } {
        const center = LngLat.convert([coords[0], coords[1]]);
        const zoom = this.altitudeToZoom(coords[1], coords[2]);
        return { center, zoom };
    }

    public cameraFromTarget(eye: coord3, target: coord3): CameraPosition {
        const bearing = bearingFromCoords(eye, target);
        const pitch = pitchFromCoords(eye, target);
        return { ...this.zoomCenterFromCoords(eye), pitch, bearing };
    }

    public coordsFromCamera(pos: CameraPosition): coord3 {
        if (!this.mapGL) throw new Error('MapGL not initialized yet.');
        const zoom = clamp(pos.zoom, this.mapGL.getMinZoom(), this.mapGL.getMaxZoom());
        const height = this.zoomToAltitude(pos.center.lat, zoom);
        return [pos.center.lng, pos.center.lat, height];
    }

    public cameraToCenterDistance(): number {
        const halfFov = CAMERA_FOV / 2;
        return (0.5 / Math.tan(halfFov)) * this.mapGL.transform.height;
    }

    public zoomToAltitude(lat: number, zoom: number): number {
        const scale = Projection.zoomToScale(zoom) * (Projection.TILE_SIZE / Projection.WORLD_SIZE);
        const pxPerMeter = Projection.projectedUnitsPerMeter(lat) * scale;
        return this.cameraToCenterDistance() / pxPerMeter;
    }

    public altitudeToZoom(lat: number, height: number): number {
        const pxPerMeter = this.cameraToCenterDistance() / height;
        const scale =
            pxPerMeter / Projection.projectedUnitsPerMeter(lat) / (Projection.TILE_SIZE / Projection.WORLD_SIZE);
        return Projection.scaleToZoom(scale);
    }
}

function resolvePercent(value: string | number | undefined, full: number): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (!value.trim().endsWith('%')) throw new Error(`Not a percentage: ${value}`);
    const result = full * (parseFloat(value) / 100);
    if (Number.isNaN(result)) throw new Error(`Invalid value: ${value}`);
    return result;
}

function rectFromCenterRadiusAndAngle(center: coord2, radius: number, angle: number): [coord2, coord2, coord2, coord2] {
    const circle = turfCircle(center, radius, { units: 'kilometers' });
    const bbox = turfBbox(circle);
    const bboxPolygon = turfBboxPolygon(bbox);
    const rotatedPolygon = turfTransformRotate(bboxPolygon, angle);
    const vertices = rotatedPolygon.geometry.coordinates[0].slice(0, 4);
    return vertices as [coord2, coord2, coord2, coord2];
}

export const bearingFromCoords = turfBearing;

export function pitchFromCoords(eye: coord3, target: coord3): number {
    const altitude = eye[2];
    const groundDistance = turfDistance(eye, target);
    const rad = Math.atan2(altitude - target[2], groundDistance);
    return wrap(90 - toDegrees(rad), 0, 360);
}
