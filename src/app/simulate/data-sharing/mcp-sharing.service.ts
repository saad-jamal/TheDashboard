import { Observable } from 'rxjs';
import { McpMemory } from './../upper-dashboard/mcp/mcp-memory';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class McpSharingService {

  private memorySource: BehaviorSubject<McpMemory>;
  public currentMemory: Observable<McpMemory>;

  constructor() {
    this.memorySource = new BehaviorSubject({
      // Displays
      mcp_ias_mach_ds: null,
      mcp_hdg_ds: null,
      mcp_alt_ds: null,
      mcp_vert_spd_ds: null,
      mcp_crs_1_ds: null,
      mcp_crs_2_ds: null,

      // Buttons
      mcp_n1: null,
      mcp_spd: null,
      mcp_lvl_spd: null,
      mcp_vnav: null,
      mcp_lnav: null,
      mcp_vor_loc: null,
      mcp_apprh: null,
      mcp_hdg_sel: null,
      mcp_alt_hld: null,
      mcp_vert_spd: null,
      mcp_cmd_a: null,
      mcp_cmd_b: null,
      mcp_cws_a: null,
      mcp_cws_b: null,

      // Switches
      mcp_fd_1: null,
      mcp_fd_2: null,
      mcp_at_arm: null
    });
    this.currentMemory = this.memorySource.asObservable();
  }

  changeMemory(updatedMemory: McpMemory) {
    this.memorySource.next(updatedMemory);
  }
}
