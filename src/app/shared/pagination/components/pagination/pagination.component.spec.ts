import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IPaginationServices } from '../../interfaces/IPaginationServices';
import { signal } from '@angular/core';
import { PaginatedResult } from '../../model/pagination.result';
import { PaginationRequest } from '../../model/pagination.request';
import { Observable, of } from 'rxjs';
import { ColumnName } from '../../model/column.name';


const mockPaginationService: IPaginationServices = {
  notifyChangeSignal: signal(0),
  getAllPaginated: <T>(paginationRequest: PaginationRequest): Observable<PaginatedResult<T>> => {
    const result: PaginatedResult<T> = {
      pagination: {
        page: 1,
        limit: 10,
        totalElements: 100,
        totalPages: 10
      },
      result: ['test1', 'test2'] as unknown as T[]
    };

    return of(result);
  },
  notifyChange: function (): void {
    return;
  }
}

const columsName: ColumnName[] = [

  {
    displayName: 'Test 1',
    key: 'test1',
    isSortable: true
  },
  {
    displayName: 'Test 2',
    key: 'test2',
    isSortable: true
  }

];


describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [
        provideNoopAnimations(),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.paginationServices = mockPaginationService;
    component.tableColumns = columsName;
    component.description = 'Test';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
