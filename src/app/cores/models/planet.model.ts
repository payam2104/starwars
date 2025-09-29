/**
 * Planet entity as returned by SWAPI `/planets/:id`.
 * Numeric-looking fields (periods, diameter, population) are strings in SWAPI.
 * Reference fields use canonical resource URLs.
 */
export interface Planet {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}
