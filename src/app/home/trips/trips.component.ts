import { Component, inject, Inject } from '@angular/core';
import { PaginationComponent } from "../../shared/pagination/components/pagination/pagination.component";
import { TripService } from './services/trip.service';
import { GeneralActions, PaginationActions } from '../../shared/pagination/model/pagination.actions';
import { ColumnName } from '../../shared/pagination/model/column.name';
import { Trip } from './model/Trip';
import { MatDialog } from '@angular/material/dialog';
import { TripDialogComponent } from './components/trip-dialog/trip-dialog.component';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css'
})
export class TripsComponent {

  readonly tripsService = inject(TripService);
  readonly matDialog = inject(MatDialog);
  readonly toast = inject(ToastService);


  readonly tripsColumns: ColumnName[] = [
    { displayName: 'Id', key: 'id', isSortable: false, width: '20%' },
    { displayName: 'Fecha de inicio', key: 'startAt', isSortable: true, transform: this.dateToString },
    { displayName: 'Fecha de fin', key: 'endAt', isSortable: true, transform: this.dateToString },
    { displayName: 'Estado', key: 'state', isSortable: true, transform: this.tripStateToString },
    { displayName: 'Cliente', key: 'clientId', isSortable: false },
    { displayName: 'Conductor', key: 'driver', isSortable: false, transform: (driver) => driver ? `${driver.name} ${driver.lastname}` : 'Sin conductor' }
  ];

  readonly paginationActions: PaginationActions[] = [
    {
      action: (trip: Trip) => this.showTripDetails(trip),
      description: 'Ver detalles',
      icon: 'visibility',
      name: 'view'
    }
  ];
  readonly generalActions: GeneralActions[] = [];


  private showTripDetails(trip: Trip) {
    this.tripsService.getById(trip.id).subscribe({
      next: detail => this.matDialog.open(TripDialogComponent, {
        data: { data: detail },
        width: '80%',
        maxWidth: '1200px',
        disableClose: true
      }),
      error: () => this.toast.showError('Error', 'No se pudo cargar el detalle del viaje')
    });
  }


  dateToString(date?: Date | string | null): string {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }

  tripStateToString(state: string): string {
    switch (state) {
      case 'ASSIGNED': return 'Asignado';
      case 'DRIVER_EN_ROUTE': return 'Conductor en camino';
      case 'DRIVER_ARRIVED': return 'Conductor en el punto';
      case 'IN_PROGRESS': return 'En curso';
      case 'COMPLETED': return 'Finalizado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  }
}
