import { PfdMemory } from './../lower-dashboard/pfd/pfd-memory';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PfdSharingService {

  private memorySource: BehaviorSubject<PfdMemory>;
  public currentMemory: Observable<PfdMemory>;

  constructor() {
    this.memorySource = new BehaviorSubject({
      at_eng_mode: null,
      fo_roll_eng: null,
      fo_roll_arm: null,
      fo_pit_eng: null,
      fo_pit_arm: null,

      fo_cws_pit: null,
      fo_cws_roll: null,
      mcp_fd_2: null,

      fo_ap_stat: null,

      fo_cmd_pit_dev: null,
      fo_cmd_roll_dev: null,
      ils_2_gs_dev: null,
      ils_2_loc_dev: null,
      mcp_ias_mach_ds: null,
      mcp_alt_ds: null,
      mcp_vert_spd_ds: null,
      fo_ef_baro_cur: null,
      cal_as: null,
      rate_of_clb: null,
      pres_alt: null,
      radio_alt: null,
      pitch_angle: null,
      roll_angle: null,
      hdg_angle: null,
      mcp_hdg_ds: null,
      mag_track_angle: null
    });
    this.currentMemory = this.memorySource.asObservable();
  }

  changeMemory(updatedMemory: PfdMemory) {
    this.memorySource.next(updatedMemory);
  }
}
