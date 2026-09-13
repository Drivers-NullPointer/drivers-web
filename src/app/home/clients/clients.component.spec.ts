import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsComponent } from './clients.component';
import { ClientsService } from './services/clients.service';
import { PaginatedResult } from '../../shared/pagination/model/pagination.result';
import { Client } from './model/client';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';


const paginationResponse: PaginatedResult<Client> = {
  pagination: {
    page: 1,
    limit: 10,
    totalElements: 100,
    totalPages: 10
  },
  result: [
    {
      id: 1,
      name: 'Client 1',
      lastname: 'Lastname 1',
      email: 'email@example.com',
      birthdate: new Date()
    },
  ]
};


describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientService: jasmine.SpyObj<ClientsService>;

  beforeEach(async () => {

    clientService = jasmine.createSpyObj<ClientsService>('ClientsService', ['getAllPaginated', 'notifyChangeSignal']);

    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ClientsService, useValue: clientService }]
    })
      .compileComponents();

    clientService.getAllPaginated.and.returnValue(of(paginationResponse));

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
