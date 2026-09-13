import { TestBed } from '@angular/core/testing';
import { PaginationServices } from './PaginationServices';
import { Observable } from 'rxjs';
import { PaginationRequest } from '../model/pagination.request';
import { PaginatedResult } from '../model/pagination.result';

const paginationResponseDriver: PaginatedResult<string> = {
    pagination: {
        page: 1,
        totalElements: 100,
        totalPages: 10,
        limit: 10
    },
    result: []
}


class ConcretePaginationService extends PaginationServices {
    override getAllPaginated<T>(paginationRequest: PaginationRequest): Observable<PaginatedResult<T>> {
        return new Observable<PaginatedResult<T>>(subscriber => {
            subscriber.next(paginationResponseDriver as PaginatedResult<T>);
            subscriber.complete();
        });
    }

}


describe('ConcretePaginationService', () => {
    let service: ConcretePaginationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ConcretePaginationService]
        });
        service = TestBed.inject(ConcretePaginationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should notify change', () => {
        service.notifyChange();
        expect(service.notifyChangeSignal()).toBeGreaterThan(0);
    });

    it('should get all paginated results', (done) => {
        const paginationRequest: PaginationRequest = {
            page: 1,
            limit: 10
        }
        service.getAllPaginated<any>(paginationRequest).subscribe({
            next: (result: PaginatedResult<any>) => {
                expect(result).toEqual(paginationResponseDriver);
                done();
            },
            error: (error) => {
                fail('Expected no errors, but got ' + error);
                done();
            }
        });
    });
});