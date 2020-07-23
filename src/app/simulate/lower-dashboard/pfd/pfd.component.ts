import { PfdSharingService } from './../../data-sharing/pfd-sharing.service';
import { PfdMemory } from './pfd-memory';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-pfd',
  templateUrl: './pfd.component.html',
  styleUrls: ['./pfd.component.css']
})
/**
 * This class represents the Primary Flight Display. It uses HTML Canvas
 * to initially draw the underlying PNG, then overlays the background
 * using HTML Div's with variable data.
 *
 * @author Saad Jamal
 */
export class PfdComponent implements AfterViewInit {
  /* Div element encapsulating this component. */
  @ViewChild('pfdDiv') pfdDiv: ElementRef<HTMLDivElement>;

  /* Height of the div excluding borders. */
  private height: number;

  /* Width of the div excluding borders. */
  private width: number;

  /* Canvas element drawing the background. */
  @ViewChild('pfdBackground', { static: true })
  backgroundCanvas: ElementRef<HTMLCanvasElement>;

  /* Canvas element drawing the foreground. */
  @ViewChild('pfdForeground', { static: true })
  foregroundCanvas: ElementRef<HTMLCanvasElement>;

  /* Ctx element used for background animation. */
  private backCtx: CanvasRenderingContext2D;

  /* Ctx element used for foreground animation. */
  private foreCtx: CanvasRenderingContext2D;

  /* A singular standardized unit of pixels that scales with the
   * width of screen. It is equal to 1/1000th of the component width. */
  private wUnit: number;

  /* A singular standardized unit of pixels that scales with the height of
   * the screen. It is equal to 1/1000th of the component height. */
   private hUnit: number;

  /* An object that stores all the sim data needed to render this
   * component. */
  public localMemory: PfdMemory;

  constructor(private sharingService: PfdSharingService) {
    // Initialize with starting memory
    this.localMemory = {
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
    };
  }

  /* The ViewChild annotations apply during the ngAfterViewInit stage. */
  ngAfterViewInit(): void {
    this.calculateProportions();

    this.backCtx = this.backgroundCanvas.nativeElement.getContext('2d');
    this.foreCtx = this.foregroundCanvas.nativeElement.getContext('2d');
    this.render();

    this.sharingService.currentMemory.subscribe(memory => {
      this.localMemory = memory;
      this.render();
    });
  }

  /* Animate the component. */
  render(): void {
    this.backCtx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();

    this.foreCtx.clearRect(0, 0, this.width, this.height);
    this.drawForeground();
  }

  /* Background of component. This won't change during playback. */
  drawBackground(): void {
    // Flight Mode Annunciations
    this.backCtx.strokeStyle = 'white';
    this.backCtx.lineWidth = 2;

    this.backCtx.beginPath();
    this.backCtx.moveTo(360 * this.wUnit, 10 * this.hUnit);
    this.backCtx.lineTo(360 * this.wUnit, 105 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.beginPath();
    this.backCtx.moveTo(570 * this.wUnit, 10 * this.hUnit);
    this.backCtx.lineTo(570 * this.wUnit, 105 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.lineWidth = 1;

    // Airspeed Tape Background
    this.backCtx.strokeStyle = 'white';
    this.backCtx.strokeRect(10 * this.wUnit, 65 * this.hUnit, 155 * this.wUnit, 810 * this.hUnit);

    // Attitude Indicator Border
    this.backCtx.lineWidth = 2;
    this.backCtx.strokeStyle = 'white';
    // this.backCtx.strokeRect(190 * this.wUnit, 210 * this.hUnit, 500 * this.wUnit, 550 * this.hUnit);
    this.backCtx.lineWidth = 1;

    // Altimeter Tape Background
    this.backCtx.strokeStyle = 'white';
    this.backCtx.strokeRect(760 * this.wUnit, 65 * this.hUnit, 155 * this.wUnit, 810 * this.hUnit);

    // Barometer Box
    this.backCtx.strokeStyle = 'white';
    this.backCtx.strokeRect(755 * this.wUnit, 885 * this.hUnit, 165 * this.wUnit, 65 * this.hUnit);

    this.backCtx.lineWidth = 1;

    // Render Verticual Speed Indicator
    this.drawVerticalSpeedIndicator();

  }

  /* Draw foreground of the vertical speed indicator. */
  drawVerticalSpeedLine(): void {
    const X = 925 * this.wUnit;
    const Y = 180 * this.hUnit;
    const WID = 70 * this.wUnit;
    const HEI = 600 * this.hUnit;

    const xShift = 24 * this.wUnit;

    this.backCtx.strokeStyle = 'white';
    this.backCtx.moveTo(X + WID - (5 * this.wUnit), Y + (HEI / 2));
    let yShift: number;
    if (this.localMemory.rate_of_clb <= 1000 && this.localMemory.rate_of_clb >= -1000) {
      yShift = this.localMemory.rate_of_clb / (52 * this.hUnit);
    } else if (this.localMemory.rate_of_clb <= 2000 && this.localMemory.rate_of_clb >= -2000) {
      yShift = (this.localMemory.rate_of_clb % 1001) / (67 * this.hUnit);
      if (this.localMemory.rate_of_clb < 0) {
        yShift -= (143 * this.hUnit);
      } else {
        yShift += (143 * this.hUnit);
      }
    } else if (this.localMemory.rate_of_clb <= 6000 && this.localMemory.rate_of_clb >= -6000) {
      yShift = ((this.localMemory.rate_of_clb - 2000) % 4001) / (460 * this.hUnit);
      if (this.localMemory.rate_of_clb < 0) {
        yShift -= (253 * this.hUnit);
      } else {
        yShift += (253 * this.hUnit);
      }
    }
    this.backCtx.lineTo(X + xShift, Y + (HEI / 2) - yShift);
    this.backCtx.stroke();
  }

  /* Draw the background of the vertical speed indicator. */
  drawVerticalSpeedIndicator(): void {
    const X = 925 * this.wUnit;
    const Y = 180 * this.hUnit;
    const WID = 70 * this.wUnit;
    const HEI = 600 * this.hUnit;

    const xShift = 20 * this.wUnit;

    this.backCtx.fillStyle = '#191921';
    this.backCtx.strokeStyle = 'white';

    this.backCtx.lineWidth = 1;

    // Sketch outline of VSI
    this.backCtx.beginPath();
    this.backCtx.moveTo(925 * this.wUnit, 150 * this.hUnit);
    this.backCtx.lineTo(960 * this.wUnit, 150 * this.hUnit);
    this.backCtx.lineTo(995 * this.wUnit, 300 * this.hUnit);
    this.backCtx.lineTo(995 * this.wUnit, 660 * this.hUnit);
    this.backCtx.lineTo(960 * this.wUnit, 810 * this.hUnit);
    this.backCtx.lineTo(925 * this.wUnit, 810 * this.hUnit);
    this.backCtx.lineTo(925 * this.wUnit, 550 * this.hUnit);
    this.backCtx.lineTo(945 * this.wUnit, 550 * this.hUnit);
    this.backCtx.lineTo(945 * this.wUnit, 410 * this.hUnit);
    this.backCtx.lineTo(925 * this.wUnit, 410 * this.hUnit);
    this.backCtx.lineTo(925 * this.wUnit, 150 * this.hUnit);
    this.backCtx.stroke();
    this.backCtx.fill();

    // Draw Middle Dash
    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, Y + (HEI / 2));
    this.backCtx.lineTo(X + (55 * this.wUnit), Y + (HEI / 2));
    this.backCtx.stroke();

    // First upper and lower dash
    this.backCtx.lineWidth = 1;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 548 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 548 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.lineWidth = 1;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 412 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 412 * this.hUnit);
    this.backCtx.stroke();

    // Second upper and lower dash
    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 620 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 620 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('1', X + (2 * this.wUnit), 628 * this.hUnit);

    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 340 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 340 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('1', X + (2 * this.wUnit), 348 * this.hUnit);

    // Third upper and lower dash
    this.backCtx.lineWidth = 1;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 675 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 675 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.lineWidth = 1;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 285 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 285 * this.hUnit);
    this.backCtx.stroke();

    // Third upper and lower dash
    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 730 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 730 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 230 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 230 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('2', X + (2 * this.wUnit), 238 * this.hUnit);

    this.backCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('2', X + (2 * this.wUnit), 738 * this.hUnit);

    // Fourth upper and lower dash
    this.backCtx.lineWidth = 1;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 765 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 765 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.lineWidth = 1;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 205 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 205 * this.hUnit);
    this.backCtx.stroke();

    // Fifth upper and lower dash
    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 795 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 795 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.lineWidth = 2;
    this.backCtx.beginPath();
    this.backCtx.moveTo(X + xShift, 175 * this.hUnit);
    this.backCtx.lineTo(X + xShift + (15 * this.wUnit), 175 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('6', X + (2 * this.wUnit), 183 * this.hUnit);

    this.backCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('6', X + (2 * this.wUnit), 803 * this.hUnit);

    // Base of line
    this.backCtx.beginPath();
    this.backCtx.ellipse(X + WID - (5 * this.wUnit), Y + (HEI / 2), 5 * this.wUnit, 5 * this.hUnit, 0, 0, 2 * Math.PI);
    this.backCtx.fill();
  }

  /* Foreground of component. This will change during playback as
   * data in memory changes. */
  drawForeground(): void {
    // Render Attitude Indicator Animations
    this.drawAttitudeIndicator();

    // Render VSI Line
    this.drawVerticalSpeedLine();

    // Render airspeed tape and tickers.
    this.drawAirspeedTape();
    this.drawAirspeedTicker();

    // Render altimeter tape and tickers.
    this.drawAltimeterTape();
    this.drawAltimeterTicker();

    // Render ILS and GS Probes
    this.drawGsProbe();
    this.drawLocProbe();

    // Render Heading Dial
    this.drawHeadingDial();
  }

  /* Function that is called everytime window is resized. */
  onResize(event) {
    this.calculateProportions();
    this.render();
  }

  /* In order to determine the new height and widths, this function is
   * called each time the page resizes. */
  calculateProportions(): void {
    this.height = this.pfdDiv.nativeElement.clientHeight;
    this.width = this.pfdDiv.nativeElement.clientWidth;
    this.wUnit = (0.001 * this.width);
    this.hUnit = (0.001 * this.height);

    this.backgroundCanvas.nativeElement.height = this.height;
    this.backgroundCanvas.nativeElement.width = this.width;

    this.foregroundCanvas.nativeElement.height = this.height;
    this.foregroundCanvas.nativeElement.width = this.width;
  }

  /* Draw Airspeed Tape. */
  drawAirspeedTape(): void {
    const X = 10 * this.wUnit;
    const Y = 65 * this.hUnit;
    const WID = 155 * this.wUnit;
    const HEI = 810 * this.hUnit;

    const value = this.localMemory.cal_as;
    const bigTicks = 100;
    const smallTicks = 10;
    const scale = 135 * this.hUnit;
    const fontSize = 40 * this.wUnit;

    this.foreCtx.save();
    this.foreCtx.fillStyle = '#191921';
    this.foreCtx.rect(X, Y, WID + (20 * this.wUnit), HEI);
    this.foreCtx.fillRect(X, Y, WID, HEI);
    this.foreCtx.clip();

    const numberToDraw = Math.floor(HEI / scale);

    this.foreCtx.font = fontSize + 'px Arial';
    this.foreCtx.fillStyle = 'white';

    this.foreCtx.textAlign = 'center';
    this.foreCtx.textBaseline = 'middle';

    for (let i = (-1 * numberToDraw); i < numberToDraw; i++) {
      const relValue = Math.floor((value - smallTicks * i) / smallTicks) * smallTicks;
      const diff = (value - relValue) / smallTicks;
      const newY = ((Y + HEI) / 2) + (scale * diff) + (42 * this.hUnit);

      if (((newY) > Y) && ((newY - fontSize) < (Y + HEI)) && (relValue >= 0)) {
        if (relValue % bigTicks === 0) {
          const shiftX = 5 * this.wUnit;
          const shiftY = 3 * this.hUnit;

          this.foreCtx.font = (fontSize * 1.5) + 'px Arial';

          this.foreCtx.lineWidth = 2;
          this.foreCtx.strokeStyle = 'white';
          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + shiftX, newY - (fontSize * 0.75) - shiftY);
          this.foreCtx.lineTo(X + shiftX + WID, newY - (fontSize * 0.75) - shiftY);
          this.foreCtx.stroke();

          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + shiftX, newY + (fontSize * 0.75) - shiftY);
          this.foreCtx.lineTo(X + shiftX + WID, newY + (fontSize * 0.75) - shiftY);
          this.foreCtx.stroke();

          this.foreCtx.lineWidth = 1;
          this.foreCtx.fillStyle = 'white';
          this.foreCtx.fillText(String(relValue), X + (WID / 2) + shiftX, newY);
          this.foreCtx.font = fontSize + 'px Arial';
        } else if (relValue % smallTicks === 0) {
          const textWidth = this.foreCtx.measureText(String(relValue)).width;

          this.foreCtx.lineWidth = 1;

          this.foreCtx.strokeStyle = 'white';
          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + (WID / 2) + (20 * this.wUnit), newY);
          this.foreCtx.lineTo(X + WID - (5 * this.wUnit), newY);
          this.foreCtx.stroke();

          this.foreCtx.fillStyle = 'white';
          this.foreCtx.fillText(String(relValue), X + (textWidth / 2) + (15 * this.wUnit), newY);
        }
      }
    }

    const diff = (value - this.localMemory.mcp_ias_mach_ds) / smallTicks;
    const newY = (Y + (HEI / 2)) + (scale * diff) + (10 * this.hUnit);

    if ((newY > Y) && ((newY - fontSize) < (Y + HEI))) {
      const arrowSize = 14 * this.hUnit;

      this.foreCtx.strokeStyle = '#E357FF';

      this.foreCtx.lineWidth = 2;
      this.foreCtx.beginPath();
      this.foreCtx.moveTo(0.75 * (X + WID), newY);
      this.foreCtx.lineTo(0.85 * (X + WID), newY - arrowSize);
      this.foreCtx.lineTo(1.1 * (X + WID), newY - arrowSize);
      this.foreCtx.lineTo(1.1 * (X + WID), newY + arrowSize);
      this.foreCtx.lineTo(0.85 * (X + WID), newY + arrowSize);
      this.foreCtx.closePath();
      this.foreCtx.stroke();
    }

    this.foreCtx.restore();
  }

  /* Draw Airspeed Ticker. */
  drawAirspeedTicker(): void {
    const X = 10 * this.wUnit;
    const Y = 75 * this.hUnit;

    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.fillStyle = 'black';
    this.foreCtx.lineWidth = 2;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X + (110 * this.wUnit), Y + (405 * this.hUnit));
    this.foreCtx.lineTo(X + (95 * this.wUnit), Y + (420 * this.hUnit));
    this.foreCtx.lineTo(X + (95 * this.wUnit), Y + (435 * this.hUnit));
    this.foreCtx.lineTo(X + (-8 * this.wUnit), Y + (435 * this.hUnit));
    this.foreCtx.lineTo(X + (-8 * this.wUnit), Y + (375 * this.hUnit));
    this.foreCtx.lineTo(X + (95 * this.wUnit), Y + (375 * this.hUnit));
    this.foreCtx.lineTo(X + (95 * this.wUnit), Y + (390 * this.hUnit));
    this.foreCtx.closePath();
    this.foreCtx.stroke();
    this.foreCtx.fill();
  }

  /* Draw Altimeter Tape. */
  drawAltimeterTape(): void {
    const X = 760 * this.wUnit;
    const Y = 65 * this.hUnit;
    const WID = 155 * this.wUnit;
    const HEI = 810 * this.hUnit;

    const value = ((this.localMemory.fo_ef_baro_cur - 1013) * 28) + this.localMemory.pres_alt;
    const bigTicks = 1000;
    const smallTicks = 100;
    const scale = 135 * this.hUnit;
    const fontSize = 35 * this.wUnit;

    this.foreCtx.save();
    this.foreCtx.fillStyle = '#191921';
    this.foreCtx.rect(X - (25 * this.wUnit), Y, WID + (25 * this.wUnit), HEI);
    this.foreCtx.fillRect(X, Y, WID, HEI);
    this.foreCtx.clip();

    const numberToDraw = Math.floor(HEI / scale);

    this.foreCtx.font = fontSize + 'px Arial';
    this.foreCtx.textAlign = 'center';
    this.foreCtx.textBaseline = 'middle';

    for (let i = (-1 * numberToDraw); i < numberToDraw; i++) {
      const relValue = Math.floor((value - smallTicks * i) / smallTicks) * smallTicks;
      const diff = (value - relValue) / smallTicks;
      const newY = ((Y + HEI) / 2) + (scale * diff) + (42 * this.hUnit);

      if (((newY) > Y) && ((newY - fontSize) < (Y + HEI))) {
        if (relValue % bigTicks === 0) {
          const shiftX = 5 * this.wUnit;
          const shiftY = 3 * this.hUnit;

          this.foreCtx.font = (fontSize * 1.5) + 'px Arial';

          this.foreCtx.lineWidth = 2;
          this.foreCtx.strokeStyle = 'white';
          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + shiftX, newY - (fontSize * 0.75) - shiftY);
          this.foreCtx.lineTo(X + shiftX + WID, newY - (fontSize * 0.75) - shiftY);
          this.foreCtx.stroke();

          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + shiftX, newY + (fontSize * 0.75) - shiftY);
          this.foreCtx.lineTo(X + shiftX + WID, newY + (fontSize * 0.75) - shiftY);
          this.foreCtx.stroke();

          this.foreCtx.lineWidth = 1;
          this.foreCtx.fillStyle = 'white';
          this.foreCtx.fillText(String(relValue), X + (WID / 2) + shiftX, newY);
          this.foreCtx.font = fontSize + 'px Arial';
        } else if (relValue % smallTicks === 0) {
          const textWidth = this.foreCtx.measureText(String(relValue)).width;
          this.foreCtx.lineWidth = 1;

          this.foreCtx.strokeStyle = 'white';
          this.foreCtx.fillStyle = 'white';
          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + (55 * this.wUnit), newY);
          this.foreCtx.lineTo(X + (10 * this.wUnit), newY);
          this.foreCtx.stroke();

          this.foreCtx.fillText(String(relValue), X + (textWidth / 2) + (WID / 2) - (10 * this.wUnit), newY);
        }
      }
    }

    const shiftedAltDs = ((this.localMemory.fo_ef_baro_cur - 1013) * 28) + this.localMemory.mcp_alt_ds;
    const diff = (value - shiftedAltDs) / smallTicks;
    const newY = (Y + (HEI / 2)) + (scale * diff) + (10 * this.hUnit);

    if ((newY > Y) && ((newY - fontSize) < (Y + HEI))) {
      this.foreCtx.fillStyle = '#E357FF';
      this.foreCtx.strokeStyle = '#E357FF';
      this.foreCtx.beginPath();
      this.foreCtx.moveTo(X, newY);
      this.foreCtx.lineTo(X - (15 * this.wUnit), newY - (50 * this.hUnit));
      this.foreCtx.lineTo(X, newY - (50 * this.hUnit));
      this.foreCtx.lineTo(X, newY + (50 * this.hUnit));
      this.foreCtx.lineTo(X - (15 * this.wUnit), newY + (50 * this.hUnit));
      this.foreCtx.closePath();
      this.foreCtx.fill();

      this.foreCtx.lineWidth = 4;
      this.foreCtx.beginPath();
      this.foreCtx.moveTo(X, newY);
      this.foreCtx.lineTo(X + (15 * this.wUnit), newY);
      this.foreCtx.stroke();
      this.foreCtx.lineWidth = 1;
    }

    this.foreCtx.restore();
  }

  /* Draw Altimeter Ticker. */
  drawAltimeterTicker(): void {
    const X = 760 * this.wUnit;
    const Y = 75 * this.hUnit;
    const WID = 155 * this.wUnit;
    const HEI = 810 * this.hUnit;

    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.fillStyle = 'black';
    this.foreCtx.lineWidth = 2;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X + (22 * this.wUnit), Y + (405 * this.hUnit));
    this.foreCtx.lineTo(X + (37 * this.wUnit), Y + (420 * this.hUnit));
    this.foreCtx.lineTo(X + (37 * this.wUnit), Y + (435 * this.hUnit));
    this.foreCtx.lineTo(X + (190 * this.wUnit), Y + (435 * this.hUnit));
    this.foreCtx.lineTo(X + (190 * this.wUnit), Y + (375 * this.hUnit));
    this.foreCtx.lineTo(X + (37 * this.wUnit), Y + (375 * this.hUnit));
    this.foreCtx.lineTo(X + (37 * this.wUnit), Y + (390 * this.hUnit));
    this.foreCtx.closePath();
    this.foreCtx.stroke();
    this.foreCtx.fill();
  }

  /* Calculate Baro Pressure, Measured in Hg Inches. */
  calculateBaroPressure(): string {
    return (this.localMemory.fo_ef_baro_cur / 33.864).toFixed(2);
  }

  /* Calculate revised altitude. */
  calculateRevisedAltitude(): string {
    if (this.localMemory.fo_ef_baro_cur == null || this.localMemory.pres_alt == null) {
      return '';
    }
    const value = ((this.localMemory.fo_ef_baro_cur - 1013) * 28) + this.localMemory.pres_alt;
    return (value).toFixed(0);
  }

  /* Function that returns a boolean value on whether hatch should be
   * displayed in altimeter ticker. */
  displayHatch(): boolean {
    const value = ((this.localMemory.fo_ef_baro_cur - 1013) * 28) + this.localMemory.pres_alt;
    if (value <= 9999) {
      return true;
    } else {
      return false;
    }
  }

  /* Function that renders the GS Probe. These are the circles to the right
   * of the attitude indicator. */
  drawGsProbe(): void {
    const X = 725 * this.wUnit;
    const Y = 480 * this.hUnit;

    const rY = Y - (this.localMemory.ils_2_gs_dev * (240 * this.hUnit));
    this.fillTallRhombus(X, rY, 35 * this.wUnit, '#E357FF');

    // Middle Notche
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.lineWidth = 3;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X - (20 * this.wUnit), Y);
    this.foreCtx.lineTo(X + (20 * this.wUnit), Y);
    this.foreCtx.stroke();

    this.foreCtx.lineWidth = 2;

    // Bottom Two
    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y + (240 * this.hUnit), 15 * this.wUnit, 15 * this.hUnit, 0, 0, 2 * Math.PI);
    this.foreCtx.stroke();

    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y + (120 * this.hUnit), 15 * this.wUnit, 15 * this.hUnit, 0, 0, 2 * Math.PI);
    this.foreCtx.stroke();

    // Top Two
    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y - (240 * this.hUnit), 15 * this.wUnit, 15 * this.hUnit, 0, 0, 2 * Math.PI);
    this.foreCtx.stroke();

    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y - (120 * this.hUnit), 15 * this.wUnit, 15 * this.hUnit, 0, 0, 2 * Math.PI);
    this.foreCtx.stroke();

    this.foreCtx.lineWidth = 1;
  }

  /* Draws the tall rhombus used in the GS probe. */
  fillTallRhombus(x: number, y: number, width: number, color: string): void {
    const halfWidth = width / 2;
    this.foreCtx.strokeStyle = color;
    this.foreCtx.fillStyle = color;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(x - halfWidth, y);
    this.foreCtx.lineTo(x, y - width);
    this.foreCtx.lineTo(x + halfWidth, y);
    this.foreCtx.lineTo(x, y + width);
    this.foreCtx.closePath();
    this.foreCtx.fill();
  }

  /* Draws the wide rhombus used in the LOC probe. */
  fillWideRhombus(x: number, y: number, width: number, color: string): void {
    const halfWidth = width / 2;
    this.foreCtx.strokeStyle = color;
    this.foreCtx.fillStyle = color;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(x - width, y);
    this.foreCtx.lineTo(x, y - halfWidth);
    this.foreCtx.lineTo(x + width, y);
    this.foreCtx.lineTo(x, y + halfWidth);
    this.foreCtx.closePath();
    this.foreCtx.fill();
  }

  /* Function that renders the ILS Probe. These are the circles to the right
   * of the attitude indicator. */
  drawLocProbe(): void {
    const X = 440 * this.wUnit;
    const Y = 780 * this.hUnit;

    let rX = X + ((190 * this.wUnit) * this.localMemory.ils_2_loc_dev);
    this.fillWideRhombus(rX, Y, 35 * this.wUnit, '#E357FF');

    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.fillStyle = 'white';
    this.foreCtx.lineWidth = 3;

    // Middle Notch
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X, Y - (20 * this.hUnit));
    this.foreCtx.lineTo(X, Y + (20 * this.hUnit));
    this.foreCtx.stroke();

    this.foreCtx.lineWidth = 2;

    // Outer Notches
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X - (185 * this.wUnit), Y - (15 * this.hUnit));
    this.foreCtx.lineTo(X - (185 * this.wUnit), Y + (15 * this.hUnit));
    this.foreCtx.lineTo(X - (195 * this.wUnit), Y + (15 * this.hUnit));
    this.foreCtx.lineTo(X - (195 * this.wUnit), Y - (15 * this.hUnit));
    this.foreCtx.closePath();
    this.foreCtx.stroke();

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X + (185 * this.wUnit), Y - (15 * this.hUnit));
    this.foreCtx.lineTo(X + (185 * this.wUnit), Y + (15 * this.hUnit));
    this.foreCtx.lineTo(X + (195 * this.wUnit), Y + (15 * this.hUnit));
    this.foreCtx.lineTo(X + (195 * this.wUnit), Y - (15 * this.hUnit));
    this.foreCtx.closePath();
    this.foreCtx.stroke();
  }

  /* Function that draws the attitude indicator in the center of PFD. */
  drawAttitudeIndicator(): void {
    this.drawAttitudeBackground();
    this.drawAttitudeForeground();
  }

  /* Function that draws the blue over orange segment of the PFD. This
   * obviously changes during playback. */
  drawAttitudeBackground(): void {
    const X = 190 * this.wUnit;
    const Y = 210 * this.hUnit;

    const WID = 500 * this.wUnit;
    const HEI = 545 * this.hUnit;

    const pixelsPerDegree = 11 * this.hUnit;
    const pitchAngle = this.localMemory.pitch_angle;
    let rollAngle = this.localMemory.roll_angle;
    rollAngle = rollAngle * -1;

    this.foreCtx.lineWidth = 1;

    this.foreCtx.save();
    this.foreCtx.rect(X, Y, WID, HEI);
    this.foreCtx.clip();

    this.foreCtx.translate(X + (WID / 2), Y + (HEI / 2));
    this.foreCtx.rotate(rollAngle * Math.PI / 180);
    this.foreCtx.translate(0, pixelsPerDegree * pitchAngle);

    this.foreCtx.fillStyle = '#0072B9';
    this.foreCtx.fillRect(-1 * WID, -2700 * this.hUnit, 2 * this.width, 2700 * this.hUnit);
    this.foreCtx.fillStyle = '#752E00';
    this.foreCtx.fillRect(-1 * WID, 0, 2 * WID, 2700 * this.hUnit);
    this.foreCtx.fillStyle = '#white';
    this.foreCtx.fillRect(-1 * WID, 0, 2 * WID, 1);

    const WIDTH_TEN = 160 * this.wUnit;
    const WIDTH_FIVE = 80 * this.wUnit;

    for (let i = -90; i < 90; i += 5) {
      this.foreCtx.fillStyle = 'white';
      this.foreCtx.font = Math.round(40 * this.wUnit) + 'px Arial';
      this.foreCtx.textAlign = 'center';
      this.foreCtx.textBaseline = 'middle';
      const newY = (-1 * i) * (pixelsPerDegree);
      if ((i % 10 === 0) && (i !== 0)) {
        this.foreCtx.fillRect((-1 / 2) * WIDTH_TEN, newY, WIDTH_TEN, 1);
        this.foreCtx.fillText(String(i), ((-1 / 2) * WIDTH_TEN) - (55 * this.wUnit), newY);
        this.foreCtx.fillText(String(i), ((1 / 2) * WIDTH_TEN) + (55 * this.wUnit), newY);
      } else if (i !== 0) {
        this.foreCtx.fillRect((-1 / 2) * WIDTH_FIVE, newY, WIDTH_FIVE, 1);
      }
    }
    this.foreCtx.restore();
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.lineWidth = 2;
    this.foreCtx.strokeRect(X, Y, WID, HEI);
    this.foreCtx.lineWidth = 1;
  }

  /* Function that draws flight director and wings of the PFD. */
  drawAttitudeForeground(): void {
    const X = 190 * this.wUnit;
    const Y = 210 * this.hUnit;

    const WID = 500 * this.wUnit;
    const HEI = 545 * this.hUnit;
    const pixelsPerDegree = 11 * this.hUnit;

    this.foreCtx.save();
    this.foreCtx.translate(X + (WID / 2), Y + (HEI / 2));

    if (this.localMemory.mcp_fd_2) {
      this.foreCtx.strokeStyle = '#e357ff';
      this.foreCtx.fillStyle = '#e357ff';

      const pDev = -5 * this.localMemory.fo_cmd_pit_dev * pixelsPerDegree;
      const rDev = 5 * this.localMemory.fo_cmd_roll_dev * pixelsPerDegree;

      let widthPDev = 350 * this.wUnit;
      let xPDev = -1 * (widthPDev / 2);
      let heiPDev = 10 * this.hUnit;
      let yPDev = pDev - (heiPDev / 2);
      if (yPDev <= (255 * this.hUnit) && yPDev >= (-275 * this.hUnit)) {
        this.foreCtx.fillRect(xPDev, yPDev, widthPDev, heiPDev);
      }

      widthPDev = 10 * this.wUnit;
      heiPDev = 350 * this.hUnit;
      xPDev = rDev - (widthPDev / 2);
      yPDev = (-1 / 2) * heiPDev;
      if (xPDev <= (235 * this.wUnit) && xPDev >= (-245 * this.wUnit)) {
        this.foreCtx.fillRect(xPDev, yPDev, widthPDev, heiPDev);
      }
    }

    this.foreCtx.lineWidth = 1;
    this.foreCtx.fillStyle = 'black';
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(-70 * this.wUnit, -10 * this.hUnit);
    this.foreCtx.lineTo(-70 * this.wUnit, 35 * this.hUnit);
    this.foreCtx.lineTo(-90 * this.wUnit, 35 * this.hUnit);
    this.foreCtx.lineTo(-90 * this.wUnit, 10 * this.hUnit);
    this.foreCtx.lineTo(-160 * this.wUnit, 10 * this.hUnit);
    this.foreCtx.lineTo(-160 * this.wUnit, -10 * this.hUnit);
    this.foreCtx.closePath();
    this.foreCtx.stroke();
    this.foreCtx.fill();

    this.foreCtx.fillStyle = 'black';
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(70 * this.wUnit, -10 * this.hUnit);
    this.foreCtx.lineTo(70 * this.wUnit, 35 * this.hUnit);
    this.foreCtx.lineTo(90 * this.wUnit, 35 * this.hUnit);
    this.foreCtx.lineTo(90 * this.wUnit, 10 * this.hUnit);
    this.foreCtx.lineTo(160 * this.wUnit, 10 * this.hUnit);
    this.foreCtx.lineTo(160 * this.wUnit, -10 * this.hUnit);
    this.foreCtx.closePath();
    this.foreCtx.stroke();
    this.foreCtx.fill();

    const boxWidth = 16 * this.hUnit;
    this.foreCtx.rect(-1 * boxWidth, -1 * boxWidth, 2 * boxWidth, 2 * boxWidth);
    this.foreCtx.stroke();
    this.foreCtx.fill();

    this.foreCtx.fillStyle = 'white';
    this.foreCtx.beginPath();
    this.foreCtx.arc(0, 0, 0.8 * boxWidth, 0, 2 * Math.PI);
    this.foreCtx.fill();

    this.foreCtx.restore();
  }

  /* Function that draws the spinning wheel of the heading indicator. */
  drawHeadingDial(): void {
    const X = 440 * this.wUnit;
    const Y = 1070 * this.hUnit;

    const WID = 210 * this.wUnit;
    const HEI = 210 * this.hUnit;

    this.foreCtx.fillStyle = '#191921';
    this.foreCtx.strokeStyle = 'white';

    this.foreCtx.lineWidth = 1;
    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y, WID, HEI, 0, 0, 2 * Math.PI);
    this.foreCtx.fill();
    this.foreCtx.stroke();

    for (let i = 0; i < 36; i++) {
      let angle = (Math.PI * 10 * i) / 180;
      const shiftFactor = (this.localMemory.hdg_angle * Math.PI) / 180;
      angle += (Math.PI * 10 * -9) / 180;
      angle += shiftFactor;

      let startingX: number;
      let startingY: number;
      if (i % 3 === 0) {
        startingX = X + (0.87 * WID * Math.cos(angle));
        startingY = Y + (0.87 * HEI * Math.sin(angle));

        this.foreCtx.save();
        this.foreCtx.translate(startingX, startingY);
        this.foreCtx.rotate((Math.PI / 2) + angle);
        this.foreCtx.textAlign = 'right';
        this.foreCtx.fillStyle = 'white';
        this.foreCtx.font = Math.round(25 * this.wUnit) + 'px Arial';
        this.foreCtx.fillText(String(i), 9 * this.wUnit, 24 * this.hUnit);
        this.foreCtx.restore();

      } else {
        startingX = X + (0.93 * WID * Math.cos(angle));
        startingY = Y + (0.93 * HEI * Math.sin(angle));
      }
      const endingX = X + (WID * Math.cos(angle));
      const endingY = Y + (HEI * Math.sin(angle));

      this.foreCtx.beginPath();
      this.foreCtx.moveTo(startingX, startingY);
      this.foreCtx.lineTo(endingX, endingY);
      this.foreCtx.stroke();
    }

    // Draw Track Line
    let angle = (this.localMemory.mag_track_angle * Math.PI) / 180;
    let endingX = X + (WID * Math.sin(angle));
    let endingY = Y - (HEI * Math.cos(angle));
    this.foreCtx.lineWidth = 2;
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X, Y);
    this.foreCtx.lineTo(endingX, endingY);
    this.foreCtx.stroke();

    this.foreCtx.save();
    this.foreCtx.translate(X + (0.65 * WID * Math.sin(angle)), Y - (0.65 * HEI * Math.cos(angle)));
    this.foreCtx.rotate(angle);
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(-15 * this.wUnit, 0);
    this.foreCtx.lineTo(15 * this.wUnit, 0);
    this.foreCtx.stroke();
    this.foreCtx.restore();

    // Draw MCP Selected HDG
    angle = (this.localMemory.mcp_hdg_ds * Math.PI) / 180;
    endingX = X + (WID * Math.sin(angle));
    endingY = Y - (HEI * Math.cos(angle));
    this.foreCtx.lineWidth = 1;
    this.foreCtx.strokeStyle = '#E357FF';

    this.foreCtx.save();
    this.foreCtx.translate(X + (WID * Math.sin(angle)), Y - (HEI * Math.cos(angle)));
    this.foreCtx.rotate(angle);
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(0, 0);
    this.foreCtx.lineTo(-40 * this.wUnit, -20 * this.hUnit);
    this.foreCtx.lineTo(-40 * this.wUnit, 0);
    this.foreCtx.lineTo(0, 0);
    this.foreCtx.lineTo(40 * this.wUnit, -20 * this.hUnit);
    this.foreCtx.lineTo(40 * this.wUnit, 0);
    this.foreCtx.lineTo(0, 0);
    this.foreCtx.stroke();
    this.foreCtx.restore();

    // Draw Heading Triangle. This dial is 'track-below'.
    this.foreCtx.strokeStyle = 'white';

    this.foreCtx.lineWidth = 2;
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X, Y - HEI);
    this.foreCtx.lineTo(X + (25 * this.wUnit), Y - HEI - (25 * this.hUnit));
    this.foreCtx.lineTo(X - (25 * this.wUnit), Y - HEI - (25 * this.hUnit));
    this.foreCtx.closePath();
    this.foreCtx.stroke();
  }
}
