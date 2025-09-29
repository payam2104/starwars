import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, finalize, from, map, mergeMap, Observable, of, tap } from 'rxjs';
import { People, PeopleListResponse } from '../../models/people.model';
import { HelperService } from '../helper/helper.service';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  private http = inject(HttpClient);
  private helper = inject(HelperService);
  // Base endpoint for people (e.g., https://swapi.dev/api/people/)
  private url = this.helper.tsmsUrl('people');
  // Local detail cache to avoid refetching individuals
  private cachedPeople: People[] = [];

  // Signals: list, single, loading, and error
  private _peopleList = signal<People[]>([]);
  readonly peopleList = this._peopleList.asReadonly();

  private _people = signal<People | null>(null);
  readonly people = this._people.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  /**
   * Load all people unless already present in the list signal.
   * Returns an Observable that emits the current (possibly cached) list once.
   */
  getAllPeople(): Observable<People[]> {
    this._error.set(null);

    // Serve cached list if available
    const cache = this._peopleList();
    if (cache.length) {
      return of([...cache]);
    }

    this._loading.set(true);
    this._peopleList.set([]);

    return this.http.get<PeopleListResponse<People>>(this.url).pipe(
      // Note: subtracting strings (`a.url - b.url`) yields NaN.
      // Consider extracting numeric IDs from URLs for a stable sort.
      map(res => res.results.slice().sort((a: any, b: any) => a.url - b.url)),
      tap(list => this._peopleList.set(list)),
      catchError((err: HttpErrorResponse) => {
        this._error.set(this.helper.formatError(err));
        return of([]); // keep stream alive with empty list
      }),

      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Load a single person by ID (from route), using the detail cache when possible.
   * Emits the person or null on error.
   */
  getPeople(id: string): Observable<People | null> {
    this._error.set(null);

    // Build canonical resource URL (SWAPI uses trailing slashes)
    const base = this.url.endsWith('/') ? this.url : this.url + '/';
    const wantedUrl = `${base}${id}/`;

    // Serve from detail cache if present
    const hit = this.cachedPeople.find(p => p.url === wantedUrl) ?? null;
    if (hit) {
      this._people.set(hit);
      return of(hit);
    }

    this._loading.set(true);
    this._people.set(null);

    return this.http.get<People>(wantedUrl).pipe(
      tap(people => {
        this._people.set(people);
        // De-duplicate before pushing into detail cache
        if (!this.cachedPeople.some(p => p.url === people.url)) {
          this.cachedPeople.push(people);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._error.set(this.helper.formatError(err));
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Ensure a set of person URLs is loaded and merged into the list cache.
   * - Deduplicates `urls` and skips URLs already in the detail cache.
   * - Bounded concurrency controls parallel requests (default 3).
   * Side effect only; updates signals internally.
   */
  getAllPeopleSeparated(urls: string[], concurrency = 3): void {
    this._error.set(null);
    
    // Filter out already-cached URLs
    const notLoaded = Array.from(new Set(urls))
    .filter(u => !this.cachedPeople.some(x => x.url === u));
    
    if (notLoaded.length) {
      this._loading.set(true);
      from(notLoaded).pipe(
        // Fetch in parallel with bounded concurrency
        mergeMap(url =>
          this.http.get<People>(url).pipe(
            tap(p => {
              // Merge into list signal: replace if exists, append otherwise
              this._peopleList.update(prev => {
                const i = prev.findIndex(x => x.url === p.url);
                return i >= 0 ? prev.map((x, idx) => (idx === i ? p : x)) : [...prev, p];
              });

              // Maintain detail cache
              if (!this.cachedPeople.some(x => x.url === p.url)) {
                this.cachedPeople.push(p);
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
