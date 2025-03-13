import { CommonModule } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorForm } from '../../model/ErrorForm';
@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    CommonModule
  ],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.css'
})
export class DateInputComponent {
  readonly control = input.required<FormControl>();
  readonly label = input<string>('');
  readonly isRequired = input<boolean>(false);
  readonly validators = input<ErrorForm[]>();
  readonly isEnable = input<boolean>(true);
  readonly placeholder = input<string>('');
  readonly hint = input<string | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);
  readonly minDate = input<Date | undefined>(undefined);

  constructor() {
    effect(() => {
      if (this.isEnable()) {
        this.control().enable();
      } else {
        this.control().disable();
      }
    });
  }
}
