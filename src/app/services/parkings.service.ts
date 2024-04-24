import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Parking } from "../models/interfaces/parking.interface";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class ParkingsService {
  http = inject(HttpClient);

  getParking(credential: string): Observable<Parking | null> {
    return this.http.get<Parking | null>(`${ environment.apiBaseUrl }/parkings/credential/${ credential }`);
  }

  updateParking(parking: Parking) {
    return this.http.put<Parking | null>(`${ environment.apiBaseUrl }/parkings/${ parking.id }`, parking);
  }
}
