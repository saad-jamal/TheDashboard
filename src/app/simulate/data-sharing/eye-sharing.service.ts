import { Injectable } from '@angular/core';
import { EyeMemory } from '../eye/eyetracking/eye-memory';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EyeSharingService {

  private memorySource: BehaviorSubject<EyeMemory>;
  public currentMemory: Observable<EyeMemory>;

  constructor() {
    this.memorySource = new BehaviorSubject({
      object_being_viewed: null,
      confidence: null,
      x: null,
      y: null,
      empty_queue: null
    });
    this.currentMemory = this.memorySource.asObservable();
  }

  changeMemory(updatedMemory: EyeMemory) {
    this.memorySource.next(updatedMemory);
  }
}
