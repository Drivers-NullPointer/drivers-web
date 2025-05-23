import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProfilePictureComponent } from './select-profile-picture.component';

describe('SelectProfilePictureComponent', () => {
  let component: SelectProfilePictureComponent;
  let fixture: ComponentFixture<SelectProfilePictureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectProfilePictureComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SelectProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger file input', () => {
    const fileInput = fixture.debugElement.nativeElement.querySelector('input[type="file"]');

    const clickSpy = spyOn(fileInput, 'click');
    component.triggerFileInput();

    expect(clickSpy).toHaveBeenCalled();
  });


  it('should set photoFile and photoData when a file is selected', (done) => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const event = {
      target: { files: [file] },
    } as unknown as Event;

    const fileReaderMock: Partial<FileReader> = {
      onload: null,
      readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function (this: FileReader) {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/png;base64,dummycontent' } } as ProgressEvent<FileReader>);
        }
      }),
    };

    spyOn(window as any, 'FileReader').and.returnValue(fileReaderMock);
    component.onFileSelected(event);
    setTimeout(() => {
      expect(component.photoFile()).toBe(file);
      expect(fileReaderMock.readAsDataURL).toHaveBeenCalledWith(file);
      done();
    });
  });
});
