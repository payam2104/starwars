import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-button.html',
  styleUrl: './nav-button.scss'
})
export class NavButton {
  @Input() buttonLabel: string = '';
  @Input() navRouterLink: string = ''
}
