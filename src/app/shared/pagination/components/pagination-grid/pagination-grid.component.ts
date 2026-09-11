import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, Injector, input, Input, model, OnInit, runInInjectionContext, signal, ViewChild } from '@angular/core';
import { IPaginationServices } from '../../interfaces/IPaginationServices';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { catchError, debounceTime, distinctUntilChanged, map, merge, Subscription, switchMap, tap } from 'rxjs';
import { of as observableOf } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ColumnName } from '../../model/column.name';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatedResult } from '../../model/pagination.result';
import { PaginationRequest } from '../../model/pagination.request';
import { GeneralActions, PaginationActions } from '../../model/pagination.actions';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { CustomTransformPipe } from '../../../pipes/transform.pipe';

@Component({
  selector: 'app-pagination-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    CustomTransformPipe
  ],
  templateUrl: './pagination-grid.component.html',
  styleUrl: './pagination-grid.component.css'
})
export class PaginationGridComponent implements OnInit {

  injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  @Input({ required: true }) paginationServices!: IPaginationServices;

  @Input({ required: true }) tableColumns!: ColumnName[];

  @Input() itemsPerPageOptions = [10, 25, 100];

  @Input({ required: true }) description!: string;

  @Input() paginationActions?: PaginationActions[];


  search = input.required<string>();
  isLoading = model(false);


  private isFirstLoading = signal(true);
  private loadSubscription?: Subscription;


  displayedColumns = computed(() => {
    const list = this.tableColumns.map(column => column.displayName);
    if (this.paginationActions && this.paginationActions.length > 0) {
      list.push('actions');
    }
    return list;
  });


  private _totalItems = signal(0);
  totalItem = this._totalItems.asReadonly();

  private _totalPages = signal(0);
  totalPages = this._totalPages.asReadonly();

  private _currentPage = signal(0);
  currentPage = this._currentPage.asReadonly();

  private _pageSize = signal(this.itemsPerPageOptions[0]);
  pageSize = this._pageSize.asReadonly();


  data: any[] = [];



  ngOnInit(): void {

    runInInjectionContext(
      this.injector,
      () => {
        effect(() => {
          this.paginator?.firstPage();
          this.loadData();
        }, {
          allowSignalWrites: true
        });
      },);
  }

  pageEvent($event: PageEvent) {
    this.loadData();
  }

  sortData($event: any) {
    this.loadData();
  }

  private loadData(): void {
    // Cancela una petición anterior si el usuario cambia rápidamente de
    // página, orden o búsqueda. switchMap no vive aquí porque estos eventos
    // también llegan desde MatPaginator y MatSort.
    this.loadSubscription?.unsubscribe();

    if (this.isFirstLoading()) {
      this.isLoading.set(true);
    }
    this.loadSubscription = this.paginationServices.getAllPaginated(this.calculatePageInfo()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => observableOf(null)),
      map(data => {
        if (this.isFirstLoading()) {
          this.isFirstLoading.set(false);
        }
        if (data === null) {
          this.setPaginatorError();
          return [];
        }
        this.calculateNewPageInfo(data);
        return data.result;
      })
    ).subscribe(data => {
      this.data = data
      this.isLoading.set(false);
    });
  }

  private calculatePageInfo(): PaginationRequest {
    return {
      page: this.paginator.pageIndex,
      limit: this.paginator.pageSize,
      sort: this.sort.active,
      order: this.sort.direction as SortDirection,
      search: this.search()
    };
  }

  private setPaginatorError(): void {
    this._totalItems.set(0);
    this._pageSize.set(0);
    this._currentPage.set(0);
    this._totalPages.set(0);
  }

  private calculateNewPageInfo(data: PaginatedResult<unknown>): void {
    this._totalItems.set(data.pagination.totalElements);
    this._pageSize.set(data.pagination.limit);
    this._currentPage.set(data.pagination.page);
    this._totalPages.set(data.pagination.totalPages);
  }

  launchAction(action: PaginationActions, dataAction: any): void {
    action.action(dataAction);
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  }
}
