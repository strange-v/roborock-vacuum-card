import { TemplateResult, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';

export { HassEntity } from 'home-assistant-js-websocket';

export type TemplateNothing = typeof nothing;
export type Template = TemplateResult | TemplateNothing;

export class StringEvent extends CustomEvent<string> {}
export class StringArrayEvent extends CustomEvent<string[]> {}
export class NumberEvent extends CustomEvent<number> {}
export class NumberArrayEvent extends CustomEvent<number[]> {}

export interface Theme {
  "primary-color": string;
  "text-primary-color": string;
  "accent-color": string;
}
export interface Themes {
  default_theme: string;
  darkMode: boolean;
  themes: {
      [key: string]: Theme;
  };
}
export interface Area {
  area_id: string;
  icon?: string;
  name?: string;
}
export interface MyHomeAssistant extends HomeAssistant {
  areas: Record<string, Area>;
  themes: Themes
}

export enum RoborockCleaningMode {
  VacAndMop = 'vac&mop',
  Mop = 'mop',
  Vac = 'vac',
}
export enum RoborockSuctionMode {
  Off = 'off',
  Quiet = 'quiet',
  Balanced = 'balanced',
  Turbo = 'turbo',
  Max = 'max',
  MaxPlus = 'max_plus',
}
export enum RoborockMopMode {
  Off = 'off',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}
export enum RoborockRouteMode {
  Fast = 'fast',
  Standard = 'standard',
  Deep = 'deep',
  DeepPlus = 'deep_plus',
}
export interface RoborockArea {
  icon?: string;
  name?: string;
  area_id: string;
  roborock_area_id: number;
}

export interface Button<T> {
  icon?: string;
  text?: string;
  value: T;
}
export interface SvgButton<T> {
  icon?: Template;
  text?: string;
  value: T;
  disabled?: boolean;
}

export interface VacuumCardStat {
  entity?: string;
  attribute?: string;
  scale?: number
  divide_by?: number
  unit?: string;
  title?: string;
}

export interface VacuumArea {
  area_id: string;
  roborock_area_id: number;
}

export interface RoborockCleaningParameters {
  suction?: RoborockSuctionMode
  mop?: RoborockMopMode
  route?: RoborockRouteMode
}

export interface RoborockVacuumCardConfig {
  entity: string;
  stats: Record<string, VacuumCardStat[]>;
  areas?: VacuumArea[];
  default_mode?: RoborockCleaningMode;
  default_modes?: Record<RoborockCleaningMode, RoborockCleaningParameters>;
}

export interface RoborockSensorIds {
  cleaning: string;
  mopDrying: string;
  mopDryingRemainingTime: string;
  battery: string;
}