import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NdMemory } from '../lower-dashboard/nd/nd-memory';

@Injectable({
  providedIn: 'root'
})
export class NdSharingService {

  private memorySource: BehaviorSubject<NdMemory>;
  public currentMemory: Observable<NdMemory>;

  constructor() {
    this.memorySource = new BehaviorSubject({
      fo_ef_nd_mode: null,
      fo_ef_rnge: null,
      true_as: null,
      gnd_spd: null,
      hdg_angle: null,
      lat: null,
      long: null,
      mag_track_angle: null,
      mag_hdg_angle: null,
      wind_dir_at_ac: null,
      wind_spd_at_ac: null,
      rnp_vert: null,
      anp_vert: null,
      rnp_lat: null,
      anp_lat: null,

      fo_vsd_on: null,
      fo_bel_gs_lt: null,

      VSD_terrain: null,
      pitch_angle: null,
      pres_alt: null,
      mcp_alt_ds: null
    });
    this.currentMemory = this.memorySource.asObservable();
  }

  changeMemory(updatedMemory: NdMemory) {
    this.memorySource.next(updatedMemory);
  }
}
