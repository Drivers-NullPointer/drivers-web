
export interface Pagination {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    result: T[];
    pagination: Pagination;
}
