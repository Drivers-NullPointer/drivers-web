import { HttpParams } from "@angular/common/http";
import { PaginationRequest } from "../../shared/pagination/model/pagination.request";
export const generatePaginationQuery = (paginationRequest: PaginationRequest): HttpParams => {

    let query = new HttpParams();

    if (paginationRequest.page !== undefined) {
        query = query.set('page', paginationRequest.page.toString());
    }
    if (paginationRequest.limit) {
        query = query.set('limit', paginationRequest.limit.toString());
    }
    if (paginationRequest.search) {
        query = query.set('search', paginationRequest.search);
    }
    if (paginationRequest.sort) {
        query = query.set('sort', paginationRequest.sort.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase());
    }
    if (paginationRequest.order) {
        query = query.set('order', paginationRequest.order.toUpperCase());
    }

    return query;
};
