import localize from './localize';
import {
  RoborockVacuumCardConfig,
  RoborockCleaningMode,
  RoborockSuctionMode,
  RoborockMopMode,
  RoborockRouteMode,
} from './types';

export default function buildConfig(
  config?: Partial<RoborockVacuumCardConfig>
): RoborockVacuumCardConfig {
  if (!config) {
    throw new Error(localize('error.invalid_config'));
  }

  if (!config.entity) {
    throw new Error(localize('error.missing_entity'));
  }

  const default_modes = {
    [RoborockCleaningMode.VacAndMop]: {
      suction: RoborockSuctionMode.Balanced,
      mop: RoborockMopMode.Moderate,
      route: RoborockRouteMode.Standard,
    },
    [RoborockCleaningMode.Mop]: {
      suction: RoborockSuctionMode.Balanced,
      mop: RoborockMopMode.Moderate,
      route: RoborockRouteMode.Deep,
    },
    [RoborockCleaningMode.Vac]: {
      suction: RoborockSuctionMode.Turbo,
      mop: RoborockMopMode.Moderate,
      route: RoborockRouteMode.Standard,
    },
  };

  return {
    entity: config.entity,
    stats: config.stats ?? {},
    areas: config.areas ?? [],
    default_mode: RoborockCleaningMode.VacAndMop,
    default_modes: { ...config.default_modes, ...default_modes }
  };
}