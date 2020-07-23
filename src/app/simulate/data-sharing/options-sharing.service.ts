import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { typeWithParameters } from '@angular/compiler/src/render3/util';

@Injectable({
  providedIn: 'root'
})
export class OptionsSharingService {

  private statusSource: BehaviorSubject<boolean>;
  public currentStatus: Observable<boolean>;

  private timeSource: BehaviorSubject<number>;
  public currentTime: Observable<number>;

  private simOffsetSource: BehaviorSubject<number>;
  public currentSimOffset: Observable<number>;

  private vidOffsetSource: BehaviorSubject<number>;
  public currentVidOffset: Observable<number>;

  constructor() {
    this.statusSource = new BehaviorSubject(false);
    this.currentStatus = this.statusSource.asObservable();

    this.timeSource = new BehaviorSubject(0);
    this.currentTime = this.timeSource.asObservable();

    this.simOffsetSource = new BehaviorSubject(0);
    this.currentSimOffset = this.simOffsetSource.asObservable();

    this.vidOffsetSource = new BehaviorSubject(0);
    this.currentVidOffset = this.vidOffsetSource.asObservable();
  }

  changeStatus(updatedStatus: boolean) {
    this.statusSource.next(updatedStatus);
  }

  changeTime(updatedTime: number){
    this.timeSource.next(updatedTime);
  }

  changeSimOffset(updatedOffset: number) {
    console.log('Sim Changed:' + updatedOffset);
    this.simOffsetSource.next(updatedOffset);
  }

  changeVidOffset(updatedOffset: number) {
    this.vidOffsetSource.next(updatedOffset);
  }
}
