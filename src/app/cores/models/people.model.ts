/**
 * Person entity as returned by SWAPI `/people/:id`.
 * Many numeric-looking fields (height, mass) are strings in SWAPI.
 * Reference fields contain canonical resource URLs (strings).
 */
export interface People {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: Array<string>;
  species: Array<string>;
  vehicles: Array<string>;
  starships: Array<string>;
  created: string;
  edited: string;
  url: string;
}

/**
 * Paginated list response for people from SWAPI.
 * `next`/`previous` are page URLs or null when no further pages exist.
 */
export interface PeopleListResponse<People> {
  count: number;
  next: string | null;
  previous: string | null;
  results: People[];
}
