import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAccountComponent } from './delete-account.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

const activeRoute = {
  params: of({}),
  snapshot: {
    paramMap: {
      get: () => 'test-id'
    }
  }
} as any;

describe('DeleteAccountComponent', () => {
  let component: DeleteAccountComponent;
  let fixture: ComponentFixture<DeleteAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAccountComponent, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activeRoute }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeleteAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onConfirm should log "Account deleted"', () => {
    spyOn(console, 'log');
    component.onConfirm();
    expect(console.log).toHaveBeenCalledWith('Account deleted');
  });
});
