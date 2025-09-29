import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TextButton } from "../buttons/text-button/text-button";
import { RomanPipe } from "../../../cores/pipes/roman.pipe";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [DatePipe, TextButton, RomanPipe, RouterModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})

export class Card implements OnChanges {
  // Variant flags control which route and fields the card renders
  @Input() isFilm: boolean = false;
  @Input() isPeople: boolean = false;
  @Input() isVehicles: boolean = false;
  // Whether an image slot should be shown by the template
  @Input() hasImage: boolean = true;

  // Main heading of the card (required)
  @Input() bigTitle!: string;

  // Optional label/value rows shown by the template (1..4)
  @Input() title1?: string;
  @Input() title1Value?: string;

  @Input() title2?: string;
  @Input() title2Value?: string;

  @Input() title3?: string;
  @Input() title3Value?: string;

  @Input() title4?: string;
  @Input() title4Value?: string;

  @Input() episode?: number;
  @Input() release_date?: string;
  @Input() url!: string;

  urlSplitted: Array<string> = [];
  index: string = '';
  urlRouterLink: string = '';

  // Recompute derived fields whenever inputs change
  ngOnChanges(): void {
    // Extract the numeric ID from the SWAPI URL (second to last segment)
    this.urlSplitted = this.url.split('/');
    this.index = this.urlSplitted[this.urlSplitted.length - 2];

    // Choose the base route based on the variant flags
    switch (true) {
      case this.isFilm:
        this.urlRouterLink = '/films/' + this.index;
        break;
      case this.isPeople:
        this.urlRouterLink = '/people/' + this.index;
        break;
      case this.isVehicles:
        this.urlRouterLink = '/vehicles/' + this.index;
        break;
      default:
        this.urlRouterLink = '/';
    }

  }
}
