import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {}

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
