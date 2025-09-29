import { Component, HostListener, signal } from '@angular/core';
import { NavButton } from "../shared/buttons/nav-button/nav-button";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NavButton],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  // Reactive open/close state for the mobile menu
  menuOpen = signal(false);

  // Toggle menu; stop propagation so the document click handler won't immediately close it
  toggleMenu(me: MouseEvent) {
    me.stopPropagation();
    this.menuOpen.update(value => !value);
  }

  // Close the menu when clicking anywhere outside the header/menu
  @HostListener('document:click')
  closeOnOutsideClick() {
    this.menuOpen.set(false);
  }
}
