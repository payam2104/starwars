import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chips',
  imports: [],
  templateUrl: './chips.html',
  styleUrl: './chips.scss'
})
export class Chips {
  @Input() name: string = '';

}
