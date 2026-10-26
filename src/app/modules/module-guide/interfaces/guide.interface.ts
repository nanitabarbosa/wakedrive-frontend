export interface GuideStep {
  /** Selector CSS del elemento a resaltar. Sin selector, el paso se muestra centrado. */
  selector?: string;
  title: string;
  description: string;
}

export interface GuideTour {
  title: string;
  steps: GuideStep[];
}

export type GuidePlacement = 'top' | 'bottom' | 'center';

export interface GuideRect {
  top: number;
  left: number;
  width: number;
  height: number;
}
