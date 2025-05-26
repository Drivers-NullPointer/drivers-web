import { Component, effect, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ErrorForm } from '../../model/ErrorForm';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AutoCompleteValue } from '../../model/AutoCompleteValue';


@Component({
  selector: 'app-simple-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatAutocompleteModule
  ],
  templateUrl: './simple-input.component.html',
  styleUrl: './simple-input.component.css'
})
export class SimpleInputComponent {

  readonly control = input.required<FormControl>();
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly label = input<string>('');
  readonly isRequired = input<boolean>(false);
  readonly maxLength = input<number | null>(null);
  readonly validators = input<ErrorForm[]>();
  readonly isEnable = input<boolean>(true);
  readonly options = input<AutoCompleteValue[]>([]);
  readonly name = input.required<string>();
  readonly displayWith = input<(value: AutoCompleteValue) => string>();

  constructor() {
    effect(() => {
      if (this.isEnable()) {
        this.control().enable();
      } else {
        this.control().disable();
      }
    });
  }

  showDisplayWith(value?: AutoCompleteValue | string): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    const displayWith = this.displayWith();
    return displayWith ? displayWith(value) : value.value;
  }
}
