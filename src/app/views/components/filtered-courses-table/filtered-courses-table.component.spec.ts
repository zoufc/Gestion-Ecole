import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredCoursesTableComponent } from './filtered-courses-table.component';

describe('FilteredCoursesTableComponent', () => {
  let component: FilteredCoursesTableComponent;
  let fixture: ComponentFixture<FilteredCoursesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilteredCoursesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilteredCoursesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
