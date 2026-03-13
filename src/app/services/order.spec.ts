import { TestBed } from '@angular/core/testing';

class Order {}

describe('Order', () => {
  let service: Order;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Order]
    });
    service = TestBed.inject(Order);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
