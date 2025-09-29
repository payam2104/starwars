import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoContent } from './info-content';

describe('InfoContent', () => {
  let component: InfoContent;
  let fixture: ComponentFixture<InfoContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
