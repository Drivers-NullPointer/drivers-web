import { Component, inject, OnInit, signal } from '@angular/core';
import { CreateDriverDto, Driver, UpdateDriverDto } from './model/driver.types';
import { DriversService } from './services/drivers.service';
import { PaginationGridComponent } from "../../shared/pagination/components/pagination-grid/pagination-grid.component";
import { ColumnName } from '../../shared/pagination/model/column.name';
import { PaginationComponent } from "../../shared/pagination/components/pagination/pagination.component";
import { PaginationActions } from '../../shared/pagination/model/pagination.actions';
import { MatDialog } from '@angular/material/dialog';
import { DialogAction } from '../../shared/model/Dialog.action';
import { DriversFormDialogComponent } from './components/drivers-form-dialog/drivers-form-dialog.component';
import { ToastService } from '../../shared/toast/toast.service';
import { DriverStatus } from './model/driver.status';

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
      action: (data: any) => this.actionDriver(DialogAction.EDIT, data)
    },
    {
      name: 'Eliminar',
      icon: 'delete',
      description: 'Eliminar conductor',
      action: (data: any) => this.deleteDriver(data.id)
    },
    {
      name: 'Ver',
      icon: 'visibility',
      description: 'Ver conductor',
      action: (data: any) => this.actionDriver(DialogAction.OBSERVE, data)
    }
  ];


  readonly generalActions = [
    {
      name: 'Agregar',
      icon: 'add',
      description: 'Agregar conductor',
      action: () => this.actionDriver(DialogAction.CREATE)
    }
  ];


  actionDriver(action: DialogAction, driver?: Driver) {
    const response = this.dialog.open(DriversFormDialogComponent, {
      width: '500px',
      data: {
        action: action,
        data: driver
      }
    });

    response.afterClosed().subscribe({
      next: (result?: Driver) => this.OnCloseDialog(action, result, driver?.id),
    })
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


  private OnCloseDialog(action: DialogAction, driver?: Driver, id?: number) {
    if (!driver) return;

    if (action === DialogAction.CREATE) {
      const createDriver: CreateDriverDto = {
        ...driver,
        birthdate: new Date(driver.birthdate).toISOString()
      };
      this.createDriver(createDriver);
      return;
    }
    if (action === DialogAction.EDIT) {
      const updateDriver: UpdateDriverDto = { ...driver };
      this.updateDriver(id!, updateDriver);
      return;
    }
  }

  private createDriver(createDriverDto: CreateDriverDto) {
    this.driversService.createDriver(createDriverDto).subscribe({
      next: () => this.toast.showSuccess('Conductor creado', 'Se ha creado un nuevo conductor'),
      error: (error) => {
        this.toast.showError('Error', 'No se ha podido crear el conductor')
      }
    })
  }

  private updateDriver(id: number, updateDriver: UpdateDriverDto) {
    this.driversService.updateDriver(id, updateDriver).subscribe({
      next: () => this.toast.showSuccess('Conductor actualizado', 'Se ha actualizado el conductor'),
      error: (error) => {
        this.toast.showError('Error', 'No se ha podido actualizar el conductor')
      }
    })
  }

  private deleteDriver(id: number) {
    this.driversService.deleteDriver(id).subscribe({
      next: () => this.toast.showSuccess('Conductor eliminado', 'Se ha eliminado el conductor'),
      error: (error) => {
        this.toast.showError('Error', 'No se ha podido eliminar el conductor')
      }
    })
  }

}
