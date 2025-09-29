import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, finalize, from, mergeMap, tap } from 'rxjs';
import { Planet } from '../../models/planet.model';
import { HelperService } from '../helper/helper.service';

@Injectable({ providedIn: 'root' })
export class PlanetService {
  private helper = inject(HelperService);
  private http = inject(HttpClient);

  // Local detail cache to avoid refetching the same planets
  private cachedPlanets: Planet[] = [];

  // Signals: collection, loading, and error
  private _planets = signal<Planet[]>([]);
  readonly planets = this._planets.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  // Fast lookup map (url → planet) derived from the planets signal
  private planetIndex = computed(() => {
    const map = new Map<string, Planet>();
    for (const p of this._planets()) map.set(p.url, p);
    return map;
  });

  /**
   * Resolve a planet name from its canonical URL; shows a placeholder while loading
   * @param url 
   * @returns string
   */
  getPlanetName(url: string | null | undefined): string {
    if (!url) return '-';
    const found = this.planetIndex().get(url);
    return found?.name ?? 'Loading...';
  }

  /**
   * Ensure a specific planet is present in cache; triggers a targeted fetch if missing
   * @param url 
   */
  ensurePlanet(url: string | null | undefined): void {
    if (!url) return;
    if (!this.cachedPlanets.some(x => x.url === url)) {
      this.getAllPlanetsSeparated([url], 1);
    }
  }

  /**
   * Load a set of planet URLs and merge them into the list cache.
   * - Deduplicates input URLs and skips already cached entries.
   * - `concurrency` controls parallel HTTP requests.
   * Side effect only; updates signals internally.
   * @param urls
   */
  getAllPlanetsSeparated(urls: string[], concurrency = 3): void {
    this._error.set(null);

    const notLoaded = Array.from(new Set(urls))
      .filter(u => !this.cachedPlanets.some(x => x.url === u));

    if (!notLoaded.length) return;

    this._loading.set(true);

    from(notLoaded).pipe(
      mergeMap(url =>
        this.http.get<Planet>(url).pipe(
          tap(pl => {
            // Merge into planets signal: replace if exists, append otherwise
            this._planets.update(prev => {
              const idx = prev.findIndex(x => x.url === pl.url);
              if (idx >= 0) {
                const copy = prev.slice();
                copy[idx] = pl;
                return copy;
              }
              return [...prev, pl];
            });

            // Maintain local detail cache
            if (!this.cachedPlanets.some(x => x.url === pl.url)) {
              this.cachedPlanets.push(pl);
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
