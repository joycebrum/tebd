import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UriInformationService {

  constructor(private http: HttpClient) { }

  getInformation(prefix, end) {
    const uri = prefix + end
    return this.http.get<any>(uri);
  }
}
