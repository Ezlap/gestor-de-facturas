import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cargar } from './cargar';

describe('Cargar', () => {
  let component: Cargar;
  let fixture: ComponentFixture<Cargar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cargar],
    }).compileComponents();

    fixture = TestBed.createComponent(Cargar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
