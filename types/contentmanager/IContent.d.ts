import { VoidSyncEvent } from 'ts-events';
export interface IContent {
    low: number;
    high: number;
    intervalChanged: VoidSyncEvent;
    setPosition(position: number): void;
    setVisibility(visible: boolean): void;
}
export declare type KeyframePositionType = 'absolute' | 'end' | 'start';
export declare type ParsedInterpolationStop<ValueT = unknown> = InterpolationStop<ValueT> & {
    absolutePosition: number;
    type: KeyframePositionType;
};
export declare type InterpolationStop<T = unknown> = {
    position: number | string;
    value: T;
    easing?: D3EasingType;
};
export interface IContentData {
    type: string;
    low: number;
    high: number;
    interpolators?: Record<string, InterpolationStop<unknown>[]>;
    required?: boolean;
}
export declare type D3EasingType = 'easeLinear' | 'easeQuad' | 'easeQuadIn' | 'easeQuadOut' | 'easeQuadInOut' | 'easeCubic' | 'easeCubicIn' | 'easeCubicOut' | 'easeCubicInOut' | 'easeSin' | 'easeSinIn' | 'easeSinOut' | 'easeSinInOut' | 'easeExp' | 'easeExpIn' | 'easeExpOut' | 'easeExpInOut' | 'easeCircle' | 'easeCircleIn' | 'easeCircleOut' | 'easeCircleInOut' | 'easeBounce' | 'easeBounceIn' | 'easeBounceOut' | 'easeBounceInOut';
