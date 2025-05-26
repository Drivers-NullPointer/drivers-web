import { HttpParams } from "@angular/common/http";
import { PaginationRequest } from "../../shared/pagination/model/pagination.request";
export const generatePaginationQuery = (paginationRequest: PaginationRequest): HttpParams => {

    let query = new HttpParams();

    if (paginationRequest.page) {
        query = query.set('page', paginationRequest.page.toString());
    }
    if (paginationRequest.limit) {
        query = query.set('limit', paginationRequest.limit.toString());
    }
    if (paginationRequest.search) {
        query = query.set('search', paginationRequest.search);
    }
    if (paginationRequest.sort) {
        query = query.set('sort', paginationRequest.sort);
    }
    if (paginationRequest.order) {
        query = query.set('order', paginationRequest.order);
    }

    return query;
};