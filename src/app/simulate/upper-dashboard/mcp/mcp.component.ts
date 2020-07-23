import { McpSharingService } from './../../data-sharing/mcp-sharing.service';
import { Component, OnInit } from '@angular/core';
import { McpMemory } from './mcp-memory';

@Component({
  selector: 'app-mcp',
  templateUrl: './mcp.component.html',
  styleUrls: ['./mcp.component.css']
})
/**
 * This class represents the Mode Control Panel. It relies on div elements
 * and their input texts to render its animation.
 *
 * @author Saad Jamal
 */
export class McpComponent implements OnInit {

  /* A singular unit of pixels that scales with the screen. Equals to
   * 1/1000th of the component width. */
  private unit: number;

  /* An object that stores all the sim data needed to render this
   * component. */
  public localMemory: McpMemory;

  constructor(private sharingService: McpSharingService) {
    // Initialize with starting memory.
    this.localMemory = {
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
    };
  }

  /* Updates component with updatedMemory. If input param and stored local memory
   * are equal, does nothing. */
  update(updatedMemory: McpMemory): void {
    this.localMemory = updatedMemory;
    this.render();
  }

  /* Animate the component using stored local memory. */
  render(): void {
    this.drawForeground();
  }

  /* Foreground of component. Changes during play-back. */
  drawForeground(): void {}

  ngOnInit() {
    this.sharingService.currentMemory.subscribe(memory => {
      this.localMemory = memory;
      this.render();
    });
  }
}
