import { Component, computed, DestroyRef, inject } from '@angular/core';
import { PeopleService } from '../../../cores/services/people/people.service';
import { Loading } from '../../shared/loading/loading';
import { ErrorComponent } from "../../shared/error/error";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Card } from "../../shared/card/card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-people-list',
  imports: [CommonModule, Loading, ErrorComponent, Card],
  templateUrl: './people-list.html',
  styleUrl: './people-list.scss'
})
export class PeopleList {
  // Provides automatic subscription cleanup via takeUntilDestroyed
  private destroyRef = inject(DestroyRef);
  public peopleService = inject(PeopleService);

  // Reactive view of the cached people list (signal → template-friendly)
  public allPeopleList = computed(() => this.peopleService.peopleList());

  ngOnInit() {
    // On initial render, load all people; service caches results for reuse
    this.peopleService.getAllPeople()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
