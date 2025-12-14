import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingInfoSectionComponent } from './setting-info-section.component';

describe('SettingInfoSectionComponent', () => {
  let component: SettingInfoSectionComponent;
  let fixture: ComponentFixture<SettingInfoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingInfoSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
