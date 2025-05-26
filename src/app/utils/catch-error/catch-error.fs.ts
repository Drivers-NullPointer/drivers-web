import { catchError, Observable, throwError } from "rxjs";


export const catchCustomError = catchError((error) => {
    const customError = error?.error ?? error;
    return throwError(() => customError);
});