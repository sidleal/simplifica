import { TestBed, inject } from '@angular/core/testing';

import { SenterService } from './senter.service';

describe('SenterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SenterService]
    });
  });

  it('should be created', inject([SenterService], (service: SenterService) => {
    expect(service).toBeTruthy();
  }));
});
