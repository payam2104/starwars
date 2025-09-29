import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorComponent } from "../../shared/error/error";
import { VehicleService } from '../../../cores/services/vehicle/vehicle.service';
import { Loading } from "../../shared/loading/loading";
import { Card } from "../../shared/card/card";

@Component({
  selector: 'app-vehicles',
  imports: [Loading, ErrorComponent, Card],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss'
})
export class Vehicles {
  // Ensures RxJS subscriptions are cleaned up on component destroy
  private destroyRef = inject(DestroyRef);
  public vehicleService = inject(VehicleService);

  // Reactive view of the vehicles list from the service state (signal)
  public allVehicles = computed(() => this.vehicleService.vehicles());

  // Whitelist of vehicle IDs that have image assets available
  availableVehicleImgIds = new Set([4, 6, 7, 8, 14, 16, 18, 19, 20, 24]); // todo
  // Extract numeric ID from a canonical SWAPI URL (e.g., ".../vehicles/14/")
  idFromUrl = (u: string) => Number(u.match(/\/(\d+)\/$/)?.[1] ?? 0);
  // Predicate: does this vehicle have an image? (based on extracted ID)
  hasImage = (u: string) => this.availableVehicleImgIds.has(this.idFromUrl(u));

  // On initial render, load all vehicles; the service should cache results
  ngOnInit() {
    this.vehicleService.getAllVehicles()
      .pipe(takeUntilDestroyed(this.destroyRef)) // auto-unsubscribe on destroy
      .subscribe(); // side-effect: populates service signals (data/loading/error)
  }

}
