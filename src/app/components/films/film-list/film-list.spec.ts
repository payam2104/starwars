import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmList } from './film-list';

describe('Films', () => {
  let component: FilmList;
  let fixture: ComponentFixture<FilmList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilmList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
