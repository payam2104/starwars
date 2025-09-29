import { Component, computed, DestroyRef, inject } from '@angular/core';
import { FilmService } from '../../../cores/services/film/film.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Card } from "../../shared/card/card";
import { Loading } from "../../shared/loading/loading";
import { ErrorComponent } from "../../shared/error/error";

@Component({
  selector: 'app-film-list',
  imports: [Card, Loading, ErrorComponent],
  templateUrl: './film-list.html',
  styleUrl: './film-list.scss'
})
export class FilmList {
  // Provides automatic subscription cleanup via takeUntilDestroyed
  private destroyRef = inject(DestroyRef);
  public filmService = inject(FilmService);

  // Reactive view of the films list from the service state (signal)
  public allFilms = computed(() => this.filmService.films());

  // On first render, trigger loading of all films; the service should cache results
  ngOnInit() {
    this.filmService.getAllFilms()
      .pipe(takeUntilDestroyed(this.destroyRef)) // unsubscribe when component is destroyed
      .subscribe();
  }
}
