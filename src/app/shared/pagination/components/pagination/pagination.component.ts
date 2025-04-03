import { Component, input, Input, signal } from '@angular/core';
import { IPaginationServices } from '../../interfaces/IPaginationServices';
import { ColumnName } from '../../model/column.name';
import { PaginationGridComponent } from "../pagination-grid/pagination-grid.component";
import { SearchGridComponent } from "../search-grid/search-grid.component";
import { GeneralActions, PaginationActions } from '../../model/pagination.actions';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaginationActionsComponent } from "../pagination-actions/pagination-actions.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    PaginationGridComponent,
    SearchGridComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PaginationActionsComponent,
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {



  @Input({ required: true }) paginationServices!: IPaginationServices;

  @Input({ required: true }) tableColumns!: ColumnName[];

  @Input() itemsPerPageOptions!: number[];

  @Input({ required: true }) description!: string;

  @Input() paginationActions?: PaginationActions[];

  @Input() generalActions?: GeneralActions[];


  search = "";
  isLoading = signal(true);

}
