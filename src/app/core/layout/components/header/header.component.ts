import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ButtonModule, Toolbar, AvatarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {}
