import { Component, ElementRef, input, model, ViewChild } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-select-profile-picture',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './select-profile-picture.component.html',
  styleUrl: './select-profile-picture.component.css'
})
export class SelectProfilePictureComponent {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  photoData = model<string | undefined>();
  photoFile = model<File | undefined>();

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }


  onFileSelected($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.photoFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.photoData.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

}
