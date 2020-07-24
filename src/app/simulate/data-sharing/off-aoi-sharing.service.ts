import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffAoiSharingService {

  /* The boolean inside the behvaior subject is true if
   * the border of the OffAoI component should be highlighted. */
  private memorySource: BehaviorSubject<boolean>;
  public currentMemory: Observable<boolean>;

  constructor() {
    this.memorySource = new BehaviorSubject(false);
    this.currentMemory = this.memorySource.asObservable();
  }

  changeMemory(updatedMemory: boolean) {
    this.memorySource.next(updatedMemory);
  }
}
