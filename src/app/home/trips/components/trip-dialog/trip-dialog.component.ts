import { Component, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MapsComponent } from '../../../../shared/maps/maps.component';
import { DialogData } from '../../../drivers/model/dialog.data';
import { MapsPoint } from '../../../../shared/maps/model/MapsPoint';
import { DistancePipe } from "../../../../shared/pipes/distance.pipe";
import { Trip } from '../../model/Trip';

@Component({
  selector: 'app-trip-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MapsComponent,
    DistancePipe,
  ],
  templateUrl: './trip-dialog.component.html',
  styleUrl: './trip-dialog.component.css'
})
export class TripDialogComponent {

  readonly dialogRef: MatDialogRef<TripDialogComponent> = inject(MatDialogRef<TripDialogComponent>);
  private readonly dialogData = inject<DialogData<Trip>>(MAT_DIALOG_DATA);


  private trip = this.dialogData.data;

  readonly polylineEncode = this.trip?.route?.encodedPolyline ?? null;


}
