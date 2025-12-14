import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingCourseSectionComponent } from './setting-course-section.component';

describe('SettingCourseSectionComponent', () => {
  let component: SettingCourseSectionComponent;
  let fixture: ComponentFixture<SettingCourseSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingCourseSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingCourseSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
