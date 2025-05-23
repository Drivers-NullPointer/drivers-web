import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-center-progress',
  standalone: true,
  imports: [
    MatProgressSpinnerModule
  ],
  templateUrl: './center-progress.component.html',
  styleUrl: './center-progress.component.css'
})
export class CenterProgressComponent {

}
