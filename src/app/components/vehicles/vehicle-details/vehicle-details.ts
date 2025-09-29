import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { VehicleService } from '../../../cores/services/vehicle/vehicle.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { Loading } from "../../shared/loading/loading";
import { ErrorComponent } from "../../shared/error/error";
import { InfoContent } from "../../shared/infos-content/info-content/info-content";
import { Vehicle } from '../../../cores/models/vehicle.model';

@Component({
  selector: 'app-vehicle-details',
  imports: [Loading, ErrorComponent, InfoContent],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.scss'
})
export class VehicleDetails {
  // Ensures RxJS subscriptions are cleaned up on component destroy
  private destroyRef = inject(DestroyRef);
  public vehicleService = inject(VehicleService);

  // Vehicle ID comes from the route via input binding
  id = input.required<string>();
  // Normalized accessor for the route ID as a computed signal
  idInUrl = computed(() => this.id());

  // Set of vehicle IDs that have corresponding image assets
  availableVehicleImgIds = new Set([4, 6, 7, 8, 14, 16, 18, 19, 20, 24]); //todo
  // Whether this vehicle has an image in assets based on its numeric ID
  hasImage = computed(() => {
    const idNum = Number(this.idInUrl());
    return Number.isFinite(idNum) && this.availableVehicleImgIds.has(idNum);
  });

  // Selected vehicle from the service state
  public vehicle = computed(() => this.vehicleService.vehicle());

  // Surface service errors to the template
  readonly errorMsg = computed<string | null>(() => {
    return this.vehicleService.error()
      ?? null;
  });

  // Film URLs associated with this vehicle
  readonly filmUrls = computed(() => this.vehicle()?.films ?? []);

  // Resolve film URLs against a cache
  // Note: currently resolves against vehicles; consider FilmService and type Film[] instead
  readonly vehicleFilms = computed<Vehicle[]>(() => {
    const urls = this.filmUrls();
    if (!urls.length) return [];
    const map = new Map(this.vehicleService.vehicles().map(v => [v.url, v]));
    return urls.map(u => map.get(u)).filter((v): v is Vehicle => !!v);
  });

  // Load vehicle by ID; then batch-load related resources referenced by the vehicle
  ngOnInit() {
    this.vehicleService.getVehicle(this.idInUrl()).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(vehicle => {
        const vUrls = vehicle!.films ?? [];
        // Note: these are film URLs; consider using FilmService.getAllFilmsSeparated(...)
        if (vUrls.length) this.vehicleService.getAllVehiclesSeparated(vUrls, 5);
      })
    ).subscribe();
  }

}
