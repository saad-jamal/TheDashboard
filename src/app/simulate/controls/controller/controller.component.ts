import { OptionsSharingService } from './../../data-sharing/options-sharing.service';
import { PfdSharingService } from './../../data-sharing/pfd-sharing.service';
import { NdSharingService } from './../../data-sharing/nd-sharing.service';
import { MiscSharingService } from './../../data-sharing/misc-sharing.service';
import { McpSharingService } from './../../data-sharing/mcp-sharing.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SimulateService } from './../../simulate.service';

import { MiscMemory } from './../../side-dashboard/misc/misc-memory';
import { NdMemory } from './../../lower-dashboard/nd/nd-memory';
import { PfdMemory } from './../../lower-dashboard/pfd/pfd-memory';
import { McpMemory } from './../../upper-dashboard/mcp/mcp-memory';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.css']
})
/**
 * This class does most of the heavy lifting of controlling the overall
 * display. It represents the controls on the bottom right of the screen
 * and calls other functions.
 */
export class ControllerComponent implements OnInit, AfterViewInit {

  /** Variable that represents whether the simulation is playing. */
  public playing: boolean;

  /** Raw simulator data. Encompasses simulator and eye-tracking. */
  public rawMemory: any[];

  /** Index that represents how far along in play-back the app is. */
  public index: number;

  /** Length of raw memory JSON file subtracted by 3 for safety. */
  public memoryLength: number;

  /** Memory for MCP Object. */
  private mcpMem: McpMemory;

  /** Memory for Misc Object. */
  private miscMem: MiscMemory;

  /** Memory for ND Object. */
  private ndMem: NdMemory;

  /** Memory for PFD Object. */
  private pfdMem: PfdMemory;

  /** The interval runner that updates the play-back. */
  private runner: any;

  /** The simulation speed. Measures how often to update playback in ms. */
  private simSpeed: number;

  /** Elapsed seconds from start of playback. */
  public elapsedSeconds: number;

  /** Elapsed time in standard form. */
  public elapsedTime: string;

  /** Real time string. */
  public realTime: string;

  constructor(private simService: SimulateService,
              private mcpSharingService: McpSharingService,
              private miscSharingService: MiscSharingService,
              private ndSharingService: NdSharingService,
              private pfdSharingService: PfdSharingService,
              private optionsSharingService: OptionsSharingService) {
    this.playing = false;
    this.simSpeed = 50; // A frequency of 20 hertz.
    this.elapsedSeconds = 0;
    this.realTime = '--/--/-- --:--:--';
  }

  ngOnInit(): void {
    this.simService.getSimulatorData().subscribe(
        (data) => this.rawMemory = data,
        (err) => console.log(err),
        () => this.handleData());
  }

  ngAfterViewInit(): void {}

  /* Function that is called the first time data is loaded in. Helps
   * set up the simulation. */
  handleData(): void {
    this.memoryLength = this.rawMemory.length - 3;
    this.index = 0;

    this.mcpSharingService.currentMemory.subscribe(memory => this.mcpMem = memory);
    this.miscSharingService.currentMemory.subscribe(memory => this.miscMem = memory);
    this.ndSharingService.currentMemory.subscribe(memory => this.ndMem = memory);
    this.pfdSharingService.currentMemory.subscribe(memory => this.pfdMem = memory);
    this.optionsSharingService.currentStatus.subscribe(memory => {});
    this.optionsSharingService.currentTime.subscribe(memory => {});
    this.optionsSharingService.currentSimOffset.subscribe(memory => {
      if (memory >= this.memoryLength) {
        memory = this.memoryLength;
      } else if (memory < 0) {
        memory = 0;
      }
      this.runner = clearInterval(this.runner);
      this.playing = false;
      this.index = memory * 60;

      this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
      this.realTime = this.rawMemory[this.index]['"utc_datetime"'];
      this.optionsSharingService.changeTime(this.elapsedSeconds);

      this.enterData();
    });

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.enterData();
  }

  /* Function that is called every interval in order to re-enter data. */
  enterData(): void {
    this.mcpSharingService.changeMemory(this.buildMcpMemory());
    this.miscSharingService.changeMemory(this.buildMiscMemory());
    this.ndSharingService.changeMemory(this.buildNdMemory());
    this.pfdSharingService.changeMemory(this.buildPfdMemory());
  }

  /* Function that is called when play/pause button is clicked. It should
   * pause/resume play-back. */
  public play(): void {
    if (this.playing) {
      this.runner = clearInterval(this.runner);
    } else {
      this.runner = setInterval(() => this.runSimulation(), this.simSpeed);
    }
    this.playing = !this.playing;
    this.optionsSharingService.changeStatus(this.playing);
  }

  /* Function that runs the actual simulation. It is this function that
   * gets a JS interval called on it. */
  runSimulation(): void {
    this.index = Number(this.index) + 3;
    if (this.index >= this.memoryLength) {
      this.playing = false;
      this.runner = clearInterval(this.runner);
      this.index = this.memoryLength;
    } else if (this.index < 0) {
      this.playing = false;
      this.runner = clearInterval(this.runner);
      this.index = 0;
    }

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.enterData();
  }

  /* Function that is called when forward button is clicked. It should
   * forward the play-back by exactly one second. */
  public forward(): void {
    this.playing = false;
    this.runner = clearInterval(this.runner);
    this.index += 60;

    if (this.index >= this.memoryLength) {
      this.index = this.memoryLength;
    }

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.enterData();
  }

  /* Function that is called when backward button is clicked. It should
   * decrement the play-back by exactly one second. */
  public backward(): void {
    this.playing = false;
    this.runner = clearInterval(this.runner);
    this.index -= 60;

    if (this.index < 0) {
      this.index = 0;
    }

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.enterData();
  }

  /* Function that builds the Pfd Memory. Properly handles missing and
   * unclean data. */
  buildPfdMemory(): PfdMemory {
    const memoryObject = {
      at_eng_mode: this.formatPfdStrings(this.rawMemory[this.index]['"at_eng_mode"']),
      fo_roll_eng: this.formatPfdStrings(this.rawMemory[this.index]['"fo_roll_eng"']),
      fo_roll_arm: this.formatPfdStrings(this.rawMemory[this.index]['"fo_roll_arm"']),
      fo_pit_eng: this.formatPfdStrings(this.rawMemory[this.index]['"fo_pit_eng"']),
      fo_pit_arm: this.formatPfdStrings(this.rawMemory[this.index]['"fo_pit_arm"']),

      fo_cws_pit: this.binary(this.rawMemory[this.index]['"fo_cws_pit"']),
      fo_cws_roll: this.binary(this.rawMemory[this.index]['"fo_cws_roll"']),
      mcp_fd_2: this.binary(this.rawMemory[this.index]['"mcp_fd_2"']),

      fo_ap_stat: this.formatPfdStrings(this.rawMemory[this.index]['"fo_ap_stat"']),

      fo_cmd_pit_dev: this.formatPfdDials(this.rawMemory[this.index]['"fo_cmd_pit_dev"']),
      fo_cmd_roll_dev: this.formatPfdDials(this.rawMemory[this.index]['"fo_cmd_roll_dev"']),
      ils_2_gs_dev: this.formatPfdDials(this.rawMemory[this.index]['"ils_2_gs_dev"']),
      ils_2_loc_dev: this.formatPfdDials(this.rawMemory[this.index]['"ils_2_loc_dev"']),
      mcp_ias_mach_ds: this.formatPfdDials(this.rawMemory[this.index]['"mcp_ias_mach_ds"']),
      mcp_alt_ds: this.formatPfdDials(this.rawMemory[this.index]['"mcp_alt_ds"']),
      mcp_vert_spd_ds: this.formatPfdDials(this.rawMemory[this.index]['"mcp_vert_spd_ds"']),
      fo_ef_baro_cur: this.formatPfdDials(this.rawMemory[this.index]['"fo_ef_baro_cur"']),
      cal_as: this.formatPfdDials(this.rawMemory[this.index]['"cal_as"']),
      rate_of_clb: this.formatPfdDials(this.rawMemory[this.index]['"rate_of_clb"']),
      pres_alt: this.formatPfdDials(this.rawMemory[this.index]['"pres_alt"']),
      radio_alt: this.formatPfdDials(this.rawMemory[this.index]['"radio_alt"']),
      pitch_angle: this.formatPfdDials(this.rawMemory[this.index]['"pitch_angle"']),
      roll_angle: this.formatPfdDials(this.rawMemory[this.index]['"roll_angle"']),
      hdg_angle: this.formatPfdDials(this.rawMemory[this.index]['"hdg_angle"']),
      mcp_hdg_ds: this.formatPfdDials(this.rawMemory[this.index]['"mcp_hdg_ds"']),
      mag_track_angle: this.formatPfdDials(this.rawMemory[this.index]['"mag_track_angle"'])
    };
    return memoryObject;
  }

  /* Function that formats and returns PFD dials. */
  formatPfdDials(val: any): number {
    if (val === '' || isNaN(val)) {
      return null;
    } else {
      return parseFloat(val);
    }
  }

  /* Function that formats PFD strings on MCP mode bar. */
  formatPfdStrings(val: any): string {
    if (val === '' || val == null) {
      return '';
    } else {
      return val.replace(/['"\s]+/g, '');
    }
  }

  /* Function that builds the Nd Memory. Properly handles missing and
   * unclean data. */
  buildNdMemory(): NdMemory {
    const memoryObject = {
      fo_ef_nd_mode: this.formatNdDials(this.rawMemory[this.index]['"fo_ef_nd_mode"']),
      fo_ef_rnge: this.formatNdDials(this.rawMemory[this.index]['"fo_ef_rnge"']),
      true_as: this.formatNdDials(this.rawMemory[this.index]['"true_as"']),
      gnd_spd: this.formatNdDials(this.rawMemory[this.index]['"gnd_spd"']),
      hdg_angle: this.formatNdDials(this.rawMemory[this.index]['"hdg_angle"']),
      lat: this.formatNdDials(this.rawMemory[this.index]['"lat"']),
      long: this.formatNdDials(this.rawMemory[this.index]['"long"']),
      mag_track_angle: this.formatNdDials(this.rawMemory[this.index]['"mag_track_angle"']),
      mag_hdg_angle: this.formatNdDials(this.rawMemory[this.index]['"mag_hdg_angle"']),
      wind_dir_at_ac: this.formatNdDials(this.rawMemory[this.index]['"wind_dir_at_ac"']),
      wind_spd_at_ac: this.formatNdDials(this.rawMemory[this.index]['"wind_spd_at_ac"']),
      rnp_vert: this.formatNdDials(this.rawMemory[this.index]['"rnp_vert"']),
      anp_vert: this.formatNdDials(this.rawMemory[this.index]['"anp_vert"']),
      rnp_lat: this.formatNdDials(this.rawMemory[this.index]['"rnp_lat"']),
      anp_lat: this.formatNdDials(this.rawMemory[this.index]['"anp_lat"']),

      fo_vsd_on: this.binary(this.rawMemory[this.index]['"fo_vsd_on"']),
      fo_bel_gs_lt: this.binary(this.rawMemory[this.index]['"fo_bel_gs_lt"']),

      VSD_terrain: this.terrainData(),
      pitch_angle: this.formatNdDials(this.rawMemory[this.index]['"pitch_angle"']),
      pres_alt: this.formatNdDials(this.rawMemory[this.index]['"pres_alt"']),
      mcp_alt_ds: this.formatNdDials(this.rawMemory[this.index]['"mcp_alt_ds"'])
    };
    return memoryObject;
  }

  /* Function that turns VSD terrain data into number arrays. */
  terrainData(): number[] {
    const terrainArr: number[] = [];
    for (let i = 1; i < 21; i++) {
      terrainArr[i - 1] = parseFloat(this.rawMemory[this.index]['"VSD_terrain_' + i + '"']);
    }
    return terrainArr;
  }

  /* Function that builds the Misc Memory. Properly handles missing and
   * unclean data. */
  buildMiscMemory(): MiscMemory {
    const memoryObject = {
      throttle_1_pos: parseFloat(this.rawMemory[this.index]['"throttle_1_pos"']),
      throttle_2_pos: parseFloat(this.rawMemory[this.index]['"throttle_2_pos"']),
      flap_angle: parseFloat(this.rawMemory[this.index]['"flap_angle"']),
      spoiler_pos: parseFloat(this.rawMemory[this.index]['"spoiler_pos"']),

      mstr_caution: this.binary(this.rawMemory[this.index]['"mstr_caution"']),
      capt_ap_discon: this.binary(this.rawMemory[this.index]['"capt_ap_discon"']),
      fo_ap_discon: this.binary(this.rawMemory[this.index]['"fo_ap_discon"']),
      ap_caut_lt: this.binary(this.rawMemory[this.index]['"ap_caut_lt"']),
      ap_warn_lt: this.binary(this.rawMemory[this.index]['"ap_warn_lt"']),
      ap_discon_horn: this.binary(this.rawMemory[this.index]['"ap_discon_horn"']),
      alt_warn_horn: this.binary(this.rawMemory[this.index]['"alt_warn_horn"']),
      at_1_discon: this.binary(this.rawMemory[this.index]['"at_1_discon"']),
      at_2_discon: this.binary(this.rawMemory[this.index]['"at_2_discon"']),
      at_caut_lt: this.binary(this.rawMemory[this.index]['"at_caut_lt"']),
      at_warn_lt: this.binary(this.rawMemory[this.index]['"at_warn_lt"']),
      FMC_alert_lt: this.binary(this.rawMemory[this.index]['"FMC_alert_lt"']),
      spd_brk_arm: this.binary(this.rawMemory[this.index]['"spd_brk_arm"']),
      spdbrk_ext_lt: this.binary(this.rawMemory[this.index]['"spdbrk_ext_lt"'])
    };
    return memoryObject;
  }

  /* Function that builds the Mcp Memory. Properly handles missing and
   * unlean data. */
  buildMcpMemory(): McpMemory {
    const memoryObject = {
      // Displays
      mcp_ias_mach_ds: this.formatMcpDials(this.rawMemory[this.index]['"mcp_ias_mach_ds"']),
      mcp_hdg_ds: this.formatMcpDials(this.rawMemory[this.index]['"mcp_hdg_ds"']),
      mcp_alt_ds: this.formatMcpDials(this.rawMemory[this.index]['"mcp_alt_ds"']),
      mcp_vert_spd_ds: this.formatMcpDials(this.rawMemory[this.index]['"mcp_vert_spd_ds"']),
      mcp_crs_1_ds: this.formatMcpDials(this.rawMemory[this.index]['"mcp_crs_1_ds"']),
      mcp_crs_2_ds: this.formatMcpDials(this.rawMemory[this.index]['"mcp_crs_2_ds"']),

      // Buttons
      mcp_n1: this.binary(this.rawMemory[this.index]['"mcp_n1"']),
      mcp_spd: this.binary(this.rawMemory[this.index]['"mcp_spd"']),
      mcp_lvl_spd: this.binary(this.rawMemory[this.index]['"mcp_lvl_spd"']),
      mcp_vnav: this.binary(this.rawMemory[this.index]['"mcp_vnav"']),
      mcp_lnav: this.binary(this.rawMemory[this.index]['"mcp_lnav"']),
      mcp_vor_loc: this.binary(this.rawMemory[this.index]['"mcp_vor_loc"']),
      mcp_apprh: this.binary(this.rawMemory[this.index]['"mcp_apprh"']),
      mcp_hdg_sel: this.binary(this.rawMemory[this.index]['"mcp_hdg_sel"']),
      mcp_alt_hld: this.binary(this.rawMemory[this.index]['"mcp_alt_hld"']),
      mcp_vert_spd: this.binary(this.rawMemory[this.index]['"mcp_vert_spd"']),
      mcp_cmd_a: this.binary(this.rawMemory[this.index]['"mcp_cmd_a"']),
      mcp_cmd_b: this.binary(this.rawMemory[this.index]['"mcp_cmd_b"']),
      mcp_cws_a: this.binary(this.rawMemory[this.index]['"mcp_cws_a"']),
      mcp_cws_b: this.binary(this.rawMemory[this.index]['"mcp_cws_b"']),

      // Switches
      mcp_fd_1: this.binary(this.rawMemory[this.index]['"mcp_fd_1"']),
      mcp_fd_2: this.binary(this.rawMemory[this.index]['"mcp_fd_2"']),
      mcp_at_arm: this.binary(this.rawMemory[this.index]['"mcp_at_arm"'])
    };
    return memoryObject;
  }

  /* Function that converts ND display values to properly formatted numbers. */
  formatNdDials(val: any): number {
    if (val === '' || isNaN(val)) {
      return null;
    } else {
      return parseFloat(val);
    }
  }
  /* Function that converts MCP display values to properly formatted numbers. */
  formatMcpDials(val: any): number {
    if (val === '' || isNaN(val)) {
      return null;
    } else {
      return Math.round(Number(val));
    }
  }

  /* Function that converts binary values into booleans. */
  binary(val: any): boolean {
    if (val === '1') {
      return true;
    } else {
      return false;
    }
  }

  /* Function that converts elapsed seconds into formatted time. */
  formatTime(secondsElapsed: number) {
    secondsElapsed = Math.floor(secondsElapsed);
    const minutesElapsed = Math.floor(secondsElapsed / 60);
    secondsElapsed = secondsElapsed - (minutesElapsed * 60);

    const formattedMinutes = ('0' + minutesElapsed).slice(-2);
    const formattedSeconds = ('0' + secondsElapsed).slice(-2);

    const formattedTime = formattedMinutes + ':' + formattedSeconds;
    return formattedTime;
  }

  /* Function called when slider bar is changed. */
  sliderInput(value: number): void {
    this.runner = clearInterval(this.runner);
    this.playing = false;
    this.index = value;

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.optionsSharingService.changeTime(this.elapsedSeconds);

    this.enterData();
  }
}
