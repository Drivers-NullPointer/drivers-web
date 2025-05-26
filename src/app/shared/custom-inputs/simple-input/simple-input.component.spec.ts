import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SimpleInputComponent } from './simple-input.component';
import { AutoCompleteValue } from '../../model/AutoCompleteValue';

describe('SimpleInputComponent', () => {
  let component: SimpleInputComponent;
  let fixture: ComponentFixture<SimpleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleInputComponent],
      providers: [
        provideNoopAnimations(),
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SimpleInputComponent);
    fixture.componentRef.setInput('control', new FormControl());
    fixture.componentRef.setInput('name', 'name');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with isEnable true', () => {
    fixture.componentRef.setInput('isEnable', true);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create with isEnable false', () => {
    fixture.componentRef.setInput('isEnable', false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show displayWith', () => {
    fixture.componentRef.setInput('displayWith', (value: any) => value.value);
    const value: AutoCompleteValue = { id: 'id', value: 'value' };
    fixture.detectChanges();
    expect(component.showDisplayWith(value)).toBe('value');
  });

  it('should show witoout displayWith', () => {
    const value: AutoCompleteValue = { id: 'id', value: 'value' };
    fixture.detectChanges();
    expect(component.showDisplayWith(value)).toBe(value.value);
  });
});
