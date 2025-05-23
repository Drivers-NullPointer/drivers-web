import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterProgressComponent } from './center-progress.component';

describe('CenterProgressComponent', () => {
  let component: CenterProgressComponent;
  let fixture: ComponentFixture<CenterProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
