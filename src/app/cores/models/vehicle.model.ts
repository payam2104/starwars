/**
 * Vehicle entity as returned by SWAPI `/vehicles/:id`.
 * Many numeric-looking fields are strings in SWAPI.
 * Reference fields contain canonical resource URLs.
 */
export interface Vehicle {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  vehicle_class: string;
  pilots: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

/**
 * Paginated list response for vehicles from SWAPI.
 * `next`/`previous` are page URLs or null when no further pages exist.
 */
export interface VehicleListResponse<Vehicle> {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vehicle[];
}
