import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home')
      .then(c => c.Home)
  },
  {
    path: 'films',
    loadComponent: () => import('./components/films/film-list/film-list')
      .then(c => c.FilmList)
  },
  {
    path: 'films/:id',
    loadComponent: () => import('./components/films/film-details/film-details')
      .then(c => c.FilmDetails)
  },
  {
    path: 'people-list',
    loadComponent: () => import('./components/people/peopleList/people-list')
      .then(c => c.PeopleList)
  },
  {
    path: 'people/:id',
    loadComponent: () => import('./components/people/people/people')
      .then(c => c.People)
  },
  {
    path: 'vehicles',
    loadComponent: () => import('./components/vehicles/vehicle-list/vehicles')
      .then(c => c.Vehicles)
  },
  {
    path: 'vehicles/:id',
    loadComponent: () => import('./components/vehicles/vehicle-details/vehicle-details')
      .then(c => c.VehicleDetails)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
