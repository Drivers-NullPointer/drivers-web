import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../shared/toast/toast.service';
import { ColumnName } from '../../shared/pagination/model/column.name';
import { PaginationActions } from '../../shared/pagination/model/pagination.actions';
import { RequestService } from './services/request.service';
import { PaginationComponent } from "../../shared/pagination/components/pagination/pagination.component";
import { Address, RequestTrip } from './model/request';
import { RequestStates, requestStatesToLabel } from './model/RequestStates.enum';
import { RequestDialogComponent } from './components/request-dialog/request-dialog.component';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css'
})
export class RequestComponent {

  readonly dialog = inject(MatDialog);
  readonly toast = inject(ToastService);
  readonly requestService = inject(RequestService);

  readonly requestColumns: ColumnName[] = [
    { displayName: 'Id', key: 'id', isSortable: true },
    { displayName: 'Punto de partida', key: 'startAddress', isSortable: false, transform: this.addressToString },
    { displayName: 'Punto de llegada', key: 'endAddress', isSortable: false, transform: this.addressToString },
    { displayName: 'Fecha de solicitud', key: 'createdAt', isSortable: true, transform: this.dateToString },
    { displayName: 'Estado', key: 'state', isSortable: true, transform: requestStatesToLabel }

  ];

  readonly paginationActions: PaginationActions[] = [
    {
      name: 'Ver',
      icon: 'visibility',
      description: 'Ver solicitud',
      action: (data: RequestTrip) => this.showRequest(data)
    }
  ];


  readonly generalActions = [];


  addressToString(address: Address): string {
    return [address.street, address.streetNumber, address.colony, address.city]
      .filter(Boolean)
      .join(', ') || 'Sin dirección';
  }

  dateToString(date: Date): string {
    return new Date(date).toLocaleDateString();
  }


  showRequest(requestTrip: RequestTrip): void {
    this.dialog.open(RequestDialogComponent, {
      data: {
        data: requestTrip
      },
      width: '70%',
      maxWidth: '1200px',
      disableClose: true
    });
  }


}
