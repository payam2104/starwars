import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-text-button',
  imports: [RouterModule],
  templateUrl: './text-button.html',
  styleUrl: './text-button.scss'
})
export class TextButton {
  @Input() buttonLabel: string = '';
  @Input() navRouterLink: string = '';

}
