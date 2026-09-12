import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, forkJoin, of, switchMap, tap, timer, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DispatchClient, DispatchHistory, DispatchRequest, DispatchService } from './dispatch.service';
import { Driver } from '../drivers/model/driver.types';
import { RequestTrip } from '../request/model/request';
import { Trip } from '../trips/model/Trip';
import { PaginatedResult } from '../../shared/pagination/model/pagination.result';

@Component({
  selector: 'app-dispatch', standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './dispatch.component.html', styleUrl: './dispatch.component.css'
})
export class DispatchComponent {
  private readonly api = inject(DispatchService);
  private readonly destroy = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private pendingCreate?: { content: string; key: string };
  readonly drivers = signal<PaginatedResult<Driver> | null>(null);
  readonly requests = signal<PaginatedResult<RequestTrip> | null>(null);
  readonly trips = signal<PaginatedResult<Trip> | null>(null);
  readonly clients = signal<DispatchClient[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly updatedAt = signal<Date | null>(null);
  readonly clientError = signal('');
  readonly clientSearch = this.fb.nonNullable.control('');
  readonly selectedDriver = signal<Driver | null>(null);
  readonly historyTarget = signal<Trip | null>(null);
  readonly historyRows = signal<DispatchHistory[]>([]);
  readonly historyLoading = signal(false);
  readonly historyError = signal('');
  private historyVersion = 0;
  driverSearch = '';
  driverPage = 0;
  requestPage = 0;
  tripPage = 0;
  tripState = 'ASSIGNED';
  autoRefresh = true;
  cancelTarget: Trip | null = null;
  cancelReason = '';
  readonly tripStates = ['ASSIGNED', 'DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  readonly form = this.fb.group({
    clientId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    startStreet: ['', [Validators.required, Validators.maxLength(255)]],
    startLat: this.fb.control<number | null>(null, [Validators.required, Validators.min(-90), Validators.max(90)]),
    startLng: this.fb.control<number | null>(null, [Validators.required, Validators.min(-180), Validators.max(180)]),
    endStreet: ['', [Validators.required, Validators.maxLength(255)]],
    endLat: this.fb.control<number | null>(null, [Validators.required, Validators.min(-90), Validators.max(90)]),
    endLng: this.fb.control<number | null>(null, [Validators.required, Validators.min(-180), Validators.max(180)])
  });

  constructor() {
    this.clientSearch.valueChanges.pipe(
      tap(() => { this.form.controls.clientId.reset(); this.clients.set([]); }),
      debounceTime(300), distinctUntilChanged(),
      switchMap(search => {
        this.form.controls.clientId.reset();
        this.clientError.set('');
        return search.trim().length < 2 ? of(null) : this.api.clients(search.trim()).pipe(
          timeout(15000), catchError(() => { this.clientError.set('No se pudieron buscar los clientes.'); return of(null); })
        );
      }), takeUntilDestroyed(this.destroy)
    ).subscribe(page => this.clients.set(page?.result ?? []));
    timer(0, 15000).pipe(takeUntilDestroyed(this.destroy)).subscribe(() => {
      if (this.autoRefresh && !document.hidden) this.refresh();
    });
  }

  refresh(): void {
    if (this.loading() || this.busy()) return;
    this.loading.set(true);
    this.error.set('');
    forkJoin({ drivers: this.api.drivers(this.driverPage, this.driverSearch.trim()),
      requests: this.api.requests(this.requestPage), trips: this.api.trips(this.tripPage, this.tripState)
    }).pipe(timeout(20000), takeUntilDestroyed(this.destroy), finalize(() => this.loading.set(false))).subscribe({
      next: data => {
        this.drivers.set(data.drivers); this.requests.set(data.requests); this.trips.set(data.trips);
        this.updatedAt.set(new Date());
        const selected = this.selectedDriver();
        if (selected) {
          const fresh = data.drivers.result.find(d => d.id === selected.id);
          if (!fresh || fresh.status !== 'AVAILABLE') this.selectedDriver.set(null);
        }
      },
      error: () => this.error.set('No se pudo actualizar. Los datos anteriores pueden estar desactualizados; reintenta antes de despachar.')
    });
  }

  label(state: string): string {
    const labels: Record<string, string> = { AVAILABLE: 'Disponible', UNAVAILABLE: 'Desconectado', IN_TRIP: 'En viaje',
      SUSPENDED: 'Suspendido', UNVERIFIED: 'Sin verificar', ASSIGNED: 'Asignado', DRIVER_EN_ROUTE: 'Hacia el pasajero',
      DRIVER_ARRIVED: 'En punto de recogida', IN_PROGRESS: 'En curso', COMPLETED: 'Completado', CANCELLED: 'Cancelado' };
    return labels[state] ?? state;
  }
  // Backend LocalDateTime values are UTC without an offset.
  utc(value: string): string { return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`; }
  expired(request: RequestTrip): boolean { return !!request.expiresAt && Date.parse(this.utc(request.expiresAt)) <= Date.now(); }
  changePage(kind: 'driver' | 'request' | 'trip', delta: number): void {
    if (this.loading() || this.busy()) return;
    if (kind === 'driver') { this.driverPage += delta; this.selectedDriver.set(null); }
    if (kind === 'request') this.requestPage += delta;
    if (kind === 'trip') this.tripPage += delta;
    this.refresh();
  }
  searchDrivers(): void { this.driverPage = 0; this.selectedDriver.set(null); this.refresh(); }
  filterTrips(): void { this.tripPage = 0; this.refresh(); }

  create(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy() || this.loading()) return;
    const v = this.form.getRawValue();
    if (!v.startStreet?.trim() || !v.endStreet?.trim()) return;
    if (v.startLat === v.endLat && v.startLng === v.endLng) {
      this.error.set('El origen y el destino deben ser diferentes.'); return;
    }
    this.busy.set(true); this.error.set(''); this.message.set('');
    const payload = { clientId: v.clientId!,
      startAddress: { street: v.startStreet.trim(), latitude: v.startLat!, longitude: v.startLng! },
      endAddress: { street: v.endStreet.trim(), latitude: v.endLat!, longitude: v.endLng! }
    };
    const content = JSON.stringify(payload);
    if (!this.pendingCreate || this.pendingCreate.content !== content) {
      this.pendingCreate = { content, key: crypto.randomUUID() };
    }
    const command: DispatchRequest = { ...payload, idempotencyKey: this.pendingCreate.key };
    this.api.create(command).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(false))).subscribe({
      next: request => {
        this.pendingCreate = undefined;
        this.form.reset(); this.clientSearch.setValue(''); this.requestPage = 0;
        this.message.set(`Solicitud #${request.id} confirmada (${request.state}). Consulta su estado antes de asignar.`);
        this.busy.set(false); this.refresh();
      }, error: e => this.mutationError(e)
    });
  }
  assign(request: RequestTrip): void {
    const driver = this.selectedDriver();
    if (!driver || this.busy() || this.loading() || this.error() || this.expired(request)) return;
    this.busy.set(true); this.message.set('');
    this.api.assign(request.id, driver.id).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        this.message.set(`Solicitud #${request.id} asignada a ${driver.name}. Recepción en su app pendiente de confirmar.`);
        this.selectedDriver.set(null); this.tripState = 'ASSIGNED'; this.tripPage = 0;
        this.busy.set(false); this.refresh();
      }, error: e => this.mutationError(e)
    });
  }
  cancel(): void {
    if (!this.cancelTarget || this.busy() || !this.cancelReason.trim() || this.cancelReason.trim().length > 500) return;
    this.busy.set(true); this.message.set('');
    this.api.cancel(this.cancelTarget.id, this.cancelReason.trim()).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(false))
    ).subscribe({ next: () => {
      this.cancelTarget = null; this.cancelReason = ''; this.message.set('Viaje cancelado.');
      this.busy.set(false); this.refresh();
    }, error: e => this.mutationError(e) });
  }
  private mutationError(error: HttpErrorResponse): void {
    if (error.status === 409 && error.error?.message === 'DRIVER_LOCATION_REQUIRED') {
      this.error.set('El conductor no tiene GPS vigente. Pídele revisar ubicación y conexión en su app; actualiza antes de volver a asignar.');
      this.selectedDriver.set(null);
      return;
    }
    this.error.set(error.status === 409 ? 'La operación entró en conflicto. Actualiza: la solicitud o el conductor pudieron cambiar.'
      : error.status === 0 || error.status >= 500 ? 'No se pudo confirmar la operación. Consulta el listado antes de repetirla para evitar duplicados.'
      : 'Operación rechazada. Verifica los datos y la disponibilidad; actualiza antes de reintentar.');
  }

  showHistory(trip: Trip): void {
    if (this.historyLoading() && this.historyTarget()?.id === trip.id) return;
    const version = ++this.historyVersion;
    this.historyTarget.set(trip); this.historyRows.set([]); this.historyError.set(''); this.historyLoading.set(true);
    this.api.history(trip.id).pipe(timeout(15000), takeUntilDestroyed(this.destroy),
      finalize(() => { if (version === this.historyVersion) this.historyLoading.set(false); })
    ).subscribe({
      next: rows => { if (version === this.historyVersion) this.historyRows.set(rows); },
      error: () => { if (version === this.historyVersion) this.historyError.set('No se pudo consultar el historial. Reintenta.'); }
    });
  }

  closeHistory(): void {
    this.historyVersion++; this.historyTarget.set(null); this.historyRows.set([]); this.historyLoading.set(false);
  }
}
