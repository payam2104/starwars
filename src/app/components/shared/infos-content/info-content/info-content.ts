import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Chips } from "../chips/chips";
import { People } from '../../../../cores/models/people.model';
import { Planet } from '../../../../cores/models/planet.model';
import { Vehicle } from '../../../../cores/models/vehicle.model';
import { Film } from '../../../../cores/models/film.model';

type AnyItem = Film | People | Planet | Vehicle;

@Component({
  selector: 'app-info-content',
  imports: [CommonModule, Chips],
  templateUrl: './info-content.html',
  styleUrl: './info-content.scss'
})
export class InfoContent {
  @Input() hasNameProperty: boolean = false;
  @Input() title: string = '';
  @Input() infoObj: AnyItem[] | undefined;

  // o has a 'name' (People/Planet/Vehicle)
  isNamed(o: AnyItem): o is People | Planet | Vehicle {
    return 'name' in o;
  }
  // o has a 'title' (Film)
  isTitled(o: AnyItem): o is Film {
    return 'title' in o;
  }
}
