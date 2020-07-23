import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Disk } from './interfaces/disk';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
/**
 * This service handles the primary GET operations upon loading the simulate
 * page as well as helping the controller feed data into various components.
 */
export class SimulateService {
  private expirementName: string;

  constructor(private http: HttpClient) {}

  /* This function returns the information about the current state of the
   * application on memory. */
  getDiskInfo(): Observable<Disk> {
    return this.http.get<Disk>('http://localhost:4201/sim-info')
      .pipe(catchError(this.handleDiskError));
  }

  /* Error Handler For Disk Info. */
  handleDiskError(error: HttpErrorResponse) {
    return of({ expirementName: 'N/A', videoName: 'N/A'} as Disk);
  }

  getSimulatorData(): Observable<any> {
    return this.http.get('/assets/data/sim.json');
  }

}
