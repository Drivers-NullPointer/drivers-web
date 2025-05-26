import { of, throwError } from 'rxjs';
import { catchCustomError } from './catch-error.fs';

describe('catchCustomError', () => {
    it('debería propagar el error original si no tiene propiedad "error"', (done) => {
        const originalError = { mensaje: 'Algo falló' };

        throwError(() => originalError)
            .pipe(catchCustomError)
            .subscribe({
                next: () => {
                    fail('No debería emitir valores');
                },
                error: (error) => {
                    expect(error).toEqual(originalError);
                    done();
                }
            });
    });

    it('debería extraer la propiedad "error" si existe en el error', (done) => {
        const nestedError = { mensaje: 'Error interno' };
        const errorConError = { error: nestedError };

        throwError(() => errorConError)
            .pipe(catchCustomError)
            .subscribe({
                next: () => {
                    fail('No debería emitir valores');
                },
                error: (error) => {
                    expect(error).toEqual(nestedError);
                    done();
                }
            });
    });
});
