import { TestBed } from '@angular/core/testing';

import { UriInformationService } from './uri-information.service';

describe('UriInformationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UriInformationService = TestBed.get(UriInformationService);
    expect(service).toBeTruthy();
  });
});
