import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private _iconRegistry: MatIconRegistry) {
    this._iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
