import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalNavBarComponent } from './horizontal-nav-bar.component';

describe('HorizontalNavBarComponent', () => {
  let component: HorizontalNavBarComponent;
  let fixture: ComponentFixture<HorizontalNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalNavBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
