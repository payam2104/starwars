import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { tap } from 'rxjs';
import { Loading } from "../../shared/loading/loading";
import { ErrorComponent } from "../../shared/error/error";
import { PeopleService } from '../../../cores/services/people/people.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfoContent } from "../../shared/infos-content/info-content/info-content";
import { Vehicle } from '../../../cores/models/vehicle.model';
import { VehicleService } from '../../../cores/services/vehicle/vehicle.service';
import { FilmService } from '../../../cores/services/film/film.service';
import { Film } from '../../../cores/models/film.model';
import { PlanetService } from '../../../cores/services/planet/planet.service';

@Component({
  selector: 'app-people',
  imports: [Loading, ErrorComponent, InfoContent],
  templateUrl: './people.html',
  styleUrl: './people.scss'
})
export class People {
  // Provides automatic subscription cleanup via takeUntilDestroyed
  private destroyRef = inject(DestroyRef);
  // Data services for the person and related entities
  public peopleService = inject(PeopleService);
  public filmService = inject(FilmService)
  public vehicleService = inject(VehicleService);
  public planetService = inject(PlanetService)

  // Person ID comes from the route via input binding
  id = input.required<string>();
  // Normalized accessor as a computed signal
  idInUrl = computed(() => this.id());

  // Selected person from the service state
  public people = computed(() => this.peopleService.people());

  // Aggregate errors from all involved services
  readonly errorMsg = computed<string | null>(() => {
    return this.peopleService.error()
      ?? this.planetService.error()
      ?? this.filmService.error()
      ?? this.vehicleService.error()
      ?? null;
  });

  // Film URLs from the person → resolve against film list cache
  readonly filmUrls = computed(() => this.people()?.films ?? []);
  readonly peopleFilms = computed<Film[]>(() => {
    const urls = this.filmUrls();
    if (!urls.length) return [];
    const map = new Map(this.filmService.films().map(f => [f.url, f]));
    return urls.map(u => map.get(u)).filter((f): f is Film => !!f);
  });
  
  // Vehicle URLs from the person → resolve against vehicle cache
  readonly vehicleUrls = computed(() => this.people()?.vehicles ?? []);
  readonly peopleVehicles = computed<Vehicle[]>(() => {
    const urls = this.vehicleUrls();
    if (!urls.length) return [];
    const map = new Map(this.vehicleService.vehicles().map(v => [v.url, v]));
    return urls.map(u => map.get(u)).filter((v): v is Vehicle => !!v);
  });

  ngOnInit() {
    // Load person by ID; on success, batch-load referenced resources and ensure homeworld is cached
    this.peopleService.getPeople(this.idInUrl()).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(people => {
        const fUrls = people!.films ?? [];
        if (fUrls.length) this.filmService.getAllFilmsSeparated(fUrls, 5);

        const vehUrls = people!.vehicles ?? [];
        if (vehUrls.length) this.vehicleService.getAllVehiclesSeparated(vehUrls, 5);

        if (people?.homeworld) this.planetService.ensurePlanet(people.homeworld);
      })
    ).subscribe();
  }
}
