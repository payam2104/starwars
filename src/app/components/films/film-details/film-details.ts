import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { tap } from 'rxjs';
import { FilmService } from '../../../cores/services/film/film.service';
import { Loading } from "../../shared/loading/loading";
import { RomanPipe } from "../../../cores/pipes/roman.pipe";
import { InfoContent } from "../../shared/infos-content/info-content/info-content";
import { PeopleService } from '../../../cores/services/people/people.service';
import { PlanetService } from '../../../cores/services/planet/planet.service';
import { VehicleService } from '../../../cores/services/vehicle/vehicle.service';
import { People } from '../../../cores/models/people.model';
import { Planet } from '../../../cores/models/planet.model';
import { Vehicle } from '../../../cores/models/vehicle.model';
import { ErrorComponent } from "../../shared/error/error";

@Component({
  selector: 'app-film-details',
  imports: [Loading, RomanPipe, DatePipe, InfoContent, ErrorComponent],
  templateUrl: './film-details.html',
  styleUrl: './film-details.scss'
})
export class FilmDetails implements OnInit {
  // Provides automatic subscription cleanup via takeUntilDestroyed
  private destroyRef = inject(DestroyRef);
  public filmService = inject(FilmService);
  public peopleService = inject(PeopleService);
  public planetService = inject(PlanetService);
  public vehicleService = inject(VehicleService);

  // Film ID comes from the router
  id = input.required<string>();
  // Normalized signal accessor for the ID
  idInUrl = computed(() => this.id());

  // Selected film from the service state
  public film = computed(() => this.filmService.film());

  // Combined error signal across involved services
  readonly errorMsg = computed<string | null>(() => {
    return this.filmService.error()
      ?? this.peopleService.error()
      ?? this.planetService.error()
      ?? this.vehicleService.error()
      ?? null;
  });

  // Character URLs from film → resolve against cached people list
  readonly characterUrls = computed(() => this.film()?.characters ?? []);
  readonly filmPeople = computed<People[]>(() => {
    const urls = this.characterUrls();
    if (!urls.length) return [];
    const map = new Map(this.peopleService.peopleList().map(p => [p.url, p]));
    return urls.map(u => map.get(u)).filter((p): p is People => !!p);
  });

  // Planet URLs from film → resolve against cached planets
  readonly planetUrls = computed(() => this.film()?.planets ?? []);
  readonly filmPlanets = computed<Planet[]>(() => {
    const urls = this.planetUrls();
    if (!urls.length) return [];
    const map = new Map(this.planetService.planets().map(p => [p.url, p]));
    return urls.map(u => map.get(u)).filter((p): p is Planet => !!p);
  });

  // Vehicle URLs from film → resolve against cached vehicles
  readonly vehicleUrls = computed(() => this.film()?.vehicles ?? []);
  readonly filmVehicles = computed<Vehicle[]>(() => {
    const urls = this.vehicleUrls();
    if (!urls.length) return [];
    const map = new Map(this.vehicleService.vehicles().map(v => [v.url, v]));
    return urls.map(u => map.get(u)).filter((v): v is Vehicle => !!v);
  });

  ngOnInit() {
    // Load film by ID; on success, batch-load related resources
    this.filmService.getFilm(this.idInUrl()).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(film => {
        // Characters (concurrency 5)
        const charUrls = film!.characters ?? [];
        if (charUrls.length) this.peopleService.getAllPeopleSeparated(charUrls, 5);

        // Planets (concurrency 5)
        const plUrls = film!.planets ?? [];
        if (plUrls.length) this.planetService.getAllPlanetsSeparated(plUrls, 5);

        // Vehicles (concurrency 5)
        const vehUrls = film!.vehicles ?? [];
        if (vehUrls.length) this.vehicleService.getAllVehiclesSeparated(vehUrls, 5);
      })
    ).subscribe();
  }

}

