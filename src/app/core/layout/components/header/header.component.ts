import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public navbarOpen = false;

  public toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }
}
