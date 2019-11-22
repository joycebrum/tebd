import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessaTurtleComponent } from './processa-turtle.component';

describe('ProcessaTurtleComponent', () => {
  let component: ProcessaTurtleComponent;
  let fixture: ComponentFixture<ProcessaTurtleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessaTurtleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessaTurtleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
