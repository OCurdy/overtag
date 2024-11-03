import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TagfinderService } from '../tagfinder.service';

describe('TagfinderService', () => {
  let service: TagfinderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TagfinderService]
    });
    service = TestBed.inject(TagfinderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch suggestions from the API', () => {
    const mockSuggestions = ['suggestion1', 'suggestion2'];
    service.suggestTag('test').subscribe((suggestions) => {
      expect(suggestions).toEqual(mockSuggestions);
    });

    const req = httpMock.expectOne(
      (request) => request.url.includes('https://tagfinder.osm.ch/api/search')
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockSuggestions);

    httpMock.verify();
  });

  afterEach(() => {
    httpMock.verify();
  });
});
