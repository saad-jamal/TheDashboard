import { HttpClient } from '@angular/common/http';
import { OffAoiSharingService } from './../../data-sharing/off-aoi-sharing.service';
import { NoDataSharingService } from './../../data-sharing/no-data-sharing.service';
import { EyeSharingService } from './../../data-sharing/eye-sharing.service';
import { SimulateService } from './../../simulate.service';
import { PfdSharingService } from './../../data-sharing/pfd-sharing.service';
import { NdSharingService } from './../../data-sharing/nd-sharing.service';
import { MiscSharingService } from './../../data-sharing/misc-sharing.service';
import { McpSharingService } from './../../data-sharing/mcp-sharing.service';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { MiscMemory } from './../../side-dashboard/misc/misc-memory';
import { NdMemory } from './../../lower-dashboard/nd/nd-memory';
import { PfdMemory } from './../../lower-dashboard/pfd/pfd-memory';
import { McpMemory } from './../../upper-dashboard/mcp/mcp-memory';

import { Disk } from './../../interfaces/disk';
import { EyeMemory } from '../../eye/eyetracking/eye-memory';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-computer',
  templateUrl: './computer.component.html',
  styleUrls: ['./computer.component.css']
})
/**
 * This class does the heavy lifting of controlling play-back. It consists
 * of a wide horizontal controller bar in the bottom right of the screen as
 * well as a small options menu in the bottom left of the screen. This class
 * makes use of various 'sharing services' to communicate with the other
 * components on screen.
 *
 * @author Saad Jamal
 */
export class ComputerComponent implements OnInit, AfterViewInit {

  /* Disk info containing expirement and video file names. */
  public diskInfo: Disk;

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

  /* Source of Video. */
  public vidSource: string;

  /* True if the audio is not mute. */
  public audioActive: boolean;

  /* True if the settings div should be displayed. False otherwise. */
  public displaySettings: boolean;

  /* True if the events div should be displayed. False otherwise. */
  public displayEvents: boolean;

  /* True if the vid div should be displayed. False otherwise. */
  public displayVideo: boolean;

  /* The HTML Ref video component. */
  @ViewChild('vid') vid: ElementRef<HTMLVideoElement>;

  /* The text input of vid offset. */
  @ViewChild('vidOffset') vidOffset: ElementRef<HTMLInputElement>;

  /* Vid Offset Value */
  private vidOffsetVal: number;

  /* The text input of sim offset. */
  @ViewChild('simOffset') simOffset: ElementRef<HTMLInputElement>;

  /* Sim Offset Value */
  private simOffsetVal: number;

  /* The check-box of video controls. */
  @ViewChild('vidControls') vidControls: ElementRef<HTMLInputElement>;

  /* Whether the HTML Video element displays video controls. */
  public displayControls: boolean;

  /* The check-box of linear fixations. */
  @ViewChild('linearFixations') linearFixationsRef: ElementRef<HTMLInputElement>;

  /* Whether the eye-tracking fixations are linear or non-linear. */
  public linearFixations: boolean;

  /* The check-box of alert indicators. */
  @ViewChild('alertIndicators') alertIndicatorsRef: ElementRef<HTMLInputElement>;

  /* Whether the play-back pauses upon encountering an indicator. */
  public alertIndicators: boolean;

  /* The previous fixation Object ID that was drawn. */
  public previousObject: number;

  /* If the hold is greater than 3 seconds, erase all fixations. */
  public hold: number;

  /* The time entered for an event-marker. */
  @ViewChild('eventTime') eventTime: ElementRef<HTMLInputElement>;

  /* The message entered for an event-marker. */
  @ViewChild('eventMessage') eventMessage: ElementRef<HTMLInputElement>;

  /* The time entered for an event-marker. */
  @ViewChild('colorSelector') eventColor: ElementRef<HTMLSelectElement>;

  /* A list of the event indicators currently on the slider bar. */
  private events: Event[];

  /* The number of indicators on the slider bar. */
  private numIndicators: number;

  /* The HTML Ref event container component. */
  @ViewChild('eventContainer') eventContainer: ElementRef<HTMLDivElement>;

  constructor(private simService: SimulateService,
              private mcpSharingService: McpSharingService,
              private miscSharingService: MiscSharingService,
              private ndSharingService: NdSharingService,
              private pfdSharingService: PfdSharingService,
              private eyeSharingService: EyeSharingService,
              private noDataSharingService: NoDataSharingService,
              private offAoISharingService: OffAoiSharingService,
              @Inject(DOCUMENT) document,
              private http: HttpClient) {
    this.rawMemory = [];
    this.playing = false;
    this.simSpeed = 50; // A frequency of 20 hertz.
    this.elapsedSeconds = 0;
    this.realTime = '--/--/-- --:--:--';

    this.vidSource = '';
    this.audioActive = true;

    this.displaySettings = false;
    this.displayVideo = false;
    this.displayEvents = false;

    this.simOffsetVal = 0;
    this.vidOffsetVal = 0;

    this.displayControls = false;
    this.linearFixations = false;
    this.alertIndicators = true;

    this.previousObject = 0;
    this.hold = 0;

    this.events = [];
    this.numIndicators = 0;

    this.diskInfo = {
      expirementName: 'Loading...',
      videoName: 'Loading...'
    };
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // I'll be honest. The following is the ugliest code ever written.
    this.simService.getSimulatorData().subscribe(
      (data) => this.rawMemory = data,
      (err) => {
        console.log(err);
        this.diskInfo = {
          expirementName: 'N/A',
          videoName: 'N/A'
        };
      }, () => {
        this.handleData();

        this.simService.getDiskInfo()
        .subscribe(data => (this.diskInfo = data),
          error => console.log(error),
          () => {
            if (this.diskInfo.expirementName === '') {
              this.diskInfo.expirementName = 'N/A';
            }

            if (this.diskInfo.videoName === '') {
              this.diskInfo.videoName = 'N/A';
            } else {
              this.vidSource = 'assets/video/' + this.diskInfo.videoName + '.mp4';
              console.log('Video Loaded: ' + this.vidSource);
              this.vid.nativeElement.insertAdjacentHTML('beforeend', '<source src=\''
                + 'assets/video/vid.mp4' + '\' type=\'video/mp4\'>');
            }
        });
      });

    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    this.vidOffset.nativeElement.value = this.vidOffsetVal.toFixed(2);
  }

  /* Function that is called the first time data is loaded in. Helps
   * set up the simulation. */
  handleData(): void {
    this.memoryLength = this.rawMemory.length - 3;
    this.index = 0;

    this.elapsedSeconds = 0;
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.enterData();

    console.log('Input Data Sucessfully Read.');

    this.simService.getEventIdicators()
      .subscribe(data => {
        this.initializeEvents(data);
      });
  }

  /* Function that is called every interval in order to re-enter data. */
  enterData(): void {
    this.mcpSharingService.changeMemory(this.buildMcpMemory());
    this.miscSharingService.changeMemory(this.buildMiscMemory());
    this.ndSharingService.changeMemory(this.buildNdMemory());
    this.pfdSharingService.changeMemory(this.buildPfdMemory());

    this.enterEyetracking();
  }

  /* Function that resets eye-tracking whenever major changes to play-back
   * are made. */
  resetEyetracking(): void {
    const memoryObject: EyeMemory = {
      object_being_viewed: null,
      confidence: null,
      x: null,
      y: null,
      empty_queue: true
    };
    this.hold = 0;
    this.previousObject = 0;
    this.eyeSharingService.changeMemory(memoryObject);
  }

  /* Function that handles sending eye-tracking data to Eye component. */
  enterEyetracking(): void {
    const memoryObject: EyeMemory = {
      object_being_viewed: this.parseEyeData(this.rawMemory[this.index]['"PGaze_Object_ID"']),
      confidence: this.parseEyeData(this.rawMemory[this.index]['"Gaze_Confidence"']),
      x: this.parseEyeData(this.rawMemory[this.index]['"PGaze_X_Intersection"']),
      y: this.parseEyeData(this.rawMemory[this.index]['"PGaze_Y_Intersection"']),
      empty_queue: false
    };

    let drawFixation = false;

    if (memoryObject.object_being_viewed === 0) {
      console.log('Pilot is viewing: Off AoI');
      this.offAoISharingService.changeMemory(true);
      this.noDataSharingService.changeMemory(false);

      this.previousObject = 0;
    } else if (memoryObject.confidence <  0.85) {
      console.log('Pilot is viewing: No Data');
      this.offAoISharingService.changeMemory(false);
      this.noDataSharingService.changeMemory(true);

      this.previousObject = 0;
    } else {
      this.offAoISharingService.changeMemory(false);
      this.noDataSharingService.changeMemory(false);
      this.hold = this.index;
    }

    if (this.index - this.hold > 185) {
      memoryObject.empty_queue = true;
    }

    if (this.index > 3) {
      drawFixation = (this.parseEyeData(this.rawMemory[this.index]['"saccade"']) === 0)
        && ((this.parseEyeData(this.rawMemory[this.index - 1]['"saccade"']) === 1)
          || (this.parseEyeData(this.rawMemory[this.index - 2]['"saccade"']) === 1));
    }

    if (this.previousObject !== memoryObject.object_being_viewed) {
      drawFixation = true;
    }

    if (this.linearFixations) {
      drawFixation = true;
    }

    if (drawFixation) {
      this.previousObject = memoryObject.object_being_viewed;
      this.eyeSharingService.changeMemory(memoryObject);
    }
  }

  /* Function that properly formats eye data. */
  parseEyeData(val: any): number {
    if (val === '' || isNaN(val)) {
      return null;
    } else {
      return parseFloat(val);
    }
  }

  /* Function that is called when play/pause button is clicked. It should
   * pause/resume play-back. */
   public play(): void {
    if (this.playing) {
      this.vid.nativeElement.pause();
      this.runner = clearInterval(this.runner);
    } else {
      this.vid.nativeElement.play();
      this.runner = setInterval(() => this.runSimulation(), this.simSpeed);
    }
    this.playing = !this.playing;
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

    this.simOffsetVal = this.elapsedSeconds;
    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);

    this.enterData();

    if (this.alertIndicatorsRef) {
      this.checkIndicators();
    }
  }

  /* Function that pauses play back if indicators are hit. */
  checkIndicators(): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      const eventIndex = Math.floor(this.events[i].time * 60);
      if ((eventIndex === this.index) || ((eventIndex + 1) === this.index) || ((eventIndex + 2) === this.index)) {
        this.vid.nativeElement.pause();
        this.runner = clearInterval(this.runner);
        this.playing = false;

        setTimeout(() => 'Purposely buffering.', 500);
        alert(this.formatTime(this.events[i].time) + ' ' + this.events[i].message);
      }
    }
  }

  /* Function that is called when forward button is clicked. It should
   * forward the play-back by exactly one second. */
  public forward(): void {
    this.playing = false;
    this.runner = clearInterval(this.runner);
    this.index  = Number(this.index) + 60;
    this.vid.nativeElement.pause();

    if (this.index >= this.memoryLength) {
      this.index = this.memoryLength;
    }

    if (this.vid.nativeElement.currentTime < this.vid.nativeElement.duration) {
      this.vid.nativeElement.currentTime += 1;
    }

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.simOffsetVal = this.elapsedSeconds;
    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);

    this.enterData();
  }

  /* Function that is called when backward button is clicked. It should
   * decrement the play-back by exactly one second. */
  public backward(): void {
    this.playing = false;
    this.runner = clearInterval(this.runner);
    this.index = Number(this.index) - 60;
    this.vid.nativeElement.pause();

    if (this.index < 0) {
      this.index = 0;
    }

    if (this.vid.nativeElement.currentTime > 0) {
      this.vid.nativeElement.currentTime -= 1;
    }

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.simOffsetVal = this.elapsedSeconds;
    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);

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
      rate_of_clb: this.formatNdDials(this.rawMemory[this.index]['"rate_of_clb"']),
      cal_as: this.formatNdDials(this.rawMemory[this.index]['"cal_as"']),
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
    this.vid.nativeElement.pause();

    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.vid.nativeElement.currentTime = this.elapsedSeconds + this.vidOffsetVal;

    this.simOffsetVal = this.elapsedSeconds;
    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);

    this.resetEyetracking();
    this.enterData();
  }

  /* Toggles the audio button when pressed. Mutes video. */
  toggleAudio(): void {
    this.audioActive = !this.audioActive;
    this.vid.nativeElement.muted = !this.audioActive;
  }

  /* Toggles the settings div. */
  displaySettingsDiv(): void {
    this.runner = clearInterval(this.runner);
    this.playing = false;
    this.vid.nativeElement.pause();

    this.displaySettings = !this.displaySettings;

    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    this.vidOffset.nativeElement.value = this.vidOffsetVal.toFixed(2);

    this.vidControls.nativeElement.checked = this.displayControls;
    this.linearFixationsRef.nativeElement.checked = this.linearFixations;
    this.alertIndicatorsRef.nativeElement.checked = this.alertIndicators;
  }

  /* Toggles the events div. */
  displayEventsDiv(): void {
    this.runner = clearInterval(this.runner);
    this.playing = false;
    this.vid.nativeElement.pause();

    this.displayEvents = !this.displayEvents;
  }

  /* Toggles the video div. */
  displayVidDiv(): void {
    this.displayVideo = !this.displayVideo;
  }

  /* Function called upon submitting the settings. */
  submitSettings(): void {
    this.runner = clearInterval(this.runner);
    this.playing = false;
    this.vid.nativeElement.pause();

    this.simOffsetVal = parseFloat(this.simOffset.nativeElement.value);
    this.vidOffsetVal = parseFloat(this.vidOffset.nativeElement.value);

    if ((this.simOffsetVal * 60) < 0) {
      this.simOffsetVal = 0;
    } else if ((this.simOffsetVal * 60) > this.memoryLength) {
      this.simOffsetVal = this.memoryLength;
    }

    if (this.vidOffsetVal < 0) {
      this.vidOffsetVal = 0;
    } else if (this.vidOffsetVal > this.vid.nativeElement.duration) {
      this.vidOffsetVal = this.vid.nativeElement.duration;
    }

    this.displayControls = this.vidControls.nativeElement.checked;
    this.linearFixations = this.linearFixationsRef.nativeElement.checked;
    this.alertIndicators = this.alertIndicatorsRef.nativeElement.checked;

    this.index = Math.ceil(this.simOffsetVal * 60);
    this.elapsedSeconds = parseFloat(this.rawMemory[this.index]['"utc_time"']) - parseFloat(this.rawMemory[0]['"utc_time"']);
    this.realTime = this.rawMemory[this.index]['"utc_datetime"'];

    this.vid.nativeElement.currentTime = this.elapsedSeconds + this.vidOffsetVal;

    this.simOffsetVal = this.elapsedSeconds;
    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    this.vidOffset.nativeElement.value = this.vidOffsetVal.toFixed(2);

    this.resetEyetracking();
    this.enterData();
  }

  /* Add a specific event to the list of events. */
  addEvent(): void {
    const eventObject = {
      time: parseFloat(this.eventTime.nativeElement.value),
      message: this.eventMessage.nativeElement.value,
      color: this.eventColor.nativeElement.value,
      id_num: this.numIndicators
    };
    this.events.push(eventObject);

    const xShift = (((eventObject.time * 6000) / this.memoryLength) + (0.7)) * (0.97666);

    const htmlString: string = '<div style="background-color: ' + eventObject.color
      + '; position: absolute; left: ' + xShift + '%; top: -100%; width: 0.75%; height: 300%; cursor: pointer; border: none;" id="event'
      + this.numIndicators + '" title="' + this.formatTime(eventObject.time) + ' ' + eventObject.message + '"></div>';
    this.eventContainer.nativeElement.insertAdjacentHTML('beforeend', htmlString);

    const elem = document.getElementById('event' + this.numIndicators);
    elem.onclick = (event) => {
      const id = event.srcElement['id'];
      const specElem = document.getElementById(id);

      const result = confirm('Are you sure you want to delete this event?\n'
        + specElem.title);
      if (result) {
        this.events.splice(id.slice(5), 1);
        this.eventContainer.nativeElement.removeChild(elem);
      }
    };
    this.numIndicators += 1;
  }

  /* Initialize the events array. Add each div to HTML. */
  initializeEvents(jsonObj: any[]) {
    console.log(jsonObj);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < jsonObj.length; i++) {
      const givenColor = (jsonObj[i].color !== undefined) ? jsonObj[i].color : 'yellow';
      console.log(givenColor);
      const givenEvent = {
        time: jsonObj[i].time,
        message: jsonObj[i].message,
        color: givenColor,
        id_num: this.numIndicators
      };
      this.events.push(givenEvent);

      const xShift = (((givenEvent.time * 6000) / this.memoryLength) + (0.7)) * (0.97666);
      const htmlString: string = '<div style="background-color: ' + givenEvent.color
        + '; position: absolute; left: ' + xShift + '%; top: -100%; width: 0.75%; height: 300%; cursor: pointer; border: none;" id="event'
        + this.numIndicators + '" title="' + this.formatTime(givenEvent.time) + ' ' + givenEvent.message + '"></div>';
      this.eventContainer.nativeElement.insertAdjacentHTML('beforeend', htmlString);

      const elem = document.getElementById('event' + this.numIndicators);
      elem.onclick = (event) => {
        const id = event.srcElement['id'];
        const specElem = document.getElementById(id);

        const result = confirm('Are you sure you want to delete this event?\n'
          + specElem.title);
        if (result) {
          this.events.splice(id.slice(5), 1);
          this.eventContainer.nativeElement.removeChild(elem);
        }
      };
      this.numIndicators++;
    }
  }

  /* Download all the events currently stored on the slider bar. */
  downloadEvents() {
    const toPostJSON = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      toPostJSON.push({
        time: this.events[i].time,
        message: this.events[i].message,
        color: this.events[i].color
      });
    }
    this.simService.postEventIndicators(toPostJSON)
      .subscribe(data => {},
                error => {},
                () => alert('Sucessfully downloaded event data.'));
  }

  /* Clear all the events currently stored on the slider bar. */
  clearEvents(): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      const specId = this.events[i].id_num;
      const elem = document.getElementById('event' + specId);
      this.eventContainer.nativeElement.removeChild(elem);
    }
    this.events = [];
    this.numIndicators = 0;
  }
}

/* This object represents any given event indicator. */
interface Event {
  id_num: number;
  time: number; // Measured in seconds
  message: string;
  color: string;
}
