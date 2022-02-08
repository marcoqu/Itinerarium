import turfBbox from '@turf/bbox';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfCircle from '@turf/circle';
import turfTransformRotate from '@turf/transform-rotate';
import turfBearing from '@turf/bearing';
import turfDistance from '@turf/distance';

import {
    Map as MapGL,
    LngLat,
    LngLatLike,
    LngLatBoundsLike,
    CameraOptions,
    FreeCameraOptions,
    MercatorCoordinate,
    PaddingOptions,
    LngLatBounds,
} from 'mapbox-gl';

type coord2 = [number, number];
type coord3 = [number, number, number];

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
    getFreeCameraOptions(): FreeCameraOptions;
    setFreeCameraOptions(options: FreeCameraOptions): void;
};

interface ExtendedMapGL extends MapGL {
    transform: Transform;
}

export class CameraHelper {
    private _mapGL: ExtendedMapGL;

    public get mapGL(): MapGL {
        return this._mapGL;
    }

    public constructor(map: MapGL) {
        this._mapGL = map as ExtendedMapGL;
    }

    public getCameraFromBoxAndBearing(
        bounds: LngLatBoundsLike,
        bearing: number,
        padding?: PaddingOptions,
        maxZoom?: number,
    ): FreeCameraOptions {
        const cameraOptions = this._mapGL.cameraForBounds(bounds, { bearing, padding, maxZoom });
        if (!cameraOptions) throw new Error('No valid camera found');
        return this._freeCameraOptionsFromCameraOptions(cameraOptions);
    }

    public getCameraFromCircleAndBearing(
        center: LngLatLike,
        radius: number,
        bearing: number,
        padding?: PaddingOptions,
        maxZoom?: number,
    ): FreeCameraOptions {
        const lngLat = LngLat.convert(center).toArray() as coord2;
        const box = this._boundsFromCenterRadiusAndBearing(lngLat, radius, bearing);
        return this.getCameraFromBoxAndBearing(box, bearing, padding, maxZoom);
    }

    public getCameraFromPositionAndTarget(
        cameraLngLat: LngLatLike,
        cameraAltitude: number,
        targetLngLat?: LngLatLike,
        padding?: PaddingOptions,
    ): FreeCameraOptions {
        cameraLngLat = LngLat.convert(cameraLngLat).toArray() as coord2;
        targetLngLat = LngLat.convert(targetLngLat ?? cameraLngLat).toArray() as coord2;
        const bearing = turfBearing(cameraLngLat, targetLngLat);
        const pitch = this._pitchFromCoords(cameraLngLat, cameraAltitude, targetLngLat);
        return this._freeCameraOptionsFromCameraOptions({
            center: cameraLngLat,
            zoom: this._altitudeToZoom(cameraLngLat[0], cameraAltitude),
            pitch,
            bearing,
            padding,
        });
    }

    public coordsFromFreeCameraOptions(opts: FreeCameraOptions): coord3 {
        if (!opts.position) throw new Error('position not defined');
        const lngLat = opts.position?.toLngLat();
        return [lngLat.lat, lngLat.lng, opts.position?.toAltitude()];
    }

    public coordsFromCameraOptions(opts: CameraOptions): coord3 {
        return this.coordsFromFreeCameraOptions(this._freeCameraOptionsFromCameraOptions(opts));
    }

    // Check if solved:
    // https://github.com/mapbox/mapbox-gl-js/issues/10190
    private _freeCameraOptionsFromCameraOptions(opts: CameraOptions): FreeCameraOptions {
        const tr = this._mapGL.transform.clone();
        tr.center = opts.center as LngLatLike;
        tr.zoom = opts.zoom as number;
        tr.bearing = opts.bearing ?? 0;
        tr.pitch = opts.pitch ?? 0;
        return tr.getFreeCameraOptions();
    }

    // https://github.com/mapbox/mapbox-gl-js/issues/10190
    // private _cameraOptionsFromFreeCameraOptions(opts: FreeCameraOptions): CameraOptions {
    //     const tr = this._mapGL.transform.clone();
    //     tr.setFreeCameraOptions(opts);
    //     return {
    //         center: tr.center,
    //         zoom: tr.zoom,
    //         bearing: tr.bearing,
    //         pitch: tr.pitch,
    //         padding: tr.padding,
    //     };
    // }

    private _boundsFromCenterRadiusAndBearing(center: coord2, radius: number, bearing: number): LngLatBounds {
        const circle = turfCircle(center, radius, { units: 'kilometers' });
        const bbox = turfBbox(circle);
        const bboxPolygon = turfBboxPolygon(bbox);
        const rotatedPolygon = turfTransformRotate(bboxPolygon, bearing);
        const vertices = rotatedPolygon.geometry.coordinates[0].slice(0, 4) as coord2[];
        return new LngLatBounds([vertices[0], vertices[2]]);
    }

    private _pitchFromCoords(
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

    // private _zoomToAltitude(lat: number, zoom: number): number {
    //     const merc = MercatorCoordinate.fromLngLat([0, lat]);
    //     merc.z = this._mapGL.transform._mercatorZfromZoom(zoom);
    //     return merc.toAltitude();
    // }

    private _altitudeToZoom(lat: number, altitude: number): number {
        const merc = MercatorCoordinate.fromLngLat([0, lat], altitude) as Required<MercatorCoordinate>;
        return this._mapGL.transform._zoomFromMercatorZ(merc.z);
    }
}

// type CameraFraming = {
//     bearing: number;
//     pitch: number;
//     padding?: Padding;
// };

// export type CenterFraming = {
//     center: coord2;
//     radius: number;
// } & CameraFraming;

// export type BoundsFraming = {
//     bounds: [coord2, coord2];
// } & CameraFraming;

// export type ExtendedPaddingOptions = {
//     top?: number | string;
//     bottom?: number | string;
//     left?: number | string;
//     right?: number | string;
// };

// function normalizeFraming(framing: CenterFraming | BoundsFraming): BoundsFraming {
//     if ('center' in framing && 'radius' in framing) {
//         const bbox = rectFromCenterRadiusAndAngle(framing.center, framing.radius, framing.bearing);
//         return {
//             bounds: [bbox[0], bbox[2]],
//             bearing: framing.bearing,
//             pitch: framing.pitch,
//             padding: framing.padding,
//         };
//     } else {
//         return framing;
//     }
// }

// private _resolvePercent(value: string | number | undefined, full: number): number {
//     if (!value) return 0;
//     if (typeof value === 'number') return value;
//     if (!value.trim().endsWith('%')) throw new Error(`Not a percentage: ${value}`);
//     const result = full * (parseFloat(value) / 100);
//     if (Number.isNaN(result)) throw new Error(`Invalid value: ${value}`);
//     return result;
// }

// public getCameraFromFraming(framing: BoundsFraming | CenterFraming): CameraPosition {
//     const fr = normalizeFraming(framing);

//     const cameraOptions = this._mapGL.cameraForBounds(fr.bounds, {
//         bearing: fr.bearing,
//         pitch: fr.pitch, // ...but cameraForBounds() doesn't care about pitch :(
//         padding: this.resolvePadding(framing.padding),
//     });

//     if (!cameraOptions) throw new Error('No valid camera found');

//     return {
//         zoom: cameraOptions.zoom,
//         bearing: cameraOptions.bearing,
//         pitch: framing.pitch,
//         center: LngLat.convert(cameraOptions.center),
//     };
// }

// private _resolvePadding(padding: ExtendedPaddingOptions = {}): PaddingOptions {
//     return {
//         top: this._resolvePercent(padding?.top, this._mapGL.transform.altitude),
//         bottom: this._resolvePercent(padding?.bottom, this._mapGL.transform.altitude),
//         left: this._resolvePercent(padding?.left, this._mapGL.transform.width),
//         right: this._resolvePercent(padding?.right, this._mapGL.transform.width),
//     };
// }

// ===================================

// public async ready(): Promise<void> {
//     if (this._mapGL.loaded()) return;
//     if (this._mapGL.isStyleLoaded()) return;
//     return new Promise((resolve, reject) => {
//         const onDataEvent = async () => {
//             await this.ready();
//             resolve();
//         };
//         const onError = () => {
//             console.error('Map Loading error');
//             reject();
//         };
//         this._mapGL.once('styledata', onDataEvent);
//         this._mapGL.once('load', onDataEvent);
//         this._mapGL.once('error', onError);
//     });
// }

// public setInteractive(interactive: boolean): void {
//     const action = interactive ? 'enable' : 'disable';
//     this._mapGL.scrollZoom[action]();
//     this._mapGL.boxZoom[action]();
//     this._mapGL.dragRotate[action]();
//     this._mapGL.dragPan[action]();
//     this._mapGL.keyboard[action]();
//     this._mapGL.doubleClickZoom[action]();
//     this._mapGL.touchZoomRotate[action]();
// }

// public update3D(): void {
//     // if (!this._mapGL || !this._mapGL.loaded()) throw new Error('Map not initialized yet');
//     this._mapGL.triggerRepaint();
// }

// public async flyTo(options: FlyToOptions): Promise<void> {
//     return new Promise((resolve) => {
//         if (!this._mapGL) throw new Error('Map not initialized yet');
//         const onMoveEnd = (): void => {
//             if (!this._mapGL) throw new Error('Map not initialized yet');
//             resolve();
//             this._mapGL.off('moveend', onMoveEnd);
//         };
//         this._mapGL.on('moveend', onMoveEnd);
//         this._mapGL.flyTo(options);
//     });
// }
