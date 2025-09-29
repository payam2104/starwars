import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, finalize, from, map, mergeMap, Observable, of, tap } from 'rxjs';
import { Vehicle, VehicleListResponse } from '../../models/vehicle.model';
import { HelperService } from '../helper/helper.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private helper = inject(HelperService);
  private http = inject(HttpClient);
  // Base endpoint for vehicles (e.g., https://swapi.dev/api/vehicles/)
  private url = this.helper.tsmsUrl('vehicles');
  // Detail cache for single-vehicle fetches
  private cachedVehicle: Vehicle[] = [];
  // List/detail cache for batch URL-based fetches
  private cachedVehicles: Vehicle[] = [];

  // Signals: collection, selected item, loading, listLoaded flag, and error
  private _vehicles = signal<Vehicle[]>([]);
  readonly vehicles = this._vehicles.asReadonly();

  private _vehicle = signal<Vehicle | null>(null);
  readonly vehicle = this._vehicle.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _listLoaded = signal(false);

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  /**
   * Load all vehicles unless already cached once.
   * Emits the list (sorted) or completes empty on error.
   */
  getAllVehicles(): Observable<Vehicle[]> {
    this._error.set(null);

    // Serve cached list if already loaded
    const cache = this._vehicles();
    if (cache.length && this._listLoaded()) {
      return of([...cache]);
    }

    this._loading.set(true);
    this._vehicles.set([]);

    return this.http.get<VehicleListResponse<Vehicle>>(this.url).pipe(
      // Note: subtracting strings (`a.url - b.url`) yields NaN.
      // Consider sorting by extracted numeric ID for stability.
      map(res => res.results.slice().sort((a: any, b: any) => a.url - b.url)),
      tap(list => {
        this._vehicles.set(list);
        this._listLoaded.set(true);
      }),
      catchError((err: HttpErrorResponse) => {
        this._error.set(this.helper.formatError(err));
        return EMPTY;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Load a single vehicle by ID (from route), using the detail cache when possible.
   * Emits the vehicle or null on error.
   * @param id 
   * @returns observable
   */
  getVehicle(id: string): Observable<Vehicle | null> {
    this._error.set(null);

    // Build canonical resource URL (SWAPI uses trailing slashes)
    const base = this.url.endsWith('/') ? this.url : this.url + '/';
    const wantedUrl = `${base}${id}/`;

    // Serve from detail cache if present
    const hit = this.cachedVehicle.find(v => v.url === wantedUrl) ?? null;
    if (hit) {
      this._vehicle.set(hit);
      return of(hit);
    }

    this._loading.set(true);
    this._vehicle.set(null);

    return this.http.get<Vehicle>(wantedUrl).pipe(
      tap(vehicle => {
        this._vehicle.set(vehicle);
        // De-duplicate before pushing into the detail cache
        if (!this.cachedVehicle.some(v => v.url === vehicle.url)) {
          this.cachedVehicle.push(vehicle);
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
   * Ensure a set of vehicle URLs is loaded and merged into the list cache.
   * - Deduplicates input URLs and skips already cached entries.
   * - `concurrency` controls parallel HTTP requests.
   * Side effect only; updates signals internally.
   * @param urls
   * @param concurrency
   */
  getAllVehiclesSeparated(urls: string[], concurrency = 3): void {
    this._error.set(null);

    const notLoaded = Array.from(new Set(urls))
      .filter(u => !this.cachedVehicles.some(x => x.url === u));

    if (!notLoaded.length) return;

    this._loading.set(true);

    from(notLoaded).pipe(
      // Fetch with bounded concurrency
      mergeMap(url =>
        this.http.get<Vehicle>(url).pipe(
          tap(v => {
            // Merge into vehicles signal: replace if exists, append otherwise
            this._vehicles.update(prev => {
              const idx = prev.findIndex(x => x.url === v.url);
              if (idx >= 0) {
                const copy = prev.slice();
                copy[idx] = v;
                return copy;
              }
              return [...prev, v];
            });

            // Maintain batch cache
            if (!this.cachedVehicles.some(x => x.url === v.url)) {
              this.cachedVehicles.push(v);
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
