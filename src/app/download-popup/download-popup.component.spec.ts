import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadPopupComponent } from './download-popup.component';
import { FormsModule } from '@angular/forms';

describe('DownloadPopupComponent', () => {
  let component: DownloadPopupComponent;
  let fixture: ComponentFixture<DownloadPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadPopupComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event on Cancel button click', () => {
    spyOn(component.close, 'emit');
    const button = fixture.nativeElement.querySelector('button:last-child');
    button.click();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
