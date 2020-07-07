import { Component, ViewChild, ElementRef } from '@angular/core';
import { McpMemory } from './mcp-memory';
import { renderFlagCheckIfStmt } from '@angular/compiler/src/render3/view/template';
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
export class McpComponent {

  /* A singular unit of pixels that scales with the screen. Equals to
   * 1/1000th of the component width. */
  private unit: number;

  /* An object that stores all the sim data needed to render this
   * component. */
  public localMemory: McpMemory;

  constructor() {
    // Initialize with starting memory.
    this.localMemory = {
      // Displays
      mcp_ias_mach_ds: 146,
      mcp_hdg_ds: 355,
      mcp_alt_ds: 27000,
      mcp_vert_spd_ds: 1500,
      mcp_crs_1_ds: 355,
      mcp_crs_2_ds: 355,

      // Buttons
      mcp_n1: false,
      mcp_spd: true,
      mcp_lvl_spd: false,
      mcp_vnav: false,
      mcp_lnav: false,
      mcp_vor_loc: false,
      mcp_apprh: false,
      mcp_hdg_sel: false,
      mcp_alt_hld: false,
      mcp_vert_spd: false,
      mcp_cmd_a: true,
      mcp_cmd_b: true,
      mcp_cws_a: false,
      mcp_cws_b: false,

      // Switches
      mcp_fd_1: true,
      mcp_fd_2: false,
      mcp_at_arm: false
    };
  }

  /* Updates component with updatedMemory. If input param and stored local memory
   * are equal, does nothing. */
  update(updatedMemory: McpMemory): void {
    if (this.isEquivalent(updatedMemory, this.localMemory)) {
      return;
    }
    this.render();
  }

  /* Animate the component using stored local memory. */
  render(): void {
    this.drawForeground();
  }

  /* Foreground of component. Changes during play-back. */
  drawForeground(): void {
    console.log('Murph');
  }

  /* Brute force check if two objects are equal. */
  isEquivalent(a: object, b: object): boolean {
    // Create arrays of property names
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different, obviously unequal
    if (aProps.length !== bProps.length) {
      return false;
    }

    for (const propName of aProps) {
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  }
}
