/**
 * Film entity as returned by SWAPI `/films/:id`.
 * Reference fields contain canonical resource URLs (strings).
 * Date fields are ISO strings (e.g., '1977-05-25').
 */
export interface Film {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: Array<string>;
  planets: Array<string>;
  starships: Array<string>;
  vehicles: Array<string>;
  species: Array<string>;
  created: string;
  edited: string;
  url: string;
}

/**
 * Generic paginated list response from SWAPI.
 * `next`/`previous` are page URLs or null when no further pages exist.
 */
export interface FilmListResponse<Film> {
  count: number;
  next: string | null;
  previous: string | null;
  results: Film[];
}
