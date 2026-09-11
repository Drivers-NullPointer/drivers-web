import { Component, inject, signal } from '@angular/core';
import { VehiclesService } from './services/services/vehicles.service';
import { ColumnName } from '../../shared/pagination/model/column.name';
import { GeneralActions, PaginationActions } from '../../shared/pagination/model/pagination.actions';
import { PaginationComponent } from "../../shared/pagination/components/pagination/pagination.component";
import { DialogAction } from '../../shared/model/Dialog.action';
import { SaveVehicle, Vehicle } from './model/vehicle';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../shared/toast/toast.service';
import { VehicleFormComponent } from './componets/vehicle-form/vehicle-form.component';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent {


  readonly dialog = inject(MatDialog);
  readonly toast = inject(ToastService);

  readonly vehicleColums: ColumnName[] = [
    { key: 'id', displayName: 'ID', isSortable: true },
    { key: 'number', displayName: 'Número', isSortable: true },
    { key: 'isRotulated', displayName: 'Rotulado', isSortable: true, transform: (value: boolean) => value ? 'Si' : 'No' },
    { key: 'make', displayName: 'Marca', isSortable: true },
    { key: 'model', displayName: 'Modelo', isSortable: true },
    { key: 'color', displayName: 'Color', isSortable: true },

  ];

  readonly paginationActions: PaginationActions[] = [
    {
      name: 'Editar',
      icon: 'edit',
      description: 'Editar vehículo',
      action: (data: any) => this.actionVehicle(DialogAction.EDIT, data)
    },
    {
      name: 'Ver',
      icon: 'visibility',
      description: 'Ver vehículo',
      action: (data: any) => this.actionVehicle(DialogAction.OBSERVE, data)
    }
  ];


  readonly generalActions: GeneralActions[] = [
    {
      name: 'Agregar',
      icon: 'add',
      description: 'Agregar vehículo',
      action: () => this.actionVehicle(DialogAction.CREATE)
    }
  ];



  constructor(
    public vehiclesService: VehiclesService,
  ) { }


  actionVehicle(dialogAction: DialogAction, vehicle?: Vehicle) {
    const response = this.dialog.open(VehicleFormComponent, {
      width: '500px',
      data: {
        action: dialogAction,
        data: vehicle
      }
    });

    response.afterClosed().subscribe({
      next: (result?: SaveVehicle) => this.OnCloseDialog(dialogAction, result, vehicle?.id),
    });
  }

  private createVehicle(result: SaveVehicle) {
    this.vehiclesService.create(result).subscribe({
      next: () => this.toast.showSuccess("Exito", "Vehículo creado correctamente"),
      error: (error) => {
        this.toast.showError("Error", "Error al crear el vehículo")

      }
    });
  }

  private updateVehicle(id: number, result: SaveVehicle) {
    this.vehiclesService.update(id, result).subscribe({
      next: () => this.toast.showSuccess("Exito", "Vehículo actualizado correctamente"),
      error: (error) => {
        this.toast.showError("Error", "Error al actualizar el vehículo")
      }
    });
  }

  OnCloseDialog(dialogAction: DialogAction, result?: SaveVehicle, id?: number): void {
    if (!result) return;

    switch (dialogAction) {
      case DialogAction.CREATE:
        this.createVehicle(result);
        break;
      case DialogAction.EDIT:
        this.updateVehicle(id!, result);
        break;
    }
  }
}
