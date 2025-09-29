import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, finalize, from, map, mergeMap, Observable, of, tap } from 'rxjs';
import { HelperService } from '../helper/helper.service';
import { Film, FilmListResponse } from '../../models/film.model';

@Injectable({
  providedIn: 'root'
})
export class FilmService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  // Base endpoint for films (e.g., https://swapi.dev/api/films/)
  private url = this.helper.tsmsUrl('films');
  // Local detail cache to avoid re-fetching individual films
  private cachedFilms: Film[] = [];

  // Signals: list, single, loading, listLoaded flag, and error
  private _films = signal<readonly Film[]>([]);
  readonly films = this._films.asReadonly();

  private _film = signal<Film | null>(null);
  readonly film = this._film.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _listLoaded = signal(false);

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  /**
   * Load all films unless already cached.
   * Returns an Observable that emits the (sorted) list once.
   */
  getAllFilms(): Observable<Film[]> {
    this._error.set(null);

    // Return cached list if already loaded once
    const cache = this._films();
    if (cache.length && this._listLoaded()) {
      return of([...cache]);
    }

    this._loading.set(true);
    this._films.set([]);

    return this.http.get<FilmListResponse<Film>>(this.url).pipe(
      // Stable UI order by episode number
      map(res => res.results.slice().sort((a, b) => a.episode_id - b.episode_id)),
      tap(list => {
        this._films.set(list);
        this._listLoaded.set(true);
      }),
      catchError((err: HttpErrorResponse) => {
        this._error.set(this.helper.formatError(err));
        return EMPTY; // complete without emitting
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Load a single film by ID (from route), using detail cache when possible.
   * Emits the film or null on error.
   */
  getFilm(id: string): Observable<Film | null> {
    this._error.set(null);

    // Build canonical resource URL (SWAPI ends with trailing slash)
    const base = this.url.endsWith('/') ? this.url : this.url + '/';
    const wantedUrl = `${base}${id}/`;

    // Serve from detail cache if present
    const hit = this.cachedFilms.find(f => f.url === wantedUrl) ?? null;
    if (hit) {
      this._film.set(hit);
      return of(hit);
    }

    this._loading.set(true);
    this._film.set(null);

    return this.http.get<Film>(wantedUrl).pipe(
      tap(film => {
        this._film.set(film);
        // De-duplicate before pushing into the detail cache
        if (!this.cachedFilms.some(f => f.url === film.url)) {
          this.cachedFilms.push(film);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._error.set(this.helper.formatError(err));
        return of(null); // keep stream alive with null
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Ensure a set of film URLs is loaded and merged into the list cache.
   * - `urls` may contain duplicates; they are deduped.
   * - `concurrency` controls parallel requests (default 3–5 is reasonable).
   * Side effect only; updates signals internally.
   */
  getAllFilmsSeparated(urls: string[], concurrency = 3): void {
    this._error.set(null);
    
    // Only fetch URLs not already present in the detail cache
    const notLoaded = Array.from(new Set(urls))
    .filter(u => !this.cachedFilms.some(x => x.url === u));
    
    if (notLoaded.length) {
      this._loading.set(true);
      from(notLoaded).pipe(
        mergeMap(url =>
          this.http.get<Film>(url).pipe(
            tap(p => {
              // Merge into list signal: replace if exists, append otherwise
              this._films.update(prev => {
                const exists = prev.some(x => x.url === p.url);
                return exists
                  ? prev.map(x => (x.url === p.url ? p : x))
                  : [...prev, p];
              });

              // Maintain detail cache
              if (!this.cachedFilms.some(x => x.url === p.url)) {
                this.cachedFilms.push(p);
              }
            }),
            catchError(err => {
              this._error.set(this.helper.formatError(err));
              return EMPTY;
            })
          ),
          concurrency
        ),
        finalize(() => this._loading.set(false))
      ).subscribe();
    }
  }

}
