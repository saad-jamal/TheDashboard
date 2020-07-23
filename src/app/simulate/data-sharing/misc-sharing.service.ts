import { MiscMemory } from './../side-dashboard/misc/misc-memory';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MiscSharingService {

  private memorySource: BehaviorSubject<MiscMemory>;
  public currentMemory: Observable<MiscMemory>;

  constructor() {
    this.memorySource = new BehaviorSubject({
      throttle_1_pos: null,
      throttle_2_pos: null,
      flap_angle: null,
      spoiler_pos: null,
      mstr_caution: null,
      capt_ap_discon: null,
      fo_ap_discon: null,
      ap_caut_lt: null,
      ap_warn_lt: null,
      ap_discon_horn: null,
      alt_warn_horn: null,
      at_1_discon: null,
      at_2_discon: null,
      at_caut_lt: null,
      at_warn_lt: null,
      FMC_alert_lt: null,
      spd_brk_arm: null,
      spdbrk_ext_lt: null
    });
    this.currentMemory = this.memorySource.asObservable();
  }

  changeMemory(updatedMemory: MiscMemory) {
    this.memorySource.next(updatedMemory);
  }
}
