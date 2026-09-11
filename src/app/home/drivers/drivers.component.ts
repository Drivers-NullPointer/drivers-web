import { Component, inject } from '@angular/core';
import { Driver } from './model/driver.types';
import { DriversService } from './services/drivers.service';
import { ColumnName } from '../../shared/pagination/model/column.name';
import { PaginationComponent } from "../../shared/pagination/components/pagination/pagination.component";
import { PaginationActions } from '../../shared/pagination/model/pagination.actions';
import { MatDialog } from '@angular/material/dialog';
import { DialogAction } from '../../shared/model/Dialog.action';
import { DriversFormDialogComponent } from './components/drivers-form-dialog/drivers-form-dialog.component';
import { ToastService } from '../../shared/toast/toast.service';
import { DriverStatus } from './model/driver.status';
import { DeleteDriverDialogComponent } from './components/delete-driver-dialog.component';
import { EMPTY, finalize, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css'
})
export class DriversComponent {

  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  readonly driversService = inject(DriversService);
  private readonly deletingDrivers = new Set<number>();

  readonly driverColumns: ColumnName[] = [
    { displayName: 'Id', key: 'id', isSortable: true },
    { displayName: 'Nombre', key: 'name', isSortable: true },
    { displayName: 'Apellido', key: 'lastname', isSortable: true },
    { displayName: 'Correo', key: 'email', isSortable: true },
    { displayName: 'Teléfono', key: 'phone', isSortable: false },
    { displayName: 'Estatus', key: 'status', isSortable: true, transform: (value: string) => this.changeStatus(value) },
  ];


  readonly paginationActions: PaginationActions[] = [
    {
      name: 'Editar',
      icon: 'edit',
      description: 'Editar conductor',
      action: (data: any) => this.showDriverForm(DialogAction.EDIT, data)
    },
    {
      name: 'Eliminar',
      icon: 'delete',
      description: 'Eliminar conductor',
      action: (data: Driver) => this.deleteDriver(data)
    },
    {
      name: 'Ver',
      icon: 'visibility',
      description: 'Ver conductor',
      action: (data: any) => this.showDriverForm(DialogAction.OBSERVE, data)
    }
  ];


  readonly generalActions = [];


  showDriverForm(action: DialogAction, driver?: Driver) {
    this.dialog.open(DriversFormDialogComponent, {
      width: '500px',
      data: {
        action: action,
        data: driver
      }
    });

  }

  changeStatus = (status: any) => {
    switch (status) {
      case DriverStatus.NO_AVARIABLE:
        return 'No disponible';
      case DriverStatus.AVARIABLE:
        return 'Disponible';
      case DriverStatus.IN_TRIP:
        return 'En viaje';
      case DriverStatus.SUSPENDED:
        return 'Suspendido';
      case DriverStatus.NO_VERIFICATE:
        return 'No verificado';
      default:
        return 'No disponible';
    }
  }

  private deleteDriver(driver: Driver) {
    if (this.deletingDrivers.has(driver.id)) return;
    this.deletingDrivers.add(driver.id);
    this.dialog.open(DeleteDriverDialogComponent, { data: driver, width: '440px' })
      .afterClosed().pipe(
        take(1),
        switchMap(confirmed => confirmed === true ? this.driversService.deleteDriver(driver.id) : EMPTY),
        finalize(() => this.deletingDrivers.delete(driver.id))
      ).subscribe({
      next: () => this.toast.showSuccessMessage({
        title: 'Conductor eliminado', message: 'Se ha eliminado el conductor'
      }),
      error: (error) => {
        this.toast.showErrorMessage({ message: 'No se ha podido eliminar el conductor' })
      }
    })
  }

}
